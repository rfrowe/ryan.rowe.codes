// Shared status/diff computation for the ship, save-draft, revert, and delete flows: one worktree
// pathspec-scoping policy (`post` = the blog content tree, `all` = the whole worktree) and one
// untracked-file synthesis routine (`git diff` omits untracked files, so a brand-new post or an
// unrelated new file would otherwise show an empty diff yet still get staged/reverted/destroyed).

import type { GitRunner } from "../shared/seams";

export type DiffScope = "post" | "all";

// The only paths ship/save-draft ever stage; the only paths a `scope: "post"` op ever touches.
export const BLOG_CONTENT_DIR = "src/content/blog";

export function underBlog(p: string): boolean {
  return p === BLOG_CONTENT_DIR || p.startsWith(`${BLOG_CONTENT_DIR}/`);
}

// Each worktree checks out exactly one post, so scoping to the whole blog dir and scoping to that
// post's own path produce the same tracked-file set in practice, but the wider pathspec keeps a
// staged rename's old half in view (a precise pathspec would show "new file" instead of a rename).
export function scopePathspec(scope: DiffScope): string[] {
  return scope === "post" ? ["--", BLOG_CONTENT_DIR] : [];
}

/** Parse `git status --porcelain`/`--short` (v1, same format) into the set of changed paths. */
export function parseStatusPaths(porcelain: string): string[] {
  const paths: string[] = [];
  for (const line of porcelain.split("\n")) {
    if (line.trim().length === 0) continue;
    // Two status columns, a space, then the path.
    let p = line.slice(3);
    // Renames/copies render as "orig -> new"; the new path is what gets staged.
    const arrow = p.indexOf(" -> ");
    if (arrow !== -1) p = p.slice(arrow + 4);
    // With `core.quotePath=false` only control-char paths stay quoted; unwrap those.
    if (p.startsWith('"') && p.endsWith('"')) p = p.slice(1, -1);
    paths.push(p);
  }
  return paths;
}

/** Untracked (`??`) entries of a `git status --short`/`--porcelain` output. */
export function untrackedPaths(statusShort: string): string[] {
  const paths: string[] = [];
  for (const line of statusShort.split("\n")) {
    if (!line.startsWith("??")) continue;
    let p = line.slice(3);
    if (p.startsWith('"') && p.endsWith('"')) p = p.slice(1, -1);
    if (p.length > 0) paths.push(p);
  }
  return paths;
}

/**
 * Count of currently changed paths (tracked or untracked) outside the blog dir, regardless of the
 * requested scope. Powers the "N changes outside this post" nudge toward scope "all" in ship /
 * save-draft: unlike revert, they stage untracked files too, so this counts them.
 */
export async function countOutsideBlog(git: GitRunner, cwd: string): Promise<number> {
  const status = await git.git(["-c", "core.quotePath=false", "status", "--porcelain", "--untracked-files=all"], { cwd });
  return parseStatusPaths(status.stdout).filter((p) => !underBlog(p)).length;
}

/** One synthesized add-diff per untracked path, via `--no-index` (which always exits non-zero
 *  against `/dev/null`; the diff we want is on stdout regardless). */
export async function synthesizeUntrackedDiffs(git: GitRunner, cwd: string, paths: readonly string[]): Promise<string[]> {
  const parts: string[] = [];
  for (const p of paths) {
    const added = await git.git(["diff", "--no-index", "--", "/dev/null", p], { cwd });
    if (added.stdout.trim().length > 0) parts.push(added.stdout);
  }
  return parts;
}

/**
 * Working tree (staged + unstaged) vs HEAD, scoped, with rename pairing (`-M`). `changedFiles`
 * counts only tracked paths. Untracked files have no HEAD state: ship/save-draft still stage and
 * commit them, so they synthesize an add-diff for each and pass `includeUntracked: true`; a revert
 * never touches them at all, so it leaves the default `false` and they're invisible here too.
 */
export async function computeWorkingTreeDiff(
  git: GitRunner,
  cwd: string,
  scope: DiffScope,
  { includeUntracked = false }: { includeUntracked?: boolean } = {},
): Promise<{ status: string; diff: string; changedFiles: number }> {
  const pathspec = scopePathspec(scope);
  // `--untracked-files=all` lists a new subdir's files individually so each can be diffed below;
  // `core.quotePath=false` keeps non-ASCII paths UTF-8, not octal.
  const status = await git.git(
    ["-c", "core.quotePath=false", "status", "--short", "--untracked-files=all", ...pathspec],
    { cwd },
  );
  const unstaged = await git.git(["diff", "-M", ...pathspec], { cwd });
  const staged = await git.git(["diff", "-M", "--staged", ...pathspec], { cwd });
  const untracked = includeUntracked ? await synthesizeUntrackedDiffs(git, cwd, untrackedPaths(status.stdout)) : [];
  const changedFiles = status.stdout.split("\n").filter((l) => l.trim().length > 0 && !l.startsWith("??")).length;
  const diff = [unstaged.stdout, staged.stdout, ...untracked].filter((s) => s.trim().length > 0).join("\n");
  return { status: status.stdout, diff, changedFiles };
}

/**
 * Working tree vs an arbitrary ref, scoped, with rename pairing and untracked files synthesized and
 * counted: unlike {@link computeWorkingTreeDiff}, nothing is left alone here. This backs delete's
 * preview, which must also surface commits `ref` doesn't have yet (deleting the branch loses those
 * too, not just uncommitted edits). `ref` is nullable for when it can't be resolved offline; the
 * status/untracked-file portion still stands, just without the base-relative tracked diff.
 */
export async function computeDiffAgainstRef(
  git: GitRunner,
  cwd: string,
  ref: string | null,
  scope: DiffScope,
): Promise<{ status: string; diff: string; changedFiles: number }> {
  const pathspec = scopePathspec(scope);
  const status = await git.git(
    ["-c", "core.quotePath=false", "status", "--porcelain", "--untracked-files=all", ...pathspec],
    { cwd },
  );
  const statusLines = status.stdout.split("\n").filter((l) => l.trim().length > 0);
  const tracked = ref ? await git.git(["-c", "core.quotePath=false", "diff", "-M", ref, ...pathspec], { cwd }) : null;
  const untracked = await synthesizeUntrackedDiffs(git, cwd, untrackedPaths(status.stdout));
  const diff = [tracked?.stdout ?? "", ...untracked].filter((s) => s.trim().length > 0).join("\n");
  return { status: status.stdout, diff, changedFiles: statusLines.length };
}
