import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ALGORITHMIC_ART_PATH = "/blog/2017-01-01/algorithmic-art";

function pngBuffersDiffer(bufA, bufB, threshold = 0.3, minDiffPixels = 200) {
  const a = PNG.sync.read(bufA);
  const b = PNG.sync.read(bufB);
  if (a.width !== b.width || a.height !== b.height) return true;
  const diff = new PNG({ width: a.width, height: a.height });
  const diffPixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold });
  return diffPixels >= minDiffPixels;
}

/** Polls canvas screenshots until two consecutive captures are (near-)identical, i.e. the
 * WebGL draw loop has settled (all textures loaded, no mid-transition frame) -- a content
 * readiness signal rather than a fixed sleep. */
async function waitForStableCanvas(canvasLocator, { maxAttempts = 25, gapMs = 200 } = {}) {
  let previous = await canvasLocator.screenshot();
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, gapMs));
    const current = await canvasLocator.screenshot();
    if (!pngBuffersDiffer(previous, current, 0.1, 40)) {
      return current;
    }
    previous = current;
  }
  return previous;
}

/**
 * Playwright functional check for the RandomCube island (src/content/blog/2022-03-11_algorithmic-art/
 * cubeCard.tsx + cubeRenderer.tsx): canvas + WebGL context present, a simulated drag
 * rotates the rendered cube, and the native range slider swaps in a different cube
 * (different jpg textures) at >=2 complexity levels. Screenshots at each step are saved
 * as artifacts for the plan's manual "cube faces visually correct" review.
 */
export async function runCubeCheck(browser, localBaseUrl, artifactsDir) {
  mkdirSync(artifactsDir, { recursive: true });

  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  const result = { steps: [], pass: true };

  const record = (name, pass, detail) => {
    result.steps.push({ name, pass, detail });
    if (!pass) result.pass = false;
  };

  try {
    await page.goto(`${localBaseUrl}${ALGORITHMIC_ART_PATH}`, { waitUntil: "networkidle" });

    const canvas = page.locator("canvas").first();
    await canvas.waitFor({ state: "visible", timeout: 15000 });

    const contextInfo = await page.evaluate(() => {
      const el = document.querySelector("canvas");
      if (!el) return { present: false };
      for (const type of ["webgl2", "webgl", "experimental-webgl"]) {
        if (el.getContext(type)) return { present: true, type };
      }
      return { present: false };
    });
    record("canvas-webgl-context-present", contextInfo.present === true, contextInfo);

    // Wait for the slider to report >0 loaded cube groups (onCubesLoaded has fired) before
    // trusting any canvas snapshot as a "loaded" baseline.
    await page.waitForFunction(
      () => {
        const slider = document.querySelector("#complexity-slider");
        return slider && Number(slider.max) > 0;
      },
      { timeout: 15000 },
    );

    const numCubes = await page.locator("#complexity-slider").evaluate(el => Number(el.max) + 1);
    record("cube-groups-loaded", numCubes >= 2, { numCubes });

    const baseline = await waitForStableCanvas(canvas);
    writeFileSync(path.join(artifactsDir, "00-baseline-complexity-0.png"), baseline);

    // --- Drag: rotate the cube via a simulated mouse drag ---
    const box = await canvas.boundingBox();
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) {
      await page.mouse.move(centerX + i * 12, centerY - i * 8);
    }
    await page.mouse.up();

    const afterDrag = await waitForStableCanvas(canvas);
    writeFileSync(path.join(artifactsDir, "01-after-drag-complexity-0.png"), afterDrag);
    record("drag-changes-rotation", pngBuffersDiffer(baseline, afterDrag), null);

    // --- Slider: spot-check >=2 complexity levels distinct from the current render ---
    const slider = page.locator("#complexity-slider");
    await slider.focus();

    await page.keyboard.press("ArrowRight"); // complexity index 1
    await page.waitForFunction(() => document.querySelector("#complexity-slider-label")?.textContent?.trim() === "Complexity 1");
    const level1 = await waitForStableCanvas(canvas);
    writeFileSync(path.join(artifactsDir, "02-complexity-1.png"), level1);
    record("slider-changes-cube-level-1", pngBuffersDiffer(afterDrag, level1), null);

    const label1 = await page.locator("#complexity-slider-label").innerText();
    record("slider-label-updates-level-1", label1.trim() === "Complexity 1", { label: label1 });

    await page.keyboard.press("End"); // jump to max complexity index
    const maxIndex = numCubes - 1;
    await page.waitForFunction(
      expected => document.querySelector("#complexity-slider-label")?.textContent?.trim() === expected,
      `Complexity ${maxIndex}`,
    );
    const levelMax = await waitForStableCanvas(canvas);
    writeFileSync(path.join(artifactsDir, `03-complexity-${maxIndex}.png`), levelMax);
    record(`slider-changes-cube-level-${maxIndex}`, pngBuffersDiffer(level1, levelMax), null);

    const labelMax = await page.locator("#complexity-slider-label").innerText();
    record("slider-label-updates-level-max", labelMax.trim() === `Complexity ${maxIndex}`, { label: labelMax });
  } finally {
    await page.close();
  }

  return result;
}
