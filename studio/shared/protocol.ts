// Frozen wire protocol between the studio SPA and the sidecar: a WebSocket for the agent
// stream + doc-sync pushes, plus REST DTOs. Imported by both sides.

import type { DocRev, PermissionDecision, PermissionMode, PreviewState, Range, SessionMode } from "./types";
import type { SessionListItem } from "../sessions/pickerViewModel";

export interface PromptContext {
  path: string;
  cursor: number;
  selection: Range | null;
  // Target region for an inline (⌘K) prompt: the selection, or the caret's line if none. Carries
  // the byte range and its text so the agent edits this region, not a bare offset. Null for chat.
  anchor?: { from: number; to: number; text: string } | null;
}

// ---- WebSocket: client to server ----
export type ClientMessage =
  | { type: "prompt"; promptId: string; text: string; context: PromptContext }
  | { type: "resolveDirective"; promptId: string; path: string; range: Range; instruction: string }
  | { type: "cancel"; promptId: string }
  | { type: "session.select"; mode: SessionMode; sessionId?: string }
  | { type: "editor.state"; path: string; cursor: number; selection: Range | null; viewport: Range | null }
  // Open (or focus) an existing post as a tab. Each open post is backed by a git worktree and its
  // own session.
  | { type: "post.open"; requestId: string; path: string }
  | { type: "post.create"; requestId: string; title: string; slug: string; headline: string; created_at: string }
  // Close a tab: a draft (uncommitted/unmerged work) keeps its worktree/branch for re-open; a clean
  // tab is torn down like delete-draft.
  | { type: "post.close"; requestId: string; path: string }
  // Rename the active post's slug: renames the file, the branch, and the worktree.
  | { type: "post.rename"; requestId: string; path: string; newSlug: string }
  // Resolve a frontmatter/filename desync from the frontmatter side: rename file/worktree/branch to
  // match. The server derives the target from the post's frontmatter and runs the post.rename path.
  | { type: "post.completeRename"; requestId: string; path: string }
  // Inverse of completeRename: rewrite the frontmatter (slug/created_at) so the derived URL matches
  // the filename stem. An ordinary edit, not a git op.
  | { type: "post.revertUrl"; requestId: string; path: string }
  // Delete a draft (worktree + branch; never origin/main; always the whole worktree, so no scope), or
  // revert uncommitted edits to HEAD (post-only, or the whole worktree for scope "all"). Both gated:
  // with confirm:false the sidecar replies post.confirm when content is at risk. `scope` on a revert
  // is the caller's preference; omitted (the first request for a post, before any dialog is open),
  // the sidecar picks it ("all" if there's more than just the post, else "post") and echoes its
  // choice back on post.confirm.
  | { type: "post.delete"; requestId: string; path: string; confirm: boolean }
  | { type: "post.revert"; requestId: string; path: string; scope?: "post" | "all"; confirm: boolean }
  | { type: "mcp.setEnabled"; requestId: string; server: string; enabled: boolean }
  // Set the permission mode (takes effect next turn); the sidecar echoes it back as mode.status.
  | { type: "mode.set"; mode: PermissionMode }
  // Answer an in-flight permission.request: allow once, allow and remember (widen permissions), or deny.
  | { type: "permission.response"; requestId: string; decision: PermissionDecision }
  // Answer an in-flight AskUserQuestion permission.request with the human's picks, keyed by each
  // question's exact text (a multi-select's value is its chosen labels, comma-separated).
  | { type: "question.answer"; requestId: string; answers: Record<string, string> };

// One replayed turn fragment of a selected session's transcript, in chronological order: the
// author's prompt, a slice of the agent's prose, or a completed tool call (its result already
// previewed/redacted server-side, like the live stream). The studio's compact view of stored
// history, decoupled from the frontend's own ChatItem shape.
export interface SessionHistoryTool {
  toolUseId: string;
  name: string;
  input: unknown;
  isError: boolean;
  resultPreview: string;
}
export type SessionHistoryItem =
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string }
  | { kind: "tool"; tool: SessionHistoryTool };

// ---- WebSocket: server to client ----
export type ServerMessage =
  | { type: "session"; sessionId: string; mode: SessionMode }
  // The active post's newly-selected session and its full transcript: the prior conversation for a
  // resume/fork, or [] for a new session. Sent by session.select; the client replaces the active
  // tab's chat with `items` so the panel reflects the conversation the agent actually resumed
  // (or clears it for a fresh session) rather than leaving whatever was last on screen.
  | { type: "session.history"; sessionId: string; mode: SessionMode; items: SessionHistoryItem[] }
  | { type: "assistant.delta"; promptId: string; text: string }
  | { type: "assistant.message"; promptId: string; text: string }
  | { type: "tool.start"; promptId: string; toolUseId: string; name: string; input: unknown }
  | { type: "tool.end"; promptId: string; toolUseId: string; isError: boolean; exitCode?: number; resultPreview?: string }
  | { type: "file.changed"; path: string; text: string; rev: DocRev; origin: "agent" | "self" | "external" }
  | { type: "preview.url"; preview: PreviewState }
  | { type: "done"; promptId: string; stopReason: string }
  // Result of any post.* request (by requestId).
  | { type: "post.result"; requestId: string; ok: boolean; path?: string; error?: string }
  // A confirm:false destructive op would lose work: what would be lost, so the SPA can confirm.
  // changedFiles counts uncommitted files; ahead counts commits not yet safe anywhere else (its own
  // remote branch if pushed, else the primary branch); diff is the unified diff the op would discard.
  // scope is the effective scope this preview reflects: always
  // "all" for delete (never partial); for revert, the caller's choice or the sidecar's own pick when
  // the request omitted one.
  | {
      type: "post.confirm";
      requestId: string;
      op: "delete" | "revert";
      path: string;
      changedFiles: number;
      ahead: number;
      diff: string;
      scope: "post" | "all";
    }
  // A post was renamed (slug and/or date). Carries old-to-new so the client migrates the tab's
  // transcript, session, and pending permissions before the tabs/active/file.changed rebuild that
  // follows; without it the tab is rebuilt fresh and the conversation + SDK session are lost.
  | { type: "post.renamed"; oldPath: string; newPath: string; title: string; branch: string }
  // Frontmatter/filename name-sync for the active post (no path, like preview.url). synced:false means
  // the frontmatter stem `${date}_${slug}` differs from the filename stem: the editor banners and ship
  // is blocked. Mutually exclusive with a preview error (requires a valid derivation). canComplete/reason
  // say whether Complete-rename can proceed (false e.g. when the target stem is already open). Always
  // synced:true when there is no active post.
  | { type: "post.namesync"; synced: boolean; expectedStem?: string; currentStem?: string; canComplete?: boolean; reason?: string }
  // The active post's divergence from origin/<sessionBranch> (the base it forked from), recomputed on
  // activation and after a fetch. `behind` > 0 means origin's base carries commits this post isn't
  // built on (fetch, then rebase); `ahead` is the post's own commits, never a reason to warn. Carries
  // `path` so a result for a since-switched tab can be dropped rather than mislabel the active one.
  | { type: "post.divergence"; path: string; ahead: number; behind: number }
  // The active post changed (open/create/switch/rename); file.changed and preview.url follow. branch is
  // the post's isolation branch (`blog/<date>_<slug>`), shown read-only. worktreePath is the absolute
  // dir tool-call paths get shown relative to, so the transcript doesn't repeat it on every file path.
  | { type: "active"; path: string; title: string; branch: string; worktreePath: string }
  // Authoritative open-tab set (so agent-initiated creates update the bar too).
  | { type: "tabs"; open: { path: string; title: string }[] }
  | { type: "mcp.status"; servers: { name: string; status: string; enabled: boolean }[] }
  // Authoritative permission mode, broadcast on connect and whenever it changes.
  | { type: "mode.status"; mode: PermissionMode }
  // The studio's own branch/worktree (the "primary" branch new posts fork from and ship targets),
  // for the status popover. `ref` is a display label: `origin/<branch>` when the local branch is in
  // sync with (or behind) origin, else the bare `<branch>` when it carries commits origin doesn't
  // have (or has no origin ref). `worktree` is the absolute repo root the studio launched from.
  | { type: "studio.branch"; ref: string; worktree: string }
  // The agent wants to run a tool the current mode won't auto-approve. promptId routes the card to the
  // owning tab; title/description/reason are the SDK's prompt text. toolUseId matches the tool.start
  // for the same call, if any, so the client can attach the human's answer back onto that transcript
  // entry once resolved (used for AskUserQuestion).
  | { type: "permission.request"; promptId: string; requestId: string; toolName: string; input: unknown; title?: string; description?: string; reason?: string; toolUseId?: string }
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
  /** Changed paths (tracked or untracked) outside the blog dir, regardless of the requested scope:
   *  what a "post"-scoped ship/save-draft would leave behind. Powers the nudge toward scope "all". */
  outsideCount: number;
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

// Post status across every worktree on disk (not just this session's open tabs). `dirty` = unshipped
// work (uncommitted edits, or commits not yet safe anywhere else), powering the ⌘P palette badge and
// tab dot. `uncommitted` ⊆ `dirty` = posts with uncommitted edits, so the UI can gate "Revert to
// clean" (which only discards uncommitted edits) off a clean-but-ahead post.
export interface DirtyPostsResponse {
  dirty: string[];
  uncommitted: string[];
}

// A `blog/<stem>` branch's status, covering every stem regardless of whether it's open or
// published (including one left by a sidecar that died or a tab that was closed), otherwise
// invisible to both the open-tabs set and the main-tree /posts listing. path is the canonical path
// to reopen it at; stem is its date-qualified identity; local means a worktree already exists for
// it on disk; remote means it's been pushed to origin (via ship or save-draft); stale means the
// branch is already merged into the default branch, so reopening forks a fresh one over it instead
// of adopting its (shipped) content.
export interface BranchStatus {
  path: string;
  stem: string;
  local: boolean;
  remote: boolean;
  stale: boolean;
}
export interface BranchesResponse {
  branches: BranchStatus[];
}

export interface ShipRequest {
  branch: string;
  subject: string;
  body: string;
  scope: "post" | "all";
  confirm: boolean;
}
export type ShipResponse =
  | { ok: true; prUrl: string; previewUrl?: string }
  | { ok: false; error: string; violations?: string[] };

// Persist a draft to origin without opening a PR: commit the post with the pinned identity and push
// its `blog/<stem>` isolation branch, so the draft survives locally-detached (reopened as a remote
// draft from ⌘P, or checked out in another editor). `path` selects the post (any open tab), defaulting
// to the active one. `scope` mirrors ship's: "post" stages only the blog tree, "all" the whole
// worktree, safe here in a way it isn't for ship, since a draft never opens a PR against main.
export interface SaveDraftRequest {
  path?: string;
  subject: string;
  body: string;
  scope: "post" | "all";
  confirm: boolean;
}
// `committed` is false when there was nothing uncommitted to stage (an already-committed branch just
// gets pushed); `noop` is true when the local branch already matched origin, so nothing was pushed.
export type SaveDraftResponse =
  | { ok: true; branch: string; committed: boolean; pushed: boolean; noop: boolean }
  | { ok: false; error: string };

// Result of the persistent git-fetch button: `git fetch --prune origin` (the one place the studio
// pulls from origin — it's otherwise offline by design), after which the sidecar republishes the
// active post's divergence so its warning reflects the newly-fetched refs.
export type FetchResponse = { ok: true } | { ok: false; error: string };
