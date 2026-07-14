// Bridges a browser `/lsp` WebSocket to the MDX language-server child. The browser speaks raw
// JSON-RPC strings (one message per WS frame, no Content-Length); the child speaks Content-Length-
// framed JSON-RPC over stdio. This module does the framing on both sides and rewrites document URIs
// so the browser stays ignorant of the per-post git worktrees:
//
//   - client → server: `initialize` gets initializationOptions.typescript = { enabled, tsdk } and a
//     repo-root rootUri/workspaceFolders injected (TS is off in the MDX server otherwise); any
//     `textDocument.uri` is rewritten from the canonical main-tree path to the post's worktree path,
//     so TS resolves against the worktree's committed tsconfig + symlinked node_modules.
//   - server → client: a `publishDiagnostics`/other `uri` is rewritten back to the canonical path.
//
// It never throws into the child: a malformed frame or an unmappable URI is logged and the message
// is passed through / dropped rather than crashing the bridge. One active session at a time
// (last-connection-wins); each connect restarts the child for a clean `initialize`, and the child
// is killed when the socket closes. A child crash closes the socket so the browser's reconnect
// re-attaches.

import { fileURLToPath, pathToFileURL } from "node:url";

import type { WebSocket } from "ws";

import type { StudioStore } from "../state/store";
import type { MdxLspServer } from "./lspServer";

export interface LspBridge {
  /** Attach a `/lsp` WebSocket, superseding any prior one and restarting the child. */
  connect(ws: WebSocket): void;
  /**
   * Tell the language server about out-of-editor file changes (e.g. the agent editing a component)
   * as a `workspace/didChangeWatchedFiles` notification, since the browser client can't watch the
   * filesystem. Paths are worktree paths (the server's native paths), so no URI rewrite is needed.
   * No-op when no child is running (a fresh child reads current disk on its next spawn).
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

/** A JSON-RPC message object; deliberately loose — we only touch a few well-known fields. */
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

  /** canonical main-tree file URI → the open post's worktree file URI (unchanged if not open). */
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

  /** worktree file URI → the canonical main-tree file URI (unchanged if the file isn't an open post). */
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

  /** Rewrite a client→server message in place: inject TS options on initialize, canonicalize URIs. */
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

  /** Rewrite a server→client message in place: canonicalize any worktree URI it carries. */
  function rewriteToClient(msg: RpcMessage): RpcMessage {
    const params = msg.params as { uri?: unknown; textDocument?: { uri?: unknown } } | undefined;
    if (params && typeof params.uri === "string") params.uri = toCanonicalUri(params.uri);
    if (params?.textDocument && typeof params.textDocument.uri === "string") {
      params.textDocument.uri = toCanonicalUri(params.textDocument.uri);
    }
    return msg;
  }

  // ---- child stdout → browser: de-frame, rewrite, forward as a plain JSON string ----
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
      // Last connection wins: drop any prior session's socket before taking over. The close code
      // 4000 (application range) tells that socket's transport NOT to reconnect — otherwise two open
      // SPA tabs would ping-pong the single session forever, each supersede triggering the other's
      // reconnect. Newest tab wins; older tabs go dormant until reloaded.
      const prev = currentWs;
      if (prev && prev !== ws && prev.readyState === prev.OPEN) prev.close(4000, "superseded by a new LSP connection");
      currentWs = ws;
      inbuf = Buffer.alloc(0);

      // Fresh child per session → a single clean `initialize` (the browser client re-initializes on
      // every reconnect, which a reused, already-initialized server would reject).
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
