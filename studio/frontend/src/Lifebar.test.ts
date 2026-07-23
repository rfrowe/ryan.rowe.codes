import { describe, expect, it } from "vitest";

import type { GitPostState } from "../../shared/protocol";
import { lifebarParts } from "./Lifebar";

function post(overrides: Partial<GitPostState> = {}): GitPostState {
  return {
    path: "/a.mdx",
    stem: "a",
    branch: "blog/a",
    open: false,
    hasWorktree: true,
    onRemote: false,
    inRoot: false,
    ahead: 0,
    unpushed: 0,
    incoming: 0,
    behind: 0,
    uncommitted: false,
    rebase: { phase: "idle", conflictedFiles: [] },
    ...overrides,
  };
}

function texts(parts: ReturnType<typeof lifebarParts>): string[] {
  return parts.map((p) => p.text);
}

describe("lifebarParts — left cap", () => {
  it("renders the grey bar for a net-new post not yet in root", () => {
    const parts = lifebarParts(post({ inRoot: false, ahead: 1 }), "main", "full");
    expect(texts(parts)[0]).toBe("│");
  });

  it("renders the filled circle for a post based on the version already in root", () => {
    const parts = lifebarParts(post({ inRoot: true, ahead: 1 }), "main", "full");
    expect(texts(parts)[0]).toBe("◉");
  });
});

describe("lifebarParts — trail (full variant)", () => {
  it("splits ahead/unpushed into pushed dots and local-only dots", () => {
    const parts = lifebarParts(post({ ahead: 3, unpushed: 1 }), "main", "full");
    // 2 pushed (ahead - unpushed) then 1 unpushed, ordered pushed before local-only.
    expect(texts(parts)).toEqual(["│", "●", "●", "○", "▹main"]);
  });

  it("renders incoming commits as dotted circles, ordered after pushed/unpushed", () => {
    const parts = lifebarParts(post({ ahead: 1, unpushed: 0, incoming: 2 }), "main", "full");
    expect(texts(parts)).toEqual(["│", "●", "◍", "◍", "▹main"]);
  });

  it("bounds the trail to 4 dots then an ellipsis", () => {
    const parts = lifebarParts(post({ ahead: 6, unpushed: 0 }), "main", "full");
    expect(texts(parts)).toEqual(["│", "●", "●", "●", "●", "⋯", "▹main"]);
  });

  it("a publish (ahead resets to 0) empties the trail", () => {
    const parts = lifebarParts(post({ inRoot: true, ahead: 0, unpushed: 0, incoming: 0, uncommitted: false }), "main", "full");
    // Clean and in sync: collapses to just the target node.
    expect(texts(parts)).toEqual(["▸main"]);
  });
});

describe("lifebarParts — target node", () => {
  it("renders the pending (open) triangle with the root label when ahead of root", () => {
    const parts = lifebarParts(post({ ahead: 1 }), "release", "full");
    expect(texts(parts).at(-1)).toBe("▹release");
  });

  it("renders the filled (synced) triangle with the root label when not ahead of root", () => {
    const parts = lifebarParts(post({ ahead: 0, incoming: 1 }), "release", "full");
    expect(texts(parts).at(-1)).toBe("▸release");
  });

  it("labels from sessionBranch (the root argument), not any other name", () => {
    const parts = lifebarParts(post({ ahead: 1 }), "feat/worktree", "full");
    expect(texts(parts).at(-1)).toBe("▹feat/worktree");
  });
});

describe("lifebarParts — uncommitted adornment", () => {
  it("renders the pencil when uncommitted is true", () => {
    const parts = lifebarParts(post({ ahead: 1, uncommitted: true }), "main", "full");
    expect(texts(parts)).toContain("✎");
  });

  it("renders nothing when uncommitted is false", () => {
    const parts = lifebarParts(post({ ahead: 1, uncommitted: false }), "main", "full");
    expect(texts(parts)).not.toContain("✎");
    expect(texts(parts).some((t) => t === "◌")).toBe(false);
  });

  it("renders the hollow unknown mark when uncommitted is null, never as clean", () => {
    const parts = lifebarParts(post({ ahead: 1, uncommitted: null }), "main", "full");
    expect(texts(parts)).toContain("◌");
    expect(texts(parts)).not.toContain("✎");
  });

  it("a null uncommitted post is never eligible for the clean/in-sync collapse", () => {
    const parts = lifebarParts(post({ ahead: 0, incoming: 0, uncommitted: null }), "main", "full");
    expect(texts(parts)).toContain("◌");
    expect(texts(parts).length).toBeGreaterThan(1);
  });
});

describe("lifebarParts — behind warning", () => {
  it("renders behind as a separate part, never folded into the trail", () => {
    const parts = lifebarParts(post({ ahead: 2, unpushed: 1, behind: 2 }), "main", "full");
    const trailAndTarget = texts(parts).filter((t) => t !== "⚠ 2 behind main");
    expect(texts(parts)).toContain("⚠ 2 behind main");
    expect(trailAndTarget).toEqual(["│", "●", "○", "▹main"]);
  });

  it("omits the behind warning when behind is 0", () => {
    const parts = lifebarParts(post({ behind: 0 }), "main", "full");
    expect(parts.some((p) => p.key === "behind")).toBe(false);
  });

  it("shows the behind warning even on an otherwise-collapsed (clean, in-sync) post", () => {
    const parts = lifebarParts(post({ ahead: 0, incoming: 0, uncommitted: false, behind: 3 }), "main", "full");
    expect(texts(parts)).toEqual(["▸main", "⚠ 3 behind main"]);
  });
});

describe("lifebarParts — compact variant", () => {
  it("renders one glyph-prefixed count per nonzero trail type, no bound or ellipsis", () => {
    const parts = lifebarParts(post({ inRoot: true, ahead: 4, unpushed: 1, incoming: 1, uncommitted: true, behind: 2 }), "main", "compact");
    expect(texts(parts)).toEqual(["◉", "●3", "○1", "◍1", "▹main", "✎", "⚠↓2"]);
  });

  it("omits a trail glyph type entirely when its count is 0", () => {
    const parts = lifebarParts(post({ ahead: 2, unpushed: 0, incoming: 0 }), "main", "compact");
    expect(texts(parts)).toEqual(["│", "●2", "▹main"]);
  });

  it("never renders an ellipsis, however large the counts", () => {
    const parts = lifebarParts(post({ ahead: 10, unpushed: 0 }), "main", "compact");
    expect(texts(parts)).not.toContain("⋯");
    expect(texts(parts)).toContain("●10");
  });
});
