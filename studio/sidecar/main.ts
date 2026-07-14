// Sidecar bootstrap. Constructs every concrete service, wires them through the frozen DI
// interfaces, and starts the sidecar's two faces: the web (REST and WS) server for the SPA and
// the Studio MCP over StreamableHTTP for external clients.
//
// The sidecar owns the Astro dev server: each open post is a git worktree, and Astro's
// dev daemon is project-scoped (its registry lives in <worktree>/.astro), so we run exactly
// one daemon at a time on port 4321, restarting it in the active worktree on every active
// change (open/create/switch/rename); a restart re-runs the [date]/[slug] getStaticPaths so a
// newly-opened/created post's route exists (Astro memoizes it in dev; only a restart re-runs it).
// Worktrees have no node_modules (gitignored), so each gets a symlink to the repo's before Astro runs.
//
// Invoked by `npm run studio:sidecar` (the orchestrator injects STUDIO_TOKEN, and may pass the
// target post via `--post <path>` / STUDIO_POST; otherwise the newest post is opened).

import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, rename, rm, stat, symlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { nodeFs } from "./fsImpl";
import { createStore } from "../state/store";
import { createDocSync, type DocSync } from "./docSync";
import { createGitRunner } from "./gitRunner";
import { createShipService } from "./ship";
import { createSessionsService } from "./sessions";
import { createStudioTools } from "../mcp/tools";
import { createAgentHost } from "./agentHost";
import { createMcpHttpServer } from "../mcp/httpServer";
import { createServer } from "./server";
import type { StudioServices } from "../shared/services";

// studio/sidecar/main.ts, so repo root is two levels up.
const REPO_ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const BLOG_CONTENT_ROOT = path.join(REPO_ROOT, "src", "content", "blog");
const WORKTREES_ROOT = path.join(REPO_ROOT, ".claude", "worktrees", "blog");
const NODE_MODULES = path.join(REPO_ROOT, "node_modules");
const ASTRO_BIN_NAME = process.platform === "win32" ? "astro.cmd" : "astro";
const WEB_PORT = 4319;
const ASTRO_PORT = 4321;
// How long to wait for a freshly-started Astro daemon to answer on ASTRO_PORT before declaring the
// preview unavailable. Generous for a cold `astro dev` start.
const ASTRO_HEALTH_TIMEOUT_MS = 30_000;

async function main(): Promise<void> {
  const token = process.env.STUDIO_TOKEN ?? "";
  if (!token) {
    console.error("[sidecar] STUDIO_TOKEN is not set — the orchestrator injects it. Refusing to start unauthenticated.");
    process.exit(1);
  }

  const postArg = readPostArg() ?? process.env.STUDIO_POST;
  const bootstrapPath = postArg ? path.resolve(REPO_ROOT, postArg) : await newestPost(BLOG_CONTENT_ROOT);

  // Conventions briefing for the MCP `instructions` and the agent's appended system prompt: the
  // blog-authoring skill body (frontmatter stripped) so it stays in sync with the skill.
  const conventions = await loadSkillBody(path.join(REPO_ROOT, ".claude", "skills", "blog-authoring", "SKILL.md"));

  // ---- construct concretes ----
  const git = createGitRunner({ cwd: REPO_ROOT });
  const store = createStore({
    fs: nodeFs,
    git,
    repoRoot: REPO_ROOT,
    // Symlink node_modules into a freshly-created/reused worktree so Astro and the agent's tools run.
    prepareWorktree: linkNodeModules,
    // Rename a file/dir on disk (used by post.rename).
    movePath: async (from, to) => {
      await mkdir(path.dirname(to), { recursive: true });
      await rename(from, to);
    },
    // Stop the preview daemon in a worktree before post.delete removes it (see astro.stopServing).
    stopPreview: (worktreePath) => astro.stopServing(worktreePath),
    // Recursively remove a leftover/husk worktree dir before ensureWorktree re-creates it (see
    // ensureWorktree's self-heal comment for how a detached Astro daemon can leave one behind).
    removePath: async (p) => {
      await rm(p, { recursive: true, force: true });
    },
  });

  const ship = createShipService({ git, getActiveWorktree: () => store.getActiveWorktree() });
  const sessions = createSessionsService({ blogRepoDir: REPO_ROOT });
  const tools = createStudioTools({ store, ship, blogRoot: REPO_ROOT, conventions });

  // The sidecar-owned Astro daemon, restarted in the active worktree on every active change.
  const astro = createAstroManager();
  await astro.stopStrayDaemons();

  // The doc-sync watcher follows the active post's worktree file. It's created on the first
  // activation (there may be no openable post at bootstrap) and retargeted on every switch.
  let docSync: DocSync | null = null;
  store.onActiveChange((info) => {
    if (docSync) docSync.retarget(info.worktreeFilePath);
    else docSync = createDocSync(store, { filePath: info.worktreeFilePath });
    void astro.switchTo(info.worktreePath);
  });

  const agentHost = createAgentHost({
    tools,
    getActiveWorktree: () => store.getActiveWorktree(),
    skillInstructions: conventions,
    // The store is the single event bus: the agent host's stream reaches the browser through the
    // same store.subscribe fan-out the web server listens on.
    emit: (msg) => store.publish(msg),
    getEditorContext: () => store.getEditorContext(),
    // Soft-lock the editor for the turn so the watcher classifies the agent's native writes as
    // agent-origin (live-applied) rather than external (reload banner).
    onTurnStart: () => docSync?.dispatch({ type: "prompt.dispatch" }),
    onTurnEnd: () => docSync?.dispatch({ type: "agent.turn.end" }),
  });

  // ---- bootstrap the initial active post (best-effort) ----
  if (bootstrapPath) {
    try {
      await store.openPost(bootstrapPath);
    } catch (err) {
      console.error(
        `[sidecar] could not open ${path.relative(REPO_ROOT, bootstrapPath)} at startup ` +
          `(${err instanceof Error ? err.message : String(err)}). Starting with no active post.`,
      );
    }
  } else {
    console.error(`[sidecar] no .mdx post found under ${BLOG_CONTENT_ROOT}; starting with no active post.`);
  }

  const services: StudioServices = { store, agentHost, tools, ship, sessions };

  // ---- start faces ----
  const web = createServer(services, { token, webPort: WEB_PORT });
  await web.listen();
  const mcp = createMcpHttpServer(tools, { token, instructions: conventions });

  const active = store.getActive();
  console.error(
    `[sidecar] up — web http://127.0.0.1:${WEB_PORT}  mcp http://127.0.0.1:${mcp.port}/mcp  ` +
      `astro http://localhost:${ASTRO_PORT}  post=${active ? path.relative(REPO_ROOT, active.path) : "(none)"}`,
  );

  // ---- teardown ----
  let closing = false;
  const shutdown = async (): Promise<void> => {
    if (closing) return;
    closing = true;
    await Promise.allSettled([docSync?.close() ?? Promise.resolve(), web.close(), mcp.close(), astro.close()]);
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
  // A terminal close (e.g. the tab running the sidecar is closed) sends SIGHUP; handle it the same
  // way so the Astro daemon is stopped gracefully instead of being left orphaned (see ensureWorktree's
  // self-heal comment for what an orphaned daemon leaves behind).
  process.on("SIGHUP", () => void shutdown());
}

/** Ensure `<worktree>/node_modules` symlinks to the repo's (worktrees are gitignored, no deps). */
async function linkNodeModules(worktreePath: string): Promise<void> {
  const link = path.join(worktreePath, "node_modules");
  if (existsSync(link)) return;
  try {
    await symlink(NODE_MODULES, link, "dir");
  } catch (err) {
    // A race (another activation created it) or a pre-existing entry is fine; anything else is
    // logged but non-fatal, and Astro/agent tooling will simply fail more loudly if deps are missing.
    if ((err as NodeJS.ErrnoException).code !== "EEXIST") {
      console.error(`[sidecar] could not link node_modules into ${worktreePath}: ${(err as Error).message}`);
    }
  }
}

/**
 * Owns the single Astro dev daemon. Astro's `dev --background` daemon is project-scoped (registry
 * in <cwd>/.astro), so `dev stop` must run with cwd = the worktree that owns it. We track the
 * current worktree and, on switch, stop the old daemon (freeing the port) then start a fresh one
 * in the new worktree, which re-runs getStaticPaths so the new post's route resolves.
 */
function createAstroManager() {
  let current: string | null = null;
  // Serialize all daemon ops: rapid tab switches must not race two `astro dev --background`
  // onto the same port. Each switchTo/close chains after the previous op completes.
  let queue: Promise<void> = Promise.resolve();
  const enqueue = (op: () => Promise<void>): Promise<void> => {
    queue = queue.then(op, op);
    return queue;
  };

  /**
   * Stop any background daemon owning `worktreePath`. Async (spawn and await), never `spawnSync`: a
   * synchronous stop on every active change blocks the Node event loop, freezing autosave and the
   * agent stream. Best-effort: the outcome is ignored.
   */
  async function stopAt(worktreePath: string): Promise<void> {
    const bin = path.join(worktreePath, "node_modules", ".bin", ASTRO_BIN_NAME);
    if (!existsSync(bin)) return;
    await runToExit(bin, ["dev", "stop"], worktreePath);
  }

  return {
    /** Best-effort stop of any daemon left in an existing worktree by a prior (hard-killed) run. */
    async stopStrayDaemons(): Promise<void> {
      let entries: string[];
      try {
        entries = await readdir(WORKTREES_ROOT);
      } catch {
        return; // no worktrees yet
      }
      for (const name of entries) await stopAt(path.join(WORKTREES_ROOT, name));
    },

    /**
     * (Re)start Astro in `worktreePath` on the fixed port; stops the previously-active daemon first.
     * Only claims the worktree as `current` once the CLI launch succeeded (exit 0) and the daemon
     * actually answers on ASTRO_PORT, so a failed bind can't silently leave the preview pointed at a
     * stale/foreign server. On failure it logs and leaves the preview unavailable (no `current`).
     */
    switchTo(worktreePath: string): Promise<void> {
      return enqueue(async () => {
        if (current && current !== worktreePath) await stopAt(current);
        // Clean restart in the target too, so a memoized getStaticPaths can't hide a new route.
        await stopAt(worktreePath);
        await linkNodeModules(worktreePath);
        const bin = path.join(worktreePath, "node_modules", ".bin", ASTRO_BIN_NAME);
        if (!existsSync(bin)) {
          current = null;
          console.error(`[sidecar] astro binary missing in ${worktreePath}; preview unavailable`);
          return;
        }
        // `astro dev --background` forks a daemon and the CLI exits 0 on a successful launch.
        const launch = await runToExit(bin, ["dev", "--background", "--port", String(ASTRO_PORT)], worktreePath);
        if (launch.code !== 0) {
          current = null;
          console.error(
            `[sidecar] astro dev failed to start in ${worktreePath} (exit ${launch.code})` +
              (launch.stderr.trim() ? `: ${launch.stderr.trim()}` : "") +
              `. Preview unavailable on http://localhost:${ASTRO_PORT}.`,
          );
          return;
        }
        // Exit 0 only means the daemon forked; wait until it actually serves the fixed port before
        // treating the preview as live (and before claiming this worktree). If it never answers, the
        // port may be held by another server, so surface that instead of pointing preview at it.
        const healthy = await waitForHttp(`http://localhost:${ASTRO_PORT}/`, ASTRO_HEALTH_TIMEOUT_MS);
        if (!healthy) {
          // The CLI forked a daemon (exit 0) that simply hasn't answered in time. Stop it before
          // dropping the claim: a slow cold start that later binds ASTRO_PORT would otherwise become
          // an orphan no future switchTo can stop (current is null), pointing every later preview at
          // the wrong post's server until the sidecar restarts.
          await stopAt(worktreePath);
          current = null;
          console.error(
            `[sidecar] astro did not become healthy on http://localhost:${ASTRO_PORT} within ` +
              `${Math.round(ASTRO_HEALTH_TIMEOUT_MS / 1000)}s; preview unavailable ` +
              `(is another process holding the port?).`,
          );
          return;
        }
        current = worktreePath;
      });
    },

    /**
     * Stop the daemon serving `worktreePath` and await it (queued behind any in-flight switch). If
     * that worktree is the current one, drop the claim too, so a subsequent switchTo won't try to
     * `dev stop` a directory that's about to be removed. Used by the store before a delete removes
     * the worktree, so no daemon is left orphaned holding the fixed port.
     */
    stopServing(worktreePath: string): Promise<void> {
      return enqueue(async () => {
        await stopAt(worktreePath);
        if (current === worktreePath) current = null;
      });
    },

    close(): Promise<void> {
      return enqueue(async () => {
        if (current) await stopAt(current);
        current = null;
      });
    },
  };
}

/** Spawn `bin args` in `cwd`, capture stderr, and resolve with the exit code when it exits (never rejects). */
function runToExit(bin: string, args: string[], cwd: string): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve) => {
    let stderr = "";
    const proc = spawn(bin, args, { cwd, stdio: ["ignore", "ignore", "pipe"] });
    proc.stderr?.on("data", (chunk: Buffer) => {
      if (stderr.length < 4096) stderr += chunk.toString();
    });
    proc.once("error", (err) => resolve({ code: -1, stderr: err.message }));
    proc.once("exit", (code) => resolve({ code: code ?? -1, stderr }));
  });
}

/** Poll `url` until it answers with any HTTP response (the dev server is up and bound), or timeout. */
async function waitForHttp(url: string, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(url, { method: "GET", signal: AbortSignal.timeout(2000) });
      return true; // any response, even a 404, means the dev server is listening
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  return false;
}

/** Parse `--post <path>` or `--post=<path>` from argv. */
function readPostArg(): string | undefined {
  const argv = process.argv.slice(2);
  const i = argv.findIndex((a) => a === "--post" || a.startsWith("--post="));
  if (i < 0) return undefined;
  const arg = argv[i];
  return arg.includes("=") ? arg.slice(arg.indexOf("=") + 1) : argv[i + 1];
}

/** Newest (by mtime) `*.mdx` anywhere under `root`; null if there are none. */
async function newestPost(root: string): Promise<string | null> {
  const found: Array<{ path: string; mtime: number }> = [];
  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        const { mtimeMs } = await stat(full);
        found.push({ path: full, mtime: mtimeMs });
      }
    }
  }
  await walk(root);
  if (found.length === 0) return null;
  return found.reduce((a, b) => (b.mtime > a.mtime ? b : a)).path;
}

/** Read a SKILL.md and strip its YAML frontmatter, leaving the conventions body. */
async function loadSkillBody(skillPath: string): Promise<string> {
  try {
    const raw = await readFile(skillPath, "utf8");
    const fm = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(raw);
    return (fm ? raw.slice(fm[0].length) : raw).trim();
  } catch {
    return "Follow the blog's authoring conventions: keep the four frontmatter keys valid, edit the post's file in your worktree with the native tools, and never reformat unrelated lines.";
  }
}

main().catch((err: unknown) => {
  console.error("[sidecar] fatal:", err);
  process.exit(1);
});
