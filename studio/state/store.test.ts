// The multi-doc / worktree store: opening a post ensures its git worktree and loads the file
// from it; create/close/switch/rename maintain the open-tab set and the single active doc; the
// editor autosave path keeps its rev-guard and disk-divergence protection. A fake Fs stands in for
// disk and a fake GitRunner records worktree/branch commands (and mirrors their filesystem
// effect into the fake Fs), so the store is exercised end-to-end without git or a real disk.

import { describe, expect, it } from "vitest";

import type { ServerMessage } from "../shared/protocol";
import type { Fs, GitRunner, RunResult } from "../shared/seams";
import { deriveUrl } from "../preview/deriveUrl";
import { sha256Hex } from "../sidecar/hash";
import { createStore, type ActiveChangeInfo } from "./store";

const REPO = "/repo";
const BLOG = `${REPO}/src/content/blog`;
const WT = `${REPO}/.claude/worktrees/blog`;

// Worktrees are keyed by the full date-qualified filename stem (<YYYY-MM-DD>_<slug>), so
// same-slug/different-date posts never collide. See `postStem` in store.ts.
const SKYLINE_CANON = `${BLOG}/2026-07-10_aligning-a-skyline.mdx`;
const SKYLINE_WT_FILE = `${WT}/2026-07-10_aligning-a-skyline/src/content/blog/2026-07-10_aligning-a-skyline.mdx`;
const HELLO_CANON = `${BLOG}/2022-03-11_hello.mdx`;
const HELLO_WT_FILE = `${WT}/2022-03-11_hello/src/content/blog/2022-03-11_hello.mdx`;

function doc(title: string, slug: string, createdAt = "2026-07-10", body = "Body text."): string {
  return ["---", `title: ${title}`, `slug: ${slug}`, "headline: on straight lines", `created_at: ${createdAt}`, "---", "", body, ""].join("\n");
}
const SKYLINE = doc("Aligning a Skyline", "aligning-a-skyline");
const HELLO = doc("Hello", "hello", "2022-03-11");

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

/** Move every fake-fs entry under `from` (a file or a dir prefix) to `to`. */
function movePrefix(fs: FakeFs, from: string, to: string): void {
  for (const key of [...fs.store.keys()]) {
    if (key === from) {
      fs.store.set(to, fs.store.get(key)!);
      fs.store.delete(key);
    } else if (key.startsWith(`${from}/`)) {
      fs.store.set(to + key.slice(from.length), fs.store.get(key)!);
      fs.store.delete(key);
    }
  }
}

interface Recorded {
  bin: "git" | "gh";
  line: string;
}

/** Configurable responses for the loss-preview / revert git commands (defaults model a clean tree). */
interface GitConfig {
  /** `git status --porcelain` output (uncommitted files); empty = clean. */
  statusPorcelain?: string;
  /** `git rev-list --count origin/<base>..HEAD` output (unmerged commits); default "0". */
  revListCount?: string;
  /** `git diff HEAD --name-only` output (revert-tracked file names); empty = none. */
  diffHeadNames?: string;
  /** `git diff HEAD` output (the diff revert discards); empty = nothing. */
  diffHead?: string;
  /** `git diff origin/<base>` output (delete's tracked delta from the base); empty = nothing. */
  diffBase?: string;
  /** `git diff --no-index -- /dev/null <path>` output (an untracked file's synthesized add-diff). */
  noIndexDiff?: string;
  /** Content `git checkout HEAD -- <path>` writes back to the file (simulates restoring to HEAD). */
  checkoutTo?: string;
  /** `git ls-files --error-unmatch` reports the post as untracked (a brand-new, never-committed post). */
  untracked?: boolean;
  /** `git rev-parse --verify --quiet refs/heads/<branch>` exits 0 (branch exists) instead of the default 1. */
  branchExists?: boolean;
  /**
   * Files a fresh `git worktree add` (fork off origin) "checks out": written into the fake fs as
   * part of handling `worktree add`, simulating that the branch's tracked content lands on disk,
   * something a real `git worktree add` does but this fake otherwise doesn't model, since it only
   * ever registers the `.git` link. Needed when a test's fake-fs setup can't just pre-seed the file
   * (e.g. a self-heal test that removes the whole worktree dir, including any pre-seeded file, right
   * before the add runs).
   */
  originFiles?: Record<string, string>;
}

function makeGit(fs: FakeFs, cfg: GitConfig = {}): { git: GitRunner; lines: () => string[] } {
  const calls: Recorded[] = [];
  const git: GitRunner = {
    async git(args, opts) {
      calls.push({ bin: "git", line: args.join(" ") });
      if (args[0] === "worktree" && args[1] === "list") {
        // Synthesize porcelain output from every worktree the fake fs currently knows about (each
        // has a `<root>/.git` link), plus the main worktree (REPO). Real `git worktree list`
        // always lists it first; the store filters it out by path since it isn't under
        // `worktreesRoot`. Blocks are separated by a blank line, matching real porcelain output.
        const roots = [...fs.store.keys()]
          .filter((k) => k.endsWith("/.git"))
          .map((k) => k.slice(0, -"/.git".length))
          .filter((root) => root !== REPO);
        const allRoots = [REPO, ...roots];
        const blocks = allRoots.map((root) => {
          const branch = root === REPO ? "main" : `blog/${root.split("/").pop()}`;
          return `worktree ${root}\nHEAD 0000000000000000000000000000000000000000\nbranch refs/heads/${branch}\n`;
        });
        return { ...ok, stdout: blocks.join("\n") };
      }
      if (args[0] === "worktree" && args[1] === "add") {
        // Simulate the fork: register the worktree's .git link. Existing-post tests seed the
        // worktree file separately (the fork "already has" it), or, when a test can't pre-seed it
        // (e.g. the whole dir was just wiped by a husk self-heal), via `cfg.originFiles`.
        fs.store.set(`${args[2]}/.git`, "gitdir");
        for (const [p, content] of Object.entries(cfg.originFiles ?? {})) fs.store.set(p, content);
        return ok;
      }
      if (args[0] === "worktree" && args[1] === "move") {
        movePrefix(fs, args[2], args[3]);
        return ok;
      }
      if (args[0] === "worktree" && args[1] === "remove") {
        // `remove [--force] <path>`: drop the .git link and every fake-fs entry under the worktree.
        const wt = args[args.length - 1];
        fs.store.delete(`${wt}/.git`);
        for (const key of [...fs.store.keys()]) if (key === wt || key.startsWith(`${wt}/`)) fs.store.delete(key);
        return ok;
      }
      if (args[0] === "branch" && args[1] === "-D") return ok;
      if (args[0] === "rev-parse" && args.includes("--verify")) return { ...ok, code: cfg.branchExists ? 0 : 1 };
      if (args.includes("ls-files")) return { ...ok, code: cfg.untracked ? 1 : 0 };
      if (args.includes("mv")) {
        const from = args[args.length - 2];
        const to = args[args.length - 1];
        movePrefix(fs, from, to);
        return ok;
      }
      if (args[0] === "status" || (args.includes("status") && args.includes("--porcelain"))) {
        return { ...ok, stdout: cfg.statusPorcelain ?? "" };
      }
      if (args[0] === "rev-list") return { ...ok, stdout: cfg.revListCount ?? "0" };
      if (args.includes("diff")) {
        // The store prefixes some diffs with `-c core.quotePath=false`, so match on membership.
        if (args.includes("--no-index")) return { ...ok, stdout: cfg.noIndexDiff ?? "" };
        if (args.includes("HEAD")) {
          return { ...ok, stdout: args.includes("--name-only") ? (cfg.diffHeadNames ?? "") : (cfg.diffHead ?? "") };
        }
        return { ...ok, stdout: cfg.diffBase ?? "" };
      }
      if (args[0] === "checkout" && args[1] === "HEAD") {
        // Restore the pathspec to its "committed" content at <cwd>/<pathspec>.
        if (cfg.checkoutTo !== undefined) {
          const pathspec = args[args.length - 1];
          fs.store.set(`${opts?.cwd ?? ""}/${pathspec}`, cfg.checkoutTo);
        }
        return ok;
      }
      return ok;
    },
    async gh(args) {
      calls.push({ bin: "gh", line: args.join(" ") });
      if (args.join(" ").includes("repo view")) return { ...ok, stdout: "main\n" };
      return ok;
    },
  };
  return { git, lines: () => calls.map((c) => `${c.bin} ${c.line}`) };
}

function newStore(seed: Record<string, string> = {}, cfg: GitConfig = {}) {
  const fs = makeFs(seed);
  const { git, lines } = makeGit(fs, cfg);
  // Records which worktrees stopPreview was asked to stop, plus a snapshot of the git commands
  // issued at that instant, so tests can assert stopPreview ran before the worktree was removed
  // (the astro-teardown ordering contract: never remove a dir a daemon is still serving).
  const stopPreviewFor: string[] = [];
  let linesAtStopPreview: string[] = [];
  // Records every path `removePath` (the husk self-heal seam) was asked to remove, and mirrors the
  // effect into the fake fs, deleting the exact key plus everything nested under it, the same way
  // the fake `worktree remove` handler above does.
  const removed: string[] = [];
  const store = createStore({
    fs,
    git,
    repoRoot: REPO,
    defaultBranch: "main",
    prepareWorktree: async () => {},
    movePath: async (from, to) => movePrefix(fs, from, to),
    stopPreview: async (worktreePath) => {
      stopPreviewFor.push(worktreePath);
      linesAtStopPreview = lines();
    },
    removePath: async (p) => {
      removed.push(p);
      for (const key of [...fs.store.keys()]) if (key === p || key.startsWith(`${p}/`)) fs.store.delete(key);
    },
  });
  const messages: ServerMessage[] = [];
  const activations: ActiveChangeInfo[] = [];
  store.subscribe((m) => messages.push(m));
  store.onActiveChange((i) => activations.push(i));
  return {
    fs,
    store,
    git,
    lines,
    messages,
    activations,
    stopPreviewFor,
    linesAtStopPreview: () => linesAtStopPreview,
    removedPaths: () => [...removed],
  };
}

describe("store.openPost (existing post)", () => {
  it("ensures a worktree off origin/default, loads the file, and announces the switch", async () => {
    const { store, lines, messages, activations } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    const active = await store.openPost(SKYLINE_CANON);

    expect(active).toEqual({ path: SKYLINE_CANON, text: SKYLINE, rev: { n: 1, hash: sha256Hex(SKYLINE) } });
    // A fresh worktree is added off origin/main on branch blog/<stem>.
    expect(lines()).toContain("git worktree add /repo/.claude/worktrees/blog/2026-07-10_aligning-a-skyline -b blog/2026-07-10_aligning-a-skyline origin/main");

    expect(messages.some((m) => m.type === "file.changed" && m.origin === "external" && m.path === SKYLINE_CANON)).toBe(true);
    expect(messages.some((m) => m.type === "active" && m.path === SKYLINE_CANON && m.title === "Aligning a Skyline")).toBe(true);
    expect(messages.some((m) => m.type === "tabs" && m.open.length === 1 && m.open[0].path === SKYLINE_CANON)).toBe(true);
    expect(messages.some((m) => m.type === "preview.url" && m.preview.valid)).toBe(true);
    // onActiveChange carries the worktree paths the watcher and astro manager need.
    expect(activations.at(-1)).toEqual({
      canonicalPath: SKYLINE_CANON,
      worktreePath: `${WT}/2026-07-10_aligning-a-skyline`,
      worktreeFilePath: SKYLINE_WT_FILE,
    });
  });

  it("emits tabs + active BEFORE the doc buffer, so the client has a tab to route file.changed to", async () => {
    const { store, messages } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    const order = messages.map((m) => m.type);
    const tabsAt = order.indexOf("tabs");
    const activeAt = order.indexOf("active");
    const fileAt = order.indexOf("file.changed");
    expect(tabsAt).toBeGreaterThanOrEqual(0);
    expect(tabsAt).toBeLessThan(fileAt);
    expect(activeAt).toBeLessThan(fileAt);
  });

  it("reuses an existing worktree (dir already has .git) rather than re-adding it", async () => {
    const { store, lines, removedPaths } = newStore({
      [`${WT}/2026-07-10_aligning-a-skyline/.git`]: "gitdir",
      [SKYLINE_WT_FILE]: SKYLINE,
    });
    await store.openPost(SKYLINE_CANON);
    expect(lines().some((l) => l.startsWith("git worktree add"))).toBe(false);
    // A valid `.git` means this isn't a husk: the self-heal path never runs.
    expect(removedPaths()).toEqual([]);
  });

  it("rejects a path outside the blog content root", async () => {
    const { store } = newStore();
    await expect(store.openPost(`${REPO}/etc/passwd`)).rejects.toThrow(/blog content root/);
  });

  it("throws a clear error when the post is not present in its worktree (not on origin/default)", async () => {
    const { store } = newStore(); // nothing seeded → the worktree fork lacks the file
    await expect(store.openPost(SKYLINE_CANON)).rejects.toThrow(/not found in its worktree/);
  });
});

describe("ensureWorktree self-heals a leftover (husk) directory", () => {
  // A husk: the dir exists (e.g. `.astro/` regenerated by an orphaned, detached Astro daemon after a
  // hard kill) but has no `.git` link, so the "reuse" check is skipped and ensureWorktree's normal
  // add path runs, and would otherwise fail, since git refuses to `worktree add` onto a non-empty
  // existing dir (even with --force).
  const WTP = `${WT}/2026-07-10_aligning-a-skyline`;
  const BRANCH = "blog/2026-07-10_aligning-a-skyline";

  it("adopts the branch in place when it already exists: clears only the regenerable cruft, never the whole dir", async () => {
    const { store, lines, removedPaths } = newStore(
      {
        // `[WTP]` itself is a marker: the fake fs models files only (no bare directory keys), so an
        // explicit entry at the worktree root stands in for "this directory already exists on disk"
        // (what a real `fs.exists`/`access` would report for a husk directory).
        [WTP]: "dir",
        [SKYLINE_WT_FILE]: SKYLINE,
        [`${WTP}/.astro`]: "cache",
        [`${WTP}/node_modules`]: "symlink",
      },
      { branchExists: true },
    );
    await store.openPost(SKYLINE_CANON);

    expect(removedPaths()).toEqual(expect.arrayContaining([`${WTP}/.astro`, `${WTP}/node_modules`]));
    expect(removedPaths()).not.toContain(WTP);
    // The branch exists, so no `-b`: git worktree add just registers the existing branch.
    expect(lines()).toContain(`git worktree add ${WTP} ${BRANCH}`);
  });

  it("removes the whole dir and re-forks from origin when there is no branch to adopt", async () => {
    const { store, lines, removedPaths } = newStore(
      { [WTP]: "dir", [`${WTP}/.astro`]: "cache" },
      // The husk's own directory has no tracked post content (there's no branch, so nothing was ever
      // checked out there); `originFiles` stands in for the fresh fork's checkout.
      { originFiles: { [SKYLINE_WT_FILE]: SKYLINE } },
    );
    await store.openPost(SKYLINE_CANON);

    expect(removedPaths()).toContain(WTP);
    expect(lines()).toContain(`git worktree add ${WTP} -b ${BRANCH} origin/main`);
  });
});

describe("store.createPost", () => {
  const INPUT = { title: "Aligning a Skyline", slug: "aligning-a-skyline", headline: "on straight lines", created_at: "2026-07-10" };

  it("writes valid frontmatter into the post's worktree and makes it active", async () => {
    const { store, fs, messages, activations } = newStore();
    const result = await store.createPost(INPUT);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.path).toBe(SKYLINE_CANON);
    const written = fs.store.get(SKYLINE_WT_FILE);
    expect(written).toBeDefined();
    const derived = deriveUrl(written!);
    expect(derived.valid && derived.url).toBe("http://localhost:4321/blog/2026-07-10/aligning-a-skyline");
    expect(result.url).toBe("http://localhost:4321/blog/2026-07-10/aligning-a-skyline");

    expect(messages.some((m) => m.type === "file.changed" && m.path === SKYLINE_CANON && m.origin === "external")).toBe(true);
    expect(messages.some((m) => m.type === "active" && m.path === SKYLINE_CANON && m.title === INPUT.title)).toBe(true);
    expect(messages.some((m) => m.type === "tabs" && m.open.some((t) => t.path === SKYLINE_CANON))).toBe(true);
    expect(activations.at(-1)?.canonicalPath).toBe(SKYLINE_CANON);
  });

  it("refuses to overwrite a post that already exists in the worktree", async () => {
    const { store, fs } = newStore({ [SKYLINE_WT_FILE]: "existing bytes" });
    const result = await store.createPost(INPUT);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/already exists/);
    expect(fs.store.get(SKYLINE_WT_FILE)).toBe("existing bytes");
  });

  it("refuses invalid frontmatter without creating a worktree or writing a file", async () => {
    const { store, fs, lines } = newStore();
    const result = await store.createPost({ ...INPUT, created_at: "not a date" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/invalid frontmatter/);
    expect(fs.store.size).toBe(0);
    expect(lines().some((l) => l.startsWith("git worktree add"))).toBe(false);
  });
});

describe("store multi-tab: open / switch / close", () => {
  function seeded() {
    return newStore({ [SKYLINE_WT_FILE]: SKYLINE, [HELLO_WT_FILE]: HELLO });
  }

  it("tracks multiple open posts and switches the active one", async () => {
    const { store } = seeded();
    await store.openPost(SKYLINE_CANON);
    await store.openPost(HELLO_CANON);

    expect(store.getOpenTabs().map((t) => t.path).sort()).toEqual([HELLO_CANON, SKYLINE_CANON].sort());
    expect(store.getActive()).toEqual({ path: HELLO_CANON, title: "Hello", branch: "blog/2022-03-11_hello" });

    // Re-opening an already-open post focuses it without adding a second worktree.
    await store.openPost(SKYLINE_CANON);
    expect(store.getActive()?.path).toBe(SKYLINE_CANON);
    expect(store.getOpenTabs()).toHaveLength(2);
  });

  it("closing the active tab focuses another open post; closing the last clears it", async () => {
    const { store, messages } = seeded();
    await store.openPost(SKYLINE_CANON);
    await store.openPost(HELLO_CANON); // active = hello

    await store.closePost(HELLO_CANON);
    expect(store.getActive()?.path).toBe(SKYLINE_CANON);
    expect(store.getOpenTabs().map((t) => t.path)).toEqual([SKYLINE_CANON]);

    await store.closePost(SKYLINE_CANON);
    expect(store.getActive()).toBeNull();
    expect(store.getOpenTabs()).toEqual([]);
    // The last tabs broadcast is the empty set.
    const lastTabs = messages.filter((m) => m.type === "tabs").at(-1);
    expect(lastTabs).toMatchObject({ type: "tabs", open: [] });
  });

  it("keeps the worktree on disk when a tab WITH A DRAFT is closed (reused on re-open)", async () => {
    // A draft = uncommitted work under the post; the fake git surfaces it via statusPorcelain.
    const { store, fs, lines } = newStore(
      { [SKYLINE_WT_FILE]: SKYLINE },
      { statusPorcelain: " M src/content/blog/2026-07-10_aligning-a-skyline.mdx\n" },
    );
    await store.openPost(SKYLINE_CANON);
    await store.closePost(SKYLINE_CANON);
    // The draft is preserved: the worktree .git link survives and nothing was removed.
    expect(fs.store.has(`${WT}/2026-07-10_aligning-a-skyline/.git`)).toBe(true);
    expect(lines().some((l) => l.startsWith("git worktree remove"))).toBe(false);
    const addsBefore = lines().filter((l) => l.startsWith("git worktree add")).length;
    await store.openPost(SKYLINE_CANON);
    const addsAfter = lines().filter((l) => l.startsWith("git worktree add")).length;
    expect(addsAfter).toBe(addsBefore); // reused, not re-added
  });

  it("tears down the worktree + branch when a CLEAN tab is closed (same as delete-draft)", async () => {
    const { store, fs, lines, stopPreviewFor } = seeded(); // default cfg = clean, nothing to lose
    await store.openPost(SKYLINE_CANON);
    const wt = `${WT}/2026-07-10_aligning-a-skyline`;
    await store.closePost(SKYLINE_CANON);
    // Exactly the delete-draft teardown: stop the preview, remove the worktree, force-delete the branch.
    expect(fs.store.has(`${wt}/.git`)).toBe(false);
    expect(lines()).toContain(`git worktree remove --force ${wt}`);
    expect(lines()).toContain("git branch -D blog/2026-07-10_aligning-a-skyline");
    expect(stopPreviewFor).toContain(wt);
  });
});

describe("store.getActiveWorktree", () => {
  it("exposes the active post's worktree for the ship flow + astro manager", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    expect(store.getActiveWorktree()).toEqual({
      slug: "aligning-a-skyline",
      branch: "blog/2026-07-10_aligning-a-skyline",
      worktreePath: `${WT}/2026-07-10_aligning-a-skyline`,
      worktreeFilePath: SKYLINE_WT_FILE,
      relPath: "src/content/blog/2026-07-10_aligning-a-skyline.mdx",
      canonicalPath: SKYLINE_CANON,
    });
    expect(store.getActiveWatchPath()).toBe(SKYLINE_WT_FILE);
  });
});

describe("store.writeByPath (editor autosave)", () => {
  it("persists to the post's worktree file, bumps the rev, and records a self write", async () => {
    const { store, fs } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    const active = await store.openPost(SKYLINE_CANON);
    const next = SKYLINE + "More.\n";
    const result = await store.writeByPath(SKYLINE_CANON, next, active.rev);
    expect(result).toEqual({ ok: true, rev: { n: 2, hash: sha256Hex(next) } });
    expect(fs.store.get(SKYLINE_WT_FILE)).toBe(next);
    expect(store.guard.consume(sha256Hex(next))).toBe("self");
  });

  it("rejects a stale base rev", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    const result = await store.writeByPath(SKYLINE_CANON, "x", { n: 99, hash: "nope" });
    expect(result).toEqual({ ok: false, error: "stale-rev", currentRev: { n: 1, hash: sha256Hex(SKYLINE) } });
  });

  it("refuses to clobber an out-of-band disk change (disk wins)", async () => {
    const { store, fs } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    const active = await store.openPost(SKYLINE_CANON);
    const external = SKYLINE.replace("Body text.", "Edited elsewhere.");
    fs.store.set(SKYLINE_WT_FILE, external);
    const result = await store.writeByPath(SKYLINE_CANON, "clobber\n", active.rev);
    expect(result).toEqual({ ok: false, error: "stale-rev", currentRev: { n: active.rev.n, hash: sha256Hex(external) } });
    expect(fs.store.get(SKYLINE_WT_FILE)).toBe(external);
  });

  it("treats an autosave to a path that isn't open as stale", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    const result = await store.writeByPath(HELLO_CANON, "x", { n: 1, hash: "y" });
    expect(result.ok).toBe(false);
  });
});

describe("store.reloadActive (watcher-adopted disk changes)", () => {
  it("emits file.changed with the given origin and a bumped rev", async () => {
    const { store, messages } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    const agentText = SKYLINE.replace("Body text.", "Agent wrote this.");
    const reloaded = await store.reloadActive(agentText, "agent");
    expect(reloaded.rev.n).toBe(2);
    expect(messages.filter((m) => m.type === "file.changed").at(-1)).toMatchObject({ origin: "agent", path: SKYLINE_CANON });
  });
});

describe("store.renamePost", () => {
  it("moves the file, renames the branch + worktree, and rewrites the frontmatter slug", async () => {
    const { store, fs, lines } = newStore({ [HELLO_WT_FILE]: HELLO });
    await store.openPost(HELLO_CANON);
    const result = await store.renamePost(HELLO_CANON, "goodbye");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const newCanon = `${BLOG}/2022-03-11_goodbye.mdx`;
    const newWtFile = `${WT}/2022-03-11_goodbye/src/content/blog/2022-03-11_goodbye.mdx`;
    expect(result.path).toBe(newCanon);
    expect(lines()).toContain("git -C /repo/.claude/worktrees/blog/2022-03-11_hello branch -m blog/2022-03-11_goodbye");
    // A tracked post is renamed via `git mv`, so git's index records a rename (not a delete+add).
    expect(lines()).toContain(
      "git -C /repo/.claude/worktrees/blog/2022-03-11_hello mv " +
        "/repo/.claude/worktrees/blog/2022-03-11_hello/src/content/blog/2022-03-11_hello.mdx " +
        "/repo/.claude/worktrees/blog/2022-03-11_hello/src/content/blog/2022-03-11_goodbye.mdx",
    );
    expect(lines()).toContain(
      "git worktree move /repo/.claude/worktrees/blog/2022-03-11_hello /repo/.claude/worktrees/blog/2022-03-11_goodbye",
    );
    // The file moved and its frontmatter slug now matches the new slug.
    expect(fs.store.get(newWtFile)).toContain("slug: goodbye");
    expect(fs.store.has(HELLO_WT_FILE)).toBe(false);
    // The active doc + worktree tracking followed the rename.
    expect(store.getActive()?.path).toBe(newCanon);
    expect(store.getActiveWorktree()?.branch).toBe("blog/2022-03-11_goodbye");
  });

  it("rejects an invalid slug", async () => {
    const { store } = newStore({ [HELLO_WT_FILE]: HELLO });
    await store.openPost(HELLO_CANON);
    const result = await store.renamePost(HELLO_CANON, "Not A Slug");
    expect(result.ok).toBe(false);
  });

  it("falls back to a filesystem move for an untracked (never-committed) post", async () => {
    const { store, fs, lines } = newStore({ [HELLO_WT_FILE]: HELLO }, { untracked: true });
    await store.openPost(HELLO_CANON);
    const result = await store.renamePost(HELLO_CANON, "goodbye");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const newWtFile = `${WT}/2022-03-11_goodbye/src/content/blog/2022-03-11_goodbye.mdx`;
    // No `git mv`; the file still moved, via the plain filesystem move fallback.
    expect(lines().some((l) => l.includes(" mv "))).toBe(false);
    expect(fs.store.get(newWtFile)).toContain("slug: goodbye");
    expect(fs.store.has(HELLO_WT_FILE)).toBe(false);
  });
});

describe("store worktree keying (same slug, different dates)", () => {
  it("gives same-slug/different-date posts distinct worktrees + branches (no collision)", async () => {
    const NEW_CANON = `${BLOG}/2026-07-10_hello.mdx`; // slug "hello", 2026
    const NEW_WT_FILE = `${WT}/2026-07-10_hello/src/content/blog/2026-07-10_hello.mdx`;
    const OLD_CANON = HELLO_CANON; // slug "hello", 2022
    const NEW_DOC = doc("Hello 2026", "hello", "2026-07-10", "the newer hello");
    const { store, fs, lines } = newStore({ [NEW_WT_FILE]: NEW_DOC, [HELLO_WT_FILE]: HELLO });

    await store.openPost(NEW_CANON);
    expect(store.getActiveWorktree()).toMatchObject({
      slug: "hello",
      branch: "blog/2026-07-10_hello",
      worktreePath: `${WT}/2026-07-10_hello`,
      worktreeFilePath: NEW_WT_FILE,
    });

    await store.openPost(OLD_CANON);
    expect(store.getActiveWorktree()).toMatchObject({
      slug: "hello",
      branch: "blog/2022-03-11_hello",
      worktreePath: `${WT}/2022-03-11_hello`,
      worktreeFilePath: HELLO_WT_FILE,
    });

    // Two distinct worktrees and branches, despite the shared slug.
    expect(lines()).toContain("git worktree add /repo/.claude/worktrees/blog/2026-07-10_hello -b blog/2026-07-10_hello origin/main");
    expect(lines()).toContain("git worktree add /repo/.claude/worktrees/blog/2022-03-11_hello -b blog/2022-03-11_hello origin/main");

    // Editing one post's worktree file leaves the other's on-disk bytes untouched (no cross-write).
    const reopened = await store.openPost(NEW_CANON);
    const edited = NEW_DOC + "Newer body.\n";
    await store.writeByPath(NEW_CANON, edited, reopened.rev);
    expect(fs.store.get(NEW_WT_FILE)).toBe(edited);
    expect(fs.store.get(HELLO_WT_FILE)).toBe(HELLO);
  });
});

describe("store.reloadByWatchPath / getDocByWatchPath (watcher targets the file's owner)", () => {
  it("adopts disk text for the post backing a watch path even when it is NOT active", async () => {
    const { store, messages } = newStore({ [SKYLINE_WT_FILE]: SKYLINE, [HELLO_WT_FILE]: HELLO });
    await store.openPost(SKYLINE_CANON);
    await store.openPost(HELLO_CANON); // active = hello; skyline is a background tab

    expect(store.getDocByWatchPath(SKYLINE_WT_FILE)).toEqual({ path: SKYLINE_CANON, rev: { n: 1, hash: sha256Hex(SKYLINE) } });

    const agentText = SKYLINE.replace("Body text.", "Agent wrote this in the background tab.");
    const reloaded = await store.reloadByWatchPath(SKYLINE_WT_FILE, agentText, "agent");

    // It lands on skyline (the file's owner), not on the active hello doc.
    expect(reloaded).not.toBeNull();
    expect(reloaded?.path).toBe(SKYLINE_CANON);
    expect(reloaded?.rev).toEqual({ n: 2, hash: sha256Hex(agentText) });
    expect(store.getActive()?.path).toBe(HELLO_CANON);
    // file.changed is emitted for skyline's canonical path with agent origin, so the client routes
    // it to the right (background) tab instead of surfacing it later as a bogus external change.
    expect(messages.filter((m) => m.type === "file.changed").at(-1)).toMatchObject({
      origin: "agent",
      path: SKYLINE_CANON,
    });
  });

  it("returns null for a watch path no open post backs", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    expect(store.getDocByWatchPath(`${WT}/nope/x.mdx`)).toBeNull();
    await expect(store.reloadByWatchPath(`${WT}/nope/x.mdx`, "x", "external")).resolves.toBeNull();
  });
});

describe("store.postLossPreview", () => {
  it("reports uncommitted files + commits ahead of base for a delete, with a full loss diff", async () => {
    const { store } = newStore(
      { [SKYLINE_WT_FILE]: SKYLINE },
      {
        statusPorcelain: " M src/content/blog/a.mdx\n?? src/content/blog/b.tsx\n",
        revListCount: "2\n",
        diffBase: "TRACKED_DELTA",
        noIndexDiff: "UNTRACKED_ADD",
      },
    );
    await store.openPost(SKYLINE_CANON);
    const preview = await store.postLossPreview(SKYLINE_CANON, "delete");
    // Diff = tracked delta from the base + a synthesized add-diff for the untracked file.
    expect(preview).toEqual({ dirty: true, changedFiles: 2, ahead: 2, diff: "TRACKED_DELTA\nUNTRACKED_ADD" });
  });

  it("reports the HEAD diff (what restore discards) for a revert", async () => {
    const DIFF = "diff --git a/x b/x\n@@ -1 +1 @@\n-old\n+new\n";
    const { store } = newStore(
      { [SKYLINE_WT_FILE]: SKYLINE },
      { diffHeadNames: "src/content/blog/2026-07-10_aligning-a-skyline.mdx\n", diffHead: DIFF },
    );
    await store.openPost(SKYLINE_CANON);
    const preview = await store.postLossPreview(SKYLINE_CANON, "revert");
    expect(preview).toEqual({ dirty: true, changedFiles: 1, ahead: 0, diff: DIFF });
  });

  it("reports clean for an untouched worktree (delete + revert)", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    expect(await store.postLossPreview(SKYLINE_CANON, "delete")).toEqual({ dirty: false, changedFiles: 0, ahead: 0, diff: "" });
    expect(await store.postLossPreview(SKYLINE_CANON, "revert")).toEqual({ dirty: false, changedFiles: 0, ahead: 0, diff: "" });
  });

  it("delete diff is scoped to the whole blog dir with -M so a staged rename pairs instead of 'new file'", async () => {
    const RENAME_DIFF = [
      "diff --git a/src/content/blog/2022-03-11_hello.mdx b/src/content/blog/2022-03-11_hello2.mdx",
      "similarity index 100%",
      "rename from src/content/blog/2022-03-11_hello.mdx",
      "rename to src/content/blog/2022-03-11_hello2.mdx",
      "",
    ].join("\n");
    const { store, lines } = newStore(
      { [HELLO_WT_FILE]: HELLO },
      {
        statusPorcelain: "R  src/content/blog/2022-03-11_hello.mdx -> src/content/blog/2022-03-11_hello2.mdx\n",
        diffBase: RENAME_DIFF,
      },
    );
    await store.openPost(HELLO_CANON);
    const preview = await store.postLossPreview(HELLO_CANON, "delete");

    expect(preview.diff).toContain("rename from src/content/blog/2022-03-11_hello.mdx");
    expect(preview.diff).toContain("rename to src/content/blog/2022-03-11_hello2.mdx");
    expect(preview.diff).not.toContain("new file mode");
    // The tracked-delta diff is issued with rename detection (-M), scoped to the whole blog
    // content dir rather than just this post's pathspec: the broadening is what lets git pair
    // the old path's deletion with the new path's addition into a rename.
    expect(lines()).toContain("git -c core.quotePath=false diff -M origin/main -- src/content/blog");
  });

  it("revert diff is also scoped to the whole blog dir with -M", async () => {
    const { store, lines } = newStore(
      { [HELLO_WT_FILE]: HELLO },
      { diffHeadNames: "src/content/blog/2022-03-11_hello2.mdx\n", diffHead: "rename from x\nrename to y\n" },
    );
    await store.openPost(HELLO_CANON);
    await store.postLossPreview(HELLO_CANON, "revert");
    expect(lines()).toContain("git diff -M HEAD --name-only -- src/content/blog");
    expect(lines()).toContain("git diff -M HEAD -- src/content/blog");
  });
});

describe("store.dirtyPostPaths (enumerates worktrees on disk, not just open tabs)", () => {
  it("returns the canonical path of an open post with uncommitted work", async () => {
    const { store } = newStore(
      { [SKYLINE_WT_FILE]: SKYLINE },
      { statusPorcelain: " M src/content/blog/2026-07-10_aligning-a-skyline.mdx\n" },
    );
    await store.openPost(SKYLINE_CANON);
    expect(await store.dirtyPostPaths()).toEqual([SKYLINE_CANON]);
  });

  it("excludes a clean worktree", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE }); // default cfg = clean
    await store.openPost(SKYLINE_CANON);
    expect(await store.dirtyPostPaths()).toEqual([]);
  });

  it("finds a dirty worktree that was never opened this session", async () => {
    // No `openPost` call at all: seed the worktree's `.git` link and its post file directly in the
    // fake fs, exactly as if the worktree/branch had been created outside the studio (or survived
    // a failed boot). This is the whole point of the method: it reads `git worktree list`, not
    // the in-memory `open` tab map, so a worktree the studio never opened this session still shows.
    const { store, fs } = newStore({}, { statusPorcelain: " M src/content/blog/2022-03-11_hello.mdx\n" });
    fs.store.set(`${WT}/2022-03-11_hello/.git`, "gitdir");
    fs.store.set(HELLO_WT_FILE, HELLO);
    expect(await store.dirtyPostPaths()).toEqual([HELLO_CANON]);
  });

  it("dedupes and skips a worktree whose post file can't be resolved", async () => {
    const { store, fs } = newStore({}, { statusPorcelain: " M src/content/blog/mystery.mdx\n" });
    // A worktree dir with neither `<stem>.mdx` nor `<stem>/post.mdx` inside it: can't map back to
    // a canonical path, so it's skipped rather than guessed at.
    fs.store.set(`${WT}/mystery/.git`, "gitdir");
    expect(await store.dirtyPostPaths()).toEqual([]);
  });
});

describe("store.deletePost", () => {
  it("removes the worktree + branch, re-focuses another tab, and stops the preview first", async () => {
    const { store, lines, fs, stopPreviewFor, linesAtStopPreview } = newStore({
      [SKYLINE_WT_FILE]: SKYLINE,
      [HELLO_WT_FILE]: HELLO,
    });
    await store.openPost(SKYLINE_CANON);
    await store.openPost(HELLO_CANON); // active = hello
    const helloWt = `${WT}/2022-03-11_hello`;

    const res = await store.deletePost(HELLO_CANON);
    expect(res).toEqual({ ok: true });

    // Worktree removed (--force) and branch force-deleted (-D). origin is never touched.
    expect(lines()).toContain(`git worktree remove --force ${helloWt}`);
    expect(lines()).toContain("git branch -D blog/2022-03-11_hello");
    // The deleted worktree's files are gone from disk.
    expect(fs.store.has(HELLO_WT_FILE)).toBe(false);
    expect(fs.store.has(`${helloWt}/.git`)).toBe(false);

    // Re-focused the surviving post.
    expect(store.getActive()?.path).toBe(SKYLINE_CANON);
    expect(store.getOpenTabs().map((t) => t.path)).toEqual([SKYLINE_CANON]);

    // The preview daemon for the deleted worktree was stopped before the worktree was removed.
    expect(stopPreviewFor).toContain(helloWt);
    expect(linesAtStopPreview().some((l) => l.includes("worktree remove"))).toBe(false);
  });

  it("deleting the last open post clears the active doc", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    expect(await store.deletePost(SKYLINE_CANON)).toEqual({ ok: true });
    expect(store.getActive()).toBeNull();
    expect(store.getOpenTabs()).toHaveLength(0);
  });

  it("refuses a post that isn't open", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    const res = await store.deletePost(SKYLINE_CANON);
    expect(res).toEqual({ ok: false, error: "post is not open" });
  });
});

describe("store.revertPost", () => {
  it("checks out HEAD and pushes the clean text to the editor (origin agent)", async () => {
    const CLEAN = SKYLINE;
    const DIRTY = `${SKYLINE}\nan unsaved edit\n`;
    const { store, lines, messages } = newStore({ [SKYLINE_WT_FILE]: DIRTY }, { checkoutTo: CLEAN });
    await store.openPost(SKYLINE_CANON);
    const before = messages.length;

    const res = await store.revertPost(SKYLINE_CANON);
    expect(res).toEqual({ ok: true, reverted: true });
    expect(lines()).toContain("git checkout HEAD -- src/content/blog/2026-07-10_aligning-a-skyline.mdx");

    const reload = messages.slice(before).find((m) => m.type === "file.changed" && m.path === SKYLINE_CANON);
    expect(reload).toMatchObject({ origin: "agent", text: CLEAN });
  });

  it("is a no-op (reverted:false) when HEAD already matches the working tree", async () => {
    const { store, messages } = newStore({ [SKYLINE_WT_FILE]: SKYLINE }, { checkoutTo: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    const before = messages.length;
    expect(await store.revertPost(SKYLINE_CANON)).toEqual({ ok: true, reverted: false });
    expect(messages.slice(before).some((m) => m.type === "file.changed")).toBe(false);
  });
});
