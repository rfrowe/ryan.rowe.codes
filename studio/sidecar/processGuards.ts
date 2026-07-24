// The sidecar's last line of defense against a spawn failure that slips past a narrower guard
// elsewhere (docSync's watched-worktree git calls, an unguarded `void` fire-and-forget). Both
// events get the same "log and keep going" answer, specific to this narrow crash class: a failed
// `git.git()` spawn doesn't corrupt any shared in-memory state (no post/session Map, no half-
// written file) for either a rejection or a synchronous throw to have escaped mid-mutation, so
// resuming is safe here in a way it wouldn't be for an arbitrary uncaught exception. A single
// local-authoring session losing every open post and agent conversation to one such hiccup is
// worse than logging loudly and limping in a degraded state.

export function logUnhandledRejection(reason: unknown): void {
  console.error("[sidecar] unhandledRejection (studio stays up):", reason);
}

export function logUncaughtException(err: unknown): void {
  console.error("[sidecar] uncaughtException (studio stays up):", err);
}
