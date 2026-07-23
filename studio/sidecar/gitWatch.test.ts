// Confirms the adapter actually delegates to git-live (repoRoot flows through, methods aren't
// no-ops); the doorbell mechanics themselves are covered by studio/git-live/gitLive.test.ts.

import { afterEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createGitWatch } from "./gitWatch";
import type { GitWatcher } from "../shared/seams";

function git(args: string[], cwd: string): void {
  execFileSync("git", args, { cwd });
}

async function makeRepo(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "gitwatch-"));
  git(["init", "-q", "-b", "main"], dir);
  git(["config", "user.email", "test@example.com"], dir);
  git(["config", "user.name", "Test"], dir);
  await writeFile(path.join(dir, "file.txt"), "one\n");
  git(["add", "."], dir);
  git(["commit", "-q", "-m", "init"], dir);
  return dir;
}

/** Poll until `pred` holds or the deadline passes (fs-watch events are inherently async). */
async function waitFor(pred: () => boolean, ms = 3000): Promise<void> {
  const start = Date.now();
  while (!pred()) {
    if (Date.now() - start > ms) throw new Error("waitFor timed out");
    await new Promise((r) => setTimeout(r, 20));
  }
}

describe("createGitWatch", () => {
  let repo: string | undefined;
  let watcher: GitWatcher;

  afterEach(async () => {
    await watcher.close();
    // repo is unset if makeRepo() threw before assigning it; rm(undefined) would mask that
    // real failure behind a TypeError.
    if (repo) await rm(repo, { recursive: true, force: true });
  });

  it("delegates to git-live: poke() rings a registered listener", async () => {
    repo = await makeRepo();
    watcher = createGitWatch(repo);
    const onChange = vi.fn();
    watcher.onChange(onChange);

    watcher.poke();
    await waitFor(() => onChange.mock.calls.length > 0);
    expect(onChange).toHaveBeenCalled();
  });
});
