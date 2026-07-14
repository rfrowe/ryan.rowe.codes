// Watches the active post's worktree `src/` tree and forwards changes to the MDX language server as
// `workspace/didChangeWatchedFiles`. The server relies on the LSP client to report dependency
// changes, but the browser client has no filesystem access, so out-of-editor edits (the agent
// touching a component) would leave the server's TS program stale. The open post's own `.mdx` is
// excluded, since the editor already syncs it via didChange and a disk notification would fight that.

import path from "node:path";

import { watch, type FSWatcher } from "chokidar";

/** LSP FileChangeType: Created / Changed / Deleted. */
export type FileChangeType = 1 | 2 | 3;

export interface LspWatcher {
  /** Point the watcher at a post's worktree (its `src/` tree). Replaces any previous target. */
  retarget(worktreePath: string): void;
  close(): Promise<void>;
}

// Source extensions the MDX server's TS project depends on. `.mdx` is excluded (see the module
// comment); `.css.ts` styles are covered by `.ts`.
const WATCHED_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts", ".json"]);
const DEBOUNCE_MS = 120;

export function createLspWatcher(
  onChanges: (changes: Array<{ path: string; type: FileChangeType }>) => void,
): LspWatcher {
  let watcher: FSWatcher | null = null;
  let pending = new Map<string, FileChangeType>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  function flush(): void {
    timer = null;
    if (pending.size === 0) return;
    const changes = [...pending].map(([p, type]) => ({ path: p, type }));
    pending = new Map();
    onChanges(changes);
  }

  // Coalesce an agent turn's burst of writes into one notification; keep only the latest type per path.
  function queue(filePath: string, type: FileChangeType): void {
    if (!WATCHED_EXTS.has(path.extname(filePath))) return;
    pending.set(filePath, type);
    if (!timer) timer = setTimeout(flush, DEBOUNCE_MS);
  }

  return {
    retarget(worktreePath: string): void {
      void watcher?.close();
      pending.clear();
      const w = watch(path.join(worktreePath, "src"), {
        ignoreInitial: true,
        // Let a write settle before reporting it, matching the doc-sync watcher.
        awaitWriteFinish: { stabilityThreshold: 75, pollInterval: 20 },
      });
      w.on("add", (p) => queue(p, 1));
      w.on("change", (p) => queue(p, 2));
      w.on("unlink", (p) => queue(p, 3));
      watcher = w;
    },
    async close(): Promise<void> {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      await watcher?.close();
      watcher = null;
    },
  };
}
