/**
 * Pure image glob -> sort -> chunk logic for the RandomCube island, split out of
 * cubeRenderer.tsx so it can be unit tested without a p5/DOM environment (see
 * cubeImages.test.ts) -- this is the top silent-failure risk called out in the migration
 * plan: `import.meta.glob`'s key order is not guaranteed to match Gatsby's old
 * `allFile(sort: {fields: [dir, name]})`, and a wrong order silently mismatches which
 * face texture lands on which side of the cube (no error, just a visually-wrong cube).
 */

/** Shape of a Vite `import.meta.glob({eager: true, query: '?url', import: 'default'})` result: module path -> URL string. */
export type ImageGlob = Record<string, string>;

/**
 * Plain lexicographic string comparator. Deliberately NOT `String.prototype.localeCompare`,
 * which is locale/ICU-dependent and can order punctuation/case differently across Node
 * versions, OSes, and CI runners -- non-deterministic for a purely-ASCII path-sorting use
 * case where we want byte-order string comparison every time.
 */
export const lexicographicCompare = (a: string, b: string): number => {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};

/**
 * Sorts a glob result's keys (module paths, e.g. "./assets/1/side0.jpg") with
 * `lexicographicCompare` and returns just the URLs in that order. Reproduces the
 * pre-migration Gatsby `allFile(sort: {fields: [dir, name]})` ordering closely enough:
 * path-lexicographic sort groups each numbered asset subdirectory together and orders
 * `sideN.jpg` files within it numerically (single digits, so lexicographic == numeric).
 */
export function sortImageUrls(glob: ImageGlob): string[] {
  return Object.keys(glob)
    .sort(lexicographicCompare)
    .map(key => glob[key]);
}

/** Splits `urls` into consecutive groups of `groupSize` (default 6, one per cube face). */
export function chunk<T>(items: T[], groupSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += groupSize) {
    chunks.push(items.slice(i, i + groupSize));
  }
  return chunks;
}

/**
 * Sorts a glob result then chunks it into groups of 6 URLs, one group per cube.
 * Each group's positional order (index 0..5) is consumed by cubeRenderer.tsx as the
 * `Faces` enum order (FRONT, BACK, BOTTOM, TOP, RIGHT, LEFT).
 */
export function sortAndChunkImages(glob: ImageGlob, groupSize = 6): string[][] {
  return chunk(sortImageUrls(glob), groupSize);
}
