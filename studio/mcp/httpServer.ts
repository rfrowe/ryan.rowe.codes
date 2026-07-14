// Studio MCP over StreamableHTTP for external clients (e.g. your own `claude` attaching via
// `.mcp.json` / `claude mcp add --transport http`). Binds 127.0.0.1:4318 at /mcp, requires a
// per-launch bearer token, and validates Host/Origin against a loopback allowlist to close
// loopback CSRF / DNS-rebinding. The same shared tool specs and protocol-level `instructions`
// as the in-process mount are registered here.

import { createServer } from "node:http";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

import type { StudioTools } from "../shared/services";
import { STUDIO_MCP_SERVER_NAME } from "../shared/mcpTools";
import { STUDIO_MCP_VERSION, STUDIO_TOOL_SPECS, toCallToolResult } from "./tools";

export const STUDIO_MCP_HOST = "127.0.0.1";
export const STUDIO_MCP_PORT = 4318;
export const STUDIO_MCP_PATH = "/mcp";

/** Handle to the running MCP HTTP server. */
export interface McpHttpServerHandle {
  readonly port: number;
  /**
   * Resolves once the server is listening; rejects if it fails to bind (e.g. EADDRINUSE).
   * Callers may await this to gate on a clean start; unobserved, a bind failure is still
   * logged (and swallowed) rather than crashing the process with an uncaught 'error'.
   */
  readonly ready: Promise<void>;
  /** Stop accepting connections and tear down all live MCP sessions. */
  close(): Promise<void>;
}

export interface McpHttpServerOptions {
  /** Per-launch bearer token required on every request. */
  token: string;
  /** Port to bind (127.0.0.1). Defaults to {@link STUDIO_MCP_PORT}. */
  port?: number;
  /** Protocol-level MCP `instructions` (the conventions briefing) surfaced at initialize. */
  instructions: string;
}

/**
 * Start the Studio MCP HTTP server. Uses stateful StreamableHTTP sessions: an `initialize`
 * POST mints a session id and connects a fresh `McpServer` (backed by the shared `tools`);
 * subsequent requests reuse the transport via the `mcp-session-id` header.
 */
export function createMcpHttpServer(
  tools: StudioTools,
  opts: McpHttpServerOptions,
): McpHttpServerHandle {
  const port = opts.port ?? STUDIO_MCP_PORT;
  const expectedAuth = `Bearer ${opts.token}`;
  const transports = new Map<string, StreamableHTTPServerTransport>();

  /** Build a fresh MCP server wired to the shared tools + protocol instructions. */
  function buildMcpServer(): McpServer {
    const server = new McpServer(
      { name: STUDIO_MCP_SERVER_NAME, version: STUDIO_MCP_VERSION },
      { instructions: opts.instructions },
    );
    for (const spec of STUDIO_TOOL_SPECS) {
      server.registerTool(
        spec.name,
        { title: spec.title, description: spec.description, inputSchema: spec.inputSchema },
        async (args: Record<string, unknown>) =>
          toCallToolResult(await spec.invoke(tools, args)),
      );
    }
    return server;
  }

  const httpServer: Server = createServer((req, res) => {
    handle(req, res).catch((err: unknown) => {
      sendJsonRpcError(res, 500, "internal error", err);
    });
  });

  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? "/", `http://${STUDIO_MCP_HOST}:${port}`);
    if (url.pathname !== STUDIO_MCP_PATH) {
      sendJsonRpcError(res, 404, "not found");
      return;
    }
    // Loopback CSRF / DNS-rebinding guard: Host must be loopback; Origin (if a browser sent
    // one) must be loopback too. Non-browser MCP clients omit Origin, which is allowed.
    if (!isLoopbackHost(header(req, "host"))) {
      sendJsonRpcError(res, 403, "forbidden host");
      return;
    }
    if (!isAllowedOrigin(header(req, "origin"))) {
      sendJsonRpcError(res, 403, "forbidden origin");
      return;
    }
    // Bearer-token auth (constant-time).
    if (!authorized(header(req, "authorization"))) {
      res.setHeader("WWW-Authenticate", "Bearer");
      sendJsonRpcError(res, 401, "unauthorized");
      return;
    }

    const sessionId = header(req, "mcp-session-id");

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      let transport = sessionId ? transports.get(sessionId) : undefined;
      if (!transport) {
        if (!isInitializeRequest(body)) {
          sendJsonRpcError(res, 400, "no valid session id; send an initialize request first");
          return;
        }
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            transports.set(id, transport!);
          },
        });
        transport.onclose = () => {
          const id = transport!.sessionId;
          if (id) transports.delete(id);
        };
        await buildMcpServer().connect(transport);
      }
      await transport.handleRequest(req, res, body);
      return;
    }

    if (req.method === "GET" || req.method === "DELETE") {
      const transport = sessionId ? transports.get(sessionId) : undefined;
      if (!transport) {
        sendJsonRpcError(res, 400, "unknown or missing session id");
        return;
      }
      await transport.handleRequest(req, res);
      return;
    }

    sendJsonRpcError(res, 405, "method not allowed");
  }

  function authorized(authHeader: string | undefined): boolean {
    if (!authHeader) return false;
    return timingSafeEqualStr(authHeader, expectedAuth);
  }

  // Mirror the web server's listen-rejects-on-error pattern: a bind failure would
  // otherwise emit an uncaught 'error' and crash the sidecar after main.ts logged "up".
  // The temporary handler both makes the failure observable (via `ready`) and, by simply
  // existing, keeps the 'error' from being fatal.
  const ready = new Promise<void>((resolveReady, rejectReady) => {
    const onError = (err: NodeJS.ErrnoException): void => {
      const reason = err.code === "EADDRINUSE" ? "port in use?" : err.message;
      console.error(`[studio-mcp] MCP server failed to bind ${STUDIO_MCP_HOST}:${port} — ${reason}`);
      rejectReady(err);
    };
    httpServer.once("error", onError);
    httpServer.listen(port, STUDIO_MCP_HOST, () => {
      httpServer.off("error", onError);
      resolveReady();
    });
  });
  // main.ts constructs this synchronously and reads `.port`/`.close()` without awaiting
  // `ready`; swallow here so an unobserved bind failure can't surface as an
  // unhandledRejection (it's already been logged above).
  ready.catch(() => undefined);

  return {
    port,
    ready,
    async close(): Promise<void> {
      for (const transport of transports.values()) {
        await transport.close().catch(() => undefined);
      }
      transports.clear();
      await new Promise<void>((resolveClose, rejectClose) => {
        httpServer.close((err) => (err ? rejectClose(err) : resolveClose()));
      });
    },
  };
}

// ---- helpers ----

function header(req: IncomingMessage, name: string): string | undefined {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function isLoopbackHost(hostHeader: string | undefined): boolean {
  if (!hostHeader) return false;
  const host = hostHeader.replace(/:\d+$/, "").toLowerCase();
  return host === "127.0.0.1" || host === "localhost" || host === "::1" || host === "[::1]";
}

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // non-browser clients (e.g. the claude CLI) send no Origin
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === "127.0.0.1" || host === "localhost" || host === "::1";
  } catch {
    return false;
  }
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  if (chunks.length === 0) return undefined;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return undefined;
  }
}

function sendJsonRpcError(
  res: ServerResponse,
  status: number,
  message: string,
  cause?: unknown,
): void {
  if (res.headersSent) {
    res.end();
    return;
  }
  const detail = cause instanceof Error ? `: ${cause.message}` : "";
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: `${message}${detail}` },
      id: null,
    }),
  );
}
