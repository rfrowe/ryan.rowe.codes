// Owns the MDX language-server child process (`mdx-language-server --stdio`, Volar-based). Modeled
// on createAstroManager in main.ts: it only spawns/pipes/kills the process and exposes raw stdio
// seams — the Content-Length framing and the canonical↔worktree URI rewriting live in lspBridge.ts.
//
// TS support in the MDX server is OFF unless the client's `initialize` carries
// `initializationOptions.typescript = { enabled: true, tsdk }` (the bridge injects it). On an
// unexpected child exit the server logs and marks itself not-running; the bridge closes the socket
// so the browser's reconnect re-attaches (and re-spawns) — graceful degradation, the Phase-1
// completion sources keep working meanwhile.

import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const BIN_NAME = process.platform === "win32" ? "mdx-language-server.cmd" : "mdx-language-server";

export interface MdxLspServer {
  /** Spawn the child if it isn't already running. No-op when it is. Returns false if the bin is missing. */
  start(): boolean;
  /** Kill any running child and spawn a fresh one (a clean `initialize` per attached session). */
  restart(): boolean;
  /** Whether a child is currently running. */
  running(): boolean;
  /** Write raw bytes to the child's stdin (the bridge writes Content-Length-framed JSON-RPC). */
  write(data: string | Buffer): void;
  /** Register a handler for raw stdout chunks (the bridge de-frames them). Persists across restarts. */
  onStdout(handler: (chunk: Buffer) => void): void;
  /** Register a handler fired when the child exits (crash or our kill). Persists across restarts. */
  onExit(handler: (info: { code: number | null; signal: NodeJS.Signals | null; expected: boolean }) => void): void;
  /** Kill the child (idempotent). */
  close(): Promise<void>;
}

export function createMdxLspServer({ repoRoot }: { repoRoot: string }): MdxLspServer {
  const bin = path.join(repoRoot, "node_modules", ".bin", BIN_NAME);
  const stdoutHandlers = new Set<(chunk: Buffer) => void>();
  const exitHandlers = new Set<(info: { code: number | null; signal: NodeJS.Signals | null; expected: boolean }) => void>();

  let child: ChildProcess | null = null;
  // Set while we're deliberately killing the child (restart/close), so its exit is reported as
  // expected (no crash log, no reconnect thrash).
  let killing = false;

  function spawnChild(): boolean {
    if (!existsSync(bin)) {
      console.error(
        `[sidecar] mdx-language-server not found at ${bin}; LSP completions unavailable ` +
          `(the Phase-1 completion sources still work).`,
      );
      return false;
    }
    const proc = spawn(bin, ["--stdio"], { cwd: repoRoot, stdio: ["pipe", "pipe", "pipe"] });
    child = proc;
    proc.stdout?.on("data", (chunk: Buffer) => {
      for (const h of stdoutHandlers) h(chunk);
    });
    proc.stderr?.on("data", (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (text) console.error(`[mdx-lsp] ${text.slice(0, 500)}`);
    });
    proc.once("error", (err) => {
      console.error(`[sidecar] mdx-language-server failed to spawn: ${err.message}`);
    });
    proc.once("exit", (code, signal) => {
      const expected = killing;
      if (child === proc) child = null;
      if (!expected) {
        console.error(`[sidecar] mdx-language-server exited unexpectedly (code=${code}, signal=${signal ?? "none"}).`);
      }
      for (const h of exitHandlers) h({ code, signal, expected });
    });
    return true;
  }

  return {
    start() {
      if (child) return true;
      killing = false;
      return spawnChild();
    },

    restart() {
      if (child) {
        killing = true;
        child.kill("SIGTERM");
        child = null;
      }
      killing = false;
      return spawnChild();
    },

    running() {
      return child !== null;
    },

    write(data) {
      child?.stdin?.write(data);
    },

    onStdout(handler) {
      stdoutHandlers.add(handler);
    },

    onExit(handler) {
      exitHandlers.add(handler);
    },

    close() {
      return new Promise<void>((resolve) => {
        const proc = child;
        if (!proc) {
          resolve();
          return;
        }
        killing = true;
        child = null;
        const done = setTimeout(() => {
          try {
            proc.kill("SIGKILL");
          } catch {
            /* already gone */
          }
          resolve();
        }, 2000);
        proc.once("exit", () => {
          clearTimeout(done);
          resolve();
        });
        proc.kill("SIGTERM");
      });
    },
  };
}
