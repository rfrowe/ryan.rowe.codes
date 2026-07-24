// Pure derivations from the single global turn latch (App's `turn`/`turnStarted`), shared by the
// root-conflict banner and the per-post Update trigger so both read "queued" the same way. Neither a
// dispatched-but-not-yet-content-producing system prompt nor a fresh REST call has any dedicated
// backend signal distinguishing "queued behind another turn" from "just hasn't streamed its first
// token yet"; both render as "queued" here, which is honest either way and needs no wire changes.

import type { RebaseState } from "../../shared/protocol";

export type RootConflictPhase = "queued" | "resolving" | "done";

/** The root-conflict banner's phase. "resolving" once root's own turn is producing content; "queued"
 *  either while root holds the latch but hasn't started, or while another turn holds the latch and
 *  root has a dispatch still waiting behind it (`rootQueued`); otherwise "done", so the banner shows
 *  whatever its last episode left in the transcript rather than a stale spinner. */
export function rootConflictPhase(
  turn: { promptId: string; path: string } | null,
  turnStarted: boolean,
  rootPath: string,
  rootQueued: boolean,
): RootConflictPhase {
  if (rootPath === "") return "done";
  if (turn && turn.path === rootPath) return turnStarted ? "resolving" : "queued";
  if (rootQueued) return "queued";
  return "done";
}

export type UpdateTriggerLabel = "Update" | "Updating…" | "Queued…";

/** The per-post Update trigger's label/disabled state. `phase` is that post's own git.state rebase
 *  phase; `isLiveTurn` and `turnStarted` are `turn`'s relationship to that same post (a rebase
 *  conflict dispatches into the post's own session, so a live/started turn there is that post's F4
 *  resolution); `localPending` is set the instant the trigger fires, before any server round trip. */
export function updateTriggerLabel(
  phase: RebaseState["phase"],
  isLiveTurn: boolean,
  turnStarted: boolean,
  localPending: boolean,
): UpdateTriggerLabel {
  if (phase === "resolving") return isLiveTurn && turnStarted ? "Updating…" : "Queued…";
  if (localPending) return "Updating…";
  return "Update";
}
