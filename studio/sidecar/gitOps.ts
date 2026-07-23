// Update/Pull (F3) and its abort primitive (F6): fetch a post's base forward and replay the post's
// own commits on top, with the pinned identity so the rebase's synthesized committer is never local
// git config. Studio-run, like ship.ts, whose identity-pinning discipline this mirrors.

import type { GitRunner } from "../shared/seams";
import type { GitOpsService } from "../shared/services";
import type { RebaseAbortResponse, UpdateResponse } from "../shared/protocol";
import type { StudioStore } from "../state/store";
import { errorMessage } from "./errorMessage";

const PINNED_NAME = "Ryan Rowe";
const PINNED_EMAIL = "ryan@rowe.codes";

// The targeted base fetch is a network round-trip; local rebase steps don't need this headroom.
const NETWORK_TIMEOUT_MS = 120_000;

export interface GitOpsDeps {
  git: GitRunner;
  store: StudioStore;
  /** The branch every post forks from and rebases onto; never re-resolved at runtime. */
  sessionBranch: string;
}

// Porcelain v1 status codes for an unmerged path (see git-status(1)); AA/DD are both-added/both-deleted.
const CONFLICT_CODES = new Set(["AA", "DD", "AU", "UA", "UD", "DU", "UU"]);

/** Unmerged paths from `git status --porcelain`, mirroring diffService's own line-slicing convention.
 *  Shared with gitStatus.ts, which detects a mid-rebase worktree the same way. */
export function parseConflictedPaths(porcelain: string): string[] {
  const paths: string[] = [];
  for (const line of porcelain.split("\n")) {
    if (line.length < 3 || !CONFLICT_CODES.has(line.slice(0, 2))) continue;
    paths.push(line.slice(3));
  }
  return paths;
}

function detail(stderr: string, code: number): string {
  return stderr.trim() || `exit ${code}`;
}

export function createGitOpsService(deps: GitOpsDeps): GitOpsService {
  const { git, store, sessionBranch } = deps;

  /** The post's worktree, opening it first if it isn't already (F3's "closed post" precondition). */
  async function ensureOpen(canonicalPath: string): Promise<{ worktreePath: string } | null> {
    const existing = store.getWorktreeFor(canonicalPath);
    if (existing) return existing;
    await store.openPost(canonicalPath);
    return store.getWorktreeFor(canonicalPath);
  }

  async function update(canonicalPath: string): Promise<UpdateResponse> {
    let wt: { worktreePath: string } | null;
    try {
      wt = await ensureOpen(canonicalPath);
    } catch (e) {
      return { ok: false, error: `failed to open the post: ${errorMessage(e)}` };
    }
    if (!wt) return { ok: false, error: "post not found" };
    const cwd = wt.worktreePath;

    // The pull half: this post's base only, never the global --prune fetch (that's F2's job).
    const fetchRes = await git.git(["fetch", "origin", sessionBranch], { cwd, timeoutMs: NETWORK_TIMEOUT_MS });
    if (fetchRes.code !== 0) {
      return { ok: false, error: `git fetch origin ${sessionBranch} failed: ${detail(fetchRes.stderr, fetchRes.code)}` };
    }

    const beforeRes = await git.git(["rev-parse", "HEAD"], { cwd });
    const before = beforeRes.stdout.trim();

    const rebaseRes = await git.git(
      ["-c", `user.name=${PINNED_NAME}`, "-c", `user.email=${PINNED_EMAIL}`, "rebase", `origin/${sessionBranch}`],
      { cwd },
    );
    if (rebaseRes.code === 0) {
      const afterRes = await git.git(["rev-parse", "HEAD"], { cwd });
      const after = afterRes.stdout.trim();
      if (after === before) return { ok: true, result: "up-to-date" };
      const baseRes = await git.git(["rev-parse", `origin/${sessionBranch}`], { cwd });
      return { ok: true, result: after === baseRes.stdout.trim() ? "fast-forward" : "rebased" };
    }

    // Non-zero exit: a real conflict hands off to F4; anything else aborts rather than leaving the
    // worktree mid-rebase for no reason (git refusing to start, e.g. on a dirty tree, included).
    const statusRes = await git.git(["-c", "core.quotePath=false", "status", "--porcelain"], { cwd });
    const conflictedFiles = parseConflictedPaths(statusRes.stdout);
    if (conflictedFiles.length > 0) return { ok: true, result: "conflicted", conflictedFiles };
    await git.git(["rebase", "--abort"], { cwd });
    return { ok: false, error: `git rebase origin/${sessionBranch} failed: ${detail(rebaseRes.stderr, rebaseRes.code)}` };
  }

  async function rebaseAbort(canonicalPath: string): Promise<RebaseAbortResponse> {
    const wt = store.getWorktreeFor(canonicalPath);
    if (!wt) return { ok: false, error: "post is not open" };
    const res = await git.git(["rebase", "--abort"], { cwd: wt.worktreePath });
    if (res.code !== 0) return { ok: false, error: `git rebase --abort failed: ${detail(res.stderr, res.code)}` };
    return { ok: true };
  }

  return { update, rebaseAbort };
}
