// Studio orchestrator (`npm run studio`). Dependency-free (node: builtins only): this is the
// first thing that runs, before any devDependency is guaranteed usable, so it can't lean on one.
//
// Boots two long-lived processes in order, health-gating each before the next:
//   sidecar (4318 MCP / 4319 web, health at /health) then studio SPA (5199).
// The sidecar owns the Astro dev server (one daemon at a time, in the active post's worktree, on
// 4321), so the orchestrator does not start or supervise Astro. Then it opens the browser at
// the SPA, pointed at the post to author. Owns teardown: on SIGINT/SIGTERM/exit, or if any child
// dies unexpectedly, every child (and its process tree) is killed.

import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const NODE_MIN_MAJOR = 24;

const SIDECAR_MCP_PORT = 4318;
const SIDECAR_WEB_PORT = 4319;
const SPA_PORT = 5199;
// Astro's port. The sidecar binds it, not the orchestrator; surfaced only for the "ready" log.
const ASTRO_PORT = 4321;

const HEALTH_TIMEOUT_MS = 30_000;
const HEALTH_POLL_INTERVAL_MS = 300;
const HEALTH_REQUEST_TIMEOUT_MS = 2_000;
const SIGTERM_GRACE_MS = 5_000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const BLOG_DIR = path.join(REPO_ROOT, "src", "content", "blog");
const NPM_COMMAND = process.platform === "win32" ? "npm.cmd" : "npm";

// Populated as children are spawned; consulted by shutdown() and the synchronous 'exit' handler.
const children = [];
let shuttingDown = false;

function checkNodeVersion() {
  const major = Number(process.versions.node.split(".")[0]);
  if (!Number.isFinite(major) || major < NODE_MIN_MAJOR) {
    console.error(
      `[studio] requires Node >= ${NODE_MIN_MAJOR}, but this process is running Node ${process.versions.node}.\n` +
        `[studio] activate a newer Node (e.g. via nvm/fnm) and re-run "npm run studio".`,
    );
    process.exit(1);
  }
}

function parseArgs(argv) {
  let post;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--post") {
      post = argv[i + 1];
      i++;
    } else if (argv[i].startsWith("--post=")) {
      post = argv[i].slice("--post=".length);
    }
  }
  return { post };
}

// Resolves whether a port is free by briefly binding to it. Rejects (port busy or otherwise
// unbindable) rather than throwing, so callers can gather every busy port before failing.
function checkPortFree(port) {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.once("listening", () => probe.close(() => resolve()));
    probe.listen(port, "127.0.0.1");
  });
}

async function assertPortsFree(ports) {
  const results = await Promise.allSettled(ports.map(checkPortFree));
  const busy = ports.filter((_, i) => results[i].status === "rejected");
  if (busy.length > 0) {
    for (const port of busy) {
      console.error(`[studio] port ${port} in use — is another studio already running?`);
    }
    process.exit(1);
  }
}

// Matches the content collection's own glob (`**/*.mdx` under src/content/blog), so this covers
// both post conventions: a bare `YYYY-MM-DD_slug.mdx` file and a `YYYY-MM-DD_slug/post.mdx` folder.
function collectMdxFiles(dir) {
  const found = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...collectMdxFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      found.push(full);
    }
  }
  return found;
}

// Newest post in the main working tree, or null if there are none; the sidecar picks the actual
// active post (and starts empty if the target can't be opened), so a missing post is not fatal here.
function findMostRecentPost(dir) {
  const files = collectMdxFiles(dir);
  if (files.length === 0) return null;
  return files.reduce((latest, file) =>
    statSync(file).mtimeMs > statSync(latest).mtimeMs ? file : latest,
  );
}

function resolvePostPath(postArg) {
  const abs = postArg ? path.resolve(REPO_ROOT, postArg) : findMostRecentPost(BLOG_DIR);
  if (!abs) return null;
  const rel = path.relative(REPO_ROOT, abs).split(path.sep).join("/");
  return { abs, rel };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHttp(url, { label, timeoutMs, intervalMs }) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(HEALTH_REQUEST_TIMEOUT_MS) });
      if (res.status === 200) return;
      lastError = new Error(`unexpected status ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    await sleep(intervalMs);
  }
  throw new Error(
    `${label} did not become healthy at ${url} within ${timeoutMs}ms (last error: ${lastError?.message ?? "unknown"})`,
  );
}

// Line-buffers a child stream so labeled output doesn't interleave mid-line with siblings.
function pipeLines(source, target, label) {
  let buffer = "";
  source.setEncoding("utf8");
  source.on("data", (chunk) => {
    buffer += chunk;
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      target.write(`[${label}] ${buffer.slice(0, newlineIndex)}\n`);
      buffer = buffer.slice(newlineIndex + 1);
    }
  });
  source.on("end", () => {
    if (buffer.length > 0) target.write(`[${label}] ${buffer}\n`);
  });
}

// Kills one child's whole process tree and resolves once it's gone (or after a safety timeout,
// so a hung child can never block shutdown indefinitely).
function killChildTree(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve();
      return;
    }
    child.once("exit", resolve);
    setTimeout(resolve, SIGTERM_GRACE_MS + 2_000);

    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
      return;
    }
    try {
      process.kill(-child.pid, "SIGTERM"); // negative pid = whole group (detached: true set it)
    } catch {
      // Group may already be gone.
    }
    const killTimer = setTimeout(() => {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        // Already gone.
      }
    }, SIGTERM_GRACE_MS);
    child.once("exit", () => clearTimeout(killTimer));
  });
}

async function shutdown(exitCode, reason) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (reason) console.log(`[studio] shutting down (${reason})`);
  // The sidecar stops its own Astro daemon on SIGTERM (its teardown), so killing the child tree
  // is enough; no separate astro stop here.
  await Promise.all(children.map(killChildTree));
  process.exit(exitCode);
}

// Last-resort synchronous cleanup for exit paths that bypass shutdown() (e.g. an uncaught
// exception). 'exit' listeners can't await, so this is fire-and-forget SIGKILL, not a retry.
process.on("exit", () => {
  for (const child of children) {
    if (child.exitCode !== null || child.signalCode !== null) continue;
    try {
      if (process.platform === "win32") {
        spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
      } else {
        process.kill(-child.pid, "SIGKILL");
      }
    } catch {
      // Best effort.
    }
  }
});
process.on("SIGINT", () => shutdown(0, "SIGINT"));
process.on("SIGTERM", () => shutdown(0, "SIGTERM"));

// Spawns one child, wires up labeled logging + crash detection, then blocks until it answers
// healthUrl with 200 (or throws, which the caller turns into a full teardown).
async function startAndHealthGate({ name, command, args, env, healthUrl }) {
  console.log(`[studio] starting ${name}...`);
  const child = spawn(command, args, {
    cwd: REPO_ROOT,
    env,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  children.push(child);
  pipeLines(child.stdout, process.stdout, name);
  pipeLines(child.stderr, process.stderr, name);

  child.on("error", (err) => {
    if (shuttingDown) return;
    console.error(`[studio] failed to start ${name}: ${err.message}`);
    shutdown(1);
  });
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    console.error(`[studio] ${name} exited unexpectedly (code=${code}, signal=${signal ?? "none"})`);
    shutdown(1);
  });

  await waitForHttp(healthUrl, {
    label: name,
    timeoutMs: HEALTH_TIMEOUT_MS,
    intervalMs: HEALTH_POLL_INTERVAL_MS,
  });
  console.log(`[studio] ${name} is healthy (${healthUrl})`);
  return child;
}

// Best-effort browser launch; a failure here should never take down the studio.
function openBrowser(url) {
  const [command, args] =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", '""', url]]
        : ["xdg-open", [url]];
  try {
    const opener = spawn(command, args, { stdio: "ignore", detached: true });
    opener.once("error", (err) => {
      console.warn(`[studio] couldn't open browser automatically (${err.message}); open manually: ${url}`);
    });
    opener.unref();
  } catch (err) {
    console.warn(`[studio] couldn't open browser automatically (${err.message}); open manually: ${url}`);
  }
}

async function main() {
  checkNodeVersion();
  // Astro's port (4321) is bound by the sidecar (which also clears stray worktree daemons), so it
  // is intentionally not asserted here; only the orchestrator-owned ports are.
  await assertPortsFree([SIDECAR_MCP_PORT, SIDECAR_WEB_PORT, SPA_PORT]);

  const { post: postArg } = parseArgs(process.argv.slice(2));
  const post = resolvePostPath(postArg);
  console.log(`[studio] active post: ${post ? post.rel : "(none — create one in the studio)"}`);

  const token = randomBytes(32).toString("hex");

  await startAndHealthGate({
    name: "sidecar",
    command: NPM_COMMAND,
    args: ["run", "studio:sidecar"],
    // The sidecar is the actual post chooser (reads STUDIO_POST / --post); forward the resolved
    // post so `npm run studio -- --post <path>` opens that post, not the newest.
    env: post
      ? { ...process.env, STUDIO_TOKEN: token, STUDIO_POST: post.rel }
      : { ...process.env, STUDIO_TOKEN: token },
    healthUrl: `http://127.0.0.1:${SIDECAR_WEB_PORT}/health`,
  });

  await startAndHealthGate({
    name: "spa",
    command: NPM_COMMAND,
    args: ["run", "studio:ui"],
    env: { ...process.env, VITE_STUDIO_TOKEN: token },
    healthUrl: `http://127.0.0.1:${SPA_PORT}/`,
  });

  const spaUrl = post
    ? `http://localhost:${SPA_PORT}/?post=${encodeURIComponent(post.rel)}`
    : `http://localhost:${SPA_PORT}/`;
  openBrowser(spaUrl);

  console.log(`[studio] ready: ${spaUrl}`);
  console.log(`[studio] astro preview (sidecar-managed): http://localhost:${ASTRO_PORT}/`);
  console.log(`[studio] press Ctrl+C to stop`);
}

main().catch((err) => {
  console.error(`[studio] fatal: ${err?.stack ?? err}`);
  shutdown(1);
});
