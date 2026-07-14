// The web face of the sidecar: a loopback-only HTTP and WebSocket server for the SPA. REST covers
// the request/response calls; the single WebSocket relays ClientMessage to services and streams
// every ServerMessage (doc-sync and agent conversation) back out.
//
// Security: bound to 127.0.0.1; a per-launch bearer token on every request (Authorization for REST,
// `?token=` for the WS since browsers can't set WS headers); the Host header must be loopback (DNS
// rebinding) and any Origin must be on the allowlist (loopback CSRF).
//
// The agent host has no subscription of its own; it publishes through `store.publish`, so this
// server subscribes only to `services.store` and both streams reach the browser via that fan-out.

import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { timingSafeEqual } from "node:crypto";
import type { Duplex } from "node:stream";

import { WebSocketServer, type WebSocket } from "ws";

import type { StudioServices } from "../shared/services";
import { type StudioStore, postWouldLoseWork } from "../state/store";
import type { StudioAgentHost } from "./agentHost";
import type {
  ClientMessage,
  DiffResponse,
  DirtyPostsResponse,
  DraftsResponse,
  PostsResponse,
  PutDocRequest,
  PutDocResponse,
  ServerMessage,
  SessionsResponse,
  ShipRequest,
  ShipResponse,
} from "../shared/protocol";

const HOST = "127.0.0.1";
const ALLOWED_ORIGINS = new Set(["http://localhost:5199", "http://127.0.0.1:5199"]);
const MAX_BODY_BYTES = 4 * 1024 * 1024; // generous for a single MDX post

export interface StudioServer {
  listen(): Promise<void>;
  close(): Promise<void>;
}

export interface ServerOptions {
  token: string;
  webPort: number;
  /**
   * Attach a `/lsp` WebSocket to the MDX language-server bridge. Omitted when the LSP feature is
   * unavailable, in which case `/lsp` upgrades are refused and the editor uses its built-in sources.
   */
  lspConnect?: (ws: WebSocket) => void;
}

export function createServer(services: StudioServices, opts: ServerOptions): StudioServer {
  const { token, webPort, lspConnect } = opts;
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

  /** Host header must resolve to loopback (defeats DNS rebinding). */
  function hostOk(req: IncomingMessage): boolean {
    const host = req.headers.host;
    if (!host) return false;
    const name = host.split(":")[0];
    return name === "127.0.0.1" || name === "localhost";
  }

  /** When an Origin is present (browser), it must be on the allowlist; server-to-server has none. */
  function originOk(req: IncomingMessage): boolean {
    const origin = req.headers.origin;
    if (origin === undefined) return true;
    return ALLOWED_ORIGINS.has(origin);
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
        const scope = url.searchParams.get("scope") === "all" ? "all" : "post";
        const { status, diff } = await services.ship.diff(scope);
        return sendJson(res, 200, { status, diff } satisfies DiffResponse);
      }

      case "GET /sessions": {
        const sessions = await services.sessions.list();
        return sendJson(res, 200, { sessions } satisfies SessionsResponse);
      }

      case "GET /posts": {
        const posts = await services.tools.listPosts();
        return sendJson(res, 200, { posts } satisfies PostsResponse);
      }

      case "GET /posts/dirty": {
        // Posts with unshipped changes (the palette's dirty badge). Reflects every worktree on disk,
        // not just this session's open tabs (also strays and worktrees created on the CLI). Probed
        // on demand, not on every tab broadcast.
        const dirty = await store.dirtyPostPaths();
        return sendJson(res, 200, { dirty } satisfies DirtyPostsResponse);
      }

      case "GET /posts/drafts": {
        // blog/* draft branches with no live worktree, invisible to /posts and the open-tab set. The
        // palette lists them as reopenable; selecting one runs the adopt-then-open path. Offline-safe
        // (local refs only); probed on demand.
        const drafts = await store.listDrafts();
        return sendJson(res, 200, { drafts } satisfies DraftsResponse);
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
        services.agentHost
          .select(message.mode, message.sessionId)
          .then((selected) => {
            if (ws.readyState === ws.OPEN) {
              ws.send(JSON.stringify({ type: "session", ...selected } satisfies ServerMessage));
            }
          })
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

      // Rename the active post's slug: move the file, `git branch -m`, then `git worktree move`. On
      // success, re-key the SDK session so the resumable conversation follows the rename (the store
      // already broadcast `post.renamed` for the clients' tab migration).
      case "post.rename": {
        const { requestId, path } = message;
        store.renamePost(path, { slug: message.newSlug }).then(
          (result) => {
            if (result.ok) agentHost.renameSessionKey(path, result.path);
            sendPostResult(
              ws,
              requestId,
              result.ok ? { ok: true, path: result.path } : { ok: false, error: result.error },
            );
          },
          (err: unknown) => sendPostResult(ws, requestId, { ok: false, error: errorText(err) }),
        );
        return;
      }

      // Resolve a frontmatter/filename desync by renaming to match the frontmatter. Same seam as
      // post.rename, but the store derives the target itself.
      case "post.completeRename": {
        const { requestId, path } = message;
        store.completeRename(path).then(
          (result) => {
            if (result.ok) agentHost.renameSessionKey(path, result.path);
            sendPostResult(
              ws,
              requestId,
              result.ok ? { ok: true, path: result.path } : { ok: false, error: result.error },
            );
          },
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

      // Delete a draft post (worktree and branch). Gated: if there's work to lose, reply post.confirm
      // instead of acting unless the client already confirmed. A clean post deletes without a prompt.
      case "post.delete": {
        const { requestId, path, confirm } = message;
        void (async () => {
          try {
            const preview = await store.postLossPreview(path, "delete");
            if (postWouldLoseWork(preview) && !confirm) {
              if (ws.readyState === ws.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: "post.confirm",
                    requestId,
                    op: "delete",
                    path,
                    changedFiles: preview.changedFiles,
                    ahead: preview.ahead,
                    diff: preview.diff,
                  } satisfies ServerMessage),
                );
              }
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

      // Revert a post's uncommitted edits to HEAD. Gated: nothing to discard is a no-op success;
      // otherwise reply post.confirm (carrying the diff to be lost) unless confirmed.
      case "post.revert": {
        const { requestId, path, confirm } = message;
        void (async () => {
          try {
            const preview = await store.postLossPreview(path, "revert");
            if (preview.diff.trim().length === 0) {
              sendPostResult(ws, requestId, { ok: true, path });
              return;
            }
            if (!confirm) {
              if (ws.readyState === ws.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: "post.confirm",
                    requestId,
                    op: "revert",
                    path,
                    changedFiles: preview.changedFiles,
                    ahead: preview.ahead,
                    diff: preview.diff,
                  } satisfies ServerMessage),
                );
              }
              return;
            }
            const res = await store.revertPost(path);
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

      // Answer an in-flight permission prompt: unblocks the awaiting canUseTool in the agent host.
      case "permission.response":
        agentHost.resolvePermission(message.requestId, message.decision);
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
