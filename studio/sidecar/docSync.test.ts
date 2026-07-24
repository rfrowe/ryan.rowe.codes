// Integration test for the docSync watcher detecting a post flip between file and folder layout, exercised against a
// real chokidar watch over a temp dir (this is the seam that strands the editor when the agent
// restructures a simple post into a folder to co-locate a component). A minimal fake store records
// the `relayout` call the watcher makes so we can assert it fires with the right old/new paths, in
// both flip directions and regardless of whether the new file is created before or after the old one
// is removed.

import { afterEach, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createDocSync, type DocSync } from "./docSync";
import { createGitRunner } from "./gitRunner";
import { sha256Hex } from "./hash";
import { SelfWriteGuard } from "../state/store";
import type { StudioStore } from "../state/store";
import type { GitRunner, GitWatcher } from "../shared/seams";
import type { ActiveDoc, DocRev } from "../shared/types";

/** A GitWatcher whose doorbell only fires when `ring()` is called; no real chokidar/`.git` watch
 *  involved (mirrors gitStatus.test.ts's own fakeWatcher). */
function fakeWatcher(): { watcher: GitWatcher; ring: () => void } {
  const listeners = new Set<() => void>();
  return {
    watcher: {
      onChange(l) {
        listeners.add(l);
        return () => listeners.delete(l);
      },
      poke() {
        for (const l of listeners) l();
      },
      async close() {},
    },
    ring() {
      for (const l of listeners) l();
    },
  };
}

interface RelayoutCall {
  oldPath: string;
  newPath: string;
  origin: "external" | "agent" | "git";
}

interface ReloadCall {
  path: string;
  origin: "external" | "agent" | "git";
}

/** A stand-in store exposing only what docSync touches, recording every relayout/reload it's asked
 *  to do (including the origin the watcher classified it as). */
function makeFakeStore(watchPath: string, text: string) {
  const guard = new SelfWriteGuard();
  const relayoutCalls: RelayoutCall[] = [];
  const reloadCalls: ReloadCall[] = [];
  let current = watchPath;
  let rev: DocRev = { n: 1, hash: sha256Hex(text) };

  const fake: Partial<StudioStore> = {
    guard,
    getActiveDoc: () => ({ path: current, text, rev }),
    getActiveWatchPath: () => current,
    getDocByWatchPath: (p) => (p === current ? { path: p, rev } : null),
    reloadByWatchPath: async (p, next, origin): Promise<ActiveDoc | null> => {
      reloadCalls.push({ path: p, origin });
      rev = { n: rev.n + 1, hash: sha256Hex(next) };
      return { path: p, text: next, rev };
    },
    relayout: async (oldPath, newPath, origin): Promise<ActiveDoc | null> => {
      relayoutCalls.push({ oldPath, newPath, origin });
      current = newPath;
      rev = { n: rev.n + 1, hash: sha256Hex("migrated") };
      return { path: newPath, text: "migrated", rev };
    },
  };
  return { store: fake as StudioStore, relayoutCalls, reloadCalls };
}

/** Real git plumbing (mirrors gitStatus.test.ts) so the HEAD-moved classification is proven against
 *  actual checkout/reset behavior, not a hand-rolled fake. */
function runGit(args: string[], cwd: string): void {
  execFileSync("git", args, { cwd });
}

/** A repo with a committed post file, ready for a second branch to diverge from. */
async function makeRepo(stemFile: string): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "docsync-git-"));
  runGit(["init", "-q", "-b", "main"], dir);
  runGit(["config", "user.email", "test@example.com"], dir);
  runGit(["config", "user.name", "Test"], dir);
  await mkdir(path.dirname(path.join(dir, stemFile)), { recursive: true });
  await writeFile(path.join(dir, stemFile), "v1\n");
  runGit(["add", "."], dir);
  runGit(["commit", "-q", "-m", "init"], dir);
  return dir;
}

/** Wraps a real GitRunner so each `rev-parse HEAD` call whose position is in `gateOn` blocks until
 *  `release(nth)` is called, letting a test suspend `handle()`/`seedHead()` mid-flight and act while
 *  it's paused there. `waitUntilPaused(nth)` resolves the instant that call is reached, before it
 *  actually blocks, so a test can sequence releases deterministically instead of guessing timing. */
function gateRevParses(real: GitRunner, gateOn: number[]): {
  git: GitRunner;
  waitUntilPaused: (nth: number) => Promise<void>;
  release: (nth: number) => void;
} {
  let seen = 0;
  const releaseFns = new Map<number, () => void>();
  const pausedResolves = new Map<number, () => void>();
  const paused = new Map<number, Promise<void>>(gateOn.map((n) => [n, new Promise<void>((resolve) => pausedResolves.set(n, resolve))]));
  return {
    git: {
      async git(args, opts) {
        if (args[0] === "rev-parse" && args[1] === "HEAD") {
          seen += 1;
          if (gateOn.includes(seen)) {
            pausedResolves.get(seen)?.();
            await new Promise<void>((resolve) => releaseFns.set(seen, resolve));
          }
        }
        return real.git(args, opts);
      },
      gh: real.gh,
    },
    waitUntilPaused: (nth) => paused.get(nth) ?? Promise.resolve(),
    release: (nth) => releaseFns.get(nth)?.(),
  };
}

/** Poll until `pred` holds or the deadline passes (fs-watch events are inherently async). */
async function waitFor(pred: () => boolean, ms = 3000): Promise<void> {
  const start = Date.now();
  while (!pred()) {
    if (Date.now() - start > ms) throw new Error("waitFor timed out");
    await new Promise((r) => setTimeout(r, 20));
  }
}

describe("docSync layout-flip detection", () => {
  let dir: string;
  let sync: DocSync | null = null;

  afterEach(async () => {
    await sync?.close();
    sync = null;
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  const STEM = "2026-07-14_hello";

  async function setup() {
    dir = await mkdtemp(path.join(tmpdir(), "docsync-"));
    const blog = path.join(dir, "src", "content", "blog");
    await mkdir(blog, { recursive: true });
    return {
      blog,
      fileLayout: path.join(blog, `${STEM}.mdx`),
      folderDir: path.join(blog, STEM),
      folderLayout: path.join(blog, STEM, "post.mdx"),
    };
  }

  it("detects a flip to folder layout when the new file is created after the old is removed", async () => {
    const { fileLayout, folderDir, folderLayout } = await setup();
    await writeFile(fileLayout, "file post\n");
    const { store, relayoutCalls } = makeFakeStore(fileLayout, "file post\n");
    sync = createDocSync(store, { filePath: fileLayout });

    await rm(fileLayout);
    await new Promise((r) => setTimeout(r, 120));
    await mkdir(folderDir, { recursive: true });
    await writeFile(folderLayout, "folder post\n");

    await waitFor(() => relayoutCalls.length > 0);
    expect(relayoutCalls.at(-1)).toEqual({ oldPath: fileLayout, newPath: folderLayout, origin: "external" });
  });

  it("detects a flip to folder layout when the new file is created before the old is removed", async () => {
    const { fileLayout, folderDir, folderLayout } = await setup();
    await writeFile(fileLayout, "file post\n");
    const { store, relayoutCalls } = makeFakeStore(fileLayout, "file post\n");
    sync = createDocSync(store, { filePath: fileLayout });

    await mkdir(folderDir, { recursive: true });
    await writeFile(folderLayout, "folder post\n");
    await new Promise((r) => setTimeout(r, 120));
    await rm(fileLayout);

    await waitFor(() => relayoutCalls.some((c) => c.newPath === folderLayout));
    expect(relayoutCalls.at(-1)).toMatchObject({ oldPath: fileLayout, newPath: folderLayout });
  });

  it("detects the reverse flip back to file layout", async () => {
    const { fileLayout, folderDir, folderLayout } = await setup();
    await mkdir(folderDir, { recursive: true });
    await writeFile(folderLayout, "folder post\n");
    const { store, relayoutCalls } = makeFakeStore(folderLayout, "folder post\n");
    sync = createDocSync(store, { filePath: folderLayout });

    await writeFile(fileLayout, "file post\n");
    await new Promise((r) => setTimeout(r, 120));
    await rm(folderDir, { recursive: true, force: true });

    await waitFor(() => relayoutCalls.some((c) => c.newPath === fileLayout));
    expect(relayoutCalls.at(-1)).toMatchObject({ oldPath: folderLayout, newPath: fileLayout });
  });

  it("classifies a flip during a locked agent turn as an agent-origin write", async () => {
    const { fileLayout, folderDir, folderLayout } = await setup();
    await writeFile(fileLayout, "file post\n");
    const { store, relayoutCalls } = makeFakeStore(fileLayout, "file post\n");
    sync = createDocSync(store, { filePath: fileLayout });
    sync.dispatch({ type: "prompt.dispatch" }); // lock the turn

    await rm(fileLayout);
    await mkdir(folderDir, { recursive: true });
    await writeFile(folderLayout, "folder post\n");

    await waitFor(() => relayoutCalls.length > 0);
    expect(relayoutCalls.at(-1)?.origin).toBe("agent");
  });

  it("does not flip when a co-located asset is added while the simple-post file still exists", async () => {
    // The false-positive guard: adding `<stem>/Widget.tsx` next to a still-present `<stem>.mdx` is a
    // folder appearing under the watched stem dir, not a layout flip. A flip only fires once the
    // current-layout file becomes unreadable.
    const { fileLayout, folderDir } = await setup();
    await writeFile(fileLayout, "file post\n");
    const { store, relayoutCalls } = makeFakeStore(fileLayout, "file post\n");
    sync = createDocSync(store, { filePath: fileLayout });

    await mkdir(folderDir, { recursive: true });
    await writeFile(path.join(folderDir, "Widget.tsx"), "export const Widget = () => null;\n");

    // Give the watcher ample time to process the add; the assertion is that nothing flipped.
    await new Promise((r) => setTimeout(r, 400));
    expect(relayoutCalls).toEqual([]);
  });
});

describe("docSync git-op classification", () => {
  let dir: string;
  let dir2: string | null = null;
  let otherWt: string | null = null;
  let sync: DocSync | null = null;

  afterEach(async () => {
    await sync?.close();
    sync = null;
    if (otherWt) {
      await rm(otherWt, { recursive: true, force: true });
      otherWt = null;
    }
    if (dir2) {
      await rm(dir2, { recursive: true, force: true });
      dir2 = null;
    }
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  const STEM_FILE = "src/content/blog/2026-07-14_hello.mdx";

  it("classifies an ordinary editor write as external and pokes git-live", async () => {
    dir = await makeRepo(STEM_FILE);
    const filePath = path.join(dir, STEM_FILE);
    const { store, reloadCalls } = makeFakeStore(filePath, "v1\n");
    let pokes = 0;
    sync = createDocSync(store, { filePath, git: createGitRunner(), poke: () => pokes++ });

    await writeFile(filePath, "v2\n");

    await waitFor(() => reloadCalls.length > 0);
    expect(reloadCalls.at(-1)?.origin).toBe("external");
    expect(pokes).toBeGreaterThan(0);
  });

  it("classifies a checkout/reset that moves HEAD as a git operation, even as the first disk event", async () => {
    dir = await makeRepo(STEM_FILE);
    const filePath = path.join(dir, STEM_FILE);
    // Diverge a second branch's commit in its own linked worktree, so preparing it never touches
    // the file this test's watcher follows.
    runGit(["branch", "other"], dir);
    otherWt = await mkdtemp(path.join(tmpdir(), "docsync-other-"));
    runGit(["worktree", "add", "-q", otherWt, "other"], dir);
    await writeFile(path.join(otherWt, STEM_FILE), "v3\n");
    runGit(["add", "."], otherWt);
    runGit(["commit", "-q", "-m", "diverge"], otherWt);

    const { store, reloadCalls } = makeFakeStore(filePath, "v1\n");
    sync = createDocSync(store, { filePath, git: createGitRunner() });
    // Let chokidar finish attaching before the next mutation; execFileSync never yields the event
    // loop, so a git command run immediately after construction can otherwise race the watcher's
    // own (async) setup and go unseen.
    await new Promise((r) => setTimeout(r, 100));

    // A single git command moves HEAD and rewrites the file in one stroke, exactly like a terminal
    // checkout/reset landing under the buffer. No warm-up edit first: the HEAD baseline is seeded
    // eagerly at construction, so even this very first disk event classifies correctly.
    runGit(["reset", "--hard", "other"], dir);

    await waitFor(() => reloadCalls.length > 0);
    expect(reloadCalls.at(-1)?.origin).toBe("git");
  });

  it("reseeds the HEAD baseline on retarget, so a switched-to post's first event still classifies", async () => {
    dir = await makeRepo(STEM_FILE);
    dir2 = await makeRepo(STEM_FILE);
    const fileA = path.join(dir, STEM_FILE);
    const fileB = path.join(dir2, STEM_FILE);

    // Diverge dir2's "other" branch the same way, so switching to it and resetting is a real move.
    runGit(["branch", "other"], dir2);
    otherWt = await mkdtemp(path.join(tmpdir(), "docsync-other-"));
    runGit(["worktree", "add", "-q", otherWt, "other"], dir2);
    await writeFile(path.join(otherWt, STEM_FILE), "b-other\n");
    runGit(["add", "."], otherWt);
    runGit(["commit", "-q", "-m", "diverge"], otherWt);

    const { store, reloadCalls } = makeFakeStore(fileA, "v1\n");
    sync = createDocSync(store, { filePath: fileA, git: createGitRunner() });
    sync.retarget(fileB);
    // Let chokidar finish attaching to fileB before the next mutation (see the sibling test's note).
    await new Promise((r) => setTimeout(r, 100));

    // No warm-up write on fileB either: retarget reseeds the baseline just like construction did.
    runGit(["reset", "--hard", "other"], dir2);

    await waitFor(() => reloadCalls.length > 0);
    expect(reloadCalls.at(-1)?.origin).toBe("git");
  });

  it("never classifies as git when no GitRunner is given", async () => {
    dir = await makeRepo(STEM_FILE);
    const filePath = path.join(dir, STEM_FILE);
    const { store, reloadCalls } = makeFakeStore(filePath, "v1\n");
    sync = createDocSync(store, { filePath }); // no `git` dep.

    await writeFile(filePath, "v2\n");
    await waitFor(() => reloadCalls.length > 0);
    runGit(["commit", "-q", "--allow-empty", "-m", "noop"], dir); // HEAD moves; nothing to detect it with.
    await writeFile(filePath, "v3\n");

    await waitFor(() => reloadCalls.length > 1);
    expect(reloadCalls.every((c) => c.origin === "external")).toBe(true);
  });
});

describe("docSync HEAD-baseline freshness", () => {
  let dir: string;
  let sync: DocSync | null = null;

  afterEach(async () => {
    await sync?.close();
    sync = null;
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  const STEM_FILE = "src/content/blog/2026-07-14_hello.mdx";

  it("reseeds on a git-live doorbell ring, so a HEAD move with no file touch doesn't stale-classify the next real edit", async () => {
    dir = await makeRepo(STEM_FILE);
    const filePath = path.join(dir, STEM_FILE);
    const { store, reloadCalls } = makeFakeStore(filePath, "v1\n");
    const { watcher, ring } = fakeWatcher();
    sync = createDocSync(store, { filePath, git: createGitRunner(), watcher });
    await new Promise((r) => setTimeout(r, 100)); // let the initial seedHead land.

    // Moves HEAD without touching the watched file at all -- exactly the case lastKnownHead used to
    // miss entirely, since nothing here ever fires a disk event for classifyExternalOrigin to run off.
    runGit(["commit", "-q", "--allow-empty", "-m", "unrelated"], dir);
    ring(); // git-live's doorbell would have rung for this ref move; simulate it directly.
    await new Promise((r) => setTimeout(r, 100)); // let the doorbell-triggered reseed land.

    // A genuinely plain edit, unrelated to the commit above. Without the reseed, lastKnownHead would
    // still be the pre-commit HEAD, so this would misclassify as "git" instead of "external".
    await writeFile(filePath, "v2\n");
    await waitFor(() => reloadCalls.length > 0);
    expect(reloadCalls.at(-1)?.origin).toBe("external");
  });
});

describe("docSync handle() path stability under a mid-flight retarget", () => {
  let dir: string;
  let dir2: string | null = null;
  let sync: DocSync | null = null;

  afterEach(async () => {
    await sync?.close();
    sync = null;
    if (dir2) {
      await rm(dir2, { recursive: true, force: true });
      dir2 = null;
    }
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  const STEM_FILE = "src/content/blog/2026-07-14_hello.mdx";

  it("writes a disk change to the post it belongs to, even if a retarget lands mid-classification", async () => {
    dir = await makeRepo(STEM_FILE);
    dir2 = await makeRepo(STEM_FILE);
    const fileA = path.join(dir, STEM_FILE);
    const fileB = path.join(dir2, STEM_FILE);

    // The 1st rev-parse is construction's seed for A; the 2nd is the classification this event's
    // handle() call makes. Gate that one so the test can retarget while it's still in flight.
    const gated = gateRevParses(createGitRunner(), [2]);
    const { store, reloadCalls } = makeFakeStore(fileA, "v1\n");
    sync = createDocSync(store, { filePath: fileA, git: gated.git });
    await new Promise((r) => setTimeout(r, 100)); // let chokidar attach to A (see sibling tests' note).

    await writeFile(fileA, "v2\n");
    await gated.waitUntilPaused(2); // handle() is suspended inside classifyExternalOrigin for A's event.

    sync.retarget(fileB); // switches the watched post while A's write is still being classified.
    gated.release(2);

    await waitFor(() => reloadCalls.length > 0);
    // A's write must land on A, carrying A's own text, however far filePath has since moved on.
    expect(reloadCalls.at(-1)?.path).toBe(fileA);
    expect(reloadCalls.some((c) => c.path === fileB)).toBe(false);
  });

  it("doesn't let a stale classification for the previous post corrupt the next post's HEAD baseline", async () => {
    dir = await makeRepo(STEM_FILE);
    dir2 = await makeRepo(STEM_FILE);
    // Two freshly-initialized repos with the same content, message, and author commit in the same
    // second hash identically (git commits are content-addressed); a second commit here guarantees
    // A's and B's HEAD shas actually differ, or the corruption this test targets would be undetectable.
    runGit(["commit", "-q", "--allow-empty", "-m", "second"], dir2);
    const fileA = path.join(dir, STEM_FILE);
    const fileB = path.join(dir2, STEM_FILE);

    // 1st rev-parse: construction's seed for A. 2nd: A's classification for the write below, gated
    // and released last. 3rd: B's seed on retarget, gated and released first so its write to the
    // shared lastKnownHead lands before A's stale classification would otherwise clobber it.
    const gated = gateRevParses(createGitRunner(), [2, 3]);
    const { store, reloadCalls } = makeFakeStore(fileA, "v1\n");
    sync = createDocSync(store, { filePath: fileA, git: gated.git });
    await new Promise((r) => setTimeout(r, 100)); // let chokidar attach to A.

    await writeFile(fileA, "v2\n");
    await gated.waitUntilPaused(2);

    sync.retarget(fileB); // kicks off B's own seed as the 3rd rev-parse call.
    await gated.waitUntilPaused(3);
    gated.release(3); // B's seed resolves and correctly sets lastKnownHead to B's real HEAD.
    await new Promise((r) => setTimeout(r, 50)); // let that write land before A's stale one resumes.
    gated.release(2); // A's classification resumes and resolves last.

    await waitFor(() => reloadCalls.length > 0); // A's own write settling; its origin isn't asserted.
    reloadCalls.length = 0;

    // A plain edit on B, HEAD unmoved, must still read as external, not "git" from a baseline A's
    // stale write clobbered with its own (unrelated) HEAD sha.
    await new Promise((r) => setTimeout(r, 100)); // let chokidar attach to B (retarget swapped watchers).
    await writeFile(fileB, "v1-plain-edit\n");
    await waitFor(() => reloadCalls.length > 0);
    expect(reloadCalls.at(-1)?.origin).toBe("external");
  });
});
