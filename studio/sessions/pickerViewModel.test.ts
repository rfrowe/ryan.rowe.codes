import { describe, expect, it } from "vitest";
import type { RawSession } from "./pickerViewModel";
import { toPickerViewModel } from "./pickerViewModel";

describe("toPickerViewModel — sorting", () => {
  it("orders by mtime descending", () => {
    const raw: RawSession[] = [
      { sessionId: "a", mtime: 100 },
      { sessionId: "b", mtime: 300 },
      { sessionId: "c", mtime: 200 },
    ];
    expect(toPickerViewModel(raw).map((s) => s.sessionId)).toEqual(["b", "c", "a"]);
  });

  it("does not mutate the input array", () => {
    const raw: RawSession[] = [
      { sessionId: "a", mtime: 100 },
      { sessionId: "b", mtime: 300 },
    ];
    toPickerViewModel(raw);
    expect(raw.map((s) => s.sessionId)).toEqual(["a", "b"]);
  });
});

describe("toPickerViewModel — title fallback chain", () => {
  it("prefers the summary", () => {
    const [item] = toPickerViewModel([
      { sessionId: "a", mtime: 1, summary: "Nice summary", firstUserMessage: "ignored" },
    ]);
    expect(item.title).toBe("Nice summary");
  });

  it("falls back to the (truncated) first user message when summary is absent or blank", () => {
    const [absent] = toPickerViewModel([{ sessionId: "a", mtime: 1, firstUserMessage: "First thing I said" }]);
    expect(absent.title).toBe("First thing I said");

    const [blank] = toPickerViewModel([
      { sessionId: "b", mtime: 1, summary: "   ", firstUserMessage: "real title" },
    ]);
    expect(blank.title).toBe("real title");
  });

  it("falls back to (untitled) when nothing usable is present", () => {
    const [item] = toPickerViewModel([{ sessionId: "a", mtime: 1 }]);
    expect(item.title).toBe("(untitled)");
  });

  it("truncates a long first user message and collapses whitespace", () => {
    const long = "x".repeat(100);
    const [item] = toPickerViewModel([{ sessionId: "a", mtime: 1, firstUserMessage: long }]);
    expect(item.title.length).toBe(81); // 80 chars plus ellipsis
    expect(item.title.endsWith("…")).toBe(true);
    expect(item.title.startsWith("x".repeat(80))).toBe(true);

    const [collapsed] = toPickerViewModel([
      { sessionId: "b", mtime: 1, firstUserMessage: "line one\n\nline   two" },
    ]);
    expect(collapsed.title).toBe("line one line two");
  });
});

describe("toPickerViewModel — optional fields", () => {
  it("maps sizeBytes and repoPath to null when absent", () => {
    const [item] = toPickerViewModel([{ sessionId: "a", mtime: 1 }]);
    expect(item.sizeBytes).toBeNull();
    expect(item.repoPath).toBeNull();
  });

  it("passes sizeBytes and repoPath through when present", () => {
    const [item] = toPickerViewModel([
      { sessionId: "a", mtime: 1, sizeBytes: 2048, repoPath: "/repo/blog" },
    ]);
    expect(item.sizeBytes).toBe(2048);
    expect(item.repoPath).toBe("/repo/blog");
  });
});
