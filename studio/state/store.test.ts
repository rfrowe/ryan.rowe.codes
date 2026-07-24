// Multi-doc / worktree store tests. A fake Fs stands in for disk and a fake GitRunner records
// worktree/branch commands (mirroring their filesystem effect into the Fs), so the store runs
// end-to-end without git or a real disk.

import { describe, expect, it } from "vitest";

import type { GitState, ServerMessage } from "../shared/protocol";
import type { GitRunner } from "../shared/seams";
import { makeFs, ok, type FakeFs } from "./fakeFs";
import { deriveUrl } from "../preview/deriveUrl";
import { sha256Hex } from "../sidecar/hash";
import { createStore, previewMatchesExpectation, resolveDestructiveConfirm, type ActiveChangeInfo } from "./store";

const REPO = "/repo";
const BLOG = `${REPO}/src/content/blog`;
const WT = `${REPO}/.worktrees/blog`;

// Worktrees are keyed by the date-qualified stem, so same-slug/different-date posts don't collide.
const SKYLINE_CANON = `${BLOG}/2026-07-10_aligning-a-skyline.mdx`;
const SKYLINE_WT_FILE = `${WT}/2026-07-10_aligning-a-skyline/src/content/blog/2026-07-10_aligning-a-skyline.mdx`;
const HELLO_CANON = `${BLOG}/2022-03-11_hello.mdx`;
const HELLO_WT_FILE = `${WT}/2022-03-11_hello/src/content/blog/2022-03-11_hello.mdx`;

function doc(title: string, slug: string, createdAt = "2026-07-10", body = "Body text."): string {
  return ["---", `title: ${title}`, `slug: ${slug}`, "headline: on straight lines", `created_at: ${createdAt}`, "---", "", body, ""].join("\n");
}
const SKYLINE = doc("Aligning a Skyline", "aligning-a-skyline");
const HELLO = doc("Hello", "hello", "2022-03-11");

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
  /** `git status --porcelain`/`--short` output (uncommitted files, same v1 format either way); empty = clean.
   *  Used for a `scope: "post"`-pathspec'd call; an unscoped (`scope: "all"`) call uses
   *  `statusPorcelainAll` instead, defaulting to this same value when unset. */
  statusPorcelain?: string;
  /** Override for the unscoped (`scope: "all"`) status call, when it must differ from `statusPorcelain`
   *  — e.g. to exercise revert's scope auto-detection (more changes under "all" than "post"). */
  statusPorcelainAll?: string;
  /** `git rev-list --count <base>..HEAD` output (unmerged commits); default "0". */
  revListCount?: string;
  /** Per-range override for `git rev-list --count <range>`, keyed by the exact range string (e.g.
   *  `"origin/blog/<stem>..HEAD"`); falls back to `revListCount` for any unlisted range. Lets a test
   *  give a post's own remote a different count than the session branch's. */
  revListCountByRange?: Record<string, string>;
  /** `git merge-base <ref> HEAD` output; defaults to `<ref>` itself (see the fake's `merge-base`
   *  handler). Override to simulate the primary branch having advanced past the fork point. */
  mergeBase?: string;
  /** `git diff -M [<ref>]` output (revert's unstaged diff vs HEAD, or delete's tracked delta from the
   *  base); empty = nothing. */
  diffBase?: string;
  /** `git diff -M --staged` output (revert's staged diff vs HEAD); empty = nothing. */
  diffStaged?: string;
  /** `git diff --no-index -- /dev/null <path>` output (an untracked file's synthesized add-diff). */
  noIndexDiff?: string;
  /** Content `git checkout HEAD -- <path>` writes back to the file (simulates restoring to HEAD). */
  checkoutTo?: string;
  /** `git ls-files --error-unmatch` reports the post as untracked (a brand-new, never-committed post). */
  untracked?: boolean;
  /** `git rev-parse --verify --quiet refs/heads/<branch>` exits 0 (local branch exists) instead of the default 1. */
  branchExists?: boolean;
  /** `git rev-parse --verify --quiet refs/remotes/origin/<branch>` exits 0 (remote-tracking branch exists). */
  remoteBranchExists?: boolean;
  /** `git cherry origin/<default> <ref>` reports no unmatched (`+`) commit: the draft branch's
   *  content is already upstream (a real merge, or a squash of a single commit), detectable offline.
   *  Applies to both the local and remote ref unless overridden below. */
  cherryMerged?: boolean;
  /** Override of `cherryMerged` for just the local ref's `git cherry` call. */
  localCherryMerged?: boolean;
  /** Override of `cherryMerged` for just the remote ref's `git cherry` call. */
  remoteCherryMerged?: boolean;
  /** Files a fresh `git worktree add` "checks out", written into the fake fs when handling the add.
   *  The fake otherwise only registers the `.git` link, so this is needed when a test can't pre-seed
   *  the file (e.g. a self-heal test that removes the whole worktree dir right before the add). */
  originFiles?: Record<string, string>;
  /** Parks every `rev-list --left-right` (divergence) call on this promise until it resolves, so a
   *  test can switch the active post mid-compute and assert the stale result is dropped. */
  revListGate?: Promise<void>;
}

function makeGit(fs: FakeFs, cfg: GitConfig = {}): { git: GitRunner; lines: () => string[] } {
  const calls: Recorded[] = [];
  const git: GitRunner = {
    async git(args, opts) {
      calls.push({ bin: "git", line: args.join(" ") });
      if (args[0] === "worktree" && args[1] === "list") {
        // Synthesize porcelain output from every worktree the fake fs knows (each has a `.git`
        // link), plus the main worktree (REPO), which the store filters out by path.
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
        // `-b <branch>` fails against a real git if `<branch>` already has a local ref, unless a
        // prior `branch -D` in this run cleared it: models the collision ensureWorktree must avoid.
        if (args.includes("-b")) {
          const branchArg = args[args.indexOf("-b") + 1];
          const cleared = calls.some((c) => c.bin === "git" && c.line === `branch -D ${branchArg}`);
          if (cfg.branchExists && !cleared) {
            return { ...ok, code: 128, stderr: `fatal: a branch named '${branchArg}' already exists\n` };
          }
        }
        // Register the worktree's .git link. The path's position varies by add form, so find it
        // by prefix rather than a fixed index.
        const wtPath = args.find((a) => a.startsWith(`${WT}/`)) ?? args[2];
        fs.store.set(`${wtPath}/.git`, "gitdir");
        // Existing-post tests seed the worktree file separately; when they can't, `cfg.originFiles`
        // stands in for the fork's checkout.
        for (const [p, content] of Object.entries(cfg.originFiles ?? {})) fs.store.set(p, content);
        return ok;
      }
      if (args[0] === "worktree" && args[1] === "move") {
        movePrefix(fs, args[2], args[3]);
        return ok;
      }
      if (args[0] === "worktree" && args[1] === "remove") {
        // Drop the .git link and every fake-fs entry under the worktree.
        const wt = args[args.length - 1];
        fs.store.delete(`${wt}/.git`);
        for (const key of [...fs.store.keys()]) if (key === wt || key.startsWith(`${wt}/`)) fs.store.delete(key);
        return ok;
      }
      if (args[0] === "branch" && args[1] === "-D") return ok;
      if (args[0] === "cherry") {
        const ref = args[2];
        const merged = (ref?.startsWith("refs/remotes/") ? cfg.remoteCherryMerged : cfg.localCherryMerged) ?? cfg.cherryMerged;
        return { ...ok, stdout: merged ? "" : "+ deadbeef\n" };
      }
      if (args[0] === "rev-parse" && args.includes("--verify")) {
        const ref = args[args.length - 1];
        if (ref.startsWith("refs/remotes/origin/")) return { ...ok, code: cfg.remoteBranchExists ? 0 : 1 };
        return { ...ok, code: cfg.branchExists ? 0 : 1 };
      }
      if (args.includes("ls-files")) return { ...ok, code: cfg.untracked ? 1 : 0 };
      if (args.includes("mv")) {
        const from = args[args.length - 2];
        const to = args[args.length - 1];
        movePrefix(fs, from, to);
        return ok;
      }
      if (args[0] === "status" || (args.includes("status") && (args.includes("--porcelain") || args.includes("--short")))) {
        // A `scope: "post"` call carries the blog-dir pathspec; `scope: "all"` carries none.
        const scoped = args.includes("src/content/blog");
        return { ...ok, stdout: (scoped ? cfg.statusPorcelain : cfg.statusPorcelainAll ?? cfg.statusPorcelain) ?? "" };
      }
      if (args[0] === "rev-list") {
        const range = args[args.length - 1];
        if (args.includes("--left-right") && cfg.revListGate) await cfg.revListGate;
        return { ...ok, stdout: cfg.revListCountByRange?.[range] ?? cfg.revListCount ?? "0" };
      }
      if (args[0] === "merge-base") {
        // The fake has no real commit graph, so it treats the ref itself as its own merge-base with
        // HEAD by default; a test can override this to simulate the primary branch having moved on.
        return { ...ok, stdout: `${cfg.mergeBase ?? args[1]}\n` };
      }
      if (args.includes("diff")) {
        // Some diffs are prefixed with `-c core.quotePath=false`, so match on membership.
        if (args.includes("--no-index")) return { ...ok, stdout: cfg.noIndexDiff ?? "" };
        if (args.includes("--staged")) return { ...ok, stdout: cfg.diffStaged ?? "" };
        return { ...ok, stdout: cfg.diffBase ?? "" };
      }
      if (args[0] === "checkout" && args[1] === "HEAD") {
        // Restore the pathspec to its "committed" content.
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

function newStore(seed: Record<string, string> = {}, cfg: GitConfig = {}, sessionBranch = "main") {
  const fs = makeFs(seed);
  const { git, lines } = makeGit(fs, cfg);
  // Records which worktrees stopPreview stopped, plus a snapshot of the git commands at that
  // instant, so tests can assert stopPreview ran before the worktree was removed (never remove a
  // dir a daemon is still serving).
  const stopPreviewFor: string[] = [];
  let linesAtStopPreview: string[] = [];
  // Records every path `removePath` was asked to remove, mirroring the effect into the fake fs.
  const removed: string[] = [];
  const store = createStore({
    fs,
    git,
    repoRoot: REPO,
    sessionBranch,
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
  it("ensures a worktree off the session branch, loads the file, and announces the switch", async () => {
    const { store, lines, messages, activations } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    const active = await store.openPost(SKYLINE_CANON);

    expect(active).toEqual({ path: SKYLINE_CANON, text: SKYLINE, rev: { n: 1, hash: sha256Hex(SKYLINE) } });
    // A fresh worktree is added off the local session branch (main) on branch blog/<stem>.
    expect(lines()).toContain("git worktree add /repo/.worktrees/blog/2026-07-10_aligning-a-skyline -b blog/2026-07-10_aligning-a-skyline main");

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

  it("throws a clear error when the post is not present in its worktree (not on the session branch)", async () => {
    const { store } = newStore(); // nothing seeded → the worktree fork lacks the file
    await expect(store.openPost(SKYLINE_CANON)).rejects.toThrow(/not found in its worktree/);
  });
});

describe("store.getGitState / setGitState (git.state connect replay)", () => {
  const STATE: GitState = {
    primary: {
      sessionBranch: "main",
      head: "main",
      rootMoved: false,
      ref: "origin/main",
      headSha: "abc1234",
      onOrigin: true,
      ahead: 0,
      behind: 0,
      worktree: REPO,
      rebase: { phase: "idle", conflictedFiles: [] },
    },
    posts: [],
    fetch: { inFlight: false, at: null },
  };

  it("is null before any snapshot has been set", () => {
    const { store } = newStore();
    expect(store.getGitState()).toBeNull();
  });

  it("caches the snapshot it's given and broadcasts it as git.state", () => {
    const { store, messages } = newStore();
    store.setGitState(STATE);
    expect(store.getGitState()).toBe(STATE);
    expect(messages.at(-1)).toEqual({ type: "git.state", state: STATE });
  });

  it("replaces the cached snapshot on the next call, for a freshly-connecting client to replay", () => {
    const { store } = newStore();
    store.setGitState(STATE);
    const next: GitState = { ...STATE, primary: { ...STATE.primary, ahead: 1 } };
    store.setGitState(next);
    expect(store.getGitState()).toBe(next);
  });
});

describe("store.sessionNamespaceSeg", () => {
  it("is empty for a primary session (sessionBranch equals the repo default)", async () => {
    const { store } = newStore();
    expect(await store.sessionNamespaceSeg()).toBe("");
  });

  it("is the sanitized session branch for a non-primary session", async () => {
    const { store } = newStore({}, {}, "feat/worktree");
    expect(await store.sessionNamespaceSeg()).toBe("feat-worktree");
  });
});

describe("ensureWorktree self-heals a leftover (husk) directory", () => {
  // A husk: the dir exists but has no `.git` link, so the reuse check is skipped and the normal
  // add path runs, which would otherwise fail since git refuses to add onto a non-empty dir.
  const WTP = `${WT}/2026-07-10_aligning-a-skyline`;
  const BRANCH = "blog/2026-07-10_aligning-a-skyline";

  it("adopts the branch in place when it already exists: clears only the regenerable cruft, never the whole dir", async () => {
    const { store, lines, removedPaths } = newStore(
      {
        // The fake fs models files only, so an entry at the worktree root stands in for "this
        // directory already exists on disk".
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

  it("removes the whole dir and re-forks from the session branch when there is no branch to adopt", async () => {
    const { store, lines, removedPaths } = newStore(
      { [WTP]: "dir", [`${WTP}/.astro`]: "cache" },
      // No branch means nothing was ever checked out here; `originFiles` stands in for the fork.
      { originFiles: { [SKYLINE_WT_FILE]: SKYLINE } },
    );
    await store.openPost(SKYLINE_CANON);

    expect(removedPaths()).toContain(WTP);
    expect(lines()).toContain(`git worktree add ${WTP} -b ${BRANCH} main`);
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

  it("namespaces the branch and worktree under the sanitized session branch when non-primary", async () => {
    // Session branch feat/x differs from the default (main), so posts fork off the local feat/x tip
    // and live under a feat-x-prefixed branch and worktree, keeping a non-primary studio's drafts
    // from colliding with the primary session's blog/<stem> namespace.
    const { store, fs } = newStore({}, {}, "feat/x");
    const result = await store.createPost(INPUT);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const WT_X = `${REPO}/.worktrees/feat-x/blog`;
    expect(store.getActiveWorktree()?.branch).toBe("feat-x/blog/2026-07-10_aligning-a-skyline");
    expect(fs.store.get(`${WT_X}/2026-07-10_aligning-a-skyline/src/content/blog/2026-07-10_aligning-a-skyline.mdx`)).toBeDefined();
  });

  it("forks a non-primary post's worktree off the local session branch under the prefixed name", async () => {
    const { store, lines } = newStore({}, {}, "feat/x");
    await store.createPost(INPUT);
    expect(lines()).toContain(
      "git worktree add /repo/.worktrees/feat-x/blog/2026-07-10_aligning-a-skyline " +
        "-b feat-x/blog/2026-07-10_aligning-a-skyline feat/x",
    );
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
    expect(store.getActive()).toEqual({
      path: HELLO_CANON,
      title: "Hello",
      worktreePath: `${WT}/2022-03-11_hello`,
    });

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

  it("also tears down a post that's unmerged into the session branch but already matches its own pushed remote", async () => {
    // Nothing uncommitted, and HEAD already matches origin/blog/<stem> (e.g. just adopted, or just
    // saved via "Save to remote"), even though that branch isn't merged into origin/main yet. Closing
    // still loses nothing recoverable, so it tears down exactly like the clean case above.
    const { store, fs, lines } = newStore(
      { [SKYLINE_WT_FILE]: SKYLINE },
      {
        remoteBranchExists: true,
        revListCountByRange: { "origin/blog/2026-07-10_aligning-a-skyline..HEAD": "0", "origin/main..HEAD": "1" },
      },
    );
    await store.openPost(SKYLINE_CANON);
    const wt = `${WT}/2026-07-10_aligning-a-skyline`;
    await store.closePost(SKYLINE_CANON);
    expect(fs.store.has(`${wt}/.git`)).toBe(false);
    expect(lines()).toContain(`git worktree remove --force ${wt}`);
    expect(lines()).toContain("git branch -D blog/2026-07-10_aligning-a-skyline");
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

describe("store.renamePost", () => {
  it("moves the file, renames the branch + worktree, and rewrites the frontmatter slug", async () => {
    const { store, fs, lines, messages } = newStore({ [HELLO_WT_FILE]: HELLO });
    await store.openPost(HELLO_CANON);
    const before = messages.length;
    const result = await store.renamePost(HELLO_CANON, { slug: "goodbye" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const newCanon = `${BLOG}/2022-03-11_goodbye.mdx`;
    const newWtFile = `${WT}/2022-03-11_goodbye/src/content/blog/2022-03-11_goodbye.mdx`;
    expect(result.path).toBe(newCanon);

    // A post.renamed broadcast carries old-to-new (path, title) so clients migrate the tab's
    // transcript/session, and it is published before the active/tabs rebuild that follows.
    const rename = messages.slice(before);
    const renamedAt = rename.findIndex((m) => m.type === "post.renamed");
    expect(renamedAt).toBeGreaterThanOrEqual(0);
    expect(rename[renamedAt]).toMatchObject({
      type: "post.renamed",
      oldPath: HELLO_CANON,
      newPath: newCanon,
      title: "Hello",
    });
    const activeAt = rename.findIndex((m) => m.type === "active" && m.path === newCanon);
    expect(renamedAt).toBeLessThan(activeAt);
    expect(lines()).toContain("git -C /repo/.worktrees/blog/2022-03-11_hello branch -m blog/2022-03-11_goodbye");
    // A tracked post is renamed via `git mv`, so git's index records a rename (not a delete+add).
    expect(lines()).toContain(
      "git -C /repo/.worktrees/blog/2022-03-11_hello mv " +
        "/repo/.worktrees/blog/2022-03-11_hello/src/content/blog/2022-03-11_hello.mdx " +
        "/repo/.worktrees/blog/2022-03-11_hello/src/content/blog/2022-03-11_goodbye.mdx",
    );
    expect(lines()).toContain(
      "git worktree move /repo/.worktrees/blog/2022-03-11_hello /repo/.worktrees/blog/2022-03-11_goodbye",
    );
    // The file moved and its frontmatter slug now matches the new slug.
    expect(fs.store.get(newWtFile)).toContain("slug: goodbye");
    expect(fs.store.has(HELLO_WT_FILE)).toBe(false);
    // The active doc + worktree tracking followed the rename.
    expect(store.getActive()?.path).toBe(newCanon);
    expect(store.getActiveWorktree()?.branch).toBe("blog/2022-03-11_goodbye");
  });

  it("stops the preview daemon before the move and drops the moved .astro cache", async () => {
    // Regression: `git worktree move` carries the `.astro` cache, which still imports the old
    // filename and makes Astro throw "Cannot find module". The rename must stop the daemon (it
    // holds the dir/port) and clear the moved `.astro` so Astro regenerates from the new filename.
    const { store, stopPreviewFor, removedPaths } = newStore({ [HELLO_WT_FILE]: HELLO });
    await store.openPost(HELLO_CANON);
    const result = await store.renamePost(HELLO_CANON, { slug: "goodbye" });
    expect(result.ok).toBe(true);
    // The old worktree's preview was stopped before the move relocated it.
    expect(stopPreviewFor).toContain(`${WT}/2022-03-11_hello`);
    // The new worktree's stale content-layer cache was dropped.
    expect(removedPaths()).toContain(`${WT}/2022-03-11_goodbye/.astro`);
  });

  it("rejects an invalid slug", async () => {
    const { store } = newStore({ [HELLO_WT_FILE]: HELLO });
    await store.openPost(HELLO_CANON);
    const result = await store.renamePost(HELLO_CANON, { slug: "Not A Slug" });
    expect(result.ok).toBe(false);
  });

  it("falls back to a filesystem move for an untracked (never-committed) post", async () => {
    const { store, fs, lines } = newStore({ [HELLO_WT_FILE]: HELLO }, { untracked: true });
    await store.openPost(HELLO_CANON);
    const result = await store.renamePost(HELLO_CANON, { slug: "goodbye" });

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
    expect(lines()).toContain("git worktree add /repo/.worktrees/blog/2026-07-10_hello -b blog/2026-07-10_hello main");
    expect(lines()).toContain("git worktree add /repo/.worktrees/blog/2022-03-11_hello -b blog/2022-03-11_hello main");

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

describe("store.relayout (agent flips a post between file and folder layout)", () => {
  // The folder-layout paths for the skyline post's stem: same worktree, `<stem>/post.mdx` instead of
  // `<stem>.mdx`.
  const SKYLINE_FOLDER_CANON = `${BLOG}/2026-07-10_aligning-a-skyline/post.mdx`;
  const SKYLINE_FOLDER_WT_FILE = `${WT}/2026-07-10_aligning-a-skyline/src/content/blog/2026-07-10_aligning-a-skyline/post.mdx`;

  it("repoints the active doc to the new folder file and migrates the tab (post.renamed + re-seed)", async () => {
    const { store, fs, messages } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);

    // The agent moved the post into a folder to co-locate a component: the new file is on disk, the
    // old one is gone.
    const folderText = SKYLINE.replace("Body text.", "import Widget from './Widget';\n\nBody text.");
    fs.store.set(SKYLINE_FOLDER_WT_FILE, folderText);
    fs.store.delete(SKYLINE_WT_FILE);

    const migrated = await store.relayout(SKYLINE_WT_FILE, SKYLINE_FOLDER_WT_FILE, "agent");
    expect(migrated?.path).toBe(SKYLINE_FOLDER_CANON);
    expect(migrated?.text).toBe(folderText);

    // The doc is re-keyed: the old path is closed, the new path is the active post's watch target.
    expect(store.getDocByWatchPath(SKYLINE_WT_FILE)).toBeNull();
    expect(store.getDocByWatchPath(SKYLINE_FOLDER_WT_FILE)).toMatchObject({ path: SKYLINE_FOLDER_CANON });
    expect(store.getActive()?.path).toBe(SKYLINE_FOLDER_CANON);
    expect(store.getActiveWatchPath()).toBe(SKYLINE_FOLDER_WT_FILE);

    // The SPA is told to migrate the tab first, then re-seeded with the folder-post buffer.
    expect(messages.filter((m) => m.type === "post.renamed").at(-1)).toMatchObject({
      oldPath: SKYLINE_CANON,
      newPath: SKYLINE_FOLDER_CANON,
    });
    expect(messages.filter((m) => m.type === "file.changed").at(-1)).toMatchObject({
      path: SKYLINE_FOLDER_CANON,
      text: folderText,
      origin: "agent",
    });
  });

  it("flips back from folder to file layout", async () => {
    const { store, fs } = newStore({ [SKYLINE_FOLDER_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_FOLDER_CANON);
    expect(store.getActive()?.path).toBe(SKYLINE_FOLDER_CANON);

    const fileText = SKYLINE.replace("Body text.", "No component now.");
    fs.store.set(SKYLINE_WT_FILE, fileText);
    fs.store.delete(SKYLINE_FOLDER_WT_FILE);

    const migrated = await store.relayout(SKYLINE_FOLDER_WT_FILE, SKYLINE_WT_FILE, "agent");
    expect(migrated?.path).toBe(SKYLINE_CANON);
    expect(store.getActive()?.path).toBe(SKYLINE_CANON);
    expect(store.getActiveWatchPath()).toBe(SKYLINE_WT_FILE);
  });

  it("migrates a background (non-active) post without stealing focus", async () => {
    const { store, fs, messages } = newStore({ [SKYLINE_WT_FILE]: SKYLINE, [HELLO_WT_FILE]: HELLO });
    await store.openPost(SKYLINE_CANON);
    await store.openPost(HELLO_CANON); // active = hello; skyline flips in the background

    const folderText = SKYLINE.replace("Body text.", "With a widget.");
    fs.store.set(SKYLINE_FOLDER_WT_FILE, folderText);
    fs.store.delete(SKYLINE_WT_FILE);
    const migrated = await store.relayout(SKYLINE_WT_FILE, SKYLINE_FOLDER_WT_FILE, "agent");

    expect(migrated?.path).toBe(SKYLINE_FOLDER_CANON);
    // Focus stays on hello; no `active` broadcast for the background flip.
    expect(store.getActive()?.path).toBe(HELLO_CANON);
    expect(messages.filter((m) => m.type === "active").at(-1)).toMatchObject({ path: HELLO_CANON });
  });

  it("returns null when no open post backs the old path, or the new file is unreadable", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    // No post open at the old path.
    await expect(store.relayout(`${WT}/nope/x.mdx`, `${WT}/nope/y/post.mdx`, "agent")).resolves.toBeNull();
    // The post is open, but the new file was never written to disk.
    await expect(store.relayout(SKYLINE_WT_FILE, SKYLINE_FOLDER_WT_FILE, "agent")).resolves.toBeNull();
  });

  it("refuses to migrate onto a path another tab already holds", async () => {
    // Both layouts of the stem are open at once (a degenerate state). Relaying the file-layout post
    // onto the folder path must not clobber the tab already there.
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE, [SKYLINE_FOLDER_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    await store.openPost(SKYLINE_FOLDER_CANON);

    await expect(store.relayout(SKYLINE_WT_FILE, SKYLINE_FOLDER_WT_FILE, "agent")).resolves.toBeNull();
    // The file-layout post is left untouched at its own path.
    expect(store.getDocByWatchPath(SKYLINE_WT_FILE)).toMatchObject({ path: SKYLINE_CANON });
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
    expect(preview).toEqual({
      dirty: true,
      changedFiles: 2,
      ahead: 2,
      diff: "TRACKED_DELTA\nUNTRACKED_ADD",
      status: " M src/content/blog/a.mdx\n?? src/content/blog/b.tsx\n",
      scope: "all",
    });
  });

  it("reports the HEAD diff (what restore discards) for a revert", async () => {
    const DIFF = "diff --git a/x b/x\n@@ -1 +1 @@\n-old\n+new\n";
    const { store } = newStore(
      { [SKYLINE_WT_FILE]: SKYLINE },
      { statusPorcelain: " M src/content/blog/2026-07-10_aligning-a-skyline.mdx\n", diffBase: DIFF },
    );
    await store.openPost(SKYLINE_CANON);
    const preview = await store.postLossPreview(SKYLINE_CANON, "revert");
    expect(preview).toEqual({
      dirty: true,
      changedFiles: 1,
      ahead: 0,
      diff: DIFF,
      status: " M src/content/blog/2026-07-10_aligning-a-skyline.mdx\n",
      scope: "post",
    });
  });

  it("excludes an untracked file from a revert's count and diff (it has no HEAD state)", async () => {
    const { store } = newStore(
      { [SKYLINE_WT_FILE]: SKYLINE },
      { statusPorcelain: "?? src/content/blog/never-committed.mdx\n" },
    );
    await store.openPost(SKYLINE_CANON);
    const preview = await store.postLossPreview(SKYLINE_CANON, "revert");
    expect(preview).toEqual({
      dirty: false,
      changedFiles: 0,
      ahead: 0,
      diff: "",
      status: "?? src/content/blog/never-committed.mdx\n",
      scope: "post",
    });
  });

  it("reports clean for an untouched worktree (delete + revert)", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    expect(await store.postLossPreview(SKYLINE_CANON, "delete")).toEqual({
      dirty: false,
      changedFiles: 0,
      ahead: 0,
      diff: "",
      status: "",
      scope: "all",
    });
    expect(await store.postLossPreview(SKYLINE_CANON, "revert")).toEqual({
      dirty: false,
      changedFiles: 0,
      ahead: 0,
      diff: "",
      status: "",
      scope: "post",
    });
  });

  it("reports clean for a draft adopted from its own pushed remote, even though it's unmerged into the session branch", async () => {
    // Adopted via ⌘P (origin/blog/<stem> exists, HEAD sits exactly on it), unmerged into origin/main:
    // deleting still loses nothing, since the commit is already recoverable from its own remote.
    const { store } = newStore(
      { [SKYLINE_WT_FILE]: SKYLINE },
      {
        remoteBranchExists: true,
        revListCountByRange: { "origin/blog/2026-07-10_aligning-a-skyline..HEAD": "0", "origin/main..HEAD": "1" },
      },
    );
    await store.openPost(SKYLINE_CANON);
    expect(await store.postLossPreview(SKYLINE_CANON, "delete")).toEqual({
      dirty: false,
      changedFiles: 0,
      ahead: 0,
      diff: "",
      status: "",
      scope: "all",
    });
  });

  it("delete's preview covers the whole worktree (not just the blog dir) with -M, so a staged rename pairs instead of 'new file' and an outside change surfaces too", async () => {
    const RENAME_AND_OUTSIDE_DIFF = [
      "diff --git a/src/content/blog/2022-03-11_hello.mdx b/src/content/blog/2022-03-11_hello2.mdx",
      "similarity index 100%",
      "rename from src/content/blog/2022-03-11_hello.mdx",
      "rename to src/content/blog/2022-03-11_hello2.mdx",
      "diff --git a/astro.config.mjs b/astro.config.mjs",
      "+added a remark plugin",
      "",
    ].join("\n");
    const { store, lines } = newStore(
      { [HELLO_WT_FILE]: HELLO },
      {
        statusPorcelain:
          "R  src/content/blog/2022-03-11_hello.mdx -> src/content/blog/2022-03-11_hello2.mdx\n M astro.config.mjs\n",
        diffBase: RENAME_AND_OUTSIDE_DIFF,
      },
    );
    await store.openPost(HELLO_CANON);
    const preview = await store.postLossPreview(HELLO_CANON, "delete");

    expect(preview.changedFiles).toBe(2); // the renamed post AND the file outside the blog dir
    expect(preview.diff).toContain("rename from src/content/blog/2022-03-11_hello.mdx");
    expect(preview.diff).toContain("rename to src/content/blog/2022-03-11_hello2.mdx");
    expect(preview.diff).not.toContain("new file mode");
    expect(preview.diff).toContain("astro.config.mjs"); // outside the blog dir, but delete destroys it too
    // -M for rename pairing, and no pathspec at all — deleting the worktree destroys everything in
    // it, so the preview is never scoped to the blog dir (let alone just this post).
    expect(lines()).toContain("git -c core.quotePath=false diff -M main");
  });

  it("revert's preview is scoped to the blog dir with -M by default (scope \"post\")", async () => {
    const { store, lines } = newStore(
      { [HELLO_WT_FILE]: HELLO },
      { statusPorcelain: " M src/content/blog/2022-03-11_hello.mdx\n", diffBase: "rename from x\nrename to y\n" },
    );
    await store.openPost(HELLO_CANON);
    await store.postLossPreview(HELLO_CANON, "revert");
    expect(lines()).toContain("git -c core.quotePath=false status --short --untracked-files=all -- src/content/blog");
    expect(lines()).toContain("git diff -M -- src/content/blog");
    expect(lines()).toContain("git diff -M --staged -- src/content/blog");
  });

  it('scope "all" widens revert\'s preview to the whole worktree, surfacing a change outside the blog dir', async () => {
    const { store, lines } = newStore(
      { [HELLO_WT_FILE]: HELLO },
      { statusPorcelain: " M astro.config.mjs\n", diffBase: "diff --git a/astro.config.mjs b/astro.config.mjs\n+added a remark plugin\n" },
    );
    await store.openPost(HELLO_CANON);
    const preview = await store.postLossPreview(HELLO_CANON, "revert", "all");
    expect(preview).toEqual({
      dirty: true,
      changedFiles: 1,
      ahead: 0,
      diff: "diff --git a/astro.config.mjs b/astro.config.mjs\n+added a remark plugin\n",
      status: " M astro.config.mjs\n",
      scope: "all",
    });
    expect(lines()).toContain("git -c core.quotePath=false status --short --untracked-files=all");
    expect(lines()).toContain("git diff -M");
  });

  it('auto-picks "all" (no scope requested) when there\'s more to revert than just the post', async () => {
    const { store } = newStore(
      { [HELLO_WT_FILE]: HELLO },
      {
        // Post-scoped: only the post itself changed. Unscoped: the post plus an outside file.
        statusPorcelain: " M src/content/blog/2022-03-11_hello.mdx\n",
        statusPorcelainAll: " M src/content/blog/2022-03-11_hello.mdx\n M astro.config.mjs\n",
        diffBase: "diff --git a/astro.config.mjs b/astro.config.mjs\n+added a remark plugin\n",
      },
    );
    await store.openPost(HELLO_CANON);
    const preview = await store.postLossPreview(HELLO_CANON, "revert");
    expect(preview.scope).toBe("all");
    expect(preview.changedFiles).toBe(2);
  });

  it('auto-picks "post" (no scope requested) when nothing else is dirty', async () => {
    const { store } = newStore(
      { [HELLO_WT_FILE]: HELLO },
      { statusPorcelain: " M src/content/blog/2022-03-11_hello.mdx\n", diffBase: "diff --git a/x b/x\n+y\n" },
    );
    await store.openPost(HELLO_CANON);
    const preview = await store.postLossPreview(HELLO_CANON, "revert");
    expect(preview.scope).toBe("post");
    expect(preview.changedFiles).toBe(1);
  });
});

describe("previewMatchesExpectation", () => {
  const preview = { dirty: true, changedFiles: 2, ahead: 1, diff: "d", status: "s", scope: "post" as const };

  it("matches when both counts agree", () => {
    expect(previewMatchesExpectation(preview, { changedFiles: 2, ahead: 1 })).toBe(true);
  });

  it("mismatches on changedFiles alone", () => {
    expect(previewMatchesExpectation(preview, { changedFiles: 3, ahead: 1 })).toBe(false);
  });

  it("mismatches on ahead alone", () => {
    expect(previewMatchesExpectation(preview, { changedFiles: 2, ahead: 0 })).toBe(false);
  });
});

describe("resolveDestructiveConfirm (TOCTOU guard for delete/revert confirm)", () => {
  it("lets a clean delete proceed regardless of the echoed expectation — nothing at stake to guard", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE }); // clean: cfg default
    await store.openPost(SKYLINE_CANON);
    const result = await resolveDestructiveConfirm(store, "delete", SKYLINE_CANON, undefined, { changedFiles: 99, ahead: 99 });
    expect(result).toEqual({ ok: true, scope: "all" });
  });

  it("lets a no-op revert (nothing uncommitted) proceed regardless of the echoed expectation", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE }); // clean
    await store.openPost(SKYLINE_CANON);
    const result = await resolveDestructiveConfirm(store, "revert", SKYLINE_CANON, "post", { changedFiles: 99, ahead: 0 });
    expect(result).toEqual({ ok: true, scope: "post" });
  });

  it("proceeds, echoing the resolved scope, when the fresh delete preview still matches what was shown", async () => {
    const { store } = newStore(
      { [SKYLINE_WT_FILE]: SKYLINE },
      { statusPorcelain: " M src/content/blog/2026-07-10_aligning-a-skyline.mdx\n" },
    );
    await store.openPost(SKYLINE_CANON);
    const shown = await store.postLossPreview(SKYLINE_CANON, "delete");
    const result = await resolveDestructiveConfirm(store, "delete", SKYLINE_CANON, undefined, {
      changedFiles: shown.changedFiles,
      ahead: shown.ahead,
    });
    expect(result).toEqual({ ok: true, scope: "all" });
  });

  it("refuses a delete confirm when more work lands between the preview pull and the confirm", async () => {
    const cfg = { statusPorcelain: " M src/content/blog/2026-07-10_aligning-a-skyline.mdx\n" };
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE }, cfg);
    await store.openPost(SKYLINE_CANON);

    // The dialog's own preview pull: one uncommitted file.
    const shown = await store.postLossPreview(SKYLINE_CANON, "delete");
    expect(shown.changedFiles).toBe(1);

    // An agent turn (or another editor) lands a second edit before the author confirms.
    cfg.statusPorcelain = " M src/content/blog/2026-07-10_aligning-a-skyline.mdx\n M astro.config.mjs\n";

    // Without the guard this would just delete; prove it refuses instead.
    const result = await resolveDestructiveConfirm(store, "delete", SKYLINE_CANON, undefined, {
      changedFiles: shown.changedFiles,
      ahead: shown.ahead,
    });
    expect(result).toEqual({ ok: false, error: expect.stringContaining("changed") });
  });

  it("refuses a revert confirm when the tree changes between the preview pull and the confirm", async () => {
    // diffBase must be non-empty too, or "atStake" (preview.diff non-empty) never triggers and the
    // guard has nothing to check regardless of the changedFiles mismatch below.
    const cfg = {
      statusPorcelain: " M src/content/blog/2022-03-11_hello.mdx\n",
      diffBase: "diff --git a/x b/x\n-old\n+new\n",
    };
    const { store } = newStore({ [HELLO_WT_FILE]: HELLO }, cfg);
    await store.openPost(HELLO_CANON);

    const shown = await store.postLossPreview(HELLO_CANON, "revert", "post");
    expect(shown.changedFiles).toBe(1);
    expect(shown.diff.trim().length).toBeGreaterThan(0);

    // An agent turn (or another editor) lands a second edit before the author confirms.
    cfg.statusPorcelain = " M src/content/blog/2022-03-11_hello.mdx\n M astro.config.mjs\n";

    // Without the guard this would just revert; prove it refuses instead.
    const result = await resolveDestructiveConfirm(store, "revert", HELLO_CANON, "post", {
      changedFiles: shown.changedFiles,
      ahead: shown.ahead,
    });
    expect(result).toEqual({ ok: false, error: expect.stringContaining("changed") });
  });

  it("echoes the auto-picked scope for a scope-less revert confirm", async () => {
    const { store } = newStore(
      { [HELLO_WT_FILE]: HELLO },
      {
        statusPorcelain: " M src/content/blog/2022-03-11_hello.mdx\n",
        statusPorcelainAll: " M src/content/blog/2022-03-11_hello.mdx\n M astro.config.mjs\n",
        diffBase: "diff --git a/astro.config.mjs b/astro.config.mjs\n+added a remark plugin\n",
      },
    );
    await store.openPost(HELLO_CANON);
    const shown = await store.postLossPreview(HELLO_CANON, "revert");
    expect(shown.scope).toBe("all"); // more to revert than just the post: auto-picked "all".
    const result = await resolveDestructiveConfirm(store, "revert", HELLO_CANON, undefined, {
      changedFiles: shown.changedFiles,
      ahead: shown.ahead,
    });
    expect(result).toEqual({ ok: true, scope: "all" });
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

    const res = await store.revertPost(SKYLINE_CANON, "post");
    expect(res).toEqual({ ok: true, reverted: true });
    expect(lines()).toContain("git checkout HEAD -- src/content/blog/2026-07-10_aligning-a-skyline.mdx");

    const reload = messages.slice(before).find((m) => m.type === "file.changed" && m.path === SKYLINE_CANON);
    expect(reload).toMatchObject({ origin: "agent", text: CLEAN });
  });

  it("is a no-op (reverted:false) when HEAD already matches the working tree", async () => {
    const { store, messages } = newStore({ [SKYLINE_WT_FILE]: SKYLINE }, { checkoutTo: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    const before = messages.length;
    expect(await store.revertPost(SKYLINE_CANON, "post")).toEqual({ ok: true, reverted: false });
    expect(messages.slice(before).some((m) => m.type === "file.changed")).toBe(false);
  });

  it('scope "all" checks out the whole worktree (`.`) instead of just the post', async () => {
    const { store, lines } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    await store.revertPost(SKYLINE_CANON, "all");
    expect(lines()).toContain("git checkout HEAD -- .");
  });
});

describe("ensureWorktree adopts an existing draft branch (open path)", () => {
  const WTP = `${WT}/2026-07-10_aligning-a-skyline`;
  const BRANCH = "blog/2026-07-10_aligning-a-skyline";

  it("adopts a remote-only branch via --track rather than forking a divergent one", async () => {
    // No local branch, but origin/blog/<stem> exists: the fork "checks out" the post via originFiles.
    const { store, lines } = newStore({}, { remoteBranchExists: true, originFiles: { [SKYLINE_WT_FILE]: SKYLINE } });
    const active = await store.openPost(SKYLINE_CANON);

    expect(active.text).toBe(SKYLINE);
    expect(lines()).toContain(`git worktree add --track -b ${BRANCH} ${WTP} origin/${BRANCH}`);
    // Neither a fresh fork off the session branch nor a plain local adopt.
    expect(lines().some((l) => l.includes(`-b ${BRANCH} main`))).toBe(false);
    expect(lines()).not.toContain(`git worktree add ${WTP} ${BRANCH}`);
  });

  it("prefers the local branch when both local and remote exist", async () => {
    const { store, lines } = newStore({ [SKYLINE_WT_FILE]: SKYLINE }, { branchExists: true, remoteBranchExists: true });
    await store.openPost(SKYLINE_CANON);
    expect(lines()).toContain(`git worktree add ${WTP} ${BRANCH}`);
    expect(lines().some((l) => l.includes("--track"))).toBe(false);
  });

  it("forks fresh over a branch already merged into main instead of adopting its (stale) content", async () => {
    // Local and remote both still hold the branch, but it's fully shipped. Squash-merged, so it's
    // not an ancestor of main (git cherry catches it by patch content instead); this repo doesn't
    // delete-on-merge, so a landed PR's branch lingers on origin as dead weight, not a live draft.
    const { store, lines } = newStore(
      {},
      { branchExists: true, remoteBranchExists: true, cherryMerged: true, originFiles: { [SKYLINE_WT_FILE]: SKYLINE } },
    );
    const active = await store.openPost(SKYLINE_CANON);

    expect(active.text).toBe(SKYLINE);
    expect(lines()).toContain(`git branch -D ${BRANCH}`);
    expect(lines()).toContain(`git worktree add ${WTP} -b ${BRANCH} main`);
    expect(lines()).not.toContain(`git worktree add ${WTP} ${BRANCH}`);
    expect(lines().some((l) => l.includes("--track"))).toBe(false);
  });

  it("clears a stale local ref before adopting a live remote draft under the same branch name", async () => {
    // The local ref is old, already-shipped content (merged); origin has since moved the branch
    // forward with new, unmerged commits under the same name. The stale local ref would collide
    // with the `--track -b` create below if it weren't cleared first.
    const { store, lines } = newStore(
      {},
      { branchExists: true, remoteBranchExists: true, localCherryMerged: true, originFiles: { [SKYLINE_WT_FILE]: SKYLINE } },
    );
    const active = await store.openPost(SKYLINE_CANON);

    expect(active.text).toBe(SKYLINE);
    expect(lines()).toContain(`git branch -D ${BRANCH}`);
    expect(lines()).toContain(`git worktree add --track -b ${BRANCH} ${WTP} origin/${BRANCH}`);
  });
});

describe("store.createPost / renamePost refuse a taken draft branch", () => {
  const INPUT = { title: "Aligning a Skyline", slug: "aligning-a-skyline", headline: "on straight lines", created_at: "2026-07-10" };

  it("createPost refuses when a local draft branch already exists (no fork, no write)", async () => {
    const { store, fs, lines } = newStore({}, { branchExists: true });
    const result = await store.createPost(INPUT);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/draft already exists/);
    expect(lines().some((l) => l.startsWith("git worktree add"))).toBe(false);
    expect(fs.store.size).toBe(0);
  });

  it("createPost refuses a remote-only draft branch (would otherwise fork a divergent branch)", async () => {
    const { store, lines } = newStore({}, { remoteBranchExists: true });
    const result = await store.createPost(INPUT);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/on origin/);
    expect(lines().some((l) => l.startsWith("git worktree add"))).toBe(false);
  });

  it("renamePost refuses when the target slug's draft branch exists remote-only", async () => {
    // Seed the hello worktree's .git so opening reuses it (no branch probing during open).
    const { store, lines } = newStore(
      { [`${WT}/2022-03-11_hello/.git`]: "gitdir", [HELLO_WT_FILE]: HELLO },
      { remoteBranchExists: true },
    );
    await store.openPost(HELLO_CANON);
    const result = await store.renamePost(HELLO_CANON, { slug: "goodbye" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/draft already exists/);
    expect(lines().some((l) => l.includes("branch -m"))).toBe(false); // refused before any mutation
  });

  it("createPost does not refuse a same-named branch that's already merged (shipped, not a draft)", async () => {
    const { store, lines } = newStore({}, { branchExists: true, cherryMerged: true });
    const result = await store.createPost(INPUT);
    expect(result.ok).toBe(true);
    expect(lines()).toContain("git branch -D blog/2026-07-10_aligning-a-skyline");
    expect(lines()).toContain(`git worktree add ${WT}/2026-07-10_aligning-a-skyline -b blog/2026-07-10_aligning-a-skyline main`);
  });
});

describe("store name-sync (frontmatter⇄filename)", () => {
  it("reports synced when the frontmatter stem matches the filename", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    await store.openPost(SKYLINE_CANON);
    expect(store.getActiveNameSync()).toEqual({ synced: true });
  });

  it("reports desynced (with expected/current stems) when the frontmatter slug diverges, and broadcasts it", async () => {
    const { store, messages } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    const active = await store.openPost(SKYLINE_CANON);
    const edited = SKYLINE.replace("slug: aligning-a-skyline", "slug: new-slug");
    const before = messages.length;
    await store.writeByPath(SKYLINE_CANON, edited, active.rev);

    expect(store.getActiveNameSync()).toEqual({
      synced: false,
      expectedStem: "2026-07-10_new-slug",
      currentStem: "2026-07-10_aligning-a-skyline",
    });
    // The autosave re-broadcasts name-sync on the same cadence as preview.url.
    const ns = messages.slice(before).filter((m) => m.type === "post.namesync").at(-1);
    expect(ns).toMatchObject({ synced: false, expectedStem: "2026-07-10_new-slug", currentStem: "2026-07-10_aligning-a-skyline" });
  });

  it("reports synced (banner suppressed) when the frontmatter is invalid — the preview error owns it", async () => {
    const { store } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    const active = await store.openPost(SKYLINE_CANON);
    // A timezone-less datetime is invalid frontmatter (WS1), so it's preview-invalid, not a desync.
    const edited = SKYLINE.replace("created_at: 2026-07-10", "created_at: 2026-07-10T22:00:00");
    await store.writeByPath(SKYLINE_CANON, edited, active.rev);
    expect(store.getActiveNameSync()).toEqual({ synced: true });
  });
});

describe("store.completeRename (resolve a desync from the frontmatter)", () => {
  it("renames the file/branch/worktree to match the frontmatter (slug + date), without rewriting it", async () => {
    const { store, fs, lines } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    const active = await store.openPost(SKYLINE_CANON);
    // Desync the frontmatter: a new slug and a new (still date-only, valid) date.
    const edited = SKYLINE.replace("slug: aligning-a-skyline", "slug: skyline").replace("created_at: 2026-07-10", "created_at: 2026-08-01");
    await store.writeByPath(SKYLINE_CANON, edited, active.rev);
    expect(store.getActiveNameSync()).toMatchObject({ synced: false, expectedStem: "2026-08-01_skyline" });

    const result = await store.completeRename(SKYLINE_CANON);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const newCanon = `${BLOG}/2026-08-01_skyline.mdx`;
    expect(result.path).toBe(newCanon);
    // The date change flows through the same branch/worktree machinery (keyed on the new stem).
    expect(lines()).toContain("git -C /repo/.worktrees/blog/2026-07-10_aligning-a-skyline branch -m blog/2026-08-01_skyline");
    expect(lines()).toContain(
      "git worktree move /repo/.worktrees/blog/2026-07-10_aligning-a-skyline /repo/.worktrees/blog/2026-08-01_skyline",
    );
    // Frontmatter is the source of truth: it's left verbatim, and the post is now synced.
    const newWtFile = `${WT}/2026-08-01_skyline/src/content/blog/2026-08-01_skyline.mdx`;
    expect(fs.store.get(newWtFile)).toContain("slug: skyline");
    expect(fs.store.get(newWtFile)).toContain("created_at: 2026-08-01");
    expect(store.getActiveNameSync()).toEqual({ synced: true });
  });

  it("emits post.renamed so the transcript/session migrate (same seam as tab-bar rename)", async () => {
    const { store, messages } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    const active = await store.openPost(SKYLINE_CANON);
    const edited = SKYLINE.replace("slug: aligning-a-skyline", "slug: skyline");
    await store.writeByPath(SKYLINE_CANON, edited, active.rev);
    const before = messages.length;
    const result = await store.completeRename(SKYLINE_CANON);
    expect(result.ok).toBe(true);
    const renamed = messages.slice(before).find((m) => m.type === "post.renamed");
    expect(renamed).toMatchObject({
      type: "post.renamed",
      oldPath: SKYLINE_CANON,
      newPath: `${BLOG}/2026-07-10_skyline.mdx`,
    });
  });

  it("refuses when the frontmatter is invalid (nothing to derive a target from)", async () => {
    const { store, lines } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    const active = await store.openPost(SKYLINE_CANON);
    const edited = SKYLINE.replace("slug: aligning-a-skyline", "slug: Not A Slug");
    await store.writeByPath(SKYLINE_CANON, edited, active.rev);
    const result = await store.completeRename(SKYLINE_CANON);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/invalid/);
    expect(lines().some((l) => l.includes("branch -m"))).toBe(false);
  });
});

describe("store.revertUrl (resolve a desync from the filename side)", () => {
  it("rewrites the frontmatter slug back to the filename stem, with no git rename", async () => {
    const { store, fs, lines, messages } = newStore({ [SKYLINE_WT_FILE]: SKYLINE });
    const active = await store.openPost(SKYLINE_CANON);
    const edited = SKYLINE.replace("slug: aligning-a-skyline", "slug: new-slug");
    await store.writeByPath(SKYLINE_CANON, edited, active.rev);
    expect(store.getActiveNameSync().synced).toBe(false);

    const before = messages.length;
    const res = await store.revertUrl(SKYLINE_CANON);
    expect(res.ok).toBe(true);
    // Frontmatter slug rewritten to the filename's; the post is synced; the path is unchanged (no rename).
    expect(fs.store.get(SKYLINE_WT_FILE)).toContain("slug: aligning-a-skyline");
    expect(store.getActive()?.path).toBe(SKYLINE_CANON);
    expect(store.getActiveNameSync()).toEqual({ synced: true });
    expect(lines().some((l) => l.includes("branch -m") || l.includes("worktree move"))).toBe(false);
    // Announced as an agent-origin write so the editor adopts the rewritten frontmatter.
    expect(messages.slice(before).find((m) => m.type === "file.changed")).toMatchObject({
      origin: "agent",
      path: SKYLINE_CANON,
    });
  });

  it("rewrites created_at to the filename's date (date-only) when the date is what diverged", async () => {
    // Filename says 2022-03-11 but created_at derives 2022-03-12 (a committed-style mismatch).
    const seeded = doc("Hello", "hello", "2022-03-12T02:00:00.000Z");
    const { store, fs } = newStore({ [HELLO_WT_FILE]: seeded });
    await store.openPost(HELLO_CANON);
    expect(store.getActiveNameSync()).toMatchObject({
      synced: false,
      expectedStem: "2022-03-12_hello",
      currentStem: "2022-03-11_hello",
    });

    const res = await store.revertUrl(HELLO_CANON);
    expect(res.ok).toBe(true);
    // created_at rewritten to the filename's date (date-only, timezone-unambiguous, and quoted so
    // Astro's YAML keeps it a string); slug already matched.
    expect(fs.store.get(HELLO_WT_FILE)).toContain('created_at: "2022-03-11"');
    expect(store.getActiveNameSync()).toEqual({ synced: true });
  });
});
