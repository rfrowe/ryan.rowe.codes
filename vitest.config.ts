import { defineConfig } from "vitest/config";

// Production test scope: only `src/` tests (currently just cubeImages.test.ts).
// Covers both `.test`/`.spec` and `.ts`/`.tsx`, so a future React-island test is
// collected without a config change. Still scoped to `src/`: the authoring studio
// has its own scope in `studio/vitest.config.ts` (run via `npm run studio:test`), so
// `npm test` never collects studio files and the production CI test step stays unaffected.
export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
