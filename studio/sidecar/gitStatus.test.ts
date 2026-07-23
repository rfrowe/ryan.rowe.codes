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
import type { GitRunner, GitWatcher } from "../shared/seams";

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

  it("detects a plain unstaged edit as uncommitted on the next snapshot, no index-touching op needed", async () => {
    repo = await makeRepo();
    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const created = await store.createPost({ title: "A", slug: "a", headline: "h", created_at: "2026-07-10" });
    if (!created.ok) throw new Error(created.error);
    const worktree = store.getWorktreeFor(created.path);
    if (!worktree) throw new Error("expected a worktree for the new post");
    git(["add", "."], worktree.worktreePath);
    git(["commit", "-q", "-m", "first draft"], worktree.worktreePath);

    const { watcher } = fakeWatcher();
    const service = createGitStatusService({ git: gitRunner, store, repoRoot: repo, sessionBranch: "main", watcher, publish: () => {} });

    const before = await service.snapshot();
    expect(before.posts.find((p) => p.stem === "2026-07-10_a")?.uncommitted).toBe(false);

    // A plain edit: no `git add`, no commit, nothing that moves HEAD or touches the index.
    await writeFile(worktree.worktreeFilePath, "# A\n\nan edit with no git operation alongside it\n");

    const after = await service.snapshot();
    expect(after.posts.find((p) => p.stem === "2026-07-10_a")?.uncommitted).toBe(true);
  });

  it("reports rebase.phase conflicted with conflictedFiles for a worktree left mid-rebase", async () => {
    repo = await makeRepo();
    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const created = await store.createPost({ title: "A", slug: "a", headline: "h", created_at: "2026-07-10" });
    if (!created.ok) throw new Error(created.error);
    const worktree = store.getWorktreeFor(created.path);
    if (!worktree) throw new Error("expected a worktree for the new post");
    git(["add", "."], worktree.worktreePath);
    git(["commit", "-q", "-m", "first draft"], worktree.worktreePath);

    // The post's own commit and main both touch README.md, in conflicting ways.
    await writeFile(path.join(worktree.worktreePath, "README.md"), "post change\n");
    git(["add", "."], worktree.worktreePath);
    git(["commit", "-q", "-m", "post edit"], worktree.worktreePath);
    await writeFile(path.join(repo, "README.md"), "root change\n");
    git(["add", "."], repo);
    git(["commit", "-q", "-m", "root edit"], repo);

    try {
      git(["rebase", "main"], worktree.worktreePath);
    } catch {
      // expected: the rebase conflicts and exits non-zero, leaving the worktree mid-rebase.
    }

    const { watcher } = fakeWatcher();
    const service = createGitStatusService({ git: gitRunner, store, repoRoot: repo, sessionBranch: "main", watcher, publish: () => {} });
    const state = await service.snapshot();

    const post = state.posts.find((p) => p.stem === "2026-07-10_a");
    expect(post?.rebase).toEqual({ phase: "conflicted", conflictedFiles: ["README.md"] });
  });

  it("reports rebase.phase idle for an ordinary (non-rebasing) worktree", async () => {
    repo = await makeRepo();
    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const created = await store.createPost({ title: "A", slug: "a", headline: "h", created_at: "2026-07-10" });
    if (!created.ok) throw new Error(created.error);
    git(["add", "."], store.getWorktreeFor(created.path)!.worktreePath);
    git(["commit", "-q", "-m", "first draft"], store.getWorktreeFor(created.path)!.worktreePath);

    const { watcher } = fakeWatcher();
    const service = createGitStatusService({ git: gitRunner, store, repoRoot: repo, sessionBranch: "main", watcher, publish: () => {} });
    const state = await service.snapshot();

    expect(state.posts.find((p) => p.stem === "2026-07-10_a")?.rebase).toEqual({ phase: "idle", conflictedFiles: [] });
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

describe("createGitStatusService — fetch", () => {
  let repo: string | undefined;
  let origin: string | undefined;
  let other: string | undefined;

  afterEach(async () => {
    if (other) await rm(other, { recursive: true, force: true });
    if (origin) await rm(origin, { recursive: true, force: true });
    if (repo) await rm(repo, { recursive: true, force: true });
    repo = origin = other = undefined;
  });

  it("pulls a root advance from origin and republishes so primary.behind reflects it, with one call", async () => {
    repo = await makeRepo();
    origin = await mkdtemp(path.join(tmpdir(), "gitstatus-origin-"));
    git(["init", "-q", "--bare", "-b", "main"], origin);
    git(["remote", "add", "origin", origin], repo);
    git(["push", "-q", "-u", "origin", "main"], repo);

    // A different clone advances main and pushes, without `repo` ever fetching it until service.fetch().
    other = await mkdtemp(path.join(tmpdir(), "gitstatus-other-"));
    git(["clone", "-q", origin, other], repo);
    git(["config", "user.email", "test@example.com"], other);
    git(["config", "user.name", "Test"], other);
    await writeFile(path.join(other, "root-change.txt"), "x\n");
    git(["add", "."], other);
    git(["commit", "-q", "-m", "root advances"], other);
    git(["push", "-q", "origin", "main"], other);

    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const { watcher } = fakeWatcher();
    const publish = vi.fn();
    const service = createGitStatusService({ git: gitRunner, store, repoRoot: repo, sessionBranch: "main", watcher, publish });

    const before = await service.snapshot();
    expect(before.primary.behind).toBe(0);
    expect(before.fetch).toEqual({ inFlight: false, at: null });

    const result = await service.fetch();
    expect(result).toEqual({ ok: true });

    const after = await service.snapshot();
    expect(after.primary.behind).toBe(1);
    expect(after.fetch.inFlight).toBe(false);
    expect(after.fetch.at).not.toBeNull();

    // The fetch call itself already republished reactively; a caller needs no follow-up snapshot.
    const publishedStates = publish.mock.calls.map((c) => c[0] as { fetch: { inFlight: boolean }; primary: { behind: number } });
    expect(publishedStates.some((s) => s.fetch.inFlight)).toBe(true);
    expect(publishedStates.at(-1)?.primary.behind).toBe(1);
  });

  it("reports a git-level failure without leaving inFlight stuck true", async () => {
    repo = await makeRepo(); // no `origin` remote configured: `git fetch --prune origin` fails offline-safe.
    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const { watcher } = fakeWatcher();
    const service = createGitStatusService({ git: gitRunner, store, repoRoot: repo, sessionBranch: "main", watcher, publish: () => {} });

    const result = await service.fetch();
    expect(result.ok).toBe(false);

    const after = await service.snapshot();
    expect(after.fetch.inFlight).toBe(false);
  });

  it("is a no-op, not a second git fetch, while one is already running", async () => {
    repo = await makeRepo();
    origin = await mkdtemp(path.join(tmpdir(), "gitstatus-origin-"));
    git(["init", "-q", "--bare", "-b", "main"], origin);
    git(["remote", "add", "origin", origin], repo);
    git(["push", "-q", "-u", "origin", "main"], repo);

    const inner = createGitRunner();
    let fetchCalls = 0;
    const counting: GitRunner = {
      git: (args, opts) => {
        if (args[0] === "fetch") fetchCalls += 1;
        return inner.git(args, opts);
      },
      gh: (args, opts) => inner.gh(args, opts),
    };
    const store = newStore(repo, counting);
    const { watcher } = fakeWatcher();
    const service = createGitStatusService({ git: counting, store, repoRoot: repo, sessionBranch: "main", watcher, publish: () => {} });

    const [first, second] = await Promise.all([service.fetch(), service.fetch()]);
    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
    expect(fetchCalls).toBe(1);
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
