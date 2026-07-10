import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import { cropTo, diffPngs, composeSideBySide, maskRegion } from "./image-utils.mjs";

const NUMBER_LOCK = /[^a-z0-9-]/gi;
const slug = value => value.replace(NUMBER_LOCK, "-");

/**
 * Per-pair "wait for a stable frame" strategy, so the visual diff never races volatile
 * content instead of relying on a fixed delay:
 *  - index: the ConsoleTypist headline types/erases indefinitely and has no equivalent
 *    signal on the LIVE (pre-migration) build, so both sides mask the headline region
 *    instead of waiting for it (see MASKS below).
 *  - algorithmic-art: wait for the cube's WebGL canvas to settle on a stable rendered
 *    frame (textures fully decoded/uploaded). This can't key off the new native
 *    range input's `#complexity-slider` id -- the LIVE (pre-migration) build renders the
 *    same control as an MUI `Slider` with no such id, so a canvas-pixel-stability poll is
 *    used instead: it works identically regardless of which DOM the control renders.
 *  - hello-world: wait for the quine's syntax-highlighted code block to mount.
 */
async function waitForStableFrame(page, pairName) {
  if (pairName === "algorithmic-art") {
    const canvas = page.locator("canvas").first();
    await canvas.waitFor({ state: "visible", timeout: 15000 });
    let previous = await canvas.screenshot();
    for (let attempt = 0; attempt < 25; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const current = await canvas.screenshot();
      if (Buffer.compare(previous, current) === 0) return;
      previous = current;
    }
    return;
  }

  if (pairName === "hello-world") {
    await page.waitForSelector("pre code", { timeout: 15000 });
    return;
  }
}

/** Element(s) to mask per pair -- filled with a solid rectangle before the screenshot is
 * taken, on BOTH the live and local capture, so a volatile region never contributes to
 * the diff regardless of its exact content at capture time. */
function maskSelectorsFor(pairName) {
  if (pairName === "index") return ["main h3"];
  return [];
}

/**
 * hello-world's one code block is a QUINE (see quine.mjs): it renders the post's own
 * `post.body` MDX source via CodeBlock.tsx. That source's relative import line legitimately
 * changed during the migration (`../../components/blog/code` -> `../../components/mdx/
 * CodeBlock`), so this region can *never* pixel-match the LIVE (pre-migration) site's
 * rendering of its own, different, pre-migration source -- a diff here is a false signal
 * about visual fidelity, not a real regression. Its correctness is already asserted
 * byte-for-byte by the exact-text check in quine.mjs (rendered textContent === post.body),
 * so the plan anticipates masking it out of the tolerance diff the same way the index's
 * volatile ConsoleTypist region is masked above.
 *
 * The box is located on the LOCAL page only -- the live pre-migration DOM for this block
 * belongs to a component deleted in Phase 7a, so there is no equivalent selector to locate
 * it on the live side -- and padded generously (full page width, +80px top/bottom) so the
 * same rectangle, reused verbatim against the live screenshot in runVisualDiffMatrix, still
 * fully covers that site's equivalent block despite minor cross-site position drift.
 */
async function computeQuineMaskRect(page) {
  const box = await page.locator("pre").first().boundingBox().catch(() => null);
  if (!box) return null;

  const PAD = 80;
  return { x: 0, y: Math.max(0, box.y - PAD), width: Number.MAX_SAFE_INTEGER, height: box.height + PAD * 2 };
}

async function captureFullPage(browser, { url, viewport, colorScheme, overrideMode, pairName, collectQuineMaskRect }) {
  const context = await browser.newContext({ viewport, colorScheme });
  if (overrideMode) {
    await context.addInitScript(mode => window.localStorage.setItem("themeMode", mode), overrideMode);
  }
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await waitForStableFrame(page, pairName);

    const quineMaskRect = collectQuineMaskRect ? await computeQuineMaskRect(page) : null;

    const maskSelectors = maskSelectorsFor(pairName);
    const mask = maskSelectors.length > 0 ? maskSelectors.map(sel => page.locator(sel)) : undefined;

    const buffer = await page.screenshot({ fullPage: true, mask, timeout: 30000 });
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    return { buffer, scrollHeight, quineMaskRect };
  } finally {
    await context.close();
  }
}

/**
 * Captures every (pair x viewport x theme) combination on the local preview server and,
 * unless `skipLive` is set, on the live production site, diffs each pair with a
 * tolerance threshold, and writes a side-by-side artifact for human review under
 * `<artifactsRoot>/<pair>/<viewport>/<theme>/`.
 */
export async function runVisualDiffMatrix(browser, {
  pairs,
  viewports,
  themeStates,
  localBaseUrl,
  liveOrigin,
  artifactsRoot,
  maxDiffRatio,
  pixelmatchThreshold,
  skipLive,
}) {
  const results = [];

  for (const pair of pairs) {
    for (const viewport of viewports) {
      for (const theme of themeStates) {
        const combo = { pair: pair.name, viewport: viewport.name, theme: theme.name };
        const dir = path.join(artifactsRoot, slug(pair.name), slug(viewport.name), slug(theme.name));
        mkdirSync(dir, { recursive: true });

        const captureOpts = {
          viewport: { width: viewport.width, height: viewport.height },
          colorScheme: theme.colorScheme,
          overrideMode: theme.overrideMode,
          pairName: pair.name,
        };

        let local;
        try {
          local = await captureFullPage(browser, {
            ...captureOpts,
            url: `${localBaseUrl}${pair.local}`,
            collectQuineMaskRect: pair.name === "hello-world",
          });
          writeFileSync(path.join(dir, "local.png"), local.buffer);
        } catch (err) {
          results.push({ ...combo, pass: false, error: `local capture failed: ${err.message}` });
          continue;
        }

        if (skipLive) {
          results.push({ ...combo, pass: null, skipped: "live capture skipped", localHeight: local.scrollHeight });
          continue;
        }

        let live;
        try {
          live = await captureFullPage(browser, { ...captureOpts, url: `${liveOrigin}${pair.live}` });
          writeFileSync(path.join(dir, "live.png"), live.buffer);
        } catch (err) {
          results.push({ ...combo, pass: false, error: `live capture failed: ${err.message}` });
          continue;
        }

        const livePng = PNG.sync.read(live.buffer);
        const localPng = PNG.sync.read(local.buffer);

        if (local.quineMaskRect) {
          maskRegion(livePng, local.quineMaskRect);
          maskRegion(localPng, local.quineMaskRect);
        }

        const { diff, diffPixels, totalPixels, width, height } = diffPngs(livePng, localPng, pixelmatchThreshold);
        const diffRatio = diffPixels / totalPixels;
        const pass = diffRatio <= maxDiffRatio;

        writeFileSync(path.join(dir, "diff.png"), PNG.sync.write(diff));
        const sideBySide = composeSideBySide([cropTo(livePng, width, height), cropTo(localPng, width, height), diff]);
        writeFileSync(path.join(dir, "side-by-side.png"), PNG.sync.write(sideBySide));

        results.push({
          ...combo,
          pass,
          diffRatio,
          diffPixels,
          totalPixels,
          liveHeight: live.scrollHeight,
          localHeight: local.scrollHeight,
          artifactDir: dir,
        });
      }
    }
  }

  return results;
}
