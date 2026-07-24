// Embedded Agent SDK host for the studio panel. One `query()` session per open post, each rooted in
// that post's worktree, or per the studio's own root worktree for a server-dispatched system prompt
// (e.g. F4's rebase-conflict resolver) — sessions never contend over one working tree. The SDK stream
// is mapped to the studio's ServerMessage protocol. The human picks the permission mode; whatever the
// mode won't auto-approve routes to `canUseTool` (the SPA's allow/always/deny). A PreToolUse hook
// forces any edit targeting outside the worktree (or a granted dir) to `ask`, so edits land in the
// right worktree regardless of mode. MCP servers toggle on/off via mcp.status / mcp.setEnabled.

import { randomUUID } from "node:crypto";
import { lstatSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { getSessionMessages, query } from "@anthropic-ai/claude-agent-sdk";
import type { HookInput, HookJSONOutput, Options, SDKMessage, SessionMessage } from "@anthropic-ai/claude-agent-sdk";

import type { AgentHost, StudioTools } from "../shared/services";
import type { PromptContext, ServerMessage, SessionHistoryItem, SessionHistoryTool } from "../shared/protocol";
import type { ClaudeModel, EffortLevel, PermissionDecision, PermissionMode, Range, SessionMode } from "../shared/types";
import { DEFAULT_EFFORT, DEFAULT_MODEL } from "../shared/types";
import type { ActiveWorktree } from "../state/store";
import { STUDIO_MCP_SERVER_NAME, STUDIO_TOOL_WILDCARD } from "../shared/mcpTools";
import { createInProcessMcp } from "../mcp/inProcess";
import { errorMessage } from "./errorMessage";

/** Cap on streamed tool-result previews. */
const RESULT_PREVIEW_MAX = 2000;

export interface AgentHostDeps {
  tools: StudioTools;
  /** The active post's worktree (cwd and the file the agent edits); null if none open. */
  getActiveWorktree: () => ActiveWorktree | null;
  /** The studio's own root worktree: a dispatch target distinct from any post. Root dispatch is
   *  refused if omitted. */
  rootWorktreePath?: string;
  /** Authoring rules appended to the system prompt and used as the MCP instructions. */
  skillInstructions: string;
  /** Sink for server-to-client messages. */
  emit: (msg: ServerMessage) => void;
  /** So the doc-sync watcher soft-locks and classifies agent writes for the turn. */
  onTurnStart?: () => void;
  /** Fires after every turn, success or failure, so a listener (e.g. the F4 conflict resolver) can
   *  react to promptId without its own hook into `query()`. */
  onTurnEnd?: (promptId: string) => void;
  /** Mode chip default; defaults to "auto". */
  defaultPermissionMode?: PermissionMode;
  /** Model chip default; defaults to `DEFAULT_MODEL`. */
  defaultModel?: ClaudeModel;
  /** Effort chip default; defaults to `DEFAULT_EFFORT`. */
  defaultEffort?: EffortLevel;
  /** Dirs editable beyond the worktree at launch; seeds the granted-dir set. */
  additionalDirectories?: string[];
  /** Fires after a Bash call whose cwd's node_modules stopped being a symlink to the shared repo
   *  install (npm materialized a real one there, e.g. reifying a dependency the agent just added). */
  onDependenciesInstalled?: (cwd: string) => void;
  /** Seam over the SDK's `getSessionMessages` for testing; defaults to the real SDK call. */
  getSessionMessagesImpl?: typeof getSessionMessages;
}

/** The frozen AgentHost plus the studio's MCP status/toggle and permission surface. */
export interface StudioAgentHost extends AgentHost {
  /** Enable/disable one MCP server for the studio's sessions (takes effect next turn). */
  setMcpEnabled(server: string, enabled: boolean): void;
  getMcpStatus(): { name: string; status: string; enabled: boolean }[];
  /** Set the mode for subsequent turns and broadcast the authoritative `mode.status`. */
  setPermissionMode(mode: PermissionMode): void;
  getPermissionMode(): PermissionMode;
  /** Set the model for subsequent turns and broadcast the authoritative `model.status`. */
  setModel(model: ClaudeModel): void;
  getModel(): ClaudeModel;
  /** Set the reasoning effort for subsequent turns and broadcast the authoritative `effort.status`. */
  setEffort(effort: EffortLevel): void;
  getEffort(): EffortLevel;
  /** Resolve an in-flight `permission.request` with the human's decision. */
  resolvePermission(requestId: string, decision: PermissionDecision): void;
  /**
   * Resolve an in-flight AskUserQuestion `permission.request` with the human's picks. Merged into
   * the tool's original input as `answers` and allowed through, so the model reads back the studio's
   * own "answered" tool result rather than the SDK's "did not answer" default.
   */
  answerQuestion(requestId: string, answers: Record<string, string>): void;
  /**
   * Re-key a post's session when the post is renamed, so the resumable conversation follows the post
   * instead of being orphaned under the vanished path. No-op if the old key has no session or the
   * new key is taken.
   */
  renameSessionKey(oldPath: string, newPath: string): void;
}

/** One target's SDK session (a post or the studio root): its id and how the next turn resumes/forks. */
interface AgentSession {
  sessionId: string;
  mode: SessionMode;
  /** Source to resume from on the first turn (resume/fork); undefined for new. */
  resumeFrom?: string;
  /** Whether the next turn is this session's first. */
  firstTurn: boolean;
}

/** Where a turn runs: the session map key and the `query()` cwd. */
interface AgentTarget {
  sessionKey: string;
  cwd: string;
}

export function createAgentHost(deps: AgentHostDeps): StudioAgentHost {
  return new EmbeddedAgentHost(deps);
}

class EmbeddedAgentHost implements StudioAgentHost {
  private readonly deps: AgentHostDeps;

  /** One session per open post (keyed by canonical path) or the studio root (keyed by its own path). */
  private readonly sessions = new Map<string, AgentSession>();
  /** MCP servers observed from session init messages: name to status. */
  private readonly knownServers = new Map<string, string>();
  /** Servers the human toggled off; excluded from each turn's tools. */
  private readonly disabledServers = new Set<string>();
  /** Applied to every turn's `query()`. */
  private currentMode: PermissionMode;
  /** Model applied to every turn's `query()`. */
  private currentModel: ClaudeModel;
  /** Reasoning effort applied to every turn's `query()`. */
  private currentEffort: EffortLevel;
  /** Dirs beyond the worktree edits may target without asking (grown via "always allow"). */
  private readonly grantedDirs: Set<string>;
  /** In-flight prompts: requestId to the resolver awaited inside `canUseTool`. */
  private readonly pendingPermissions = new Map<string, (resolution: PendingResolution) => void>();
  private current: { promptId: string; abort: AbortController } | null = null;
  /** System prompts dispatched while a turn was in flight, FIFO; drained one at a time as each prior
   *  turn's `finally` clears, so a second dispatch queued behind a first is never dropped. */
  private readonly pendingSystemPrompts: { promptId: string; path: string; text: string }[] = [];

  constructor(deps: AgentHostDeps) {
    this.deps = deps;
    this.currentMode = deps.defaultPermissionMode ?? "auto";
    this.currentModel = deps.defaultModel ?? DEFAULT_MODEL;
    this.currentEffort = deps.defaultEffort ?? DEFAULT_EFFORT;
    this.grantedDirs = new Set(deps.additionalDirectories ?? []);
  }

  // ---- session selection (active post's session) ----

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
    // Replay the selected conversation so the panel matches what the agent resumes: the source
    // transcript for resume/fork, empty for a fresh session. The SDK loads this into the agent's
    // context on the next turn but never re-streams it, so the client has no other way to see it.
    const items = mode === "new" ? [] : await this.loadHistory(session.resumeFrom as string);
    this.deps.emit({ type: "session.history", sessionId: session.sessionId, mode, items });
    return { sessionId: session.sessionId, mode };
  }

  /** Read a prior session's stored transcript into the studio's compact history items. */
  private async loadHistory(sourceSessionId: string): Promise<SessionHistoryItem[]> {
    const read = this.deps.getSessionMessagesImpl ?? getSessionMessages;
    try {
      return reduceHistory(await read(sourceSessionId, { includeSystemMessages: false }));
    } catch {
      // A missing/unreadable transcript shouldn't sink the selection; the agent still resumes.
      return [];
    }
  }

  async prompt(input: { promptId: string; text: string; context: PromptContext }): Promise<void> {
    const resolved = this.resolveActiveTarget(input.promptId);
    if (!resolved) return;
    await this.runTurn(input.promptId, resolved.target, () =>
      this.composePrompt(input.text, input.context, resolved.wt),
    );
  }

  async resolveDirective(input: {
    promptId: string;
    path: string;
    range: Range;
    instruction: string;
  }): Promise<void> {
    const resolved = this.resolveActiveTarget(input.promptId);
    if (!resolved) return;
    const wt = resolved.wt;
    await this.runTurn(input.promptId, resolved.target, () =>
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

  async dispatchSystemPrompt(input: { path: string; text: string }): Promise<{ promptId: string; dispatched: boolean }> {
    const promptId = randomUUID();
    // A regular prompt rejects outright when busy (single-threaded session); a system prompt queues
    // instead, since F3/F4 already committed to this dispatch before the human's turn could be foreseen.
    if (this.current) {
      this.pendingSystemPrompts.push({ promptId, path: input.path, text: input.text });
      return { promptId, dispatched: true };
    }
    // Checked here rather than solely inside runSystemTurn: runTurn/onTurnEnd never fires for a
    // dispatch that never started, so a caller waiting on onTurnEnd to learn the outcome would wait
    // forever. `dispatched: false` is the only signal this precondition failure ever gets.
    const resolved = this.resolveDispatchTarget(input.path);
    if (!resolved.ok) {
      this.deps.emit({ type: "error", promptId, message: resolved.reason });
      return { promptId, dispatched: false };
    }
    void this.runTurn(promptId, resolved.target, () => input.text);
    return { promptId, dispatched: true };
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
    // The studio server is always in the inventory, even before the first turn establishes it.
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

  setModel(model: ClaudeModel): void {
    this.currentModel = model;
    this.deps.emit({ type: "model.status", model });
  }

  getModel(): ClaudeModel {
    return this.currentModel;
  }

  setEffort(effort: EffortLevel): void {
    this.currentEffort = effort;
    this.deps.emit({ type: "effort.status", effort });
  }

  getEffort(): EffortLevel {
    return this.currentEffort;
  }

  resolvePermission(requestId: string, decision: PermissionDecision): void {
    this.resolvePending(requestId, { kind: "decision", decision });
  }

  answerQuestion(requestId: string, answers: Record<string, string>): void {
    this.resolvePending(requestId, { kind: "answer", answers });
  }

  private resolvePending(requestId: string, resolution: PendingResolution): void {
    const resolve = this.pendingPermissions.get(requestId);
    if (!resolve) return;
    this.pendingPermissions.delete(requestId);
    resolve(resolution);
  }

  renameSessionKey(oldPath: string, newPath: string): void {
    if (oldPath === newPath) return;
    const session = this.sessions.get(oldPath);
    // Only move when there's a session to move and the destination is free (don't clobber).
    if (session && !this.sessions.has(newPath)) {
      this.sessions.set(newPath, session);
      this.sessions.delete(oldPath);
    }
  }

  /** Abort every still-pending prompt: the turn ended, so none can be answered. */
  private abortPendingPermissions(): void {
    for (const resolve of this.pendingPermissions.values()) resolve({ kind: "abort" });
    this.pendingPermissions.clear();
  }

  /**
   * The `canUseTool` handler: emit a `permission.request` and await the human's decision (or an abort
   * if the turn is cancelled). "always" widens the session with the SDK's suggestions and, for an
   * out-of-worktree edit, grants that file's dir so the jail hook stops asking. An AskUserQuestion
   * answer merges into the original input (echoed back so the model reads its own picks), rather than
   * mapping to a plain decision.
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
        toolUseId: opts.toolUseID,
      });
      const resolution = await new Promise<PendingResolution>((resolve) => {
        this.pendingPermissions.set(requestId, resolve);
        if (opts.signal.aborted) this.resolvePending(requestId, { kind: "decision", decision: "deny" });
        else opts.signal.addEventListener("abort", () => resolve({ kind: "abort" }), { once: true });
      });
      this.pendingPermissions.delete(requestId);
      if (resolution.kind === "abort") {
        return { behavior: "deny", message: "The turn was cancelled before this was approved." };
      }
      if (resolution.kind === "answer") {
        // Only AskUserQuestion's own answers can be merged in this way; a client bug or stale
        // requestId answering a different pending tool call must not bypass its own decision path.
        if (toolName !== "AskUserQuestion") {
          return { behavior: "deny", message: "This tool call cannot be answered like a question." };
        }
        return { behavior: "allow", updatedInput: { ...input, answers: resolution.answers } };
      }
      if (resolution.decision === "always") this.grantDirFor(toolName, input);
      return decisionToPermissionResult(resolution.decision, opts.suggestions);
    };
  }

  /** On "always allow" for a file-mutation tool, grant that file's parent dir for the session. */
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

  private getOrCreateSession(key: string): AgentSession {
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
      // Inline (⌘K) prompt: the studio already resolved the region the author invoked on.
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
      // Chat-panel prompt: no region. Fall back to the editor-context tool for "here".
      lines.push(
        `Cursor at UTF-16 offset ${context.cursor}.`,
        'Resolve "here" / "this" against mcp__studio__get_editor_context, then edit the post file directly ' +
          "with the native tools (Read/Edit/Write). Keep the four frontmatter keys valid and never reformat " +
          "unrelated lines.",
      );
    }
    lines.push(
      "The author can keep editing the post while you work, so the file may no longer match what " +
        "you last read. If an Edit fails because its old_string no longer matches, re-read the file " +
        "and retry against the current contents rather than giving up.",
      "</studio-context>",
    );
    return lines.join("\n");
  }

  private buildOptions(session: AgentSession, cwd: string, abort: AbortController): Options {
    const disallowedTools = [...this.disabledServers].map((name) => `mcp__${name}__*`);
    const options: Options = {
      cwd,
      abortController: abort,
      model: this.currentModel,
      effort: this.currentEffort,
      // The studio-tool wildcard is always auto-approved so the panel's own tools never prompt.
      // `additionalDirectories` are the dirs the human granted beyond the worktree.
      permissionMode: this.currentMode,
      allowedTools: [STUDIO_TOOL_WILDCARD],
      additionalDirectories: [...this.grantedDirs],
      canUseTool: this.makeCanUseTool(),
      // Mode-proof: forces an edit escaping the allowed set (worktree plus granted dirs) to `ask`.
      hooks: {
        PreToolUse: [{ hooks: [worktreeAskHook(() => [cwd, ...this.grantedDirs])] }],
        PostToolUse: [{ hooks: [nodeModulesPromotedHook(this.deps.onDependenciesInstalled)] }],
      },
      // Load the author's normal config: "user" brings global ~/.claude (their MCP servers, skills,
      // CLAUDE.md, rules); "project"/"local" bring the worktree's .claude. Our studio server merges in.
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
        // fork: resume the source but pin a fresh id.
        options.resume = session.resumeFrom;
        options.forkSession = true;
        options.sessionId = session.sessionId;
      }
    } else {
      options.resume = session.sessionId;
    }
    return options;
  }

  /** The active post's dispatch target, or null after emitting the standard "no active post" error. */
  private resolveActiveTarget(promptId: string): { target: AgentTarget; wt: ActiveWorktree } | null {
    const wt = this.deps.getActiveWorktree();
    if (!wt) {
      this.deps.emit({ type: "error", promptId, message: "no active post to prompt" });
      return null;
    }
    return { target: { sessionKey: wt.canonicalPath, cwd: wt.worktreePath }, wt };
  }

  /** Resolves a dispatched `path` to its session key and cwd: the active post, or the studio root
   *  when `rootWorktreePath` is configured and matches. Otherwise the reason it can't dispatch. */
  private resolveDispatchTarget(path: string): { ok: true; target: AgentTarget } | { ok: false; reason: string } {
    if (this.deps.rootWorktreePath && path === this.deps.rootWorktreePath) {
      return { ok: true, target: { sessionKey: path, cwd: path } };
    }
    const wt = this.deps.getActiveWorktree();
    if (wt && wt.canonicalPath === path) {
      return { ok: true, target: { sessionKey: wt.canonicalPath, cwd: wt.worktreePath } };
    }
    return { ok: false, reason: `cannot dispatch: ${path} is not the active post` };
  }

  /** Runs a system-composed prompt queued behind a prior turn, once that turn's `finally` drains it.
   *  Unlike `dispatchSystemPrompt`'s own immediate-dispatch check, a mismatch here still reaches
   *  `onTurnEnd`: the caller already got `dispatched: true` back when this was first queued, so
   *  `onTurnEnd` is the only signal left for it. */
  private async runSystemTurn(promptId: string, path: string, text: string): Promise<void> {
    const resolved = this.resolveDispatchTarget(path);
    if (!resolved.ok) {
      this.deps.emit({ type: "error", promptId, message: resolved.reason });
      this.deps.onTurnEnd?.(promptId);
      return;
    }
    await this.runTurn(promptId, resolved.target, () => text);
  }

  private async runTurn(promptId: string, target: AgentTarget, buildPrompt: () => string): Promise<void> {
    // A resumed session is single-threaded; reject a second concurrent prompt rather than desync
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

    const session = this.getOrCreateSession(target.sessionKey);
    const prompt = buildPrompt();

    const abort = new AbortController();
    this.current = { promptId, abort };
    this.deps.onTurnStart?.();
    try {
      for await (const message of query({ prompt, options: this.buildOptions(session, target.cwd, abort) })) {
        this.dispatch(promptId, session, message);
      }
    } catch (err) {
      if (abort.signal.aborted) {
        this.deps.emit({ type: "done", promptId, stopReason: "cancelled" });
      } else {
        this.deps.emit({ type: "error", promptId, message: errorMessage(err) });
      }
    } finally {
      // The turn is over and can't answer prompts, so release any still parked before it leaks.
      this.abortPendingPermissions();
      if (this.current?.promptId === promptId) this.current = null;
      // Drain the queue here, not just on success: an errored/aborted turn must not strand it, since
      // nothing else will ever look at `pendingSystemPrompts` again otherwise. One at a time, FIFO:
      // draining a system turn re-enters this same `finally` and pops the next once it too ends.
      // Runs before onTurnEnd, not after: onTurnEnd's own consumer (a conflict resolver) can
      // synchronously dispatch a new system prompt the instant a turn ends, and dispatchSystemPrompt's
      // busy-check only sees a turn as live via `this.current`. Draining first re-populates `this.current`
      // with the queued item (if any) before that consumer runs, so a synchronous redispatch correctly
      // queues behind it instead of racing into the immediate-dispatch path and cutting in line ahead of
      // an already-queued item.
      const pending = this.pendingSystemPrompts.shift();
      if (pending) void this.runSystemTurn(pending.promptId, pending.path, pending.text);
      this.deps.onTurnEnd?.(promptId);
    }
  }

  private dispatch(promptId: string, session: AgentSession, message: SDKMessage): void {
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

  private onSessionEstablished(session: AgentSession, id: string): void {
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

// ---- session transcript replay ----

interface TextBlock {
  type: "text";
  text: string;
}
interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: unknown;
}

function messageContent(message: unknown): unknown {
  return message && typeof message === "object" ? (message as { content?: unknown }).content : undefined;
}

function isTextBlock(block: unknown): block is TextBlock {
  return (
    !!block &&
    typeof block === "object" &&
    (block as { type?: unknown }).type === "text" &&
    typeof (block as { text?: unknown }).text === "string"
  );
}

function isToolUseBlock(block: unknown): block is ToolUseBlock {
  if (!block || typeof block !== "object") return false;
  const b = block as { type?: unknown; id?: unknown; name?: unknown };
  return b.type === "tool_use" && typeof b.id === "string" && typeof b.name === "string";
}

/** Drop the composed prompt's `<studio-context>` trailer so a replayed turn shows the author's own words. */
function stripStudioContext(text: string): string {
  const marker = text.indexOf("<studio-context>");
  return (marker === -1 ? text : text.slice(0, marker)).trim();
}

/**
 * Reduce a stored session transcript into the studio's compact history items, mirroring the live
 * `dispatch` mapping: assistant text, tool calls (their result filled in from the matching
 * tool_result the model saw as a user turn), and the author's own prompts. Tool-result-only user
 * turns carry no bubble of their own. Pure, for unit testing.
 */
export function reduceHistory(messages: readonly SessionMessage[]): SessionHistoryItem[] {
  const items: SessionHistoryItem[] = [];
  // toolUseId to the emitted tool item awaiting its result, so a later tool_result fills it in place.
  const toolsById = new Map<string, SessionHistoryTool>();

  for (const entry of messages) {
    const content = messageContent(entry.message);
    if (entry.type === "assistant") {
      if (!Array.isArray(content)) continue;
      for (const block of content) {
        if (isTextBlock(block)) {
          if (block.text) items.push({ kind: "assistant", text: block.text });
        } else if (isToolUseBlock(block)) {
          const tool: SessionHistoryTool = {
            toolUseId: block.id,
            name: block.name,
            input: block.input,
            isError: false,
            resultPreview: "",
          };
          toolsById.set(block.id, tool);
          items.push({ kind: "tool", tool });
        }
      }
    } else if (entry.type === "user") {
      if (typeof content === "string") {
        const text = stripStudioContext(content);
        if (text) items.push({ kind: "user", text });
      } else if (Array.isArray(content)) {
        for (const block of content) {
          if (isToolResultBlock(block)) {
            const tool = toolsById.get(block.tool_use_id);
            if (tool) {
              tool.isError = block.is_error === true;
              tool.resultPreview = previewToolResult(block.content);
            }
          } else if (isTextBlock(block)) {
            const text = stripStudioContext(block.text);
            if (text) items.push({ kind: "user", text });
          }
        }
      }
    }
  }
  return items;
}

// ---- permission decision mapping ----

/** How a pending `canUseTool` call was settled: a plain decision, an AskUserQuestion answer, or abort. */
type PendingResolution =
  | { kind: "decision"; decision: PermissionDecision }
  | { kind: "answer"; answers: Record<string, string> }
  | { kind: "abort" };

type CanUseToolFn = NonNullable<Options["canUseTool"]>;
type PermissionSuggestions = Parameters<CanUseToolFn>[2]["suggestions"];
type SdkPermissionResult = NonNullable<Awaited<ReturnType<CanUseToolFn>>>;

/**
 * Map a `permission.response` decision to the SDK's PermissionResult. "always" carries the SDK's own
 * suggestions so the widening is exactly what the SDK proposed for this call.
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
 * PreToolUse hook: forces a file edit whose target escapes the allowed dir set to `ask` rather than
 * letting the mode auto-approve it. Deterministic and mode-proof. Reads and Bash aren't gated here.
 * Reads `getAllowedDirs` per call so a mid-session grant takes effect immediately.
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

/** The file a mutation tool would write, or null when it isn't a file mutation / has no path. */
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

// ---- node_modules promotion (PostToolUse hook) ----

/** A Bash command that could reify node_modules (add/remove/update a dependency). */
const NPM_MUTATION_RE = /\bnpm\b\s+(install|i|ci|add|remove|rm|uninstall|un|update|up)\b/;

/**
 * PostToolUse hook: after a Bash call that looks like it could have changed dependencies, checks
 * whether the session's node_modules stopped being a symlink to the shared repo install. npm promotes
 * it to a real directory the instant its own reify needs to touch anything (even a plain `npm install`
 * with nothing to change does this), so a real `node_modules` here means the agent's command actually
 * ran one, and the running preview needs restarting to resolve modules against the fresh install
 * instead of whatever it had already cached from the old symlink target.
 */
export function nodeModulesPromotedHook(onPromoted?: (cwd: string) => void) {
  return async (input: HookInput): Promise<HookJSONOutput> => {
    if (input.hook_event_name !== "PostToolUse" || input.tool_name !== "Bash" || !onPromoted) return {};
    const command = (input.tool_input as Record<string, unknown> | undefined)?.command;
    if (typeof command !== "string" || !NPM_MUTATION_RE.test(command)) return {};
    if (isRealNodeModules(input.cwd)) onPromoted(input.cwd);
    return {};
  };
}

/** True when `<cwd>/node_modules` exists and is a real directory rather than a symlink. */
function isRealNodeModules(cwd: string): boolean {
  const link = path.join(cwd, "node_modules");
  try {
    const stat = lstatSync(link);
    return stat.isDirectory() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}

/** True when `target` (resolved against `dir`) stays inside `dir` (lexical; no symlink walk). */
function withinDir(target: string, dir: string): boolean {
  const resolved = path.resolve(dir, expandHome(target));
  const rel = path.relative(dir, resolved);
  if (rel !== "" && (rel.startsWith("..") || path.isAbsolute(rel))) return false;
  // A worktree's `node_modules` symlinks to the repo's shared deps, so a lexically in-jail path
  // under it physically escapes into the tree every post shares. Treat it as outside the jail.
  if (rel.split(path.sep).includes("node_modules")) return false;
  return true;
}

/** Expand a leading `~` / `~/…` to the home directory (always outside the worktree). */
function expandHome(p: string): string {
  if (p === "~") return homedir();
  if (p.startsWith("~/")) return path.join(homedir(), p.slice(2));
  return p;
}
