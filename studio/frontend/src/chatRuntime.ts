// External-store adapter that feeds the studio's reduced agent transcript into
// assistant-ui. App still owns the WebSocket, reduces the frozen protocol
// (studio/shared/protocol.ts) into `ChatItem[]`, and owns send/cancel and the
// single-turn latch. This module only re-shapes that state into assistant-ui's
// `ThreadMessageLike` model and wires a custom (external-store) runtime; the
// wire contract is untouched.

import { useMemo } from "react";
import {
  useExternalStoreRuntime,
  type AppendMessage,
  type AssistantRuntime,
  type ThreadMessageLike,
} from "@assistant-ui/react";

// The transcript item shape produced by App's stream reducer. Kept here (and
// re-exported from Chat.tsx) so App's `import { ChatItem } from "./Chat"` and
// its reducer are unaffected by the UI swap.
export type ChatItem =
  | { kind: "user"; id: string; text: string }
  | { kind: "assistant"; id: string; promptId: string; text: string; streaming: boolean }
  | {
      kind: "tool";
      id: string;
      toolUseId: string;
      name: string;
      input: unknown;
      status: "running" | "done";
      isError?: boolean;
      exitCode?: number;
      resultPreview?: string;
      /** The human's picks once an AskUserQuestion call is answered, by question text. */
      answers?: Record<string, string>;
    }
  | { kind: "system"; id: string; text: string }
  | { kind: "error"; id: string; text: string };

// A single content part of a ThreadMessageLike (text, tool-call, …).
type MessagePart = Exclude<ThreadMessageLike["content"], string>[number];
type ToolCallPart = Extract<MessagePart, { type: "tool-call" }>;

function isJsonObject(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeStringify(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

/**
 * Group the flat transcript into assistant-ui messages. A turn's assistant text
 * and its tool activity collapse into one assistant message whose parts are the
 * streamed text plus a `tool-call` part per tool, so tool cards render inline
 * with the turn that produced them. User prompts (from the composer and ⌘K /
 * inline editor prompts, which both dispatch a `user` item through App) become
 * user messages; errors surface as their own notice.
 */
export function toThreadMessages(items: readonly ChatItem[]): ThreadMessageLike[] {
  const out: ThreadMessageLike[] = [];

  // Parts and identity of the assistant turn currently being assembled.
  let parts: MessagePart[] = [];
  let assistantId: string | null = null;
  let streaming = false;

  const flushAssistant = (): void => {
    if (assistantId === null) return;
    out.push({
      role: "assistant",
      id: assistantId,
      content: parts.length > 0 ? parts : [{ type: "text", text: "" }],
      // `isRunning` on the adapter is the authoritative in-flight signal; the
      // per-message status keeps the streaming cursor attached to the right turn.
      status: streaming ? { type: "running" } : { type: "complete", reason: "stop" },
    });
    parts = [];
    assistantId = null;
    streaming = false;
  };

  for (const item of items) {
    switch (item.kind) {
      case "user":
        flushAssistant();
        out.push({ role: "user", id: item.id, content: [{ type: "text", text: item.text }] });
        break;

      case "assistant":
        if (assistantId === null) assistantId = item.id;
        parts.push({ type: "text", text: item.text });
        if (item.streaming) streaming = true;
        break;

      case "tool": {
        // A tool call belongs to the current turn even if it precedes any text.
        if (assistantId === null) assistantId = `a-${item.id}`;
        const done = item.status === "done";
        const toolPart: ToolCallPart = {
          type: "tool-call",
          toolCallId: item.toolUseId,
          toolName: item.name,
          args: isJsonObject(item.input) ? (item.input as ToolCallPart["args"]) : undefined,
          argsText: safeStringify(item.input),
          // Presence of `result` is what the tool UI reads as "finished"; leave
          // it undefined while running so the card shows a spinner.
          result: done ? (item.resultPreview ?? "") : undefined,
          isError: item.isError,
        };
        parts.push(toolPart);
        break;
      }

      case "error":
      case "system":
        flushAssistant();
        out.push({ role: "system", id: item.id, content: [{ type: "text", text: item.text }] });
        break;
    }
  }

  flushAssistant();
  return out;
}

function appendMessageText(message: AppendMessage): string {
  let text = "";
  for (const part of message.content) {
    if (part.type === "text") text += part.text;
  }
  return text.trim();
}

export interface StudioChatRuntimeOptions {
  items: readonly ChatItem[];
  promptInFlight: boolean;
  connected: boolean;
  onSend: (text: string) => void;
  onCancel: () => void;
}

/**
 * Build an assistant-ui external-store runtime from App's chat state. The
 * composer routes through the existing `onSend` (App's `sendPrompt`, which keeps
 * the save-before-prompt flush and single-turn latch); Stop routes through the
 * existing `onCancel` (WS `cancel`).
 */
export function useStudioChatRuntime(options: StudioChatRuntimeOptions): AssistantRuntime {
  const { items, promptInFlight, connected, onSend, onCancel } = options;

  const messages = useMemo(() => toThreadMessages(items), [items]);

  return useExternalStoreRuntime<ThreadMessageLike>({
    messages,
    convertMessage: (message) => message,
    isRunning: promptInFlight,
    // Keep the input usable while disconnected, but block sending; the in-flight
    // turn is already gated by `isRunning` (and App's own latch).
    isSendDisabled: !connected,
    onNew: async (message) => {
      const text = appendMessageText(message);
      if (text.length > 0) onSend(text);
    },
    onCancel: async () => {
      onCancel();
    },
  });
}
