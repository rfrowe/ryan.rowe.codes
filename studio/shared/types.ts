// Core domain types for the authoring studio. Shared contract that every package builds against.

/** Offset into document text, in UTF-16 code units (matches JS string / CodeMirror). */
export type Offset = number;

export interface DocRev {
  /** Monotonic counter bumped on every accepted write. */
  n: number;
  /** Content hash (e.g. sha256 hex) of the text at this rev. */
  hash: string;
}

export interface ActiveDoc {
  /** Absolute path on disk. */
  path: string;
  /** Exact document text (UTF-8 decoded); never reformatted. */
  text: string;
  rev: DocRev;
}

export interface Range {
  from: Offset;
  to: Offset;
}

export interface EditorContext {
  path: string;
  cursor: Offset;
  selection: Range | null;
  viewport: Range | null;
}

export type PreviewState =
  | { valid: true; url: string; errors?: never }
  | { valid: false; url: null; errors: string[] };

export type SessionMode = "new" | "resume" | "fork";

/**
 * The permission modes the studio surfaces in the mode chip: a deliberately safe subset of the
 * Agent SDK's modes. `auto` lets a model classifier approve safe calls and ask on risk;
 * `acceptEdits` auto-accepts in-worktree file edits; `default` prompts for anything not
 * pre-approved. The SDK's `bypassPermissions` (would skip the approve/deny gate), `dontAsk`
 * (silent-deny), and `plan` (no execution) are intentionally not exposed.
 */
export type PermissionMode = "auto" | "acceptEdits" | "default";

/** A human's answer to a `permission.request`: allow once, allow and remember, or deny. */
export type PermissionDecision = "allow" | "always" | "deny";

export interface AgentState {
  sessionId: string | null;
  mode: SessionMode;
}

/** A single replacement. Offsets are against the original text (not cumulative). */
export interface TextEdit {
  from: Offset;
  to: Offset;
  insert: string;
}

/** The sidecar's authoritative in-memory mirror of the open post and session. */
export interface SharedState {
  activeDoc: ActiveDoc | null;
  editorContext: EditorContext | null;
  preview: PreviewState;
  agent: AgentState;
}
