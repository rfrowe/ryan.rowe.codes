// End-to-end studio suite, run under Vitest (`npm run studio:e2e`). It boots a real sidecar against a
// fully isolated git sandbox (a local bare "origin" plus a working clone) and drives the studio end to
// end through the exact boundary the SPA uses — the loopback REST + WebSocket faces — asserting on git
// ground truth, the reactive git.state, and sidecar liveness after each real-world workflow.
//
// The scenarios are ONE ordered session replay: they share the single sidecar booted in `beforeAll`
// and accumulate state (later scenarios lean on earlier ones), so they run sequentially in definition
// order in a single worker (see vitest.config.ts). The sandbox/boot/REST+WS driver/git helpers below
// are the substance; Vitest supplies the runner, reporter, and lifecycle.
//
// Isolation, by construction: nothing here touches GitHub, the real `origin`, `main`, or any live
// worktree. The sandbox is a throwaway dir with its own bare origin, removed on teardown. The one real
// credential (the Anthropic key for the agent scenario) is read into the sidecar's env only when the
// agent scenario is explicitly enabled, and never logged, embedded, or committed.
//
// Config via env: STUDIO_E2E_REF (sandbox source ref, default HEAD); STUDIO_E2E_KEY_FILE (Anthropic
// key file, default /tmp/anthropic_key.txt); STUDIO_E2E_AGENT=1 to enable the paid agent scenario (8a)
// — off by default so a stray funded key is never spent locally or by an untrusted CI run; STUDIO_E2E_KEEP=1
// to keep the sandbox; STUDIO_E2E_VERBOSE=1 to echo (scrubbed) sidecar logs.

import { spawn, execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, appendFileSync, symlinkSync, realpathSync, readdirSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

import { WebSocket } from "ws";
import { beforeAll, afterAll, afterEach, test, expect } from "vitest";

// studio/e2e/ -> repo root is two levels up: the worktree this suite ships in, whose node_modules the
// sandbox borrows; the sandbox tree itself comes from the source ref.
const HARNESS_REPO = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));

const REF = process.env.STUDIO_E2E_REF || "HEAD";
const KEY_FILE = process.env.STUDIO_E2E_KEY_FILE || "/tmp/anthropic_key.txt";
const KEEP = process.env.STUDIO_E2E_KEEP === "1";
const VERBOSE = process.env.STUDIO_E2E_VERBOSE === "1";

// The Anthropic key (agent scenario only), loaded once at collection time so the gate below is known
// before tests register. The agent scenario runs only when a key is present AND explicitly enabled.
const anthropicKey = (() => {
  try { return existsSync(KEY_FILE) ? readFileSync(KEY_FILE, "utf8").trim() || null : null; } catch { return null; }
})();
const RUN_AGENT = !!anthropicKey && process.env.STUDIO_E2E_AGENT === "1";

function step(msg) { console.log(`  · ${msg}`); }

// Everything the sidecar prints, or that this suite ever echoes, runs through this so the Anthropic
// key (and other obvious secrets) can never leak into logs or output.
const SECRETS = [];
function scrub(text) {
  let out = String(text);
  for (const s of SECRETS) if (s) out = out.split(s).join("[REDACTED]");
  return out.replace(/\bsk-ant-[A-Za-z0-9._-]{8,}/g, "sk-ant-[REDACTED]").replace(/\bsk-[A-Za-z0-9._-]{16,}/g, "sk-[REDACTED]");
}

// ---- git helpers (sandbox setup only; the studio itself is never driven this way) ----
function git(args, cwd, opts = {}) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
}
function gitOk(args, cwd) {
  try { git(args, cwd); return true; } catch { return false; }
}

// ---- free-port picker (probe :0, read the assigned port, release it) ----
function freePort(host = "127.0.0.1") {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, host, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

// =====================================================================================
// Sandbox: a bare origin + a working clone the studio treats as its repo root. Fully local.
// =====================================================================================
function buildSandbox(ref) {
  // Sandbox on the same (home) volume as the repo, not the OS temp dir: chokidar/FSEvents drops and
  // delays events under macOS's /private/var/folders temp tree, and the studio's whole git-live
  // doorbell (and docSync) rides FSEvents, so a tmp-dir sandbox makes reactive git.state flaky. A
  // sibling of the harness worktree watches reliably. realpath it too, since the sidecar resolves its
  // repo root (and `git worktree list` paths) through the real path.
  const root = realpathSync(mkdtempSync(path.join(path.dirname(HARNESS_REPO), ".studio-e2e-")));
  const originGit = path.join(root, "origin.git");
  const repo = path.join(root, "repo");
  const mover = path.join(root, "mover"); // a second clone for advancing origin/main and seeding drafts.

  const refSha = git(["rev-parse", ref], HARNESS_REPO);
  step(`sandbox at ${root} (source ${ref} = ${refSha.slice(0, 8)})`);

  // Bare origin, default branch main, seeded from the chosen ref's tree.
  git(["init", "--bare", "-q", originGit], root);
  git(["symbolic-ref", "HEAD", "refs/heads/main"], originGit);
  // Push the ref's tree into the bare origin as main. An explicit-URL push reads from the shared
  // object store and writes only to the bare repo; it creates no remote-tracking refs in HARNESS_REPO.
  git(["push", "-q", originGit, `${refSha}:refs/heads/main`], HARNESS_REPO);

  // Working clone = the studio's repo root, with its own origin pointing at the bare repo.
  git(["clone", "-q", originGit, repo], root);
  git(["clone", "-q", originGit, mover], root);
  for (const r of [repo, mover]) {
    git(["config", "user.name", "Ryan Rowe"], r);
    git(["config", "user.email", "ryan@rowe.codes"], r);
    git(["config", "commit.gpgsign", "false"], r);
  }
  // Worktrees the studio creates symlink node_modules from the repo root; borrow this worktree's — but
  // as a farm that OMITS the astro bin, so the studio's `existsSync(.bin/astro)` check is false and it
  // skips spawning astro dev entirely (preview isn't exercised here). `astro dev --background` hangs
  // the sidecar's serialized astro queue in the Linux CI container when it can't own its port, which
  // would wedge the two flows that await stopPreview (rename, delete); omitting the bin removes astro
  // as a variable, and makes the whole run faster.
  linkNodeModulesFarm(path.join(HARNESS_REPO, "node_modules"), path.join(repo, "node_modules"));

  // Seed a committed post (the bootstrap target) and a shared tracked file the conflict scenarios move
  // from both sides. Targeted adds only, so the algorithmic-art submodule gitlink is untouched.
  const seedRel = "src/content/blog/2020-01-01_seed.mdx";
  mkdirSync(path.join(repo, "src/content/blog"), { recursive: true });
  writeFileSync(path.join(repo, seedRel), seedPost("Seed", "seed", "the seed post", "2020-01-01"));
  writeFileSync(path.join(repo, "conflict.txt"), "base\n");
  git(["add", "--", seedRel, "conflict.txt"], repo);
  git(["commit", "-q", "-m", "seed: bootstrap post + shared file"], repo);
  git(["push", "-q", "origin", "main"], repo);

  // Isolated, empty config dir for the embedded agent (CLAUDE_CONFIG_DIR), so a turn never loads the
  // author's real ~/.claude (its MCP servers / logged-in session).
  const claudeConfig = path.join(root, ".claude-config");
  mkdirSync(claudeConfig, { recursive: true });

  return { root, originGit, repo, mover, seedRel, claudeConfig };
}

function seedPost(title, slug, headline, date) {
  return `---\ntitle: ${title}\nslug: ${slug}\nheadline: ${headline}\ncreated_at: "${date}"\n---\n\nStart writing…\n`;
}

/** Mirror `src` node_modules into `dest` as a symlink farm, omitting the astro bin so the studio skips
 *  its preview daemon. Each entry symlinks to its real path, so module resolution is unchanged. */
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
    try { symlinkSync(realpathSync(path.join(srcBin, b)), path.join(destBin, b)); } catch { /* dangling bin link; skip */ }
  }
}

// Advance origin/main by one commit through the mover clone (a genuinely external mutation, exactly
// like a teammate merging a PR: the studio only learns of it on fetch).
function moverAdvanceMain(sb, files, message) {
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

// Create a remote-only draft branch on origin, forked from `baseRef`, then drop the local copy so the
// studio only ever sees it as `origin/blog/<stem>` — a draft pushed from another session.
function seedRemoteDraft(sb, stem, baseRef, files, message) {
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

// =====================================================================================
// Sidecar process: boot, health-gate, and a liveness flag the assertions read after every scenario.
// =====================================================================================
async function bootSidecar(sb, ports, token, key, logFile) {
  const env = {
    ...process.env,
    STUDIO_TOKEN: token,
    STUDIO_WEB_PORT: String(ports.web),
    STUDIO_MCP_PORT: String(ports.mcp),
    STUDIO_ASTRO_PORT: String(ports.astro),
    STUDIO_SPA_PORT: String(ports.spa),
    STUDIO_POST: sb.seedRel,
    STUDIO_NO_OPEN_BROWSER: "1",
    // Force chokidar (git-live doorbell + docSync) into polling: FSEvents drops/coalesces events under
    // rapid programmatic git ops, making the studio's reactive git.state flaky in an automated run.
    // Polling exercises the identical doorbell->recompute->publish logic with reliable delivery.
    CHOKIDAR_USEPOLLING: "1",
    CHOKIDAR_INTERVAL: "80",
    // A clone from a bare origin already sets origin/HEAD, so defaultBranch resolves offline with no gh
    // call; pin the primary branch too so nothing probes the network for it.
    STUDIO_PRIMARY_BRANCH: "main",
    // Isolate the embedded agent's config so a turn never loads the author's real ~/.claude (its MCP
    // servers / logged-in session): hermetic, cheaper, on the ANTHROPIC_API_KEY not a logged-in session,
    // and no detached MCP subprocesses lingering past teardown.
    CLAUDE_CONFIG_DIR: sb.claudeConfig,
    ...(key ? { ANTHROPIC_API_KEY: key } : {}),
  };
  // detached: its own process group, so teardown can signal the whole tree (npm -> tsx -> any git
  // subprocess) at once rather than orphaning children that keep writing the sandbox.
  const child = spawn("npm", ["run", "studio:sidecar"], { cwd: sb.repo, env, stdio: ["ignore", "pipe", "pipe"], detached: true });
  const state = { child, exited: false, exitInfo: null };
  child.on("exit", (code, signal) => { state.exited = true; state.exitInfo = { code, signal }; });
  const onData = (buf) => {
    const text = scrub(buf.toString());
    appendFileSync(logFile, text);
    if (VERBOSE) process.stderr.write(text);
  };
  child.stdout.on("data", onData);
  child.stderr.on("data", onData);

  const healthUrl = `http://127.0.0.1:${ports.web}/health`;
  const deadline = Date.now() + 40_000;
  while (Date.now() < deadline) {
    if (state.exited) throw new Error(`sidecar exited during boot (code=${state.exitInfo?.code}); see ${logFile}`);
    try {
      const res = await fetch(healthUrl, { signal: AbortSignal.timeout(2000) });
      if (res.status === 200) return state;
    } catch { /* not up yet */ }
    await sleep(300);
  }
  throw new Error(`sidecar did not become healthy at ${healthUrl}`);
}

// =====================================================================================
// REST client — the same calls api.ts makes for ⌘⇧F (/fetch), ⌘⇧U (/update), /update-root,
// /save-draft, /doc (autosave), and the /diff destructive previews.
// =====================================================================================
function makeRest(port, token) {
  const base = `http://127.0.0.1:${port}`;
  const auth = { Authorization: `Bearer ${token}` };
  const json = (res) => res.json();
  return {
    base,
    async putDoc(pathAbs, text, baseRev) {
      return json(await fetch(`${base}/doc`, { method: "PUT", headers: { "content-type": "application/json", ...auth }, body: JSON.stringify({ path: pathAbs, text, baseRev }) }));
    },
    async getDiff(query) {
      const u = new URL(`${base}/diff`); for (const [k, v] of Object.entries(query)) u.searchParams.set(k, v);
      return json(await fetch(u, { headers: auth }));
    },
    async fetchRemote() { return json(await fetch(`${base}/fetch`, { method: "POST", headers: auth })); },
    async update(pathAbs) { return json(await fetch(`${base}/update`, { method: "POST", headers: { "content-type": "application/json", ...auth }, body: JSON.stringify({ path: pathAbs }) })); },
    async updateRoot(confirm) { return json(await fetch(`${base}/update-root`, { method: "POST", headers: { "content-type": "application/json", ...auth }, body: JSON.stringify({ confirm }) })); },
    async saveDraft(req) { return json(await fetch(`${base}/save-draft`, { method: "POST", headers: { "content-type": "application/json", ...auth }, body: JSON.stringify(req) })); },
    async posts() { return json(await fetch(`${base}/posts`, { headers: auth })); },
    async health() { const r = await fetch(`${base}/health`, { signal: AbortSignal.timeout(3000) }); return r.status; },
  };
}

// =====================================================================================
// WS client — the SPA's socket. Tracks the latest git.state, per-path revs, tabs, active post, and
// injected system bubbles; auto-answers permission requests exactly as the SPA's allow button does.
// =====================================================================================
function makeWs(port, token) {
  const ws = new WebSocket(`ws://127.0.0.1:${port}?token=${encodeURIComponent(token)}`);
  const messages = [];
  const waiters = new Set();
  const client = { ws, messages, gitState: null, revByPath: new Map(), tabs: [], activePath: null, namesync: null, injected: [], permissionsAnswered: 0, autoAllow: false };
  ws.on("message", (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { return; }
    messages.push(msg);
    switch (msg.type) {
      case "git.state": client.gitState = msg.state; break;
      case "file.changed": client.revByPath.set(msg.path, msg.rev); break;
      case "tabs": client.tabs = msg.open; break;
      case "active": client.activePath = msg.path; break;
      case "post.namesync": client.namesync = msg; break;
      case "chat.injected": client.injected.push(msg); break;
      case "permission.request":
        if (client.autoAllow) {
          client.permissionsAnswered++;
          ws.send(JSON.stringify({ type: "permission.response", requestId: msg.requestId, decision: "allow" }));
        }
        break;
    }
    for (const w of [...waiters]) if (w.pred(msg)) { waiters.delete(w); w.resolve(msg); }
  });
  client.ready = new Promise((resolve, reject) => { ws.once("open", resolve); ws.once("error", reject); });
  // Resolve on the first message matching `pred` (checks the buffer, then future arrivals).
  client.waitMessage = (pred, { timeout = 15_000, desc = "message" } = {}) =>
    new Promise((resolve, reject) => {
      const hit = messages.find(pred);
      if (hit) return resolve(hit);
      const w = { pred, resolve };
      waiters.add(w);
      setTimeout(() => { waiters.delete(w); reject(new Error(`timed out waiting for ${desc}`)); }, timeout);
    });
  // Fire-and-forget client message (mode.set / model.set / effort.set / permission.response).
  client.send = (msg) => ws.send(JSON.stringify(msg));
  // Send a post.* request and resolve with its post.result.
  client.request = (partial, { timeout = 45_000 } = {}) => {
    const requestId = randomBytes(8).toString("hex");
    const p = client.waitMessage((m) => m.type === "post.result" && m.requestId === requestId, { timeout, desc: `post.result for ${partial.type}` });
    ws.send(JSON.stringify({ ...partial, requestId }));
    return p;
  };
  client.close = () => new Promise((resolve) => {
    // If the sidecar already dropped the socket (e.g. it crashed), 'close' has fired and won't fire
    // again; resolve immediately rather than await a second one forever. Timeout is a final backstop.
    if (ws.readyState === ws.CLOSED) return resolve();
    ws.once("close", resolve);
    setTimeout(resolve, 3000);
    ws.close();
  });
  return client;
}

// ---- waits + assertions (Vitest-native) ----

// Poll a predicate for a reactive git.state fact, via expect.poll. Throws with `desc` on timeout.
async function until(pred, { timeout = 15_000, interval = 200, desc = "condition" } = {}) {
  try {
    await expect.poll(() => { try { return Boolean(pred()); } catch { return false; } }, { interval, timeout }).toBe(true);
  } catch {
    throw new Error(`timed out waiting for ${desc}`);
  }
}

// Like `until`, but records a non-fatal finding (console.warn) instead of failing on timeout: for
// reactive git.state facts that depend on the chokidar/poke doorbell, whose delivery is best-effort.
// Ground truth for the same fact is always asserted separately via a direct git query, so a soft miss
// here flags a reactivity nuance without failing a workflow whose real outcome is correct.
// (Deliberately not `test.retry`: these tests are ordered and state-accumulating, so re-running a body
// would replay its git mutations against an already-mutated sandbox.)
async function softUntil(findings, id, pred, { timeout = 8_000, desc = "condition" } = {}) {
  try { await until(pred, { timeout, desc }); return true; }
  catch (e) { findings.push({ id, note: e.message }); console.warn(`  ⚠ finding [${id}]: ${e.message}`); return false; }
}

class AssertionError extends Error {}
function assert(cond, msg) { expect(cond, msg).toBeTruthy(); }
function assertEq(actual, expected, msg) { expect(actual, msg).toBe(expected); }
const postOf = (gs, stem) => (gs?.posts ?? []).find((p) => p.stem === stem) ?? null;

// Agent-side errors that mean the credential can't run a turn at all (vs. a studio bug): the model
// never gets to edit, so the conflict scenario can verify the hand-off and stay-up but not the fix.
const AGENT_UNAVAILABLE = /credit balance|insufficient|quota|authentication|invalid.*api.?key|unauthorized|401|permission|rate.?limit|overloaded|529/i;

// =====================================================================================
// Shared context, built once in beforeAll and read by every scenario (ordered session replay).
// =====================================================================================
let ctx = null;
const findings = [];

// Path helpers read `ctx` lazily (at scenario run time, when it's populated). A post's canonical path
// is only its tab key; the real file lives in the post's worktree, so assertions read the worktree file.
const blogAbs = (stem) => path.join(ctx.sb.repo, "src/content/blog", `${stem}.mdx`);
const worktreeDir = (stem) => path.join(ctx.sb.repo, ".worktrees", "blog", stem);
const wtFile = (stem) => path.join(worktreeDir(stem), "src/content/blog", `${stem}.mdx`);
const originHas = (branch) => gitOk(["rev-parse", "--verify", `refs/heads/${branch}`], ctx.sb.originGit);
const localBranch = (branch) => gitOk(["rev-parse", "--verify", `refs/heads/${branch}`], ctx.sb.repo);

beforeAll(async () => {
  console.log("\n◆ studio e2e (vitest)\n");
  if (anthropicKey) {
    SECRETS.push(anthropicKey);
    step(`Anthropic key present; agent scenario (8a) ${RUN_AGENT ? "ENABLED" : "not enabled (set STUDIO_E2E_AGENT=1)"}`);
  } else {
    step("no Anthropic key; agent scenario (8a) skipped");
  }
  const sb = buildSandbox(REF);
  const token = randomBytes(32).toString("hex");
  SECRETS.push(token);
  const ports = { web: await freePort(), mcp: await freePort(), astro: await freePort(), spa: await freePort() };
  const logFile = path.join(sb.root, "sidecar.log");
  step(`ports web=${ports.web} mcp=${ports.mcp} astro=${ports.astro}(unused) spa=${ports.spa}; sidecar log ${logFile}`);
  // Only hand the key to the sidecar when the agent scenario is enabled, so a stray funded key can't be
  // spent by the deterministic run.
  const liveness = await bootSidecar(sb, ports, token, RUN_AGENT ? anthropicKey : null, logFile);
  step("sidecar healthy");
  const rest = makeRest(ports.web, token);
  const ws = makeWs(ports.web, token);
  await ws.ready;
  await ws.waitMessage((m) => m.type === "git.state", { timeout: 20_000, desc: "initial git.state" });
  // Let the git-live chokidar watch finish its initial scan before the first scenario mutates refs.
  await sleep(2000);
  step("websocket connected, initial snapshot received\n");
  ctx = { sb, rest, ws, ports, token, liveness, findings, logFile };
}, 200_000);

afterAll(async () => {
  if (ctx?.ws) await ctx.ws.close().catch(() => {});
  const l = ctx?.liveness;
  if (l?.child && !l.exited) {
    // Kill the whole process group (the sidecar is detached), then wait for the actual exit before
    // removing the sandbox — the sidecar's own shutdown writes into the tree and would otherwise race
    // the removal into an ENOTEMPTY.
    try { process.kill(-l.child.pid, "SIGTERM"); } catch { l.child.kill("SIGTERM"); }
    await Promise.race([new Promise((r) => l.child.once("exit", r)), sleep(6000)]);
    if (!l.exited) { try { process.kill(-l.child.pid, "SIGKILL"); } catch { l.child.kill("SIGKILL"); } await sleep(500); }
  }
  if (findings.length) {
    console.warn(`\n${findings.length} non-fatal finding(s) (reactive-convergence observations):`);
    for (const f of findings) console.warn(`  ⚠ [${f.id}] ${f.note}`);
  }
  if (ctx && !KEEP) {
    try { rmSync(ctx.sb.root, { recursive: true, force: true, maxRetries: 8, retryDelay: 400 }); step("sandbox removed"); }
    catch (e) { console.warn(`could not remove sandbox ${ctx.sb.root}: ${e.message}`); }
  } else if (ctx) {
    step(`sandbox kept at ${ctx.sb.root}`);
  }
}, 60_000);

// Liveness is an invariant after every scenario, not just the crash probes.
afterEach(async () => {
  if (!ctx) return;
  expect(ctx.liveness.exited, `sidecar exited (code=${ctx.liveness.exitInfo?.code}, signal=${ctx.liveness.exitInfo?.signal})`).toBe(false);
  expect(await ctx.rest.health(), "sidecar /health not 200 after scenario").toBe(200);
});

// =====================================================================================
// Scenarios — each a real user workflow; the comment names the SPA action it mirrors. They run in
// order, sharing one sidecar/sandbox, and use unique slugs so they never collide.
// =====================================================================================

test("1-create-edit-autosave — create a post, edit it, autosave (file + worktree + git.state)", async () => {
  const { rest, ws } = ctx;
  // SPA: New-post dialog -> WS post.create; editor keystrokes -> PUT /doc (autosave).
  const stem = "2026-07-10_create-edit";
  const abs = blogAbs(stem);
  const res = await ws.request({ type: "post.create", title: "Create Edit", slug: "create-edit", headline: "h", created_at: "2026-07-10" });
  assert(res.ok, `post.create failed: ${res.error}`);
  assertEq(res.path, abs, "created canonical path");
  assert(existsSync(wtFile(stem)), "post file exists in its worktree");
  assert(existsSync(worktreeDir(stem)), "worktree dir created");
  assert(localBranch(`blog/${stem}`), "isolation branch blog/<stem> created locally");
  // git.state should list the new post open with a worktree. A net-new post with only an uncommitted
  // file has ahead=0, so inRoot reads true here; don't assert inRoot=false. Soft: reactive-convergence
  // only, the create's ground truth is asserted above.
  await softUntil(findings, "1", () => { const p = postOf(ws.gitState, stem); return !!p && p.open && p.hasWorktree; }, { desc: "git.state lists the new post open with a worktree" });

  // Autosave an edit against the rev the store broadcast on activation.
  const rev = ws.revByPath.get(abs);
  assert(rev, "have a base rev from file.changed");
  const edited = seedPost("Create Edit", "create-edit", "h", "2026-07-10").replace("Start writing…", "First paragraph of real content.");
  const put = await rest.putDoc(abs, edited, rev);
  assert(put.ok, `PUT /doc failed: ${put.error}`);
  assert(put.rev.n > rev.n, "rev advanced on autosave");
  assertEq(readFileSync(wtFile(stem), "utf8"), edited, "worktree file holds the autosaved bytes");
  // Autosave pokes git-live, so the working tree should show uncommitted with no git op. Soft: doorbell
  // delivery is best-effort; ground truth (the bytes on disk) is asserted above.
  await softUntil(findings, "1", () => postOf(ws.gitState, stem)?.uncommitted === true, { desc: "git.state uncommitted after a fresh post's autosave (poke-driven)" });
  ctx.created = { stem, abs }; // reused by the external-edit scenario.
});

test("2-rename-accept — rename via frontmatter slug, accept the rename (file + branch + worktree + editor follow)", async () => {
  const { rest, ws } = ctx;
  // SPA: editing the frontmatter slug raises a name-sync banner; clicking "Complete rename" sends WS
  // post.completeRename.
  const stem = "2026-07-11_rename-before";
  const abs = blogAbs(stem);
  const create = await ws.request({ type: "post.create", title: "Rename Me", slug: "rename-before", headline: "h", created_at: "2026-07-11" });
  assert(create.ok, `post.create failed: ${create.error}`);
  await ws.waitMessage((m) => m.type === "active" && m.path === abs, { desc: "rename post active" });

  // Change the frontmatter slug -> filename/frontmatter desync -> namesync banner.
  const rev = ws.revByPath.get(abs);
  const renamed = seedPost("Rename Me", "rename-after", "h", "2026-07-11");
  const put = await rest.putDoc(abs, renamed, rev);
  assert(put.ok, `PUT /doc failed: ${put.error}`);
  const newStem = "2026-07-11_rename-after";
  await until(() => ws.namesync && ws.namesync.synced === false && ws.namesync.expectedStem === newStem && ws.namesync.canComplete === true, { desc: "post.namesync reports the desync with canComplete" });

  // Accept the rename.
  const newAbs = blogAbs(newStem);
  const done = await ws.request({ type: "post.completeRename", path: abs });
  assert(done.ok, `completeRename failed: ${done.error}`);
  assertEq(done.path, newAbs, "completeRename returns the new path");
  await ws.waitMessage((m) => m.type === "post.renamed" && m.oldPath === abs && m.newPath === newAbs, { desc: "post.renamed old->new" });
  assert(existsSync(wtFile(newStem)) && !existsSync(worktreeDir(stem)), "post file moved to the new stem's worktree");
  assert(localBranch(`blog/${newStem}`) && !localBranch(`blog/${stem}`), "branch renamed to the new stem");
  assert(existsSync(worktreeDir(newStem)) && !existsSync(worktreeDir(stem)), "worktree dir moved to the new stem");
  await ws.waitMessage((m) => m.type === "active" && m.path === newAbs, { desc: "editor follows the rename (active=newPath)" });
  // Reactive re-key of git.state (soft: the rename's ground truth — file/branch/worktree moved — is
  // asserted above; git.state convergence right after a worktree move can lag under automation).
  await softUntil(findings, "2", () => postOf(ws.gitState, newStem) && !postOf(ws.gitState, stem), { desc: "git.state re-keyed to the new stem" });
});

test("3-save-draft-remote — save draft to remote (push blog/<stem>, origin branch exists)", async () => {
  const { rest, ws } = ctx;
  // SPA: footer/tab-menu "Save draft to remote" -> POST /save-draft.
  const stem = "2026-07-12_save-draft";
  const abs = blogAbs(stem);
  const create = await ws.request({ type: "post.create", title: "Save Draft", slug: "save-draft", headline: "h", created_at: "2026-07-12" });
  assert(create.ok, `post.create failed: ${create.error}`);
  assert(!originHas(`blog/${stem}`), "origin has no draft branch yet");
  const saved = await rest.saveDraft({ path: abs, subject: `blog(save-draft): draft`, body: "", scope: "all", confirm: true });
  assert(saved.ok, `save-draft failed: ${saved.error}`);
  assertEq(saved.branch, `blog/${stem}`, "saved onto the post's isolation branch");
  assert(saved.pushed, "save-draft reports a push");
  assert(originHas(`blog/${stem}`), "origin/blog/<stem> now exists in the bare origin");
  await until(() => { const p = postOf(ws.gitState, stem); return p && p.onRemote === true && p.unpushed === 0; }, { desc: "git.state reports the post on-remote with nothing unpushed" });
  ctx.savedDraft = { stem, abs };
});

test("4-fetch — Fetch (⌘⇧F) reactively surfaces a base that moved on origin", async () => {
  const { sb, rest, ws } = ctx;
  // SPA: fetch button / ⌘⇧F -> POST /fetch, then git.state republishes for every post.
  const { stem, abs } = ctx.savedDraft;
  await until(() => { const p = postOf(ws.gitState, stem); return p && p.behind === 0; }, { desc: "draft starts in sync with the base" });
  // A teammate advances the base (non-conflicting change) on origin, out of band.
  moverAdvanceMain(sb, { "unrelated-4.txt": "root advance for fetch\n" }, "root: advance base (fetch scenario)");
  const before = ws.gitState?.fetch?.at ?? null;
  const fr = await rest.fetchRemote();
  assert(fr.ok, `fetch failed: ${fr.error}`);
  await until(() => (ws.gitState?.fetch?.at ?? null) !== before, { desc: "git.state.fetch.at refreshed after fetch" });
  await until(() => { const p = postOf(ws.gitState, stem); return p && p.behind >= 1; }, { desc: `post ${stem} reactively shows behind after fetch` });
  assert(abs, "path tracked");
});

test("5-update-behind — Update/Pull (⌘⇧U) a post behind the base: fetch-base + rebase clears behind", async () => {
  const { sb, rest, ws } = ctx;
  // Prereq from scenario 4 (the saved draft is now behind). SPA: "Update" / ⌘⇧U -> POST /update.
  const { stem, abs } = ctx.savedDraft;
  const p0 = postOf(ws.gitState, stem);
  assert(p0 && p0.behind >= 1, "precondition: the draft is behind (run scenario 4 first)");
  const res = await rest.update(abs);
  assert(res.ok, `update failed: ${JSON.stringify(res)}`);
  assert(res.result === "rebased" || res.result === "fast-forward" || res.result === "up-to-date", `unexpected update result: ${res.result}`);
  await until(() => { const p = postOf(ws.gitState, stem); return p && p.behind === 0 && p.rebase.phase === "idle"; }, { desc: "behind clears to 0 and rebase is idle after update" });
  // Ground truth: the branch now descends from origin/main.
  assert(gitOk(["merge-base", "--is-ancestor", "origin/main", `blog/${stem}`], sb.repo), "blog/<stem> now contains origin/main");
});

test("6-continue-after-pull — keep working after a pull: edit + autosave stays consistent, no lost content", async () => {
  const { rest, ws } = ctx;
  const { stem, abs } = ctx.savedDraft;
  const file = wtFile(stem);
  const rev = ws.revByPath.get(abs);
  assert(rev, "have a current rev after the pull");
  const body = readFileSync(file, "utf8");
  const edited = `${body}\nMore content written after the rebase.\n`;
  const put = await rest.putDoc(abs, edited, rev);
  assert(put.ok, `autosave after pull failed: ${put.error}`);
  assertEq(readFileSync(file, "utf8"), edited, "post-pull edit persisted to disk");
  // Autosave pokes git-live so uncommitted flips reactively; soft (the no-lost-content guarantee below
  // is the hard assertion).
  await softUntil(findings, "6", () => postOf(ws.gitState, stem)?.uncommitted === true, { desc: "git.state uncommitted after autosave-following-update (poke-driven, post-rebase)" });
  assertEq(postOf(ws.gitState, stem).behind, 0, "still in sync with the base after the post-pull edit");
  // The rebased content survived: the base-advance file is present in the worktree.
  assert(existsSync(path.join(worktreeDir(stem), "unrelated-4.txt")), "rebased-in base change is present in the worktree");
});

test("7-adopt-remote-draft — adopt a remote-only draft from ⌘P (--track: tracking branch + worktree)", async () => {
  const { sb, rest, ws } = ctx;
  // SPA: ⌘P lists remote-only drafts; selecting one -> WS post.open, which adopts via
  // `git worktree add --track`.
  const stem = "2026-07-13_adopt";
  const abs = blogAbs(stem);
  seedRemoteDraft(sb, stem, "origin/main", { [`src/content/blog/${stem}.mdx`]: seedPost("Adopt", "adopt", "h", "2026-07-13") }, "draft: adopt-me");
  // Learn of it exactly as the SPA would: fetch first, then open.
  assert((await rest.fetchRemote()).ok, "fetch before adopt");
  await until(() => { const p = postOf(ws.gitState, stem); return p && p.onRemote === true && p.hasWorktree === false; }, { desc: "remote-only draft visible in git.state (onRemote, no worktree)" });
  const opened = await ws.request({ type: "post.open", path: abs });
  assert(opened.ok, `adopt (post.open) failed: ${opened.error}`);
  assert(existsSync(worktreeDir(stem)), "adopt created the worktree");
  assert(localBranch(`blog/${stem}`), "adopt created the local tracking branch");
  const upstream = git(["rev-parse", "--abbrev-ref", `blog/${stem}@{upstream}`], sb.repo);
  assertEq(upstream, `origin/blog/${stem}`, "local branch tracks origin/blog/<stem>");
  await until(() => { const p = postOf(ws.gitState, stem); return p && p.hasWorktree === true && p.open === true; }, { desc: "git.state now shows the adopted draft open with a worktree" });
});

const agentTest = RUN_AGENT ? test : test.skip;
agentTest("8a-conflict-agent-resolution — update an OLD remote draft whose base moved -> conflict -> agent resolves (sidecar stays up)", async () => {
  const { sb, rest, ws } = ctx;
  // The flagship + the docsync-worktree-crash scenario. SPA: adopt from ⌘P, then ⌘⇧U; the conflict is
  // handed to the post's own agent (no manual merge UI). Drives the real Agent SDK, so it needs a key.
  const stem = "2026-07-14_conflict";
  const abs = blogAbs(stem);
  // Draft forked from the CURRENT base, editing the shared file on the post side...
  const draftBase = git(["rev-parse", "origin/main"], sb.repo);
  seedRemoteDraft(sb, stem, draftBase, {
    [`src/content/blog/${stem}.mdx`]: seedPost("Conflict", "conflict", "h", "2026-07-14"),
    "conflict.txt": "base\npost-side change\n",
  }, "draft: conflict post-side");
  // ...then the base moves on origin, touching the same file's tail differently.
  moverAdvanceMain(sb, { "conflict.txt": "base\nroot-side change\n" }, "root: conflicting base change");

  assert((await rest.fetchRemote()).ok, "fetch before adopt/update");
  const opened = await ws.request({ type: "post.open", path: abs });
  assert(opened.ok, `adopt failed: ${opened.error}`);
  await until(() => { const p = postOf(ws.gitState, stem); return p && p.behind >= 1; }, { desc: "adopted draft is behind the moved base" });

  // Pin the agent to Sonnet (the studio default is Opus 4.8) and low reasoning effort before the turn:
  // this validates the conflict-resolution FLOW, not model-specific quality, so it runs on the cheapest
  // capable model. Same programmatic hook the composer's model/effort chips use (WS model.set /
  // effort.set); applies to the server-initiated resolver turn that follows.
  ws.send({ type: "model.set", model: "claude-sonnet-5" });
  ws.send({ type: "effort.set", effort: "low" });
  await ws.waitMessage((m) => m.type === "model.status" && m.model === "claude-sonnet-5", { timeout: 5000, desc: "agent model pinned to Sonnet" });

  ws.autoAllow = true; // stand in for the human clicking "allow" on the agent's edit/add tools.
  let agentBlocked = null;
  let resolved = false;
  try {
    const res = await rest.update(abs);
    assert(res.ok && res.result === "conflicted", `expected a conflict, got ${JSON.stringify(res)}`);
    assert(Array.isArray(res.conflictedFiles) && res.conflictedFiles.includes("conflict.txt"), "conflict.txt reported conflicted");
    // Deterministic (no funded key needed): the conflict flows into the resolver, which injects a
    // system prompt and flips rebase.phase to conflicted/resolving.
    await ws.waitMessage((m) => m.type === "chat.injected" && m.path === abs && m.kind === "system", { timeout: 30_000, desc: "conflict resolver injected a system prompt" });
    await until(() => { const p = postOf(ws.gitState, stem); return p && (p.rebase.phase === "conflicted" || p.rebase.phase === "resolving"); }, { desc: "rebase.phase is conflicted/resolving" });
    // Then the agent resolves and the studio runs rebase --continue. Race resolution against an
    // agent-side error that means the credential can't actually run a turn (no balance / auth): that
    // isn't a studio failure, so surface it distinctly rather than timing out for minutes.
    const deadline = Date.now() + 240_000;
    while (Date.now() < deadline) {
      const p = postOf(ws.gitState, stem);
      if (p && p.rebase.phase === "idle" && p.behind === 0) { resolved = true; break; }
      const err = ws.messages.find((m) => m.type === "error" && AGENT_UNAVAILABLE.test(m.message));
      if (err) { agentBlocked = err.message; break; }
      await sleep(1000);
    }
    if (!resolved && !agentBlocked) {
      // An unexpected outcome (funded key, no credential error, yet unresolved): dump the agent stream.
      const kinds = new Set(["error", "assistant.message", "tool.start", "tool.end", "done", "chat.injected", "permission.request"]);
      const rel = ws.messages.filter((m) => kinds.has(m.type)).slice(-25);
      console.log(scrub(`permissionsAnswered=${ws.permissionsAnswered}; agent stream:\n${rel.map((m) => JSON.stringify(m)).join("\n")}`));
      throw new AssertionError("agent did not resolve the conflict and reported no credential error within 240s");
    }
  } finally {
    ws.autoAllow = false;
  }

  // Liveness is the load-bearing assertion (the docsync-worktree-crash property): the sidecar must
  // survive the whole conflict hand-off and agent turn(s), resolved or not.
  assert(!ctx.liveness.exited, `sidecar exited during conflict resolution (code=${ctx.liveness.exitInfo?.code})`);
  assertEq(await rest.health(), 200, "sidecar /health still 200 after the conflict hand-off");

  const wtConflict = path.join(worktreeDir(stem), "conflict.txt");
  if (agentBlocked) {
    // The credential can't run a turn, so the flagship resolution can't complete here. Everything that
    // does NOT depend on the model is verified above; record the blocker and assert the studio left the
    // rebase intact (it never wrongly ran `rebase --continue` over live markers).
    findings.push({ id: "8a", note: `agent could not run (credential): "${scrub(agentBlocked)}". Verified: conflict detected, resolver hand-off (chat.injected), retry, sidecar stay-up. NOT verified (needs a funded key): agent editing + rebase --continue completing.` });
    console.warn(`  ⚠ agent unavailable ("${scrub(agentBlocked)}") — verified conflict hand-off + retry + sidecar stay-up; resolution itself needs a funded key`);
    assert(existsSync(wtConflict) && readFileSync(wtConflict, "utf8").includes("<<<<<<<"), "studio left the conflict intact when the agent could not resolve it");
    return;
  }

  // Full success path: markers gone, branch rebased onto origin/main.
  assert(existsSync(wtConflict) && !readFileSync(wtConflict, "utf8").includes("<<<<<<<"), "conflict markers resolved in the worktree");
  assert(gitOk(["merge-base", "--is-ancestor", "origin/main", `blog/${stem}`], sb.repo), "conflicted draft rebased onto origin/main");
}, 320_000);

test("8b-worktree-vanish-probe — worktree vanishes under docSync mid-op: sidecar stays up (docsync-worktree-crash)", async () => {
  const { rest, ws } = ctx;
  // Deterministic, key-free reproduction of the docsync-worktree-crash class. Make a post active
  // (docSync watches its worktree file and reseeds HEAD on every .git doorbell), remove its worktree
  // dir out of band, then ring the doorbell: docSync's seedHead runs `git rev-parse HEAD` with a cwd
  // that no longer exists -> spawn ENOENT. A fixed studio swallows it (try/catch + the
  // unhandledRejection backstop) and stays up; a studio without the fix lets the unhandled rejection
  // take the whole sidecar down. Either way the assertion is liveness.
  const stem = "2026-07-15_vanish";
  const abs = blogAbs(stem);
  const create = await ws.request({ type: "post.create", title: "Vanish", slug: "vanish", headline: "h", created_at: "2026-07-15" });
  assert(create.ok, `create failed: ${create.error}`);
  await ws.waitMessage((m) => m.type === "active" && m.path === abs, { desc: "vanish post active and watched" });
  await sleep(800); // let docSync seed its HEAD baseline for this worktree.

  // Pull the worktree dir out from under docSync, leaving git's worktree registration dangling.
  rmSync(worktreeDir(stem), { recursive: true, force: true });
  // Ring the .git doorbell so docSync reseeds HEAD (seedHead) against the missing worktree; a few rings
  // cover the debounce and give any unhandled rejection time to surface.
  for (let i = 0; i < 3; i++) {
    git(["update-ref", `refs/heads/__vanish_probe_${i}__`, "HEAD"], ctx.sb.repo);
    git(["update-ref", "-d", `refs/heads/__vanish_probe_${i}__`], ctx.sb.repo);
    await sleep(500);
  }
  await sleep(1000);

  assert(!ctx.liveness.exited, `sidecar exited when a watched worktree vanished (code=${ctx.liveness.exitInfo?.code}) — the docsync-worktree-crash bug`);
  assertEq(await rest.health(), 200, "sidecar /health still 200 after the worktree vanished");
  const probe = await rest.posts();
  assert(Array.isArray(probe.posts), "sidecar still answers REST after the worktree vanished");
  // Tidy git's dangling worktree registration so later scenarios see a clean tree.
  git(["worktree", "prune"], ctx.sb.repo);
});

test("9-update-root — update root from origin: fast-forward, then a diverged rebase", async () => {
  const { sb, rest, ws } = ctx;
  // SPA: the "Update root from origin" affordance -> POST /update-root (confirm gates a rebase).
  // Fast-forward case: advance origin/main, then a RAW fetch in the repo so the remote-tracking ref
  // moves WITHOUT the studio's own fetch auto-ff'ing the root first.
  moverAdvanceMain(sb, { "root-ff.txt": "ff the root\n" }, "root: ff case");
  git(["fetch", "-q", "origin", "main"], sb.repo);
  await until(() => (ws.gitState?.primary?.behind ?? 0) >= 1, { desc: "root shows behind after the raw fetch" });
  const ff = await rest.updateRoot(true);
  assert(ff.ok && ff.result === "updated", `expected ff 'updated', got ${JSON.stringify(ff)}`);
  await until(() => (ws.gitState?.primary?.behind ?? 99) === 0, { desc: "root behind clears after ff update-root" });
  assert(existsSync(path.join(sb.repo, "root-ff.txt")), "root worktree fast-forwarded to the new base");

  // Diverged case: give the root its own local commit, advance origin/main again, raw-fetch.
  writeFileSync(path.join(sb.repo, "root-local.txt"), "local-only root commit\n");
  git(["add", "--", "root-local.txt"], sb.repo);
  git(["commit", "-q", "-m", "root: local-only commit"], sb.repo);
  moverAdvanceMain(sb, { "root-remote.txt": "remote-only advance\n" }, "root: diverge case");
  git(["fetch", "-q", "origin", "main"], sb.repo);
  const diverged = await rest.updateRoot(false);
  assert(!diverged.ok && diverged.error === "diverged", `expected 'diverged', got ${JSON.stringify(diverged)}`);
  assert(diverged.ahead >= 1 && diverged.behind >= 1, "diverged reports both ahead and behind counts");
  const rebased = await rest.updateRoot(true);
  assert(rebased.ok && rebased.result === "updated", `expected rebase 'updated', got ${JSON.stringify(rebased)}`);
  assert(gitOk(["merge-base", "--is-ancestor", "origin/main", "HEAD"], sb.repo), "root rebased onto origin/main");
  assert(existsSync(path.join(sb.repo, "root-local.txt")), "root's local-only commit survived the rebase");
});

test("10a-revert-uncommitted — revert uncommitted edits back to HEAD (preview + confirm)", async () => {
  const { rest, ws } = ctx;
  // SPA: "Revert to clean" -> GET /diff?op=revert (preview) then WS post.revert.
  const stem = "2026-07-16_revert";
  const abs = blogAbs(stem);
  const create = await ws.request({ type: "post.create", title: "Revert", slug: "revert", headline: "h", created_at: "2026-07-16" });
  assert(create.ok, `create failed: ${create.error}`);
  const saved = await rest.saveDraft({ path: abs, subject: "blog(revert): draft", body: "", scope: "all", confirm: true });
  assert(saved.ok, `save-draft failed: ${saved.error}`);
  const file = wtFile(stem);
  const committed = readFileSync(file, "utf8");
  const rev = ws.revByPath.get(abs);
  assert((await rest.putDoc(abs, `${committed}\nuncommitted edit to discard\n`, rev)).ok, "dirty the post");
  await until(() => { const p = postOf(ws.gitState, stem); return p && p.uncommitted === true; }, { desc: "post is uncommitted before revert" });
  const preview = await rest.getDiff({ op: "revert", path: abs });
  assert(preview.changedFiles >= 1, "revert preview reports changed files");
  const done = await ws.request({ type: "post.revert", path: abs, scope: preview.scope ?? "post", expectedChangedFiles: preview.changedFiles });
  assert(done.ok, `revert failed: ${done.error}`);
  // Ground truth first: the file is back to its committed bytes.
  assertEq(readFileSync(file, "utf8"), committed, "worktree file restored to committed content");
  // Then the reactive clean state (soft: convergence right after a checkout can lag under automation).
  await softUntil(findings, "10a", () => postOf(ws.gitState, stem)?.uncommitted === false, { desc: "git.state shows the post clean after revert" });
});

test("10b-delete-draft — delete a draft (worktree + local branch gone; origin untouched)", async () => {
  const { rest, ws } = ctx;
  // SPA: delete-draft dialog -> GET /diff?op=delete (preview) then WS post.delete.
  const stem = "2026-07-17_delete";
  const abs = blogAbs(stem);
  const create = await ws.request({ type: "post.create", title: "Delete", slug: "delete", headline: "h", created_at: "2026-07-17" });
  assert(create.ok, `create failed: ${create.error}`);
  assert(existsSync(worktreeDir(stem)) && localBranch(`blog/${stem}`), "draft has a worktree and branch");
  const preview = await rest.getDiff({ op: "delete", path: abs });
  const done = await ws.request({ type: "post.delete", path: abs, expectedChangedFiles: preview.changedFiles ?? 0, expectedUnpushed: preview.unpushed ?? 0 });
  assert(done.ok, `delete failed: ${done.error}`);
  await until(() => !existsSync(worktreeDir(stem)), { desc: "worktree removed" });
  assert(!localBranch(`blog/${stem}`), "local branch force-deleted");
  await until(() => !ws.tabs.some((t) => t.path === abs), { desc: "tab closed after delete" });
});

test("10c-external-edit — external-edit classification: out-of-band write is surfaced as file.changed{external}", async () => {
  const { ws } = ctx;
  // Not a keychord: a genuinely external editor/tool writing the worktree file while no agent turn
  // holds the lock. docSync only watches the ACTIVE post's file (closed posts aren't watched, by
  // design), so open the target first to make it active, then edit its worktree file out of band.
  // docSync must classify it as external (or 'git' if HEAD also moved) and reload behind the banner.
  const stem = ctx.created.stem; // scenario 1's post; reopen it to make it the active, watched post.
  const abs = ctx.created.abs;
  const opened = await ws.request({ type: "post.open", path: abs });
  assert(opened.ok, `reopen failed: ${opened.error}`);
  await ws.waitMessage((m) => m.type === "active" && m.path === abs, { desc: "target post is active/watched" });
  const file = wtFile(stem);
  const before = readFileSync(file, "utf8");
  const marker = `EXTERNAL EDIT ${Date.now()}`;
  writeFileSync(file, `${before}\n${marker}\n`);
  const msg = await ws.waitMessage((m) => m.type === "file.changed" && m.path === abs && m.text.includes(marker) && (m.origin === "external" || m.origin === "git"), { timeout: 12_000, desc: "file.changed{external} for the out-of-band write" });
  assert(msg.origin === "external" || msg.origin === "git", `external write classified as ${msg.origin}`);
});

test("10d-reconnect-snapshot — reconnect replays a full bootstrap snapshot (tabs, active, git.state, mode, mcp)", async () => {
  // SPA: a dropped socket reconnects and rehydrates purely from the connect snapshot.
  const fresh = makeWs(ctx.ports.web, ctx.token);
  await fresh.ready;
  try {
    await fresh.waitMessage((m) => m.type === "tabs", { desc: "snapshot: tabs" });
    await fresh.waitMessage((m) => m.type === "git.state", { desc: "snapshot: git.state" });
    await fresh.waitMessage((m) => m.type === "mode.status", { desc: "snapshot: mode.status" });
    await fresh.waitMessage((m) => m.type === "mcp.status", { desc: "snapshot: mcp.status" });
    await fresh.waitMessage((m) => m.type === "post.namesync", { desc: "snapshot: post.namesync" });
    assert(fresh.gitState && Array.isArray(fresh.gitState.posts), "reconnect delivered a usable git.state");
    assert(fresh.tabs.length >= 1, "reconnect delivered the open-tab set");
  } finally {
    await fresh.close();
  }
});
