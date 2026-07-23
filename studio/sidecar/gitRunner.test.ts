// Confirms every invocation carries GIT_OPTIONAL_LOCKS=0 (see the module comment on gitRunner.ts
// for why: a read-only status/rev-parse would otherwise rewrite a worktree's index and re-ring
// the git-live doorbell), without dropping the rest of the process env (e.g. PATH) it's merged over.

import { afterEach, describe, expect, it, vi } from "vitest";
import { execFile } from "node:child_process";

import { createGitRunner } from "./gitRunner";

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
