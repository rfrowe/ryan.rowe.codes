// Bridges a browser `/lsp` WebSocket to the MDX language-server child. The browser sends raw
// JSON-RPC strings; the child wants Content-Length-framed JSON-RPC over stdio, so we frame both
// ways. Also rewrites `textDocument.uri` between the canonical main-tree path and the post's git
// worktree path, so the browser stays worktree-agnostic and TS resolves against the worktree's
// tsconfig and node_modules. One session at a time, last connection wins.

import { fileURLToPath, pathToFileURL } from "node:url";

import type { WebSocket } from "ws";

import type { StudioStore } from "../state/store";
import type { MdxLspServer } from "./lspServer";

export interface LspBridge {
  /** Attach a `/lsp` WebSocket, superseding any prior one and restarting the child. */
  connect(ws: WebSocket): void;
  /**
   * Send out-of-editor file changes to the server as `workspace/didChangeWatchedFiles`, since the
   * browser client can't watch the filesystem. Paths are worktree paths, so no rewrite is needed.
   */
  notifyFilesChanged(changes: Array<{ path: string; type: 1 | 2 | 3 }>): void;
}

interface LspBridgeDeps {
  lsp: MdxLspServer;
  store: Pick<StudioStore, "getWorktreeFilePath" | "getDocByWatchPath">;
  repoRoot: string;
  /** Absolute path to the TypeScript lib dir (`<repoRoot>/node_modules/typescript/lib`). */
  tsdk: string;
}

/** A JSON-RPC message object; deliberately loose, since we only touch a few well-known fields. */
type RpcMessage = { method?: string; params?: unknown; [k: string]: unknown };

function frame(json: string): string {
  return `Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`;
}

export function createLspBridge(deps: LspBridgeDeps): LspBridge {
  const { lsp, store, repoRoot, tsdk } = deps;
  const repoUri = pathToFileURL(repoRoot).href;

  let currentWs: WebSocket | null = null;
  // Accumulates the child's stdout until whole Content-Length frames can be split off.
  let inbuf = Buffer.alloc(0);

  // Warn once per unmappable canonical URI so a missing worktree surfaces without flooding the log.
  const warnedCanonical = new Set<string>();

  /** Canonical main-tree file URI to the open post's worktree file URI (unchanged if not open). */
  function toWorktreeUri(uri: string): string {
    if (!uri.startsWith("file:")) return uri;
    try {
      const canonicalPath = fileURLToPath(uri);
      const worktreePath = store.getWorktreeFilePath(canonicalPath);
      if (!worktreePath) {
        if (!warnedCanonical.has(uri)) {
          warnedCanonical.add(uri);
          console.error(`[sidecar] LSP: no open worktree for ${canonicalPath}; passing URI through unrewritten.`);
        }
        return uri;
      }
      return pathToFileURL(worktreePath).href;
    } catch {
      return uri;
    }
  }

  /** Worktree file URI to the canonical main-tree file URI (unchanged if the file isn't an open post). */
  function toCanonicalUri(uri: string): string {
    if (!uri.startsWith("file:")) return uri;
    try {
      const worktreePath = fileURLToPath(uri);
      const doc = store.getDocByWatchPath(worktreePath);
      return doc ? pathToFileURL(doc.path).href : uri;
    } catch {
      return uri;
    }
  }

  /** Rewrite a client-to-server message in place: inject TS options on initialize, map URIs. */
  function rewriteToServer(msg: RpcMessage): RpcMessage {
    if (msg.method === "initialize" && msg.params && typeof msg.params === "object") {
      const params = msg.params as Record<string, unknown>;
      const initOpts = (params.initializationOptions && typeof params.initializationOptions === "object"
        ? (params.initializationOptions as Record<string, unknown>)
        : {}) as Record<string, unknown>;
      initOpts.typescript = { enabled: true, tsdk };
      params.initializationOptions = initOpts;
      params.rootUri = repoUri;
      params.rootPath = repoRoot;
      params.workspaceFolders = [{ uri: repoUri, name: "repo" }];
    }
    const td = (msg.params as { textDocument?: { uri?: unknown } } | undefined)?.textDocument;
    if (td && typeof td.uri === "string") td.uri = toWorktreeUri(td.uri);
    return msg;
  }

  /** Rewrite a server-to-client message in place: canonicalize any worktree URI it carries. */
  function rewriteToClient(msg: RpcMessage): RpcMessage {
    const params = msg.params as { uri?: unknown; textDocument?: { uri?: unknown } } | undefined;
    if (params && typeof params.uri === "string") params.uri = toCanonicalUri(params.uri);
    if (params?.textDocument && typeof params.textDocument.uri === "string") {
      params.textDocument.uri = toCanonicalUri(params.textDocument.uri);
    }
    return msg;
  }

  // Child stdout to browser: de-frame, rewrite, forward as a plain JSON string.
  lsp.onStdout((chunk) => {
    inbuf = Buffer.concat([inbuf, chunk]);
    for (;;) {
      const headerEnd = inbuf.indexOf("\r\n\r\n");
      if (headerEnd < 0) return;
      const header = inbuf.subarray(0, headerEnd).toString("ascii");
      const m = /content-length:\s*(\d+)/i.exec(header);
      if (!m) {
        // Unparseable header: skip past it to resync rather than wedging the stream.
        inbuf = inbuf.subarray(headerEnd + 4);
        continue;
      }
      const len = Number(m[1]);
      const start = headerEnd + 4;
      if (inbuf.length < start + len) return; // frame incomplete; wait for more
      const body = inbuf.subarray(start, start + len).toString("utf8");
      inbuf = inbuf.subarray(start + len);
      const ws = currentWs;
      if (!ws || ws.readyState !== ws.OPEN) continue;
      try {
        const msg = JSON.parse(body) as RpcMessage;
        ws.send(JSON.stringify(rewriteToClient(msg)));
      } catch (err) {
        console.error(`[sidecar] LSP: dropping malformed server frame: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  });

  // A child crash (not our own kill) closes the socket so the browser's reconnect re-attaches.
  lsp.onExit(({ expected }) => {
    if (expected) return;
    const ws = currentWs;
    if (ws && ws.readyState === ws.OPEN) ws.close(1011, "language server exited");
  });

  return {
    connect(ws: WebSocket) {
      // Last connection wins. Close code 4000 tells the old socket not to reconnect, so two open
      // tabs don't ping-pong the single session forever; the newest tab wins.
      const prev = currentWs;
      if (prev && prev !== ws && prev.readyState === prev.OPEN) prev.close(4000, "superseded by a new LSP connection");
      currentWs = ws;
      inbuf = Buffer.alloc(0);

      // Fresh child per session, since the client re-initializes on every reconnect and a reused,
      // already-initialized server would reject that.
      if (!lsp.restart()) {
        ws.close(1011, "language server unavailable");
        return;
      }
      console.error("[sidecar] LSP session connected (/lsp).");

      ws.on("message", (data: Buffer | ArrayBuffer | Buffer[]) => {
        const text = Array.isArray(data) ? Buffer.concat(data).toString("utf8") : Buffer.from(data as Buffer).toString("utf8");
        try {
          const msg = JSON.parse(text) as RpcMessage;
          lsp.write(frame(JSON.stringify(rewriteToServer(msg))));
        } catch (err) {
          console.error(`[sidecar] LSP: dropping malformed client message: ${err instanceof Error ? err.message : String(err)}`);
        }
      });

      ws.on("close", () => {
        if (currentWs === ws) {
          currentWs = null;
          console.error("[sidecar] LSP session closed (/lsp).");
          void lsp.close();
        }
      });
      ws.on("error", () => {
        try {
          ws.close();
        } catch {
          /* already closing */
        }
      });
    },

    notifyFilesChanged(changes) {
      if (changes.length === 0 || !lsp.running()) return;
      const params = { changes: changes.map((c) => ({ uri: pathToFileURL(c.path).href, type: c.type })) };
      const json = JSON.stringify({ jsonrpc: "2.0", method: "workspace/didChangeWatchedFiles", params });
      lsp.write(frame(json));
    },
  };
}
