// Exercises update()/rebaseAbort() against real temp repos (worktrees, refs, and a bare remote it
// drives through git itself), so the fast-forward/rebased/up-to-date/conflicted discriminant and the
// pinned-identity rebase are proven against actual git plumbing, not hand-crafted porcelain output.

import { afterEach, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createGitRunner } from "./gitRunner";
import { createGitOpsService } from "./gitOps";
import { createStore, type StudioStore } from "../state/store";
import { nodeFs } from "./fsImpl";
import type { GitRunner } from "../shared/seams";

function git(args: string[], cwd: string): string {
  return execFileSync("git", args, { cwd }).toString();
}

/** A repo with `src/content/blog/` and one commit on `main`, ready for post/worktree operations. */
async function makeRepo(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "gitops-"));
  git(["init", "-q", "-b", "main"], dir);
  git(["config", "user.email", "test@example.com"], dir);
  git(["config", "user.name", "Test"], dir);
  await mkdir(path.join(dir, "src", "content", "blog"), { recursive: true });
  await writeFile(path.join(dir, "src", "content", "blog", ".gitkeep"), "");
  await writeFile(path.join(dir, "README.md"), "root\n");
  // Mirrors the real repo's own .gitignore: a linked worktree under here must never be picked up
  // as an embedded repo by a root-level `git add .`.
  await writeFile(path.join(dir, ".gitignore"), ".worktrees/\n");
  git(["add", "."], dir);
  git(["commit", "-q", "-m", "init"], dir);
  return dir;
}

function newStore(repoRoot: string, git: GitRunner): StudioStore {
  return createStore({ fs: nodeFs, git, repoRoot, sessionBranch: "main", defaultBranch: "main" });
}

/** Add + bare-push origin, forked from `repo`'s current main. */
async function makeOrigin(repo: string): Promise<string> {
  const origin = await mkdtemp(path.join(tmpdir(), "gitops-origin-"));
  git(["init", "-q", "--bare", "-b", "main"], origin);
  git(["remote", "add", "origin", origin], repo);
  git(["push", "-q", "-u", "origin", "main"], repo);
  return origin;
}

describe("createGitOpsService.update", () => {
  let repo: string | undefined;
  let origin: string | undefined;
  let other: string | undefined;

  afterEach(async () => {
    if (other) await rm(other, { recursive: true, force: true });
    if (origin) await rm(origin, { recursive: true, force: true });
    if (repo) await rm(repo, { recursive: true, force: true });
    repo = origin = other = undefined;
  });

  it("fast-forwards a branch with no commits of its own once the base advances", async () => {
    repo = await makeRepo();
    // foo.mdx lands on main itself before the fork, so blog/foo's tip is already reachable from
    // main: no commits of its own to replay once main moves on.
    await mkdir(path.join(repo, "src", "content", "blog"), { recursive: true });
    await writeFile(path.join(repo, "src", "content", "blog", "foo.mdx"), "# foo\n");
    git(["add", "."], repo);
    git(["commit", "-q", "-m", "add foo"], repo);
    origin = await makeOrigin(repo);

    const wtPath = path.join(repo, ".worktrees", "blog", "foo");
    git(["worktree", "add", wtPath, "-b", "blog/foo", "main"], repo);

    await writeFile(path.join(repo, "root-change.txt"), "x\n");
    git(["add", "."], repo);
    git(["commit", "-q", "-m", "root advances"], repo);
    git(["push", "-q", "origin", "main"], repo);

    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const gitOps = createGitOpsService({ git: gitRunner, store, sessionBranch: "main" });

    const canonical = path.join(repo, "src", "content", "blog", "foo.mdx");
    const result = await gitOps.update(canonical);
    expect(result).toEqual({ ok: true, result: "fast-forward" });

    const head = git(["rev-parse", "HEAD"], wtPath).trim();
    const base = git(["rev-parse", "origin/main"], wtPath).trim();
    expect(head).toBe(base);
  });

  it("rebases a branch with its own commit on top of the advanced base", async () => {
    repo = await makeRepo();
    origin = await makeOrigin(repo);

    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const created = await store.createPost({ title: "Foo", slug: "foo", headline: "h", created_at: "2026-07-10" });
    if (!created.ok) throw new Error(created.error);
    const wt = store.getWorktreeFor(created.path);
    if (!wt) throw new Error("expected a worktree");
    git(["add", "."], wt.worktreePath);
    git(["commit", "-q", "-m", "first draft"], wt.worktreePath);
    const ownCommit = git(["rev-parse", "HEAD"], wt.worktreePath).trim();

    await writeFile(path.join(repo, "root-change.txt"), "x\n");
    git(["add", "."], repo);
    git(["commit", "-q", "-m", "root advances"], repo);
    git(["push", "-q", "origin", "main"], repo);

    const gitOps = createGitOpsService({ git: gitRunner, store, sessionBranch: "main" });
    const result = await gitOps.update(created.path);
    expect(result).toEqual({ ok: true, result: "rebased" });

    const head = git(["rev-parse", "HEAD"], wt.worktreePath).trim();
    const base = git(["rev-parse", "origin/main"], wt.worktreePath).trim();
    expect(head).not.toBe(base); // replayed on top, not just moved to the base.
    expect(head).not.toBe(ownCommit); // the replay produced a new commit (new parent).
    const parent = git(["rev-parse", "HEAD^"], wt.worktreePath).trim();
    expect(parent).toBe(base);

    // Rebase preserves the original author but sets a fresh committer; the pinned identity, not
    // local git config, must be the one that performed the replay.
    const committer = git(["log", "-1", "--format=%cn <%ce>"], wt.worktreePath).trim();
    expect(committer).toBe("Ryan Rowe <ryan@rowe.codes>");
  });

  it("reports up-to-date when the base hasn't moved", async () => {
    repo = await makeRepo();
    origin = await makeOrigin(repo);

    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const created = await store.createPost({ title: "Foo", slug: "foo", headline: "h", created_at: "2026-07-10" });
    if (!created.ok) throw new Error(created.error);
    const wt = store.getWorktreeFor(created.path);
    if (!wt) throw new Error("expected a worktree");
    git(["add", "."], wt.worktreePath);
    git(["commit", "-q", "-m", "first draft"], wt.worktreePath);
    const before = git(["rev-parse", "HEAD"], wt.worktreePath).trim();

    const gitOps = createGitOpsService({ git: gitRunner, store, sessionBranch: "main" });
    const result = await gitOps.update(created.path);
    expect(result).toEqual({ ok: true, result: "up-to-date" });
    expect(git(["rev-parse", "HEAD"], wt.worktreePath).trim()).toBe(before);
  });

  it("refuses a second update for the same post while the first is still running", async () => {
    repo = await makeRepo();
    origin = await makeOrigin(repo);

    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const created = await store.createPost({ title: "Foo", slug: "foo", headline: "h", created_at: "2026-07-10" });
    if (!created.ok) throw new Error(created.error);
    const wt = store.getWorktreeFor(created.path);
    if (!wt) throw new Error("expected a worktree");
    git(["add", "."], wt.worktreePath);
    git(["commit", "-q", "-m", "first draft"], wt.worktreePath);

    const gitOps = createGitOpsService({ git: gitRunner, store, sessionBranch: "main" });
    // Fired back to back rather than one awaited before the other, so the second call's guard check
    // genuinely races the first's in-flight run instead of trivially seeing a settled update().
    const [first, second] = await Promise.all([gitOps.update(created.path), gitOps.update(created.path)]);

    expect(first).toEqual({ ok: true, result: "up-to-date" });
    expect(second).toEqual({ ok: false, error: "an update is already in progress for this post" });

    // The guard clears once the first call finishes, so a later update isn't refused forever.
    const third = await gitOps.update(created.path);
    expect(third).toEqual({ ok: true, result: "up-to-date" });
  });

  it("reports a clean failure instead of rejecting when a git call spawns against a removed worktree mid-update", async () => {
    repo = await makeRepo();
    origin = await makeOrigin(repo);

    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const created = await store.createPost({ title: "Foo", slug: "foo", headline: "h", created_at: "2026-07-10" });
    if (!created.ok) throw new Error(created.error);
    const wt = store.getWorktreeFor(created.path);
    if (!wt) throw new Error("expected a worktree");
    git(["add", "."], wt.worktreePath);
    git(["commit", "-q", "-m", "first draft"], wt.worktreePath);

    await writeFile(path.join(repo, "root-change.txt"), "x\n");
    git(["add", "."], repo);
    git(["commit", "-q", "-m", "root advances"], repo);
    git(["push", "-q", "origin", "main"], repo);

    // The "before" rev-parse HEAD, right after a successful fetch, is where a worktree removed out
    // from under an in-flight update (a racing delete) would first surface: reject it like a genuine
    // spawn ENOENT rather than a non-zero exit.
    let seen = 0;
    const flaky: GitRunner = {
      async git(args, opts) {
        if (args[0] === "rev-parse" && args[1] === "HEAD") {
          seen += 1;
          if (seen === 1) throw new Error("spawn git ENOENT");
        }
        return gitRunner.git(args, opts);
      },
      gh: gitRunner.gh,
    };

    const gitOps = createGitOpsService({ git: flaky, store, sessionBranch: "main" });
    const result = await gitOps.update(created.path);
    expect(result).toEqual({ ok: false, error: "git operation failed: spawn git ENOENT" });

    // The in-flight guard clears on this failure path too, so a retry isn't refused forever.
    const retry = await gitOps.update(created.path);
    expect(retry).toEqual({ ok: true, result: "rebased" });
  });

  it("leaves conflict markers and reports conflictedFiles on a real conflict", async () => {
    repo = await makeRepo();
    await mkdir(path.join(repo, "src", "content", "blog"), { recursive: true });
    await writeFile(path.join(repo, "src", "content", "blog", "foo.mdx"), "# foo\n");
    git(["add", "."], repo);
    git(["commit", "-q", "-m", "add foo"], repo);
    origin = await makeOrigin(repo);

    // The post's own commit and the base's advance both touch README.md, in conflicting ways.
    const wtPath = path.join(repo, ".worktrees", "blog", "foo");
    git(["worktree", "add", wtPath, "-b", "blog/foo", "main"], repo);
    await writeFile(path.join(wtPath, "README.md"), "post change\n");
    git(["add", "."], wtPath);
    git(["-c", "user.email=test@example.com", "-c", "user.name=Test", "commit", "-q", "-m", "post edit"], wtPath);

    await writeFile(path.join(repo, "README.md"), "root change\n");
    git(["add", "."], repo);
    git(["commit", "-q", "-m", "root edit"], repo);
    git(["push", "-q", "origin", "main"], repo);

    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const gitOps = createGitOpsService({ git: gitRunner, store, sessionBranch: "main" });

    const canonical = path.join(repo, "src", "content", "blog", "foo.mdx");
    const result = await gitOps.update(canonical);
    expect(result).toEqual({ ok: true, result: "conflicted", conflictedFiles: ["README.md"] });

    // The worktree is genuinely left mid-rebase, ready for F4/F6.
    const status = git(["status", "--porcelain"], wtPath);
    expect(status).toContain("UU README.md");
  });

  it("opens a closed post (branch-only, no worktree) before rebasing it", async () => {
    repo = await makeRepo();
    origin = await makeOrigin(repo);

    // A different clone pushes blog/foo, so it's a real closed post: a resolvable ref with no
    // worktree in this repo at all.
    other = await mkdtemp(path.join(tmpdir(), "gitops-other-"));
    git(["clone", "-q", origin, other], repo);
    git(["config", "user.email", "test@example.com"], other);
    git(["config", "user.name", "Test"], other);
    git(["checkout", "-q", "-b", "blog/foo"], other);
    await mkdir(path.join(other, "src", "content", "blog"), { recursive: true });
    await writeFile(path.join(other, "src", "content", "blog", "foo.mdx"), "# foo\n");
    git(["add", "."], other);
    git(["commit", "-q", "-m", "foo"], other);
    git(["push", "-q", "origin", "blog/foo"], other);

    await writeFile(path.join(repo, "root-change.txt"), "x\n");
    git(["add", "."], repo);
    git(["commit", "-q", "-m", "root advances"], repo);
    git(["push", "-q", "origin", "main"], repo);
    git(["fetch", "-q", "origin"], repo);

    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const gitOps = createGitOpsService({ git: gitRunner, store, sessionBranch: "main" });

    const canonical = path.join(repo, "src", "content", "blog", "foo.mdx");
    expect(store.getWorktreeFor(canonical)).toBeNull(); // genuinely closed beforehand.

    const result = await gitOps.update(canonical);
    expect(result).toEqual({ ok: true, result: "rebased" });

    const wt = store.getWorktreeFor(canonical);
    expect(wt).not.toBeNull(); // update() opened it.
    expect(store.getActive()?.path).toBe(canonical); // openPost activates it (F4 needs this).
  });
});

describe("createGitOpsService.rebaseAbort", () => {
  let repo: string | undefined;
  let origin: string | undefined;

  afterEach(async () => {
    if (origin) await rm(origin, { recursive: true, force: true });
    if (repo) await rm(repo, { recursive: true, force: true });
    repo = origin = undefined;
  });

  it("returns a conflicted post to its pre-update tip", async () => {
    repo = await makeRepo();
    await mkdir(path.join(repo, "src", "content", "blog"), { recursive: true });
    await writeFile(path.join(repo, "src", "content", "blog", "foo.mdx"), "# foo\n");
    git(["add", "."], repo);
    git(["commit", "-q", "-m", "add foo"], repo);
    origin = await makeOrigin(repo);

    const wtPath = path.join(repo, ".worktrees", "blog", "foo");
    git(["worktree", "add", wtPath, "-b", "blog/foo", "main"], repo);
    await writeFile(path.join(wtPath, "README.md"), "post change\n");
    git(["add", "."], wtPath);
    git(["-c", "user.email=test@example.com", "-c", "user.name=Test", "commit", "-q", "-m", "post edit"], wtPath);
    const preUpdateTip = git(["rev-parse", "HEAD"], wtPath).trim();

    await writeFile(path.join(repo, "README.md"), "root change\n");
    git(["add", "."], repo);
    git(["commit", "-q", "-m", "root edit"], repo);
    git(["push", "-q", "origin", "main"], repo);

    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const gitOps = createGitOpsService({ git: gitRunner, store, sessionBranch: "main" });

    const canonical = path.join(repo, "src", "content", "blog", "foo.mdx");
    const updateResult = await gitOps.update(canonical);
    expect(updateResult).toMatchObject({ ok: true, result: "conflicted" });

    const abortResult = await gitOps.rebaseAbort(canonical);
    expect(abortResult).toEqual({ ok: true });
    expect(git(["status", "--porcelain"], wtPath).trim()).toBe("");
    expect(git(["rev-parse", "HEAD"], wtPath).trim()).toBe(preUpdateTip);
  });

  it("refuses to abort a post that isn't open", async () => {
    repo = await makeRepo();
    const gitRunner = createGitRunner();
    const store = newStore(repo, gitRunner);
    const gitOps = createGitOpsService({ git: gitRunner, store, sessionBranch: "main" });
    const result = await gitOps.rebaseAbort(path.join(repo, "src", "content", "blog", "nope.mdx"));
    expect(result).toEqual({ ok: false, error: "post is not open" });
  });
});
