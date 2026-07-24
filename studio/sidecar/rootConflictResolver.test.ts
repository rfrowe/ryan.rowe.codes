// Exercises the F4-for-root conflict resolver against a genuinely conflicted root repo, with fakes
// standing in for the agent dispatch and gitStatus's "resolving" flag. Mirrors conflictResolver.test.ts,
// minus the per-post worktree lookup: the root has one target, not a map keyed by canonical path.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { query } from "@anthropic-ai/claude-agent-sdk";

import { createGitRunner } from "./gitRunner";
import { createAgentHost } from "./agentHost";
import { createRootConflictResolver } from "./rootConflictResolver";
import type { ServerMessage } from "../shared/protocol";
import type { StudioTools } from "../shared/services";

vi.mock("@anthropic-ai/claude-agent-sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@anthropic-ai/claude-agent-sdk")>();
  return { ...actual, query: vi.fn() };
});

function git(args: string[], cwd: string): string {
  return execFileSync("git", args, { cwd }).toString();
}

async function makeRepo(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "rootconflictresolver-"));
  git(["init", "-q", "-b", "main"], dir);
  git(["config", "user.email", "test@example.com"], dir);
  git(["config", "user.name", "Test"], dir);
  await writeFile(path.join(dir, "astro.config.mjs"), "root\n");
  git(["add", "."], dir);
  git(["commit", "-q", "-m", "init"], dir);
  return dir;
}

async function makeOrigin(repo: string): Promise<string> {
  const origin = await mkdtemp(path.join(tmpdir(), "rootconflictresolver-origin-"));
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

/** The root repo left genuinely mid-rebase and conflicted in astro.config.mjs: a local commit not yet
 *  pushed, and a competing edit pushed to origin from a second clone, mirroring how gitStatus.ts's
 *  updateRoot() would find it diverged before rebasing. */
async function makeConflictedRoot(): Promise<{ repo: string; origin: string }> {
  const repo = await makeRepo();
  const origin = await makeOrigin(repo);

  await writeFile(path.join(repo, "astro.config.mjs"), "local change\n");
  git(["add", "."], repo);
  git(["commit", "-q", "-m", "local edit"], repo);

  const other = await mkdtemp(path.join(tmpdir(), "rootconflictresolver-other-"));
  execFileSync("git", ["clone", "-q", origin, other]);
  git(["config", "user.email", "test@example.com"], other);
  git(["config", "user.name", "Test"], other);
  await writeFile(path.join(other, "astro.config.mjs"), "origin change\n");
  git(["add", "."], other);
  git(["commit", "-q", "-m", "origin edit"], other);
  git(["push", "-q", "origin", "main"], other);
  await rm(other, { recursive: true, force: true });

  const gitRunner = createGitRunner();
  await gitRunner.git(["fetch", "origin"], { cwd: repo });
  const rebaseRes = await gitRunner.git(
    ["-c", "user.name=Test", "-c", "user.email=test@example.com", "rebase", "origin/main"],
    { cwd: repo },
  );
  if (rebaseRes.code === 0) throw new Error("expected the rebase to conflict");

  return { repo, origin };
}

/** A resolver wired to fakes for dispatch/resolving/publish, plus real git against `repo`. abortRoot
 *  mirrors gitStatus.abortRoot()'s git-facing half (that service's own resolvingRoot/schedule
 *  bookkeeping is gitStatus.test.ts's concern, not this one). */
function makeResolver(repo: string) {
  const setResolvingCalls: boolean[] = [];
  const published: ServerMessage[] = [];
  const gitRunner = createGitRunner();
  let nextId = 0;
  const dispatchSystemPrompt = vi.fn(async (_input: { path: string; text: string }) => ({
    promptId: `p${nextId++}`,
    dispatched: true,
  }));
  const abortRoot = vi.fn(async () => {
    const res = await gitRunner.git(["rebase", "--abort"], { cwd: repo });
    return res.code === 0 ? { ok: true as const } : { ok: false as const, error: res.stderr.trim() || `exit ${res.code}` };
  });
  const resolver = createRootConflictResolver({
    git: gitRunner,
    rootWorktreePath: repo,
    sessionBranch: "main",
    dispatchSystemPrompt,
    setResolving: (resolving) => setResolvingCalls.push(resolving),
    publish: (msg) => published.push(msg),
    abortRoot,
  });
  return { resolver, setResolvingCalls, published, dispatchSystemPrompt, abortRoot };
}

describe("createRootConflictResolver", () => {
  let repo: string | undefined;
  let origin: string | undefined;

  afterEach(async () => {
    if (origin) await rm(origin, { recursive: true, force: true });
    if (repo) await rm(repo, { recursive: true, force: true });
    repo = origin = undefined;
  });

  it("onConflict dispatches a system prompt naming the conflicted files and marks the root resolving", async () => {
    const c = await makeConflictedRoot();
    repo = c.repo;
    origin = c.origin;
    const { resolver, setResolvingCalls, published, dispatchSystemPrompt } = makeResolver(c.repo);

    resolver.onConflict(["astro.config.mjs"]);
    await flush();

    expect(dispatchSystemPrompt).toHaveBeenCalledTimes(1);
    const [call] = dispatchSystemPrompt.mock.calls;
    expect(call[0].path).toBe(c.repo);
    expect(call[0].text).toContain("astro.config.mjs");
    expect(call[0].text).toContain("origin/main");
    // No human watches this turn live, so the prompt must head off a narrated resolution in favor
    // of a terse, structured one, matching conflictResolver's post-side prompt.
    expect(call[0].text).toContain("Work silently");
    expect(call[0].text).toContain("terse, structured summary");
    expect(setResolvingCalls).toEqual([true]);
    expect(published).toEqual([{ type: "chat.injected", promptId: "p0", path: c.repo, text: call[0].text, kind: "system" }]);
  });

  it("is a no-op for a promptId it never dispatched", async () => {
    const c = await makeConflictedRoot();
    repo = c.repo;
    origin = c.origin;
    const { resolver, setResolvingCalls, dispatchSystemPrompt } = makeResolver(c.repo);

    await resolver.onTurnEnd("someone-elses-prompt");

    expect(setResolvingCalls).toEqual([]);
    expect(dispatchSystemPrompt).not.toHaveBeenCalled();
  });

  it("finishes the rebase with the pinned identity once the agent's edits clear the conflict", async () => {
    const c = await makeConflictedRoot();
    repo = c.repo;
    origin = c.origin;
    const { resolver, setResolvingCalls, dispatchSystemPrompt } = makeResolver(c.repo);

    resolver.onConflict(["astro.config.mjs"]);
    await flush();

    // The agent resolves the conflict: overwrite and stage the file, exactly what the prompt asks for.
    await writeFile(path.join(c.repo, "astro.config.mjs"), "resolved\n");
    git(["add", "."], c.repo);

    await resolver.onTurnEnd("p0");

    expect(git(["status", "--porcelain"], c.repo).trim()).toBe(""); // rebase finished, tree clean.
    expect(git(["log", "-1", "--format=%cn <%ce>"], c.repo).trim()).toBe("Ryan Rowe <ryan@rowe.codes>");
    expect(setResolvingCalls).toEqual([true, false]);
    expect(dispatchSystemPrompt).toHaveBeenCalledTimes(1); // no re-prompt needed.
  });

  it("re-prompts once when the agent's turn ends with the conflict still unresolved, then auto-aborts", async () => {
    const c = await makeConflictedRoot();
    repo = c.repo;
    origin = c.origin;
    const { resolver, setResolvingCalls, dispatchSystemPrompt, abortRoot } = makeResolver(c.repo);

    resolver.onConflict(["astro.config.mjs"]);
    await flush();

    // Turn ends with nothing staged: still conflicted.
    await resolver.onTurnEnd("p0");
    await flush(); // the retry's dispatchSystemPrompt call is fired from inside onTurnEnd's own .then chain.

    expect(dispatchSystemPrompt).toHaveBeenCalledTimes(2); // one retry.
    expect(dispatchSystemPrompt.mock.calls[1][0].text).toContain("still conflicted");
    expect(git(["status", "--porcelain"], c.repo)).toContain("UU astro.config.mjs"); // rebase untouched.

    // The retry's turn also ends unresolved: falls back, no third dispatch. Unlike a post (which
    // leaves it conflicted for a manual F6), root auto-aborts here so it's never stranded.
    await resolver.onTurnEnd("p1");

    expect(dispatchSystemPrompt).toHaveBeenCalledTimes(2);
    expect(abortRoot).toHaveBeenCalledTimes(1); // routed through gitStatus's own F6, not a separate call site.
    expect(git(["status", "--porcelain"], c.repo).trim()).toBe(""); // aborted back to the pre-rebase tip.
    expect(git(["symbolic-ref", "--short", "HEAD"], c.repo).trim()).toBe("main"); // no longer detached mid-rebase.

    // Guard: resolving is cleared on every turn-end, including the two that led to fallback -- the
    // root can never be stuck showing "resolving" after the state machine gives up.
    expect(setResolvingCalls).toEqual([true, false, true, false]);
  });

  it("does not crash and leaves resolving cleared when a git call rejects mid-handleTurnEnd", async () => {
    const c = await makeConflictedRoot();
    repo = c.repo;
    origin = c.origin;
    const setResolvingCalls: boolean[] = [];
    const dispatchSystemPrompt = vi.fn(async () => ({ promptId: "p0", dispatched: true }));
    const gitRunner = createGitRunner();
    // A transient spawn failure (the same class gitRunner.run() already retries at its own layer,
    // but a caller must still survive one slipping through rather than crashing the sidecar).
    const gitSpy = vi.spyOn(gitRunner, "git").mockRejectedValueOnce(new Error("spawn git ENOENT"));
    const abortRoot = vi.fn(async () => ({ ok: true as const }));
    const resolver = createRootConflictResolver({
      git: gitRunner,
      rootWorktreePath: c.repo,
      sessionBranch: "main",
      dispatchSystemPrompt,
      setResolving: (resolving) => setResolvingCalls.push(resolving),
      publish: () => {},
      abortRoot,
    });

    resolver.onConflict(["astro.config.mjs"]);
    await flush();

    await expect(resolver.onTurnEnd("p0")).resolves.toBeUndefined();

    expect(setResolvingCalls).toEqual([true, false]); // cleared before the git calls, as always.
    expect(gitSpy).toHaveBeenCalledTimes(1); // rejected on the very first call; nothing after it ran.
    expect(abortRoot).not.toHaveBeenCalled(); // never reached: the rejection short-circuits first.
  });
});

describe("createRootConflictResolver against a real agentHost (root-target dispatch wiring)", () => {
  beforeEach(() => vi.mocked(query).mockReset());

  // The active post's own canonicalPath is deliberately unrelated to the root, proving the dispatch is
  // wired through agentHost's rootWorktreePath target rather than the active-post check the post-scoped
  // conflictResolver relies on.
  it("dispatches to the studio root even though a different post is active", async () => {
    const ROOT = "/repo";
    const mockedQuery = vi.mocked(query);
    mockedQuery.mockImplementationOnce((async function* () {}) as unknown as typeof query);
    const setResolvingCalls: boolean[] = [];
    const published: ServerMessage[] = [];
    const agentHost = createAgentHost({
      tools: {} as unknown as StudioTools,
      getActiveWorktree: () => ({
        slug: "a",
        branch: "blog/a",
        worktreePath: "/repo/.worktrees/blog/a",
        worktreeFilePath: "/repo/.worktrees/blog/a/post.mdx",
        relPath: "src/content/blog/a.mdx",
        canonicalPath: "/repo/src/content/blog/a.mdx",
      }),
      rootWorktreePath: ROOT,
      skillInstructions: "",
      emit: () => {},
    });
    const resolver = createRootConflictResolver({
      git: createGitRunner(),
      rootWorktreePath: ROOT,
      sessionBranch: "main",
      dispatchSystemPrompt: (input) => agentHost.dispatchSystemPrompt(input),
      setResolving: (resolving) => setResolvingCalls.push(resolving),
      publish: (msg) => published.push(msg),
      abortRoot: () => Promise.resolve({ ok: true }), // never reached: onTurnEnd isn't exercised here.
    });

    resolver.onConflict(["astro.config.mjs"]);
    await flush();

    expect(setResolvingCalls).toEqual([true]);
    expect(published).toHaveLength(1);
    expect(published[0]).toMatchObject({ type: "chat.injected", path: ROOT, kind: "system" });
    expect(mockedQuery).toHaveBeenCalledTimes(1);
    const call = mockedQuery.mock.calls[0][0] as { options: { cwd: string } };
    expect(call.options.cwd).toBe(ROOT);
  });
});
