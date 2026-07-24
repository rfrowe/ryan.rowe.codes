import { describe, expect, it } from "vitest";

import { rootConflictPhase, updateTriggerLabel } from "./turnSelectors";

const ROOT = "/repo";

describe("rootConflictPhase", () => {
  it("is queued when root's turn is latched but hasn't produced content yet", () => {
    expect(rootConflictPhase({ promptId: "p1", path: ROOT }, false, ROOT, false)).toBe("queued");
  });

  it("is resolving once root's turn has produced content", () => {
    expect(rootConflictPhase({ promptId: "p1", path: ROOT }, true, ROOT, false)).toBe("resolving");
  });

  it("is done when no turn is latched and root has no queued dispatch", () => {
    expect(rootConflictPhase(null, false, ROOT, false)).toBe("done");
  });

  it("is done when a different post's turn holds the latch and root has no queued dispatch", () => {
    expect(rootConflictPhase({ promptId: "p1", path: "/repo/src/content/blog/a.mdx" }, true, ROOT, false)).toBe("done");
  });

  it("is queued when a different post's turn holds the latch but root has a dispatch waiting behind it", () => {
    expect(rootConflictPhase({ promptId: "p1", path: "/repo/src/content/blog/a.mdx" }, true, ROOT, true)).toBe("queued");
  });

  it("is done when rootPath is empty (no git.state has landed yet), even with a queued dispatch", () => {
    expect(rootConflictPhase({ promptId: "p1", path: "" }, false, "", true)).toBe("done");
  });
});

describe("updateTriggerLabel", () => {
  it("is Queued when the post's rebase is resolving but its turn hasn't started", () => {
    expect(updateTriggerLabel("resolving", false, false, false)).toBe("Queued…");
  });

  it("is Queued when resolving and it's the live turn but no content has arrived yet", () => {
    expect(updateTriggerLabel("resolving", true, false, false)).toBe("Queued…");
  });

  it("is Updating when resolving, it's the live turn, and content has started", () => {
    expect(updateTriggerLabel("resolving", true, true, false)).toBe("Updating…");
  });

  it("is Updating from the instant the trigger fires, before any server confirmation", () => {
    expect(updateTriggerLabel("idle", false, false, true)).toBe("Updating…");
  });

  it("is Update when idle and nothing is locally pending", () => {
    expect(updateTriggerLabel("idle", false, false, false)).toBe("Update");
  });

  it("is Update when conflicted but not yet dispatched (rebase.phase never resolving here)", () => {
    expect(updateTriggerLabel("conflicted", false, false, false)).toBe("Update");
  });
});
