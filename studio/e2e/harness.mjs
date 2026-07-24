// Shared plumbing for the Playwright studio e2e: an isolated git sandbox (local bare origin + working
// clone), a booted sidecar, and a booted vite SPA the browser drives. Hermetic by construction —
// nothing touches GitHub, the real origin, main, or any live worktree; the sandbox is a throwaway
// sibling dir removed on teardown, and every face binds an ephemeral loopback port (never the studio's
// fixed 4318/4319/4321/5199). Salvaged from the retired REST/WS harness; the driver is now the browser,
// so only the sandbox/boot/git-ground-truth helpers remain here (plus a new vite boot).

import { spawn, execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, appendFileSync, symlinkSync, realpathSync, readdirSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

// studio/e2e/ -> repo root two levels up: the worktree this suite ships in, whose node_modules the
// sandbox borrows; the sandbox tree itself comes from the source ref.
export const HARNESS_REPO = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
export const REF = process.env.STUDIO_E2E_REF || "HEAD";

// Secret scrubbing for any sidecar output this suite echoes.
export const SECRETS = [];
export function scrub(text) {
  let out = String(text);
  for (const s of SECRETS) if (s) out = out.split(s).join("[REDACTED]");
  return out.replace(/\bsk-ant-[A-Za-z0-9._-]{8,}/g, "sk-ant-[REDACTED]").replace(/\bsk-[A-Za-z0-9._-]{16,}/g, "sk-[REDACTED]");
}

// ---- git helpers (sandbox setup + ground-truth assertions; never drives the studio) ----
export function git(args, cwd, opts = {}) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
}
export function gitOk(args, cwd) {
  try { git(args, cwd); return true; } catch { return false; }
}

function freePort(host = "127.0.0.1") {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, host, () => { const { port } = probe.address(); probe.close(() => resolve(port)); });
  });
}

export function seedPost(title, slug, headline, date) {
  return `---\ntitle: ${title}\nslug: ${slug}\nheadline: ${headline}\ncreated_at: "${date}"\n---\n\nStart writing…\n`;
}

// Mirror node_modules as a symlink farm omitting the astro bin, so the studio skips its preview daemon
// (astro dev --background hangs the sidecar's astro queue in a Linux CI container when it can't own its
// port; and the preview isn't exercised by the UI journeys). Each entry symlinks to its real path.
function linkNodeModulesFarm(src, dest) {
  mkdirSync(dest);
  for (const entry of readdirSync(src)) {
    if (entry === ".bin") continue;
    symlinkSync(realpathSync(path.join(src, entry)), path.join(dest, entry));
  }
  const srcBin = path.join(src, ".bin");
  if (!existsSync(srcBin)) return;
  const destBin = path.join(dest, ".bin");
  mkdirSync(destBin);
  for (const b of readdirSync(srcBin)) {
    if (b === "astro" || b === "astro.cmd") continue;
    try { symlinkSync(realpathSync(path.join(srcBin, b)), path.join(destBin, b)); } catch { /* dangling bin link */ }
  }
}

// ---- sandbox ----
export function buildSandbox(ref = REF) {
  // On the home volume (not the OS temp dir): chokidar/FSEvents drops events under macOS's
  // /private/var/folders tmp tree, making the studio's reactive git.state flaky. realpath it too, since
  // the sidecar resolves its repo root (and `git worktree list` paths) through the real path.
  const root = realpathSync(mkdtempSync(path.join(path.dirname(HARNESS_REPO), ".studio-e2e-")));
  const originGit = path.join(root, "origin.git");
  const repo = path.join(root, "repo");
  const mover = path.join(root, "mover");

  const refSha = git(["rev-parse", ref], HARNESS_REPO);
  git(["init", "--bare", "-q", originGit], root);
  git(["symbolic-ref", "HEAD", "refs/heads/main"], originGit);
  git(["push", "-q", originGit, `${refSha}:refs/heads/main`], HARNESS_REPO);
  git(["clone", "-q", originGit, repo], root);
  git(["clone", "-q", originGit, mover], root);
  for (const r of [repo, mover]) {
    git(["config", "user.name", "Ryan Rowe"], r);
    git(["config", "user.email", "ryan@rowe.codes"], r);
    git(["config", "commit.gpgsign", "false"], r);
  }
  linkNodeModulesFarm(path.join(HARNESS_REPO, "node_modules"), path.join(repo, "node_modules"));

  const seedRel = "src/content/blog/2020-01-01_seed.mdx";
  mkdirSync(path.join(repo, "src/content/blog"), { recursive: true });
  writeFileSync(path.join(repo, seedRel), seedPost("Seed", "seed", "the seed post", "2020-01-01"));
  writeFileSync(path.join(repo, "conflict.txt"), "base\n");
  git(["add", "--", seedRel, "conflict.txt"], repo);
  git(["commit", "-q", "-m", "seed: bootstrap post + shared file"], repo);
  git(["push", "-q", "origin", "main"], repo);

  const claudeConfig = path.join(root, ".claude-config");
  mkdirSync(claudeConfig);
  return { root, originGit, repo, mover, seedRel, claudeConfig };
}

// Advance origin/main by one commit via the mover clone (an external mutation the studio only learns of on fetch).
export function moverAdvanceMain(sb, files, message) {
  git(["fetch", "-q", "origin", "main"], sb.mover);
  git(["checkout", "-q", "-B", "main", "origin/main"], sb.mover);
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(sb.mover, rel)), { recursive: true });
    writeFileSync(path.join(sb.mover, rel), content);
    git(["add", "--", rel], sb.mover);
  }
  git(["commit", "-q", "-m", message], sb.mover);
  git(["push", "-q", "origin", "main"], sb.mover);
}

// Create a remote-only draft branch on origin forked from baseRef, then drop the local copy so the
// studio only sees origin/blog/<stem> — a draft pushed from another session.
export function seedRemoteDraft(sb, stem, baseRef, files, message) {
  const branch = `blog/${stem}`;
  git(["fetch", "-q", "origin"], sb.mover);
  git(["checkout", "-q", "-B", branch, baseRef], sb.mover);
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(sb.mover, rel)), { recursive: true });
    writeFileSync(path.join(sb.mover, rel), content);
    git(["add", "--", rel], sb.mover);
  }
  git(["commit", "-q", "-m", message], sb.mover);
  git(["push", "-q", "origin", branch], sb.mover);
  git(["checkout", "-q", "main"], sb.mover);
  git(["branch", "-qD", branch], sb.mover);
  return branch;
}

async function waitHttp(url, ms) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try { const r = await fetch(url, { signal: AbortSignal.timeout(2000) }); if (r.status < 500) return true; } catch { /* not up */ }
    await sleep(300);
  }
  return false;
}

// ---- process boot (sidecar + vite), each detached so teardown can group-kill the whole tree ----
function bootChild(name, args, env, cwd, logFile, verbose) {
  const child = spawn("npm", args, { cwd, env, stdio: ["ignore", "pipe", "pipe"], detached: true });
  const state = { name, child, exited: false, exitInfo: null };
  child.on("exit", (code, signal) => { state.exited = true; state.exitInfo = { code, signal }; });
  const onData = (buf) => { const t = scrub(buf.toString()); appendFileSync(logFile, `[${name}] ${t}`); if (verbose) process.stderr.write(`[${name}] ${t}`); };
  child.stdout.on("data", onData);
  child.stderr.on("data", onData);
  return state;
}

/**
 * Boot the full studio stack against `sb`: sidecar (REST/WS/health) + vite SPA. Threads the same
 * per-launch token into both — STUDIO_TOKEN for the sidecar, VITE_STUDIO_TOKEN baked into the served
 * SPA — so a plain browser nav to the SPA is already authenticated (no 403). `key` (the Anthropic key)
 * is handed to the sidecar only when the agent journey is enabled. Returns handles + the SPA url.
 */
export async function startStudio(sb, { key = null, verbose = false } = {}) {
  const token = randomBytes(32).toString("hex");
  SECRETS.push(token);
  const ports = { web: await freePort(), mcp: await freePort(), astro: await freePort(), spa: await freePort() };
  const logFile = path.join(sb.root, "studio.log");
  const common = {
    ...process.env,
    STUDIO_TOKEN: token,
    STUDIO_WEB_PORT: String(ports.web),
    STUDIO_MCP_PORT: String(ports.mcp),
    STUDIO_ASTRO_PORT: String(ports.astro),
    STUDIO_SPA_PORT: String(ports.spa),
    STUDIO_NO_OPEN_BROWSER: "1",
    CHOKIDAR_USEPOLLING: "1",
    CHOKIDAR_INTERVAL: "80",
    STUDIO_PRIMARY_BRANCH: "main",
    CLAUDE_CONFIG_DIR: sb.claudeConfig,
  };
  const sidecar = bootChild("sidecar", ["run", "studio:sidecar"], { ...common, STUDIO_POST: sb.seedRel, ...(key ? { ANTHROPIC_API_KEY: key } : {}) }, sb.repo, logFile, verbose);
  if (!(await waitHttp(`http://127.0.0.1:${ports.web}/health`, 45_000))) throw new Error(`sidecar did not become healthy; see ${logFile}`);
  // The SPA bakes VITE_STUDIO_TOKEN + the sidecar's web port at dev-server start, so the browser is authenticated.
  const spa = bootChild("vite", ["run", "studio:ui"], { ...common, VITE_STUDIO_TOKEN: token, VITE_STUDIO_SIDECAR_PORT: String(ports.web) }, sb.repo, logFile, verbose);
  if (!(await waitHttp(`http://127.0.0.1:${ports.spa}/`, 45_000))) throw new Error(`vite SPA did not become healthy; see ${logFile}`);
  return { token, ports, logFile, sidecar, spa, url: `http://127.0.0.1:${ports.spa}/` };
}

/** Kill both process groups (sidecar + vite) and wait for exit. */
export async function stopStudio(studio) {
  for (const s of [studio?.spa, studio?.sidecar]) {
    if (!s?.child || s.exited) continue;
    try { process.kill(-s.child.pid, "SIGTERM"); } catch { try { s.child.kill("SIGTERM"); } catch { /* gone */ } }
  }
  await sleep(1500);
  for (const s of [studio?.spa, studio?.sidecar]) {
    if (!s?.child || s.exited) continue;
    try { process.kill(-s.child.pid, "SIGKILL"); } catch { /* gone */ }
  }
  await sleep(300);
}

/** Remove a sandbox dir, retrying past a daemon still flushing files. */
export function removeSandbox(root) {
  try { rmSync(root, { recursive: true, force: true, maxRetries: 8, retryDelay: 400 }); } catch { /* best effort */ }
}

export const readKey = () => {
  const f = process.env.STUDIO_E2E_KEY_FILE || "/tmp/anthropic_key.txt";
  try { return existsSync(f) ? readFileSync(f, "utf8").trim() || null : null; } catch { return null; }
};
export { sleep, path, existsSync, readFileSync, writeFileSync };
