// One authoritative source for a repo's common `.git` dir. A linked worktree's own `.git` is
// just a file pointing back here (via a `gitdir`/`commondir` pair), but hand-parsing those
// pointer files would silently watch the wrong directory if git ever changes their format;
// `rev-parse` is the stable, documented way to ask.

import { execFileSync } from "node:child_process";

export function resolveCommonGitDir(repoRoot: string): string {
  return execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
}
