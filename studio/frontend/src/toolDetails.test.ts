import { describe, expect, it } from "vitest";
import { diffLines, parseAskQuestions, toolDetail } from "./toolDetails";

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

  it("renders AskUserQuestion as its questions, not a field list", () => {
    const input = {
      questions: [
        { question: "Which color?", header: "Color", options: [{ label: "Red", description: "Pick red." }], multiSelect: false },
      ],
    };
    const d = toolDetail("AskUserQuestion", input);
    expect(d.kind).toBe("ask");
    if (d.kind !== "ask") throw new Error("expected ask");
    expect(d.questions).toEqual(parseAskQuestions(input));
  });

  it("renders a nested array/object field as indented lines instead of JSON", () => {
    const d = toolDetail("mcp__example__ask", {
      questions: [{ label: "Red", tags: ["a", "b"] }],
    });
    if (d.kind !== "fields") throw new Error("expected fields");
    expect(d.fields).toEqual([
      {
        key: "questions",
        value: "-\n  label: Red\n  tags:\n    - a\n    - b",
        block: true,
      },
    ]);
  });

  it("relativizes an absolute file path against cwd, in both diff and field views", () => {
    const cwd = "/repo/.worktrees/blog/x";
    const edit = toolDetail("Edit", { file_path: `${cwd}/src/content/blog/x.mdx`, old_string: "a", new_string: "b" }, cwd);
    expect(edit).toMatchObject({ filePath: "src/content/blog/x.mdx" });

    const read = toolDetail("Read", { file_path: `${cwd}/src/content/blog/x.mdx` }, cwd);
    if (read.kind !== "fields") throw new Error("expected fields");
    expect(read.fields).toEqual([{ key: "file_path", value: "src/content/blog/x.mdx", block: false }]);
  });

  it("leaves a path outside cwd untouched", () => {
    const d = toolDetail("Read", { file_path: "/elsewhere/x.mdx" }, "/repo/.worktrees/blog/x");
    if (d.kind !== "fields") throw new Error("expected fields");
    expect(d.fields).toEqual([{ key: "file_path", value: "/elsewhere/x.mdx", block: false }]);
  });
});

describe("parseAskQuestions", () => {
  it("extracts a well-formed AskUserQuestion input", () => {
    const input = {
      questions: [
        {
          question: "Which color?",
          header: "Color",
          options: [
            { label: "Red", description: "Pick red." },
            { label: "Blue", description: "Pick blue.", preview: "🔵" },
          ],
          multiSelect: false,
        },
      ],
    };
    expect(parseAskQuestions(input)).toEqual([
      {
        question: "Which color?",
        header: "Color",
        options: [
          { label: "Red", description: "Pick red.", preview: undefined },
          { label: "Blue", description: "Pick blue.", preview: "🔵" },
        ],
        multiSelect: false,
      },
    ]);
  });

  it("returns null for a non-AskUserQuestion shape", () => {
    expect(parseAskQuestions({ command: "ls" })).toBeNull();
    expect(parseAskQuestions({ questions: "not an array" })).toBeNull();
    expect(parseAskQuestions({ questions: [{ question: "Q", header: "H", options: "nope" }] })).toBeNull();
  });
});
