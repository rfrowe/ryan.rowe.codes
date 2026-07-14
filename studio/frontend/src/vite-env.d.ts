/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Per-launch bearer token minted by the orchestrator. */
  readonly VITE_STUDIO_TOKEN?: string;
  /** The sidecar's web port, chosen per launch by the orchestrator. */
  readonly VITE_STUDIO_SIDECAR_PORT?: string;
  /** The Astro preview daemon's port, chosen per launch by the orchestrator. */
  readonly VITE_STUDIO_ASTRO_PORT?: string;
  /** When "1"/"true", the SPA runs against the in-browser mock backend. */
  readonly VITE_STUDIO_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
