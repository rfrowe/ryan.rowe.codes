/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Per-launch bearer token minted by the orchestrator. */
  readonly VITE_STUDIO_TOKEN?: string;
  /** The sidecar's web port, chosen per launch by the orchestrator. */
  readonly VITE_STUDIO_SIDECAR_PORT?: string;
  /** The Astro preview daemon's port, chosen per launch by the orchestrator. */
  readonly VITE_STUDIO_ASTRO_PORT?: string;
  /** The sidecar's hostname once behind a reverse proxy; defaults to its loopback address. */
  readonly VITE_STUDIO_HOST_SIDECAR?: string;
  /** The Astro preview daemon's hostname once behind a reverse proxy; defaults to its loopback address. */
  readonly VITE_STUDIO_HOST_ASTRO?: string;
  /** Scheme shared by the sidecar and Astro preview endpoints ("http" or "https"); defaults to "http". */
  readonly VITE_STUDIO_PROTOCOL?: string;
  /** When "1"/"true", the SPA runs against the in-browser mock backend. */
  readonly VITE_STUDIO_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
