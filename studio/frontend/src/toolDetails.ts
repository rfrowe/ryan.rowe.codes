// Turn a tool call (name and raw input) into a structured, human-readable detail view model.
// Powers the permission prompt's approve-what-you-see UI and the transcript's tool cards:
// an edit becomes a line diff, a write shows the incoming contents, Bash shows the command,
// and everything else becomes a clean key/value field list instead of a raw JSON blob.
//
// Pure (no React/DOM) so the mapping + diff are unit-tested; ToolDetails.tsx renders the result.

export interface DiffLine {
  kind: "ctx" | "add" | "del";
  text: string;
}

export interface DiffSection {
  /** Set when a call carries multiple edits (MultiEdit); omitted for a single edit. */
  label?: string;
  lines: DiffLine[];
}

export interface DetailField {
  key: string;
  value: string;
  /** Render as a multi-line code block rather than an inline value. */
  block: boolean;
}

export type ToolDetail =
  | { kind: "diff"; filePath: string; sections: DiffSection[] }
  | { kind: "write"; filePath: string; content: string }
  | { kind: "command"; command: string; description?: string }
  | { kind: "ask"; questions: AskQuestionItem[] }
  | { kind: "fields"; fields: DetailField[] };

export interface AskOption {
  label: string;
  description: string;
  preview?: string;
}

export interface AskQuestionItem {
  question: string;
  header: string;
  options: AskOption[];
  multiSelect: boolean;
}

/** Longest-common-subsequence line diff (O(n·m), fine for the small snippets an Edit carries). */
export function diffLines(oldText: string, newText: string): DiffLine[] {
  const a = oldText.length === 0 ? [] : oldText.split("\n");
  const b = newText.length === 0 ? [] : newText.split("\n");
  const m = a.length;
  const n = b.length;
  // dp[i][j] = LCS length of a[i:] and b[j:]; extra row/col of zeros as the base case.
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      out.push({ kind: "ctx", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ kind: "del", text: a[i] });
      i++;
    } else {
      out.push({ kind: "add", text: b[j] });
      j++;
    }
  }
  while (i < m) out.push({ kind: "del", text: a[i++] });
  while (j < n) out.push({ kind: "add", text: b[j++] });
  return out;
}

function asRecord(input: unknown): Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {};
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** First present, non-empty string among `keys`, else "". */
function pick(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return "";
}

const FILE_KEYS = ["file_path", "filePath", "path", "notebook_path"];

/** Strip a matching `cwd` prefix from an absolute path, so the worktree dir doesn't repeat on every call. */
function relativize(absPath: string, cwd?: string): string {
  if (!cwd || absPath.length === 0) return absPath;
  const prefix = cwd.endsWith("/") ? cwd : `${cwd}/`;
  return absPath.startsWith(prefix) ? absPath.slice(prefix.length) : absPath;
}

/**
 * Map a tool call to its detail view. Keys off the shape of `input` (old/new strings, an edits
 * array, content, a command) so it works for the SDK's native file tools (Edit/Write/MultiEdit/
 * NotebookEdit/Bash) regardless of exact naming; unknown tools fall through to a field list. `cwd`
 * (the active post's worktree root) relativizes any absolute file path, in or out of that field list.
 */
export function toolDetail(toolName: string, input: unknown, cwd?: string): ToolDetail {
  const obj = asRecord(input);
  const filePath = relativize(pick(obj, FILE_KEYS), cwd);

  // MultiEdit: an ordered array of {old_string, new_string} edits against one file.
  const edits = obj.edits;
  if (Array.isArray(edits) && edits.length > 0 && edits.every((e) => typeof e === "object" && e !== null)) {
    const sections: DiffSection[] = edits.map((raw, idx) => {
      const e = raw as Record<string, unknown>;
      return {
        label: edits.length > 1 ? `Edit ${idx + 1} of ${edits.length}` : undefined,
        lines: diffLines(str(e.old_string ?? e.oldString), str(e.new_string ?? e.newString)),
      };
    });
    return { kind: "diff", filePath, sections };
  }

  // Edit / NotebookEdit: one old-to-new region.
  const oldS = obj.old_string ?? obj.oldString ?? obj.old_source;
  const newS = obj.new_string ?? obj.newString ?? obj.new_source;
  if (typeof oldS === "string" || typeof newS === "string") {
    return { kind: "diff", filePath, sections: [{ lines: diffLines(str(oldS), str(newS)) }] };
  }

  // Write: full file contents (there is no prior text to diff against at approval time).
  const content = obj.content ?? obj.file_text;
  if (typeof content === "string" && (/write/i.test(toolName) || filePath.length > 0)) {
    return { kind: "write", filePath, content };
  }

  // Bash: the command, plus the model's human description of it if given.
  if (typeof obj.command === "string") {
    return { kind: "command", command: obj.command, description: str(obj.description) || undefined };
  }

  // AskUserQuestion: the questions themselves, so the transcript can show what was asked (and, once
  // resolved, what was answered) instead of the raw schema.
  if (toolName === "AskUserQuestion") {
    const questions = parseAskQuestions(input);
    if (questions) return { kind: "ask", questions };
  }

  // Anything else (MCP tools, Grep/Glob/Read, …): a clean field list.
  return { kind: "fields", fields: toFields(obj, cwd) };
}

/**
 * Extract AskUserQuestion's `questions` array from its raw input, or null if the shape doesn't match
 * the tool's schema (defensive against SDK drift: the caller falls back to the generic field list).
 */
export function parseAskQuestions(input: unknown): AskQuestionItem[] | null {
  const questions = asRecord(input).questions;
  if (!Array.isArray(questions) || questions.length === 0) return null;
  const parsed: AskQuestionItem[] = [];
  for (const raw of questions) {
    if (typeof raw !== "object" || raw === null) return null;
    const q = raw as Record<string, unknown>;
    if (typeof q.question !== "string" || typeof q.header !== "string" || !Array.isArray(q.options)) return null;
    const options: AskOption[] = [];
    for (const rawOpt of q.options) {
      if (typeof rawOpt !== "object" || rawOpt === null) return null;
      const o = rawOpt as Record<string, unknown>;
      if (typeof o.label !== "string" || typeof o.description !== "string") return null;
      options.push({ label: o.label, description: o.description, preview: typeof o.preview === "string" ? o.preview : undefined });
    }
    parsed.push({ question: q.question, header: q.header, options, multiSelect: q.multiSelect === true });
  }
  return parsed;
}

function toFields(obj: Record<string, unknown>, cwd?: string): DetailField[] {
  return Object.entries(obj).map(([key, v]) => {
    if (typeof v === "string") {
      const value = FILE_KEYS.includes(key) ? relativize(v, cwd) : v;
      return { key, value, block: value.includes("\n") || value.length > 72 };
    }
    if (v === null || typeof v === "number" || typeof v === "boolean") {
      return { key, value: String(v), block: false };
    }
    const value = prettyValue(v, 0);
    return { key, value, block: value.includes("\n") || value.length > 72 };
  });
}

/** Depth past which prettyValue gives up on indentation and falls back to flat JSON. */
const PRETTY_VALUE_MAX_DEPTH = 8;

/**
 * Render a nested array/object as indented `key: value` / `- ` lines instead of braces-and-quotes
 * JSON, so an MCP tool's structured arguments read like prose rather than a data dump.
 */
function prettyValue(v: unknown, indent: number): string {
  if (v === null || v === undefined) return String(v);
  if (typeof v !== "object") return String(v);
  if (indent > PRETTY_VALUE_MAX_DEPTH) {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  const pad = "  ".repeat(indent);
  if (Array.isArray(v)) {
    if (v.length === 0) return "[]";
    return v
      .map((item) => {
        const rendered = prettyValue(item, indent + 1);
        return rendered.includes("\n") ? `${pad}-\n${rendered}` : `${pad}- ${rendered}`;
      })
      .join("\n");
  }
  const entries = Object.entries(v as Record<string, unknown>);
  if (entries.length === 0) return "{}";
  return entries
    .map(([k, val]) => {
      const rendered = prettyValue(val, indent + 1);
      return rendered.includes("\n") ? `${pad}${k}:\n${rendered}` : `${pad}${k}: ${rendered}`;
    })
    .join("\n");
}
