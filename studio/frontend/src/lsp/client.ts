// The single, module-level LSP client for the editor. Lives outside React so StrictMode's
// double-mount (dev) can't thrash a lifecycle-tied client: it's created and connected once and never
// disposed on unmount. The Editor only adds `client.plugin(fileUri)` to its mount-once extensions.
//
// Returns null — so the Editor keeps only its Phase-1 completion sources — under the in-browser mock
// (no sidecar to talk to) or when no launch token was injected (dev `studio:ui` without a real
// `npm run studio`).

import { LSPClient, hoverTooltips, serverCompletion, signatureHelp } from "@codemirror/lsp-client";
import { STUDIO_TOKEN } from "../config";
import { isMockEnabled } from "../mockServer";
import { LspTransport } from "./transport";

let cached: LSPClient | null | undefined;

export function getLspClient(): LSPClient | null {
  if (cached !== undefined) return cached;
  if (isMockEnabled() || !STUDIO_TOKEN) {
    cached = null;
    return cached;
  }
  const transport = new LspTransport();
  const client = new LSPClient({
    // The MDX server's first completion/hover after a cold start pays the TS-program load; the
    // library default (3s) times those out. Give it generous headroom (it's rarely hit post-warmup).
    timeout: 20000,
    // Completion + hover + signature help only. serverDiagnostics() and the
    // definition/references/rename keymaps are deliberately omitted (deferred to Phase 4).
    extensions: [serverCompletion(), hoverTooltips(), signatureHelp()],
  });
  // The sidecar bridge spawns a fresh, un-initialized language server per WS connection, so a
  // transparent reconnect must re-run the initialize handshake against it.
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
 * Browser-side absolute POSIX path → `file://` URI. Node's `pathToFileURL` isn't available in the
 * bundle; this mirrors its output for ordinary paths and round-trips through the sidecar bridge's
 * `fileURLToPath` back to the exact canonical path the store keys open posts on.
 */
export function filePathToUri(path: string): string {
  return "file://" + path.split("/").map(encodeURIComponent).join("/");
}
