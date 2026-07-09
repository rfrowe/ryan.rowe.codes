import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..");

async function isUp(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return res.ok || res.status === 404;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isUp(url)) return true;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  return false;
}

/**
 * Spawns `astro preview` against the already-built `dist/` (Phase 6/7 already verified
 * `npm run build` is green -- this script doesn't rebuild, so a stale `dist/` reflects a
 * stale build, not a verification bug) and waits for it to accept connections. Returns a
 * handle whose `stop()` tears the process down -- callers must call it before exiting so
 * no server is left running.
 */
export async function startPreviewServer({ port = 4321, timeoutMs = 20000 } = {}) {
  const distIndex = path.join(repoRoot, "dist", "index.html");
  if (!existsSync(distIndex)) {
    throw new Error(`dist/index.html not found at ${distIndex} -- run "npm run build" first.`);
  }

  const child = spawn("npx", ["astro", "preview", "--port", String(port), "--host", "127.0.0.1"], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderr = "";
  child.stderr.on("data", chunk => {
    stderr += chunk.toString();
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  const up = await waitForServer(baseUrl, timeoutMs);
  if (!up) {
    child.kill();
    throw new Error(`astro preview did not become ready on ${baseUrl} within ${timeoutMs}ms.\n${stderr}`);
  }

  return {
    baseUrl,
    stop: () =>
      new Promise(resolve => {
        child.once("exit", resolve);
        child.kill();
      }),
  };
}
