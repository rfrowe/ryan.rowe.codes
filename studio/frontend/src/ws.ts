// Typed WebSocket client for the sidecar agent stream + doc-sync pushes.
// Sends only ClientMessage; delivers only ServerMessage (studio/shared/protocol.ts).
// Auto-reconnects with capped backoff so a sidecar restart heals transparently.

import type { ClientMessage, ServerMessage } from "../../shared/protocol";
import { ReconnectingSocket, type SocketStatus } from "./reconnectingSocket";
import { wsUrl } from "./config";

export type { SocketStatus };

export interface StudioSocketHandlers {
  onMessage: (msg: ServerMessage) => void;
  onStatus?: (status: SocketStatus) => void;
}

export class StudioSocket extends ReconnectingSocket {
  constructor(private readonly handlers: StudioSocketHandlers) {
    super();
  }

  protected url(): string {
    return wsUrl();
  }

  protected setStatus(status: SocketStatus): void {
    this.handlers.onStatus?.(status);
  }

  protected handleOpen(): void {
    this.setStatus("open");
  }

  protected handleMessage(data: string): void {
    let msg: ServerMessage;
    try {
      msg = JSON.parse(data) as ServerMessage;
    } catch {
      return;
    }
    this.handlers.onMessage(msg);
  }

  protected handleClose(): void {
    this.ws = null;
    this.setStatus("closed");
    this.scheduleReconnect();
  }

  send(msg: ClientMessage): boolean {
    const ws = this.ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }
}
