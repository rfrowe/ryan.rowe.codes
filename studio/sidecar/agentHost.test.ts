// Unit tests for the agent host's pure permission logic: the decision-to-SDK-result mapping and the
// worktree "ask" jail (file edits that escape the allowed dir set must route to `ask`, not silently
// auto-approve). The `query()`-driven session isn't exercised here, only the extracted helpers.

import { describe, expect, it } from "vitest";
import type { HookInput, SessionMessage } from "@anthropic-ai/claude-agent-sdk";

import type { StudioTools } from "../shared/services";
import {
  createAgentHost,
  decisionToPermissionResult,
  mutationTarget,
  reduceHistory,
  withinAnyDir,
  worktreeAskHook,
} from "./agentHost";

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
