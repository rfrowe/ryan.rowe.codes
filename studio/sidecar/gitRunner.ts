// Concrete GitRunner. Runs `git`/`gh` via node:child_process execFile: no shell,
// so args are passed verbatim (no quoting/injection surface). Each call has a hard
// timeout (default 30s); a timeout rejects, a normal non-zero exit resolves with the
// code so callers can inspect stderr (git/gh use non-zero for expected cases, e.g.
// `rev-parse --verify` on a missing ref).

import { execFile } from "node:child_process";

import type { GitRunner, RunResult } from "../shared/seams";

const DEFAULT_TIMEOUT_MS = 30_000;
// Diffs and logs can be large; keep the buffer well above execFile's 1 MB default.
const MAX_BUFFER = 64 * 1024 * 1024;

interface RunOpts {
  cwd?: string;
  timeoutMs?: number;
}

function run(bin: "git" | "gh", args: readonly string[], opts: RunOpts): Promise<RunResult> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  return new Promise<RunResult>((resolve, reject) => {
    execFile(
      bin,
      [...args],
      { cwd: opts.cwd, timeout: timeoutMs, maxBuffer: MAX_BUFFER },
      (error, stdout, stderr) => {
        if (error) {
          const err = error as NodeJS.ErrnoException & { killed?: boolean; signal?: string };
          if (err.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER") {
            reject(new Error(`${bin} ${args.join(" ")} produced more than ${MAX_BUFFER} bytes of output`));
            return;
          }
          // Killed by the timeout (SIGTERM): surface as a rejection, per the contract.
          if (err.killed) {
            reject(new Error(`${bin} ${args.join(" ")} timed out after ${timeoutMs}ms`));
            return;
          }
          // A real command that exited non-zero carries a numeric code, so resolve and let the
          // caller branch on code/stderr rather than catch.
          if (typeof err.code === "number") {
            resolve({ stdout, stderr, code: err.code });
            return;
          }
          // Spawn failure (e.g. ENOENT: the binary is not installed); no result to give.
          reject(error);
          return;
        }
        resolve({ stdout, stderr, code: 0 });
      },
    );
  });
}

/**
 * Build a GitRunner. Optional `defaults` (cwd / timeoutMs) are merged under each
 * call's own opts, so a caller can pin the repo root once and still override per call.
 */
export function createGitRunner(defaults: RunOpts = {}): GitRunner {
  return {
    git: (args, opts) => run("git", args, { ...defaults, ...opts }),
    gh: (args, opts) => run("gh", args, { ...defaults, ...opts }),
  };
}
