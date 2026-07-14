// Embedded Agent SDK host for the studio's built-in panel. One `query()` session per open post,
// each rooted (cwd) in that post's git worktree so sessions never contend over a shared working
// tree. The active tab's session receives prompts and streams; the SDK stream is mapped to the
// studio's ServerMessage protocol.
//
// Permissions: the human picks the permission mode via the mode chip. `auto` (a model classifier
// approves safe calls and escalates risk), `acceptEdits` (auto-accept in-worktree edits), or
// `default`. Anything the mode won't auto-approve routes to `canUseTool`, which emits a
// `permission.request` to the SPA and awaits the human's allow/always/deny (the approve/deny UX).
// A PreToolUse hook adds one deterministic guarantee the classifier can't: a file edit whose
// target resolves outside this post's worktree (or a directory the human has since granted) is
// forced to `ask` rather than silently auto-approved; that's what keeps edits landing in the
// right worktree. "Always allow" on such a prompt grants the directory for the session. Reads and
// Bash are left to the mode/classifier and canUseTool (no brittle shell parsing). MCP servers can
// be toggled on/off per the mcp.status / mcp.setEnabled protocol.

import { randomUUID } from "node:crypto";
import { homedir } from "node:os";
import path from "node:path";
import { query } from "@anthropic-ai/claude-agent-sdk";
import type { HookInput, HookJSONOutput, Options, SDKMessage } from "@anthropic-ai/claude-agent-sdk";

import type { AgentHost, StudioTools } from "../shared/services";
import type { PromptContext, ServerMessage } from "../shared/protocol";
import type { EditorContext, PermissionDecision, PermissionMode, Range, SessionMode } from "../shared/types";
import type { ActiveWorktree } from "../state/store";
import { STUDIO_MCP_SERVER_NAME, STUDIO_TOOL_WILDCARD } from "../shared/mcpTools";
import { createInProcessMcp } from "../mcp/inProcess";

/** Cap on streamed tool-result previews. */
const RESULT_PREVIEW_MAX = 2000;

export interface AgentHostDeps {
  tools: StudioTools;
  /** The active post's worktree (its cwd and the file the agent edits); null if none open. */
  getActiveWorktree: () => ActiveWorktree | null;
  /** Authoring rules appended to the system prompt and used as the MCP instructions. */
  skillInstructions: string;
  /** Sink for server-to-client messages (streamed into the panel). */
  emit: (msg: ServerMessage) => void;
  /** Snapshot of the current editor context (reserved for prompt enrichment). */
  getEditorContext: () => EditorContext | null;
  /** Fired when a turn starts / ends, so the doc-sync watcher soft-locks and classifies agent writes. */
  onTurnStart?: () => void;
  onTurnEnd?: () => void;
  /** Initial permission mode for new sessions (mode chip default); defaults to "auto". */
  defaultPermissionMode?: PermissionMode;
  /** Absolute dirs allowed for edits beyond the worktree at launch (seeds the granted-dir set). */
  additionalDirectories?: string[];
}

/** The concrete agent host: the frozen AgentHost plus the MCP status/toggle and permission surface. */
export interface StudioAgentHost extends AgentHost {
  /** Enable/disable one MCP server for the studio's sessions (takes effect next turn). */
  setMcpEnabled(server: string, enabled: boolean): void;
  /** Current MCP inventory for the mcp.status broadcast / connection snapshot. */
  getMcpStatus(): { name: string; status: string; enabled: boolean }[];
  /** Set the permission mode for subsequent turns; broadcasts the authoritative `mode.status`. */
  setPermissionMode(mode: PermissionMode): void;
  /** Current permission mode for the mode.status broadcast / connection snapshot. */
  getPermissionMode(): PermissionMode;
  /** Resolve an in-flight `permission.request` (by requestId) with the human's decision. */
  resolvePermission(requestId: string, decision: PermissionDecision): void;
  /**
   * Re-key a post's SDK session from its old canonical path to a new one when the post is renamed
   * (slug and/or date), so the resumable session (and thus the whole conversation the human can
   * resume) follows the post instead of being orphaned under the vanished path. Mirrors the store's
   * open-map re-key: a no-op when the old key has no session or the new key already has one.
   */
  renameSessionKey(oldPath: string, newPath: string): void;
}

/** One post's SDK session: its id and how the next turn resumes/forks. Keyed by the post's canonical path. */
interface PostSession {
  sessionId: string;
  mode: SessionMode;
  /** Source session to resume from on the first turn (resume/fork); undefined for new. */
  resumeFrom?: string;
  /** Whether the next turn is this session's first (pins/resumes vs. plain resume). */
  firstTurn: boolean;
}

export function createAgentHost(deps: AgentHostDeps): StudioAgentHost {
  return new EmbeddedAgentHost(deps);
}

class EmbeddedAgentHost implements StudioAgentHost {
  private readonly deps: AgentHostDeps;

  /** One session per open post, keyed by the post's canonical path. */
  private readonly sessions = new Map<string, PostSession>();
  /** MCP servers observed from session init messages: name to status. */
  private readonly knownServers = new Map<string, string>();
  /** Servers the human toggled off (global across sessions); excluded from each turn's tools. */
  private readonly disabledServers = new Set<string>();
  /** The active permission mode (mode chip); applied to every turn's `query()`. */
  private currentMode: PermissionMode;
  /** Absolute dirs beyond the worktree that edits may target without asking (grown via "always allow"). */
  private readonly grantedDirs: Set<string>;
  /** In-flight permission prompts: requestId to the resolver awaited inside `canUseTool`. */
  private readonly pendingPermissions = new Map<string, (decision: PermissionDecision | "abort") => void>();
  private current: { promptId: string; abort: AbortController } | null = null;

  constructor(deps: AgentHostDeps) {
    this.deps = deps;
    this.currentMode = deps.defaultPermissionMode ?? "auto";
    this.grantedDirs = new Set(deps.additionalDirectories ?? []);
  }

  // ---- session selection (applies to the active post's session) ----

  async select(
    mode: SessionMode,
    sessionId?: string,
  ): Promise<{ sessionId: string; mode: SessionMode }> {
    if ((mode === "resume" || mode === "fork") && !sessionId) {
      throw new Error(`session.select mode="${mode}" requires a sessionId`);
    }
    const key = this.activeKey();
    const session = this.getOrCreateSession(key);
    if (mode === "new") {
      session.sessionId = randomUUID();
      session.resumeFrom = undefined;
    } else if (mode === "resume") {
      session.sessionId = sessionId as string;
      session.resumeFrom = sessionId as string;
    } else {
      // fork: resume the source but pin a fresh id for the forked session
      session.sessionId = randomUUID();
      session.resumeFrom = sessionId as string;
    }
    session.mode = mode;
    session.firstTurn = true;
    this.deps.emit({ type: "session", sessionId: session.sessionId, mode });
    return { sessionId: session.sessionId, mode };
  }

  async prompt(input: { promptId: string; text: string; context: PromptContext }): Promise<void> {
    await this.runTurn(input.promptId, (wt) => this.composePrompt(input.text, input.context, wt));
  }

  async resolveDirective(input: {
    promptId: string;
    path: string;
    range: Range;
    instruction: string;
  }): Promise<void> {
    await this.runTurn(input.promptId, (wt) =>
      [
        "Resolve an inline authoring directive in the active post.",
        `File: ${wt.worktreeFilePath}`,
        `Region: UTF-16 code units [${input.range.from}, ${input.range.to}).`,
        `Instruction: ${input.instruction}`,
        "",
        "Read the file, then edit exactly that region in place with the native Edit tool. Preserve " +
          "everything outside the region verbatim and do not reformat unrelated lines.",
      ].join("\n"),
    );
  }

  cancel(promptId: string): void {
    if (this.current?.promptId === promptId) {
      this.current.abort.abort();
    }
  }

  // ---- MCP status / toggle ----

  setMcpEnabled(server: string, enabled: boolean): void {
    if (enabled) this.disabledServers.delete(server);
    else this.disabledServers.add(server);
    // The studio server is always in the inventory even before the first turn establishes it.
    if (!this.knownServers.has(server) && server !== STUDIO_MCP_SERVER_NAME) this.knownServers.set(server, "pending");
    this.broadcastMcpStatus();
  }

  getMcpStatus(): { name: string; status: string; enabled: boolean }[] {
    const names = new Set<string>([STUDIO_MCP_SERVER_NAME, ...this.knownServers.keys(), ...this.disabledServers]);
    return [...names].map((name) => {
      const enabled = !this.disabledServers.has(name);
      const status = !enabled
        ? "disabled"
        : (this.knownServers.get(name) ?? (name === STUDIO_MCP_SERVER_NAME ? "connected" : "pending"));
      return { name, status, enabled };
    });
  }

  // ---- permission mode and prompts ----

  setPermissionMode(mode: PermissionMode): void {
    this.currentMode = mode;
    this.deps.emit({ type: "mode.status", mode });
  }

  getPermissionMode(): PermissionMode {
    return this.currentMode;
  }

  resolvePermission(requestId: string, decision: PermissionDecision): void {
    const resolve = this.pendingPermissions.get(requestId);
    if (!resolve) return;
    this.pendingPermissions.delete(requestId);
    resolve(decision);
  }

  renameSessionKey(oldPath: string, newPath: string): void {
    if (oldPath === newPath) return;
    const session = this.sessions.get(oldPath);
    // Only move it when there's a session to move and the destination is free; a session already at
    // the new key (shouldn't happen for a fresh target) is left untouched rather than clobbered.
    if (session && !this.sessions.has(newPath)) {
      this.sessions.set(newPath, session);
      this.sessions.delete(oldPath);
    }
  }

  /** Resolve every still-pending prompt as an abort: the turn ended, so none can be answered. */
  private abortPendingPermissions(): void {
    for (const resolve of this.pendingPermissions.values()) resolve("abort");
    this.pendingPermissions.clear();
  }

  /**
   * The `canUseTool` handler for the "ask" path: emit a `permission.request` for the owning turn
   * and await the human's decision (or an abort if the turn is cancelled). "always" widens the
   * session's permissions with the SDK's own suggestions and, for an out-of-worktree edit, grants
   * that file's directory so the jail hook stops asking for it.
   */
  private makeCanUseTool(): NonNullable<Options["canUseTool"]> {
    return async (toolName, input, opts) => {
      const requestId = randomUUID();
      this.deps.emit({
        type: "permission.request",
        promptId: this.current?.promptId ?? "",
        requestId,
        toolName,
        input,
        title: opts.title,
        description: opts.description,
        reason: opts.decisionReason,
      });
      const decision = await new Promise<PermissionDecision | "abort">((resolve) => {
        this.pendingPermissions.set(requestId, resolve);
        if (opts.signal.aborted) this.resolvePermission(requestId, "deny");
        else opts.signal.addEventListener("abort", () => resolve("abort"), { once: true });
      });
      this.pendingPermissions.delete(requestId);
      if (decision === "abort") return { behavior: "deny", message: "The turn was cancelled before this was approved." };
      if (decision === "always") this.grantDirFor(toolName, input);
      return decisionToPermissionResult(decision, opts.suggestions);
    };
  }

  /** On "always allow" for a file-mutation tool, grant that file's parent directory (session-scoped). */
  private grantDirFor(toolName: string, input: Record<string, unknown>): void {
    const target = mutationTarget(toolName, input);
    if (target === null) return;
    const base = this.deps.getActiveWorktree()?.worktreePath ?? process.cwd();
    this.grantedDirs.add(path.dirname(path.resolve(base, expandHome(target))));
  }

  // ---- internals ----

  private activeKey(): string {
    const wt = this.deps.getActiveWorktree();
    if (!wt) throw new Error("no active post");
    return wt.canonicalPath;
  }

  private getOrCreateSession(key: string): PostSession {
    let session = this.sessions.get(key);
    if (!session) {
      session = { sessionId: randomUUID(), mode: "new", firstTurn: true };
      this.sessions.set(key, session);
    }
    return session;
  }

  private composePrompt(text: string, context: PromptContext, wt: ActiveWorktree): string {
    const lines = [text.trim(), "", "<studio-context>", `Active post file: ${wt.worktreeFilePath}.`];
    if (context.anchor) {
      // Inline (⌘K) prompt: the studio already resolved the exact region the author invoked on.
      lines.push(
        `The prompt targets a specific region of the post — UTF-16 code units [${context.anchor.from}, ${context.anchor.to}). Its current text is between the >>>>> markers:`,
        ">>>>>",
        context.anchor.text,
        "<<<<<",
        'Interpret "this" / "here" / "the title" / etc. as THAT region only. Read the file (offsets ' +
          "may have shifted — re-locate the region by its text if so) and edit exactly that region in " +
          "place with the native Edit tool. Preserve surrounding Markdown/MDX syntax that should stay " +
          "(e.g. a heading's leading `###`), and do NOT modify anything outside the region.",
      );
    } else {
      // Chat-panel prompt: no resolved region. Fall back to the editor-context tool for "here".
      lines.push(
        `Cursor at UTF-16 offset ${context.cursor}.`,
        'Resolve "here" / "this" against mcp__studio__get_editor_context, then edit the post file directly ' +
          "with the native tools (Read/Edit/Write). Keep the four frontmatter keys valid and never reformat " +
          "unrelated lines.",
      );
    }
    lines.push("</studio-context>");
    return lines.join("\n");
  }

  private buildOptions(session: PostSession, cwd: string, abort: AbortController): Options {
    const disallowedTools = [...this.disabledServers].map((name) => `mcp__${name}__*`);
    const options: Options = {
      cwd,
      abortController: abort,
      // The human picks the mode (auto/acceptEdits/default). The studio-tool wildcard is always
      // auto-approved so the panel's own tools never prompt. Anything the mode won't auto-approve
      // routes to `canUseTool` (the approve/deny UX). `additionalDirectories` are the dirs the
      // human has granted beyond the worktree, so edits there stop prompting.
      permissionMode: this.currentMode,
      allowedTools: [STUDIO_TOOL_WILDCARD],
      additionalDirectories: [...this.grantedDirs],
      canUseTool: this.makeCanUseTool(),
      // Runs regardless of mode and can't be bypassed by it: forces a file edit whose target escapes
      // the allowed set to `ask` (routes to canUseTool) instead of letting the classifier/acceptEdits
      // auto-approve it. Allowed set = the worktree plus any dirs the human has granted this session.
      hooks: {
        PreToolUse: [{ hooks: [worktreeAskHook(() => [cwd, ...this.grantedDirs])] }],
      },
      // Load the author's normal config: "user" brings global ~/.claude (their MCP servers, skills,
      // CLAUDE.md, allow/deny rules); "project"/"local" bring the worktree's .claude. Our
      // `mcpServers: { studio }` merges with these.
      settingSources: ["user", "project", "local"],
      includePartialMessages: true,
      // Append the authoring rules so a resumed/foreign session gets them even without CLAUDE.md.
      systemPrompt: {
        type: "preset",
        preset: "claude_code",
        append: this.deps.skillInstructions,
      },
      mcpServers: {
        [STUDIO_MCP_SERVER_NAME]: createInProcessMcp(this.deps.tools, this.deps.skillInstructions),
      },
    };
    if (disallowedTools.length > 0) options.disallowedTools = disallowedTools;

    if (session.firstTurn) {
      if (session.mode === "new") {
        options.sessionId = session.sessionId;
      } else if (session.mode === "resume") {
        options.resume = session.resumeFrom;
      } else {
        options.resume = session.resumeFrom;
        options.forkSession = true;
        options.sessionId = session.sessionId;
      }
    } else {
      options.resume = session.sessionId;
    }
    return options;
  }

  private async runTurn(promptId: string, buildPrompt: (wt: ActiveWorktree) => string): Promise<void> {
    // Server-side backstop against concurrent turns: a resumed session is single-threaded, and the
    // studio runs one turn at a time (the active tab's). Reject a second prompt rather than desync
    // turn state. (The SPA also guards the UI.)
    if (this.current) {
      this.deps.emit({
        type: "error",
        promptId,
        message:
          `A turn is already in progress (prompt "${this.current.promptId}"). Wait for it to finish ` +
          "or cancel it before sending another prompt.",
      });
      return;
    }

    const wt = this.deps.getActiveWorktree();
    if (!wt) {
      this.deps.emit({ type: "error", promptId, message: "no active post to prompt" });
      return;
    }
    const session = this.getOrCreateSession(wt.canonicalPath);
    const prompt = buildPrompt(wt);

    const abort = new AbortController();
    this.current = { promptId, abort };
    this.deps.onTurnStart?.();
    try {
      for await (const message of query({ prompt, options: this.buildOptions(session, wt.worktreePath, abort) })) {
        this.dispatch(promptId, session, message);
      }
    } catch (err) {
      if (abort.signal.aborted) {
        this.deps.emit({ type: "done", promptId, stopReason: "cancelled" });
      } else {
        this.deps.emit({ type: "error", promptId, message: errorMessage(err) });
      }
    } finally {
      // A finished/failed/cancelled turn can no longer answer prompts, so release any that are still
      // parked (deny) so `canUseTool` unblocks and no resolver leaks past the turn.
      this.abortPendingPermissions();
      if (this.current?.promptId === promptId) this.current = null;
      this.deps.onTurnEnd?.();
    }
  }

  private dispatch(promptId: string, session: PostSession, message: SDKMessage): void {
    switch (message.type) {
      case "system":
        if (message.subtype === "init") {
          this.onSessionEstablished(session, message.session_id);
          this.captureMcpServers(message.mcp_servers);
        }
        return;

      case "stream_event": {
        const event = message.event;
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta" &&
          event.delta.text
        ) {
          this.deps.emit({ type: "assistant.delta", promptId, text: event.delta.text });
        }
        return;
      }

      case "assistant": {
        for (const block of message.message.content) {
          if (block.type === "text") {
            if (block.text) this.deps.emit({ type: "assistant.message", promptId, text: block.text });
          } else if (block.type === "tool_use") {
            this.deps.emit({
              type: "tool.start",
              promptId,
              toolUseId: block.id,
              name: block.name,
              input: block.input,
            });
          }
        }
        return;
      }

      case "user": {
        const content = message.message.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (isToolResultBlock(block)) {
              this.deps.emit({
                type: "tool.end",
                promptId,
                toolUseId: block.tool_use_id,
                isError: block.is_error === true,
                resultPreview: previewToolResult(block.content),
              });
            }
          }
        }
        return;
      }

      case "result": {
        this.onSessionEstablished(session, message.session_id);
        const stopReason =
          message.subtype === "success" ? (message.stop_reason ?? "end_turn") : message.subtype;
        this.deps.emit({ type: "done", promptId, stopReason });
        return;
      }

      default:
        return;
    }
  }

  private onSessionEstablished(session: PostSession, id: string): void {
    session.firstTurn = false;
    if (id && id !== session.sessionId) {
      session.sessionId = id;
      this.deps.emit({ type: "session", sessionId: id, mode: session.mode });
    }
  }

  private captureMcpServers(servers: { name: string; status: string }[]): void {
    let changed = false;
    for (const s of servers) {
      if (this.knownServers.get(s.name) !== s.status) {
        this.knownServers.set(s.name, s.status);
        changed = true;
      }
    }
    if (changed) this.broadcastMcpStatus();
  }

  private broadcastMcpStatus(): void {
    this.deps.emit({ type: "mcp.status", servers: this.getMcpStatus() });
  }
}

// ---- tool-result stream helpers ----

interface ToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content?: unknown;
  is_error?: boolean;
}

function isToolResultBlock(block: unknown): block is ToolResultBlock {
  return (
    !!block &&
    typeof block === "object" &&
    (block as { type?: unknown }).type === "tool_result" &&
    typeof (block as { tool_use_id?: unknown }).tool_use_id === "string"
  );
}

function previewToolResult(content: unknown): string {
  return truncate(redactSecrets(flattenContentToText(content)), RESULT_PREVIEW_MAX);
}

function flattenContentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((block) => {
      if (typeof block === "string") return block;
      if (block && typeof block === "object") {
        const rec = block as { type?: unknown; text?: unknown };
        if (rec.type === "text" && typeof rec.text === "string") return rec.text;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function redactSecrets(text: string): string {
  return text
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/g, "Bearer [REDACTED]")
    .replace(/\bsk-[A-Za-z0-9-]{8,}/g, "sk-[REDACTED]")
    .replace(/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, "[REDACTED_TOKEN]")
    .replace(
      /\b(ANTHROPIC_API_KEY|GITHUB_TOKEN|GH_TOKEN|AWS_SECRET_ACCESS_KEY)\b\s*[=:]\s*\S+/gi,
      "$1=[REDACTED]",
    );
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}… [truncated ${text.length - max} chars]` : text;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// ---- permission decision mapping ----

type CanUseToolFn = NonNullable<Options["canUseTool"]>;
type PermissionSuggestions = Parameters<CanUseToolFn>[2]["suggestions"];
type SdkPermissionResult = NonNullable<Awaited<ReturnType<CanUseToolFn>>>;

/**
 * Map a human's `permission.response` decision to the SDK's PermissionResult. "always" carries the
 * SDK's own "so you won't be asked again" suggestions (a tool allow-rule, or an addDirectories grant
 * for an out-of-worktree edit) so the widening is exactly what the SDK proposed for this call.
 */
export function decisionToPermissionResult(
  decision: PermissionDecision,
  suggestions: PermissionSuggestions,
): SdkPermissionResult {
  if (decision === "deny") return { behavior: "deny", message: "The author denied this action." };
  if (decision === "always") return { behavior: "allow", updatedPermissions: suggestions ?? [] };
  return { behavior: "allow" };
}

// ---- worktree edit jail (PreToolUse hook) ----

/** Native tools that mutate a file; their target path must stay inside the allowed dir set. */
const FILE_MUTATION_TOOLS = new Set(["Write", "Edit", "MultiEdit", "NotebookEdit"]);

/**
 * A PreToolUse hook that forces a file edit whose target escapes the allowed directory set to `ask`
 * (routes to canUseTool) rather than letting the mode/classifier auto-approve it. It's deterministic
 * and mode-proof, the one guarantee the classifier can't give: an edit lands in the right worktree
 * (or a dir the human explicitly granted) or the human is asked. Reads and Bash are not gated here
 * (the mode and canUseTool own those; no brittle shell parsing). It inspects only a known structured
 * field, and reads `getAllowedDirs` per call so a mid-session directory grant takes effect immediately.
 */
export function worktreeAskHook(getAllowedDirs: () => string[]) {
  return async (input: HookInput): Promise<HookJSONOutput> => {
    if (input.hook_event_name !== "PreToolUse") return {};
    const toolInput = (input.tool_input ?? {}) as Record<string, unknown>;
    const target = mutationTarget(input.tool_name, toolInput);
    if (target === null || withinAnyDir(target, getAllowedDirs())) return {};
    return {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason:
          `${input.tool_name} targets ${target}, which is outside this post's worktree. Approve to ` +
          `let the agent edit there (choose "always allow" to grant that folder for this session).`,
      },
    };
  };
}

/** The file a mutation tool would write, or null when `toolName` isn't a file mutation / has no path. */
export function mutationTarget(toolName: string, input: Record<string, unknown>): string | null {
  if (!FILE_MUTATION_TOOLS.has(toolName)) return null;
  const key = toolName === "NotebookEdit" ? "notebook_path" : "file_path";
  const target = input[key];
  return typeof target === "string" && target.length > 0 ? target : null;
}

/** True when `target` resolves inside any of `dirs`. */
export function withinAnyDir(target: string, dirs: string[]): boolean {
  return dirs.some((dir) => withinDir(target, dir));
}

/** True when `target` (resolved against `dir`) stays inside `dir` (lexical; no symlink walk). */
function withinDir(target: string, dir: string): boolean {
  const resolved = path.resolve(dir, expandHome(target));
  const rel = path.relative(dir, resolved);
  if (rel !== "" && (rel.startsWith("..") || path.isAbsolute(rel))) return false;
  // A worktree's `node_modules` is a symlink to the repo's shared deps (main.ts linkNodeModules),
  // so a lexically in-jail path under it physically escapes into the tree every other post shares.
  // Treat any `node_modules` segment as outside the jail so such a write is forced to ask.
  if (rel.split(path.sep).includes("node_modules")) return false;
  return true;
}

/** Expand a leading `~` / `~/…` to the home directory (which is always outside the worktree). */
function expandHome(p: string): string {
  if (p === "~") return homedir();
  if (p.startsWith("~/")) return path.join(homedir(), p.slice(2));
  return p;
}
