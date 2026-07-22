// Ship-as-PR flow. Studio-run, never the agent. Each open post already lives in its own git
// worktree on its isolation branch (forked from the local session/"primary" branch), so there's no
// checkout dance: stage the post precisely (never `git add -A`), commit with the pinned identity,
// push, open a PR against the session branch. Opens the PR only, never merges, and only behind an
// explicit human confirm. Every git/gh call runs with cwd = the active post's worktree.

import type { GitRunner } from "../shared/seams";
import type { OpenPrInput, OpenPrResult } from "../shared/mcpTools";
import type { SaveDraftRequest, SaveDraftResponse } from "../shared/protocol";
import type { ShipService } from "../shared/services";
import type { ActiveWorktree } from "../state/store";
import { BLOG_CONTENT_DIR, computeDiffAgainstRef, computeWorkingTreeDiff, countOutsideBlog, originRefExists, parseStatusPaths, stagePathsForScope, underBlog } from "./diffService";
import { errorMessage } from "./errorMessage";

// Pinned commit identity (CLAUDE.md), independent of local git config.
const PINNED_NAME = "Ryan Rowe";
const PINNED_EMAIL = "ryan@rowe.codes";
const PINNED_IDENTITY = `${PINNED_NAME} <${PINNED_EMAIL}>`;

// Network round-trips (push / PR create) get more headroom than local ops.
const NETWORK_TIMEOUT_MS = 120_000;

export interface ShipDeps {
  git: GitRunner;
  /**
   * The "primary" branch the studio was launched on. Ship targets it (`gh pr create --base`) and
   * measures the post branch against `origin/<sessionBranch>`; it must exist on origin to ship.
   */
  sessionBranch: string;
  /** The active post's worktree (branch/paths); ship runs entirely inside it. */
  getActiveWorktree: () => ActiveWorktree | null;
  /** The worktree of an open post by canonical path (not necessarily active); save-draft targets it,
   *  so it can persist any open tab, not just the focused one. Null when the post isn't open. */
  getWorktreeFor: (canonicalPath: string) => ActiveWorktree | null;
  /** Frontmatter/filename name-sync. Ship refuses a desynced post (its live URL wouldn't match
   *  where it deploys); the author resolves it via Complete-rename or Revert first. */
  getActiveNameSync: () => { synced: boolean; expectedStem?: string; currentStem?: string };
}

export function createShipService(deps: ShipDeps): ShipService {
  const { git, sessionBranch, getActiveWorktree, getWorktreeFor, getActiveNameSync } = deps;

  /** Read the diff for the ship / save-draft review UI. Defaults to the active post's worktree; a
   *  `path` targets a specific open post (the save-draft panel can review a non-focused tab).
   *  `outsideCount` is independent of `scope`: it's what a "post"-scoped review would leave behind,
   *  powering the nudge toward "all" without ever forcing it.
   *
   *  Ship (no `path`; it only ever reviews the active post) previews against the PR's actual base, so
   *  an adopted draft's already-committed history shows up alongside anything uncommitted since (not
   *  just the latter, which is all a HEAD-relative diff would catch). Save-draft (always called with
   *  an explicit `path`) has no such base, since it only ever pushes its own branch, so it stays
   *  HEAD-relative: "nothing uncommitted" there correctly means nothing new to push. */
  async function diff(scope: "post" | "all", path?: string): Promise<{ status: string; diff: string; outsideCount: number }> {
    const wt = path ? getWorktreeFor(path) : getActiveWorktree();
    if (!wt) return { status: "", diff: "", outsideCount: 0 };
    const cwd = wt.worktreePath;
    // prBase(cwd) is chained with .then rather than awaited inline, so its git round-trip runs
    // concurrently with countOutsideBlog's instead of blocking Promise.all from even starting it.
    const [{ status, diff }, outsideCount] = await Promise.all([
      path
        ? computeWorkingTreeDiff(git, cwd, scope, { includeUntracked: true })
        : prBase(cwd).then((base) => computeDiffAgainstRef(git, cwd, base, scope)),
      countOutsideBlog(git, cwd),
    ]);
    return { status, diff, outsideCount };
  }

  /** Whether `refs/remotes/origin/<sessionBranch>` exists (offline-safe: reads the remote-tracking
   *  ref on disk, never fetches). Backs both {@link prBase}'s preview fallback and {@link openPr}'s
   *  hard gate, so the two can't drift into checking the ref two different ways. */
  async function sessionBranchOnOrigin(cwd: string): Promise<boolean> {
    return originRefExists(git, cwd, sessionBranch);
  }

  /** The ref ship's PR is actually opened against: `origin/<sessionBranch>` once pushed there, else
   *  the local session branch as a preview fallback before it is. */
  async function prBase(cwd: string): Promise<string> {
    return (await sessionBranchOnOrigin(cwd)) ? `origin/${sessionBranch}` : sessionBranch;
  }

  async function openPr(input: OpenPrInput): Promise<OpenPrResult> {
    // Confirmation gate. Never touch git/gh without explicit human sign-off.
    if (!input.confirm) {
      return { ok: false, error: "confirmation required" };
    }
    // The PR branch is the worktree's own branch; `input.branch` from the SPA is ignored.
    const wt = getActiveWorktree();
    if (!wt) {
      return { ok: false, error: "no active post to ship" };
    }
    // Refuse a frontmatter/filename desync before any side effect: the post's live URL wouldn't
    // match where it deploys. The author resolves it first via Complete-rename or Revert.
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
      // The worktree must be on its own isolation branch; a mismatch means we're not where we think.
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

      // Derive the staging set. `core.quotePath=false` keeps non-ASCII paths UTF-8 so
      // `git add -- <path>` matches. `all` ships the whole worktree (a post may need supporting
      // changes, e.g. a rehype plugin or shared component); `post` ships only the blog tree.
      const statusRes = await git.git(["-c", "core.quotePath=false", "status", "--porcelain"], { cwd });
      if (statusRes.code !== 0) {
        return fail("git status", statusRes.stderr, statusRes.code);
      }
      const stagePaths = stagePathsForScope(parseStatusPaths(statusRes.stdout), input.scope);
      if (stagePaths.length === 0) {
        return {
          ok: false,
          error: input.scope === "all" ? "no changes to ship" : `no changes under ${BLOG_CONTENT_DIR} to ship`,
        };
      }

      // Ship targets the session/"primary" branch, not the repo default. It must exist on origin
      // (`gh pr create --base` resolves the base on the remote), so refuse early (offline-safe: reads
      // the remote-tracking ref, never fetches) with an actionable message instead of a raw gh error.
      const base = sessionBranch;
      if (!(await sessionBranchOnOrigin(cwd))) {
        return {
          ok: false,
          error:
            `refusing to ship: the primary branch "${base}" isn't on origin yet, so a PR can't target it. ` +
            `Push it first (git push -u origin ${base}) or run the studio on the default branch.`,
        };
      }

      // Scoped add: explicit paths only, never `git add -A` / `git add .`.
      const addRes = await git.git(["add", "--", ...stagePaths], { cwd });
      if (addRes.code !== 0) {
        return fail("git add", addRes.stderr, addRes.code);
      }

      // Commit with the pinned identity via `-c` overrides.
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

      // A post-scoped ship's branch diff vs base must contain only the post; catches a worktree that
      // somehow carries unrelated commits before anything is pushed. An `all` ship deliberately
      // carries out-of-post changes, so this guard doesn't apply to it.
      if (input.scope === "post") {
        const rangeRes = await git.git(
          ["-c", "core.quotePath=false", "diff", "--name-only", `origin/${base}...HEAD`],
          { cwd },
        );
        if (rangeRes.code !== 0) {
          return fail(`git diff origin/${base}...HEAD`, rangeRes.stderr, rangeRes.code);
        }
        const prOutside = rangeRes.stdout
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0 && !underBlog(l));
        if (prOutside.length > 0) {
          return {
            ok: false,
            error:
              `refusing to push: the branch diff vs ${base} includes ${prOutside.length} path(s) outside ` +
              `${BLOG_CONTENT_DIR}: ${prOutside.join(", ")}. The branch must contain only the post. The commit ` +
              `exists locally but was NOT pushed.`,
          };
        }
      }

      // Push the worktree's own branch as-is. Partial failure here = committed locally, nothing on
      // the remote yet.
      const remoteBranch = wt.branch;
      try {
        const pushRes = await git.git(["push", "-u", "origin", remoteBranch], { cwd, timeoutMs: NETWORK_TIMEOUT_MS });
        if (pushRes.code !== 0) {
          return { ok: false, error: pushFailedMessage(detail(pushRes.stderr, pushRes.code)) };
        }
      } catch (e) {
        return { ok: false, error: pushFailedMessage(errorMessage(e)) };
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
        return { ok: false, error: prFailedMessage(remoteBranch, errorMessage(e)) };
      }
    } catch (e) {
      return { ok: false, error: `ship failed: ${errorMessage(e)}` };
    }
  }

  /**
   * Persist a draft to origin without opening a PR: commit the post (pinned identity) and push its
   * `blog/<stem>` branch, so it can be resumed later (adopted as a remote draft from ⌘P, or checked
   * out elsewhere). Non-destructive, and more permissive than ship: it doesn't gate on a
   * frontmatter/filename desync, since a draft may legitimately be saved mid-rename (it isn't
   * deploying). Runs entirely inside the target post's worktree.
   */
  async function saveDraft(input: SaveDraftRequest): Promise<SaveDraftResponse> {
    // Confirmation gate. Never touch git without explicit sign-off (mirrors ship).
    if (!input.confirm) {
      return { ok: false, error: "confirmation required" };
    }
    // Any open post (defaults to the active one), so the tab menu / delete flow can save a
    // non-focused tab too.
    const wt = input.path ? getWorktreeFor(input.path) : getActiveWorktree();
    if (!wt) {
      return { ok: false, error: "no post to save" };
    }
    const cwd = wt.worktreePath;

    try {
      // The worktree must be on the post's own branch; a mismatch means we're not where we think.
      const headRes = await git.git(["rev-parse", "--abbrev-ref", "HEAD"], { cwd });
      if (headRes.code !== 0) {
        return fail("git rev-parse --abbrev-ref HEAD", headRes.stderr, headRes.code);
      }
      const head = headRes.stdout.trim();
      if (head !== wt.branch) {
        return {
          ok: false,
          error: `refusing to save: the worktree is on "${head}", expected the post's branch "${wt.branch}".`,
        };
      }

      // Stage precisely, never `git add -A`; same scope policy as ship (`all` = the whole worktree,
      // `post` = only the blog tree).
      const statusRes = await git.git(["-c", "core.quotePath=false", "status", "--porcelain"], { cwd });
      if (statusRes.code !== 0) {
        return fail("git status", statusRes.stderr, statusRes.code);
      }
      const stagePaths = stagePathsForScope(parseStatusPaths(statusRes.stdout), input.scope);

      let committed = false;
      if (stagePaths.length > 0) {
        const addRes = await git.git(["add", "--", ...stagePaths], { cwd });
        if (addRes.code !== 0) {
          return fail("git add", addRes.stderr, addRes.code);
        }
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
        committed = true;

        // Assert the committed identity before anything leaves the machine (mirrors ship).
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
      }

      // Anything to push? The branch is worth pushing when it has no remote counterpart yet, or when
      // it carries commits `origin/<branch>` lacks (the fresh commit above, or unpushed history).
      // Offline-safe: reads the remote-tracking ref on disk, never fetches.
      const hasRemote = await originRefExists(git, cwd, wt.branch);
      let ahead = 0;
      if (hasRemote) {
        const counted = await git.git(["rev-list", "--count", `origin/${wt.branch}..HEAD`], { cwd });
        if (counted.code === 0) ahead = Number.parseInt(counted.stdout.trim() || "0", 10) || 0;
      }
      if (!committed && hasRemote && ahead === 0) {
        // The local branch already matches its remote; nothing to save.
        return { ok: true, branch: wt.branch, committed: false, pushed: false, noop: true };
      }

      // Push the post's own branch as-is (fast-forward only; a rejected non-fast-forward surfaces
      // with a recovery hint rather than force-pushing). Partial failure = committed locally, nothing
      // new on the remote yet.
      try {
        const pushRes = await git.git(["push", "-u", "origin", wt.branch], { cwd, timeoutMs: NETWORK_TIMEOUT_MS });
        if (pushRes.code !== 0) {
          return { ok: false, error: savePushFailedMessage(committed, detail(pushRes.stderr, pushRes.code)) };
        }
      } catch (e) {
        return { ok: false, error: savePushFailedMessage(committed, errorMessage(e)) };
      }
      return { ok: true, branch: wt.branch, committed, pushed: true, noop: false };
    } catch (e) {
      return { ok: false, error: `save draft failed: ${errorMessage(e)}` };
    }
  }

  return { diff, openPr, saveDraft };
}

// ---- helpers ----

function detail(stderr: string, code: number): string {
  return stderr.trim() || `exit ${code}`;
}

// The failure shape common to OpenPrResult and SaveDraftResponse, so `fail` serves both flows.
function fail(step: string, stderr: string, code: number): { ok: false; error: string } {
  return { ok: false, error: `${step} failed: ${detail(stderr, code)}` };
}

function pushFailedMessage(why: string): string {
  return (
    `git push failed: ${why}. The commit is committed locally but was not pushed; ` +
    `re-run ship or push manually from the worktree.`
  );
}

function savePushFailedMessage(committed: boolean, why: string): string {
  const state = committed
    ? "Your changes are committed locally but were not pushed"
    : "Nothing left the machine";
  return `git push failed: ${why}. ${state}; re-run Save to remote or push manually from the worktree.`;
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

