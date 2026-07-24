// Top-level studio shell. Owns the WebSocket and reduces the agent stream and doc-sync pushes into
// per-tab state: each open post (a git worktree and its own session) has its own editor buffer,
// preview URL, and chat thread. The tab bar and active post follow the authoritative tabs/active
// broadcasts; the editor/preview/chat panes render the active tab.

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Editor, type EditorHandle } from "./Editor";
import { Preview } from "./Preview";
import { Chat, type ChatItem, type PendingPermission } from "./Chat";
import { SessionPicker } from "./SessionPicker";
import { ShipPanel } from "./ShipPanel";
import { SaveDraftPanel } from "./SaveDraftPanel";
import { TabBar, type StackComponent } from "./TabBar";
import { NewPostDialog, type NewPostFields } from "./NewPostDialog";
import { CommandPalette } from "./CommandPalette";
import { KeymapProvider } from "./keymap";
import { useCommand } from "./useCommand";
import { ShortcutsPanel } from "./ShortcutsPanel";
import { McpStatusBar, type McpServerStatus } from "./McpStatusBar";
import { Modal } from "./Modal";
import { WarnIcon } from "./WarnIcon";
import { DestructiveConfirm, type DestructiveConfirmData } from "./DestructiveConfirm";
import { RootConflictBanner } from "./RootConflictBanner";
import { rootConflictPhase } from "./turnSelectors";
import type { Scope } from "./ScopeSelector";
import { StudioSocket, type SocketStatus } from "./ws";
import { onLspStatus, type LspStatus } from "./lsp/client";
import { fetchRemote, getLossPreview, rebaseAbort, saveDraft, update, updateRoot } from "./api";
import { slugFromPath } from "./slug";
import { PREVIEW_ENDPOINT, SIDECAR_ENDPOINT } from "./config";
import { EMPTY_GIT, selectRootName } from "./gitSelectors";
import { DEFAULT_EFFORT, DEFAULT_MODEL } from "../../shared/types";
import type { AgentState, ClaudeModel, DocRev, EffortLevel, PermissionDecision, PermissionMode, PreviewState, Range, SessionMode } from "../../shared/types";
import type { DiffResponse, GitState, PromptContext, ServerMessage } from "../../shared/protocol";

interface DocState {
  path: string;
  text: string;
  rev: DocRev;
}

/** Frontmatter/filename name-sync status for a tab (from `post.namesync`); default synced. */
interface NameSync {
  synced: boolean;
  expectedStem?: string;
  currentStem?: string;
  canComplete?: boolean;
  reason?: string;
}
const SYNCED: NameSync = { synced: true };

// Everything scoped to one open post/tab. Buffers survive tab switches (kept here, keyed by path).
interface TabState {
  path: string;
  title: string;
  /** The post's worktree root (from `active`), so tool-call file paths drop that prefix; null until first activated. */
  worktreePath: string | null;
  doc: DocState | null;
  /** Buffer patch for the editor; version increments on each agent/reconciled write. */
  remoteUpdate: { text: string; version: number; kind: "agent" | "reload" } | null;
  preview: PreviewState;
  session: AgentState;
  chat: ChatItem[];
  /** In-flight permission prompts for this tab's turn. */
  permissions: PendingPermission[];
  /** Pending disk change from an external writer, awaiting the reload banner. `origin` picks the
   *  banner copy: "git" traces to a checkout/commit/reset, "external" to an out-of-band editor. */
  externalChange: { text: string; rev: DocRev; origin: "external" | "git" } | null;
  nameSync: NameSync;
}

/** The root's own conversation: a server-dispatched conflict resolution has no tab of its own, so its
 *  chat/permissions live here instead of in `tabs`. */
interface RootConflictState {
  chat: ChatItem[];
  permissions: PendingPermission[];
}
const EMPTY_ROOT_CONFLICT: RootConflictState = { chat: [], permissions: [] };

export interface StudioState {
  tabs: TabState[];
  activePath: string | null;
  mcp: McpServerStatus[];
  /** Authoritative permission mode (from `mode.status`), shown + edited via the mode chip. */
  mode: PermissionMode;
  /** Authoritative model (from `model.status`), shown + edited via the model chip. */
  model: ClaudeModel;
  /** Authoritative reasoning effort (from `effort.status`), shown + edited via the effort chip. */
  effort: EffortLevel;
  /** The single in-flight turn (the backend serializes one at a time) and the tab that owns it. */
  turn: { promptId: string; path: string } | null;
  /** Whether `turn`'s own promptId has produced any real content yet (a delta/message/tool.start). A
   *  system dispatch's chat.injected fires the moment it's queued OR started, so this is the only way
   *  to tell "genuinely running" from "still waiting behind another live turn". */
  turnStarted: boolean;
  /** promptId to owning tab path. Outlives `turn` so a stale done/error still routes correctly. */
  promptOwners: Record<string, string>;
  /** Every git fact (from `git.state`), replaced wholesale on each push. */
  git: GitState;
  rootConflict: RootConflictState;
}

export type Action =
  | { type: "server"; msg: ServerMessage }
  | { type: "sendPrompt"; promptId: string; text: string; path: string }
  // Release a turn whose terminal done/error can no longer arrive (the socket dropped).
  | { type: "resetTurn" }
  | { type: "revUpdated"; path: string; rev: DocRev }
  | { type: "captureBuffer"; path: string; text: string }
  | { type: "switchTab"; path: string }
  | { type: "applyExternal"; path: string }
  | { type: "dismissExternal"; path: string }
  // Locally drop a permission card once answered (the response is sent over the socket separately).
  // toolUseId/answers, when given, record an AskUserQuestion's picks onto its transcript tool entry.
  | { type: "answerPermission"; path: string; requestId: string; toolUseId?: string; answers?: Record<string, string> }
  // The human dismissed the root-conflict banner's last outcome; clears it back to empty (hidden).
  | { type: "dismissRootConflict" };

let idSeq = 0;
function nid(): string {
  idSeq += 1;
  return `i${idSeq}-${Math.random().toString(36).slice(2, 8)}`;
}

const WAITING_PREVIEW: PreviewState = { valid: false, url: null, errors: ["Waiting for the sidecar preview…"] };

// ---- stack-status dot mapping (SocketStatus / LspStatus / MCP status to a shared health level) ----
type Health = StackComponent["status"];
function socketHealth(s: SocketStatus): Health {
  return s === "open" ? "ok" : s === "connecting" ? "connecting" : "down";
}
function lspHealth(s: LspStatus): Health {
  return s === "open" ? "ok" : s === "connecting" ? "connecting" : s === "disabled" ? "disabled" : "down";
}
function mcpHealth(status: string, enabled: boolean): Health {
  if (!enabled || status === "disabled") return "disabled";
  if (status === "connected") return "ok";
  if (status === "needs-auth" || status === "connecting") return "connecting";
  return "down";
}

function makeTab(path: string, title: string): TabState {
  return {
    path,
    title,
    worktreePath: null,
    doc: null,
    remoteUpdate: null,
    preview: WAITING_PREVIEW,
    session: { sessionId: null, mode: "new" },
    chat: [],
    permissions: [],
    externalChange: null,
    nameSync: SYNCED,
  };
}

export const initialState: StudioState = {
  tabs: [],
  activePath: null,
  mcp: [],
  mode: "auto",
  model: DEFAULT_MODEL,
  effort: DEFAULT_EFFORT,
  turn: null,
  turnStarted: false,
  promptOwners: {},
  git: EMPTY_GIT,
  rootConflict: EMPTY_ROOT_CONFLICT,
};

// ---- chat transcript helpers (operate on one tab's chat) ----

/** Append `text` to the current streaming assistant block for `promptId`, else start one. */
function appendAssistant(chat: ChatItem[], promptId: string, text: string): ChatItem[] {
  for (let i = chat.length - 1; i >= 0; i--) {
    const it = chat[i];
    if (it.kind === "assistant" && it.promptId === promptId && it.streaming) {
      const next = chat.slice();
      next[i] = { ...it, text: it.text + text };
      return next;
    }
  }
  return [...chat, { kind: "assistant", id: nid(), promptId, text, streaming: true }];
}

function finalizeAssistant(chat: ChatItem[], promptId: string, finalText: string): ChatItem[] {
  for (let i = chat.length - 1; i >= 0; i--) {
    const it = chat[i];
    if (it.kind === "assistant" && it.promptId === promptId && it.streaming) {
      const next = chat.slice();
      next[i] = { ...it, text: finalText, streaming: false };
      return next;
    }
  }
  return [...chat, { kind: "assistant", id: nid(), promptId, text: finalText, streaming: false }];
}

function stopStreaming(chat: ChatItem[], promptId: string): ChatItem[] {
  return chat.map((it) =>
    it.kind === "assistant" && it.promptId === promptId && it.streaming ? { ...it, streaming: false } : it,
  );
}

function patchTab(state: StudioState, path: string | null, fn: (t: TabState) => TabState): StudioState {
  if (path === null) return state;
  return { ...state, tabs: state.tabs.map((t) => (t.path === path ? fn(t) : t)) };
}

/** Which tab a stream message belongs to: its prompt's owner, else the active tab. */
function ownerOf(state: StudioState, promptId: string): string | null {
  return state.promptOwners[promptId] ?? state.activePath;
}

/** Whether `path` is the studio root's own worktree rather than a post, so a server-dispatched
 *  target's stream messages route to the root-conflict banner instead of a (never-matching) tab. */
function isRootPath(state: StudioState, path: string): boolean {
  return path !== "" && path === state.git.primary.worktree;
}

/** Like patchTab, but for a stream message's chat transcript: routes a root-targeted message into the
 *  root-conflict banner's own transcript instead of a post's tab. */
function patchOwnerChat(state: StudioState, path: string | null, fn: (chat: ChatItem[]) => ChatItem[]): StudioState {
  if (path === null) return state;
  if (isRootPath(state, path)) return { ...state, rootConflict: { ...state.rootConflict, chat: fn(state.rootConflict.chat) } };
  return patchTab(state, path, (t) => ({ ...t, chat: fn(t.chat) }));
}

/** Like patchOwnerChat, for a pending-permissions list. */
function patchOwnerPermissions(
  state: StudioState,
  path: string | null,
  fn: (permissions: PendingPermission[]) => PendingPermission[],
): StudioState {
  if (path === null) return state;
  if (isRootPath(state, path)) return { ...state, rootConflict: { ...state.rootConflict, permissions: fn(state.rootConflict.permissions) } };
  return patchTab(state, path, (t) => ({ ...t, permissions: fn(t.permissions) }));
}

/** Marks `promptId`'s turn as the one holding the global lock and having produced real content. A
 *  system dispatch that arrived queued (chat.injected landed while another turn held the latch, so it
 *  never took over `turn`) is only provably running once its own content starts arriving; this is
 *  that proof, and takes over the latch at that point. A no-op past the first call for a given promptId. */
function claimTurn(state: StudioState, promptId: string): StudioState {
  if (state.turn?.promptId === promptId) return state.turnStarted ? state : { ...state, turnStarted: true };
  const path = state.promptOwners[promptId];
  if (path === undefined) return state; // no known owner (e.g. a stale replay); leave turn alone.
  return { ...state, turn: { promptId, path }, turnStarted: true };
}

/** Whether a revert-scope /diff response is still the one most recently requested. A rapid
 *  Post-only/Everything double-toggle can let an older response resolve after a newer one; only
 *  the response matching the current sequence should ever reach the dialog. */
export function isLatestRevertScopeRequest(requestSeq: number, latestSeq: number): boolean {
  return requestSeq === latestSeq;
}

/** Whether an external/git file.changed rev is a duplicate replay of the buffer's current rev, not
 *  a genuine change. A WS reconnect can resend the rev the buffer already has; a sidecar restart
 *  resets the rev counter, so a reconnect afterward can carry a LOWER rev whose hash still differs,
 *  meaning the content on disk genuinely moved and must not be dropped as stale. */
export function isDuplicateExternalRev(incoming: DocRev, current: DocRev): boolean {
  return incoming.n <= current.n && incoming.hash === current.hash;
}

function reduceServer(state: StudioState, msg: ServerMessage): StudioState {
  switch (msg.type) {
    case "session":
      // No path in the message; the session belongs to the active (just-selected) post. Metadata
      // only (e.g. the SDK settling on an id mid-turn); the transcript is never touched here so a
      // live turn's streaming block survives.
      return patchTab(state, state.activePath, (t) => ({
        ...t,
        session: { sessionId: msg.sessionId, mode: msg.mode },
      }));

    case "session.history": {
      // A session was just selected for the active post: replace the transcript with the resumed
      // conversation (or clear it for a new session), so the panel matches the context the agent
      // resumed instead of leaving the previous session's messages on screen. Parked permission
      // cards belonged to that old conversation, so drop them too.
      const chat: ChatItem[] = msg.items.map((it): ChatItem => {
        if (it.kind === "user") return { kind: "user", id: nid(), text: it.text };
        if (it.kind === "assistant")
          return { kind: "assistant", id: nid(), promptId: "history", text: it.text, streaming: false };
        return {
          kind: "tool",
          id: nid(),
          toolUseId: it.tool.toolUseId,
          name: it.tool.name,
          input: it.tool.input,
          status: "done",
          isError: it.tool.isError,
          resultPreview: it.tool.resultPreview,
        };
      });
      return patchTab(state, state.activePath, (t) => ({
        ...t,
        session: { sessionId: msg.sessionId, mode: msg.mode },
        chat,
        permissions: [],
      }));
    }

    case "assistant.delta": {
      const claimed = claimTurn(state, msg.promptId);
      return patchOwnerChat(claimed, ownerOf(claimed, msg.promptId), (chat) => appendAssistant(chat, msg.promptId, msg.text));
    }

    case "assistant.message": {
      const claimed = claimTurn(state, msg.promptId);
      return patchOwnerChat(claimed, ownerOf(claimed, msg.promptId), (chat) => finalizeAssistant(chat, msg.promptId, msg.text));
    }

    case "tool.start": {
      const claimed = claimTurn(state, msg.promptId);
      return patchOwnerChat(claimed, ownerOf(claimed, msg.promptId), (chat) => [
        ...chat,
        { kind: "tool", id: nid(), toolUseId: msg.toolUseId, name: msg.name, input: msg.input, status: "running" },
      ]);
    }

    case "tool.end": {
      const claimed = claimTurn(state, msg.promptId);
      return patchOwnerChat(claimed, ownerOf(claimed, msg.promptId), (chat) =>
        chat.map((it) =>
          it.kind === "tool" && it.toolUseId === msg.toolUseId
            ? { ...it, status: "done", isError: msg.isError, exitCode: msg.exitCode, resultPreview: msg.resultPreview }
            : it,
        ),
      );
    }

    case "file.changed": {
      // Route by path. tabs is authoritative: a change for a path with no open tab is ignored
      // rather than resurrecting a closed one.
      const tab = state.tabs.find((t) => t.path === msg.path);
      if (!tab) return state;
      const nextDoc: DocState = { path: msg.path, text: msg.text, rev: msg.rev };
      // First load bootstraps the buffer regardless of origin (editor seeds from doc.text).
      if (!tab.doc) return patchTab(state, msg.path, (t) => ({ ...t, doc: nextDoc }));
      if (msg.origin === "self") {
        // Our own autosave echoed back: adopt the rev, no buffer patch.
        return patchTab(state, msg.path, (t) => ({ ...t, doc: nextDoc }));
      }
      if (msg.origin === "agent") {
        // "agent" origin also covers store-mediated rewrites (revert, revertUrl, relayout) that
        // mean to win outright, not merge with whatever's unsaved in the buffer — they're never
        // turn-driven, so only rebase onto local edits when a turn is actually live for this path.
        const kind = state.turn?.path === msg.path ? "agent" : "reload";
        return patchTab(state, msg.path, (t) => ({
          ...t,
          doc: nextDoc,
          remoteUpdate: { text: msg.text, version: (t.remoteUpdate?.version ?? 0) + 1, kind },
        }));
      }
      // external/git: a duplicate rev (same content, not strictly newer) is a replay, e.g. after a
      // WS reconnect. A sidecar restart resets the rev counter, so compare the hash too, or a
      // reconnect afterward can carry a lower rev whose content genuinely changed and get dropped.
      if (isDuplicateExternalRev(msg.rev, tab.doc.rev)) return state;
      // A real disk write from outside the studio. Don't clobber the buffer, but advance the base
      // rev so autosave keeps working, and surface the reload banner.
      const origin = msg.origin;
      return patchTab(state, msg.path, (t) => ({
        ...t,
        doc: { ...t.doc!, rev: msg.rev },
        externalChange: { text: msg.text, rev: msg.rev, origin },
      }));
    }

    case "preview.url":
      // No path in the message; the sidecar previews the active post.
      return patchTab(state, state.activePath, (t) => ({ ...t, preview: msg.preview }));

    case "post.namesync":
      // Active-post-scoped (no path), like preview.url: the frontmatter/filename sync status.
      return patchTab(state, state.activePath, (t) => ({
        ...t,
        nameSync: {
          synced: msg.synced,
          expectedStem: msg.expectedStem,
          currentStem: msg.currentStem,
          canComplete: msg.canComplete,
          reason: msg.reason,
        },
      }));

    case "chat.injected": {
      // A server-composed prompt (no client sendPrompt action fired it): insert the bubble and
      // register the owner unconditionally. Only take the global latch if nothing else currently
      // holds it — the backend already commits to this dispatch before knowing whether the agent is
      // busy, so a dispatch that's actually queued behind a still-running turn must not steal that
      // turn's busy indicator (claimTurn takes the latch back once this one's own content arrives).
      const next = patchOwnerChat(state, msg.path, (chat) => [...chat, { kind: "system", id: nid(), text: msg.text }]);
      const promptOwners = { ...next.promptOwners, [msg.promptId]: msg.path };
      if (next.turn && next.turn.promptId !== msg.promptId) return { ...next, promptOwners };
      return { ...next, turn: { promptId: msg.promptId, path: msg.path }, turnStarted: false, promptOwners };
    }

    case "done": {
      const owner = state.promptOwners[msg.promptId] ?? null;
      // A finished turn has no live prompts; drop any pending cards so none dangle unanswerable.
      let next = owner
        ? patchOwnerPermissions(patchOwnerChat(state, owner, (chat) => stopStreaming(chat, msg.promptId)), owner, () => [])
        : state;
      // Only release the latch for our in-flight turn; a done for a stale/rebroadcast prompt must not.
      if (next.turn && msg.promptId === next.turn.promptId) next = { ...next, turn: null, turnStarted: false };
      return next;
    }

    case "error": {
      // A promptId-tagged error routes to that prompt's owner; an untagged one is shown on the active tab.
      const owner = msg.promptId !== undefined ? ownerOf(state, msg.promptId) : state.activePath;
      let next = patchOwnerPermissions(
        patchOwnerChat(state, owner, (chat) => [...chat, { kind: "error", id: nid(), text: msg.message }]),
        owner,
        () => [],
      );
      // Release the latch when the error is for our own turn, or carries no prompt id.
      if (next.turn && (msg.promptId === undefined || msg.promptId === next.turn.promptId)) {
        next = { ...next, turn: null, turnStarted: false };
      }
      return next;
    }

    case "post.renamed": {
      // Migrate the tab's conversation state onto the new path before the tabs/active/file.changed
      // that follow, so the transcript, session, and permissions survive (the tabs handler then
      // preserves this migrated tab by path rather than making a fresh one).
      //
      // Drop the pre-rename doc/remoteUpdate: the rename rewrote the frontmatter slug, so that buffer
      // is stale, and the file.changed right after re-seeds it via the tab's `!doc` bootstrap (carrying
      // the old lower-rev doc would trip a spurious external-change banner).
      if (msg.oldPath === msg.newPath) return state;
      const tabs = state.tabs.map((t) =>
        t.path === msg.oldPath
          ? { ...t, path: msg.newPath, title: msg.title, doc: null, remoteUpdate: null, externalChange: null, nameSync: SYNCED }
          : t,
      );
      const activePath = state.activePath === msg.oldPath ? msg.newPath : state.activePath;
      const promptOwners = Object.fromEntries(
        Object.entries(state.promptOwners).map(([id, p]) => [id, p === msg.oldPath ? msg.newPath : p]),
      );
      const turn = state.turn && state.turn.path === msg.oldPath ? { ...state.turn, path: msg.newPath } : state.turn;
      return { ...state, tabs, activePath, promptOwners, turn };
    }

    case "active": {
      // Ensure a tab entry exists (in case `active` lands before `tabs`), then focus it.
      const exists = state.tabs.some((t) => t.path === msg.path);
      const tabs = exists
        ? state.tabs.map((t) => (t.path === msg.path ? { ...t, title: msg.title, worktreePath: msg.worktreePath } : t))
        : [...state.tabs, { ...makeTab(msg.path, msg.title), worktreePath: msg.worktreePath }];
      return { ...state, tabs, activePath: msg.path };
    }

    case "tabs": {
      // Authoritative open set. Preserve existing buffers (keyed by path), add fresh tabs for new
      // paths, drop tabs no longer open.
      const byPath = new Map(state.tabs.map((t) => [t.path, t]));
      const tabs = msg.open.map(({ path, title }) => {
        const existing = byPath.get(path);
        return existing ? { ...existing, title } : makeTab(path, title);
      });
      const activePath = tabs.some((t) => t.path === state.activePath) ? state.activePath : (tabs[0]?.path ?? null);
      return { ...state, tabs, activePath };
    }

    case "mcp.status":
      return {
        ...state,
        mcp: msg.servers.map((s) => ({ name: s.name, status: s.status, enabled: s.enabled })),
      };

    case "mode.status":
      return { ...state, mode: msg.mode };

    case "model.status":
      return { ...state, model: msg.model };

    case "effort.status":
      return { ...state, effort: msg.effort };

    case "git.state":
      // Publish-on-change means each push is already the full truth: replace the slice wholesale.
      return { ...state, git: msg.state };

    case "permission.request":
      // Route to the owner (like tool.start). De-dupe on requestId in case a replay repeats it.
      return patchOwnerPermissions(state, ownerOf(state, msg.promptId), (permissions) =>
        permissions.some((p) => p.requestId === msg.requestId)
          ? permissions
          : [
              ...permissions,
              {
                requestId: msg.requestId,
                toolName: msg.toolName,
                input: msg.input,
                title: msg.title,
                description: msg.description,
                reason: msg.reason,
                toolUseId: msg.toolUseId,
              },
            ],
      );

    default:
      // post.result is handled imperatively in App; any other unknown/newer type (protocol drift)
      // is ignored rather than blanking the app.
      return state;
  }
}

export function reducer(state: StudioState, action: Action): StudioState {
  switch (action.type) {
    case "server":
      return reduceServer(state, action.msg);
    case "sendPrompt": {
      const next = patchTab(state, action.path, (t) => ({
        ...t,
        chat: [...t.chat, { kind: "user", id: nid(), text: action.text }],
      }));
      return {
        ...next,
        turn: { promptId: action.promptId, path: action.path },
        turnStarted: false,
        promptOwners: { ...next.promptOwners, [action.promptId]: action.path },
      };
    }
    case "resetTurn": {
      // The socket dropped mid-turn: the sidecar's done/error can no longer reach us, so nothing else
      // releases the latch. Clear it, stop the streaming block, and note the interruption.
      if (!state.turn) return state;
      const { promptId, path } = state.turn;
      const next = patchOwnerPermissions(
        patchOwnerChat(state, path, (chat) => [
          ...stopStreaming(chat, promptId),
          { kind: "error", id: nid(), text: "Connection lost — the turn was interrupted. Reconnecting…" },
        ]),
        // The reconnected socket is a fresh stream; a parked prompt can never be answered now.
        path,
        () => [],
      );
      return { ...next, turn: null, turnStarted: false };
    }
    case "revUpdated":
      return patchTab(state, action.path, (t) => (t.doc ? { ...t, doc: { ...t.doc, rev: action.rev } } : t));
    case "captureBuffer":
      // Sync a tab's cached buffer to the editor before it unmounts on switch.
      return patchTab(state, action.path, (t) => (t.doc ? { ...t, doc: { ...t.doc, text: action.text } } : t));
    case "switchTab":
      // Optimistic focus so the cached buffer swaps in instantly; active confirms it.
      return state.tabs.some((t) => t.path === action.path) ? { ...state, activePath: action.path } : state;
    case "applyExternal": {
      const t = state.tabs.find((x) => x.path === action.path);
      if (!t || !t.externalChange || !t.doc) return patchTab(state, action.path, (x) => ({ ...x, externalChange: null }));
      const version = (t.remoteUpdate?.version ?? 0) + 1;
      const ext = t.externalChange;
      return patchTab(state, action.path, (x) => ({
        ...x,
        doc: { ...x.doc!, text: ext.text, rev: ext.rev },
        remoteUpdate: { text: ext.text, version, kind: "reload" },
        externalChange: null,
      }));
    }
    case "dismissExternal":
      return patchTab(state, action.path, (t) => ({ ...t, externalChange: null }));
    case "answerPermission": {
      const stripped = patchOwnerPermissions(state, action.path, (permissions) =>
        permissions.filter((p) => p.requestId !== action.requestId),
      );
      if (!action.toolUseId || !action.answers) return stripped;
      const { toolUseId, answers } = action;
      return patchOwnerChat(stripped, action.path, (chat) =>
        chat.map((it) => (it.kind === "tool" && it.toolUseId === toolUseId ? { ...it, answers } : it)),
      );
    }
    case "dismissRootConflict":
      return { ...state, rootConflict: EMPTY_ROOT_CONFLICT };
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [status, setStatus] = useState<SocketStatus>("connecting");
  const [showPicker, setShowPicker] = useState(false);
  const [showShip, setShowShip] = useState(false);
  // Canonical path of the post whose Save-draft panel is open, or null when closed.
  const [saveDraftFor, setSaveDraftFor] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  // Seeds the New Post dialog's title: empty from the button, the ⌘P search term from the palette.
  const [newPostTitle, setNewPostTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // Transient toast for actions that can't proceed right now (e.g. a prompt while reconnecting),
  // which the chat transcript can't carry because no turn was started.
  const [notice, setNotice] = useState<string | null>(null);
  // A pending destructive op awaiting confirmation; the sidecar reported what would be lost.
  const [pendingConfirm, setPendingConfirm] = useState<DestructiveConfirmData | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const socketRef = useRef<StudioSocket | null>(null);
  const editorRef = useRef<EditorHandle | null>(null);
  // Bumped on every onRevertScopeChange call; its resolved /diff response is dropped once a later
  // toggle has moved this past the sequence the response was requested under.
  const revertScopeSeqRef = useRef(0);
  // Synchronous single-turn latch, needed to reject a second dispatch during the pre-flush await
  // before the state-driven re-render lands. Reconciled from `turn` so done/error always releases it.
  const turnInFlightRef = useRef(false);
  // Socket-open status, read synchronously by the stable prompt callback so it can refuse a turn it
  // couldn't deliver. Mirrors the `connected` state.
  const connectedRef = useRef(false);
  // Active path, read synchronously by the stable switch/open callbacks.
  const activePathRef = useRef<string | null>(null);
  // Pending post.* requests keyed by requestId, resolved by the matching post.result.
  const pendingRef = useRef<Map<string, (ok: boolean, error?: string) => void>>(new Map());
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flash a transient notice, replacing any prior one; auto-clears after a few seconds.
  const showNotice = useCallback((text: string) => {
    setNotice(text);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 3000);
  }, []);

  useEffect(() => () => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
  }, []);

  useEffect(() => {
    turnInFlightRef.current = state.turn !== null;
  }, [state.turn]);

  useEffect(() => {
    activePathRef.current = state.activePath;
  }, [state.activePath]);

  useEffect(() => {
    const socket = new StudioSocket({
      onMessage: (msg) => {
        // post.result carries a requestId, not tab state, so resolve it here rather than through the reducer.
        if (msg.type === "post.result") {
          const resolve = pendingRef.current.get(msg.requestId);
          if (resolve) {
            pendingRef.current.delete(msg.requestId);
            resolve(msg.ok, msg.error);
          }
          return;
        }
        dispatch({ type: "server", msg });
      },
      onStatus: setStatus,
    });
    socketRef.current = socket;
    socket.connect();
    return () => {
      socket.dispose();
      socketRef.current = null;
    };
  }, []);

  const connected = status === "open";

  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

  // A dropped socket means the in-flight turn's terminal done/error can never arrive, so without
  // this the owning tab stays wedged until a page reload. Release the latch when the connection
  // drops; a late done/error for the cleared turn is already a no-op.
  useEffect(() => {
    if (status === "closed") dispatch({ type: "resetTurn" });
  }, [status]);

  const sendPrompt = useCallback(
    async (text: string, context: PromptContext) => {
      // One turn at a time (the backend serializes across tabs): ignore a dispatch while one's in flight.
      if (turnInFlightRef.current) return;
      // Don't start a turn we can't deliver: a send while the socket is down would be dropped, latching
      // the tab "working" with no done/error to release it. Surface the reconnecting state and bail.
      if (!connectedRef.current) {
        showNotice("Reconnecting to the sidecar — try again in a moment.");
        return;
      }
      turnInFlightRef.current = true;
      try {
        // Save-before-prompt: flush so the agent reads committed bytes. flush() rejects on
        // stale-rev/conflict/transient failure, so a failed flush blocks the dispatch (the agent
        // never reads stale bytes); the conflict surfaces in the reload banner.
        await editorRef.current?.flush();
      } catch {
        turnInFlightRef.current = false;
        return;
      }
      const promptId = nid();
      // Send first, commit the turn only if accepted. The flush above yields, so the socket may have
      // dropped meanwhile; a rejected send (returns false) must not latch the tab.
      const sent = socketRef.current?.send({ type: "prompt", promptId, text, context }) ?? false;
      if (!sent) {
        turnInFlightRef.current = false;
        showNotice("Lost the connection before sending — reconnecting. Try again in a moment.");
        return;
      }
      // The prompt's owner is the active post (context.path is the active doc/editor path).
      dispatch({ type: "sendPrompt", promptId, text, path: context.path });
    },
    [showNotice],
  );

  // Focus a post: flush and snapshot the outgoing tab's buffer (it unmounts on switch), then
  // optimistically focus the target and send post.open (open-of-open is treated as focus).
  const openPost = useCallback((path: string) => {
    if (path === activePathRef.current) return;
    const ed = editorRef.current;
    const cur = activePathRef.current;
    if (ed && cur) {
      const text = ed.getText();
      if (text !== null) dispatch({ type: "captureBuffer", path: cur, text });
      // Best-effort persist; the snapshot already preserves the edits either way.
      void ed.flush().catch(() => {});
    }
    dispatch({ type: "switchTab", path });
    socketRef.current?.send({ type: "post.open", requestId: nid(), path });
  }, []);

  const onCloseTab = useCallback(async (path: string) => {
    // Closing the active tab unmounts its editor, whose cleanup cancels any debounced autosave
    // without flushing. Flush first so typed-then-immediately-closed edits land on disk. Swallow a
    // failure: the edits still live in the worktree file and any conflict surfaces via the banner.
    if (path === activePathRef.current) {
      try {
        await editorRef.current?.flush();
      } catch {
        /* proceed to close regardless */
      }
    }
    socketRef.current?.send({ type: "post.close", requestId: nid(), path });
  }, []);

  const onRename = useCallback(async (path: string, newSlug: string) => {
    // Flush before renaming: the sidecar snapshots the last-saved text into the new file, so
    // un-autosaved keystrokes would be dropped. Only the active tab has a buffer to flush.
    if (path === activePathRef.current) {
      try {
        await editorRef.current?.flush();
      } catch {
        /* proceed; edits still live in the buffer and any conflict surfaces via the banner */
      }
    }
    socketRef.current?.send({ type: "post.rename", requestId: nid(), path, newSlug });
  }, []);

  // Send a delete/revert confirm over the socket, echoing the loss preview's own counts so the
  // sidecar can refuse if the tree moved on since that preview was pulled. Resolves rather than
  // throwing, so both the no-dialog fast path and the dialog's own confirm button can await it.
  const sendDestructiveConfirm = useCallback(
    (op: "delete" | "revert", path: string, scope: Scope, changedFiles: number, unpushed: number) =>
      new Promise<{ ok: boolean; error?: string }>((resolve) => {
        const requestId = nid();
        pendingRef.current.set(requestId, (ok, error) => resolve({ ok, error }));
        const sent =
          op === "delete"
            ? (socketRef.current?.send({
                type: "post.delete",
                requestId,
                path,
                expectedChangedFiles: changedFiles,
                expectedUnpushed: unpushed,
              }) ?? false)
            : (socketRef.current?.send({
                type: "post.revert",
                requestId,
                path,
                scope,
                expectedChangedFiles: changedFiles,
              }) ?? false);
        if (!sent) {
          pendingRef.current.delete(requestId);
          resolve({ ok: false, error: "Lost the connection — try again in a moment." });
        }
      }),
    [],
  );

  // Revert/delete from the tab menu: preview via GET /diff?op= first, so the dialog's counts and
  // diff come straight from the sidecar rather than being re-derived here, then either act
  // immediately (nothing at stake) or raise the confirm dialog with what's at risk. An error becomes
  // a transient notice; the tab set updates via the authoritative tabs broadcast.
  const requestDestructive = useCallback(
    async (op: "delete" | "revert", path: string, scope?: Scope) => {
      // Flush the active editor first so the "what would be lost" diff (and a subsequent save) reflect
      // the newest keystrokes, not just the last autosave. Only the active tab has a live buffer.
      if (path === activePathRef.current) {
        try {
          await editorRef.current?.flush();
        } catch {
          /* proceed; edits still live in the worktree file and any conflict surfaces via the banner */
        }
      }
      let preview: DiffResponse;
      try {
        preview = await getLossPreview(op, path, scope);
      } catch (e: unknown) {
        showNotice(e instanceof Error ? e.message : "Failed to preview the change.");
        return;
      }
      const resolvedScope: Scope = preview.scope ?? "post";
      const changedFiles = preview.changedFiles ?? 0;
      const unpushed = preview.unpushed ?? 0;
      const atStake = op === "delete" ? changedFiles > 0 || unpushed > 0 : preview.diff.trim().length > 0;
      if (!atStake) {
        const { ok, error } = await sendDestructiveConfirm(op, path, resolvedScope, changedFiles, unpushed);
        if (!ok && error) showNotice(error);
        return;
      }
      setPendingConfirm({ op, path, changedFiles, unpushed, diff: preview.diff, scope: resolvedScope });
    },
    [showNotice, sendDestructiveConfirm],
  );

  const onDeletePost = useCallback((path: string) => void requestDestructive("delete", path), [requestDestructive]);
  const onRevertPost = useCallback((path: string) => void requestDestructive("revert", path), [requestDestructive]);

  // In-dialog scope toggle for revert (delete never shows the toggle): re-pull the preview under the
  // new scope, swapping the dialog's data in, or closing it if the new scope turns out clean (e.g.
  // toggling from "all" down to "post" when only an outside file was dirty).
  const onRevertScopeChange = useCallback(
    (scope: Scope) => {
      if (!pendingConfirm || pendingConfirm.op !== "revert") return;
      const { path } = pendingConfirm;
      const seq = ++revertScopeSeqRef.current;
      getLossPreview("revert", path, scope)
        .then((preview) => {
          if (!isLatestRevertScopeRequest(seq, revertScopeSeqRef.current)) return;
          if (preview.diff.trim().length === 0) {
            setPendingConfirm(null);
            return;
          }
          setPendingConfirm({
            op: "revert",
            path,
            changedFiles: preview.changedFiles ?? 0,
            unpushed: 0,
            diff: preview.diff,
            scope: preview.scope ?? scope,
          });
        })
        .catch((e: unknown) => {
          if (!isLatestRevertScopeRequest(seq, revertScopeSeqRef.current)) return;
          showNotice(e instanceof Error ? e.message : "Failed to preview the change.");
        });
    },
    [pendingConfirm, showNotice],
  );

  // Open the Save-draft panel for a post (footer button or tab menu). Flush the active editor first so
  // the commit captures the newest keystrokes; a non-active tab's buffer was already flushed on switch.
  const onSaveDraft = useCallback(async (path: string) => {
    if (path === activePathRef.current) {
      try {
        await editorRef.current?.flush();
      } catch {
        /* proceed; edits still live in the worktree file */
      }
    }
    setSaveDraftFor(path);
  }, []);

  // Resolve a desync by renaming file/worktree/branch to match the frontmatter. The sidecar derives
  // the target from the post's own text; a refusal (e.g. the target stem is taken) surfaces as a notice.
  const onCompleteRename = useCallback(
    (path: string) => {
      const requestId = nid();
      pendingRef.current.set(requestId, (ok, error) => {
        if (!ok && error) showNotice(error);
      });
      socketRef.current?.send({ type: "post.completeRename", requestId, path });
    },
    [showNotice],
  );

  // Resolve the desync from the filename side: rewrite the frontmatter so the URL matches the
  // filename. An ordinary edit, no rename; the editor adopts the rewrite.
  const onRevertUrl = useCallback(
    (path: string) => {
      const requestId = nid();
      pendingRef.current.set(requestId, (ok, error) => {
        if (!ok && error) showNotice(error);
      });
      socketRef.current?.send({ type: "post.revertUrl", requestId, path });
    },
    [showNotice],
  );

  // Author confirmed the destructive op shown in the dialog: send the confirm, echoing back exactly
  // the counts the dialog displayed, then close on success or show the error inline.
  const onConfirmDestructive = useCallback(() => {
    if (!pendingConfirm) return;
    const { op, path, scope, changedFiles, unpushed } = pendingConfirm;
    setConfirmBusy(true);
    setConfirmError(null);
    void sendDestructiveConfirm(op, path, scope, changedFiles, unpushed).then(({ ok, error }) => {
      setConfirmBusy(false);
      if (ok) {
        setPendingConfirm(null);
        setConfirmError(null);
      } else {
        setConfirmError(error ?? `Failed to ${op} the post.`);
      }
    });
  }, [pendingConfirm, sendDestructiveConfirm]);

  const onCancelDestructive = useCallback(() => {
    if (confirmBusy) return;
    setPendingConfirm(null);
    setConfirmError(null);
  }, [confirmBusy]);

  // Delete-draft alternative: push the draft to origin first, then delete only the local worktree +
  // branch, so the work survives as an adoptable remote draft. Aborts the delete if the push fails
  // (the work isn't safe on the remote yet). A noop save (already on origin) is safe to delete.
  // Saves the whole worktree, not just the post: delete destroys everything in it, so anything less
  // than scope "all" here would claim to preserve the draft while still discarding part of it.
  const onSaveThenDelete = useCallback(() => {
    if (!pendingConfirm || pendingConfirm.op !== "delete") return;
    const { path } = pendingConfirm;
    setConfirmBusy(true);
    setConfirmError(null);
    void (async () => {
      let saved: Awaited<ReturnType<typeof saveDraft>>;
      try {
        saved = await saveDraft({ path, subject: `blog(${slugFromPath(path)}): draft`, body: "", scope: "all", confirm: true });
      } catch (e: unknown) {
        setConfirmBusy(false);
        setConfirmError(e instanceof Error ? e.message : "Failed to save the draft to remote.");
        return;
      }
      if (!saved.ok) {
        setConfirmBusy(false);
        setConfirmError(saved.error);
        return;
      }
      // The save just made everything safe on origin, so re-preview before deleting: the guard must
      // compare against the post-save tree, not the pre-save counts the dialog originally showed.
      let fresh: DiffResponse;
      try {
        fresh = await getLossPreview("delete", path);
      } catch (e: unknown) {
        setConfirmBusy(false);
        setConfirmError(e instanceof Error ? e.message : "Saved to remote, but failed to re-check before deleting.");
        return;
      }
      const { ok, error } = await sendDestructiveConfirm("delete", path, "all", fresh.changedFiles ?? 0, fresh.unpushed ?? 0);
      setConfirmBusy(false);
      if (ok) {
        setPendingConfirm(null);
        setConfirmError(null);
      } else {
        setConfirmError(error ?? "Saved to remote, but the local delete failed.");
      }
    })();
  }, [pendingConfirm, sendDestructiveConfirm]);

  // Open the New Post dialog seeded with `title` (empty for a blank post), clearing any stale error.
  const openNewPost = useCallback((title: string) => {
    setNewPostTitle(title);
    setCreateError(null);
    setShowNewPost(true);
  }, []);

  const onCreatePost = useCallback((fields: NewPostFields) => {
    const requestId = nid();
    setCreating(true);
    setCreateError(null);
    pendingRef.current.set(requestId, (ok, error) => {
      setCreating(false);
      if (ok) setShowNewPost(false);
      else setCreateError(error ?? "Failed to create the post.");
    });
    socketRef.current?.send({ type: "post.create", requestId, ...fields });
  }, []);

  const onMcpToggle = useCallback((server: string, enabled: boolean) => {
    socketRef.current?.send({ type: "mcp.setEnabled", requestId: nid(), server, enabled });
  }, []);

  // Fetch from origin (the studio's one read from the remote). The sidecar's own recompute-and-publish
  // updates git.state.fetch and every post's behind/incoming, so nothing to reconcile here beyond a
  // failure notice; the spinner and "refs as of" freshness read git.state.fetch directly in TabBar.
  const onFetch = useCallback(() => {
    if (state.git.fetch.inFlight) return;
    fetchRemote()
      .then((res) => {
        if (!res.ok) showNotice(`Fetch failed: ${res.error}`);
      })
      .catch((e: unknown) => showNotice(e instanceof Error ? `Fetch failed: ${e.message}` : "Fetch failed."));
  }, [state.git.fetch.inFlight, showNotice]);

  // The explicit "Update root from origin" affordance: fetchOrigin's own reactive ff-only advance
  // already handles a clean advance, so reaching here at all means the root has diverged. Confirms
  // replaying the local-only commits onto origin before rebasing; never automatic, never destructive.
  const onUpdateRoot = useCallback(() => {
    updateRoot(false)
      .then(async (res) => {
        if (res.ok) {
          if (res.result === "up-to-date") showNotice("Root is already up to date.");
          return;
        }
        if (!("ahead" in res)) {
          showNotice(`Update root failed: ${res.error}`);
          return;
        }
        const rootName = selectRootName(state.git);
        const proceed = window.confirm(
          `${rootName} has ${res.ahead} local commit(s) not on origin. Rebase them onto origin/${rootName}?`,
        );
        if (!proceed) return;
        const confirmed = await updateRoot(true);
        if (!confirmed.ok) showNotice(`Update root failed: ${confirmed.error}`);
      })
      .catch((e: unknown) => showNotice(e instanceof Error ? `Update root failed: ${e.message}` : "Update root failed."));
  }, [showNotice, state.git]);

  // Update/Pull (F3): flush first so the rebase carries the newest keystrokes rather than dropping them
  // or rebasing against stale content, same as revert/delete/save-draft. git.state reflects the outcome
  // reactively (behind clears, or rebase.phase flips to "conflicted" for F4 to pick up); a notice here
  // only covers a transport failure or the no-op "already up to date" result.
  //
  // updatePending marks the trigger busy the instant it fires, before the flush/REST round trip even
  // starts, so ⌘⇧U (or the tab menu's Update…) never reads as a dead click while waiting on the network.
  const [updatePending, setUpdatePending] = useState<Set<string>>(new Set());
  const onUpdate = useCallback(
    async (path: string) => {
      setUpdatePending((prev) => new Set(prev).add(path));
      try {
        if (path === activePathRef.current) {
          try {
            await editorRef.current?.flush();
          } catch {
            /* proceed; edits still live in the worktree file and any conflict surfaces via the banner */
          }
        }
        const res = await update(path);
        if (!res.ok) showNotice(`Update failed: ${res.error}`);
        else if (res.result === "up-to-date") showNotice("Already up to date.");
      } catch (e: unknown) {
        showNotice(e instanceof Error ? `Update failed: ${e.message}` : "Update failed.");
      } finally {
        setUpdatePending((prev) => {
          const next = new Set(prev);
          next.delete(path);
          return next;
        });
      }
    },
    [showNotice],
  );

  // Abort update (F6): returns the post to its pre-update tip; git.state's behind warning reappears
  // once the rebase's ref move is picked up.
  const onAbortUpdate = useCallback(
    (path: string) => {
      rebaseAbort(path)
        .then((res) => {
          if (!res.ok) showNotice(`Abort failed: ${res.error}`);
        })
        .catch((e: unknown) => showNotice(e instanceof Error ? `Abort failed: ${e.message}` : "Abort failed."));
    },
    [showNotice],
  );

  // Switch the permission mode; the sidecar echoes mode.status back to the chip.
  const onSetMode = useCallback((mode: PermissionMode) => {
    socketRef.current?.send({ type: "mode.set", mode });
  }, []);

  // Switch the model; the sidecar echoes model.status back to the chip.
  const onSetModel = useCallback((model: ClaudeModel) => {
    socketRef.current?.send({ type: "model.set", model });
  }, []);

  // Switch the reasoning effort; the sidecar echoes effort.status back to the chip.
  const onSetEffort = useCallback((effort: EffortLevel) => {
    socketRef.current?.send({ type: "effort.set", effort });
  }, []);

  // Answer a permission prompt. The card lives on the active tab, so the active path is the owner.
  // Drop it locally only once the response is sent; a dropped socket leaves it up for resetTurn to clear.
  const onPermission = useCallback((requestId: string, decision: PermissionDecision) => {
    const path = activePathRef.current;
    const sent = socketRef.current?.send({ type: "permission.response", requestId, decision }) ?? false;
    if (sent && path) dispatch({ type: "answerPermission", path, requestId });
  }, []);

  // Same as onPermission, but for a card on the root-conflict banner: the banner isn't tied to
  // whichever tab happens to be active, so its owner is always the root worktree path, not activePath.
  const onRootPermission = useCallback(
    (requestId: string, decision: PermissionDecision) => {
      const path = state.git.primary.worktree;
      const sent = socketRef.current?.send({ type: "permission.response", requestId, decision }) ?? false;
      if (sent && path) dispatch({ type: "answerPermission", path, requestId });
    },
    [state.git.primary.worktree],
  );

  // Answer an in-flight AskUserQuestion prompt with the human's picks. toolUseId (carried on the
  // pending card) lets the reducer record the answers onto that call's own transcript entry, so the
  // history shows what was asked and answered rather than just the raw questions.
  const onAnswerQuestion = useCallback((requestId: string, toolUseId: string | undefined, answers: Record<string, string>) => {
    const path = activePathRef.current;
    const sent = socketRef.current?.send({ type: "question.answer", requestId, answers }) ?? false;
    if (sent && path) dispatch({ type: "answerPermission", path, requestId, toolUseId, answers });
  }, []);

  const activeTab = useMemo(
    () => state.tabs.find((t) => t.path === state.activePath) ?? null,
    [state.tabs, state.activePath],
  );
  const activeDoc = activeTab?.doc ?? null;
  const turnOnActive = state.turn !== null && state.turn.path === state.activePath;

  // LSP connection status (the editor's /lsp channel) for the stack-status popover. The editor
  // creates the client; here we only observe, so this stays "disabled" under the mock / no token.
  const [lspStatus, setLspStatus] = useState<LspStatus>("disabled");
  useEffect(() => onLspStatus(setLspStatus), []);

  // Per-component stack health for the connection-dot popover. Endpoints are the studio's loopback
  // ports for this launch (see config.ts); shown faded.
  const stackStatus = useMemo<StackComponent[]>(() => {
    const preview = activeTab?.preview;
    return [
      { label: "Sidecar", status: socketHealth(status), endpoint: SIDECAR_ENDPOINT },
      { label: "MDX language server", status: lspHealth(lspStatus), endpoint: `${SIDECAR_ENDPOINT}/lsp` },
      {
        label: "Preview (Astro)",
        status: !preview ? "connecting" : preview.valid ? "ok" : "connecting",
        endpoint: PREVIEW_ENDPOINT,
      },
      ...state.mcp.map((m) => ({ label: `MCP · ${m.name}`, status: mcpHealth(m.status, m.enabled) })),
    ];
  }, [status, lspStatus, activeTab?.preview, state.mcp]);

  const onChatSend = useCallback(
    (text: string) => {
      const path = activeDoc?.path;
      if (!path) return;
      void sendPrompt(text, { path, cursor: 0, selection: null });
    },
    [activeDoc, sendPrompt],
  );

  const onEditorPrompt = useCallback(
    (text: string, context: PromptContext) => {
      void sendPrompt(text, context);
    },
    [sendPrompt],
  );

  const onCancel = useCallback(() => {
    if (state.turn) socketRef.current?.send({ type: "cancel", promptId: state.turn.promptId });
  }, [state.turn]);

  const onSelectSession = useCallback((mode: SessionMode, sessionId?: string) => {
    socketRef.current?.send({ type: "session.select", mode, sessionId });
  }, []);

  const onEditorState = useCallback((cursor: number, selection: Range | null, viewport: Range | null) => {
    const path = activePathRef.current;
    if (path) socketRef.current?.send({ type: "editor.state", path, cursor, selection, viewport });
  }, []);

  const onRev = useCallback((path: string, rev: DocRev) => {
    dispatch({ type: "revUpdated", path, rev });
  }, []);

  // ⌘P / Ctrl-P toggles the command palette. Capture phase so it beats CodeMirror and browser print.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        setShowPalette((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  // Listed in the ⌘/ panel so it's discoverable there too; the capture-phase listener above
  // already owns ⌘P's actual key handling and always runs first, so the registry's own dispatcher
  // (bubble-phase, and deferring to an already-prevented event) never double-fires this.
  useCommand({ id: "nav.palette", chord: "mod+p", label: "Open or create a post", group: "Navigation", run: () => setShowPalette((o) => !o) });
  // Mirrors nav.palette: the editor's own Mod-k CodeMirror binding keeps doing the real key
  // handling; this registration is for the panel, and for running it from outside the editor.
  useCommand({ id: "agent.directive", chord: "mod+k", label: "Agent directive", group: "Agent", run: () => editorRef.current?.openPrompt() });

  const tabDescriptors = useMemo(() => state.tabs.map((t) => ({ path: t.path, title: t.title })), [state.tabs]);
  const rootPhase = useMemo(
    () => rootConflictPhase(state.turn, state.turnStarted, state.git.primary.worktree),
    [state.turn, state.turnStarted, state.git.primary.worktree],
  );

  return (
    <KeymapProvider>
      <div className="studio">
        <ShortcutsPanel git={state.git} />
        <TabBar
          tabs={tabDescriptors}
          activePath={state.activePath}
          status={status}
          stackStatus={stackStatus}
          git={state.git}
          turn={state.turn}
          turnStarted={state.turnStarted}
          updatePending={updatePending}
          onSelect={openPost}
          onClose={onCloseTab}
          onNewPost={() => openNewPost("")}
          onRename={onRename}
          onSaveDraft={onSaveDraft}
          onRevert={onRevertPost}
          onDelete={onDeletePost}
          onFetch={onFetch}
          onUpdateRoot={onUpdateRoot}
          onUpdate={onUpdate}
          onAbortUpdate={onAbortUpdate}
        />

        <RootConflictBanner
          phase={rootPhase}
          chat={state.rootConflict.chat}
          permissions={state.rootConflict.permissions}
          rootPath={state.git.primary.worktree}
          onPermission={onRootPermission}
          onDismiss={() => dispatch({ type: "dismissRootConflict" })}
        />

        {notice && (
          <div className="studio__notice" role="status">
            {notice}
          </div>
        )}

        {activeTab?.externalChange && (
          <div className="banner">
            <span>
              {activeTab.externalChange.origin === "git"
                ? "This post was reloaded from a git operation (checkout, commit, or reset)."
                : "The file changed on disk outside the studio."}
            </span>
            <button className="btn btn--primary" onClick={() => dispatch({ type: "applyExternal", path: activeTab.path })}>
              Reload
            </button>
            <button className="btn btn--ghost" onClick={() => dispatch({ type: "dismissExternal", path: activeTab.path })}>
              Keep mine
            </button>
          </div>
        )}

        {activeTab && !activeTab.nameSync.synced && (
          <div className="banner banner--warn">
            <WarnIcon size={16} className="banner__icon" />
            <span>
              This post's deployed URL has changed to <code>{activeTab.nameSync.expectedStem}</code>.
            </span>
            <button
              className="btn btn--primary"
              style={{ marginLeft: "auto" }}
              disabled={activeTab.nameSync.canComplete === false}
              title={activeTab.nameSync.canComplete === false ? activeTab.nameSync.reason : undefined}
              onClick={() => onCompleteRename(activeTab.path)}
            >
              Rename worktree
            </button>
            <button className="btn btn--ghost" onClick={() => onRevertUrl(activeTab.path)}>
              Revert URL
            </button>
          </div>
        )}

        <div className="studio__main">
          <section className="pane pane--editor">
            {activeDoc && activeTab ? (
              <Editor
                key={activeDoc.path}
                ref={editorRef}
                path={activeDoc.path}
                initialText={activeDoc.text}
                rev={activeDoc.rev}
                remoteUpdate={activeTab.remoteUpdate}
                promptInFlight={turnOnActive}
                suspendSave={activeTab.externalChange != null}
                onRev={onRev}
                onPrompt={onEditorPrompt}
                onEditorState={onEditorState}
              />
            ) : (
              <div className="pane__empty">
                {state.tabs.length === 0 ? "No open posts — create one or press ⌘P." : "Waiting for the active document…"}
              </div>
            )}
          </section>

          <section className="pane pane--preview">
            <Preview key={state.activePath ?? "none"} preview={activeTab?.preview ?? WAITING_PREVIEW} />
          </section>

          <section className="pane pane--chat">
            <Chat
              key={state.activePath ?? "none"}
              items={activeTab?.chat ?? []}
              promptInFlight={turnOnActive}
              connected={connected}
              pendingPermissions={activeTab?.permissions ?? []}
              onPermission={onPermission}
              onAnswerQuestion={onAnswerQuestion}
              cwd={activeTab?.worktreePath ?? undefined}
              mode={state.mode}
              onSetMode={onSetMode}
              model={state.model}
              onSetModel={onSetModel}
              effort={state.effort}
              onSetEffort={onSetEffort}
              onSend={onChatSend}
              onCancel={onCancel}
            />
          </section>
        </div>

        <footer className="studio__footer">
          <button className="btn btn--ghost" onClick={() => setShowPicker(true)}>
            Session: {activeTab?.session.mode ?? "new"}
            {activeTab?.session.sessionId ? " ●" : ""}
          </button>
          <button
            className="btn btn--ghost"
            onClick={async () => {
              // Flush so the ship diff reflects the newest keystrokes, not just the last autosave.
              try {
                await editorRef.current?.flush();
              } catch {
                /* the diff may lag the newest edits; open the panel anyway */
              }
              setShowShip(true);
            }}
          >
            Ship…
          </button>
          <button
            className="btn btn--ghost"
            disabled={!state.activePath}
            title="Commit and push this draft to origin (no PR), so it can be resumed later"
            onClick={() => {
              if (state.activePath) void onSaveDraft(state.activePath);
            }}
          >
            Save draft…
          </button>
          <button className="btn btn--ghost" onClick={() => setShowPalette(true)}>
            Open… <kbd className="kbd">⌘P</kbd>
          </button>
          <span className="studio__spacer" />
          <McpStatusBar servers={state.mcp} onToggle={onMcpToggle} />
        </footer>

        {showPalette && (
          <div className="palette__scrim" onClick={() => setShowPalette(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <CommandPalette
                openTabs={tabDescriptors}
                activePath={state.activePath}
                git={state.git}
                onSelect={openPost}
                onCreate={openNewPost}
                onUpdate={onUpdate}
                onClose={() => setShowPalette(false)}
              />
            </div>
          </div>
        )}
        {showNewPost && (
          <Modal size="narrow" onClose={() => !creating && setShowNewPost(false)}>
            <NewPostDialog
              creating={creating}
              error={createError}
              initialTitle={newPostTitle}
              onSubmit={onCreatePost}
              onClose={() => setShowNewPost(false)}
            />
          </Modal>
        )}
        {showPicker && (
          <Modal onClose={() => setShowPicker(false)}>
            <SessionPicker
              current={activeTab?.session ?? { sessionId: null, mode: "new" }}
              onSelect={onSelectSession}
              onClose={() => setShowPicker(false)}
            />
          </Modal>
        )}
        {showShip && (
          <Modal size="wide" onClose={() => setShowShip(false)}>
            <ShipPanel
              slug={activeTab ? slugFromPath(activeTab.path) : null}
              path={activeTab?.path ?? null}
              git={state.git}
              nameSync={activeTab?.nameSync ?? SYNCED}
              onClose={() => setShowShip(false)}
            />
          </Modal>
        )}
        {saveDraftFor &&
          (() => {
            const tab = state.tabs.find((t) => t.path === saveDraftFor);
            if (!tab) return null;
            return (
              <Modal size="wide" onClose={() => setSaveDraftFor(null)}>
                <SaveDraftPanel
                  path={tab.path}
                  git={state.git}
                  onClose={() => setSaveDraftFor(null)}
                />
              </Modal>
            );
          })()}
        {pendingConfirm && (
          <Modal size="wide" onClose={onCancelDestructive}>
            <DestructiveConfirm
              data={pendingConfirm}
              title={state.tabs.find((t) => t.path === pendingConfirm.path)?.title || pendingConfirm.path}
              busy={confirmBusy}
              error={confirmError}
              onConfirm={onConfirmDestructive}
              onSaveAndDelete={onSaveThenDelete}
              onScopeChange={onRevertScopeChange}
              onCancel={onCancelDestructive}
            />
          </Modal>
        )}
      </div>
    </KeymapProvider>
  );
}
