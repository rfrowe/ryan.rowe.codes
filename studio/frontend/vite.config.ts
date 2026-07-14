import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The studio SPA dev server. Fixed loopback port so the orchestrator and the
// sidecar's Origin allowlist can rely on it; strictPort fails fast on collision.
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5199,
    strictPort: true,
  },
});
