// Ship-as-PR flow. Studio-run, never the agent. Each open post lives in its own git
// worktree already on branch `blog/<slug>` (forked from origin/<default>), so there is no
// branch-from-base / checkout dance: review the diff, stage the post precisely (explicit
// blog paths, never `git add -A`), commit with the pinned identity, push, and open a PR.
// It opens the PR only, never merges, and only behind one non-negotiable gate: explicit
// human confirmation. Every git/gh call runs with cwd = the active post's worktree.

import type { GitRunner } from "../shared/seams";
import type { OpenPrInput, OpenPrResult } from "../shared/mcpTools";
import type { ShipService } from "../shared/services";
import type { ActiveWorktree } from "../state/store";

// The ship flow only ever stages paths under this dir (relative to the worktree root).
const BLOG_CONTENT_DIR = "src/content/blog";

// Commit identity is pinned (CLAUDE.md): every commit is authored by Ryan Rowe,
// independent of whatever local git config happens to be set.
const PINNED_NAME = "Ryan Rowe";
const PINNED_EMAIL = "ryan@rowe.codes";
const PINNED_IDENTITY = `${PINNED_NAME} <${PINNED_EMAIL}>`;

// Network round-trips (push / PR create) get more headroom than local ops.
const NETWORK_TIMEOUT_MS = 120_000;

export interface ShipDeps {
  git: GitRunner;
  /** The active post's worktree (branch/paths); ship runs entirely inside it. */
  getActiveWorktree: () => ActiveWorktree | null;
  /**
   * The active post's frontmatter⇄filename name-sync status. Ship refuses a desynced post (its live
   * URL wouldn't match where it deploys); the author resolves it via Complete-rename or Revert first.
   */
  getActiveNameSync: () => { synced: boolean; expectedStem?: string; currentStem?: string };
}

export function createShipService(deps: ShipDeps): ShipService {
  const { git, getActiveWorktree, getActiveNameSync } = deps;

  /** Read the diff for the ship review UI, from the active post's worktree. */
  async function diff(scope: "post" | "all"): Promise<{ status: string; diff: string }> {
    const wt = getActiveWorktree();
    if (!wt) return { status: "", diff: "" };
    const cwd = wt.worktreePath;
    const pathspec = scope === "post" ? ["--", BLOG_CONTENT_DIR] : [];
    // `--untracked-files=all` lists new files individually (not collapsed dirs) so each
    // can be diffed below; `core.quotePath=false` keeps non-ASCII paths UTF-8, not octal.
    const status = await git.git(
      ["-c", "core.quotePath=false", "status", "--short", "--untracked-files=all", ...pathspec],
      { cwd },
    );
    const unstaged = await git.git(["diff", ...pathspec], { cwd });
    const staged = await git.git(["diff", "--staged", ...pathspec], { cwd });

    const parts = [unstaged.stdout, staged.stdout];
    // `git diff` / `git diff --staged` both omit untracked files, so a brand-new post
    // would show an empty diff in the panel yet still get committed. Synthesize a diff
    // for each untracked file in scope so the reviewer sees it before it's shipped.
    for (const path of untrackedPaths(status.stdout)) {
      if (scope === "post" && !underBlog(path)) continue;
      const added = await git.git(["diff", "--no-index", "--", "/dev/null", path], { cwd });
      // `--no-index` exits non-zero when the files differ (always, vs /dev/null); the
      // diff we want is on stdout regardless, so the exit code is intentionally ignored.
      if (added.stdout.trim().length > 0) parts.push(added.stdout);
    }
    const combined = parts.filter((s) => s.trim().length > 0).join("\n");
    return { status: status.stdout, diff: combined };
  }

  async function openPr(input: OpenPrInput): Promise<OpenPrResult> {
    // Confirmation gate. Never touch git/gh without explicit human sign-off.
    if (!input.confirm) {
      return { ok: false, error: "confirmation required" };
    }
    // The PR branch is the worktree's own branch (blog/<date>_<slug>); `input.branch` from the
    // SPA is ignored; the branch is the post's identity, not a free-text field.
    const wt = getActiveWorktree();
    if (!wt) {
      return { ok: false, error: "no active post to ship" };
    }
    // Refuse a frontmatter⇄filename desync before any git/gh side effect: the post's live URL
    // (from its frontmatter slug/date) wouldn't match where it deploys (its filename/branch). The
    // author resolves it first via the editor banner's Complete-rename or Revert.
    const nameSync = getActiveNameSync();
    if (!nameSync.synced) {
      return {
        ok: false,
        error:
          `refusing to ship: the post's frontmatter (slug/date) doesn't match its filename/branch ` +
          `(frontmatter → "${nameSync.expectedStem}", file → "${nameSync.currentStem}"). ` +
          `Complete the rename or revert the frontmatter first.`,
      };
    }
    const cwd = wt.worktreePath;

    try {
      // Integrity check: the worktree must be on its own isolation branch. This is where the
      // post's edits live; a mismatch means we're not in the worktree we think we are.
      const headRes = await git.git(["rev-parse", "--abbrev-ref", "HEAD"], { cwd });
      if (headRes.code !== 0) {
        return fail("git rev-parse --abbrev-ref HEAD", headRes.stderr, headRes.code);
      }
      const head = headRes.stdout.trim();
      if (head !== wt.branch) {
        return {
          ok: false,
          error: `refusing to ship: the worktree is on "${head}", expected the post's branch "${wt.branch}".`,
        };
      }

      // Derive the staging set and enforce the scope. `core.quotePath=false` keeps non-ASCII
      // paths (e.g. an accented slug) UTF-8 so `git add -- <path>` matches.
      const statusRes = await git.git(["-c", "core.quotePath=false", "status", "--porcelain"], { cwd });
      if (statusRes.code !== 0) {
        return fail("git status", statusRes.stderr, statusRes.code);
      }
      const changed = parseStatusPaths(statusRes.stdout);
      const blogPaths = changed.filter(underBlog);
      const outside = changed.filter((p) => !underBlog(p));

      // `all` still never runs `git add -A`; it refuses when there are changes outside the
      // blog tree that it would otherwise silently drop. `post` simply ignores them.
      if (input.scope === "all" && outside.length > 0) {
        return {
          ok: false,
          error:
            `refusing to ship scope "all": ${outside.length} change(s) outside ${BLOG_CONTENT_DIR} ` +
            `would be excluded (this flow never runs \`git add -A\`): ${outside.join(", ")}. ` +
            `Commit or stash them separately, or use scope "post".`,
        };
      }
      if (blogPaths.length === 0) {
        return { ok: false, error: `no changes under ${BLOG_CONTENT_DIR} to ship` };
      }

      // Default base branch (repo's real default, not an assumption).
      const baseRes = await git.gh(
        ["repo", "view", "--json", "defaultBranchRef", "-q", ".defaultBranchRef.name"],
        { cwd, timeoutMs: NETWORK_TIMEOUT_MS },
      );
      if (baseRes.code !== 0) {
        return fail("gh repo view (resolve default base branch)", baseRes.stderr, baseRes.code);
      }
      const base = baseRes.stdout.trim();
      if (!base) {
        return { ok: false, error: "could not resolve default base branch (empty result from gh repo view)" };
      }

      // Scoped add: explicit blog paths only, never `git add -A` / `git add .`.
      const addRes = await git.git(["add", "--", ...blogPaths], { cwd });
      if (addRes.code !== 0) {
        return fail("git add", addRes.stderr, addRes.code);
      }

      // Commit with the pinned identity via `-c` overrides (does not depend on config).
      const commitArgs = [
        "-c",
        `user.name=${PINNED_NAME}`,
        "-c",
        `user.email=${PINNED_EMAIL}`,
        "commit",
        "-m",
        input.subject,
      ];
      if (input.body.trim().length > 0) {
        commitArgs.push("-m", input.body);
      }
      const commitRes = await git.git(commitArgs, { cwd });
      if (commitRes.code !== 0) {
        return fail("git commit", commitRes.stderr || commitRes.stdout, commitRes.code);
      }

      // Assert the committed identity before anything leaves the machine.
      const authorRes = await git.git(["log", "-1", "--format=%an <%ae>"], { cwd });
      const author = authorRes.stdout.trim();
      if (author !== PINNED_IDENTITY) {
        return {
          ok: false,
          error:
            `identity assertion failed: HEAD is authored by "${author}", expected "${PINNED_IDENTITY}". ` +
            `The commit was NOT pushed.`,
        };
      }

      // Scope assertion: the branch's diff vs the base must contain only the post. The worktree
      // was forked from origin/<base>, so this range is exactly our post commit; it catches a
      // worktree that somehow carries unrelated commits before anything is pushed.
      const rangeRes = await git.git(
        ["-c", "core.quotePath=false", "diff", "--name-only", `origin/${base}...HEAD`],
        { cwd },
      );
      if (rangeRes.code !== 0) {
        return fail(`git diff origin/${base}...HEAD`, rangeRes.stderr, rangeRes.code);
      }
      const prPaths = rangeRes.stdout
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const prOutside = prPaths.filter((p) => !underBlog(p));
      if (prOutside.length > 0) {
        return {
          ok: false,
          error:
            `refusing to push: the branch diff vs ${base} includes ${prOutside.length} path(s) outside ` +
            `${BLOG_CONTENT_DIR}: ${prOutside.join(", ")}. The branch must contain only the post. The commit ` +
            `exists locally but was NOT pushed.`,
        };
      }

      // Push the worktree's own branch as-is: the PR branch is `blog/<date>_<slug>` (blog-prefixed
      // and slug-based, date-qualified so two posts sharing a slug across dates don't collide on one
      // branch). Partial failure here = committed locally, nothing on the remote yet.
      const remoteBranch = wt.branch;
      try {
        const pushRes = await git.git(["push", "-u", "origin", remoteBranch], { cwd, timeoutMs: NETWORK_TIMEOUT_MS });
        if (pushRes.code !== 0) {
          return { ok: false, error: pushFailedMessage(remoteBranch, detail(pushRes.stderr, pushRes.code)) };
        }
      } catch (e) {
        return { ok: false, error: pushFailedMessage(remoteBranch, errMsg(e)) };
      }

      // Create the PR. Partial failure here = branch pushed, but no PR yet.
      try {
        const prRes = await git.gh(
          ["pr", "create", "--base", base, "--head", remoteBranch, "--title", input.subject, "--body", input.body],
          { cwd, timeoutMs: NETWORK_TIMEOUT_MS },
        );
        if (prRes.code !== 0) {
          return { ok: false, error: prFailedMessage(remoteBranch, detail(prRes.stderr, prRes.code)) };
        }
        const prUrl = extractUrl(prRes.stdout);
        if (!prUrl) {
          return {
            ok: false,
            error: `gh pr create returned no PR URL (branch "${remoteBranch}" is pushed; verify with \`gh pr view\`)`,
          };
        }
        return { ok: true, prUrl };
      } catch (e) {
        return { ok: false, error: prFailedMessage(remoteBranch, errMsg(e)) };
      }
    } catch (e) {
      return { ok: false, error: `ship failed: ${errMsg(e)}` };
    }
  }

  return { diff, openPr };
}

// ---- helpers ----

function underBlog(p: string): boolean {
  return p === BLOG_CONTENT_DIR || p.startsWith(`${BLOG_CONTENT_DIR}/`);
}

/** Parse `git status --porcelain` (v1) into the set of changed paths. */
function parseStatusPaths(porcelain: string): string[] {
  const paths: string[] = [];
  for (const line of porcelain.split("\n")) {
    if (line.trim().length === 0) continue;
    // Two status columns, a space, then the path.
    let p = line.slice(3);
    // Renames/copies render as "orig -> new"; the new path is what gets staged.
    const arrow = p.indexOf(" -> ");
    if (arrow !== -1) p = p.slice(arrow + 4);
    // The caller passes `-c core.quotePath=false`, so non-ASCII paths arrive UTF-8 and
    // unquoted; only genuinely unusual paths (control chars) stay quoted. Unwrap that.
    if (p.startsWith('"') && p.endsWith('"')) p = p.slice(1, -1);
    paths.push(p);
  }
  return paths;
}

/** Untracked (`??`) entries of a `git status --short` output. */
function untrackedPaths(statusShort: string): string[] {
  const paths: string[] = [];
  for (const line of statusShort.split("\n")) {
    if (!line.startsWith("??")) continue;
    let p = line.slice(3);
    if (p.startsWith('"') && p.endsWith('"')) p = p.slice(1, -1);
    if (p.length > 0) paths.push(p);
  }
  return paths;
}

function detail(stderr: string, code: number): string {
  return stderr.trim() || `exit ${code}`;
}

function fail(step: string, stderr: string, code: number): OpenPrResult {
  return { ok: false, error: `${step} failed: ${detail(stderr, code)}` };
}

function pushFailedMessage(branch: string, why: string): string {
  return (
    `git push failed: ${why}. The commit is committed locally but was not pushed; ` +
    `re-run ship or push manually from the worktree.`
  );
}

function prFailedMessage(branch: string, why: string): string {
  return (
    `gh pr create failed: ${why}. Branch "${branch}" is pushed but no PR was created; ` +
    `create it manually with \`gh pr create --head ${branch}\`.`
  );
}

function extractUrl(s: string): string | null {
  const m = s.match(/https?:\/\/\S+/);
  return m ? m[0] : null;
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
