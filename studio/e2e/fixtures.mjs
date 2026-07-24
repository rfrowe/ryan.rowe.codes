// Playwright fixtures for the studio UI e2e. A worker-scoped `studio` fixture boots the isolated
// sandbox + sidecar + vite SPA once and tears it down at worker end; a test-scoped `studioPage` gives
// each journey a browser page already navigated to the (token-authed) SPA, plus the sandbox handle and
// git ground-truth helpers. Journeys never touch REST/WS — they drive the rendered UI.

import { test as base, expect } from "@playwright/test";
import {
  buildSandbox, startStudio, stopStudio, removeSandbox, readKey,
  git, gitOk, moverAdvanceMain, seedRemoteDraft, seedPost, SECRETS,
} from "./harness.mjs";

const anthropicKey = readKey();
// The agent journey drives a real, paid Claude turn: run it only when a key is present AND explicitly
// enabled (STUDIO_E2E_AGENT=1), so a stray funded key is never spent locally or by an untrusted CI run.
export const RUN_AGENT = !!anthropicKey && process.env.STUDIO_E2E_AGENT === "1";

export const test = base.extend({
  studio: [
    // Playwright parses this signature for fixture deps and requires the object-destructuring form.
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const sb = buildSandbox();
      const stack = await startStudio(sb, { key: RUN_AGENT ? anthropicKey : null, verbose: process.env.STUDIO_E2E_VERBOSE === "1" });
      // Ground-truth git helpers bound to this sandbox (assertions read real refs/worktrees on disk).
      const gh = {
        sb,
        url: stack.url,
        stack,
        originHas: (branch) => gitOk(["rev-parse", "--verify", `refs/heads/${branch}`], sb.originGit),
        localBranch: (branch) => gitOk(["rev-parse", "--verify", `refs/heads/${branch}`], sb.repo),
        worktreeExists: (stem) => gitOk(["rev-parse", "--is-inside-work-tree"], `${sb.repo}/.worktrees/blog/${stem}`),
        worktreeDir: (stem) => `${sb.repo}/.worktrees/blog/${stem}`,
        containsOrigin: (branch) => gitOk(["merge-base", "--is-ancestor", "origin/main", branch], sb.repo),
        git,
        gitOk,
        seedPost,
        advanceMain: (files, msg) => moverAdvanceMain(sb, files, msg),
        seedRemoteDraft: (stem, base, files, msg) => seedRemoteDraft(sb, stem, base, files, msg),
      };
      try {
        await use({ sb, stack, gh });
      } finally {
        await stopStudio(stack);
        if (process.env.STUDIO_E2E_KEEP !== "1") removeSandbox(sb.root);
      }
    },
    { scope: "worker", timeout: 120_000 },
  ],

  // A page navigated to the authenticated SPA and confirmed connected (the editor renders only once the
  // WS delivered the active post). Journeys start from here.
  studioPage: async ({ page, studio }, use) => {
    await page.goto(studio.stack.url, { waitUntil: "load" });
    await expect(page.locator(".cm-editor").first()).toBeVisible({ timeout: 20_000 });
    await use(page);
  },
});

export { expect, git, gitOk, SECRETS };
