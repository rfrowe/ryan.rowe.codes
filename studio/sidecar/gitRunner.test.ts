// Confirms every invocation carries GIT_OPTIONAL_LOCKS=0 (see the module comment on gitRunner.ts
// for why: a read-only status/rev-parse would otherwise rewrite a worktree's index and re-ring
// the git-live doorbell), without dropping the rest of the process env (e.g. PATH) it's merged over.

import { afterEach, describe, expect, it, vi } from "vitest";
import { execFile, type ExecFileException } from "node:child_process";

import { createGitRunner } from "./gitRunner";

type ExecFileCallback = (error: ExecFileException | null, stdout: string, stderr: string) => void;

vi.mock("node:child_process", () => ({
  execFile: vi.fn(
    (
      _bin: string,
      _args: string[],
      _opts: unknown,
      cb: (error: Error | null, stdout: string, stderr: string) => void,
    ) => cb(null, "", ""),
  ),
}));

const mockedExecFile = vi.mocked(execFile);

/** execFile's real signature is a pile of overloads (buffer vs. string encoding, optional args/
 *  options/callback); casting through `unknown` here is simpler than reproducing all of them just
 *  to hand a mock its callback. */
function mockExecFileImpl(handler: (cb: ExecFileCallback) => void): typeof execFile {
  return ((...args: unknown[]) => {
    handler(args[3] as ExecFileCallback);
  }) as unknown as typeof execFile;
}

describe("createGitRunner", () => {
  afterEach(() => {
    mockedExecFile.mockClear();
  });

  it("sets GIT_OPTIONAL_LOCKS=0 on every invocation, preserving the rest of the env", async () => {
    const runner = createGitRunner();
    await runner.git(["status"]);
    await runner.gh(["pr", "view"]);

    expect(mockedExecFile.mock.calls).toHaveLength(2);
    for (const call of mockedExecFile.mock.calls) {
      const opts = call[2] as { env?: NodeJS.ProcessEnv };
      expect(opts.env?.GIT_OPTIONAL_LOCKS).toBe("0");
      expect(opts.env?.PATH).toBe(process.env.PATH);
    }
  });
});

/** A spawn ENOENT (the worktree cwd not there yet), matching what execFile's callback carries when
 *  the child never even started -- distinct from a real git exit, which carries a numeric code. */
function spawnEnoent(): ExecFileException {
  const err = new Error("spawn git ENOENT") as ExecFileException;
  err.code = "ENOENT";
  return err;
}

describe("createGitRunner spawn-ENOENT retry", () => {
  afterEach(() => {
    mockedExecFile.mockClear();
    mockedExecFile.mockImplementation(mockExecFileImpl((cb) => cb(null, "", "")));
  });

  it("recovers once a retry lands after the worktree becomes visible", async () => {
    mockedExecFile
      .mockImplementationOnce(mockExecFileImpl((cb) => cb(spawnEnoent(), "", "")))
      .mockImplementationOnce(mockExecFileImpl((cb) => cb(spawnEnoent(), "", "")))
      .mockImplementationOnce(mockExecFileImpl((cb) => cb(null, "abc123\n", "")));

    const runner = createGitRunner();
    const result = await runner.git(["rev-parse", "HEAD"], { cwd: "/tmp/some-worktree" });

    expect(result).toEqual({ stdout: "abc123\n", stderr: "", code: 0 });
    expect(mockedExecFile).toHaveBeenCalledTimes(3);
  });

  it("gives up after exhausting the bounded retries, rejecting with the spawn failure", async () => {
    mockedExecFile.mockImplementation(mockExecFileImpl((cb) => cb(spawnEnoent(), "", "")));

    const runner = createGitRunner();
    await expect(runner.git(["rev-parse", "HEAD"], { cwd: "/tmp/some-worktree" })).rejects.toMatchObject({
      code: "ENOENT",
    });
    // The initial attempt plus every bounded retry, no more.
    expect(mockedExecFile).toHaveBeenCalledTimes(4);
  });
});
