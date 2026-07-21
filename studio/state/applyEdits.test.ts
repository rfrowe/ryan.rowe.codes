import { describe, expect, it } from "vitest";
import { revsEqual } from "./applyEdits";

describe("revsEqual", () => {
  it("is true only when both the counter and the hash match", () => {
    expect(revsEqual({ n: 1, hash: "abc" }, { n: 1, hash: "abc" })).toBe(true);
  });

  it("is false when the counter differs", () => {
    expect(revsEqual({ n: 1, hash: "abc" }, { n: 2, hash: "abc" })).toBe(false);
  });

  it("is false when the hash differs (same counter)", () => {
    expect(revsEqual({ n: 1, hash: "abc" }, { n: 1, hash: "def" })).toBe(false);
  });
});
