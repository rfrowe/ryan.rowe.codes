// Studio orchestrator (`npm run studio`). Dependency-free (node: builtins only): this is the
// first thing that runs, before any devDependency is guaranteed usable, so it can't lean on one.
//
// Picks a free port for each face (preferring the well-known defaults, falling back so a second
// studio can run beside a first), then boots two long-lived processes in order, health-gating each
// before the next: the sidecar (MCP + web, health at /health) then the studio SPA. The sidecar owns
// the Astro dev server (one daemon at a time, in the active post's worktree), so the orchestrator
// does not start or supervise Astro; it just passes the chosen ports down. Then it opens the browser
// at the SPA, pointed at the post to author. Owns teardown: on SIGINT/SIGTERM/exit, or if any child
// dies unexpectedly, every child (and its process tree) is killed.

import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const NODE_MIN_MAJOR = 24;

// Preferred ports: used as-is when free (a lone studio is unchanged), else an OS-assigned free port
// takes over so simultaneous studios don't collide.
const DEFAULT_MCP_PORT = 4318;
const DEFAULT_WEB_PORT = 4319;
const DEFAULT_SPA_PORT = 5199;
const DEFAULT_ASTRO_PORT = 4321;

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

// ---- terminal presentation (ANSI + OSC 8 hyperlinks; a no-op when stdout isn't a TTY or NO_COLOR is set) ----
const COLOR = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const style = (open, close) => (s) => (COLOR ? `\x1b[${open}m${s}\x1b[${close}m` : s);
const bold = style(1, 22);
const dim = style(2, 22);
const cyan = style(36, 39);
const green = style(32, 39);

/** A clickable link in terminals that support OSC 8; plain text (the URL) everywhere else. */
function hyperlink(url, text = url) {
  return COLOR ? `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\` : text;
}

const TAG = dim("[studio]");
function note(message) {
  console.log(`${TAG} ${message}`);
}

/** The branch the studio launched on, for display (mirrors the sidecar's resolution). */
function sessionBranchForDisplay() {
  const override = process.env.STUDIO_PRIMARY_BRANCH?.trim();
  if (override) return override;
  const head = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: REPO_ROOT, encoding: "utf8" });
  const name = head.status === 0 ? head.stdout.trim() : "";
  if (name && name !== "HEAD") return name;
  const sha = spawnSync("git", ["rev-parse", "--short", "HEAD"], { cwd: REPO_ROOT, encoding: "utf8" });
  return sha.status === 0 && sha.stdout.trim() ? sha.stdout.trim() : "(detached)";
}

/** The "everything is up" summary: the links to open plus the post and branch in play. */
function readyBanner({ ports, post, branch }) {
  const label = (text) => dim(text.padEnd(9));
  return [
    "",
    `  ${bold(cyan("◆ blog authoring studio"))}`,
    "",
    `  ${label("Studio")}${cyan(hyperlink(`http://localhost:${ports.spa}/`))}`,
    `  ${label("Preview")}${cyan(hyperlink(`http://localhost:${ports.astro}/`))}`,
    `  ${label("Sidecar")}${dim(`localhost:${ports.web}  ·  MCP :${ports.mcp}`)}`,
    `  ${label("Branch")}${branch}`,
    `  ${label("Post")}${post ? post.rel : dim("none — create one in the studio")}`,
    "",
    `  ${dim("Press Ctrl+C to stop.")}`,
    "",
  ].join("\n");
}

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

// Resolves true if `port` is free on `host` (briefly binds it), false if busy or unbindable. The host
// must match the service's own bind host, or a busy port on a different loopback family (e.g. Astro
// on localhost/::1 vs a 127.0.0.1 probe) reads as free and two studios collide.
function isPortFree(port, host) {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.once("error", () => resolve(false));
    probe.once("listening", () => probe.close(() => resolve(true)));
    probe.listen(port, host);
  });
}

// An OS-assigned free port on `host`: bind :0, read the assigned port, release it.
function ephemeralPort(host) {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, host, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

// Claim `preferred` when it's free and not already claimed this launch, else an ephemeral free port.
// `host` is the service's bind host so the check is meaningful. `taken` stops two faces from being
// handed the same port. A small race between picking and the child binding is tolerable here (local
// dev); the loop re-checks each candidate.
async function pickPort(preferred, taken, host) {
  if (!taken.has(preferred) && (await isPortFree(preferred, host))) {
    taken.add(preferred);
    return preferred;
  }
  for (let attempt = 0; attempt < 50; attempt++) {
    const port = await ephemeralPort(host);
    if (!taken.has(port) && (await isPortFree(port, host))) {
      taken.add(port);
      return port;
    }
  }
  throw new Error(`could not find a free port near ${preferred}`);
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

// Line-buffers a child stream so labeled output doesn't interleave mid-line with siblings. The
// dimmed prefix keeps the child's own logs visually subordinate to the orchestrator's.
function pipeLines(source, target, label) {
  const prefix = dim(`[${label}]`);
  let buffer = "";
  source.setEncoding("utf8");
  source.on("data", (chunk) => {
    buffer += chunk;
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      target.write(`${prefix} ${buffer.slice(0, newlineIndex)}\n`);
      buffer = buffer.slice(newlineIndex + 1);
    }
  });
  source.on("end", () => {
    if (buffer.length > 0) target.write(`${prefix} ${buffer}\n`);
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
  note(`starting ${name}…`);
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
  note(`${green("✓")} ${name} ready ${dim(`(${healthUrl})`)}`);
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

  // A free port per face (Astro included, so the sidecar's daemon doesn't collide with another
  // studio's). Preferring the defaults keeps a lone studio on the well-known ports. Each port is
  // probed on the host its service binds: the sidecar and SPA on 127.0.0.1, Astro on localhost.
  // STUDIO_BIND_HOST (set by the Docker image) widens every face's bind address so a reverse proxy
  // in another container can reach them; local dev leaves it unset and keeps the loopback defaults.
  const bindHost = process.env.STUDIO_BIND_HOST;
  const taken = new Set();
  const ports = {
    mcp: await pickPort(DEFAULT_MCP_PORT, taken, bindHost ?? "127.0.0.1"),
    web: await pickPort(DEFAULT_WEB_PORT, taken, bindHost ?? "127.0.0.1"),
    spa: await pickPort(DEFAULT_SPA_PORT, taken, bindHost ?? "127.0.0.1"),
    astro: await pickPort(DEFAULT_ASTRO_PORT, taken, bindHost ?? "localhost"),
  };

  const { post: postArg } = parseArgs(process.argv.slice(2));
  const post = resolvePostPath(postArg);

  const token = randomBytes(32).toString("hex");

  await startAndHealthGate({
    name: "sidecar",
    command: NPM_COMMAND,
    args: ["run", "studio:sidecar"],
    // The sidecar reads its ports and the target post from the environment. It's the actual post
    // chooser (STUDIO_POST / --post), so forward the resolved post to open it, not the newest.
    env: {
      ...process.env,
      STUDIO_TOKEN: token,
      STUDIO_MCP_PORT: String(ports.mcp),
      STUDIO_WEB_PORT: String(ports.web),
      STUDIO_ASTRO_PORT: String(ports.astro),
      STUDIO_SPA_PORT: String(ports.spa),
      ...(post ? { STUDIO_POST: post.rel } : {}),
    },
    healthUrl: `http://127.0.0.1:${ports.web}/health`,
  });

  await startAndHealthGate({
    name: "spa",
    command: NPM_COMMAND,
    args: ["run", "studio:ui"],
    // Vite reads its own port from STUDIO_SPA_PORT; the SPA reads the sidecar's web port (and token)
    // from the VITE_ vars baked in at dev-server start. Vite only surfaces VITE_-prefixed vars to
    // browser code, so STUDIO_HOST_SIDECAR/STUDIO_HOST_ASTRO/STUDIO_PROTOCOL (unlike STUDIO_BIND_HOST,
    // which every child reads directly from the raw environment) need explicit re-mapping here.
    env: {
      ...process.env,
      VITE_STUDIO_TOKEN: token,
      STUDIO_SPA_PORT: String(ports.spa),
      VITE_STUDIO_SIDECAR_PORT: String(ports.web),
      VITE_STUDIO_ASTRO_PORT: String(ports.astro),
      ...(process.env.STUDIO_HOST_SIDECAR ? { VITE_STUDIO_HOST_SIDECAR: process.env.STUDIO_HOST_SIDECAR } : {}),
      ...(process.env.STUDIO_HOST_ASTRO ? { VITE_STUDIO_HOST_ASTRO: process.env.STUDIO_HOST_ASTRO } : {}),
      ...(process.env.STUDIO_PROTOCOL ? { VITE_STUDIO_PROTOCOL: process.env.STUDIO_PROTOCOL } : {}),
    },
    healthUrl: `http://127.0.0.1:${ports.spa}/`,
  });

  const spaUrl = post
    ? `http://localhost:${ports.spa}/?post=${encodeURIComponent(post.rel)}`
    : `http://localhost:${ports.spa}/`;
  // Containers have no browser to open (and no display to fail toward); the Docker image sets this.
  if (!process.env.STUDIO_NO_OPEN_BROWSER) openBrowser(spaUrl);

  console.log(readyBanner({ ports, post, branch: sessionBranchForDisplay() }));
}

main().catch((err) => {
  console.error(`[studio] fatal: ${err?.stack ?? err}`);
  shutdown(1);
});
