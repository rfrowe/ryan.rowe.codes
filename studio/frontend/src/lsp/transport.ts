// A `@codemirror/lsp-client` Transport over a WebSocket to the sidecar's `/lsp` endpoint. The wire is
// plain JSON-RPC strings, one per frame; the sidecar does the Content-Length framing. Reuses the app
// socket's token-query auth, and reconnects with capped backoff. Sends are buffered until the socket
// is open so the client's initial `initialize` doesn't have to wait for the connection.

import type { Transport } from "@codemirror/lsp-client";
import { ReconnectingSocket, type SocketStatus } from "../reconnectingSocket";
import { STUDIO_TOKEN, WS_BASE } from "../config";

/** Close code the sidecar uses when a newer tab takes over the single LSP session (don't reconnect). */
const SUPERSEDED_CODE = 4000;

/** `/lsp` WS URL carrying the same per-launch token as the app socket. */
function lspWsUrl(): string {
  const base = `${WS_BASE}/lsp`;
  return STUDIO_TOKEN ? `${base}?token=${encodeURIComponent(STUDIO_TOKEN)}` : base;
}

/** Connection state of the LSP transport, surfaced to the stack-status popover. */
export type LspTransportStatus = SocketStatus;

export class LspTransport extends ReconnectingSocket implements Transport {
  private readonly handlers = new Set<(value: string) => void>();
  /** Fired on every reopen *after* the first, so the client can re-`initialize` a fresh server. */
  private readonly reopenHandlers = new Set<() => void>();
  private readonly statusHandlers = new Set<(status: LspTransportStatus) => void>();
  private status: LspTransportStatus = "connecting";
  private queued: string[] = [];
  private opened = false;

  protected url(): string {
    return lspWsUrl();
  }

  protected handleOpen(ws: WebSocket): void {
    for (const msg of this.queued) ws.send(msg);
    this.queued = [];
    this.setStatus("open");
    if (this.opened) for (const h of [...this.reopenHandlers]) h();
    this.opened = true;
  }

  protected handleMessage(data: string): void {
    for (const h of [...this.handlers]) h(data);
  }

  protected handleClose(ws: WebSocket, ev: CloseEvent): void {
    if (this.ws === ws) this.ws = null;
    this.setStatus("closed");
    // 4000 = a newer tab superseded this socket; stay dormant so two tabs don't ping-pong the session.
    if (ev.code === SUPERSEDED_CODE) return;
    this.scheduleReconnect();
  }

  /** Subscribe to connection-state changes; fires immediately with the current status. */
  onStatus(handler: (status: LspTransportStatus) => void): void {
    this.statusHandlers.add(handler);
    handler(this.status);
  }

  protected setStatus(status: LspTransportStatus): void {
    if (this.status === status) return;
    this.status = status;
    for (const h of [...this.statusHandlers]) h(status);
  }

  // ---- Transport ----
  send(message: string): void {
    if (this.disposed) throw new Error("LSP transport disposed");
    const ws = this.ws;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(message);
    else this.queued.push(message); // flushed on (re)open; keeps the client's initialize from throwing
  }

  subscribe(handler: (value: string) => void): void {
    this.handlers.add(handler);
  }

  unsubscribe(handler: (value: string) => void): void {
    this.handlers.delete(handler);
  }

  /** Register a callback fired when the socket reopens after a drop (to re-initialize the client). */
  onReopen(handler: () => void): void {
    this.reopenHandlers.add(handler);
  }
}
