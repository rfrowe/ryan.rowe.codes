import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Studio test scope, run via `npm run studio:test`. Rooted at studio/ so it never
// collects the production `src/` suite (which the root vitest.config.ts owns).
export default defineConfig({
  test: {
    root: fileURLToPath(new URL(".", import.meta.url)),
    include: ["**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
