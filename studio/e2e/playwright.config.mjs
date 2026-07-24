import { defineConfig } from "@playwright/test";

// The studio UI end-to-end suite: drives the real studio SPA in a headless browser against a booted
// sidecar + isolated git sandbox (see harness.mjs / fixtures.mjs), asserting on rendered UI + git
// ground truth. Run via `npm run studio:e2e`.
//
// The journeys share ONE booted studio (a worker-scoped fixture), so a single worker runs them
// sequentially — cheap to boot once, and no cross-journey port/state contention. Each journey creates
// its own post (unique slug), so they stay independent despite the shared stack.
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.mjs",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
  },
});
