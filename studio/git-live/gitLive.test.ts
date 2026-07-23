// Exercises the doorbell against a real chokidar watch over a temp git repo and a linked
// worktree, the way it actually runs in the sidecar: no ref parsing of our own, only observing
// which paths under the common `.git` dir move. The debounce/max-wait mechanics are exercised
// separately through `poke()` under fake timers, since they're pure timing logic independent of
// chokidar.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile, appendFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createGitLive, type GitLive } from "./gitLive";
import { resolveCommonGitDir } from "./resolveCommonGitDir";

function git(args: string[], cwd: string): void {
  execFileSync("git", args, { cwd });
}

/** A throwaway repo with one commit on `main`, ready for branch/worktree operations. */
async function makeRepo(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "git-live-"));
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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

describe("resolveCommonGitDir", () => {
  let repo: string;
  let worktreeDir: string;

  afterEach(async () => {
    await rm(worktreeDir, { recursive: true, force: true });
    await rm(repo, { recursive: true, force: true });
  });

  it("resolves the same common dir from the main worktree and a linked worktree", async () => {
    repo = await makeRepo();
    worktreeDir = path.join(tmpdir(), `git-live-wt-${Date.now()}`);
    git(["worktree", "add", "-q", "-b", "feature", worktreeDir], repo);

    const fromMain = resolveCommonGitDir(repo);
    const fromWorktree = resolveCommonGitDir(worktreeDir);
    expect(fromWorktree).toBe(fromMain);
    expect(fromMain.endsWith(`${path.sep}.git`)).toBe(true);
  });
});

describe("createGitLive — fired vs ignored paths", () => {
  let repo: string;
  let live: GitLive;

  afterEach(async () => {
    await live.close();
    await rm(repo, { recursive: true, force: true });
  });

  async function setup(): Promise<{ gitCommonDir: string; onChange: ReturnType<typeof vi.fn> }> {
    repo = await makeRepo();
    const gitCommonDir = resolveCommonGitDir(repo);
    live = createGitLive({ repoRoot: repo, gitCommonDir, debounceMs: 20, maxWaitMs: 100 });
    const onChange = vi.fn();
    live.onChange(onChange);
    // Let the initial chokidar scan settle before making the change under test.
    await sleep(150);
    return { gitCommonDir, onChange };
  }

  it("fires when HEAD's own content changes (a detached checkout, no ref touched)", async () => {
    const { onChange } = await setup();
    git(["checkout", "-q", "--detach"], repo);
    await waitFor(() => onChange.mock.calls.length > 0);
  });

  it("fires when packed-refs is (re)written", async () => {
    const { onChange } = await setup();
    git(["pack-refs", "--all"], repo);
    await waitFor(() => onChange.mock.calls.length > 0);
  });

  it("fires on a loose ref create and its later unlink", async () => {
    const { onChange } = await setup();
    git(["branch", "feature"], repo);
    await waitFor(() => onChange.mock.calls.length > 0);
    onChange.mockClear();

    git(["branch", "-D", "feature"], repo);
    await waitFor(() => onChange.mock.calls.length > 0);
  });

  it("fires when a linked worktree's HEAD is created", async () => {
    const { onChange } = await setup();
    const worktreeDir = path.join(tmpdir(), `git-live-wt-${Date.now()}`);
    try {
      git(["worktree", "add", "-q", "-b", "feature", worktreeDir], repo);
      await waitFor(() => onChange.mock.calls.length > 0);
    } finally {
      await rm(worktreeDir, { recursive: true, force: true });
    }
  });

  it("ignores a loose object write", async () => {
    const { gitCommonDir, onChange } = await setup();
    await mkdir(path.join(gitCommonDir, "objects", "ab"), { recursive: true });
    await writeFile(path.join(gitCommonDir, "objects", "ab", "cdef"), "not a real object");
    await sleep(200);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores a reflog append", async () => {
    const { gitCommonDir, onChange } = await setup();
    await appendFile(path.join(gitCommonDir, "logs", "HEAD"), "extra reflog line\n");
    await sleep(200);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores a ref lock file", async () => {
    const { gitCommonDir, onChange } = await setup();
    await writeFile(path.join(gitCommonDir, "HEAD.lock"), "");
    await sleep(200);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("createGitLive — no self-trigger on an index writeback", () => {
  let repo: string;
  let worktreeDir: string;
  let live: GitLive;

  afterEach(async () => {
    await live.close();
    await rm(worktreeDir, { recursive: true, force: true });
    await rm(repo, { recursive: true, force: true });
  });

  it("does not fire when git status rewrites a worktree's index", async () => {
    repo = await makeRepo();
    worktreeDir = path.join(tmpdir(), `git-live-wt-${Date.now()}`);
    git(["worktree", "add", "-q", "-b", "feature", worktreeDir], repo);

    live = createGitLive({ repoRoot: repo, debounceMs: 20, maxWaitMs: 100 });
    const onChange = vi.fn();
    live.onChange(onChange);
    await sleep(150);
    onChange.mockClear();

    // Fresh mtime forces git to actually refresh the stat cache, not just no-op. No
    // GIT_OPTIONAL_LOCKS override here either, so this is the worst case for a self-trigger.
    await writeFile(path.join(worktreeDir, "file.txt"), "one\n");
    git(["status"], worktreeDir);
    await sleep(200);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("createGitLive — poke() and debounce", () => {
  let repo: string;
  let live: GitLive;
  let time: number;
  const now = () => time;

  beforeEach(async () => {
    repo = await makeRepo();
    time = 0;
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await live.close();
    vi.useRealTimers();
    await rm(repo, { recursive: true, force: true });
  });

  function advance(ms: number): void {
    time += ms;
    vi.advanceTimersByTime(ms);
  }

  it("rings the doorbell after the debounce window", () => {
    live = createGitLive({ repoRoot: repo, debounceMs: 100, maxWaitMs: 1000, now });
    const onChange = vi.fn();
    live.onChange(onChange);

    live.poke();
    advance(99);
    expect(onChange).not.toHaveBeenCalled();
    advance(1);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("coalesces a burst into a single trailing fire", () => {
    live = createGitLive({ repoRoot: repo, debounceMs: 100, maxWaitMs: 1000, now });
    const onChange = vi.fn();
    live.onChange(onChange);

    live.poke();
    advance(50);
    live.poke(); // resets the trailing window
    advance(50);
    expect(onChange).not.toHaveBeenCalled();
    advance(50);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("still fires by maxWaitMs under a continuous stream", () => {
    live = createGitLive({ repoRoot: repo, debounceMs: 100, maxWaitMs: 300, now });
    const onChange = vi.fn();
    live.onChange(onChange);

    for (let i = 0; i < 5; i++) {
      live.poke();
      advance(80); // always under debounceMs, so trailing quiescence alone would never fire
    }
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("stops notifying a listener once unsubscribed", () => {
    live = createGitLive({ repoRoot: repo, debounceMs: 50, maxWaitMs: 500, now });
    const onChange = vi.fn();
    const unsubscribe = live.onChange(onChange);
    unsubscribe();

    live.poke();
    advance(50);
    expect(onChange).not.toHaveBeenCalled();
  });
});
