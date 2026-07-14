// Typed WebSocket client for the sidecar agent stream + doc-sync pushes.
// Sends only ClientMessage; delivers only ServerMessage (studio/shared/protocol.ts).
// Auto-reconnects with capped backoff so a sidecar restart heals transparently.

import type { ClientMessage, ServerMessage } from "../../shared/protocol";
import { wsUrl } from "./config";

export type SocketStatus = "connecting" | "open" | "closed";

export interface StudioSocketHandlers {
  onMessage: (msg: ServerMessage) => void;
  onStatus?: (status: SocketStatus) => void;
}

const INITIAL_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 5000;

export class StudioSocket {
  private ws: WebSocket | null = null;
  private disposed = false;
  private backoff = INITIAL_BACKOFF_MS;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly handlers: StudioSocketHandlers) {}

  connect(): void {
    if (this.disposed) return;
    this.setStatus("connecting");
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl());
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      this.backoff = INITIAL_BACKOFF_MS;
      this.setStatus("open");
    };
    ws.onmessage = (ev: MessageEvent) => {
      if (typeof ev.data !== "string") return;
      let msg: ServerMessage;
      try {
        msg = JSON.parse(ev.data) as ServerMessage;
      } catch {
        return;
      }
      this.handlers.onMessage(msg);
    };
    ws.onclose = () => {
      this.ws = null;
      this.setStatus("closed");
      this.scheduleReconnect();
    };
    ws.onerror = () => {
      // Let onclose drive reconnection; closing here forces it deterministically.
      ws.close();
    };
  }

  send(msg: ClientMessage): boolean {
    const ws = this.ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
      return true;
    }
    return false;
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

  private setStatus(status: SocketStatus): void {
    this.handlers.onStatus?.(status);
  }
}
