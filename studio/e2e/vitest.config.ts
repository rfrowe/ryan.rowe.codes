import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The studio end-to-end suite (run via `npm run studio:e2e`): boots a real sidecar against an isolated
// git sandbox and drives it through the REST/WS faces. A SEPARATE Vitest project so it never runs
// inside the fast unit suites — `test` collects only `src/`, `studio:test` only studio `.ts`/`.tsx`,
// and this collects only `studio/e2e/*.test.mjs`.
//
// The scenarios are one ordered, state-accumulating session replay sharing a single long-lived
// sidecar, so they must run sequentially in one worker: a forks pool with no file parallelism, and
// definition order preserved. Timeouts are generous — a boot in `beforeAll`, and the agent-conflict
// scenario overrides to several minutes inline.
export default defineConfig({
  // Keep Vite's cache in the repo-root node_modules (already gitignored) rather than letting it
  // default to a fresh `studio/e2e/node_modules/.vite` under this config's root.
  cacheDir: fileURLToPath(new URL("../../node_modules/.vite/studio-e2e", import.meta.url)),
  test: {
    root: fileURLToPath(new URL(".", import.meta.url)),
    include: ["**/*.test.mjs"],
    environment: "node",
    pool: "forks",
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 60_000,
    hookTimeout: 200_000,
    teardownTimeout: 60_000,
  },
});
