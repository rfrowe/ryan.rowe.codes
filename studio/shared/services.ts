// Dependency-injection seams between the sidecar's internal services. Packages
// implement these interfaces and code against them (never importing each other's
// concrete files), so each package typechecks independently; the bootstrap
// constructs the concretes and injects them.

import type { ActiveDoc, DocRev, EditorContext, PreviewState, Range, SessionMode, TextEdit } from "./types";
import type { PromptContext, ServerMessage } from "./protocol";
import type {
  ApplyEditResult,
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
  /** Persist exact text to the active doc's path (autosave / self-write); returns new rev or stale-rev. */
  writeActive(
    text: string,
    baseRev: DocRev,
  ): Promise<{ ok: true; rev: DocRev } | { ok: false; error: "stale-rev"; currentRev: DocRev }>;
  /** Apply structured edits, rev-checked: the store's structured-mutation seam. */
  applyEdit(input: { path: string; rev: DocRev; edits: TextEdit[] }): Promise<ApplyEditResult>;
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

/** Studio-run git/gh ship flow (never invoked by the agent directly). */
export interface ShipService {
  diff(scope: "post" | "all"): Promise<{ status: string; diff: string }>;
  openPr(input: OpenPrInput): Promise<OpenPrResult>;
}

/** Enumerates prior sessions for the picker. */
export interface SessionsService {
  list(): Promise<SessionListItem[]>;
}

/** The bundle the bootstrap constructs and injects into the server factory. */
export interface StudioServices {
  store: Store;
  agentHost: AgentHost;
  tools: StudioTools;
  ship: ShipService;
  sessions: SessionsService;
}

// Re-export the injected value type used by the sidecar server factory.
export type { ActiveDoc };
