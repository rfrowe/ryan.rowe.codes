// F4: hands a rebase conflict to the post's own agent session instead of a manual merge-conflict UI.
// F3 (gitOps.update) detects the conflict and calls onConflict; this service composes the prompt,
// dispatches it, and finishes the rebase once the agent's turn ends and the tree is clean. The agent
// only edits and `git add`s; the studio owns `rebase --continue`, per the CLAUDE.md rule that git
// mutations here are studio-run, never the agent.

import type { GitRunner } from "../shared/seams";
import type { ConflictResolverService } from "../shared/services";
import type { ServerMessage } from "../shared/protocol";
import { PINNED_EMAIL, PINNED_NAME, parseConflictedPaths } from "./gitOps";
import { postStem } from "../shared/slug";

export interface ConflictResolverDeps {
  git: GitRunner;
  /** The branch every post rebases onto; named in the composed prompt. */
  sessionBranch: string;
  getWorktreeFor: (canonicalPath: string) => { worktreePath: string } | null;
  dispatchSystemPrompt: (input: { path: string; text: string }) => Promise<{ promptId: string; dispatched: boolean }>;
  setResolving: (stem: string, resolving: boolean) => void;
  publish: (msg: ServerMessage) => void;
}

interface Episode {
  path: string;
  stem: string;
  attempts: number;
}

function composePrompt(sessionBranch: string, conflictedFiles: string[], retry: boolean): string {
  const files = conflictedFiles.join(", ");
  const intro = retry
    ? `The rebase onto origin/${sessionBranch} is still conflicted in: ${files}.`
    : `A rebase of this post's branch onto origin/${sessionBranch} hit conflicts in: ${files}.`;
  return [
    intro,
    "Resolve each conflict in the working tree, reconciling the post's intent with the incoming base changes.",
    "Stage resolved files with `git add`.",
    "Do not commit and do not run `git rebase --continue`: the studio finishes the rebase once conflicts are cleared.",
    "When done, briefly summarize what you reconciled.",
  ].join(" ");
}

export function createConflictResolver(deps: ConflictResolverDeps): ConflictResolverService {
  const { git, sessionBranch, getWorktreeFor, dispatchSystemPrompt, setResolving, publish } = deps;
  // promptId to the episode it belongs to; onTurnEnd is a no-op for any promptId not in here.
  const episodes = new Map<string, Episode>();

  function dispatch(path: string, stem: string, conflictedFiles: string[], attempts: number): void {
    setResolving(stem, true);
    const text = composePrompt(sessionBranch, conflictedFiles, attempts > 0);
    dispatchSystemPrompt({ path, text })
      .then(({ promptId, dispatched }) => {
        // A turn that never started never reaches onTurnEnd either, so this .then is the only place
        // that ever hears about it: clear resolving here instead of registering a dead episode and
        // publishing a bubble for a conversation that's never going to happen.
        if (!dispatched) {
          setResolving(stem, false);
          return;
        }
        episodes.set(promptId, { path, stem, attempts });
        publish({ type: "chat.injected", promptId, path, text, kind: "system" });
      })
      .catch(() => {
        // dispatchSystemPrompt's contract always resolves (a dispatch failure reports via the
        // "error" ServerMessage, not a rejection), but don't leave the post wedged if it ever does.
        setResolving(stem, false);
      });
  }

  function onConflict(canonicalPath: string, conflictedFiles: string[]): void {
    dispatch(canonicalPath, postStem(canonicalPath), conflictedFiles, 0);
  }

  async function handleTurnEnd(promptId: string): Promise<void> {
    const episode = episodes.get(promptId);
    if (!episode) return; // not a dispatch this service made.
    episodes.delete(promptId);
    const { path, stem, attempts } = episode;
    // Clear before doing anything else: whatever happens below, this post can never wedge "resolving".
    setResolving(stem, false);

    const wt = getWorktreeFor(path);
    if (!wt) return; // the post closed mid-turn; its worktree may already be gone.
    const cwd = wt.worktreePath;

    try {
      let conflicted = parseConflictedPaths(
        (await git.git(["-c", "core.quotePath=false", "status", "--porcelain"], { cwd })).stdout,
      );

      if (conflicted.length === 0) {
        // core.editor=true stands in for GIT_EDITOR=true: --continue must never block on an interactive
        // commit-message editor with no terminal attached.
        const continueRes = await git.git(
          [
            "-c",
            "core.editor=true",
            "-c",
            `user.name=${PINNED_NAME}`,
            "-c",
            `user.email=${PINNED_EMAIL}`,
            "rebase",
            "--continue",
          ],
          { cwd },
        );
        if (continueRes.code === 0) return; // done; the ref move reaches git.state via the doorbell.
        // A multi-commit rebase can apply cleanly here and then hit a conflict on the *next* commit;
        // treat that exactly like the agent's own edits not having fully resolved things.
        conflicted = parseConflictedPaths(
          (await git.git(["-c", "core.quotePath=false", "status", "--porcelain"], { cwd })).stdout,
        );
        if (conflicted.length === 0) return; // --continue failed for some other reason; nothing more to hand the agent.
      }

      if (attempts < 1) {
        dispatch(path, stem, conflicted, attempts + 1);
        return;
      }
      // Fall back: rebase.phase reports "conflicted" again (the marker is still there, just no longer
      // resolving); the human's way out from here is "Abort update" (F6).
    } catch (err) {
      // getWorktreeFor is a synchronous map read; deletePost can remove this worktree out from under
      // the git calls above (not gated on an in-flight turn), rejecting rather than just failing.
      // resolving is already cleared, so fall back the same as an ordinary --continue failure.
      console.error(`[conflictResolver] handleTurnEnd failed for ${stem}:`, err instanceof Error ? err.message : err);
    }
  }

  return { onConflict, onTurnEnd: handleTurnEnd };
}
