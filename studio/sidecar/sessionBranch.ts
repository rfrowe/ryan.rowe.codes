// Extracted from main.ts (which runs main() at import time, so its own logic can't be unit-tested
// directly) so the STUDIO_PRIMARY_BRANCH guard is exercised in isolation, the same way processGuards.ts
// pulled the uncaught-exception backstops out for testability.

import type { GitRunner } from "../shared/seams";

/**
 * The branch the studio launched on, the "primary" branch: the fork base for new post worktrees
 * and the ship target. `STUDIO_PRIMARY_BRANCH` overrides it, but only when it names the branch
 * actually checked out — see `assertSessionBranchOverrideMatchesHead`. A detached HEAD (no branch
 * name) falls back to the short commit sha so it still namespaces cleanly.
 */
export async function resolveSessionBranch(git: GitRunner, repoRoot: string): Promise<string> {
  const override = process.env.STUDIO_PRIMARY_BRANCH?.trim();
  const head = await git.git(["rev-parse", "--abbrev-ref", "HEAD"], { cwd: repoRoot });
  const name = head.stdout.trim();
  const headBranch = head.code === 0 && name && name !== "HEAD" ? name : null;
  if (override) {
    assertSessionBranchOverrideMatchesHead(override, headBranch);
    return override;
  }
  if (headBranch) return headBranch;
  const sha = await git.git(["rev-parse", "--short", "HEAD"], { cwd: repoRoot });
  return sha.stdout.trim() || "HEAD";
}

/**
 * Refuses a `STUDIO_PRIMARY_BRANCH` override that names a branch other than the one checked out:
 * update/pull would rebase onto the wrong base, and ship/save-draft would measure divergence
 * against and push the wrong `<root>`, all silently. A detached HEAD has no branch to mismatch
 * against, so it's exempt and the override applies as given.
 */
export function assertSessionBranchOverrideMatchesHead(override: string, headBranch: string | null): void {
  if (headBranch && override !== headBranch) {
    throw new Error(
      `STUDIO_PRIMARY_BRANCH="${override}" does not match the checked-out branch "${headBranch}". ` +
        "Refusing to start: git flows (update, ship, save-draft) would act against the wrong branch. " +
        "Unset STUDIO_PRIMARY_BRANCH, or check out the branch it names, before starting the studio.",
    );
  }
}
