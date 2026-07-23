import { describe, expect, it } from "vitest";

import type { GitPostState, GitState } from "../../shared/protocol";
import {
  EMPTY_GIT,
  selectPalette,
  selectPost,
  selectPrimary,
  selectPushable,
  selectRebase,
  selectRootName,
  selectShipBlocked,
  selectUncommitted,
  selectUpdatable,
} from "./gitSelectors";

function post(path: string, overrides: Partial<GitPostState> = {}): GitPostState {
  return {
    path,
    stem: path,
    branch: `blog/${path}`,
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

function gitState(posts: GitPostState[], primaryOverrides: Partial<GitState["primary"]> = {}): GitState {
  return {
    primary: { sessionBranch: "main", head: "main", rootMoved: false, ref: "origin/main", onOrigin: true, ahead: 0, behind: 0, worktree: "/repo", ...primaryOverrides },
    posts,
    fetch: { inFlight: false, at: null },
  };
}

describe("selectPost / selectPrimary / selectPalette / selectRootName", () => {
  it("finds a post by path, or null when it isn't in posts", () => {
    const p = post("/a.mdx");
    const g = gitState([p]);
    expect(selectPost(g, "/a.mdx")).toBe(p);
    expect(selectPost(g, "/missing.mdx")).toBeNull();
  });

  it("selectPrimary/selectPalette/selectRootName read the matching git.state fields", () => {
    const p = post("/a.mdx");
    const g = gitState([p], { sessionBranch: "release" });
    expect(selectPrimary(g)).toBe(g.primary);
    expect(selectPalette(g)).toBe(g.posts);
    expect(selectRootName(g)).toBe("release");
  });
});

describe("selectRebase", () => {
  it("returns the post's own rebase state", () => {
    const p = post("/a.mdx", { rebase: { phase: "conflicted", conflictedFiles: ["a.mdx"] } });
    expect(selectRebase(gitState([p]), "/a.mdx")).toEqual({ phase: "conflicted", conflictedFiles: ["a.mdx"] });
  });

  it("defaults to idle for a post that isn't in posts", () => {
    expect(selectRebase(gitState([]), "/missing.mdx")).toEqual({ phase: "idle", conflictedFiles: [] });
  });
});

describe("selectUncommitted", () => {
  it("is true only when uncommitted is exactly true", () => {
    expect(selectUncommitted(gitState([post("/a.mdx", { uncommitted: true })]), "/a.mdx")).toBe(true);
  });

  it("reads false for false", () => {
    expect(selectUncommitted(gitState([post("/a.mdx", { uncommitted: false })]), "/a.mdx")).toBe(false);
  });

  it("reads null (no worktree) as false, never as clean-implying-true", () => {
    expect(selectUncommitted(gitState([post("/a.mdx", { uncommitted: null })]), "/a.mdx")).toBe(false);
  });

  it("is false for a post that isn't in posts", () => {
    expect(selectUncommitted(gitState([]), "/missing.mdx")).toBe(false);
  });
});

describe("selectShipBlocked (per-post behind, not primary.behind)", () => {
  it("is true when the post's own behind is nonzero, even if primary is not behind", () => {
    const g = gitState([post("/a.mdx", { behind: 2 })], { behind: 0 });
    expect(selectShipBlocked(g, "/a.mdx")).toBe(true);
  });

  it("is false when the post is not behind, even if primary is behind", () => {
    const g = gitState([post("/a.mdx", { behind: 0 })], { behind: 5 });
    expect(selectShipBlocked(g, "/a.mdx")).toBe(false);
  });
});

describe("selectUpdatable", () => {
  it("is true when behind and rebase is idle", () => {
    const g = gitState([post("/a.mdx", { behind: 1, rebase: { phase: "idle", conflictedFiles: [] } })]);
    expect(selectUpdatable(g, "/a.mdx")).toBe(true);
  });

  it("is false when not behind", () => {
    const g = gitState([post("/a.mdx", { behind: 0, rebase: { phase: "idle", conflictedFiles: [] } })]);
    expect(selectUpdatable(g, "/a.mdx")).toBe(false);
  });

  it("is false when behind but already mid-rebase", () => {
    const g = gitState([post("/a.mdx", { behind: 1, rebase: { phase: "conflicted", conflictedFiles: ["a.mdx"] } })]);
    expect(selectUpdatable(g, "/a.mdx")).toBe(false);
  });

  it("is false for a post that isn't in posts", () => {
    expect(selectUpdatable(gitState([]), "/missing.mdx")).toBe(false);
  });
});

describe("selectPushable", () => {
  it("is true when unpushed > 0", () => {
    expect(selectPushable(gitState([post("/a.mdx", { unpushed: 1 })]), "/a.mdx")).toBe(true);
  });

  it("is true when uncommitted is true, even with nothing unpushed", () => {
    expect(selectPushable(gitState([post("/a.mdx", { unpushed: 0, uncommitted: true })]), "/a.mdx")).toBe(true);
  });

  it("is false when clean and nothing unpushed", () => {
    expect(selectPushable(gitState([post("/a.mdx", { unpushed: 0, uncommitted: false })]), "/a.mdx")).toBe(false);
  });

  it("is false when uncommitted is null (no worktree) and nothing unpushed", () => {
    expect(selectPushable(gitState([post("/a.mdx", { unpushed: 0, uncommitted: null })]), "/a.mdx")).toBe(false);
  });
});

describe("EMPTY_GIT (first-paint/reconnect seed)", () => {
  it("selectPrimary/selectRootName read defined defaults, never throwing on a null .primary", () => {
    expect(selectPrimary(EMPTY_GIT)).toEqual(EMPTY_GIT.primary);
    expect(selectRootName(EMPTY_GIT)).toBe("");
  });

  it("every per-post selector reads its safe default for any path, before a post ever exists", () => {
    expect(selectPost(EMPTY_GIT, "/a.mdx")).toBeNull();
    expect(selectPalette(EMPTY_GIT)).toEqual([]);
    expect(selectUncommitted(EMPTY_GIT, "/a.mdx")).toBe(false);
    expect(selectShipBlocked(EMPTY_GIT, "/a.mdx")).toBe(false);
    expect(selectUpdatable(EMPTY_GIT, "/a.mdx")).toBe(false);
    expect(selectPushable(EMPTY_GIT, "/a.mdx")).toBe(false);
    expect(selectRebase(EMPTY_GIT, "/a.mdx")).toEqual({ phase: "idle", conflictedFiles: [] });
  });
});
