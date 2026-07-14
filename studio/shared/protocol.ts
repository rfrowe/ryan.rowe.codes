// Wire protocol between the studio SPA (browser) and the sidecar (Node): a WebSocket
// for the agent stream + doc-sync pushes, and REST DTOs for request/response calls.
// Both sides import this module; frozen contract.

import type { DocRev, PermissionDecision, PermissionMode, PreviewState, Range, SessionMode } from "./types";
import type { SessionListItem } from "../sessions/pickerViewModel";

export interface PromptContext {
  path: string;
  cursor: number;
  selection: Range | null;
  /**
   * The resolved target region for an inline (⌘K) prompt: the selection, or, with no
   * selection, the caret's current line. Carries the exact byte range and its current text so
   * the agent edits *this* region instead of resolving a bare offset. Absent for chat prompts.
   */
  anchor?: { from: number; to: number; text: string } | null;
}

// ---- WebSocket: client to server ----
export type ClientMessage =
  | { type: "prompt"; promptId: string; text: string; context: PromptContext }
  | { type: "resolveDirective"; promptId: string; path: string; range: Range; instruction: string }
  | { type: "cancel"; promptId: string }
  | { type: "session.select"; mode: SessionMode; sessionId?: string }
  | { type: "editor.state"; path: string; cursor: number; selection: Range | null; viewport: Range | null }
  // Open (or focus, if already open) an existing post as a tab; create a new post as a tab.
  // Each open post is backed by a git worktree at .claude/worktrees/blog/<slug> and its own session.
  | { type: "post.open"; requestId: string; path: string }
  | { type: "post.create"; requestId: string; title: string; slug: string; headline: string; created_at: string }
  // Close a tab: a tab with a draft (uncommitted/unmerged work) keeps its worktree/branch on disk
  // for re-open; a clean tab is torn down (worktree and branch) exactly like delete-draft. Rename the
  // active post's slug (renames the file, runs `git branch -m blog/<old> blog/<new>`, and moves the worktree).
  | { type: "post.close"; requestId: string; path: string }
  | { type: "post.rename"; requestId: string; path: string; newSlug: string }
  // Delete a draft post: remove its worktree and branch (never touches origin/main). Revert a post's
  // uncommitted edits to the branch's last commit (HEAD). Both are gated: with `confirm: false` the
  // sidecar replies `post.confirm` (what would be lost) instead of acting when content is at risk.
  | { type: "post.delete"; requestId: string; path: string; confirm: boolean }
  | { type: "post.revert"; requestId: string; path: string; confirm: boolean }
  // Toggle one MCP server on/off for the studio's sessions.
  | { type: "mcp.setEnabled"; requestId: string; server: string; enabled: boolean }
  // Set the permission mode for the studio's sessions (takes effect on the next turn). The sidecar
  // echoes the authoritative value back as `mode.status`.
  | { type: "mode.set"; mode: PermissionMode }
  // Answer an in-flight `permission.request` (by its requestId): allow once, allow and remember
  // (widen the session's permissions / grant the directory), or deny.
  | { type: "permission.response"; requestId: string; decision: PermissionDecision };

// ---- WebSocket: server to client ----
export type ServerMessage =
  | { type: "session"; sessionId: string; mode: SessionMode }
  | { type: "assistant.delta"; promptId: string; text: string }
  | { type: "assistant.message"; promptId: string; text: string }
  | { type: "tool.start"; promptId: string; toolUseId: string; name: string; input: unknown }
  | { type: "tool.end"; promptId: string; toolUseId: string; isError: boolean; exitCode?: number; resultPreview?: string }
  | { type: "file.changed"; path: string; text: string; rev: DocRev; origin: "agent" | "self" | "external" }
  | { type: "preview.url"; preview: PreviewState }
  | { type: "done"; promptId: string; stopReason: string }
  // Result of a post.open / post.create / post.close / post.rename / post.delete / post.revert
  // request (by requestId).
  | { type: "post.result"; requestId: string; ok: boolean; path?: string; error?: string }
  // A destructive op (delete/revert) sent with `confirm: false` would lose work: the sidecar
  // reports what would be lost so the SPA can raise a confirmation dialog. `changedFiles` counts
  // uncommitted files; `ahead` counts commits on the branch not yet in origin/<default>; `diff` is
  // the unified diff the confirm would discard (revert: `git diff HEAD`; delete: the full delta
  // from the published base plus synthesized diffs for untracked files).
  | { type: "post.confirm"; requestId: string; op: "delete" | "revert"; path: string; changedFiles: number; ahead: number; diff: string }
  // The active post changed (open/create/switch/rename); `file.changed` and `preview.url` follow.
  // `branch` is the post's real isolation branch (`blog/<date>_<slug>`), the branch the ship flow
  // pushes; the SPA displays it read-only rather than deriving (or inviting) a branch name.
  | { type: "active"; path: string; title: string; branch: string }
  // Authoritative set of open tabs (so agent-initiated creates update the bar too).
  | { type: "tabs"; open: { path: string; title: string }[] }
  // MCP server inventory and status for the status bar / toggle popover.
  | { type: "mcp.status"; servers: { name: string; status: string; enabled: boolean }[] }
  // The authoritative permission mode (broadcast on connect and whenever it changes) for the mode chip.
  | { type: "mode.status"; mode: PermissionMode }
  // The agent is asking to run a tool the current mode won't auto-approve (a classifier escalation,
  // an out-of-worktree edit, or an MCP/Bash call needing confirmation). `promptId` routes the card
  // to the owning tab's transcript; `title`/`description`/`reason` are the SDK's prompt text.
  | { type: "permission.request"; promptId: string; requestId: string; toolName: string; input: unknown; title?: string; description?: string; reason?: string }
  | { type: "error"; promptId?: string; message: string };

// ---- REST DTOs ----
export interface PutDocRequest {
  path: string;
  text: string;
  baseRev: DocRev;
}
export type PutDocResponse =
  | { ok: true; rev: DocRev }
  | { ok: false; error: "stale-rev"; currentRev: DocRev };

export interface DiffResponse {
  status: string;
  diff: string;
}

export interface SessionsResponse {
  sessions: SessionListItem[];
}

export interface PostSummaryDTO {
  path: string;
  title: string;
  url: string | null;
}
export interface PostsResponse {
  posts: PostSummaryDTO[];
}

/**
 * Canonical paths of posts with pending unshipped changes: uncommitted edits or commits not yet
 * in origin/<default> (the same signal that gates delete-draft). Powers the ⌘P palette's
 * "unshipped" badge. Reflects every git worktree actually on disk (open, stray from a failed
 * boot, or created outside the studio, e.g. on the CLI), not just this session's open tabs.
 */
export interface DirtyPostsResponse {
  dirty: string[];
}

export interface ShipRequest {
  branch: string;
  subject: string;
  body: string;
  scope: "post" | "all";
  confirm: boolean;
}
export type ShipResponse =
  | { ok: true; prUrl: string }
  | { ok: false; error: string; violations?: string[] };
