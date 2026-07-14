// Connection config for the sidecar. The sidecar binds to loopback only and
// requires a per-launch bearer token (REST `Authorization` header, WS `?token=`).
// The orchestrator injects the token as VITE_STUDIO_TOKEN and the sidecar's web
// port as VITE_STUDIO_SIDECAR_PORT (the default matches a standalone sidecar).

// Connect over the loopback IP (avoids localhost resolving to ::1 while the sidecar binds IPv4);
// the endpoints below are display-only and read as `localhost` for consistency.
const HOST = "127.0.0.1";
const SIDECAR_PORT = Number(import.meta.env.VITE_STUDIO_SIDECAR_PORT) || 4319;

/** REST base for the sidecar web face. */
export const REST_BASE = `http://${HOST}:${SIDECAR_PORT}`;

/** WebSocket base for the sidecar web face. */
export const WS_BASE = `ws://${HOST}:${SIDECAR_PORT}`;

/** The sidecar's endpoint (`localhost:<port>`), for the status popover. */
export const SIDECAR_ENDPOINT = `localhost:${SIDECAR_PORT}`;

/** The Astro preview daemon's endpoint (`localhost:<port>`), for the status popover. */
const ASTRO_PORT = Number(import.meta.env.VITE_STUDIO_ASTRO_PORT) || 4321;
export const PREVIEW_ENDPOINT = `localhost:${ASTRO_PORT}`;

/** Bearer token for this studio launch (empty when unset, e.g. under the mock). */
export const STUDIO_TOKEN = import.meta.env.VITE_STUDIO_TOKEN ?? "";

/** Full WS URL with the token as a query param (the WS API has no header slot). */
export function wsUrl(): string {
  return STUDIO_TOKEN ? `${WS_BASE}?token=${encodeURIComponent(STUDIO_TOKEN)}` : WS_BASE;
}

/** Authorization header for REST calls (omitted when no token). */
export function authHeaders(): Record<string, string> {
  return STUDIO_TOKEN ? { Authorization: `Bearer ${STUDIO_TOKEN}` } : {};
}
