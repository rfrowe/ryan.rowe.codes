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
