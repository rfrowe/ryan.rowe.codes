// Exercises the re-query recipe against real temp repos (worktrees, refs, and a bare remote it
// drives through git itself, not hand-crafted porcelain output) plus a real store, so the ahead/
// behind/inRoot math is proven against actual git plumbing. A thin counting wrapper around the real
// GitRunner isolates the memoization/publish-on-change behavior, which is about call counts, not
// output.

import { afterEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createGitRunner } from "./gitRunner";
import { createGitStatusService } from "./gitStatus";
import { createStore, type StudioStore } from "../state/store";
import { nodeFs } from "./fsImpl";
import type { GitRunner, GitWatcher, RunResult } from "../shared/seams";

function git(args: string[], cwd: string): void {
  execFileSync("git", args, { cwd });
}

/** A repo with `src/content/blog/` and one commit on `main`, ready for post/worktree operations. */
async function makeRepo(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "gitstatus-"));
  git(["init", "-q", "-b", "main"], dir);
  git(["config", "user.email", "test@example.com"], dir);
  git(["config", "user.name", "Test"], dir);
  await mkdir(path.join(dir, "src", "content", "blog"), { recursive: true });
  // Git tracks files, not directories: without a file in it, src/content/blog wouldn't survive
  // into a worktree checkout at all.
  await writeFile(path.join(dir, "src", "content", "blog", ".gitkeep"), "");
  await writeFile(path.join(dir, "README.md"), "root\n");
  git(["add", "."], dir);
  git(["commit", "-q", "-m", "init"], dir);
  return dir;
}

function newStore(repoRoot: string, git: GitRunner): StudioStore {
  return createStore({ fs: nodeFs, git, repoRoot, sessionBranch: "main", defaultBranch: "main" });
}

/** A GitWatcher whose doorbell only fires when `ring()` is called; no real chokidar involved. */
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

/** Wraps a real GitRunner, counting invocations by subcommand so memoization can be asserted on
 *  call counts rather than re-deriving git's own output. */
function countingRunner(inner: GitRunner): { git: GitRunner; countOf: (sub: string) => number } {
  const counts = new Map<string, number>();
  const record = (sub: string): void => {
    counts.set(sub, (counts.get(sub) ?? 0) + 1);
  };
  return {
    git: {
      git: async (args, opts): Promise<RunResult> => {
        record(args[0]);
        return inner.git(args, opts);
      },
      gh: (args, opts) => inner.gh(args, opts),
    },
    countOf: (sub) => counts.get(sub) ?? 0,
  };
}

/** Wraps a real GitRunner, rejecting the first call to `failOnSub` (simulating a transient git
 *  failure, e.g. a mid-op index lock) and behaving normally on every call after. */
function rejectOnceRunner(inner: GitRunner, failOnSub: string): GitRunner {
  let failed = false;
  return {
    git: async (args, opts) => {
      if (!failed && args[0] === failOnSub) {
        failed = true;
        throw new Error(`simulated ${failOnSub} failure`);
      }
      return inner.git(args, opts);
    },
    gh: (args, opts) => inner.gh(args, opts),
  };
}

describe("createGitStatusService — snapshot", () => {
  let repo: string | undefined;

  afterEach(async () => {
    if (repo) await rm(repo, { recursive: true, force: true });
  });

  it("computes ahead/inRoot for an open post against origin/<sessionBranch>", async () => {
    repo = await makeRepo();
    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const created = await store.createPost({ title: "A", slug: "a", headline: "h", created_at: "2026-07-10" });
    if (!created.ok) throw new Error(created.error);
    const worktree = store.getWorktreeFor(created.path);
    if (!worktree) throw new Error("expected a worktree for the new post");
    // createPost only writes the file; commit it so it's ahead of the fork point.
    git(["add", "."], worktree.worktreePath);
    git(["commit", "-q", "-m", "first draft"], worktree.worktreePath);

    const { watcher } = fakeWatcher();
    const service = createGitStatusService({ git: gitRunner, store, repoRoot: repo, sessionBranch: "main", watcher, publish: () => {} });
    const state = await service.snapshot();

    const post = state.posts.find((p) => p.stem === "2026-07-10_a");
    expect(post).toMatchObject({
      branch: "blog/2026-07-10_a",
      open: true,
      hasWorktree: true,
      onRemote: false,
      ahead: 1,
      behind: 0,
      unpushed: 1,
      incoming: 0,
      inRoot: false,
      uncommitted: false,
    });
  });

  it("reports real behind/ahead for a closed, branch-only post pushed from another session", async () => {
    repo = await makeRepo();
    const origin = await mkdtemp(path.join(tmpdir(), "gitstatus-origin-"));
    git(["init", "-q", "--bare", "-b", "main"], origin);
    git(["remote", "add", "origin", origin], repo);
    git(["push", "-q", "origin", "main"], repo);

    // A different clone pushes blog/foo without this repo ever checking it out.
    const other = await mkdtemp(path.join(tmpdir(), "gitstatus-other-"));
    git(["clone", "-q", origin, other], repo);
    git(["config", "user.email", "test@example.com"], other);
    git(["config", "user.name", "Test"], other);
    git(["checkout", "-q", "-b", "blog/foo"], other);
    await writeFile(path.join(other, "src", "content", "blog", "foo.mdx"), "# foo\n");
    git(["add", "."], other);
    git(["commit", "-q", "-m", "foo"], other);
    git(["push", "-q", "origin", "blog/foo"], other);

    // The root branch advances past blog/foo's fork point, and that advance is itself pushed, so
    // origin/main (blog/foo's behind-base) actually moves.
    await writeFile(path.join(repo, "root-change.txt"), "x\n");
    git(["add", "."], repo);
    git(["commit", "-q", "-m", "root advances"], repo);
    git(["push", "-q", "origin", "main"], repo);
    git(["fetch", "-q", "origin"], repo);

    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const { watcher } = fakeWatcher();
    const service = createGitStatusService({ git: gitRunner, store, repoRoot: repo, sessionBranch: "main", watcher, publish: () => {} });
    const state = await service.snapshot();

    const post = state.posts.find((p) => p.stem === "foo");
    expect(post).toMatchObject({
      branch: "blog/foo",
      open: false,
      hasWorktree: false,
      onRemote: true,
      ahead: 1,
      behind: 1,
      inRoot: false,
      uncommitted: null,
    });

    await rm(origin, { recursive: true, force: true });
    await rm(other, { recursive: true, force: true });
  });

  it("memoizes uncommitted status by (HEAD sha, index mtime): an unchanged worktree skips a second status call", async () => {
    repo = await makeRepo();
    const inner = createGitRunner();
    const { git: counted, countOf } = countingRunner(inner);
    const store = newStore(repo, counted);
    const created = await store.createPost({ title: "A", slug: "a", headline: "h", created_at: "2026-07-10" });
    if (!created.ok) throw new Error(created.error);
    const worktree = store.getWorktreeFor(created.path);
    if (!worktree) throw new Error("expected a worktree for the new post");
    git(["add", "."], worktree.worktreePath);
    git(["commit", "-q", "-m", "first draft"], worktree.worktreePath);

    const { watcher } = fakeWatcher();
    const service = createGitStatusService({ git: counted, store, repoRoot: repo, sessionBranch: "main", watcher, publish: () => {} });

    await service.snapshot();
    const afterFirst = countOf("status");
    await service.snapshot();
    expect(countOf("status")).toBe(afterFirst); // nothing moved: the second pass reused the memo.

    // A real commit moves HEAD, so the memo must miss and re-run status.
    await writeFile(path.join(worktree.worktreePath, "extra.txt"), "x\n");
    git(["add", "."], worktree.worktreePath);
    git(["commit", "-q", "-m", "second commit"], worktree.worktreePath);
    await service.snapshot();
    expect(countOf("status")).toBe(afterFirst + 1);
  });
});

describe("createGitStatusService — start()", () => {
  let repo: string | undefined;

  afterEach(async () => {
    if (repo) await rm(repo, { recursive: true, force: true });
  });

  it("publishes an initial snapshot, then only publishes again when something changes", async () => {
    repo = await makeRepo();
    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const { watcher, ring } = fakeWatcher();
    const publish = vi.fn();
    const service = createGitStatusService({ git: gitRunner, store, repoRoot: repo, sessionBranch: "main", watcher, publish });

    service.start();
    await vi.waitFor(() => expect(publish).toHaveBeenCalledTimes(1));

    // A ring with nothing changed underneath: publish-on-change means no second call.
    ring();
    await new Promise((r) => setTimeout(r, 50));
    expect(publish).toHaveBeenCalledTimes(1);

    // A real change that actually affects the snapshot (an empty commit on main alone wouldn't:
    // there's no origin and no posts yet, so nothing measured would move): a new post branch.
    git(["checkout", "-q", "-b", "blog/newpost"], repo);
    await writeFile(path.join(repo, "src", "content", "blog", "newpost.mdx"), "# newpost\n");
    git(["add", "."], repo);
    git(["commit", "-q", "-m", "newpost"], repo);
    git(["checkout", "-q", "main"], repo);
    ring();
    await vi.waitFor(() => expect(publish).toHaveBeenCalledTimes(2));
  });

  it("recovers on the next ring after a rejected recompute, instead of wedging for good", async () => {
    repo = await makeRepo();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const flaky = rejectOnceRunner(createGitRunner(), "rev-parse");
    const store = newStore(repo, flaky);
    const { watcher, ring } = fakeWatcher();
    const publish = vi.fn();
    const service = createGitStatusService({ git: flaky, store, repoRoot: repo, sessionBranch: "main", watcher, publish });

    // The initial pass fails (computePrimary's first call is a rev-parse) and must not publish.
    service.start();
    await vi.waitFor(() => expect(errorSpy).toHaveBeenCalledTimes(1));
    expect(publish).not.toHaveBeenCalled();

    // A later ring recomputes cleanly now that the fake has stopped failing: the doorbell survived.
    ring();
    await vi.waitFor(() => expect(publish).toHaveBeenCalledTimes(1));

    errorSpy.mockRestore();
  });
});

describe("createGitStatusService — primary", () => {
  let repo: string | undefined;

  afterEach(async () => {
    if (repo) await rm(repo, { recursive: true, force: true });
  });

  it("sets rootMoved when the root worktree is checked out to a branch other than sessionBranch", async () => {
    repo = await makeRepo();
    git(["checkout", "-q", "-b", "other"], repo);

    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const { watcher } = fakeWatcher();
    const service = createGitStatusService({ git: gitRunner, store, repoRoot: repo, sessionBranch: "main", watcher, publish: () => {} });
    const state = await service.snapshot();

    expect(state.primary.sessionBranch).toBe("main");
    expect(state.primary.head).toBe("other");
    expect(state.primary.rootMoved).toBe(true);
    expect(state.primary).not.toHaveProperty("staleSession");
  });
});
