// Shared status/diff computation for the ship, save-draft, revert, and delete flows: one worktree
// pathspec-scoping policy (`post` = the blog content tree, `all` = the whole worktree) and one
// untracked-file synthesis routine (`git diff` omits untracked files, so a brand-new post or an
// unrelated new file would otherwise show an empty diff yet still get staged/reverted/destroyed).

import type { GitRunner } from "../shared/seams";
import type { PushFailure, PushFailureReason } from "../shared/protocol";

export type DiffScope = "post" | "all";

// Network round-trips (the fetch a stale/rejected push preview needs) get more headroom than local ops.
const NETWORK_TIMEOUT_MS = 120_000;

// The only paths ship/save-draft ever stage; the only paths a `scope: "post"` op ever touches.
export const BLOG_CONTENT_DIR = "src/content/blog";

export function underBlog(p: string): boolean {
  return p === BLOG_CONTENT_DIR || p.startsWith(`${BLOG_CONTENT_DIR}/`);
}

/** Whether `refs/remotes/origin/<branch>` exists. Offline-safe: reads the remote-tracking ref on disk,
 *  never fetches, so a deleted-upstream ref can still read as present until the next fetch. */
export async function originRefExists(git: GitRunner, cwd: string, branch: string): Promise<boolean> {
  return (await git.git(["rev-parse", "--verify", "--quiet", `refs/remotes/origin/${branch}`], { cwd })).code === 0;
}

/**
 * How far the worktree at `cwd` has diverged from `origin/<baseBranch>` (the ref it forked from and
 * ship targets): `behind` = commits on the origin base this HEAD lacks (origin moved on; fetch then
 * rebase), `ahead` = this HEAD's own commits. `{onOrigin:false,0,0}` when the origin ref is absent,
 * so nothing ever reads as behind a base that isn't there. Offline-safe: reads on-disk refs, never
 * fetches, so the numbers are as of the last fetch/push.
 */
export async function computeDivergence(
  git: GitRunner,
  cwd: string,
  baseBranch: string,
): Promise<{ onOrigin: boolean; ahead: number; behind: number }> {
  if (!(await originRefExists(git, cwd, baseBranch))) return { onOrigin: false, ahead: 0, behind: 0 };
  // `--left-right --count` prints "<left>\t<right>": left (the origin side) is behind, right (HEAD) is ahead.
  const res = await git.git(["rev-list", "--left-right", "--count", `origin/${baseBranch}...HEAD`], { cwd });
  const [behind, ahead] = res.stdout.trim().split(/\s+/).map((n) => Number.parseInt(n, 10) || 0);
  return { onOrigin: true, ahead: ahead ?? 0, behind: behind ?? 0 };
}

// Each worktree checks out exactly one post, so scoping to the whole blog dir and scoping to that
// post's own path produce the same tracked-file set in practice, but the wider pathspec keeps a
// staged rename's old half in view (a precise pathspec would show "new file" instead of a rename).
export function scopePathspec(scope: DiffScope): string[] {
  return scope === "post" ? ["--", BLOG_CONTENT_DIR] : [];
}

/**
 * The paths ship/save-draft stage for a scope, given the worktree's changed set: `all` stages the
 * whole worktree (a post can carry supporting changes, e.g. a new rehype plugin or shared
 * component), `post` stages only the blog tree. The staging counterpart to {@link scopePathspec}'s
 * diff scoping, so what gets committed matches what the review diff showed. Callers pass the result
 * to `git add -- <paths>`; the flow never runs `git add -A`.
 */
export function stagePathsForScope(changed: readonly string[], scope: DiffScope): string[] {
  return scope === "all" ? [...changed] : changed.filter(underBlog);
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
 *
 * Diffs from `ref`'s merge-base with HEAD, not `ref` directly: `ref` keeps moving (e.g. the primary
 * branch advancing after this branch forked from it), and a direct diff would surface that drift as
 * if this branch had introduced it, even with nothing of its own to show.
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
  const base = ref ? await resolveMergeBase(git, cwd, ref) : null;
  const tracked = base ? await git.git(["-c", "core.quotePath=false", "diff", "-M", base, ...pathspec], { cwd }) : null;
  const untracked = await synthesizeUntrackedDiffs(git, cwd, untrackedPaths(status.stdout));
  const diff = [tracked?.stdout ?? "", ...untracked].filter((s) => s.trim().length > 0).join("\n");
  return { status: status.stdout, diff, changedFiles: statusLines.length };
}

// A failed merge-base (or one that somehow prints nothing) is treated the same as an unresolvable
// ref, not as license to fall back to diffing `ref` directly and reintroducing the drift this guards
// against.
async function resolveMergeBase(git: GitRunner, cwd: string, ref: string): Promise<string | null> {
  const res = await git.git(["merge-base", ref, "HEAD"], { cwd });
  const sha = res.stdout.trim();
  return res.code === 0 && sha.length > 0 ? sha : null;
}

/** Classify a rejected `git push`'s stderr, so ship/save-draft's escalation ladder can tell a
 *  divergence force can fix from one it can't. "stale info" (a `--force-with-lease` rejection) is
 *  checked before the generic reject patterns, since its line also contains "rejected". */
export function classifyPushFailure(stderr: string): PushFailureReason {
  const s = stderr.toLowerCase();
  if (s.includes("stale info")) return "stale-lease";
  if (s.includes("non-fast-forward") || s.includes("fetch first") || s.includes("rejected")) return "non-ff";
  if (s.includes("authentication failed") || s.includes("permission") || s.includes("could not read username")) {
    return "auth";
  }
  if (s.includes("could not resolve host") || s.includes("connection timed out") || s.includes("connection refused") || s.includes("could not read from remote repository")) {
    return "network";
  }
  return "other";
}

/** What a force-push of `branch` would discard: commits reachable from `origin/<branch>` but not
 *  HEAD, and their accumulated diff (`HEAD...origin/<branch>`, so drift already on the base before
 *  this branch forked doesn't show up as loss). Empty when the remote-tracking ref is absent. */
export async function computeForcePushLossPreview(
  git: GitRunner,
  cwd: string,
  branch: string,
): Promise<{ remoteOnlyCommits: string[]; diff: string }> {
  if (!(await originRefExists(git, cwd, branch))) return { remoteOnlyCommits: [], diff: "" };
  const logRes = await git.git(["log", "--format=%h %s", `HEAD..origin/${branch}`], { cwd });
  const remoteOnlyCommits = logRes.stdout.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const diffRes = await git.git(["-c", "core.quotePath=false", "diff", "-M", `HEAD...origin/${branch}`], { cwd });
  return { remoteOnlyCommits, diff: diffRes.stdout };
}

/**
 * Classifies a rejected push and, for `non-ff`/`stale-lease` (the only reasons a force can fix),
 * fetches the branch and previews what forcing would discard. A rejected push never updates the
 * local remote-tracking ref itself, so without this fetch the preview (and a stale-lease's own
 * escalation to raw `--force`) would show the remote as it stood before the push that just failed,
 * not as it actually stands now. `auth`/`network`/`other` come back with an empty preview: forcing
 * past them wouldn't help, so there's nothing to discard.
 */
export async function buildPushFailure(git: GitRunner, cwd: string, branch: string, stderr: string): Promise<PushFailure> {
  const reason = classifyPushFailure(stderr);
  if (reason !== "non-ff" && reason !== "stale-lease") {
    return { reason, remoteOnlyCommits: [], diff: "" };
  }
  await git.git(["fetch", "origin", branch], { cwd, timeoutMs: NETWORK_TIMEOUT_MS });
  const { remoteOnlyCommits, diff } = await computeForcePushLossPreview(git, cwd, branch);
  return { reason, remoteOnlyCommits, diff };
}
