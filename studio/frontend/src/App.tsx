// Top-level studio shell. Owns the WebSocket and reduces the frozen agent stream and
// doc-sync pushes into per-tab UI state: each open post (a git worktree and its own
// session) has its own editor buffer, preview URL, and chat thread. The tab bar and the
// active post are driven by the authoritative `tabs` / `active` broadcasts; the editor /
// preview / chat panes render the active tab. All wire messages are the frozen protocol
// types (studio/shared/protocol.ts); no shapes invented here.

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Editor, type EditorHandle } from "./Editor";
import { Preview } from "./Preview";
import { Chat, type ChatItem, type PendingPermission } from "./Chat";
import { SessionPicker } from "./SessionPicker";
import { ShipPanel } from "./ShipPanel";
import { TabBar, type StackComponent } from "./TabBar";
import { NewPostDialog, type NewPostFields } from "./NewPostDialog";
import { CommandPalette } from "./CommandPalette";
import { McpStatusBar, type McpServerStatus } from "./McpStatusBar";
import { ModeChip } from "./ModeChip";
import { DestructiveConfirm, type DestructiveConfirmData } from "./DestructiveConfirm";
import { StudioSocket, type SocketStatus } from "./ws";
import { onLspStatus, type LspStatus } from "./lsp/client";
import { getDirtyPosts } from "./api";
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

/** Everything scoped to a single open post/tab. Buffers survive tab switches (kept here,
 *  keyed by path) so switching back restores what was typed. */
interface TabState {
  path: string;
  title: string;
  /** The post's real isolation branch (`blog/<date>_<slug>`), from the `active` broadcast; null
   *  until that post has been activated (the ship flow reads it read-only from the active tab). */
  branch: string | null;
  doc: DocState | null;
  /** Buffer patch for the editor; version increments on each agent/reconciled write. */
  remoteUpdate: { text: string; version: number } | null;
  preview: PreviewState;
  session: AgentState;
  chat: ChatItem[];
  /** In-flight permission prompts for this tab's turn, awaiting the author's allow/always/deny. */
  permissions: PendingPermission[];
  /** Pending disk change from an external writer, awaiting the reload banner. */
  externalChange: { text: string; rev: DocRev } | null;
  /** Frontmatter/filename name-sync (active post; drives the desync banner + ship gate). */
  nameSync: NameSync;
}

interface StudioState {
  tabs: TabState[];
  activePath: string | null;
  mcp: McpServerStatus[];
  /** Authoritative permission mode (from `mode.status`), shown + edited via the mode chip. */
  mode: PermissionMode;
  /** The single in-flight agent turn (the backend serializes one turn at a time) and the
   *  tab that owns it, so the right pane shows "working" and Cancel targets the right turn. */
  turn: { promptId: string; path: string } | null;
  /** promptId to owning tab path. Persists past `turn` so a stale done/error still routes to
   *  the tab whose transcript it belongs to. */
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
  | { type: "answerPermission"; path: string; requestId: string };

let idSeq = 0;
function nid(): string {
  idSeq += 1;
  return `i${idSeq}-${Math.random().toString(36).slice(2, 8)}`;
}

const WAITING_PREVIEW: PreviewState = { valid: false, url: null, errors: ["Waiting for the sidecar preview…"] };

// ---- stack-status dot mapping (SocketStatus / LspStatus / MCP status → a shared health level) ----
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

const initialState: StudioState = {
  tabs: [],
  activePath: null,
  mcp: [],
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
      // Route by path to the owning tab. `tabs` is authoritative: a change for a path with
      // no open tab is ignored rather than resurrecting a closed one.
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
        return patchTab(state, msg.path, (t) => ({
          ...t,
          doc: nextDoc,
          remoteUpdate: { text: msg.text, version: (t.remoteUpdate?.version ?? 0) + 1 },
        }));
      }
      // external: a rev that isn't strictly newer than what we already track is a
      // duplicate/hydrate snapshot (e.g. the server replaying the doc after a WS reconnect).
      // Nothing changed on disk, so no-op: don't banner, don't clobber.
      if (msg.rev.n <= tab.doc.rev.n) return state;
      // A strictly-newer disk rev is a real external write. Don't clobber the buffer, but
      // advance the base rev so the editor keeps autosaving against the current rev, and
      // surface the reload banner.
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

    case "done": {
      const owner = state.promptOwners[msg.promptId] ?? null;
      // A finished turn has no live prompts; drop any pending cards so none dangle unanswerable.
      let next = owner
        ? patchTab(state, owner, (t) => ({ ...t, chat: stopStreaming(t.chat, msg.promptId), permissions: [] }))
        : state;
      // Only release the latch for our in-flight turn. A `done` for some other prompt id
      // (a stale/rebroadcast turn) must not clear the live one.
      if (next.turn && msg.promptId === next.turn.promptId) next = { ...next, turn: null };
      return next;
    }

    case "error": {
      // A promptId-tagged error routes to that prompt's tab; an untagged one is a general
      // failure shown on the active tab.
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
      // A rename changed the post's canonical path. Migrate the tab's conversation state onto the
      // new path before the `tabs`/`active`/`file.changed` that follow, so the transcript, session,
      // and pending permissions survive (the `tabs` handler then keeps this migrated tab via its
      // byPath preserve, rather than makeTab-ing a fresh one and dropping the chat).
      //
      // We deliberately do not carry the pre-rename `doc`/`remoteUpdate`: the rename rewrote the
      // frontmatter slug, so that buffer is stale, and the authoritative `file.changed` published
      // right after this re-seeds the buffer with the new text via the tab's `!doc` bootstrap (no
      // spurious external-change banner, which carrying the old lower-rev doc would trip).
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
        ? state.tabs.map((t) => (t.path === msg.path ? { ...t, title: msg.title, branch: msg.branch } : t))
        : [...state.tabs, makeTab(msg.path, msg.title, msg.branch)];
      return { ...state, tabs, activePath: msg.path };
    }

    case "tabs": {
      // Authoritative open set. Preserve existing per-tab buffers (keyed by path); add fresh
      // tabs for newly-opened paths; drop tabs no longer open.
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

    case "permission.request":
      // Route to the owning tab's transcript (like tool.start). De-dupe on requestId in case a
      // snapshot/replay repeats it.
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
                },
              ],
            },
      );

    default:
      // post.result is handled imperatively in App (dialog/error resolution). Any other
      // unknown/newer message type (protocol drift) is ignored rather than blanking the app.
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
      // The socket dropped mid-turn: the sidecar's done/error for this prompt can no longer
      // reach us (the reconnected socket is a fresh stream), so nothing else will release the
      // latch. Clear it here, stopping the interrupted turn's streaming block and noting the
      // interruption so the transcript doesn't dangle a half-streamed message with no reason.
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
      // Sync a tab's cached buffer to what's in the editor before it unmounts on switch.
      return patchTab(state, action.path, (t) => (t.doc ? { ...t, doc: { ...t.doc, text: action.text } } : t));
    case "switchTab":
      // Optimistic focus so the cached buffer swaps in instantly; `active` confirms it.
      return state.tabs.some((t) => t.path === action.path) ? { ...state, activePath: action.path } : state;
    case "applyExternal": {
      const t = state.tabs.find((x) => x.path === action.path);
      if (!t || !t.externalChange || !t.doc) return patchTab(state, action.path, (x) => ({ ...x, externalChange: null }));
      const version = (t.remoteUpdate?.version ?? 0) + 1;
      const ext = t.externalChange;
      return patchTab(state, action.path, (x) => ({
        ...x,
        doc: { ...x.doc!, text: ext.text, rev: ext.rev },
        remoteUpdate: { text: ext.text, version },
        externalChange: null,
      }));
    }
    case "dismissExternal":
      return patchTab(state, action.path, (t) => ({ ...t, externalChange: null }));
    case "answerPermission":
      return patchTab(state, action.path, (t) => ({
        ...t,
        permissions: t.permissions.filter((p) => p.requestId !== action.requestId),
      }));
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [status, setStatus] = useState<SocketStatus>("connecting");
  const [showPicker, setShowPicker] = useState(false);
  const [showShip, setShowShip] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  // Seeds the New Post dialog's title: empty from the "New post" button, the ⌘P search term
  // when created from the palette. Read once at the dialog's mount (it remounts on each open).
  const [newPostTitle, setNewPostTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // Transient, self-dismissing toast for actions that can't proceed right now (e.g. a prompt
  // attempted while the socket is reconnecting). Feedback the chat transcript can't carry
  // because no turn was ever started.
  const [notice, setNotice] = useState<string | null>(null);
  // A pending destructive op (delete/revert) awaiting the author's confirmation: the sidecar
  // reported what would be lost. Null when no confirmation dialog is up.
  const [pendingConfirm, setPendingConfirm] = useState<DestructiveConfirmData | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  // Canonical paths of open posts that are drafts (unshipped work), for the tab bar's dot.
  // Refreshed (debounced) whenever something could have changed it; see `refreshDirty` below.
  const [dirtyPaths, setDirtyPaths] = useState<Set<string>>(() => new Set());

  const socketRef = useRef<StudioSocket | null>(null);
  const editorRef = useRef<EditorHandle | null>(null);
  // Synchronous single-turn latch. `turn` in state drives the UI, but a ref is needed to
  // reject a second dispatch during the pre-flush await, before the state-driven re-render
  // lands. Reconciled from state so the server's done/error always releases it.
  const turnInFlightRef = useRef(false);
  // Socket-open status, read synchronously by the (stable) prompt callback so it can refuse a
  // turn it couldn't deliver. `connected` state drives the UI; this mirrors it for the ref path.
  const connectedRef = useRef(false);
  // Current active path, read synchronously by the (stable) switch/open callbacks.
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

  // Re-probe GET /posts/dirty for the tab bar's draft dot. Several independent triggers below
  // (tabs changing, an agent edit landing, a turn finishing, an autosave) can each fire this in
  // quick succession, so debounce into one request rather than a burst.
  const refreshDirty = useCallback(() => {
    if (dirtyTimerRef.current) clearTimeout(dirtyTimerRef.current);
    dirtyTimerRef.current = setTimeout(() => {
      getDirtyPosts()
        .then((res) => setDirtyPaths(new Set(res.dirty)))
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
        // post.result carries a requestId, not tab state, so resolve it here (close the new-post
        // dialog / surface an error) rather than threading it through the reducer.
        if (msg.type === "post.result") {
          const resolve = pendingRef.current.get(msg.requestId);
          if (resolve) {
            pendingRef.current.delete(msg.requestId);
            resolve(msg.ok, msg.error);
          }
          return;
        }
        // A destructive op (delete/revert) sent with confirm:false that would lose work. Drop the
        // throwaway probe resolver and raise the confirmation dialog with what's at risk.
        if (msg.type === "post.confirm") {
          pendingRef.current.delete(msg.requestId);
          setPendingConfirm({
            op: msg.op,
            path: msg.path,
            changedFiles: msg.changedFiles,
            ahead: msg.ahead,
            diff: msg.diff,
          });
          return;
        }
        dispatch({ type: "server", msg });
        // Draft-ness (uncommitted/unmerged work) can change any time the open set changes, an
        // edit lands on disk, or a turn finishes; re-probe /posts/dirty for the tab dot.
        if (msg.type === "tabs" || msg.type === "file.changed" || msg.type === "done") refreshDirty();
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

  // Initial load (and every reconnect): the socket coming up is the first chance to know which
  // open posts are drafts.
  useEffect(() => {
    if (connected) refreshDirty();
  }, [connected, refreshDirty]);

  // A dropped socket (sidecar restart / network blip) means the in-flight turn's terminal
  // done/error can never arrive; the reconnected socket is a fresh stream the sidecar has no
  // memory of. Without this the owning tab stays wedged (editor readOnly, composer disabled,
  // Cancel a no-op) until a page reload. Release the latch when the connection drops so the
  // tab recovers on reconnect; a late done/error for the since-cleared turn is already a no-op.
  useEffect(() => {
    if (status === "closed") dispatch({ type: "resetTurn" });
  }, [status]);

  const sendPrompt = useCallback(
    async (text: string, context: PromptContext) => {
      // One agent turn at a time (the backend serializes across tabs): ignore a dispatch while
      // another is in flight.
      if (turnInFlightRef.current) return;
      // Don't start a turn we can't deliver: while the socket is down the send would be dropped,
      // latching the tab "working" with no server done/error to ever release it. Surface the
      // reconnecting state and bail without setting the turn.
      if (!connectedRef.current) {
        showNotice("Reconnecting to the sidecar — try again in a moment.");
        return;
      }
      turnInFlightRef.current = true;
      try {
        // Save-before-prompt: flush the buffer so the agent reads committed bytes. flush()
        // rejects on stale-rev / conflict / transient failure rather than resolving without
        // persisting, so a failed flush blocks the dispatch (the agent never reads stale
        // on-disk bytes). The conflict surfaces in the reload banner for the human to resolve.
        await editorRef.current?.flush();
      } catch {
        turnInFlightRef.current = false;
        return;
      }
      const promptId = nid();
      // Send first, then commit the turn (user message and latch) only if the socket accepted it.
      // The flush above yields, so the socket may have dropped meanwhile; a rejected send must
      // not latch the tab. send() returns false when the socket isn't open.
      const sent = socketRef.current?.send({ type: "prompt", promptId, text, context }) ?? false;
      if (!sent) {
        turnInFlightRef.current = false;
        showNotice("Lost the connection before sending — reconnecting. Try again in a moment.");
        return;
      }
      // The prompt's owner is the active post (context.path is the active doc / editor path).
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
      // Best-effort persist; the snapshot above already preserves the edits either way.
      void ed.flush().catch(() => {});
    }
    dispatch({ type: "switchTab", path });
    socketRef.current?.send({ type: "post.open", requestId: nid(), path });
  }, []);

  const onCloseTab = useCallback(async (path: string) => {
    // Only the active tab has a live editor; closing it re-keys the editor and unmounts the
    // old view, whose cleanup cancels any pending debounced autosave without flushing. Flush
    // first (like the switch/prompt paths) so typed-then-immediately-closed edits land on disk
    // before the doc is closed. Swallow a flush failure: the author asked to close, and the
    // edits still live in the worktree file / any conflict still surfaces via the banner.
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
    // Flush before renaming the active post: the sidecar's renamePost snapshots the last-saved text
    // into the new file, so un-autosaved keystrokes would be dropped (like the switch/close paths,
    // which flush first). Only the active tab has a live editor buffer to flush.
    if (path === activePathRef.current) {
      try {
        await editorRef.current?.flush();
      } catch {
        /* proceed; edits still live in the buffer and any conflict surfaces via the banner */
      }
    }
    socketRef.current?.send({ type: "post.rename", requestId: nid(), path, newSlug });
  }, []);

  // Revert / delete a post from the tab menu. Sent with confirm:false first: the sidecar either
  // acts immediately (revert no-op, or a clean delete with nothing to lose) or replies post.confirm
  // with what's at risk, which raises the dialog. A surfaced error becomes a transient notice; the
  // tab set itself updates via the authoritative `tabs` broadcast.
  const requestDestructive = useCallback(
    (op: "delete" | "revert", path: string) => {
      const requestId = nid();
      pendingRef.current.set(requestId, (ok, error) => {
        if (!ok && error) showNotice(error);
      });
      socketRef.current?.send({ type: op === "delete" ? "post.delete" : "post.revert", requestId, path, confirm: false });
    },
    [showNotice],
  );

  const onDeletePost = useCallback((path: string) => requestDestructive("delete", path), [requestDestructive]);
  const onRevertPost = useCallback((path: string) => requestDestructive("revert", path), [requestDestructive]);

  // Resolve a frontmatter/filename desync by renaming the file/worktree/branch to match the
  // frontmatter. The sidecar derives the target from the post's own text; a refusal (e.g. the target
  // stem is taken by an on-disk file or a draft branch) surfaces as a transient notice.
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

  // Resolve the desync from the filename side: rewrite the frontmatter (slug/created_at) so the
  // deployed URL matches the filename; an ordinary edit, no rename. The editor adopts the rewrite.
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

  // Author confirmed the pending destructive op: resend with confirm:true and resolve the dialog on
  // the result: close on success, show the error inline on failure. A send that the socket rejects
  // (dropped connection) clears the busy latch so the dialog doesn't hang.
  const onConfirmDestructive = useCallback(() => {
    if (!pendingConfirm) return;
    const { op, path } = pendingConfirm;
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
    const sent = socketRef.current?.send({ type: op === "delete" ? "post.delete" : "post.revert", requestId, path, confirm: true }) ?? false;
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

  // Open the New Post dialog seeded with `title` (empty for a blank post). Clears any stale
  // error from a prior attempt so the freshly-mounted dialog opens clean.
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

  // Switch the permission mode; the sidecar echoes the authoritative `mode.status` back to the chip.
  const onSetMode = useCallback((mode: PermissionMode) => {
    socketRef.current?.send({ type: "mode.set", mode });
  }, []);

  // Answer a permission prompt. The card lives on the active tab (only its Chat is mounted), so the
  // active path is the owner. Drop the card locally only once the response is actually sent; a
  // dropped socket leaves it up, and the reconnect's resetTurn clears it.
  const onPermission = useCallback((requestId: string, decision: PermissionDecision) => {
    const path = activePathRef.current;
    const sent = socketRef.current?.send({ type: "permission.response", requestId, decision }) ?? false;
    if (sent && path) dispatch({ type: "answerPermission", path, requestId });
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

  // Per-component stack health for the connection-dot popover. Endpoints are the studio's fixed
  // loopback ports (see studio/bin/studio.mjs); shown faded.
  const stackStatus = useMemo<StackComponent[]>(() => {
    const preview = activeTab?.preview;
    return [
      { label: "Sidecar", status: socketHealth(status), endpoint: "127.0.0.1:4319" },
      { label: "MDX language server", status: lspHealth(lspStatus), endpoint: "127.0.0.1:4319/lsp" },
      {
        label: "Preview (Astro)",
        status: !preview ? "connecting" : preview.valid ? "ok" : "connecting",
        endpoint: "localhost:4321",
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
      // A successful autosave can flip a clean tab to a draft (or vice versa, on revert).
      refreshDirty();
    },
    [refreshDirty],
  );

  // ⌘P / Ctrl-P toggles the command palette. Capture phase so it beats CodeMirror and the
  // browser's print shortcut.
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
        dirtyPaths={dirtyPaths}
        onSelect={openPost}
        onClose={onCloseTab}
        onNewPost={() => openNewPost("")}
        onRename={onRename}
        onRevert={onRevertPost}
        onDelete={onDeletePost}
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
          <svg className="banner__icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
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
              readOnly={turnOnActive}
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
            // Flush first so the ship diff reflects the newest keystrokes, not just the last autosave.
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
        <div className="modal" onClick={() => !creating && setShowNewPost(false)}>
          <div className="modal__body modal__body--narrow" onClick={(e) => e.stopPropagation()}>
            <NewPostDialog
              creating={creating}
              error={createError}
              initialTitle={newPostTitle}
              onSubmit={onCreatePost}
              onClose={() => setShowNewPost(false)}
            />
          </div>
        </div>
      )}
      {showPicker && (
        <div className="modal" onClick={() => setShowPicker(false)}>
          <div className="modal__body" onClick={(e) => e.stopPropagation()}>
            <SessionPicker
              current={activeTab?.session ?? { sessionId: null, mode: "new" }}
              onSelect={onSelectSession}
              onClose={() => setShowPicker(false)}
            />
          </div>
        </div>
      )}
      {showShip && (
        <div className="modal" onClick={() => setShowShip(false)}>
          <div className="modal__body modal__body--wide" onClick={(e) => e.stopPropagation()}>
            <ShipPanel
              branch={activeTab?.branch ?? null}
              nameSync={activeTab?.nameSync ?? SYNCED}
              onClose={() => setShowShip(false)}
            />
          </div>
        </div>
      )}
      {pendingConfirm && (
        <div className="modal" onClick={onCancelDestructive}>
          <div className="modal__body modal__body--wide" onClick={(e) => e.stopPropagation()}>
            <DestructiveConfirm
              data={pendingConfirm}
              title={state.tabs.find((t) => t.path === pendingConfirm.path)?.title || pendingConfirm.path}
              busy={confirmBusy}
              error={confirmError}
              onConfirm={onConfirmDestructive}
              onCancel={onCancelDestructive}
            />
          </div>
        </div>
      )}
    </div>
  );
}
