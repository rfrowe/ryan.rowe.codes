// The web face of the sidecar: a loopback-only HTTP and WebSocket server for the SPA. REST covers
// the request/response calls; the single WebSocket relays ClientMessage to services and streams
// every ServerMessage (doc-sync and agent conversation) back out.
//
// Security: bound to 127.0.0.1 by default (STUDIO_BIND_HOST overrides this for containerized/
// reverse-proxied deployments); a per-launch bearer token on every request (Authorization for REST,
// `?token=` for the WS since browsers can't set WS headers); the Host header must match the bound
// loopback name or STUDIO_HOST_SIDECAR (DNS rebinding), and any Origin must be on the allowlist
// (CSRF).
//
// The agent host has no subscription of its own; it publishes through `store.publish`, so this
// server subscribes only to `services.store` and both streams reach the browser via that fan-out.

import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { timingSafeEqual } from "node:crypto";
import type { Duplex } from "node:stream";

import { WebSocketServer, type WebSocket } from "ws";

import type { StudioServices } from "../shared/services";
import { resolveDestructiveConfirm, type StudioStore } from "../state/store";
import type { StudioAgentHost } from "./agentHost";
import type {
  ClientMessage,
  DiffResponse,
  FetchResponse,
  PostsResponse,
  PutDocRequest,
  PutDocResponse,
  RebaseAbortRequest,
  RebaseAbortResponse,
  SaveDraftRequest,
  SaveDraftResponse,
  ServerMessage,
  SessionsResponse,
  ShipRequest,
  ShipResponse,
  UpdateRequest,
  UpdateResponse,
  UpdateRootRequest,
  UpdateRootResponse,
} from "../shared/protocol";

const HOST = process.env.STUDIO_BIND_HOST ?? "127.0.0.1";
const PROTOCOL = process.env.STUDIO_PROTOCOL ?? "http";
const MAX_BODY_BYTES = 4 * 1024 * 1024; // generous for a single MDX post

/** The hostname part of a `host[:port]` value, e.g. "sidecar.lan:443" -> "sidecar.lan". */
function hostnameOf(hostAndPort: string): string {
  return hostAndPort.split(":")[0];
}

export interface StudioServer {
  listen(): Promise<void>;
  close(): Promise<void>;
}

export interface ServerOptions {
  token: string;
  webPort: number;
  /** The SPA's dev-server port; its loopback origins are the CSRF Origin allowlist. */
  spaPort: number;
  /**
   * Attach a `/lsp` WebSocket to the MDX language-server bridge. Omitted when the LSP feature is
   * unavailable, in which case `/lsp` upgrades are refused and the editor uses its built-in sources.
   */
  lspConnect?: (ws: WebSocket) => void;
  /** Run `git fetch --prune origin` and republish git.state; backs `POST /fetch`. */
  fetchRemote?: () => Promise<FetchResponse>;
  /** The explicit "Update root from origin" affordance; backs `POST /update-root`. */
  updateRoot?: (confirm: boolean) => Promise<UpdateRootResponse>;
}

export function createServer(services: StudioServices, opts: ServerOptions): StudioServer {
  const { token, webPort, spaPort, lspConnect } = opts;
  // Only the SPA's own origin may call the sidecar (CSRF guard). STUDIO_HOST_SPA defaults to the
  // SPA's loopback address, so this is a no-op addition to the two literals below unless it's set.
  const allowedOrigins = new Set([
    `http://localhost:${spaPort}`,
    `http://127.0.0.1:${spaPort}`,
    `${PROTOCOL}://${process.env.STUDIO_HOST_SPA ?? `127.0.0.1:${spaPort}`}`,
  ]);
  // The sidecar always injects the concretes; the frozen DI seams omit the studio-only
  // multi-doc/worktree and MCP-status accessors, so recover them here for the post and mcp paths.
  const store = services.store as StudioStore;
  const agentHost = services.agentHost as StudioAgentHost;

  const http = createHttpServer((req, res) => {
    handleRequest(req, res).catch((err: unknown) => {
      sendJson(res, 500, { error: err instanceof Error ? err.message : "internal error" });
    });
  });
  const wss = new WebSocketServer({ noServer: true });
  // A second noServer WS pool for the raw LSP JSON-RPC channel (`/lsp`), kept separate from the
  // frozen ClientMessage/ServerMessage protocol carried by `wss`.
  const lspWss = new WebSocketServer({ noServer: true });

  // ---- auth primitives ----
  function tokenOk(candidate: string | undefined): boolean {
    if (candidate === undefined) return false;
    const a = Buffer.from(candidate);
    const b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  function bearerOk(req: IncomingMessage): boolean {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return false;
    return tokenOk(header.slice("Bearer ".length));
  }

  // STUDIO_HOST_SIDECAR defaults to the sidecar's own loopback address, so this is a no-op
  // addition to the two literals below unless it's set (defeats DNS rebinding either way).
  const allowedHostnames = new Set([
    "127.0.0.1",
    "localhost",
    hostnameOf(process.env.STUDIO_HOST_SIDECAR ?? `127.0.0.1:${webPort}`),
  ]);

  /** Host header must match the sidecar's own loopback name or its configured public hostname. */
  function hostOk(req: IncomingMessage): boolean {
    const host = req.headers.host;
    if (!host) return false;
    return allowedHostnames.has(hostnameOf(host));
  }

  /** When an Origin is present (browser), it must be on the allowlist; server-to-server has none. */
  function originOk(req: IncomingMessage): boolean {
    const origin = req.headers.origin;
    if (origin === undefined) return true;
    return allowedOrigins.has(origin);
  }

  // ---- REST ----
  async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!hostOk(req)) return sendJson(res, 403, { error: "forbidden host" });
    if (!originOk(req)) return sendJson(res, 403, { error: "forbidden origin" });

    // CORS: the SPA and the sidecar are different origins, and the Authorization header makes every
    // call a preflighted cross-origin request. Echo the allowlisted Origin and answer the OPTIONS
    // preflight up front, before the bearer check (preflight carries no credentials).
    const origin = req.headers.origin;
    if (typeof origin === "string") {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
    if ((req.method ?? "GET") === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
      res.setHeader("Access-Control-Max-Age", "600");
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const method = req.method ?? "GET";
    const route = `${method} ${url.pathname}`;

    // Unauthenticated so the orchestrator can health-gate startup without the token. Still
    // loopback and Host-guarded.
    if (route === "GET /health") return sendJson(res, 200, { ok: true });

    if (!bearerOk(req)) return sendJson(res, 401, { error: "unauthorized" });

    switch (route) {
      case "PUT /doc": {
        const body = await readJson<PutDocRequest>(req);
        // Route by the request's path, not "the active doc": a save-before-switch flush can arrive
        // after the active tab changed and must still land on its post.
        const result = await store.writeByPath(body.path, body.text, body.baseRev);
        return sendJson(res, 200, result satisfies PutDocResponse);
      }

      case "GET /diff": {
        const path = url.searchParams.get("path") ?? undefined;
        const op = url.searchParams.get("op");
        // The destructive-confirm preview (delete/revert): straight from postLossPreview, so the
        // counts a caller echoes back on confirm can never drift from what confirm itself re-checks.
        if (op === "delete" || op === "revert") {
          if (!path) return sendJson(res, 400, { error: "op requires a path" });
          const rawScope = url.searchParams.get("scope");
          const scope = rawScope === "post" || rawScope === "all" ? rawScope : undefined;
          const preview = await store.postLossPreview(path, op, scope);
          return sendJson(res, 200, {
            status: preview.status,
            diff: preview.diff,
            outsideCount: 0,
            scope: preview.scope,
            changedFiles: preview.changedFiles,
            unpushed: preview.ahead,
          } satisfies DiffResponse);
        }
        // Ship / save-draft review. Optional `path` targets a specific open post (save-draft can
        // review a non-focused tab); omitted, the diff follows the active post (ship).
        const scope = url.searchParams.get("scope") === "all" ? "all" : "post";
        const { status, diff, outsideCount } = await services.ship.diff(scope, path);
        return sendJson(res, 200, { status, diff, outsideCount } satisfies DiffResponse);
      }

      case "GET /sessions": {
        // Default to the active post's worktree; `?scope=all` widens to every session.
        const scope = url.searchParams.get("scope") === "all" ? "all" : "post";
        const sessions = await services.sessions.list(scope);
        return sendJson(res, 200, { sessions } satisfies SessionsResponse);
      }

      case "GET /posts": {
        const posts = await services.tools.listPosts();
        return sendJson(res, 200, { posts } satisfies PostsResponse);
      }

      case "POST /ship": {
        const body = await readJson<ShipRequest>(req);
        const result = await services.ship.openPr({
          branch: body.branch,
          subject: body.subject,
          body: body.body,
          scope: body.scope,
          confirm: body.confirm,
        });
        return sendJson(res, 200, result satisfies ShipResponse);
      }

      case "POST /fetch": {
        // The global refs-only pull (⌘⇧F): fetch, then git.state republishes so every post's
        // behind/incoming reflects it. POST /update below is the per-post fetch-then-rebase.
        const result = (await opts.fetchRemote?.()) ?? { ok: false, error: "fetch is unavailable" };
        return sendJson(res, 200, result satisfies FetchResponse);
      }

      case "POST /update-root": {
        // The deliberate counterpart to fetch's own reactive ff-only advance: ff's the root when
        // clean, else reports the divergence so the client can confirm a rebase (never automatic).
        const body = await readJson<UpdateRootRequest>(req);
        const result = (await opts.updateRoot?.(body.confirm)) ?? { ok: false, error: "update-root is unavailable" };
        return sendJson(res, 200, result satisfies UpdateRootResponse);
      }

      case "POST /update": {
        // F3: fetch this post's base (targeted, not the global --prune above) then rebase onto it.
        const body = await readJson<UpdateRequest>(req);
        const result = await services.gitOps.update(body.path);
        // A conflict hands off to F4 rather than a manual merge-conflict UI; the response still
        // reports "conflicted" immediately, git.state's rebase.phase flips to "resolving" once the
        // agent's dispatch actually lands.
        if (result.ok && result.result === "conflicted") {
          services.conflictResolver.onConflict(body.path, result.conflictedFiles);
        }
        return sendJson(res, 200, result satisfies UpdateResponse);
      }

      case "POST /rebase-abort": {
        // F6: abort an in-progress rebase, returning the post to its pre-update tip.
        const body = await readJson<RebaseAbortRequest>(req);
        const result = await services.gitOps.rebaseAbort(body.path);
        return sendJson(res, 200, result satisfies RebaseAbortResponse);
      }

      case "POST /save-draft": {
        // Persist a draft to origin (commit + push its branch, no PR). Studio-run, like ship.
        const body = await readJson<SaveDraftRequest>(req);
        const result = await services.ship.saveDraft({
          path: body.path,
          subject: body.subject,
          body: body.body,
          scope: body.scope,
          confirm: body.confirm,
        });
        return sendJson(res, 200, result satisfies SaveDraftResponse);
      }

      default:
        return sendJson(res, 404, { error: "not found" });
    }
  }

  // ---- WebSocket ----
  http.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    if (!hostOk(req) || !originOk(req) || !tokenOk(url.searchParams.get("token") ?? undefined)) {
      socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }
    // The raw LSP JSON-RPC channel rides its own path, behind the same host/origin/token guard.
    if (url.pathname === "/lsp") {
      if (!lspConnect) {
        socket.write("HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n");
        socket.destroy();
        return;
      }
      lspWss.handleUpgrade(req, socket, head, (ws) => lspConnect(ws));
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => onConnection(ws));
  });

  function onConnection(ws: WebSocket): void {
    const unsubscribe = services.store.subscribe((message: ServerMessage) => {
      if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(message));
    });

    // Replay the current snapshot so a freshly-connected SPA can bootstrap (the bootstrap openPost
    // ran before any client connected). Order matches the store's publishActivation (tabs and active
    // before file.changed) so the target tab exists before its buffer arrives.
    ws.send(JSON.stringify({ type: "tabs", open: store.getOpenTabs() } satisfies ServerMessage));
    const doc = store.getActiveDoc();
    if (doc) {
      const active = store.getActive();
      if (active) ws.send(JSON.stringify({ type: "active", ...active } satisfies ServerMessage));
      const snapshot: ServerMessage = {
        type: "file.changed",
        path: doc.path,
        text: doc.text,
        rev: doc.rev,
        origin: "external",
      };
      ws.send(JSON.stringify(snapshot));
    }
    ws.send(JSON.stringify({ type: "preview.url", preview: store.getPreview() } satisfies ServerMessage));
    // Replay the name-sync so a reconnecting client re-raises the desync banner + ship gate without
    // waiting for the next edit. (Snapshot omits `canComplete`; the next refresh refines it.)
    ws.send(JSON.stringify({ type: "post.namesync", ...store.getActiveNameSync() } satisfies ServerMessage));
    ws.send(JSON.stringify({ type: "mcp.status", servers: agentHost.getMcpStatus() } satisfies ServerMessage));
    ws.send(JSON.stringify({ type: "mode.status", mode: agentHost.getPermissionMode() } satisfies ServerMessage));
    ws.send(JSON.stringify({ type: "model.status", model: agentHost.getModel() } satisfies ServerMessage));
    // The cached git.state snapshot, if the first one has landed; omitted otherwise rather than
    // blocking the rest of the connect snapshot on a fresh git re-query.
    const gitState = store.getGitState();
    if (gitState) ws.send(JSON.stringify({ type: "git.state", state: gitState } satisfies ServerMessage));

    ws.on("message", (data) => {
      let message: ClientMessage;
      try {
        message = JSON.parse(data.toString()) as ClientMessage;
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "malformed message" } satisfies ServerMessage));
        return;
      }
      handleClientMessage(ws, message);
    });

    ws.on("close", unsubscribe);
    ws.on("error", () => ws.terminate());
  }

  function handleClientMessage(ws: WebSocket, message: ClientMessage): void {
    switch (message.type) {
      case "prompt":
        services.agentHost
          .prompt({ promptId: message.promptId, text: message.text, context: message.context })
          .catch((err: unknown) => emitError(ws, message.promptId, err));
        return;

      case "resolveDirective":
        services.agentHost
          .resolveDirective({
            promptId: message.promptId,
            path: message.path,
            range: message.range,
            instruction: message.instruction,
          })
          .catch((err: unknown) => emitError(ws, message.promptId, err));
        return;

      case "cancel":
        services.agentHost.cancel(message.promptId);
        return;

      case "session.select":
        // select() broadcasts session.history (session id, mode, and the replayed transcript)
        // through the store fan-out, so there's nothing to reply here beyond surfacing a failure.
        services.agentHost
          .select(message.mode, message.sessionId)
          .catch((err: unknown) => emitError(ws, undefined, err));
        return;

      case "editor.state":
        services.store.setEditorContext({
          path: message.path,
          cursor: message.cursor,
          selection: message.selection,
          viewport: message.viewport,
        });
        return;

      // Open (or focus) a post by canonical path, ensuring/reusing its worktree. The store publishes
      // the switch to every socket and retargets the watcher/astro via its onActiveChange subscriber;
      // here we only correlate the outcome back.
      case "post.open": {
        const { requestId } = message;
        store.openPost(message.path).then(
          (doc) => sendPostResult(ws, requestId, { ok: true, path: doc.path }),
          (err: unknown) => sendPostResult(ws, requestId, { ok: false, error: errorText(err) }),
        );
        return;
      }

      // Create a new post (in its own worktree) and make it active. Routed through scaffold_post so
      // the WS and MCP paths share one implementation; the store publishes the switch.
      case "post.create": {
        const { requestId } = message;
        services.tools
          .scaffoldPost({
            title: message.title,
            slug: message.slug,
            headline: message.headline,
            created_at: message.created_at,
          })
          .then(
            (result) =>
              sendPostResult(
                ws,
                requestId,
                result.ok ? { ok: true, path: result.path } : { ok: false, error: result.error },
              ),
            (err: unknown) => sendPostResult(ws, requestId, { ok: false, error: errorText(err) }),
          );
        return;
      }

      // Close a tab. The store keeps the worktree/branch for a tab with a draft (reused on re-open)
      // but tears down a clean tab; either way it re-focuses another post and publishes the tab set.
      case "post.close": {
        const { requestId, path } = message;
        store.closePost(path).then(
          () => sendPostResult(ws, requestId, { ok: true, path }),
          (err: unknown) => sendPostResult(ws, requestId, { ok: false, error: errorText(err) }),
        );
        return;
      }

      // Rename the active post's slug: move the file, `git branch -m`, then `git worktree move`. The
      // store broadcasts `post.renamed`, which drives both the clients' tab migration and the SDK
      // session re-key (wired in main.ts), so the resumable conversation follows the rename.
      case "post.rename": {
        const { requestId, path } = message;
        store.renamePost(path, { slug: message.newSlug }).then(
          (result) =>
            sendPostResult(
              ws,
              requestId,
              result.ok ? { ok: true, path: result.path } : { ok: false, error: result.error },
            ),
          (err: unknown) => sendPostResult(ws, requestId, { ok: false, error: errorText(err) }),
        );
        return;
      }

      // Resolve a frontmatter/filename desync by renaming to match the frontmatter. Same seam as
      // post.rename, but the store derives the target itself.
      case "post.completeRename": {
        const { requestId, path } = message;
        store.completeRename(path).then(
          (result) =>
            sendPostResult(
              ws,
              requestId,
              result.ok ? { ok: true, path: result.path } : { ok: false, error: result.error },
            ),
          (err: unknown) => sendPostResult(ws, requestId, { ok: false, error: errorText(err) }),
        );
        return;
      }

      // The inverse: rewrite the frontmatter so its derived URL matches the filename. No file rename,
      // so no session re-key; the store broadcasts file.changed.
      case "post.revertUrl": {
        const { requestId, path } = message;
        store.revertUrl(path).then(
          (result) => sendPostResult(ws, requestId, result.ok ? { ok: true, path } : { ok: false, error: result.error }),
          (err: unknown) => sendPostResult(ws, requestId, { ok: false, error: errorText(err) }),
        );
        return;
      }

      // Delete a draft post (worktree and branch). The client already previewed via GET /diff?op=delete
      // and echoes back what it saw; resolveDestructiveConfirm re-checks a fresh preview against that
      // before deleting, refusing if the tree moved on since the preview (an agent turn, say).
      case "post.delete": {
        const { requestId, path, expectedChangedFiles, expectedUnpushed } = message;
        void (async () => {
          try {
            const gate = await resolveDestructiveConfirm(store, "delete", path, undefined, {
              changedFiles: expectedChangedFiles,
              ahead: expectedUnpushed,
            });
            if (!gate.ok) {
              sendPostResult(ws, requestId, { ok: false, error: gate.error });
              return;
            }
            const res = await store.deletePost(path);
            sendPostResult(ws, requestId, res.ok ? { ok: true, path } : { ok: false, error: res.error });
          } catch (err) {
            sendPostResult(ws, requestId, { ok: false, error: errorText(err) });
          }
        })();
        return;
      }

      // Revert a post's uncommitted edits to HEAD. Same preview-then-confirm shape as post.delete;
      // revertPost runs even when there's nothing to revert (a safe no-op) rather than special-casing
      // it here.
      case "post.revert": {
        const { requestId, path, scope, expectedChangedFiles } = message;
        void (async () => {
          try {
            const gate = await resolveDestructiveConfirm(store, "revert", path, scope, {
              changedFiles: expectedChangedFiles,
              ahead: 0,
            });
            if (!gate.ok) {
              sendPostResult(ws, requestId, { ok: false, error: gate.error });
              return;
            }
            const res = await store.revertPost(path, gate.scope);
            sendPostResult(ws, requestId, res.ok ? { ok: true, path } : { ok: false, error: res.error });
          } catch (err) {
            sendPostResult(ws, requestId, { ok: false, error: errorText(err) });
          }
        })();
        return;
      }

      // Toggle one MCP server. The agent host tracks the disabled set and re-broadcasts mcp.status
      // through the store fan-out.
      case "mcp.setEnabled": {
        const { requestId, server, enabled } = message;
        try {
          agentHost.setMcpEnabled(server, enabled);
          sendPostResult(ws, requestId, { ok: true });
        } catch (err) {
          sendPostResult(ws, requestId, { ok: false, error: errorText(err) });
        }
        return;
      }

      // Set the permission mode for subsequent turns; the agent host broadcasts the authoritative
      // mode.status through the store fan-out.
      case "mode.set":
        agentHost.setPermissionMode(message.mode);
        return;

      // Set the model for subsequent turns; the agent host broadcasts the authoritative model.status.
      case "model.set":
        agentHost.setModel(message.model);
        return;

      // Answer an in-flight permission prompt: unblocks the awaiting canUseTool in the agent host.
      case "permission.response":
        agentHost.resolvePermission(message.requestId, message.decision);
        return;

      // Answer an in-flight AskUserQuestion prompt with the human's picks.
      case "question.answer":
        agentHost.answerQuestion(message.requestId, message.answers);
        return;
    }
  }

  function sendPostResult(
    ws: WebSocket,
    requestId: string,
    outcome: { ok: true; path?: string } | { ok: false; error: string },
  ): void {
    if (ws.readyState !== ws.OPEN) return;
    ws.send(JSON.stringify({ type: "post.result", requestId, ...outcome } satisfies ServerMessage));
  }

  function emitError(ws: WebSocket, promptId: string | undefined, err: unknown): void {
    if (ws.readyState !== ws.OPEN) return;
    const errorMessage: ServerMessage = {
      type: "error",
      promptId,
      message: err instanceof Error ? err.message : "agent error",
    };
    ws.send(JSON.stringify(errorMessage));
  }

  // ---- lifecycle ----
  return {
    listen() {
      return new Promise<void>((resolve, reject) => {
        const onError = (err: Error): void => reject(err);
        http.once("error", onError);
        http.listen(webPort, HOST, () => {
          http.off("error", onError);
          resolve();
        });
      });
    },
    close() {
      return new Promise<void>((resolve) => {
        for (const client of wss.clients) client.terminate();
        for (const client of lspWss.clients) client.terminate();
        lspWss.close(() => wss.close(() => http.close(() => resolve())));
      });
    },
  };
}

// ---- helpers ----
function errorText(err: unknown): string {
  return err instanceof Error ? err.message : "internal error";
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json" });
  res.end(payload);
}

function readJson<T>(req: IncomingMessage): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")) as T);
      } catch {
        reject(new Error("invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}
