// Dependency-injection seams between the sidecar's internal services. Packages
// implement these interfaces and code against them (never importing each other's
// concrete files), so each package typechecks independently; the bootstrap
// constructs the concretes and injects them.

import type { ActiveDoc, EditorContext, PreviewState, Range, SessionMode } from "./types";
import type { PromptContext, RebaseAbortResponse, SaveDraftRequest, SaveDraftResponse, ServerMessage, UpdateResponse } from "./protocol";
import type {
  DescribeResult,
  GetEditorContextResult,
  OpenPrInput,
  OpenPrResult,
  PostSummary,
  PreviewStatusResult,
  ScaffoldPostInput,
  ScaffoldPostResult,
} from "./mcpTools";
import type { SessionListItem } from "../sessions/pickerViewModel";

/** Authoritative in-memory mirror of the open post, editor, and preview. Emits ServerMessages to subscribers. */
export interface Store {
  getActiveDoc(): ActiveDoc | null;
  /** Load a post from disk as the active doc (computes initial rev, derives preview). */
  openPost(absPath: string): Promise<ActiveDoc>;
  getEditorContext(): EditorContext | null;
  setEditorContext(ctx: EditorContext): void;
  getPreview(): PreviewState;
  /** Subscribe to server-to-client messages (file.changed / preview.url / editor pushes). Returns unsubscribe. */
  subscribe(listener: (msg: ServerMessage) => void): () => void;
}

/** Runs the embedded Agent SDK session and streams events into the Store's subscribers. */
export interface AgentHost {
  select(mode: SessionMode, sessionId?: string): Promise<{ sessionId: string; mode: SessionMode }>;
  prompt(input: { promptId: string; text: string; context: PromptContext }): Promise<void>;
  resolveDirective(input: { promptId: string; path: string; range: Range; instruction: string }): Promise<void>;
  /** Server-composed prompt (F4's conflict-resolution dispatch): mints its own promptId and queues
   *  behind an in-flight turn rather than rejecting. `path` must be the active post. */
  dispatchSystemPrompt(input: { path: string; text: string }): Promise<{ promptId: string }>;
  cancel(promptId: string): void;
}

/** Studio MCP tool implementations (transport-agnostic; mounted in-process or over StreamableHTTP). */
export interface StudioTools {
  describe(): Promise<DescribeResult>;
  getEditorContext(): Promise<GetEditorContextResult>;
  listPosts(): Promise<PostSummary[]>;
  scaffoldPost(input: ScaffoldPostInput): Promise<ScaffoldPostResult>;
  previewStatus(): Promise<PreviewStatusResult>;
  openPr(input: OpenPrInput): Promise<OpenPrResult>;
}

/** Studio-run git/gh flows to origin (ship-as-PR and persist-draft); never invoked by the agent directly. */
export interface ShipService {
  diff(scope: "post" | "all", path?: string): Promise<{ status: string; diff: string; outsideCount: number }>;
  openPr(input: OpenPrInput): Promise<OpenPrResult>;
  /** Commit the post with the pinned identity and push its branch to origin, without opening a PR. */
  saveDraft(input: SaveDraftRequest): Promise<SaveDraftResponse>;
}

/** Enumerates prior sessions for the picker. */
export interface SessionsService {
  /**
   * Prior sessions for the picker. `scope: "post"` (the default the picker opens on) narrows to the
   * active post's worktree; `"all"` returns every session across the blog repo and its worktrees.
   */
  list(scope: "post" | "all"): Promise<SessionListItem[]>;
}

/** Update/Pull (F3) and its abort (F6); studio-run, never the agent. */
export interface GitOpsService {
  update(canonicalPath: string): Promise<UpdateResponse>;
  rebaseAbort(canonicalPath: string): Promise<RebaseAbortResponse>;
}

/** F4: hands a rebase conflict to the post's own agent session instead of a manual merge-conflict UI. */
export interface ConflictResolverService {
  /** F3 left `canonicalPath` conflicted: dispatch a system prompt and mark rebase.phase "resolving". */
  onConflict(canonicalPath: string, conflictedFiles: string[]): void;
  /** An agent turn ended; a no-op unless `promptId` belongs to a dispatch this service made. Callers
   *  fire-and-forget this; it resolves once any follow-up (finishing the rebase, a re-prompt) settles. */
  onTurnEnd(promptId: string): Promise<void>;
}

/** The bundle the bootstrap constructs and injects into the server factory. */
export interface StudioServices {
  store: Store;
  agentHost: AgentHost;
  tools: StudioTools;
  ship: ShipService;
  sessions: SessionsService;
  gitOps: GitOpsService;
  conflictResolver: ConflictResolverService;
}

// Re-export the injected value type used by the sidecar server factory.
export type { ActiveDoc };
