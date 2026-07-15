// Connection config for the sidecar. The sidecar requires a per-launch bearer token (REST
// `Authorization` header, WS `?token=`). The orchestrator injects the token as VITE_STUDIO_TOKEN
// and the sidecar's web port as VITE_STUDIO_SIDECAR_PORT (the default matches a standalone sidecar).

// Scheme shared by the sidecar and Astro preview endpoints below; VITE_STUDIO_PROTOCOL is set by
// containerized/reverse-proxied deployments (https, deriving wss for the socket), left unset in
// local dev (http/ws, matching today's behavior).
const PROTOCOL = import.meta.env.VITE_STUDIO_PROTOCOL ?? "http";
const WS_PROTOCOL = PROTOCOL === "https" ? "wss" : "ws";

const SIDECAR_PORT = Number(import.meta.env.VITE_STUDIO_SIDECAR_PORT) || 4319;
// Connect over the loopback IP by default (avoids localhost resolving to ::1 while the sidecar
// binds IPv4); VITE_STUDIO_HOST_SIDECAR overrides with a real hostname once behind a reverse proxy.
const SIDECAR_HOST = import.meta.env.VITE_STUDIO_HOST_SIDECAR ?? `127.0.0.1:${SIDECAR_PORT}`;

/** REST base for the sidecar web face. */
export const REST_BASE = `${PROTOCOL}://${SIDECAR_HOST}`;

/** WebSocket base for the sidecar web face. */
export const WS_BASE = `${WS_PROTOCOL}://${SIDECAR_HOST}`;

/** The sidecar's endpoint, for the status popover. */
export const SIDECAR_ENDPOINT = SIDECAR_HOST;

const ASTRO_PORT = Number(import.meta.env.VITE_STUDIO_ASTRO_PORT) || 4321;
const ASTRO_HOST = import.meta.env.VITE_STUDIO_HOST_ASTRO ?? `localhost:${ASTRO_PORT}`;

/** The Astro preview daemon's endpoint, for the status popover. */
export const PREVIEW_ENDPOINT = ASTRO_HOST;

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
