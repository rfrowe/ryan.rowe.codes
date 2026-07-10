import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

/** Crops (never pads) a decoded PNG down to `width`x`height`, anchored top-left. */
export function cropTo(png, width, height) {
  const out = new PNG({ width, height });
  PNG.bitblt(png, out, 0, 0, width, height, 0, 0);
  return out;
}

/**
 * Diffs two same-content screenshots that may differ slightly in captured page height
 * (different content length between the live and ported markup). Crops both to their
 * common width/height before diffing -- a visual diff can only meaningfully compare the
 * region both pages share; a height mismatch itself is reported separately by the caller.
 */
export function diffPngs(pngA, pngB, threshold) {
  const width = Math.min(pngA.width, pngB.width);
  const height = Math.min(pngA.height, pngB.height);
  const a = cropTo(pngA, width, height);
  const b = cropTo(pngB, width, height);
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(a.data, b.data, diff.data, width, height, { threshold });
  return { diff, diffPixels, totalPixels: width * height, width, height };
}

/**
 * Paints a flat rectangle directly into a decoded PNG's pixel buffer (mutates in place),
 * clamped to the image bounds. Used to blank out a region *before* diffing so it can never
 * contribute a diff pixel regardless of what either side actually renders there -- e.g. the
 * hello-world quine code block (see screenshots.mjs `computeQuineMaskRect`), which
 * legitimately cannot match the live pre-migration baseline and is verified elsewhere by an
 * exact-text assertion instead. Uses Playwright's own default screenshot-mask color
 * (opaque magenta) purely for visual consistency in side-by-side artifacts; the color itself
 * is irrelevant to the diff since it is identical on both sides.
 */
export function maskRegion(png, rect) {
  const x0 = Math.max(0, Math.floor(rect.x));
  const y0 = Math.max(0, Math.floor(rect.y));
  const x1 = Math.min(png.width, Math.ceil(rect.x + rect.width));
  const y1 = Math.min(png.height, Math.ceil(rect.y + rect.height));

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = (png.width * y + x) << 2;
      png.data[idx] = 255;
      png.data[idx + 1] = 0;
      png.data[idx + 2] = 255;
      png.data[idx + 3] = 255;
    }
  }
  return png;
}

/** Horizontally concatenates PNGs (with a thin gutter) into one composite for side-by-side review. */
export function composeSideBySide(pngs, gutter = 6) {
  const height = Math.max(...pngs.map(p => p.height));
  const width = pngs.reduce((sum, p) => sum + p.width, 0) + gutter * (pngs.length - 1);
  const out = new PNG({ width, height });
  out.data.fill(80); // mid-gray background, visible against both light/dark captures

  let x = 0;
  for (const png of pngs) {
    PNG.bitblt(png, out, 0, 0, png.width, png.height, x, 0);
    x += png.width + gutter;
  }
  return out;
}
