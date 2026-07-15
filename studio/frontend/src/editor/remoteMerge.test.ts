import { Text } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { diffSpan, diffSpans, rebaseRemoteChange } from "./remoteMerge";

function apply(changes: ReturnType<typeof rebaseRemoteChange>, text: string): string {
  return changes.apply(Text.of(text.split("\n"))).toString();
}

describe("diffSpan", () => {
  it("returns null for identical text", () => {
    expect(diffSpan("abc", "abc")).toBeNull();
  });

  it("finds the single changed span between a common prefix and suffix", () => {
    expect(diffSpan("hello world", "hello there world")).toEqual({ from: 6, to: 6, insert: "there " });
  });

  it("handles a pure deletion", () => {
    expect(diffSpan("abcdef", "abef")).toEqual({ from: 2, to: 4, insert: "" });
  });
});

describe("diffSpans", () => {
  it("keeps two edits on different lines as independent spans", () => {
    const a = "AAAA\nBBBB\nCCCC\nDDDD\n";
    const b = "aaaa\nBBBB\nCCCC\ndddd\n";
    expect(diffSpans(a, b)).toEqual([
      { from: 0, to: 4, insert: "aaaa" },
      { from: 15, to: 19, insert: "dddd" },
    ]);
  });
});

describe("rebaseRemoteChange", () => {
  const base = "line one\nline two\nline three\n";

  it("applies the remote change directly when the live buffer has no pending edits", () => {
    const remote = "line one\nline TWO\nline three\n";
    expect(apply(rebaseRemoteChange(base, remote, base), base)).toBe(remote);
  });

  it("preserves a local edit elsewhere in the document when applying a remote change", () => {
    const remote = "line one\nline TWO\nline three\n"; // agent rewrote line two
    const live = "line one\nline two\nline three\nline four\n"; // author appended a line
    expect(apply(rebaseRemoteChange(base, remote, live), live)).toBe(
      "line one\nline TWO\nline three\nline four\n",
    );
  });

  it("preserves both edits (concatenated) when they collide on the exact same span", () => {
    const remote = "line one\nline TWO\nline three\n"; // agent's rewrite of "two"
    const live = "line one\nline 2\nline three\n"; // author's own concurrent rewrite of "two"
    // A genuine same-span collision: neither edit is silently dropped, so the author sees it.
    expect(apply(rebaseRemoteChange(base, remote, live), live)).toBe("line one\nline 2TWO\nline three\n");
  });

  it("is a no-op when the remote write didn't actually change anything", () => {
    expect(apply(rebaseRemoteChange(base, base, base), base)).toBe(base);
  });

  it("keeps a remote edit and a local edit on different lines independent (no cross-hunk misplacement)", () => {
    const wideBase = "AAAA\nBBBB\nCCCC\nDDDD\n";
    const remote = "aaaa\nbbbb\nCCCC\ndddd\n"; // agent rewrites lines 1, 2, and 4
    const live = "AAAA\nBBBBxyz\nCCCC\nDDDD\n"; // author appends to line 2 only
    // Before line-granular hunking, the remote write's outermost changed chars (line 1 vs line 4)
    // collapsed the whole document into one span, relocating the author's "xyz" to the last line.
    expect(apply(rebaseRemoteChange(wideBase, remote, live), live)).toBe("aaaa\nbbbbxyz\nCCCC\ndddd\n");
  });
});
