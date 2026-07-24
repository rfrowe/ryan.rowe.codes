// F4 for the studio root: hands a root rebase conflict to a dedicated agent session instead of
// aborting outright. gitStatus.ts's updateRoot detects the conflict and calls onConflict; this
// service composes the prompt, dispatches it to the root's session, and finishes the rebase once the
// agent's turn ends and the tree is clean. The agent only edits and `git add`s; the studio owns
// `rebase --continue`, per the CLAUDE.md rule that git mutations here are studio-run, never the agent.

import type { GitRunner } from "../shared/seams";
import type { RootConflictResolverService } from "../shared/services";
import type { ServerMessage } from "../shared/protocol";
import { PINNED_EMAIL, PINNED_NAME, parseConflictedPaths } from "./gitOps";

export interface RootConflictResolverDeps {
  git: GitRunner;
  /** The root worktree's path: both the dispatch target and the rebase's cwd. */
  rootWorktreePath: string;
  /** The branch the root rebases onto; named in the composed prompt. */
  sessionBranch: string;
  dispatchSystemPrompt: (input: { path: string; text: string }) => Promise<{ promptId: string; dispatched: boolean }>;
  setResolving: (resolving: boolean) => void;
  publish: (msg: ServerMessage) => void;
}

function composePrompt(sessionBranch: string, conflictedFiles: string[], retry: boolean): string {
  const files = conflictedFiles.join(", ");
  const intro = retry
    ? `The root's rebase onto origin/${sessionBranch} is still conflicted in: ${files}.`
    : `A rebase of the studio root onto origin/${sessionBranch} hit conflicts in: ${files}.`;
  return [
    intro,
    "Resolve each conflict in the working tree, reconciling the root's local commits with the incoming base changes.",
    "Stage resolved files with `git add`.",
    "Do not commit and do not run `git rebase --continue`: the studio finishes the rebase once conflicts are cleared.",
    "When done, briefly summarize what you reconciled.",
  ].join(" ");
}

export function createRootConflictResolver(deps: RootConflictResolverDeps): RootConflictResolverService {
  const { git, rootWorktreePath, sessionBranch, dispatchSystemPrompt, setResolving, publish } = deps;
  // promptId to attempt count; onTurnEnd is a no-op for any promptId not in here. At most one entry:
  // the root has a single session, not a per-post map.
  const episodes = new Map<string, { attempts: number }>();

  function dispatch(conflictedFiles: string[], attempts: number): void {
    setResolving(true);
    const text = composePrompt(sessionBranch, conflictedFiles, attempts > 0);
    dispatchSystemPrompt({ path: rootWorktreePath, text })
      .then(({ promptId, dispatched }) => {
        // A turn that never started never reaches onTurnEnd either, so this .then is the only place
        // that ever hears about it: clear resolving here instead of registering a dead episode and
        // publishing a bubble for a conversation that's never going to happen.
        if (!dispatched) {
          setResolving(false);
          return;
        }
        episodes.set(promptId, { attempts });
        publish({ type: "chat.injected", promptId, path: rootWorktreePath, text, kind: "system" });
      })
      .catch(() => {
        // dispatchSystemPrompt's contract always resolves (a dispatch failure reports via the
        // "error" ServerMessage, not a rejection), but don't leave the root wedged if it ever does.
        setResolving(false);
      });
  }

  function onConflict(conflictedFiles: string[]): void {
    dispatch(conflictedFiles, 0);
  }

  async function handleTurnEnd(promptId: string): Promise<void> {
    const episode = episodes.get(promptId);
    if (!episode) return; // not a dispatch this service made.
    episodes.delete(promptId);
    const { attempts } = episode;
    // Clear before doing anything else: whatever happens below, the root can never wedge "resolving".
    setResolving(false);

    const cwd = rootWorktreePath;
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
        dispatch(conflicted, attempts + 1);
        return;
      }
      // Fall back: rebase reports conflicted again (the marker is still there, just no longer
      // resolving); the human's way out from here is "Abort update" (F6).
    } catch (err) {
      // The root worktree can't be removed out from under this the way a post's can, but a git call
      // can still reject (a transient spawn failure). resolving is already cleared, so fall back the
      // same as an ordinary --continue failure.
      console.error("[rootConflictResolver] handleTurnEnd failed:", err instanceof Error ? err.message : err);
    }
  }

  return { onConflict, onTurnEnd: handleTurnEnd };
}
