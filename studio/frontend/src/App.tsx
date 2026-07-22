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
import { McpStatusBar, type McpServerStatus } from "./McpStatusBar";
import { ModeChip } from "./ModeChip";
import { Modal } from "./Modal";
import { WarnIcon } from "./WarnIcon";
import { DestructiveConfirm, type DestructiveConfirmData } from "./DestructiveConfirm";
import type { Scope } from "./ScopeSelector";
import { StudioSocket, type SocketStatus } from "./ws";
import { onLspStatus, type LspStatus } from "./lsp/client";
import { fetchRemote, getDirtyPosts, saveDraft } from "./api";
import { slugFromPath } from "./slug";
import { PREVIEW_ENDPOINT, SIDECAR_ENDPOINT } from "./config";
import type { AgentState, DocRev, PermissionDecision, PermissionMode, PreviewState, Range, SessionMode } from "../../shared/types";
import type { PromptContext, ServerMessage } from "../../shared/protocol";

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
  /** The post's isolation branch (`blog/<date>_<slug>`), from `active`; null until first activated. */
  branch: string | null;
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
  /** Pending disk change from an external writer, awaiting the reload banner. */
  externalChange: { text: string; rev: DocRev } | null;
  nameSync: NameSync;
  /** Divergence from origin's base (from `post.divergence`); `behind` > 0 drives the header warning. */
  divergence: { ahead: number; behind: number };
}

interface StudioState {
  tabs: TabState[];
  activePath: string | null;
  mcp: McpServerStatus[];
  /** The studio's own branch/worktree (from `studio.branch`), shown in the status popover. */
  studio: { ref: string; worktree: string } | null;
  /** Authoritative permission mode (from `mode.status`), shown + edited via the mode chip. */
  mode: PermissionMode;
  /** The single in-flight turn (the backend serializes one at a time) and the tab that owns it. */
  turn: { promptId: string; path: string } | null;
  /** promptId to owning tab path. Outlives `turn` so a stale done/error still routes correctly. */
  promptOwners: Record<string, string>;
}

type Action =
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
  | { type: "answerPermission"; path: string; requestId: string; toolUseId?: string; answers?: Record<string, string> };

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

function makeTab(path: string, title: string, branch: string | null = null): TabState {
  return {
    path,
    title,
    branch,
    worktreePath: null,
    doc: null,
    remoteUpdate: null,
    preview: WAITING_PREVIEW,
    session: { sessionId: null, mode: "new" },
    chat: [],
    permissions: [],
    externalChange: null,
    nameSync: SYNCED,
    divergence: { ahead: 0, behind: 0 },
  };
}

const initialState: StudioState = {
  tabs: [],
  activePath: null,
  mcp: [],
  studio: null,
  mode: "auto",
  turn: null,
  promptOwners: {},
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

function reduceServer(state: StudioState, msg: ServerMessage): StudioState {
  switch (msg.type) {
    case "session":
      // No path in the message; the session belongs to the active (just-selected) post.
      return patchTab(state, state.activePath, (t) => ({
        ...t,
        session: { sessionId: msg.sessionId, mode: msg.mode },
      }));

    case "assistant.delta":
      return patchTab(state, ownerOf(state, msg.promptId), (t) => ({
        ...t,
        chat: appendAssistant(t.chat, msg.promptId, msg.text),
      }));

    case "assistant.message":
      return patchTab(state, ownerOf(state, msg.promptId), (t) => ({
        ...t,
        chat: finalizeAssistant(t.chat, msg.promptId, msg.text),
      }));

    case "tool.start":
      return patchTab(state, ownerOf(state, msg.promptId), (t) => ({
        ...t,
        chat: [
          ...t.chat,
          { kind: "tool", id: nid(), toolUseId: msg.toolUseId, name: msg.name, input: msg.input, status: "running" },
        ],
      }));

    case "tool.end":
      return patchTab(state, ownerOf(state, msg.promptId), (t) => ({
        ...t,
        chat: t.chat.map((it) =>
          it.kind === "tool" && it.toolUseId === msg.toolUseId
            ? { ...it, status: "done", isError: msg.isError, exitCode: msg.exitCode, resultPreview: msg.resultPreview }
            : it,
        ),
      }));

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
      // external: a rev not strictly newer is a duplicate/hydrate snapshot (e.g. a replay after a
      // WS reconnect). Nothing changed on disk, so no-op.
      if (msg.rev.n <= tab.doc.rev.n) return state;
      // A strictly-newer disk rev is a real external write. Don't clobber the buffer, but advance the
      // base rev so autosave keeps working, and surface the reload banner.
      return patchTab(state, msg.path, (t) => ({
        ...t,
        doc: { ...t.doc!, rev: msg.rev },
        externalChange: { text: msg.text, rev: msg.rev },
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

    case "post.divergence":
      // Path-scoped (unlike preview/namesync): the divergence read is async, so it names the tab it
      // measured in case the active post switched before it landed.
      return patchTab(state, msg.path, (t) => ({ ...t, divergence: { ahead: msg.ahead, behind: msg.behind } }));

    case "done": {
      const owner = state.promptOwners[msg.promptId] ?? null;
      // A finished turn has no live prompts; drop any pending cards so none dangle unanswerable.
      let next = owner
        ? patchTab(state, owner, (t) => ({ ...t, chat: stopStreaming(t.chat, msg.promptId), permissions: [] }))
        : state;
      // Only release the latch for our in-flight turn; a done for a stale/rebroadcast prompt must not.
      if (next.turn && msg.promptId === next.turn.promptId) next = { ...next, turn: null };
      return next;
    }

    case "error": {
      // A promptId-tagged error routes to that prompt's tab; an untagged one is shown on the active tab.
      const owner = msg.promptId !== undefined ? ownerOf(state, msg.promptId) : state.activePath;
      let next = patchTab(state, owner, (t) => ({
        ...t,
        chat: [...t.chat, { kind: "error", id: nid(), text: msg.message }],
        permissions: [],
      }));
      // Release the latch when the error is for our own turn, or carries no prompt id.
      if (next.turn && (msg.promptId === undefined || msg.promptId === next.turn.promptId)) {
        next = { ...next, turn: null };
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
          ? { ...t, path: msg.newPath, title: msg.title, branch: msg.branch, doc: null, remoteUpdate: null, externalChange: null, nameSync: SYNCED }
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
        ? state.tabs.map((t) =>
            t.path === msg.path ? { ...t, title: msg.title, branch: msg.branch, worktreePath: msg.worktreePath } : t,
          )
        : [...state.tabs, { ...makeTab(msg.path, msg.title, msg.branch), worktreePath: msg.worktreePath }];
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

    case "studio.branch":
      return { ...state, studio: { ref: msg.ref, worktree: msg.worktree } };

    case "permission.request":
      // Route to the owning tab (like tool.start). De-dupe on requestId in case a replay repeats it.
      return patchTab(state, ownerOf(state, msg.promptId), (t) =>
        t.permissions.some((p) => p.requestId === msg.requestId)
          ? t
          : {
              ...t,
              permissions: [
                ...t.permissions,
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
            },
      );

    default:
      // post.result is handled imperatively in App; any other unknown/newer type (protocol drift)
      // is ignored rather than blanking the app.
      return state;
  }
}

function reducer(state: StudioState, action: Action): StudioState {
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
        promptOwners: { ...next.promptOwners, [action.promptId]: action.path },
      };
    }
    case "resetTurn": {
      // The socket dropped mid-turn: the sidecar's done/error can no longer reach us, so nothing else
      // releases the latch. Clear it, stop the streaming block, and note the interruption.
      if (!state.turn) return state;
      const { promptId, path } = state.turn;
      const next = patchTab(state, path, (t) => ({
        ...t,
        chat: [
          ...stopStreaming(t.chat, promptId),
          { kind: "error", id: nid(), text: "Connection lost — the turn was interrupted. Reconnecting…" },
        ],
        // The reconnected socket is a fresh stream; a parked prompt can never be answered now.
        permissions: [],
      }));
      return { ...next, turn: null };
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
    case "answerPermission":
      return patchTab(state, action.path, (t) => ({
        ...t,
        permissions: t.permissions.filter((p) => p.requestId !== action.requestId),
        chat:
          action.toolUseId && action.answers
            ? t.chat.map((it) =>
                it.kind === "tool" && it.toolUseId === action.toolUseId ? { ...it, answers: action.answers } : it,
              )
            : t.chat,
      }));
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
  // Open posts that are drafts (unshipped work), for the tab bar's dot; refreshed via refreshDirty.
  const [dirtyPaths, setDirtyPaths] = useState<Set<string>>(() => new Set());
  // Posts with uncommitted edits (⊆ dirtyPaths); gates the tab menu's "Revert to clean".
  const [uncommittedPaths, setUncommittedPaths] = useState<Set<string>>(() => new Set());
  // A git fetch is in flight (the tab bar's fetch button spins and disables while true).
  const [fetching, setFetching] = useState(false);

  const socketRef = useRef<StudioSocket | null>(null);
  const editorRef = useRef<EditorHandle | null>(null);
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
  const dirtyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flash a transient notice, replacing any prior one; auto-clears after a few seconds.
  const showNotice = useCallback((text: string) => {
    setNotice(text);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 3000);
  }, []);

  useEffect(() => () => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
  }, []);

  // Re-probe GET /posts/dirty for the tab bar's draft dot. Several triggers can fire in quick
  // succession (tabs change, agent edit, turn finishing, autosave), so debounce into one request.
  const refreshDirty = useCallback(() => {
    if (dirtyTimerRef.current) clearTimeout(dirtyTimerRef.current);
    dirtyTimerRef.current = setTimeout(() => {
      getDirtyPosts()
        .then((res) => {
          setDirtyPaths(new Set(res.dirty));
          setUncommittedPaths(new Set(res.uncommitted));
        })
        .catch(() => {
          /* best-effort: leave the previous dirty set in place */
        });
    }, 400);
  }, []);

  useEffect(() => () => {
    if (dirtyTimerRef.current) clearTimeout(dirtyTimerRef.current);
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
        // A confirm:false destructive op that would lose work: drop the probe resolver and raise the
        // confirmation dialog with what's at risk.
        if (msg.type === "post.confirm") {
          pendingRef.current.delete(msg.requestId);
          setPendingConfirm({
            op: msg.op,
            path: msg.path,
            changedFiles: msg.changedFiles,
            ahead: msg.ahead,
            diff: msg.diff,
            scope: msg.scope,
          });
          return;
        }
        dispatch({ type: "server", msg });
        // Draft-ness can change when the open set changes, an edit lands, a turn finishes, or a fetch
        // moves the base under a post (post.divergence rides that fetch), so re-probe the dirty set too.
        if (msg.type === "tabs" || msg.type === "file.changed" || msg.type === "done" || msg.type === "post.divergence") {
          refreshDirty();
        }
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

  // The socket coming up (initial load and every reconnect) is the first chance to learn which
  // open posts are drafts.
  useEffect(() => {
    if (connected) refreshDirty();
  }, [connected, refreshDirty]);

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

  // Revert/delete from the tab menu. Sent with confirm:false first: the sidecar either acts
  // immediately (nothing to lose) or replies post.confirm with what's at risk, raising the dialog.
  // An error becomes a transient notice; the tab set updates via the authoritative tabs broadcast.
  // `scope` is omitted for the first request of a revert (the sidecar picks it: "all" when there's
  // more than just the post, else "post", and echoes its choice back on post.confirm).
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
      const requestId = nid();
      pendingRef.current.set(requestId, (ok, error) => {
        if (!ok && error) showNotice(error);
      });
      if (op === "delete") {
        socketRef.current?.send({ type: "post.delete", requestId, path, confirm: false });
      } else {
        socketRef.current?.send({ type: "post.revert", requestId, path, scope, confirm: false });
      }
    },
    [showNotice],
  );

  const onDeletePost = useCallback((path: string) => void requestDestructive("delete", path), [requestDestructive]);
  const onRevertPost = useCallback((path: string) => void requestDestructive("revert", path), [requestDestructive]);

  // In-dialog scope toggle for revert (delete never shows the toggle): re-request the preview under
  // the new scope, swapping the dialog's data on reply, or closing it if the new scope turns out
  // clean (e.g. toggling from "all" down to "post" when only an outside file was dirty).
  const onRevertScopeChange = useCallback(
    (scope: Scope) => {
      if (!pendingConfirm || pendingConfirm.op !== "revert") return;
      const { path } = pendingConfirm;
      const requestId = nid();
      pendingRef.current.set(requestId, (ok, error) => {
        if (ok) setPendingConfirm(null);
        else if (error) showNotice(error);
      });
      socketRef.current?.send({ type: "post.revert", requestId, path, scope, confirm: false });
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

  // Author confirmed the destructive op: resend with confirm:true, then close on success or show the
  // error inline. A rejected send (dropped connection) clears the busy latch so the dialog doesn't hang.
  const onConfirmDestructive = useCallback(() => {
    if (!pendingConfirm) return;
    const { op, path, scope } = pendingConfirm;
    const requestId = nid();
    setConfirmBusy(true);
    setConfirmError(null);
    pendingRef.current.set(requestId, (ok, error) => {
      setConfirmBusy(false);
      if (ok) {
        setPendingConfirm(null);
        setConfirmError(null);
      } else {
        setConfirmError(error ?? `Failed to ${op} the post.`);
      }
    });
    const sent =
      (op === "delete"
        ? socketRef.current?.send({ type: "post.delete", requestId, path, confirm: true })
        : socketRef.current?.send({ type: "post.revert", requestId, path, scope, confirm: true })) ?? false;
    if (!sent) {
      pendingRef.current.delete(requestId);
      setConfirmBusy(false);
      setConfirmError("Lost the connection — try again in a moment.");
    }
  }, [pendingConfirm]);

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
      // Pushed (or already on origin): now delete the local copy.
      const requestId = nid();
      pendingRef.current.set(requestId, (ok, error) => {
        setConfirmBusy(false);
        if (ok) {
          setPendingConfirm(null);
          setConfirmError(null);
        } else {
          setConfirmError(error ?? "Saved to remote, but the local delete failed.");
        }
      });
      const sent = socketRef.current?.send({ type: "post.delete", requestId, path, confirm: true }) ?? false;
      if (!sent) {
        pendingRef.current.delete(requestId);
        setConfirmBusy(false);
        setConfirmError("Saved to remote, but lost the connection before deleting locally.");
      }
    })();
  }, [pendingConfirm]);

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

  // Fetch from origin (the studio's one read from the remote). The sidecar broadcasts the refreshed
  // divergence (and the reducer re-probes the dirty set off it), so nothing to reconcile here beyond
  // the spinner and a failure notice.
  const onFetch = useCallback(() => {
    if (fetching) return;
    setFetching(true);
    fetchRemote()
      .then((res) => {
        if (!res.ok) showNotice(`Fetch failed: ${res.error}`);
      })
      .catch((e: unknown) => showNotice(e instanceof Error ? `Fetch failed: ${e.message}` : "Fetch failed."))
      .finally(() => setFetching(false));
  }, [fetching, showNotice]);

  // Switch the permission mode; the sidecar echoes mode.status back to the chip.
  const onSetMode = useCallback((mode: PermissionMode) => {
    socketRef.current?.send({ type: "mode.set", mode });
  }, []);

  // Answer a permission prompt. The card lives on the active tab, so the active path is the owner.
  // Drop it locally only once the response is sent; a dropped socket leaves it up for resetTurn to clear.
  const onPermission = useCallback((requestId: string, decision: PermissionDecision) => {
    const path = activePathRef.current;
    const sent = socketRef.current?.send({ type: "permission.response", requestId, decision }) ?? false;
    if (sent && path) dispatch({ type: "answerPermission", path, requestId });
  }, []);

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

  const onRev = useCallback(
    (path: string, rev: DocRev) => {
      dispatch({ type: "revUpdated", path, rev });
      // A successful autosave can flip a clean tab to a draft (or back, on revert).
      refreshDirty();
    },
    [refreshDirty],
  );

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

  const tabDescriptors = useMemo(() => state.tabs.map((t) => ({ path: t.path, title: t.title })), [state.tabs]);

  return (
    <div className="studio">
      <TabBar
        tabs={tabDescriptors}
        activePath={state.activePath}
        status={status}
        stackStatus={stackStatus}
        studio={state.studio}
        behind={activeTab?.divergence.behind ?? 0}
        dirtyPaths={dirtyPaths}
        uncommittedPaths={uncommittedPaths}
        onSelect={openPost}
        onClose={onCloseTab}
        onNewPost={() => openNewPost("")}
        onRename={onRename}
        onSaveDraft={onSaveDraft}
        onRevert={onRevertPost}
        onDelete={onDeletePost}
        onFetch={onFetch}
        fetching={fetching}
      />

      {notice && (
        <div className="studio__notice" role="status">
          {notice}
        </div>
      )}

      {activeTab?.externalChange && (
        <div className="banner">
          <span>The file changed on disk outside the studio.</span>
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
        <ModeChip mode={state.mode} onSetMode={onSetMode} />
        <McpStatusBar servers={state.mcp} onToggle={onMcpToggle} />
      </footer>

      {showPalette && (
        <div className="palette__scrim" onClick={() => setShowPalette(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CommandPalette
              openTabs={tabDescriptors}
              activePath={state.activePath}
              onSelect={openPost}
              onCreate={openNewPost}
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
            branch={activeTab?.branch ?? null}
            slug={activeTab ? slugFromPath(activeTab.path) : null}
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
                branch={tab.branch}
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
  );
}
