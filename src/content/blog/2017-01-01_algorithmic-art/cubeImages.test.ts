import { describe, expect, it } from "vitest";
import { chunk, lexicographicCompare, sortAndChunkImages, sortImageUrls } from "./cubeImages";

describe("lexicographicCompare", () => {
  it("orders by raw code point, unlike locale-aware localeCompare", () => {
    // In common ICU locale collation (e.g. en-US), "aside" sorts before "Bside", but plain
    // code-point comparison puts uppercase 'B' (66) before lowercase 'a' (97).
    expect(lexicographicCompare("Bside", "aside")).toBe(-1);
    expect("Bside".localeCompare("aside")).toBeGreaterThan(0);
  });

  it("returns 0 for equal strings, -1/1 otherwise", () => {
    expect(lexicographicCompare("a", "a")).toBe(0);
    expect(lexicographicCompare("a", "b")).toBe(-1);
    expect(lexicographicCompare("b", "a")).toBe(1);
  });
});

describe("chunk", () => {
  it("splits into groups of the given size, keeping a trailing partial group", () => {
    expect(chunk([1, 2, 3, 4, 5, 6, 7], 6)).toEqual([
      [1, 2, 3, 4, 5, 6],
      [7],
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(chunk([], 6)).toEqual([]);
  });
});

describe("sortImageUrls", () => {
  it("sorts glob keys lexicographically by path and maps to their URLs", () => {
    const glob = {
      "./assets/2/side1.jpg": "url-2-1",
      "./assets/1/side0.jpg": "url-1-0",
      "./assets/10/side0.jpg": "url-10-0",
      "./assets/1/side1.jpg": "url-1-1",
      "./assets/2/side0.jpg": "url-2-0",
    };

    // Plain lexicographic (code-point) order: "./assets/1/..." < "./assets/10/..." <
    // "./assets/2/...", because '1' < '2' and a shorter string sorts before a longer one
    // that starts with it. A *numeric* sort of the directory segment would instead put
    // "./assets/2/..." before "./assets/10/...", which is exactly the divergence this
    // test guards against silently creeping in.
    expect(sortImageUrls(glob)).toEqual(["url-1-0", "url-1-1", "url-10-0", "url-2-0", "url-2-1"]);
  });
});

describe("sortAndChunkImages", () => {
  it("produces one 6-face group per cube, in FRONT/BACK/BOTTOM/TOP/RIGHT/LEFT positional order", () => {
    // Two cubes' worth of faces, deliberately out of order (as import.meta.glob's key
    // order is not guaranteed), mirroring the real asset layout
    // (assets/<cube>/side0..5.jpg where side0..5 map to Faces.FRONT..LEFT).
    const glob = {
      "./assets/1/side3.jpg": "cube1-top",
      "./assets/2/side0.jpg": "cube2-front",
      "./assets/1/side0.jpg": "cube1-front",
      "./assets/2/side5.jpg": "cube2-left",
      "./assets/1/side5.jpg": "cube1-left",
      "./assets/1/side1.jpg": "cube1-back",
      "./assets/2/side3.jpg": "cube2-top",
      "./assets/1/side4.jpg": "cube1-right",
      "./assets/2/side1.jpg": "cube2-back",
      "./assets/2/side4.jpg": "cube2-right",
      "./assets/1/side2.jpg": "cube1-bottom",
      "./assets/2/side2.jpg": "cube2-bottom",
    };

    const cubes = sortAndChunkImages(glob);

    expect(cubes).toHaveLength(2);
    expect(cubes[0]).toHaveLength(6);
    expect(cubes[1]).toHaveLength(6);

    // Faces enum order is FRONT, BACK, BOTTOM, TOP, RIGHT, LEFT -- positional index into
    // each 6-element group.
    expect(cubes[0]).toEqual(["cube1-front", "cube1-back", "cube1-bottom", "cube1-top", "cube1-right", "cube1-left"]);
    expect(cubes[1]).toEqual(["cube2-front", "cube2-back", "cube2-bottom", "cube2-top", "cube2-right", "cube2-left"]);
  });

  it("supports a custom group size", () => {
    const glob = { a: "1", b: "2", c: "3", d: "4" };
    expect(sortAndChunkImages(glob, 2)).toEqual([["1", "2"], ["3", "4"]]);
  });

  it("returns an empty array when the glob is empty", () => {
    expect(sortAndChunkImages({})).toEqual([]);
  });
});
