/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Per-launch bearer token minted by the orchestrator. */
  readonly VITE_STUDIO_TOKEN?: string;
  /** When "1"/"true", the SPA runs against the in-browser mock backend. */
  readonly VITE_STUDIO_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
