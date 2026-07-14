// Agent panel, built on assistant-ui (@assistant-ui/react). App reduces the
// frozen agent stream into ChatItem[] and owns send/cancel; chatRuntime feeds
// that state into an external-store runtime. This module composes the runtime's
// primitives into the studio's dark chrome: a streaming transcript with
// markdown assistant text, collapsible MCP tool-call cards, and a clear
// running-vs-done state.

import { useState } from "react";
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  type TextMessagePartComponent,
  type ToolCallMessagePartComponent,
} from "@assistant-ui/react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";
import { useStudioChatRuntime, type StudioChatRuntimeOptions } from "./chatRuntime";
import { ToolDetailView } from "./ToolDetailView";
import type { PermissionDecision } from "../../shared/types";

// Re-exported so App's `import { ChatItem } from "./Chat"` and its reducer are
// untouched by the UI swap.
export type { ChatItem } from "./chatRuntime";

/** An in-flight permission prompt (the sidecar's `permission.request`), awaiting the author's call. */
export interface PendingPermission {
  requestId: string;
  toolName: string;
  input: unknown;
  title?: string;
  description?: string;
  reason?: string;
}

// Chat receives the same props the hand-rolled panel did (runtime wiring lives in
// the adapter hook), plus any pending permission prompts + how to answer them.
type ChatProps = StudioChatRuntimeOptions & {
  pendingPermissions: PendingPermission[];
  onPermission: (requestId: string, decision: PermissionDecision) => void;
};

/** `mcp__studio__foo` becomes `studio · foo`; other MCP tools drop their server prefix. */
function toolTitle(name: string): string {
  return name.replace(/^mcp__studio__/, "studio · ").replace(/^mcp__[^_]+__/, "");
}

function argsDisplay(args: unknown, argsText: string | undefined): string {
  if (isNonEmptyObject(args)) {
    try {
      return JSON.stringify(args, null, 2);
    } catch {
      /* fall through to raw text */
    }
  }
  return argsText ?? "";
}

function isNonEmptyObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length > 0;
}

// The args field that best identifies a call at a glance, shown inline in the
// collapsed header so the transcript stays scannable.
const SUMMARY_KEYS = ["path", "file_path", "filePath", "command", "cmd", "query", "pattern", "url", "name", "title"];

function argsSummary(args: unknown, argsText: string | undefined): string {
  let raw: string;
  if (isNonEmptyObject(args)) {
    const key = SUMMARY_KEYS.find((k) => typeof args[k] === "string" && (args[k] as string).length > 0);
    raw = key ? (args[key] as string) : Object.keys(args).join(", ");
  } else {
    raw = argsText ?? "";
  }
  const oneLine = raw.replace(/\s+/g, " ").trim();
  return oneLine.length > 80 ? `${oneLine.slice(0, 80)}…` : oneLine;
}

// ---- message part renderers ----

// Assistant prose as markdown (the agent drafts MDX/code, so this matters);
// `smooth` eases streamed tokens in. `remark-gfm` adds tables, task lists, and
// strikethrough; react-markdown is CommonMark-only otherwise, so a pipe table
// would render as raw text.
const AssistantText: TextMessagePartComponent = () => (
  <MarkdownTextPrimitive className="md" smooth remarkPlugins={[remarkGfm]} />
);

// User prompts and notices are shown verbatim (`.msg__body` is pre-wrap).
const PlainText: TextMessagePartComponent = ({ text }) => <>{text}</>;

// Collapsible tool-call card. `result === undefined` means still running
// (spinner); a set result, or `isError`, means finished. Collapsed by default
// so the transcript stays scannable: the header carries a one-line arg summary,
// and the full args and result only render when expanded. Errors auto-expand.
const ToolCard: ToolCallMessagePartComponent = ({ toolName, args, argsText, result, isError }) => {
  const finished = result !== undefined || isError === true;
  const state: "running" | "done" | "error" = isError ? "error" : finished ? "done" : "running";
  const hasResult = typeof result === "string" ? result.length > 0 : result != null;

  // null = follow the default (errors expanded, everything else collapsed);
  // a boolean means the user toggled it explicitly.
  const [override, setOverride] = useState<boolean | null>(null);
  const open = override ?? isError === true;
  const summary = argsSummary(args, argsText);

  return (
    <div className={`tool ${isError ? "tool--error" : ""}`}>
      <button type="button" className="tool__head" aria-expanded={open} onClick={() => setOverride(!open)}>
        <span className={`tool__dot tool__dot--${state}`} />
        <span className="tool__name">{toolTitle(toolName)}</span>
        {summary && <span className="tool__summary">{summary}</span>}
        <span className="tool__status">
          {state === "running" ? "running…" : state === "error" ? "error" : "done"}
        </span>
        <span className="tool__chevron" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <>
          {isNonEmptyObject(args) ? (
            <ToolDetailView toolName={toolName} input={args} />
          ) : (
            <pre className="tool__io">{argsDisplay(args, argsText)}</pre>
          )}
          {hasResult && <pre className="tool__io tool__io--result">{String(result)}</pre>}
        </>
      )}
    </div>
  );
};

// Approve/deny card for a tool call the current mode won't auto-approve. Shown above the composer
// while the turn waits on `canUseTool`. "Always allow" widens the session (or grants the folder for
// an out-of-worktree edit) so the same call stops prompting.
function PermissionCard({
  req,
  onPermission,
}: {
  req: PendingPermission;
  onPermission: (requestId: string, decision: PermissionDecision) => void;
}) {
  const summary = argsSummary(req.input, undefined);
  const prompt = req.title ?? req.description ?? req.reason;
  return (
    <div className="perm">
      <div className="perm__head">
        <span className="perm__badge">permission</span>
        <span className="perm__tool">{toolTitle(req.toolName)}</span>
        {summary && <span className="perm__summary">{summary}</span>}
      </div>
      {prompt && <div className="perm__reason">{prompt}</div>}
      <div className="perm__detail">
        <ToolDetailView toolName={req.toolName} input={req.input} />
      </div>
      <div className="perm__actions">
        <button type="button" className="btn btn--primary" onClick={() => onPermission(req.requestId, "allow")}>
          Allow
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => onPermission(req.requestId, "always")}>
          Always allow
        </button>
        <button type="button" className="btn btn--danger" onClick={() => onPermission(req.requestId, "deny")}>
          Deny
        </button>
      </div>
    </div>
  );
}

// ---- message renderers ----

const UserMessage = () => (
  <MessagePrimitive.Root className="msg msg--user">
    <div className="msg__role">you</div>
    <div className="msg__body">
      <MessagePrimitive.Parts components={{ Text: PlainText }} />
    </div>
  </MessagePrimitive.Root>
);

const AssistantMessage = () => (
  <MessagePrimitive.Root className="msg msg--assistant">
    <div className="msg__role">agent</div>
    <div className="msg__body">
      <MessagePrimitive.Parts
        components={{ Text: AssistantText, tools: { Fallback: ToolCard } }}
        unstable_showEmptyOnNonTextEnd={false}
      />
    </div>
  </MessagePrimitive.Root>
);

// The stream reducer only emits `error` notices today; both fold to this row.
const SystemMessage = () => (
  <MessagePrimitive.Root className="msg msg--error">
    <div className="msg__body">
      <MessagePrimitive.Parts components={{ Text: PlainText }} />
    </div>
  </MessagePrimitive.Root>
);

const messageComponents = { UserMessage, AssistantMessage, SystemMessage } as const;

// ---- composer ----

function Composer({ connected }: { connected: boolean }) {
  return (
    <ComposerPrimitive.Root className="chat__composer">
      <ComposerPrimitive.Input
        className="chat__input"
        placeholder={connected ? "Message the agent…" : "Disconnected — reconnecting…"}
        submitMode="ctrlEnter"
        minRows={3}
        maxRows={12}
        autoFocus
      />
      <div className="chat__actions">
        <ThreadPrimitive.If running={false}>
          <ComposerPrimitive.Send className="btn btn--primary">Send</ComposerPrimitive.Send>
        </ThreadPrimitive.If>
        <ThreadPrimitive.If running>
          <ComposerPrimitive.Cancel className="btn btn--danger">Cancel</ComposerPrimitive.Cancel>
        </ThreadPrimitive.If>
        <span className="chat__hint">⌘↵ to send</span>
      </div>
    </ComposerPrimitive.Root>
  );
}

export function Chat(props: ChatProps) {
  const runtime = useStudioChatRuntime(props);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className="chat">
        <ThreadPrimitive.Viewport className="chat__log">
          <ThreadPrimitive.Empty>
            <p className="chat__empty">
              Ask the agent to draft, rework, or generate a figure. ⌘K in the editor prompts at the caret.
            </p>
          </ThreadPrimitive.Empty>

          <ThreadPrimitive.Messages components={messageComponents} />

          {/* Explicit "agent is thinking" state, including before the first token. */}
          <ThreadPrimitive.If running>
            <div className="chat__working">
              <span className="chat__working-dot" aria-hidden="true" />
              Working…
            </div>
          </ThreadPrimitive.If>
        </ThreadPrimitive.Viewport>

        {props.pendingPermissions.length > 0 && (
          <div className="perm-list">
            {props.pendingPermissions.map((p) => (
              <PermissionCard key={p.requestId} req={p} onPermission={props.onPermission} />
            ))}
          </div>
        )}

        <Composer connected={props.connected} />
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}
