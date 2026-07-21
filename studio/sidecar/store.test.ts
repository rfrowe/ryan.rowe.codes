// Focused store tests: the SelfWriteGuard multiset the file watcher relies on, and the preview
// derivation on open. Zero live processes: an in-memory Fs fake and a fake GitRunner (mirroring
// worktree side effects into that Fs) drive the store.

import { describe, expect, it } from "vitest";

import type { Fs, GitRunner, RunResult } from "../shared/seams";
import { SelfWriteGuard, createStore } from "../state/store";

const REPO = "/repo";
const BLOG = `${REPO}/src/content/blog`;
const WT = `${REPO}/.worktrees/blog`;
const CANON = `${BLOG}/2026-07-10_aligning-a-skyline.mdx`;
// Worktrees key on the full date-qualified stem (<YYYY-MM-DD>_<slug>), not the bare slug.
const WT_FILE = `${WT}/2026-07-10_aligning-a-skyline/src/content/blog/2026-07-10_aligning-a-skyline.mdx`;

const VALID_DOC = [
  "---",
  "title: Aligning a Skyline",
  "slug: aligning-a-skyline",
  "headline: on straight lines",
  "created_at: 2026-07-10",
  "---",
  "",
  "Body text.",
  "",
].join("\n");

const ok: RunResult = { stdout: "", stderr: "", code: 0 };

interface FakeFs extends Fs {
  store: Map<string, string>;
}

function makeFs(seed: Record<string, string> = {}): FakeFs {
  const store = new Map(Object.entries(seed));
  return {
    store,
    async readFile(p) {
      const v = store.get(p);
      if (v === undefined) throw new Error(`ENOENT: ${p}`);
      return v;
    },
    async writeFile(p, data) {
      store.set(p, data);
    },
    async exists(p) {
      return store.has(p);
    },
  };
}

function makeGit(fs: FakeFs): GitRunner {
  return {
    async git(args) {
      if (args[0] === "worktree" && args[1] === "add") {
        fs.store.set(`${args[2]}/.git`, "gitdir");
        return ok;
      }
      if (args[0] === "rev-parse" && args.includes("--verify")) return { ...ok, code: 1 };
      return ok;
    },
    async gh() {
      return { ...ok, stdout: "main\n" };
    },
  };
}

function newStore(seed: Record<string, string> = { [WT_FILE]: VALID_DOC }) {
  const fs = makeFs(seed);
  const store = createStore({
    fs,
    git: makeGit(fs),
    repoRoot: REPO,
    sessionBranch: "main",
    defaultBranch: "main",
    prepareWorktree: async () => {},
  });
  return { fs, store };
}

describe("store.openPost preview", () => {
  it("derives a valid preview URL from frontmatter after opening", async () => {
    const { store } = newStore();
    await store.openPost(CANON);
    expect(store.getPreview()).toEqual({ valid: true, url: "http://localhost:4321/blog/2026-07-10/aligning-a-skyline" });
  });
});

describe("SelfWriteGuard", () => {
  it("consumes a matching hash once and returns its origin", () => {
    const guard = new SelfWriteGuard();
    guard.expect("h1", "agent");
    guard.expect("h1", "self");
    expect(guard.consume("h1")).toBe("agent");
    expect(guard.consume("h1")).toBe("self");
    expect(guard.consume("h1")).toBeNull();
  });

  it("peeks a pending hash without consuming it", () => {
    const guard = new SelfWriteGuard();
    guard.expect("h1", "self");
    expect(guard.has("h1")).toBe(true);
    expect(guard.has("h1")).toBe(true); // non-destructive
    expect(guard.has("mystery")).toBe(false);
    expect(guard.consume("h1")).toBe("self");
    expect(guard.has("h1")).toBe(false);
  });

  it("returns null for an unknown (external) hash", () => {
    const guard = new SelfWriteGuard();
    expect(guard.consume("mystery")).toBeNull();
  });
});
