// The single module-level LSP client for the editor. Lives outside React so StrictMode's
// double-mount can't thrash it; created and connected once, never disposed on unmount.
//
// Returns null (editor keeps only its built-in completion sources) under the in-browser mock, or
// when no launch token was injected.

import { LSPClient, hoverTooltips, signatureHelp } from "@codemirror/lsp-client";
import { STUDIO_TOKEN } from "../config";
import { isMockEnabled } from "../mockServer";
import { LspTransport, type LspTransportStatus } from "./transport";

let cached: LSPClient | null | undefined;

/** LSP status for the stack-status popover. "disabled" = no client (mock / no launch token). */
export type LspStatus = LspTransportStatus | "disabled";
let lspStatus: LspStatus = "disabled";
const lspStatusListeners = new Set<(status: LspStatus) => void>();

function setLspStatus(status: LspStatus): void {
  lspStatus = status;
  for (const l of [...lspStatusListeners]) l(status);
}

/** Subscribe to LSP connection status; fires immediately with the current value. Returns unsubscribe. */
export function onLspStatus(cb: (status: LspStatus) => void): () => void {
  lspStatusListeners.add(cb);
  cb(lspStatus);
  return () => lspStatusListeners.delete(cb);
}

export function getLspClient(): LSPClient | null {
  if (cached !== undefined) return cached;
  if (isMockEnabled() || !STUDIO_TOKEN) {
    cached = null;
    return cached;
  }
  const transport = new LspTransport();
  const client = new LSPClient({
    // First completion/hover after a cold start pays the TS-program load; the 3s default times out.
    timeout: 20000,
    // Hover and signature help only; LSP completion is registered separately via docResolvingCompletionSource.
    extensions: [hoverTooltips(), signatureHelp()],
  });
  transport.onStatus(setLspStatus);
  // The sidecar spawns a fresh language server per connection, so a reconnect must re-initialize.
  transport.onReopen(() => {
    client.disconnect();
    client.connect(transport);
  });
  transport.connect();
  client.connect(transport);
  cached = client;
  return cached;
}

/**
 * Absolute POSIX path to a `file://` URI. Node's `pathToFileURL` isn't in the bundle; this mirrors
 * it and round-trips through the sidecar's `fileURLToPath` back to the canonical path.
 */
export function filePathToUri(path: string): string {
  return "file://" + path.split("/").map(encodeURIComponent).join("/");
}
