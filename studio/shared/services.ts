// Dependency-injection seams between the sidecar's internal services. Packages
// implement these interfaces and code against them (never importing each other's
// concrete files), so each package typechecks independently; the bootstrap
// constructs the concretes and injects them.

import type { ActiveDoc, EditorContext, PreviewState, Range, SessionMode } from "./types";
import type { PromptContext, SaveDraftRequest, SaveDraftResponse, ServerMessage } from "./protocol";
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
