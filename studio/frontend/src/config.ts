// Connection config for the sidecar. The sidecar binds to loopback only and
// requires a per-launch bearer token (REST `Authorization` header, WS `?token=`).
// The token is injected by the orchestrator as VITE_STUDIO_TOKEN.

const HOST = "127.0.0.1";
const SIDECAR_PORT = 4319;

/** REST base for the sidecar web face. */
export const REST_BASE = `http://${HOST}:${SIDECAR_PORT}`;

/** WebSocket base for the sidecar web face. */
export const WS_BASE = `ws://${HOST}:${SIDECAR_PORT}`;

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
