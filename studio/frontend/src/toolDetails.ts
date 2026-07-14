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
  | { kind: "fields"; fields: DetailField[] };

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

/**
 * Map a tool call to its detail view. Keys off the shape of `input` (old/new strings, an edits
 * array, content, a command) so it works for the SDK's native file tools (Edit/Write/MultiEdit/
 * NotebookEdit/Bash) regardless of exact naming; unknown tools fall through to a field list.
 */
export function toolDetail(toolName: string, input: unknown): ToolDetail {
  const obj = asRecord(input);
  const filePath = pick(obj, FILE_KEYS);

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

  // Anything else (MCP tools, Grep/Glob/Read, …): a clean field list.
  return { kind: "fields", fields: toFields(obj) };
}

function toFields(obj: Record<string, unknown>): DetailField[] {
  return Object.entries(obj).map(([key, v]) => {
    if (typeof v === "string") {
      return { key, value: v, block: v.includes("\n") || v.length > 72 };
    }
    if (v === null || typeof v === "number" || typeof v === "boolean") {
      return { key, value: String(v), block: false };
    }
    let json: string;
    try {
      json = JSON.stringify(v, null, 2);
    } catch {
      json = String(v);
    }
    return { key, value: json, block: true };
  });
}
