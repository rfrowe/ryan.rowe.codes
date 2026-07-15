// Watches the active post's on-disk file (inside its worktree) and keeps the store in sync.
//
// It watches both of a post's layout locations (`<stem>.mdx` and the `<stem>/` folder holding
// `<stem>/post.mdx`), so when the agent flips a post from one layout to the other (to co-locate a
// component) the move is caught and the store's doc is repointed to the new file via `store.relayout`.
//
// The store records the hash of every byte sequence it writes (its SelfWriteGuard: editor
// autosaves), so when chokidar reports a change we can tell the store's own writes apart from
// writes it didn't make. The agent edits its worktree with native tools rather than mutating
// through the store, so an unrecognized change during a locked agent turn is the agent's write
// (surfaced as file.changed{agent}, applied live into the editor); the same change outside a turn
// is a genuinely external editor (surfaced as file.changed{external}, gated behind the reload
// banner). Either way disk wins.
//
// A server-side copy of the pure docSyncMachine is driven alongside so lifecycle events
// (prompt dispatch through agent-turn end) flip its `locked` flag, which is exactly the signal
// used to classify agent-vs-external disk changes.

import path from "node:path";

import { watch, type FSWatcher } from "chokidar";

import { sha256Hex } from "./hash";
import { nodeFs } from "./fsImpl";
import type { Fs } from "../shared/seams";
import type { StudioStore } from "../state/store";
import {
  initialSyncState,
  transition,
  type SyncEffect,
  type SyncEvent,
  type SyncState,
} from "../state/docSyncMachine";

export interface DocSync {
  /** Current server-side sync state (lock/dirty/conflict). */
  getState(): SyncState;
  /** Feed a lifecycle event (prompt.dispatch, agent.turn.end, edit, autosave.acked, …). */
  dispatch(event: SyncEvent): SyncEffect[];
  /**
   * Switch the watched file when the active post changes (open/create/switch/rename): close the
   * old watcher, watch `filePath` (the new active post's worktree file) instead, and reset the
   * machine's baseRev. No-op (but still resyncs baseRev) if already watching `filePath`.
   */
  retarget(filePath: string): void;
  /** Stop watching and release the underlying FS handle. */
  close(): Promise<void>;
}

export interface DocSyncDeps {
  /** File to watch; defaults to the store's active-post worktree file. */
  filePath?: string;
  fs?: Fs;
  /** Invoked for each effect a transition produces (banner/reload hints for the caller). */
  onEffect?: (effect: SyncEffect) => void;
}

/** True when `postFile` is a folder post's `<stem>/post.mdx` (vs a simple `<stem>.mdx`). */
function isFolderLayout(postFile: string): boolean {
  return postFile.endsWith(`${path.sep}post.mdx`) || postFile.endsWith("/post.mdx");
}

/**
 * The pair of on-disk locations a post's watcher must cover so a flip between file and folder layout
 * (the agent adding or removing a co-located component) is caught: the simple-post file `<stem>.mdx`, and the
 * folder `<stem>/` that would hold `<stem>/post.mdx` plus its assets. The folder is watched as a
 * directory because it, and the `post.mdx` inside it, may not exist yet; chokidar still reports files
 * created under a watched directory. Both current layouts of the same stem yield the same pair.
 */
function watchTargetsFor(postFile: string): [string, string] {
  const stemDir = isFolderLayout(postFile) ? path.dirname(postFile) : postFile.replace(/\.mdx$/, "");
  return [`${stemDir}.mdx`, stemDir];
}

/** The other layout's `post.mdx`/`<stem>.mdx` path for the same stem (file or folder). */
function alternateLayout(postFile: string): string {
  const [fileLayout, stemDir] = watchTargetsFor(postFile);
  return postFile === fileLayout ? path.join(stemDir, "post.mdx") : fileLayout;
}

export function createDocSync(store: StudioStore, deps: DocSyncDeps = {}): DocSync {
  const active = store.getActiveDoc();
  const initialPath = deps.filePath ?? store.getActiveWatchPath();
  if (!initialPath) throw new Error("createDocSync: no active document to watch");
  if (!active) throw new Error("createDocSync: store has no active document");

  const fs = deps.fs ?? nodeFs;
  let syncState = initialSyncState(active.rev);
  // Both mutable so retarget can swap the watched file when the active post switches.
  let filePath = initialPath;
  let watcher: FSWatcher = makeWatcher(filePath);
  // A retarget requested while a turn holds the lock is deferred to here and applied at turn end,
  // so the turn keeps watching (and applying to) its own file instead of losing those writes.
  let pendingRetarget: string | null = null;

  function drive(event: SyncEvent): SyncEffect[] {
    const result = transition(syncState, event);
    syncState = result.state;
    if (deps.onEffect) for (const effect of result.effects) deps.onEffect(effect);
    // A retarget requested mid-turn was deferred so the turn kept its watcher and lock; now that the
    // turn has ended, honor it (switch to whatever tab the user last focused).
    if (event.type === "agent.turn.end" && pendingRetarget !== null) {
      doRetarget(pendingRetarget);
    }
    return result.effects;
  }

  function makeWatcher(target: string): FSWatcher {
    // Watch both layout locations for the post's stem, so a flip between file and folder layout is
    // caught whichever side (old file unlinked / new file added) lands first.
    const w = watch(watchTargetsFor(target), {
      ignoreInitial: true,
      // Coalesce editor "save" bursts so we read a settled file, not a half-written one.
      awaitWriteFinish: { stabilityThreshold: 75, pollInterval: 20 },
    });
    w.on("change", onFsEvent);
    w.on("add", onFsEvent);
    // The current-layout file being unlinked is the direct signal of a flip's delete step; handle()
    // reacts by probing the alternate layout for the moved post.
    w.on("unlink", onFsEvent);
    return w;
  }

  let processing: Promise<void> = Promise.resolve();

  function onFsEvent(): void {
    // Serialize event handling so overlapping reads can't reorder rev bumps.
    processing = processing.then(handle, handle);
  }

  async function handle(): Promise<void> {
    // Resolve the post's current on-disk file. Normally `filePath`; a flip between file and folder
    // layout (the agent adding/removing a co-located component) moves the post to its alternate layout.
    let current = filePath;
    let text: string;
    try {
      text = await fs.readFile(filePath);
    } catch {
      const alt = alternateLayout(filePath);
      try {
        text = await fs.readFile(alt);
      } catch {
        // Neither layout present (atomic rename in flight); the next event settles it.
        return;
      }
      current = alt;
    }

    if (current !== filePath) {
      // Layout flipped. Repoint the store's doc to the new file (same post/stem/worktree); the SPA
      // follows via post.renamed + a buffer re-seed. Under a locked turn it's the agent's write.
      const origin: "agent" | "external" = syncState.locked ? "agent" : "external";
      const migrated = await store.relayout(filePath, current, origin);
      if (migrated) {
        filePath = current;
        drive({ type: "disk.changed", origin, rev: migrated.rev });
      }
      return;
    }

    const hash = sha256Hex(text);

    // Reconcile against the post that owns the watched file, not "the active doc". A tab switch can
    // out-live an agent turn (retarget is deferred while locked), so the watched file may belong to
    // a now-background post; its writes must still land on that post, not on whatever is active.
    const owner = store.getDocByWatchPath(filePath);
    // Identical to what the store already holds: nothing to reconcile. Consume any
    // matching guard entry so it doesn't linger.
    if (owner && hash === owner.rev.hash) {
      store.guard.consume(hash);
      return;
    }

    const selfOrigin = store.guard.consume(hash);
    if (selfOrigin) {
      // A store write (editor autosave) that its own rev hasn't caught up to yet. The store
      // already emitted for it; just advance the machine.
      drive({ type: "disk.changed", origin: selfOrigin, rev: owner?.rev ?? syncState.baseRev });
      return;
    }

    // Not a store write. During a locked agent turn it's the agent's native-tool write (live-
    // apply); otherwise a genuinely external editor (reload banner). Disk wins either way.
    const origin: "agent" | "external" = syncState.locked ? "agent" : "external";
    const doc = await store.reloadByWatchPath(filePath, text, origin);
    drive({ type: "disk.changed", origin, rev: doc?.rev ?? owner?.rev ?? syncState.baseRev });
  }

  function retarget(nextPath: string): void {
    if (syncState.locked && nextPath !== filePath) {
      // A turn is in flight and pinned to the currently-watched file. Dropping its watcher now would
      // stop tracking the agent's remaining writes (they'd resurface later as a bogus "external
      // change"). Remember the requested target and switch once the turn ends (see `drive`).
      pendingRetarget = nextPath;
      return;
    }
    doRetarget(nextPath);
  }

  function doRetarget(nextPath: string): void {
    // Whatever was queued mid-turn is now moot; we're switching to nextPath.
    pendingRetarget = null;
    const current = store.getActiveDoc();
    if (nextPath === filePath) {
      // Same file (e.g. re-focusing the active post): just resync the baseRev.
      syncState = initialSyncState(current?.rev ?? syncState.baseRev);
      return;
    }
    const previous = watcher;
    previous.off("change", onFsEvent);
    previous.off("add", onFsEvent);
    previous.off("unlink", onFsEvent);
    void previous.close();
    filePath = nextPath;
    syncState = initialSyncState(current?.rev ?? syncState.baseRev);
    watcher = makeWatcher(filePath);
  }

  return {
    getState() {
      return syncState;
    },
    dispatch(event) {
      return drive(event);
    },
    retarget,
    async close() {
      watcher.off("change", onFsEvent);
      watcher.off("add", onFsEvent);
      watcher.off("unlink", onFsEvent);
      await watcher.close();
    },
  };
}
