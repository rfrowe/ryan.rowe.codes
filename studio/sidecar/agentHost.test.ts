// Unit tests for the agent host's pure permission logic (the decision-to-SDK-result mapping, the
// worktree "ask" jail) and the dispatchSystemPrompt queuing state machine. Everything above the
// "dispatchSystemPrompt" describe block avoids the query()-driven session entirely, exercising only
// the extracted helpers; that block mocks the SDK's `query` export, since it's the one behavior
// (draining a queued system prompt once an in-flight turn ends) that only exists inside `runTurn`.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { query } from "@anthropic-ai/claude-agent-sdk";
import type { HookInput, SessionMessage } from "@anthropic-ai/claude-agent-sdk";

import type { ActiveWorktree } from "../state/store";
import type { StudioTools } from "../shared/services";
import {
  createAgentHost,
  decisionToPermissionResult,
  mutationTarget,
  reduceHistory,
  withinAnyDir,
  worktreeAskHook,
} from "./agentHost";

vi.mock("@anthropic-ai/claude-agent-sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@anthropic-ai/claude-agent-sdk")>();
  return { ...actual, query: vi.fn() };
});

const WT = "/repo/.worktrees/blog/2026-07-10_a-post";

/** A minimal PreToolUse HookInput for the jail hook. */
function preToolUse(toolName: string, toolInput: Record<string, unknown>): HookInput {
  return { hook_event_name: "PreToolUse", tool_name: toolName, tool_input: toolInput } as unknown as HookInput;
}

describe("decisionToPermissionResult", () => {
  it("allows once with no permission widening", () => {
    expect(decisionToPermissionResult("allow", undefined)).toEqual({ behavior: "allow" });
  });

  it("denies with a message", () => {
    const r = decisionToPermissionResult("deny", undefined);
    expect(r.behavior).toBe("deny");
    expect(r).toHaveProperty("message");
  });

  it("carries the SDK's suggestions on 'always' so the same call stops prompting", () => {
    const suggestions = [
      { type: "addDirectories", directories: ["/repo/src"], destination: "session" },
    ] as unknown as Parameters<typeof decisionToPermissionResult>[1];
    expect(decisionToPermissionResult("always", suggestions)).toEqual({
      behavior: "allow",
      updatedPermissions: suggestions,
    });
  });

  it("falls back to empty widening when 'always' has no suggestions", () => {
    expect(decisionToPermissionResult("always", undefined)).toEqual({
      behavior: "allow",
      updatedPermissions: [],
    });
  });
});

describe("mutationTarget", () => {
  it("reads file_path for the edit tools", () => {
    expect(mutationTarget("Edit", { file_path: "/x/y.mdx" })).toBe("/x/y.mdx");
    expect(mutationTarget("Write", { file_path: "/x/y.mdx" })).toBe("/x/y.mdx");
    expect(mutationTarget("MultiEdit", { file_path: "/x/y.mdx" })).toBe("/x/y.mdx");
  });

  it("reads notebook_path for NotebookEdit", () => {
    expect(mutationTarget("NotebookEdit", { notebook_path: "/x/nb.ipynb" })).toBe("/x/nb.ipynb");
  });

  it("is null for non-mutations (Read/Bash) and for a missing/empty path", () => {
    expect(mutationTarget("Read", { file_path: "/x/y.mdx" })).toBeNull();
    expect(mutationTarget("Bash", { command: "rm -rf /" })).toBeNull();
    expect(mutationTarget("Edit", {})).toBeNull();
    expect(mutationTarget("Edit", { file_path: "" })).toBeNull();
  });
});

describe("withinAnyDir", () => {
  it("accepts a path inside the worktree", () => {
    expect(withinAnyDir(`${WT}/post.mdx`, [WT])).toBe(true);
  });

  it("rejects a path outside every allowed dir", () => {
    expect(withinAnyDir("/repo/src/other.mdx", [WT])).toBe(false);
    expect(withinAnyDir("/etc/passwd", [WT])).toBe(false);
  });

  it("accepts a path inside a granted dir", () => {
    expect(withinAnyDir("/repo/src/assets/x.webp", [WT, "/repo/src/assets"])).toBe(true);
  });

  it("resolves `..` escapes against the worktree", () => {
    expect(withinAnyDir(`${WT}/../../secret.mdx`, [WT])).toBe(false);
  });
});

describe("renameSessionKey", () => {
  // A minimal host: renameSessionKey only touches the private `sessions` map, so the deps can be
  // stubs. The test seeds/inspects that map directly (the host exposes no session getter) to prove
  // a rename carries the resumable session with the post instead of orphaning it.
  function makeHost() {
    return createAgentHost({
      tools: {} as unknown as StudioTools,
      getActiveWorktree: () => null,
      skillInstructions: "",
      emit: () => {},
    });
  }
  const sessionsOf = (host: ReturnType<typeof makeHost>) =>
    (host as unknown as { sessions: Map<string, unknown> }).sessions;
  const aSession = () => ({ sessionId: "sess-1", mode: "new", firstTurn: true });

  it("moves a post's session from the old path to the new one", () => {
    const host = makeHost();
    const sessions = sessionsOf(host);
    const s = aSession();
    sessions.set("/old", s);
    host.renameSessionKey("/old", "/new");
    expect(sessions.has("/old")).toBe(false);
    expect(sessions.get("/new")).toBe(s); // same object, so the resumable session id is preserved
  });

  it("is a no-op when the old path has no session", () => {
    const host = makeHost();
    const sessions = sessionsOf(host);
    host.renameSessionKey("/old", "/new");
    expect(sessions.has("/new")).toBe(false);
  });

  it("does not clobber an existing session at the new path", () => {
    const host = makeHost();
    const sessions = sessionsOf(host);
    const oldS = aSession();
    const newS = { sessionId: "sess-2", mode: "resume", firstTurn: false };
    sessions.set("/old", oldS);
    sessions.set("/new", newS);
    host.renameSessionKey("/old", "/new");
    expect(sessions.get("/new")).toBe(newS); // untouched
    expect(sessions.get("/old")).toBe(oldS); // left in place rather than lost
  });

  it("is a no-op when old and new are the same path", () => {
    const host = makeHost();
    const sessions = sessionsOf(host);
    const s = aSession();
    sessions.set("/same", s);
    host.renameSessionKey("/same", "/same");
    expect(sessions.get("/same")).toBe(s);
  });
});

describe("reduceHistory", () => {
  // A stored transcript entry: only `type` and `message` matter to the reducer.
  function msg(type: "user" | "assistant", content: unknown): SessionMessage {
    return {
      type,
      uuid: "u",
      session_id: "s",
      message: { role: type, content },
      parent_tool_use_id: null,
      parent_agent_id: null,
    } as SessionMessage;
  }

  it("reduces a studio turn to user/assistant/tool items, filling the tool result in place", () => {
    const history = reduceHistory([
      msg("user", "Rewrite the intro.\n\n<studio-context>\nActive post file: /wt/post.mdx.\n</studio-context>"),
      msg("assistant", [
        { type: "thinking", thinking: "…" },
        { type: "text", text: "On it." },
        { type: "tool_use", id: "t1", name: "Edit", input: { file_path: "/wt/post.mdx" } },
      ]),
      msg("user", [{ type: "tool_result", tool_use_id: "t1", content: "ok", is_error: false }]),
      msg("assistant", [{ type: "text", text: "Done." }]),
    ]);
    expect(history).toEqual([
      { kind: "user", text: "Rewrite the intro." }, // studio-context trailer stripped
      { kind: "assistant", text: "On it." }, // thinking block skipped
      { kind: "tool", tool: { toolUseId: "t1", name: "Edit", input: { file_path: "/wt/post.mdx" }, isError: false, resultPreview: "ok" } },
      { kind: "assistant", text: "Done." },
    ]);
  });

  it("marks an errored tool result and emits no bubble for the tool-result-only user turn", () => {
    const history = reduceHistory([
      msg("assistant", [{ type: "tool_use", id: "t9", name: "Bash", input: { command: "false" } }]),
      msg("user", [{ type: "tool_result", tool_use_id: "t9", content: "boom", is_error: true }]),
    ]);
    expect(history).toEqual([
      { kind: "tool", tool: { toolUseId: "t9", name: "Bash", input: { command: "false" }, isError: true, resultPreview: "boom" } },
    ]);
  });

  it("keeps a foreign (unwrapped) user prompt verbatim", () => {
    expect(reduceHistory([msg("user", "just chatting")])).toEqual([{ kind: "user", text: "just chatting" }]);
  });
});

describe("worktreeAskHook", () => {
  it("passes through an in-worktree edit (mode/classifier decides)", async () => {
    const out = await worktreeAskHook(() => [WT])(preToolUse("Edit", { file_path: `${WT}/post.mdx` }));
    expect(out).toEqual({});
  });

  it("asks — never denies — for an out-of-worktree edit", async () => {
    const out = await worktreeAskHook(() => [WT])(preToolUse("Write", { file_path: "/repo/src/pages/index.astro" }));
    const specific = (out as { hookSpecificOutput?: Record<string, unknown> }).hookSpecificOutput;
    expect(specific).toMatchObject({ hookEventName: "PreToolUse", permissionDecision: "ask" });
  });

  it("stops asking once the target's dir has been granted", async () => {
    const granted = [WT, "/repo/src/pages"];
    const out = await worktreeAskHook(() => granted)(preToolUse("Write", { file_path: "/repo/src/pages/index.astro" }));
    expect(out).toEqual({});
  });

  it("never gates Bash or Read (no shell parsing)", async () => {
    const hook = worktreeAskHook(() => [WT]);
    expect(await hook(preToolUse("Bash", { command: "rm -rf ~/important" }))).toEqual({});
    expect(await hook(preToolUse("Read", { file_path: "/etc/passwd" }))).toEqual({});
  });
});

describe("dispatchSystemPrompt", () => {
  const ROOT = "/repo";
  // Several of these tests assert on `query`'s call count; without a reset, mock implementations and
  // call history would leak across tests sharing this module-level mock.
  beforeEach(() => vi.mocked(query).mockReset());
  const activeWorktree: ActiveWorktree = {
    slug: "a",
    branch: "blog/a",
    worktreePath: WT,
    worktreeFilePath: `${WT}/post.mdx`,
    relPath: "src/content/blog/a.mdx",
    canonicalPath: "/repo/src/content/blog/a.mdx",
  };

  function makeHost(opts: { rootWorktreePath?: string } = {}) {
    const emitted: unknown[] = [];
    const turnEnds: string[] = [];
    const host = createAgentHost({
      tools: {} as unknown as StudioTools,
      getActiveWorktree: () => activeWorktree,
      skillInstructions: "",
      emit: (m) => emitted.push(m),
      onTurnEnd: (promptId) => turnEnds.push(promptId),
      rootWorktreePath: opts.rootWorktreePath,
    });
    return { host, emitted, turnEnds };
  }

  it("mints its own promptId and queues rather than rejecting when a turn is already in flight", async () => {
    const { host } = makeHost();
    // A regular prompt is mid-flight; poke the private latch directly rather than driving a real
    // query() call, since only the queuing decision is under test here.
    const internals = host as unknown as { current: unknown; pendingSystemPrompts: unknown[] };
    internals.current = { promptId: "human-1", abort: new AbortController() };

    const { promptId } = await host.dispatchSystemPrompt({ path: activeWorktree.canonicalPath, text: "resolve" });

    expect(promptId).toBeTruthy();
    expect(promptId).not.toBe("human-1");
    expect(internals.pendingSystemPrompts).toEqual([{ promptId, path: activeWorktree.canonicalPath, text: "resolve" }]);
  });

  it("queues multiple dispatches behind a busy turn in FIFO order rather than overwriting the pending one", async () => {
    const { host } = makeHost();
    const internals = host as unknown as { current: unknown; pendingSystemPrompts: unknown[] };
    internals.current = { promptId: "human-1", abort: new AbortController() };

    const first = await host.dispatchSystemPrompt({ path: activeWorktree.canonicalPath, text: "first" });
    const second = await host.dispatchSystemPrompt({ path: activeWorktree.canonicalPath, text: "second" });

    expect(internals.pendingSystemPrompts).toEqual([
      { promptId: first.promptId, path: activeWorktree.canonicalPath, text: "first" },
      { promptId: second.promptId, path: activeWorktree.canonicalPath, text: "second" },
    ]);
  });

  it("drains a queued system prompt once the in-flight turn ends, even though that turn errors", async () => {
    const mockedQuery = vi.mocked(query);
    let releaseHumanTurn: () => void = () => {};
    const humanTurnGate = new Promise<void>((resolve) => (releaseHumanTurn = resolve));
    // The human's in-flight turn: a real suspension point (await the gate) before it blows up, so
    // "human-1" is genuinely still current when dispatchSystemPrompt runs below. A synchronous throw
    // here would let runTurn's whole finally (including the drain) complete before dispatch is even
    // called, which would pass this test without the queuing path ever running. A plain async
    // iterator (rather than a generator) since there's no yield to give require-yield.
    mockedQuery.mockImplementationOnce((() => ({
      [Symbol.asyncIterator]: () => ({
        next: async () => {
          await humanTurnGate;
          throw new Error("boom");
        },
      }),
    })) as unknown as typeof query);
    // The drained system turn: completes cleanly with no SDK messages. query() actually returns a
    // Query (an async generator plus control methods runTurn never calls); the plain generator here
    // only needs to satisfy the `for await` loop, so it's cast rather than implementing the rest.
    mockedQuery.mockImplementationOnce((async function* () {}) as unknown as typeof query);

    const { host, turnEnds } = makeHost();
    const internals = host as unknown as { current: unknown; pendingSystemPrompts: unknown[] };
    const humanTurn = host.prompt({ promptId: "human-1", text: "hi", context: { path: "/x", cursor: 0, selection: null } });
    await new Promise((r) => setTimeout(r, 0)); // let prompt()'s synchronous prefix set `current`, then park on the gate.
    expect(internals.current).toMatchObject({ promptId: "human-1" });

    // Queued while "human-1" is genuinely still current: dispatchSystemPrompt must not reject or run inline.
    const dispatched = host.dispatchSystemPrompt({ path: activeWorktree.canonicalPath, text: "resolve the conflict" });
    expect(internals.pendingSystemPrompts).toEqual([expect.objectContaining({ path: activeWorktree.canonicalPath })]);
    expect(mockedQuery).toHaveBeenCalledTimes(1); // not yet drained; the human turn hasn't ended.

    releaseHumanTurn();
    await humanTurn; // prompt() itself never rejects; runTurn's catch absorbs the thrown error.
    const { promptId } = await dispatched;

    expect(turnEnds).toEqual(["human-1", promptId]); // both turns reached onTurnEnd, never just the first.
    expect(mockedQuery).toHaveBeenCalledTimes(2);
  });

  it("drains queued system prompts in FIFO order across successive turn ends, not last-write-wins", async () => {
    const mockedQuery = vi.mocked(query);
    let releaseHumanTurn: () => void = () => {};
    const humanTurnGate = new Promise<void>((resolve) => (releaseHumanTurn = resolve));
    mockedQuery.mockImplementationOnce((() => ({
      [Symbol.asyncIterator]: () => ({
        next: async () => {
          await humanTurnGate;
          return { done: true, value: undefined };
        },
      }),
    })) as unknown as typeof query);
    // Both queued system turns drain cleanly.
    mockedQuery.mockImplementationOnce((async function* () {}) as unknown as typeof query);
    mockedQuery.mockImplementationOnce((async function* () {}) as unknown as typeof query);

    const { host, turnEnds } = makeHost();
    const humanTurn = host.prompt({ promptId: "human-1", text: "hi", context: { path: "/x", cursor: 0, selection: null } });
    await new Promise((r) => setTimeout(r, 0));

    const first = await host.dispatchSystemPrompt({ path: activeWorktree.canonicalPath, text: "first" });
    const second = await host.dispatchSystemPrompt({ path: activeWorktree.canonicalPath, text: "second" });

    releaseHumanTurn();
    await humanTurn;
    while (turnEnds.length < 3) await new Promise((r) => setTimeout(r, 0)); // let the drain chain settle.

    expect(turnEnds).toEqual(["human-1", first.promptId, second.promptId]);
  });

  it("still rejects a path that is neither the active post nor a configured root", async () => {
    const { host, emitted } = makeHost({ rootWorktreePath: ROOT });
    const { dispatched, promptId } = await host.dispatchSystemPrompt({ path: "/somewhere/else.mdx", text: "x" });
    expect(dispatched).toBe(false);
    expect(emitted).toContainEqual({
      type: "error",
      promptId,
      message: "cannot dispatch: /somewhere/else.mdx is not the active post",
    });
  });

  it("rejects a dispatch to the root path when no rootWorktreePath is configured", async () => {
    const { host, emitted } = makeHost();
    const { dispatched, promptId } = await host.dispatchSystemPrompt({ path: ROOT, text: "x" });
    expect(dispatched).toBe(false);
    expect(emitted).toContainEqual({ type: "error", promptId, message: `cannot dispatch: ${ROOT} is not the active post` });
  });

  it("dispatches immediately to the studio root when the path matches rootWorktreePath, even though it isn't the active post", async () => {
    const mockedQuery = vi.mocked(query);
    mockedQuery.mockImplementationOnce((async function* () {}) as unknown as typeof query);
    const { host } = makeHost({ rootWorktreePath: ROOT });

    const { dispatched } = await host.dispatchSystemPrompt({ path: ROOT, text: "resolve the root rebase" });

    expect(dispatched).toBe(true);
    expect(mockedQuery).toHaveBeenCalledTimes(1);
    const call = mockedQuery.mock.calls[0][0] as { options: { cwd: string } };
    expect(call.options.cwd).toBe(ROOT); // root has no worktreePath of its own; cwd is the root path itself.
  });

  it("queues a root dispatch behind a busy post turn and later runs it against the root, not the post", async () => {
    const mockedQuery = vi.mocked(query);
    let releaseHumanTurn: () => void = () => {};
    const humanTurnGate = new Promise<void>((resolve) => (releaseHumanTurn = resolve));
    mockedQuery.mockImplementationOnce((() => ({
      [Symbol.asyncIterator]: () => ({
        next: async () => {
          await humanTurnGate;
          return { done: true, value: undefined };
        },
      }),
    })) as unknown as typeof query);
    mockedQuery.mockImplementationOnce((async function* () {}) as unknown as typeof query);

    const { host, turnEnds } = makeHost({ rootWorktreePath: ROOT });
    const humanTurn = host.prompt({ promptId: "human-1", text: "hi", context: { path: "/x", cursor: 0, selection: null } });
    await new Promise((r) => setTimeout(r, 0));

    const dispatched = host.dispatchSystemPrompt({ path: ROOT, text: "resolve root rebase" });
    expect(mockedQuery).toHaveBeenCalledTimes(1); // not yet drained.

    releaseHumanTurn();
    await humanTurn;
    const { promptId } = await dispatched;

    expect(turnEnds).toEqual(["human-1", promptId]);
    expect(mockedQuery).toHaveBeenCalledTimes(2);
    const rootCall = mockedQuery.mock.calls[1][0] as { options: { cwd: string } };
    expect(rootCall.options.cwd).toBe(ROOT);
  });
});
