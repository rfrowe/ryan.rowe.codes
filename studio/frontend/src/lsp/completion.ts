// Wraps @codemirror/lsp-client's serverCompletionSource to add the docs the library omits. Volar
// defers `detail` and `documentation` to a completionItem/resolve round-trip that lsp-client@6.2.5
// never makes, so completions render as bare labels. This keeps the library's insertion behavior
// and attaches a lazy `info` that resolves the highlighted item.
//
// It re-issues the completion request to recover the raw LSP items (the library discards them), then
// aligns by index, guarded by a length and label check so a stale response can't mis-attach docs.

import type { Completion, CompletionResult, CompletionSource } from "@codemirror/autocomplete";
import { LSPPlugin, serverCompletionSource } from "@codemirror/lsp-client";

type Markup = { kind?: string; value: string };
/** The LSP CompletionItem fields we read (kept loose to avoid a vscode-languageserver-protocol dep). */
interface LspItem {
  label?: string;
  detail?: string;
  documentation?: string | Markup;
  [k: string]: unknown;
}

export const docResolvingCompletionSource: CompletionSource = async (context) => {
  const result = (await Promise.resolve(serverCompletionSource(context))) as CompletionResult | null;
  if (!result) return null;
  const plugin = context.view ? LSPPlugin.get(context.view) : null;
  if (!plugin) return result;

  let items: LspItem[];
  try {
    const params = {
      position: plugin.toPosition(context.pos),
      textDocument: { uri: plugin.uri },
      context: { triggerKind: 1 },
    };
    const raw = await plugin.client.request<typeof params, { items?: LspItem[] } | LspItem[]>(
      "textDocument/completion",
      params,
    );
    items = Array.isArray(raw) ? raw : (raw?.items ?? []);
  } catch {
    return result; // docs are best-effort; fall back to the library's options
  }
  if (items.length !== result.options.length) return result; // can't trust the index alignment

  const options: Completion[] = result.options.map((opt, i) => {
    const item = items[i];
    if (opt.info || !item) return opt; // keep any inline docs the library already attached
    if (opt.displayLabel && item.label && opt.displayLabel !== item.label) return opt; // alignment sanity
    return { ...opt, info: () => resolveInfo(plugin, item) };
  });
  return { ...result, options };
};

/** Resolve an item's detail and documentation into the completion info popout. */
async function resolveInfo(plugin: LSPPlugin, item: LspItem): Promise<Node | null> {
  let resolved: LspItem = item;
  try {
    resolved = await plugin.client.request<LspItem, LspItem>("completionItem/resolve", item);
  } catch {
    /* keep the unresolved item */
  }
  const { detail, documentation } = resolved;
  if (!detail && !documentation) return null;

  const wrap = document.createElement("div");
  wrap.className = "cm-lsp-completion-info";
  if (detail) {
    const sig = document.createElement("div");
    sig.className = "cm-lsp-completion-detail";
    sig.textContent = detail;
    wrap.appendChild(sig);
  }
  if (documentation) {
    const body = document.createElement("div");
    body.className = "cm-lsp-completion-doc";
    body.innerHTML = plugin.docToHTML(documentation as string | { kind: "markdown" | "plaintext"; value: string });
    wrap.appendChild(body);
  }
  return wrap;
}
