// Pure reads over git.state; no component fetches, no store access. There is no "local-work dot"
// selector: the lifebar and its compact counts render the distinct commit states directly.

import type { GitPostState, GitPrimaryState, GitState, RebaseState } from "../../shared/protocol";

/** Seeds StudioState.git so first-paint/reconnect (before the first git.state lands) never reads
 *  `.primary` of null. */
export const EMPTY_GIT: GitState = {
  primary: { sessionBranch: "", head: "", rootMoved: false, ref: "", onOrigin: false, ahead: 0, behind: 0, worktree: "" },
  posts: [],
  fetch: { inFlight: false, at: null },
};

export const selectPost = (g: GitState, path: string): GitPostState | null => g.posts.find((p) => p.path === path) ?? null;
export const selectPrimary = (g: GitState): GitPrimaryState => g.primary;
export const selectPalette = (g: GitState): GitPostState[] => g.posts; // one full lifebar per ⌘P row.
export const selectRootName = (g: GitState): string => g.primary.sessionBranch; // the <root> label the target node renders.
export const selectRebase = (g: GitState, path: string): RebaseState =>
  selectPost(g, path)?.rebase ?? { phase: "idle", conflictedFiles: [] };

// Working tree modified. Gates "Revert to clean". A null fact (no worktree) reads false, never clean.
export const selectUncommitted = (g: GitState, path: string): boolean => selectPost(g, path)?.uncommitted === true;

// Ship gate (F7): the per-post behind, not primary.behind.
export const selectShipBlocked = (g: GitState, path: string): boolean => (selectPost(g, path)?.behind ?? 0) > 0;

// Update available (F3): behind the root and not mid-rebase.
export const selectUpdatable = (g: GitState, path: string): boolean => {
  const p = selectPost(g, path);
  return !!p && p.behind > 0 && p.rebase.phase === "idle";
};

// Work not yet safely on origin/blog/<stem>. Drives the compact-tab attention state.
export const selectPushable = (g: GitState, path: string): boolean => {
  const p = selectPost(g, path);
  return !!p && (p.unpushed > 0 || p.uncommitted === true);
};
