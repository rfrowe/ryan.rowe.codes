import { describe, expect, it } from "vitest";
import { diffLines, toolDetail } from "./toolDetails";

describe("diffLines", () => {
  it("marks unchanged lines as context", () => {
    expect(diffLines("a\nb", "a\nb")).toEqual([
      { kind: "ctx", text: "a" },
      { kind: "ctx", text: "b" },
    ]);
  });

  it("shows a mid-line replacement as del then add, keeping surrounding context", () => {
    expect(diffLines("a\nb\nc", "a\nB\nc")).toEqual([
      { kind: "ctx", text: "a" },
      { kind: "del", text: "b" },
      { kind: "add", text: "B" },
      { kind: "ctx", text: "c" },
    ]);
  });

  it("treats an empty side as pure add / pure del", () => {
    expect(diffLines("", "x\ny")).toEqual([
      { kind: "add", text: "x" },
      { kind: "add", text: "y" },
    ]);
    expect(diffLines("x\ny", "")).toEqual([
      { kind: "del", text: "x" },
      { kind: "del", text: "y" },
    ]);
  });

  it("keeps common lines as context around an insertion", () => {
    expect(diffLines("a\nc", "a\nb\nc")).toEqual([
      { kind: "ctx", text: "a" },
      { kind: "add", text: "b" },
      { kind: "ctx", text: "c" },
    ]);
  });
});

describe("toolDetail", () => {
  it("renders an Edit as a single diff section with the file path", () => {
    const d = toolDetail("Edit", { file_path: "/x/post.mdx", old_string: "old", new_string: "new" });
    expect(d).toEqual({
      kind: "diff",
      filePath: "/x/post.mdx",
      sections: [{ lines: [{ kind: "del", text: "old" }, { kind: "add", text: "new" }] }],
    });
  });

  it("renders MultiEdit as one labelled section per edit", () => {
    const d = toolDetail("MultiEdit", {
      file_path: "/x/post.mdx",
      edits: [
        { old_string: "a", new_string: "b" },
        { old_string: "c", new_string: "d" },
      ],
    });
    if (d.kind !== "diff") throw new Error("expected diff");
    expect(d.sections.map((s) => s.label)).toEqual(["Edit 1 of 2", "Edit 2 of 2"]);
  });

  it("renders Write as full contents", () => {
    const d = toolDetail("Write", { file_path: "/x/post.mdx", content: "line1\nline2" });
    expect(d).toEqual({ kind: "write", filePath: "/x/post.mdx", content: "line1\nline2" });
  });

  it("renders Bash as a command with its description", () => {
    const d = toolDetail("Bash", { command: "ls -la", description: "list files" });
    expect(d).toEqual({ kind: "command", command: "ls -la", description: "list files" });
  });

  it("renders an unknown/MCP tool as a field list, blocking multiline/long values", () => {
    const d = toolDetail("mcp__studio__open_pr", {
      branch: "blog/x",
      body: "line1\nline2",
      confirm: true,
    });
    if (d.kind !== "fields") throw new Error("expected fields");
    expect(d.fields).toEqual([
      { key: "branch", value: "blog/x", block: false },
      { key: "body", value: "line1\nline2", block: true },
      { key: "confirm", value: "true", block: false },
    ]);
  });

  it("falls back to fields for a non-object input", () => {
    expect(toolDetail("Whatever", "just a string")).toEqual({ kind: "fields", fields: [] });
  });
});
