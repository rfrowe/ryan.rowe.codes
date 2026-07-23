// Sidecar bootstrap. Constructs every concrete service, wires them through the frozen DI interfaces,
// and starts the two faces: the web (REST and WS) server for the SPA and the Studio MCP over
// StreamableHTTP for external clients.
//
// The sidecar owns the Astro dev daemon. It's project-scoped (registry in <worktree>/.astro), so we
// run exactly one at a time on the studio's Astro port, restarting it in the active worktree on every
// active change; the restart re-runs getStaticPaths so a new post's route exists (dev memoizes it).
//
// Invoked by `npm run studio:sidecar` (the orchestrator injects STUDIO_TOKEN, and may pass the
// target post via `--post <path>` / STUDIO_POST; otherwise the newest post is opened).

import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, rename, rm, stat, symlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { nodeFs } from "./fsImpl";
import { createStore, type StudioStore } from "../state/store";
import { createDocSync, type DocSync } from "./docSync";
import { createGitRunner } from "./gitRunner";
import { createGitWatch } from "./gitWatch";
import { originRefExists } from "./diffService";
import { createShipService } from "./ship";
import { createSessionsService } from "./sessions";
import { createStudioTools } from "../mcp/tools";
import { createAgentHost } from "./agentHost";
import { createMcpHttpServer } from "../mcp/httpServer";
import { createServer } from "./server";
import { createMdxLspServer } from "./lspServer";
import { createLspBridge } from "./lspBridge";
import { createLspWatcher } from "./lspWatcher";
import { copyWorktreeIncludes } from "./worktreeInclude";
import type { StudioServices } from "../shared/services";
import type { FetchResponse } from "../shared/protocol";

// studio/sidecar/main.ts, so repo root is two levels up.
const REPO_ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const BLOG_CONTENT_ROOT = path.join(REPO_ROOT, "src", "content", "blog");
const NODE_MODULES = path.join(REPO_ROOT, "node_modules");
const ASTRO_BIN_NAME = process.platform === "win32" ? "astro.cmd" : "astro";
// Ports come from the orchestrator (a free set per launch, so studios run side by side); the defaults
// let `npm run studio:sidecar` run standalone.
const WEB_PORT = Number(process.env.STUDIO_WEB_PORT) || 4319;
const MCP_PORT = Number(process.env.STUDIO_MCP_PORT) || 4318;
const ASTRO_PORT = Number(process.env.STUDIO_ASTRO_PORT) || 4321;
const SPA_PORT = Number(process.env.STUDIO_SPA_PORT) || 5199;
// The scheme browsers use to reach the Astro preview; STUDIO_HOST_ASTRO carries the hostname.
const PROTOCOL = process.env.STUDIO_PROTOCOL ?? "http";
// How long to wait for a fresh Astro daemon to answer before declaring the preview unavailable.
const ASTRO_HEALTH_TIMEOUT_MS = 30_000;
// Network round-trip headroom for the fetch button (mirrors ship's push timeout).
const NETWORK_TIMEOUT_MS = 120_000;
// Cloudflare Pages project this repo deploys to; ship links the post at its per-branch preview.
const CF_PAGES_PROJECT = process.env.STUDIO_CF_PAGES_PROJECT?.trim() || "ryan-rowe-codes";

async function main(): Promise<void> {
  const token = process.env.STUDIO_TOKEN ?? "";
  if (!token) {
    console.error("[sidecar] STUDIO_TOKEN is not set — the orchestrator injects it. Refusing to start unauthenticated.");
    process.exit(1);
  }

  const postArg = readPostArg() ?? process.env.STUDIO_POST;
  const bootstrapPath = postArg ? path.resolve(REPO_ROOT, postArg) : await newestPost(BLOG_CONTENT_ROOT);

  // The blog-authoring skill body (frontmatter stripped), reused as the MCP `instructions` and the
  // agent's appended system prompt so both stay in sync with the skill.
  const conventions = await loadSkillBody(path.join(REPO_ROOT, ".claude", "skills", "blog-authoring", "SKILL.md"));

  // ---- construct concretes ----
  const git = createGitRunner({ cwd: REPO_ROOT });
  // Watches the repo's common .git dir once for the whole sidecar lifetime; no consumer yet
  // (the status service that reacts to it is a later bead).
  const gitWatcher = createGitWatch(REPO_ROOT);
  // The branch the studio launched on: the fork base for new post worktrees and the ship target.
  const sessionBranch = await resolveSessionBranch(git);

  // Prepare a freshly-created/reused worktree: symlink node_modules, then copy the .worktreeinclude
  // files so gitignored local config (e.g. .env.local) is present in the worktree too.
  const prepareWorktree = async (worktreePath: string): Promise<void> => {
    await linkNodeModules(worktreePath);
    await copyWorktreeIncludes({ git, srcRoot: REPO_ROOT, worktreePath });
  };

  const store = createStore({
    fs: nodeFs,
    git,
    repoRoot: REPO_ROOT,
    sessionBranch,
    // Preview URLs point at the sidecar-owned Astro daemon. STUDIO_HOST_ASTRO defaults to its own
    // loopback address, so this reconstructs the literal below unless it's set.
    previewBase: `${PROTOCOL}://${process.env.STUDIO_HOST_ASTRO ?? `localhost:${ASTRO_PORT}`}`,
    // New post worktrees fork from the local session-branch tip; STUDIO_FORK_BASE overrides the base.
    forkBase: process.env.STUDIO_FORK_BASE || undefined,
    prepareWorktree,
    // Rename a file/dir on disk (used by post.rename).
    movePath: async (from, to) => {
      await mkdir(path.dirname(to), { recursive: true });
      await rename(from, to);
    },
    // Stop the preview daemon in a worktree before post.delete removes it (see astro.stopServing).
    stopPreview: (worktreePath) => astro.stopServing(worktreePath),
    // Remove a leftover/husk worktree dir before ensureWorktree re-creates it (see its self-heal
    // comment for how a detached Astro daemon leaves one behind).
    removePath: async (p) => {
      await rm(p, { recursive: true, force: true });
    },
  });

  const ship = createShipService({
    git,
    sessionBranch,
    getActiveWorktree: () => store.getActiveWorktree(),
    getWorktreeFor: (p) => store.getWorktreeFor(p),
    getActiveNameSync: () => store.getActiveNameSync(),
    pagesProject: CF_PAGES_PROJECT,
  });
  const sessions = createSessionsService({
    blogRepoDir: REPO_ROOT,
    getActiveWorktreePath: () => store.getActiveWorktree()?.worktreePath ?? null,
  });
  const tools = createStudioTools({ store, ship, blogRoot: REPO_ROOT, conventions });

  // The sidecar-owned Astro daemon, restarted in the active worktree on every active change.
  const astro = createAstroManager(await store.sessionWorktreesRoot());
  await astro.stopStrayDaemons();

  // The MDX language server and its browser bridge. One long-lived child, restarted per `/lsp`
  // connection for a clean `initialize`; the bridge rewrites the browser's canonical URIs to the
  // active post's worktree so TS resolves against its tsconfig. Best-effort: if it can't start,
  // `/lsp` is refused and the editor keeps its built-in completion sources.
  const lspServer = createMdxLspServer({ repoRoot: REPO_ROOT });
  const lspBridge = createLspBridge({
    lsp: lspServer,
    store,
    repoRoot: REPO_ROOT,
    tsdk: path.join(NODE_MODULES, "typescript", "lib"),
  });
  // Watch the active post's worktree source tree and relay changes to the language server as
  // workspace/didChangeWatchedFiles, so out-of-editor edits (e.g. the agent modifying a component)
  // aren't stranded behind the server's stale TS program (the browser client can't watch the fs).
  const lspWatcher = createLspWatcher((changes) => lspBridge.notifyFilesChanged(changes));

  // The doc-sync watcher follows the active post's worktree file. It's created on the first
  // activation (there may be no openable post at bootstrap) and retargeted on every switch.
  let docSync: DocSync | null = null;
  store.onActiveChange((info) => {
    if (docSync) docSync.retarget(info.worktreeFilePath);
    else docSync = createDocSync(store, { filePath: info.worktreeFilePath });
    lspWatcher.retarget(info.worktreePath);
    void astro.switchTo(info.worktreePath);
  });

  const agentHost = createAgentHost({
    tools,
    getActiveWorktree: () => store.getActiveWorktree(),
    skillInstructions: conventions,
    // The store is the single event bus: the agent host's stream reaches the browser through the
    // same store.subscribe fan-out the web server listens on.
    emit: (msg) => store.publish(msg),
    // Soft-lock the editor for the turn so the watcher treats the agent's writes as agent-origin
    // (live-applied) rather than external (reload banner).
    onTurnStart: () => docSync?.dispatch({ type: "prompt.dispatch" }),
    onTurnEnd: () => docSync?.dispatch({ type: "agent.turn.end" }),
  });

  // `post.renamed` is the single migration signal: the SPA follows a tab's transcript to the new
  // path, and the SDK session must follow too so the resumable conversation isn't orphaned. Covers
  // slug/date renames and the watcher-driven layout relayout (file to folder or back) alike.
  store.subscribe((msg) => {
    if (msg.type === "post.renamed") agentHost.renameSessionKey(msg.oldPath, msg.newPath);
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
  const web = createServer(services, {
    token,
    webPort: WEB_PORT,
    spaPort: SPA_PORT,
    lspConnect: (ws) => lspBridge.connect(ws),
    // Computed fresh per connection so a reload reflects new commits/pushes without a restart.
    getStudioBranch: () => resolveStudioBranch(git, sessionBranch),
    fetchRemote: () => fetchRemote(git, store),
  });
  await web.listen();
  const mcp = createMcpHttpServer(tools, { token, instructions: conventions, port: MCP_PORT });

  const active = store.getActive();
  console.error(
    `[sidecar] up — branch ${sessionBranch}  web http://localhost:${WEB_PORT}  ` +
      `mcp http://localhost:${mcp.port}/mcp  astro http://localhost:${ASTRO_PORT}  ` +
      `post=${active ? path.relative(REPO_ROOT, active.path) : "(none)"}`,
  );

  // ---- teardown ----
  let closing = false;
  const shutdown = async (): Promise<void> => {
    if (closing) return;
    closing = true;
    await Promise.allSettled([
      docSync?.close() ?? Promise.resolve(),
      lspWatcher.close(),
      gitWatcher.close(),
      web.close(),
      mcp.close(),
      astro.close(),
      lspServer.close(),
    ]);
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
  // A terminal close sends SIGHUP; shut down the same way so the Astro daemon stops gracefully
  // instead of being left orphaned.
  process.on("SIGHUP", () => void shutdown());
}

/** Ensure `<worktree>/node_modules` symlinks to the repo's (worktrees are gitignored, no deps). */
async function linkNodeModules(worktreePath: string): Promise<void> {
  const link = path.join(worktreePath, "node_modules");
  if (existsSync(link)) return;
  try {
    await symlink(NODE_MODULES, link, "dir");
  } catch (err) {
    // A race or pre-existing entry is fine; anything else is logged but non-fatal (Astro/agent
    // tooling fails more loudly if deps are missing).
    if ((err as NodeJS.ErrnoException).code !== "EEXIST") {
      console.error(`[sidecar] could not link node_modules into ${worktreePath}: ${(err as Error).message}`);
    }
  }
}

/**
 * Owns the single Astro dev daemon. `dev stop` must run with cwd = the worktree that owns the daemon
 * (registry in <cwd>/.astro), so we track the current worktree and, on switch, stop the old daemon
 * then start a fresh one in the new worktree (which re-runs getStaticPaths for the new post's route).
 */
function createAstroManager(worktreesRoot: string) {
  let current: string | null = null;
  // Serialize daemon ops so rapid tab switches don't race two `astro dev` onto the same port.
  let queue: Promise<void> = Promise.resolve();
  const enqueue = (op: () => Promise<void>): Promise<void> => {
    queue = queue.then(op, op);
    return queue;
  };

  /**
   * Stop any background daemon owning `worktreePath`. Async, never `spawnSync`: a sync stop on every
   * active change would block the event loop, freezing autosave and the agent stream. Best-effort.
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
        entries = await readdir(worktreesRoot);
      } catch {
        return; // no worktrees yet
      }
      for (const name of entries) await stopAt(path.join(worktreesRoot, name));
    },

    /**
     * (Re)start Astro in `worktreePath` on the fixed port, stopping the previously-active daemon
     * first. Only claims the worktree as `current` once the launch succeeded and the daemon actually
     * answers, so a failed bind can't leave the preview pointed at a stale server. Logs on failure.
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
        // `astro dev --background` forks a daemon and exits 0 on a successful launch. STUDIO_BIND_HOST
        // (set by the Docker image) widens the bind address so a reverse proxy in another container
        // can reach it; local dev leaves it unset and keeps Astro's own loopback default.
        const bindHost = process.env.STUDIO_BIND_HOST;
        const launch = await runToExit(
          bin,
          ["dev", "--background", "--port", String(ASTRO_PORT), ...(bindHost ? ["--host", bindHost] : [])],
          worktreePath,
        );
        if (launch.code !== 0) {
          current = null;
          console.error(
            `[sidecar] astro dev failed to start in ${worktreePath} (exit ${launch.code})` +
              (launch.stderr.trim() ? `: ${launch.stderr.trim()}` : "") +
              `. Preview unavailable on http://localhost:${ASTRO_PORT}.`,
          );
          return;
        }
        // Exit 0 only means the daemon forked; wait until it actually serves the port before
        // treating the preview as live. If it never answers, the port may be held by another server.
        const healthy = await waitForHttp(`http://localhost:${ASTRO_PORT}/`, ASTRO_HEALTH_TIMEOUT_MS);
        if (!healthy) {
          // Stop the forked daemon before dropping the claim: a slow cold start that later binds the
          // port would otherwise orphan (current is null, so no switchTo can stop it), pointing every
          // later preview at the wrong post until the sidecar restarts.
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
     * Stop the daemon serving `worktreePath` and await it (queued behind any in-flight switch),
     * dropping the claim if it's current. Used by the store before a delete removes the worktree, so
     * no daemon is left orphaned holding the port.
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

/**
 * The branch the studio launched on, the "primary" branch. `STUDIO_PRIMARY_BRANCH` overrides it; a
 * detached HEAD (no branch name) falls back to the short commit SHA so it still namespaces cleanly.
 */
async function resolveSessionBranch(git: ReturnType<typeof createGitRunner>): Promise<string> {
  const override = process.env.STUDIO_PRIMARY_BRANCH?.trim();
  if (override) return override;
  const head = await git.git(["rev-parse", "--abbrev-ref", "HEAD"], { cwd: REPO_ROOT });
  const name = head.stdout.trim();
  if (head.code === 0 && name && name !== "HEAD") return name;
  const sha = await git.git(["rev-parse", "--short", "HEAD"], { cwd: REPO_ROOT });
  return sha.stdout.trim() || "HEAD";
}

/**
 * The studio's branch label for the status popover: `origin/<branch>` when the local session branch
 * is in sync with (or behind) its origin counterpart, else the bare `<branch>` when it carries commits
 * origin doesn't have or has no origin ref at all. Offline-safe: reads refs on disk, never fetches.
 */
async function resolveStudioBranch(
  git: ReturnType<typeof createGitRunner>,
  sessionBranch: string,
): Promise<{ ref: string; worktree: string }> {
  const worktree = REPO_ROOT;
  const onOrigin = await originRefExists(git, REPO_ROOT, sessionBranch);
  if (!onOrigin) return { ref: sessionBranch, worktree };
  const counted = await git.git(["rev-list", "--count", `origin/${sessionBranch}..${sessionBranch}`], { cwd: REPO_ROOT });
  const ahead = Number.parseInt(counted.stdout.trim() || "0", 10) || 0;
  return { ref: ahead > 0 ? sessionBranch : `origin/${sessionBranch}`, worktree };
}

/**
 * Pull down others' pushes: `git fetch --prune origin` at the repo root (ambient credentials, exactly
 * how ship's push authenticates), then republish the active post's divergence so its warning reflects
 * the newly-fetched refs. The one place the studio reaches origin to read — it's otherwise offline by
 * design, so no fetch happens implicitly anywhere else.
 */
async function fetchRemote(git: ReturnType<typeof createGitRunner>, store: StudioStore): Promise<FetchResponse> {
  try {
    const res = await git.git(["fetch", "--prune", "origin"], { cwd: REPO_ROOT, timeoutMs: NETWORK_TIMEOUT_MS });
    if (res.code !== 0) return { ok: false, error: res.stderr.trim() || `git fetch exited ${res.code}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "git fetch failed" };
  }
  await store.publishActiveDivergence();
  return { ok: true };
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
