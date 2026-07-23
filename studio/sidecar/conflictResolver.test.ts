// Exercises the F4 conflict-resolver's state machine against a genuinely conflicted worktree (built
// the same way gitOps.test.ts proves gitOps.update() leaves one), with fakes standing in for the
// agent dispatch and the gitStatus "resolving" flag. The two guards below are non-negotiable: a post
// can never wedge showing "resolving", and every dispatch is eventually accounted for.

import { afterEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createGitRunner } from "./gitRunner";
import { createGitOpsService } from "./gitOps";
import { createConflictResolver } from "./conflictResolver";
import { createStore } from "../state/store";
import { nodeFs } from "./fsImpl";
import type { ServerMessage } from "../shared/protocol";

function git(args: string[], cwd: string): string {
  return execFileSync("git", args, { cwd }).toString();
}

async function makeRepo(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "conflictresolver-"));
  git(["init", "-q", "-b", "main"], dir);
  git(["config", "user.email", "test@example.com"], dir);
  git(["config", "user.name", "Test"], dir);
  await mkdir(path.join(dir, "src", "content", "blog"), { recursive: true });
  await writeFile(path.join(dir, "src", "content", "blog", ".gitkeep"), "");
  await writeFile(path.join(dir, "README.md"), "root\n");
  await writeFile(path.join(dir, ".gitignore"), ".worktrees/\n");
  git(["add", "."], dir);
  git(["commit", "-q", "-m", "init"], dir);
  return dir;
}

async function makeOrigin(repo: string): Promise<string> {
  const origin = await mkdtemp(path.join(tmpdir(), "conflictresolver-origin-"));
  git(["init", "-q", "--bare", "-b", "main"], origin);
  git(["remote", "add", "origin", origin], repo);
  git(["push", "-q", "-u", "origin", "main"], repo);
  return origin;
}

/** Flush the microtask queue so onConflict's fire-and-forget dispatch (a fake, instant promise) has
 *  settled. onTurnEnd is awaited directly instead: it does real (subprocess-spawning) git calls, so a
 *  fixed number of ticks can't be trusted to outlast it. */
async function flush(): Promise<void> {
  await new Promise((r) => setImmediate(r));
}

/** A worktree left genuinely mid-rebase and conflicted in README.md, via the real gitOps.update()
 *  path (mirrors gitOps.test.ts's own "leaves conflict markers" setup). */
async function makeConflicted(): Promise<{ repo: string; origin: string; wtPath: string; canonical: string }> {
  const repo = await makeRepo();
  await writeFile(path.join(repo, "src", "content", "blog", "foo.mdx"), "# foo\n");
  git(["add", "."], repo);
  git(["commit", "-q", "-m", "add foo"], repo);
  const origin = await makeOrigin(repo);

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
  const store = createStore({ fs: nodeFs, git: gitRunner, repoRoot: repo, sessionBranch: "main", defaultBranch: "main" });
  const gitOps = createGitOpsService({ git: gitRunner, store, sessionBranch: "main" });
  const canonical = path.join(repo, "src", "content", "blog", "foo.mdx");
  const result = await gitOps.update(canonical);
  if (!(result.ok && result.result === "conflicted")) throw new Error(`expected a conflict, got ${JSON.stringify(result)}`);

  return { repo, origin, wtPath, canonical };
}

/** A resolver wired to fakes for dispatch/resolving/publish, plus real git against `wtPath`. */
function makeResolver(wtPath: string, canonical: string) {
  const setResolvingCalls: Array<[string, boolean]> = [];
  const published: ServerMessage[] = [];
  let nextId = 0;
  const dispatchSystemPrompt = vi.fn(async (_input: { path: string; text: string }) => ({
    promptId: `p${nextId++}`,
  }));
  const resolver = createConflictResolver({
    git: createGitRunner(),
    sessionBranch: "main",
    getWorktreeFor: (p) => (p === canonical ? { worktreePath: wtPath } : null),
    dispatchSystemPrompt,
    setResolving: (stem, resolving) => setResolvingCalls.push([stem, resolving]),
    publish: (msg) => published.push(msg),
  });
  return { resolver, setResolvingCalls, published, dispatchSystemPrompt };
}

describe("createConflictResolver", () => {
  let repo: string | undefined;
  let origin: string | undefined;

  afterEach(async () => {
    if (origin) await rm(origin, { recursive: true, force: true });
    if (repo) await rm(repo, { recursive: true, force: true });
    repo = origin = undefined;
  });

  it("onConflict dispatches a system prompt naming the conflicted files and marks the post resolving", async () => {
    const c = await makeConflicted();
    repo = c.repo;
    origin = c.origin;
    const { resolver, setResolvingCalls, published, dispatchSystemPrompt } = makeResolver(c.wtPath, c.canonical);

    resolver.onConflict(c.canonical, ["README.md"]);
    await flush();

    expect(dispatchSystemPrompt).toHaveBeenCalledTimes(1);
    const [call] = dispatchSystemPrompt.mock.calls;
    expect(call[0].path).toBe(c.canonical);
    expect(call[0].text).toContain("README.md");
    expect(call[0].text).toContain("origin/main");
    expect(setResolvingCalls).toEqual([["foo", true]]);
    expect(published).toEqual([{ type: "chat.injected", promptId: "p0", path: c.canonical, text: call[0].text, kind: "system" }]);
  });

  it("is a no-op for a promptId it never dispatched", async () => {
    const c = await makeConflicted();
    repo = c.repo;
    origin = c.origin;
    const { resolver, setResolvingCalls, dispatchSystemPrompt } = makeResolver(c.wtPath, c.canonical);

    await resolver.onTurnEnd("someone-elses-prompt");

    expect(setResolvingCalls).toEqual([]);
    expect(dispatchSystemPrompt).not.toHaveBeenCalled();
  });

  it("finishes the rebase with the pinned identity once the agent's edits clear the conflict", async () => {
    const c = await makeConflicted();
    repo = c.repo;
    origin = c.origin;
    const { resolver, setResolvingCalls, dispatchSystemPrompt } = makeResolver(c.wtPath, c.canonical);

    resolver.onConflict(c.canonical, ["README.md"]);
    await flush();

    // The agent resolves the conflict: overwrite and stage the file, exactly what the prompt asks for.
    await writeFile(path.join(c.wtPath, "README.md"), "resolved\n");
    git(["add", "."], c.wtPath);

    await resolver.onTurnEnd("p0");

    expect(git(["status", "--porcelain"], c.wtPath).trim()).toBe(""); // rebase finished, tree clean.
    expect(git(["log", "-1", "--format=%cn <%ce>"], c.wtPath).trim()).toBe("Ryan Rowe <ryan@rowe.codes>");
    expect(setResolvingCalls).toEqual([
      ["foo", true],
      ["foo", false],
    ]);
    expect(dispatchSystemPrompt).toHaveBeenCalledTimes(1); // no re-prompt needed.
  });

  it("re-prompts once when the agent's turn ends with the conflict still unresolved, then falls back", async () => {
    const c = await makeConflicted();
    repo = c.repo;
    origin = c.origin;
    const { resolver, setResolvingCalls, dispatchSystemPrompt } = makeResolver(c.wtPath, c.canonical);

    resolver.onConflict(c.canonical, ["README.md"]);
    await flush();

    // Turn ends with nothing staged: still conflicted.
    await resolver.onTurnEnd("p0");
    await flush(); // the retry's dispatchSystemPrompt call is fired from inside onTurnEnd's own .then chain.

    expect(dispatchSystemPrompt).toHaveBeenCalledTimes(2); // one retry.
    expect(dispatchSystemPrompt.mock.calls[1][0].text).toContain("still conflicted");
    expect(git(["status", "--porcelain"], c.wtPath)).toContain("UU README.md"); // rebase untouched.

    // The retry's turn also ends unresolved: falls back, no third dispatch.
    await resolver.onTurnEnd("p1");

    expect(dispatchSystemPrompt).toHaveBeenCalledTimes(2);
    expect(git(["status", "--porcelain"], c.wtPath)).toContain("UU README.md"); // still conflicted, for F6.

    // Guard: resolving is cleared on every turn-end, including the two that led to fallback --
    // this post can never be stuck showing "resolving" after the state machine gives up.
    expect(setResolvingCalls).toEqual([
      ["foo", true],
      ["foo", false],
      ["foo", true],
      ["foo", false],
    ]);
  });

  it("clears resolving without touching git when the post closed before the turn ended", async () => {
    const c = await makeConflicted();
    repo = c.repo;
    origin = c.origin;
    const setResolvingCalls: Array<[string, boolean]> = [];
    const dispatchSystemPrompt = vi.fn(async () => ({ promptId: "p0" }));
    const gitRunner = createGitRunner();
    const gitSpy = vi.spyOn(gitRunner, "git");
    const resolver = createConflictResolver({
      git: gitRunner,
      sessionBranch: "main",
      getWorktreeFor: () => null, // the post is no longer open.
      dispatchSystemPrompt,
      setResolving: (stem, resolving) => setResolvingCalls.push([stem, resolving]),
      publish: () => {},
    });

    resolver.onConflict(c.canonical, ["README.md"]);
    await flush();
    await resolver.onTurnEnd("p0");

    expect(setResolvingCalls).toEqual([
      ["foo", true],
      ["foo", false],
    ]);
    expect(gitSpy).not.toHaveBeenCalled();
  });
});
