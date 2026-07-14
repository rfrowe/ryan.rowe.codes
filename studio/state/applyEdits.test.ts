import { describe, expect, it } from "vitest";
import { applyEdits, revsEqual } from "./applyEdits";

describe("applyEdits", () => {
  it("applies a single replacement", () => {
    const result = applyEdits("hello world", [{ from: 0, to: 5, insert: "goodbye" }]);
    expect(result).toEqual({ ok: true, text: "goodbye world" });
  });

  it("applies a pure insertion (zero-width range)", () => {
    const result = applyEdits("hello world", [{ from: 5, to: 5, insert: "," }]);
    expect(result).toEqual({ ok: true, text: "hello, world" });
  });

  it("composes multiple edits against the ORIGINAL offsets", () => {
    const result = applyEdits("hello world", [
      { from: 0, to: 5, insert: "HI" },
      { from: 6, to: 11, insert: "THERE" },
    ]);
    expect(result).toEqual({ ok: true, text: "HI THERE" });
  });

  it("is independent of the input array order", () => {
    const edits = [
      { from: 6, to: 11, insert: "THERE" },
      { from: 0, to: 5, insert: "HI" },
    ];
    const forward = applyEdits("hello world", edits);
    const reversed = applyEdits("hello world", [...edits].reverse());
    expect(forward).toEqual({ ok: true, text: "HI THERE" });
    expect(reversed).toEqual(forward);
  });

  it("allows adjacent (touching) edits", () => {
    const result = applyEdits("abcdef", [
      { from: 0, to: 3, insert: "X" },
      { from: 3, to: 6, insert: "Y" },
    ]);
    expect(result).toEqual({ ok: true, text: "XY" });
  });

  it("returns the identity for an empty edit list", () => {
    const result = applyEdits("unchanged", []);
    expect(result).toEqual({ ok: true, text: "unchanged" });
  });

  it("rejects overlapping edits", () => {
    const result = applyEdits("hello world", [
      { from: 0, to: 5, insert: "x" },
      { from: 3, to: 8, insert: "y" },
    ]);
    expect(result).toEqual({ ok: false, error: "overlap" });
  });

  it("rejects out-of-range offsets", () => {
    expect(applyEdits("hello", [{ from: -1, to: 2, insert: "x" }])).toEqual({ ok: false, error: "out-of-range" });
    expect(applyEdits("hello", [{ from: 0, to: 99, insert: "x" }])).toEqual({ ok: false, error: "out-of-range" });
    expect(applyEdits("hello", [{ from: 3, to: 1, insert: "x" }])).toEqual({ ok: false, error: "out-of-range" });
  });

  it("treats offsets as UTF-16 code units across a surrogate pair", () => {
    // "😀" is a surrogate pair (2 code units), so "a😀b" has length 4: a=0, emoji=[1,3), b=3.
    const text = "a😀b";
    expect(text.length).toBe(4);

    // Replacing exactly the emoji's two code units swaps it out cleanly.
    expect(applyEdits(text, [{ from: 1, to: 3, insert: "X" }])).toEqual({ ok: true, text: "aXb" });

    // Editing around the emoji preserves the surrogate pair byte-for-byte.
    const preserved = applyEdits(text, [
      { from: 0, to: 1, insert: "A" },
      { from: 3, to: 4, insert: "!" },
    ]);
    expect(preserved).toEqual({ ok: true, text: "A😀!" });
  });
});

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
