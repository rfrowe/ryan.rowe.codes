import { describe, expect, it } from "vitest";

import { initialState, isDuplicateExternalRev, isLatestRevertScopeRequest, reducer, type StudioState } from "./App";

const ROOT = "/repo";
const TAB_A = "/repo/src/content/blog/a.mdx";
const TAB_B = "/repo/src/content/blog/b.mdx";

function withRoot(state: StudioState, root: string): StudioState {
  return { ...state, git: { ...state.git, primary: { ...state.git.primary, worktree: root } } };
}

function withTab(state: StudioState, path: string): StudioState {
  return {
    ...state,
    tabs: [
      ...state.tabs,
      { path, title: path, worktreePath: null, doc: null, remoteUpdate: null, preview: { valid: false, url: null, errors: [] }, session: { sessionId: null, mode: "new" }, chat: [], permissions: [], externalChange: null, nameSync: { synced: true } },
    ],
    activePath: state.activePath ?? path,
  };
}

describe("isLatestRevertScopeRequest", () => {
  it("is the latest when its sequence matches the current one", () => {
    expect(isLatestRevertScopeRequest(3, 3)).toBe(true);
  });

  it("is superseded when a later toggle has since bumped the sequence", () => {
    expect(isLatestRevertScopeRequest(1, 2)).toBe(false);
  });

  it("is superseded even if it somehow resolves ahead of the current sequence", () => {
    expect(isLatestRevertScopeRequest(2, 1)).toBe(false);
  });
});

describe("isDuplicateExternalRev", () => {
  it("is a duplicate when the rev is not strictly newer and the hash matches", () => {
    expect(isDuplicateExternalRev({ n: 2, hash: "abc" }, { n: 2, hash: "abc" })).toBe(true);
    expect(isDuplicateExternalRev({ n: 1, hash: "abc" }, { n: 2, hash: "abc" })).toBe(true);
  });

  it("is not a duplicate when the rev is strictly newer, even with the same hash", () => {
    expect(isDuplicateExternalRev({ n: 3, hash: "abc" }, { n: 2, hash: "abc" })).toBe(false);
  });

  it("is not a duplicate when the hash differs, even if the rev is lower or equal", () => {
    // A sidecar restart followed by a reconnect can resend a lower rev whose content genuinely
    // changed, since the rev counter resets but the file on disk doesn't roll back.
    expect(isDuplicateExternalRev({ n: 1, hash: "def" }, { n: 2, hash: "abc" })).toBe(false);
    expect(isDuplicateExternalRev({ n: 2, hash: "def" }, { n: 2, hash: "abc" })).toBe(false);
  });
});

describe("reducer: chat.injected routing (root vs. post)", () => {
  it("routes a root-targeted dispatch into rootConflict, not any tab, and takes the turn latch when idle", () => {
    const state = withRoot(initialState, ROOT);
    const next = reducer(state, { type: "server", msg: { type: "chat.injected", promptId: "p1", path: ROOT, text: "resolve", kind: "system" } });

    expect(next.rootConflict.chat).toEqual([{ kind: "system", id: expect.any(String), text: "resolve" }]);
    expect(next.tabs).toEqual([]);
    expect(next.turn).toEqual({ promptId: "p1", path: ROOT });
    expect(next.turnStarted).toBe(false);
    expect(next.promptOwners.p1).toBe(ROOT);
  });

  it("still routes a post-targeted dispatch into that post's tab, unchanged from before", () => {
    const state = withTab(withRoot(initialState, ROOT), TAB_A);
    const next = reducer(state, { type: "server", msg: { type: "chat.injected", promptId: "p1", path: TAB_A, text: "resolve", kind: "system" } });

    expect(next.tabs[0].chat).toEqual([{ kind: "system", id: expect.any(String), text: "resolve" }]);
    expect(next.rootConflict.chat).toEqual([]);
    expect(next.turn).toEqual({ promptId: "p1", path: TAB_A });
  });

  it("does not steal the turn latch from a genuinely live turn: a dispatch arriving mid-turn is queued, not preempting", () => {
    // Post B's human turn is live (as sendPrompt would have set it); a root conflict fires mid-turn.
    let state = withRoot(withTab(withTab(initialState, TAB_A), TAB_B), ROOT);
    state = reducer(state, { type: "sendPrompt", promptId: "human-1", text: "hi", path: TAB_B });
    expect(state.turn).toEqual({ promptId: "human-1", path: TAB_B });

    const next = reducer(state, { type: "server", msg: { type: "chat.injected", promptId: "root-1", path: ROOT, text: "resolve", kind: "system" } });

    // The bubble and owner registration still happen...
    expect(next.rootConflict.chat).toHaveLength(1);
    expect(next.promptOwners["root-1"]).toBe(ROOT);
    // ...but the busy indicator stays on the turn that's actually running.
    expect(next.turn).toEqual({ promptId: "human-1", path: TAB_B });
    // Recorded as genuinely queued, so a selector can tell this apart from a finished episode.
    expect(next.queuedSystemPrompts["root-1"]).toBe(ROOT);
  });

  it("claims the turn once a queued dispatch's own content proves it actually started", () => {
    let state = withRoot(withTab(initialState, TAB_A), ROOT);
    state = reducer(state, { type: "sendPrompt", promptId: "human-1", text: "hi", path: TAB_A });
    state = reducer(state, { type: "server", msg: { type: "chat.injected", promptId: "root-1", path: ROOT, text: "resolve", kind: "system" } });
    expect(state.turn).toEqual({ promptId: "human-1", path: TAB_A }); // still queued, not live.
    expect(state.queuedSystemPrompts["root-1"]).toBe(ROOT);

    // The human's turn ends (its own done fires), then the queued root dispatch actually starts.
    state = reducer(state, { type: "server", msg: { type: "done", promptId: "human-1", stopReason: "end_turn" } });
    expect(state.turn).toBeNull();

    const started = reducer(state, { type: "server", msg: { type: "tool.start", promptId: "root-1", toolUseId: "t1", name: "Edit", input: {} } });
    expect(started.turn).toEqual({ promptId: "root-1", path: ROOT });
    expect(started.turnStarted).toBe(true);
    expect(started.rootConflict.chat.some((it) => it.kind === "tool")).toBe(true);
    // No longer queued once its own content proves it's actually running.
    expect(started.queuedSystemPrompts).not.toHaveProperty("root-1");
  });

  it("clears the queued marker if a queued dispatch ends without ever starting", () => {
    let state = withRoot(withTab(initialState, TAB_A), ROOT);
    state = reducer(state, { type: "sendPrompt", promptId: "human-1", text: "hi", path: TAB_A });
    state = reducer(state, { type: "server", msg: { type: "chat.injected", promptId: "root-1", path: ROOT, text: "resolve", kind: "system" } });
    expect(state.queuedSystemPrompts["root-1"]).toBe(ROOT);

    // The queued dispatch fails once drained (its target vanished, say) without ever claiming the latch.
    const errored = reducer(state, { type: "server", msg: { type: "error", promptId: "root-1", message: "cannot dispatch" } });
    expect(errored.turn).toEqual({ promptId: "human-1", path: TAB_A }); // the still-live turn is untouched.
    expect(errored.queuedSystemPrompts).not.toHaveProperty("root-1");
  });

  it("is idempotent once a turn is already claimed and started", () => {
    let state = withRoot(initialState, ROOT);
    state = reducer(state, { type: "server", msg: { type: "chat.injected", promptId: "p1", path: ROOT, text: "resolve", kind: "system" } });
    state = reducer(state, { type: "server", msg: { type: "assistant.delta", promptId: "p1", text: "wo" } });
    expect(state.turnStarted).toBe(true);

    const again = reducer(state, { type: "server", msg: { type: "assistant.delta", promptId: "p1", text: "rking" } });
    expect(again.turn).toEqual({ promptId: "p1", path: ROOT });
    expect(again.turnStarted).toBe(true);
    expect(again.rootConflict.chat).toEqual([
      { kind: "system", id: expect.any(String), text: "resolve" },
      { kind: "assistant", id: expect.any(String), promptId: "p1", text: "working", streaming: true },
    ]);
  });

  it("clears turnStarted alongside the latch once the root turn ends", () => {
    let state = withRoot(initialState, ROOT);
    state = reducer(state, { type: "server", msg: { type: "chat.injected", promptId: "p1", path: ROOT, text: "resolve", kind: "system" } });
    state = reducer(state, { type: "server", msg: { type: "assistant.delta", promptId: "p1", text: "hi" } });
    expect(state.turnStarted).toBe(true);

    const done = reducer(state, { type: "server", msg: { type: "done", promptId: "p1", stopReason: "end_turn" } });
    expect(done.turn).toBeNull();
    expect(done.turnStarted).toBe(false);
  });
});

describe("reducer: root-conflict permissions", () => {
  it("routes a permission.request owned by root into rootConflict.permissions, not a tab", () => {
    let state = withRoot(initialState, ROOT);
    state = reducer(state, { type: "server", msg: { type: "chat.injected", promptId: "p1", path: ROOT, text: "resolve", kind: "system" } });

    const next = reducer(state, {
      type: "server",
      msg: { type: "permission.request", promptId: "p1", requestId: "r1", toolName: "Edit", input: {} },
    });

    expect(next.rootConflict.permissions).toEqual([{ requestId: "r1", toolName: "Edit", input: {}, title: undefined, description: undefined, reason: undefined, toolUseId: undefined }]);
  });

  it("answerPermission against the root path clears it from rootConflict, not the active tab", () => {
    let state = withRoot(withTab(initialState, TAB_A), ROOT);
    state = reducer(state, { type: "server", msg: { type: "chat.injected", promptId: "p1", path: ROOT, text: "resolve", kind: "system" } });
    state = reducer(state, {
      type: "server",
      msg: { type: "permission.request", promptId: "p1", requestId: "r1", toolName: "Edit", input: {} },
    });

    const next = reducer(state, { type: "answerPermission", path: ROOT, requestId: "r1" });
    expect(next.rootConflict.permissions).toEqual([]);
  });
});

describe("reducer: dismissRootConflict", () => {
  it("resets rootConflict to empty", () => {
    let state = withRoot(initialState, ROOT);
    state = reducer(state, { type: "server", msg: { type: "chat.injected", promptId: "p1", path: ROOT, text: "resolve", kind: "system" } });
    expect(state.rootConflict.chat).not.toEqual([]);

    const next = reducer(state, { type: "dismissRootConflict" });
    expect(next.rootConflict).toEqual({ chat: [], permissions: [] });
  });
});
