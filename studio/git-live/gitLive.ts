// Watches a repo's common `.git` dir and rings a debounced, payload-free doorbell whenever a ref
// or HEAD moves. One watch covers every linked worktree, since a linked worktree's own `.git` is
// just a file pointing back to this directory, which holds `worktrees/<name>/HEAD` for each.
//
// Loose vs packed refs and a `pack-refs` gc burst are both covered: a loose ref write, a
// packed-refs rewrite, and the loose ref's later unlink after packing all ring the doorbell, and a
// caller re-reading refs sees the same result either way, so the burst just collapses through the
// debounce. The self-trigger risk is a worktree's `index` file being rewritten by a read-only `git
// status` (a stat-cache writeback, not a ref move); that path is pruned below regardless of
// whether the caller also runs git with `GIT_OPTIONAL_LOCKS=0`.

import path from "node:path";

import { watch, type FSWatcher } from "chokidar";

import { resolveCommonGitDir } from "./resolveCommonGitDir";

export interface GitLive {
  /** Debounced, payload-free change doorbell. Returns an unsubscribe. */
  onChange(listener: () => void): () => void;
  /** Manual doorbell for state outside `.git` that a caller wants coalesced with real git changes (e.g. a working-file save changing `uncommitted`). */
  poke(): void;
  /** Stop watching and release the underlying filesystem handle. */
  close(): Promise<void>;
}

export interface GitLiveOptions {
  repoRoot: string;
  /** Pre-resolved common git dir; resolved via `git rev-parse` when omitted. */
  gitCommonDir?: string;
  /** Trailing-quiescence window before firing. Default 150. */
  debounceMs?: number;
  /** Upper bound on total delay under a continuous stream. Default 1000. */
  maxWaitMs?: number;
  /** Clock seam for tests. */
  now?: () => number;
}

const DEFAULT_DEBOUNCE_MS = 150;
const DEFAULT_MAX_WAIT_MS = 1000;

// Subtrees never worth watching: large and/or noisy, and never a ref or HEAD in themselves.
const PRUNED_DIRS = new Set(["objects", "lfs", "logs"]);

function relParts(gitCommonDir: string, absPath: string): string[] {
  return path.relative(gitCommonDir, absPath).split(path.sep);
}

/** Chokidar's `ignored`: subtrees pruned from the watch entirely, so they're never traversed. */
function isPruned(gitCommonDir: string, absPath: string): boolean {
  const parts = relParts(gitCommonDir, absPath);
  const base = parts[parts.length - 1];
  if (PRUNED_DIRS.has(parts[0])) return true;
  if (parts[0] === "worktrees" && base === "index") return true;
  if (base.endsWith(".lock")) return true;
  return base === "COMMIT_EDITMSG" || base === "MERGE_MSG" || base === "FETCH_HEAD" || base === "ORIG_HEAD";
}

/** The only paths that actually move a ref or HEAD; everything else chokidar reports is a no-op. */
function movesARef(gitCommonDir: string, absPath: string): boolean {
  const parts = relParts(gitCommonDir, absPath);
  if (parts.length === 1) return parts[0] === "HEAD" || parts[0] === "packed-refs";
  if (parts[0] === "refs") return true; // loose create/update/unlink, including refs/stash.
  return parts[0] === "worktrees" && parts.length === 3 && parts[2] === "HEAD";
}

export function createGitLive(opts: GitLiveOptions): GitLive {
  const gitCommonDir = opts.gitCommonDir ?? resolveCommonGitDir(opts.repoRoot);
  const debounceMs = opts.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const maxWaitMs = opts.maxWaitMs ?? DEFAULT_MAX_WAIT_MS;
  const now = opts.now ?? Date.now;

  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let firstPendingAt: number | null = null;

  function fire(): void {
    timer = null;
    firstPendingAt = null;
    for (const listener of listeners) listener();
  }

  // Each ring resets the trailing window, but the window can never push the fire past
  // firstPendingAt + maxWaitMs, so a continuous stream still fires.
  function schedule(): void {
    const at = now();
    if (firstPendingAt === null) firstPendingAt = at;
    if (timer) clearTimeout(timer);
    const elapsed = at - firstPendingAt;
    const wait = Math.min(debounceMs, Math.max(maxWaitMs - elapsed, 0));
    timer = setTimeout(fire, wait);
  }

  const watcher: FSWatcher = watch(gitCommonDir, {
    ignoreInitial: true,
    ignored: (candidate) => isPruned(gitCommonDir, candidate),
  });

  function onFsEvent(absPath: string): void {
    if (movesARef(gitCommonDir, absPath)) schedule();
  }
  watcher.on("add", onFsEvent);
  watcher.on("change", onFsEvent);
  watcher.on("unlink", onFsEvent);

  return {
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    poke: schedule,
    async close() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      watcher.off("add", onFsEvent);
      watcher.off("change", onFsEvent);
      watcher.off("unlink", onFsEvent);
      await watcher.close();
    },
  };
}
