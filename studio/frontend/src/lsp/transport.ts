// A `@codemirror/lsp-client` Transport over a WebSocket to the sidecar's `/lsp` endpoint. The wire
// is plain JSON-RPC strings (one message per WS frame) — the sidecar bridge does the Content-Length
// framing on the child side. Reuses the token-query auth of the app socket (config.wsUrl) with a
// `/lsp` path, and reconnects with capped backoff (mirroring StudioSocket). Sends are buffered until
// the socket is open so the client's initial `initialize` can be issued before the connection lands;
// a genuine failure only surfaces once the transport is disposed.

import type { Transport } from "@codemirror/lsp-client";
import { STUDIO_TOKEN, WS_BASE } from "../config";

const INITIAL_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 5000;
/** Close code the sidecar uses when a newer tab takes over the single LSP session (don't reconnect). */
const SUPERSEDED_CODE = 4000;

/** `/lsp` WS URL carrying the same per-launch token as the app socket. */
function lspWsUrl(): string {
  const base = `${WS_BASE}/lsp`;
  return STUDIO_TOKEN ? `${base}?token=${encodeURIComponent(STUDIO_TOKEN)}` : base;
}

/** Connection state of the LSP transport, surfaced to the stack-status popover. */
export type LspTransportStatus = "connecting" | "open" | "closed";

export class LspTransport implements Transport {
  private ws: WebSocket | null = null;
  private readonly handlers = new Set<(value: string) => void>();
  /** Fired on every reopen *after* the first, so the client can re-`initialize` a fresh server. */
  private readonly reopenHandlers = new Set<() => void>();
  private readonly statusHandlers = new Set<(status: LspTransportStatus) => void>();
  private status: LspTransportStatus = "connecting";
  private queued: string[] = [];
  private opened = false;
  private disposed = false;
  private backoff = INITIAL_BACKOFF_MS;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect(): void {
    if (this.disposed) return;
    this.setStatus("connecting");
    let ws: WebSocket;
    try {
      ws = new WebSocket(lspWsUrl());
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;
    ws.onopen = () => {
      this.backoff = INITIAL_BACKOFF_MS;
      for (const msg of this.queued) ws.send(msg);
      this.queued = [];
      this.setStatus("open");
      if (this.opened) for (const h of [...this.reopenHandlers]) h();
      this.opened = true;
    };
    ws.onmessage = (ev: MessageEvent) => {
      if (typeof ev.data !== "string") return;
      for (const h of [...this.handlers]) h(ev.data);
    };
    ws.onclose = (ev: CloseEvent) => {
      if (this.ws === ws) this.ws = null;
      this.setStatus("closed");
      // 4000 = the sidecar superseded this socket with a newer tab's connection; going dormant (no
      // reconnect) is what prevents two tabs from ping-ponging the single LSP session.
      if (ev.code === SUPERSEDED_CODE) return;
      this.scheduleReconnect();
    };
    ws.onerror = () => ws.close();
  }

  /** Subscribe to connection-state changes; fires immediately with the current status. */
  onStatus(handler: (status: LspTransportStatus) => void): void {
    this.statusHandlers.add(handler);
    handler(this.status);
  }

  private setStatus(status: LspTransportStatus): void {
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

  dispose(): void {
    this.disposed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    const ws = this.ws;
    this.ws = null;
    if (ws) {
      ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
      ws.close();
    }
  }

  private scheduleReconnect(): void {
    if (this.disposed || this.reconnectTimer) return;
    const delay = this.backoff;
    this.backoff = Math.min(this.backoff * 2, MAX_BACKOFF_MS);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
}
