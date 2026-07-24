// The sidecar's last line of defense against a rejection or exception that slips past every
// narrower guard elsewhere (docSync's watched-worktree git calls, an unguarded `void` fire-and-
// forget). The two events get different treatment because they mean different things: a rejected
// promise's failure is self-contained to whatever awaited it, so nothing else shares mutable state
// with it and it's safe to log and keep running; a synchronous throw can escape mid-mutation with
// no promise to contain it, so Node's own guidance against resuming after one still applies.

/** A single local-authoring session losing every open post and agent conversation to one rejected
 *  spawn is worse than logging loudly and limping in a possibly degraded state. */
export function logUnhandledRejection(reason: unknown): void {
  console.error("[sidecar] unhandledRejection (studio stays up):", reason);
}

/** Tears down through `shutdown` (the same path SIGTERM uses) rather than a bare exit, so the
 *  Astro daemon and watchers still close instead of being left orphaned. */
export function logUncaughtExceptionAndShutdown(err: unknown, shutdown: () => Promise<void>): void {
  console.error("[sidecar] uncaughtException (shutting down):", err);
  void shutdown();
}
