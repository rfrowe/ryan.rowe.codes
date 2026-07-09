#!/usr/bin/env node
/**
 * Phase 8 verification harness (gatsby-to-astro-migration): diffs the built Astro site
 * against the LIVE production site (https://ryan.rowe.codes) across the explicit
 * old-URL -> new-URL map, 3 viewports, and 3 theme states; runs an exact-text "quine"
 * assertion on the hello-world post; and runs a functional check on the RandomCube
 * island. See .internal/ai/plans/gatsby-to-astro-migration.md "Phase 8: Verification".
 *
 * Usage:
 *   node scripts/verify-screenshots.mjs              # full run (needs live-site network)
 *   node scripts/verify-screenshots.mjs --skip-live  # local-only: quine + cube + local screenshots
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

import { LIVE_ORIGIN, URL_PAIRS, VIEWPORTS, THEME_STATES, MAX_DIFF_RATIO, PIXELMATCH_THRESHOLD, ARTIFACTS_DIR } from "./verify/config.mjs";
import { startPreviewServer } from "./verify/server.mjs";
import { runQuineCheck } from "./verify/quine.mjs";
import { runCubeCheck } from "./verify/cube.mjs";
import { runVisualDiffMatrix } from "./verify/screenshots.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

const args = process.argv.slice(2);
const skipLive = args.includes("--skip-live");
const portArgIdx = args.indexOf("--port");
const port = portArgIdx >= 0 ? Number(args[portArgIdx + 1]) : 4321;

function logSection(title) {
  console.log(`\n${"=".repeat(8)} ${title} ${"=".repeat(8)}`);
}

async function main() {
  const artifactsRoot = path.join(repoRoot, ARTIFACTS_DIR);
  mkdirSync(artifactsRoot, { recursive: true });

  logSection("Starting local preview server");
  const server = await startPreviewServer({ port });
  console.log(`Preview server up at ${server.baseUrl}`);

  const browser = await chromium.launch();
  const report = { skipLive, generatedAt: new Date().toISOString() };
  let overallPass = true;

  try {
    logSection("Quine exact-text check (hello-world)");
    const quine = await runQuineCheck(browser, server.baseUrl);
    report.quine = quine;
    if (quine.pass) {
      console.log(`PASS: rendered code block textContent exactly matches post.body (${quine.expectedLength} chars).`);
    } else {
      overallPass = false;
      console.log(`FAIL: mismatch at char ${quine.firstDiffIndex}.`);
      console.log(`  expected: ${JSON.stringify(quine.expectedSnippet)}`);
      console.log(`  actual:   ${JSON.stringify(quine.actualSnippet)}`);
    }

    logSection("Cube functional check (algorithmic-art)");
    const cubeArtifacts = path.join(artifactsRoot, "cube");
    const cube = await runCubeCheck(browser, server.baseUrl, cubeArtifacts);
    report.cube = cube;
    for (const step of cube.steps) {
      console.log(`${step.pass ? "PASS" : "FAIL"}: ${step.name}${step.detail ? " " + JSON.stringify(step.detail) : ""}`);
    }
    if (!cube.pass) overallPass = false;

    logSection(`Visual diff matrix (${URL_PAIRS.length} pairs x ${VIEWPORTS.length} viewports x ${THEME_STATES.length} themes)${skipLive ? " [--skip-live: local captures only]" : ""}`);
    const visual = await runVisualDiffMatrix(browser, {
      pairs: URL_PAIRS,
      viewports: VIEWPORTS,
      themeStates: THEME_STATES,
      localBaseUrl: server.baseUrl,
      liveOrigin: LIVE_ORIGIN,
      artifactsRoot,
      maxDiffRatio: MAX_DIFF_RATIO,
      pixelmatchThreshold: PIXELMATCH_THRESHOLD,
      skipLive,
    });
    report.visual = visual;

    for (const r of visual) {
      const label = `${r.pair} / ${r.viewport} / ${r.theme}`;
      if (r.skipped) {
        console.log(`SKIP: ${label} (${r.skipped})`);
      } else if (r.error) {
        overallPass = false;
        console.log(`ERROR: ${label} -- ${r.error}`);
      } else {
        if (!r.pass) overallPass = false;
        console.log(
          `${r.pass ? "PASS" : "FAIL"}: ${label} -- diff ${(r.diffRatio * 100).toFixed(2)}% (live h=${r.liveHeight}px, local h=${r.localHeight}px)`,
        );
      }
    }
  } finally {
    await browser.close();
    await server.stop();
  }

  if (skipLive) overallPass = false; // live-baseline diff didn't run -- never report clean success
  report.overallPass = overallPass;

  writeFileSync(path.join(artifactsRoot, "report.json"), JSON.stringify(report, null, 2));

  logSection("Summary");
  console.log(`Quine check:  ${report.quine.pass ? "PASS" : "FAIL"}`);
  console.log(`Cube check:   ${report.cube.pass ? "PASS" : "FAIL"}`);
  if (skipLive) {
    console.log("Visual diff:  SKIPPED (--skip-live) -- local screenshots captured, no live baseline");
  } else {
    const passCount = report.visual.filter(r => r.pass === true).length;
    console.log(`Visual diff:  ${passCount}/${report.visual.length} pairs within tolerance`);
  }
  console.log(`Artifacts written to ${artifactsRoot}`);
  console.log(`Overall: ${overallPass ? "PASS" : "FAIL"}`);

  process.exit(overallPass ? 0 : 1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
