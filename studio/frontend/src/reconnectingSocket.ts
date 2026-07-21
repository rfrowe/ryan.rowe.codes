// Shared WebSocket base: connect, capped-backoff reconnect, and teardown. Subclasses supply the URL,
// the message framing (typed JSON vs. raw string), status reporting, and what to do on open/close.

export type SocketStatus = "connecting" | "open" | "closed";

const INITIAL_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 5000;

export abstract class ReconnectingSocket {
  protected ws: WebSocket | null = null;
  protected disposed = false;
  private backoff = INITIAL_BACKOFF_MS;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  /** The WS URL to (re)connect to. */
  protected abstract url(): string;
  /** Report a connection-state transition. */
  protected abstract setStatus(status: SocketStatus): void;
  /** The socket just opened (backoff already reset): flush any queue and fire reopen hooks. */
  protected abstract handleOpen(ws: WebSocket): void;
  /** A text frame arrived: parse typed JSON or fan out the raw string. */
  protected abstract handleMessage(data: string): void;
  /** The socket closed: decide whether to reconnect (via scheduleReconnect). */
  protected abstract handleClose(ws: WebSocket, ev: CloseEvent): void;

  connect(): void {
    if (this.disposed) return;
    this.setStatus("connecting");
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.url());
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      this.backoff = INITIAL_BACKOFF_MS;
      this.handleOpen(ws);
    };
    ws.onmessage = (ev: MessageEvent) => {
      if (typeof ev.data !== "string") return;
      this.handleMessage(ev.data);
    };
    ws.onclose = (ev: CloseEvent) => this.handleClose(ws, ev);
    ws.onerror = () => {
      // Let onclose drive reconnection; closing here forces it deterministically.
      ws.close();
    };
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

  protected scheduleReconnect(): void {
    if (this.disposed || this.reconnectTimer) return;
    const delay = this.backoff;
    this.backoff = Math.min(this.backoff * 2, MAX_BACKOFF_MS);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
}
