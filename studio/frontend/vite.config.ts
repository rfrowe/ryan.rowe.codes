import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The studio SPA dev server. The orchestrator picks a free loopback port (a lone studio keeps 5199)
// and passes it as STUDIO_SPA_PORT so the sidecar's Origin allowlist matches; strictPort fails fast
// if that port was taken between the pick and the bind.
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: Number(process.env.STUDIO_SPA_PORT) || 5199,
    strictPort: true,
  },
});
