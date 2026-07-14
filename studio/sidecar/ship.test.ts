// Ship-flow tests: a fake GitRunner and fixed worktree assert the command sequence (assert branch,
// stage precisely, commit with the pinned identity, push, open the PR), plus the confirm gate, the
// identity assertion, the scope guard, and partial-failure recovery.

import { describe, expect, it } from "vitest";

import type { GitRunner, RunResult } from "../shared/seams";
import type { OpenPrInput } from "../shared/mcpTools";
import type { ActiveWorktree } from "../state/store";

import { createShipService } from "./ship";

type Handler = (bin: "git" | "gh", args: readonly string[]) => Partial<RunResult>;

interface Recorded {
  bin: "git" | "gh";
  line: string;
  cwd?: string;
}

function makeGit(handler: Handler): { git: GitRunner; calls: Recorded[]; lines: () => string[] } {
  const calls: Recorded[] = [];
  const run =
    (bin: "git" | "gh") =>
    async (args: readonly string[], opts?: { cwd?: string }): Promise<RunResult> => {
      calls.push({ bin, line: `${bin} ${args.join(" ")}`, cwd: opts?.cwd });
      const r = handler(bin, args);
      return { stdout: r.stdout ?? "", stderr: r.stderr ?? "", code: r.code ?? 0 };
    };
  return { git: { git: run("git"), gh: run("gh") }, calls, lines: () => calls.map((c) => c.line) };
}

const WT_PATH = "/repo/.worktrees/blog/aligning-a-skyline";
const BLOG_PATH = "src/content/blog/2026-07-10_aligning-a-skyline.mdx";
const PR_URL = "https://github.com/rfrowe/ryan.rowe.codes/pull/1";

const WORKTREE: ActiveWorktree = {
  slug: "aligning-a-skyline",
  branch: "blog/aligning-a-skyline",
  worktreePath: WT_PATH,
  worktreeFilePath: `${WT_PATH}/${BLOG_PATH}`,
  relPath: BLOG_PATH,
  canonicalPath: `/repo/${BLOG_PATH}`,
};

// Strip leading global `-c key=val` options so matchers key off the subcommand.
function subcommand(args: readonly string[]): string {
  const rest = [...args];
  while (rest[0] === "-c") rest.splice(0, 2);
  return rest.join(" ");
}

// Happy-path responder. Individual tests wrap it to inject a single failure.
function happy(bin: "git" | "gh", args: readonly string[]): Partial<RunResult> {
  const a = subcommand(args);
  if (bin === "gh") {
    if (a.startsWith("pr create")) return { stdout: `${PR_URL}\n` };
    return {};
  }
  if (a.startsWith("rev-parse --abbrev-ref HEAD")) return { stdout: "blog/aligning-a-skyline\n" };
  // The session branch exists on origin (the ship gate); `--verify` falls through to code 0 below.
  if (a.startsWith("status --porcelain")) return { stdout: ` M ${BLOG_PATH}\n` };
  if (a.startsWith("status --short")) return { stdout: ` M ${BLOG_PATH}\n` };
  if (a.startsWith("diff --name-only")) return { stdout: `${BLOG_PATH}\n` }; // scope assertion
  if (a.startsWith("diff --no-index")) return { code: 1, stdout: "" };
  if (a.startsWith("diff --staged")) return { stdout: "" };
  if (a.startsWith("diff")) return { stdout: `diff --git a/${BLOG_PATH} b/${BLOG_PATH}\n` };
  if (a.startsWith("log -1")) return { stdout: "Ryan Rowe <ryan@rowe.codes>\n" };
  return { code: 0 }; // add / commit / push
}

function withOverride(base: Handler, override: Handler): Handler {
  return (bin, args) => {
    const o = override(bin, args);
    return Object.keys(o).length > 0 ? o : base(bin, args);
  };
}

const ship = (handler: Handler, wt: ActiveWorktree | null = WORKTREE, sessionBranch = "main") =>
  createShipService({
    git: makeGit(handler).git,
    sessionBranch,
    getActiveWorktree: () => wt,
    getActiveNameSync: () => ({ synced: true }),
  });

const baseInput: OpenPrInput = {
  branch: "nobug/blog-aligning-a-skyline",
  subject: "Add the skyline post",
  body: "A post about aligning a skyline.",
  scope: "post",
  confirm: true,
};

describe("createShipService.openPr", () => {
  it("runs the simplified happy-path sequence and returns the PR URL", async () => {
    const { git, calls, lines } = makeGit(happy);
    const svc = createShipService({ git, sessionBranch: "main", getActiveWorktree: () => WORKTREE, getActiveNameSync: () => ({ synced: true }) });

    const res = await svc.openPr(baseInput);
    expect(res).toEqual({ ok: true, prUrl: PR_URL });

    const seq = lines();
    const idx = (needle: string) => seq.findIndex((l) => l.includes(needle));

    // Every git/gh call runs inside the post's worktree.
    expect(calls.every((c) => c.cwd === WT_PATH)).toBe(true);
    // The worktree's branch is asserted; there's no fetch/checkout dance.
    expect(seq.some((l) => l.includes("rev-parse --abbrev-ref HEAD"))).toBe(true);
    expect(seq.some((l) => l.includes("fetch") || l.includes("checkout"))).toBe(false);
    // Never `git add -A` / `git add .`; only the explicit blog path.
    expect(seq.some((l) => /add -A|add \.$/.test(l))).toBe(false);
    expect(seq).toContain(`git add -- ${BLOG_PATH}`);
    // Pinned identity on the commit.
    expect(seq.some((l) => l.includes("commit") && l.includes("user.name=Ryan Rowe") && l.includes("user.email=ryan@rowe.codes"))).toBe(true);
    // Push the worktree's own branch as-is (blog/<slug>); no refspec, no nobug/ translation.
    expect(seq).toContain("git push -u origin blog/aligning-a-skyline");
    // PR opens against the session branch, from that same branch.
    expect(seq.some((l) => l.includes("pr create") && l.includes("--base main") && l.includes("--head blog/aligning-a-skyline"))).toBe(true);

    // Ordering: assert-branch, add, commit, identity check, push, pr create.
    expect(idx("rev-parse --abbrev-ref HEAD")).toBeLessThan(idx("git add --"));
    expect(idx("git add --")).toBeLessThan(idx("commit"));
    expect(idx("commit")).toBeLessThan(idx("log -1"));
    expect(idx("log -1")).toBeLessThan(idx("push"));
    expect(idx("push")).toBeLessThan(idx("pr create"));
  });

  it("targets the session branch as the PR base", async () => {
    const { git, lines } = makeGit(happy);
    const svc = createShipService({
      git,
      sessionBranch: "feat/x",
      getActiveWorktree: () => WORKTREE,
      getActiveNameSync: () => ({ synced: true }),
    });
    const res = await svc.openPr(baseInput);
    expect(res).toEqual({ ok: true, prUrl: PR_URL });
    expect(lines().some((l) => l.includes("pr create") && l.includes("--base feat/x"))).toBe(true);
    // Unshipped-scope + range checks measure against origin/<sessionBranch>.
    expect(lines()).toContain("git -c core.quotePath=false diff --name-only origin/feat/x...HEAD");
  });

  it("refuses to ship when the session branch is not on origin, before any commit or push", async () => {
    const handler = withOverride(happy, (bin, args) =>
      bin === "git" && subcommand(args).startsWith("rev-parse --verify") ? { code: 1 } : {},
    );
    const { git, lines } = makeGit(handler);
    const svc = createShipService({
      git,
      sessionBranch: "feat/x",
      getActiveWorktree: () => WORKTREE,
      getActiveNameSync: () => ({ synced: true }),
    });
    const res = await svc.openPr(baseInput);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/isn't on origin/);
    const seq = lines();
    expect(seq.some((l) => l.includes("commit"))).toBe(false);
    expect(seq.some((l) => l.includes("push"))).toBe(false);
    expect(seq.some((l) => l.includes("pr create"))).toBe(false);
  });

  it("blocks on the confirm gate with no git/gh side effects", async () => {
    const { git, calls } = makeGit(happy);
    const svc = createShipService({ git, sessionBranch: "main", getActiveWorktree: () => WORKTREE, getActiveNameSync: () => ({ synced: true }) });
    const res = await svc.openPr({ ...baseInput, confirm: false });
    expect(res).toEqual({ ok: false, error: "confirmation required" });
    expect(calls).toHaveLength(0);
  });

  it("refuses a frontmatter⇄filename desync before any git/gh side effect", async () => {
    const { git, calls } = makeGit(happy);
    const svc = createShipService({
      git,
      sessionBranch: "main",
      getActiveWorktree: () => WORKTREE,
      getActiveNameSync: () => ({
        synced: false,
        expectedStem: "2026-07-10_new-slug",
        currentStem: "2026-07-10_aligning-a-skyline",
      }),
    });
    const res = await svc.openPr(baseInput);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/doesn't match its filename/);
      expect(res.error).toMatch(/2026-07-10_new-slug/);
    }
    expect(calls).toHaveLength(0); // gated before commit/push/PR
  });

  it("errors when there is no active post to ship", async () => {
    const { git, calls } = makeGit(happy);
    const svc = createShipService({ git, sessionBranch: "main", getActiveWorktree: () => null, getActiveNameSync: () => ({ synced: true }) });
    const res = await svc.openPr(baseInput);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/no active post/);
    expect(calls).toHaveLength(0);
  });

  it("refuses when the worktree is not on the post's branch", async () => {
    const handler = withOverride(happy, (bin, args) =>
      bin === "git" && subcommand(args).startsWith("rev-parse --abbrev-ref HEAD") ? { stdout: "some-other-branch\n" } : {},
    );
    const { git, lines } = makeGit(handler);
    const svc = createShipService({ git, sessionBranch: "main", getActiveWorktree: () => WORKTREE, getActiveNameSync: () => ({ synced: true }) });
    const res = await svc.openPr(baseInput);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/expected the post's branch/);
    expect(lines().some((l) => l.includes("commit"))).toBe(false);
  });

  it("aborts before push when HEAD identity is not the pinned author", async () => {
    const handler = withOverride(happy, (bin, args) =>
      bin === "git" && args.join(" ").startsWith("log -1") ? { stdout: "Someone Else <x@example.com>\n" } : {},
    );
    const { git, lines } = makeGit(handler);
    const svc = createShipService({ git, sessionBranch: "main", getActiveWorktree: () => WORKTREE, getActiveNameSync: () => ({ synced: true }) });
    const res = await svc.openPr(baseInput);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/identity assertion failed/);
    const seq = lines();
    expect(seq.some((l) => l.includes("commit"))).toBe(true);
    expect(seq.some((l) => l.includes("push"))).toBe(false);
    expect(seq.some((l) => l.includes("pr create"))).toBe(false);
  });

  it('aborts scope "all" when there are changes outside the blog tree (never git add -A)', async () => {
    const handler = withOverride(happy, (bin, args) =>
      bin === "git" && args.join(" ").includes("status --porcelain") ? { stdout: ` M ${BLOG_PATH}\n?? .indeed/\n` } : {},
    );
    const { git, lines } = makeGit(handler);
    const svc = createShipService({ git, sessionBranch: "main", getActiveWorktree: () => WORKTREE, getActiveNameSync: () => ({ synced: true }) });
    const res = await svc.openPr({ ...baseInput, scope: "all" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/\.indeed\//);
    expect(lines().some((l) => l.includes("commit"))).toBe(false);
  });

  it("reports commit-ok/push-fail with a recovery hint and does not create a PR", async () => {
    const handler = withOverride(happy, (bin, args) =>
      bin === "git" && args.join(" ").startsWith("push") ? { code: 1, stderr: "remote: rejected" } : {},
    );
    const { git, lines } = makeGit(handler);
    const svc = createShipService({ git, sessionBranch: "main", getActiveWorktree: () => WORKTREE, getActiveNameSync: () => ({ synced: true }) });
    const res = await svc.openPr(baseInput);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/committed locally.*not pushed/s);
    expect(lines().some((l) => l.includes("pr create"))).toBe(false);
  });

  it("reports push-ok/PR-fail with a recovery hint", async () => {
    const handler = withOverride(happy, (bin, args) =>
      bin === "gh" && args.join(" ").startsWith("pr create") ? { code: 1, stderr: "gh: could not create PR" } : {},
    );
    const svc = ship(handler);
    const res = await svc.openPr(baseInput);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/is pushed but no PR was created/);
  });

  it("refuses to push when the branch diff vs base includes paths outside the blog dir", async () => {
    const handler = withOverride(happy, (bin, args) =>
      bin === "git" && subcommand(args).startsWith("diff --name-only")
        ? { stdout: `${BLOG_PATH}\nastro.config.mjs\n` }
        : {},
    );
    const { git, lines } = makeGit(handler);
    const svc = createShipService({ git, sessionBranch: "main", getActiveWorktree: () => WORKTREE, getActiveNameSync: () => ({ synced: true }) });
    const res = await svc.openPr(baseInput);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/outside src\/content\/blog/);
      expect(res.error).toMatch(/NOT pushed/);
    }
    const seq = lines();
    expect(seq.some((l) => l.includes("commit"))).toBe(true);
    expect(seq.some((l) => l.includes("push"))).toBe(false);
  });

  it("stages and ships a post with a non-ASCII path (core.quotePath=false)", async () => {
    const CAFE_PATH = "src/content/blog/2026-07-10_café.mdx";
    const handler = withOverride(happy, (bin, args) => {
      const a = subcommand(args);
      if (bin === "git" && a.startsWith("status --porcelain")) return { stdout: ` A ${CAFE_PATH}\n` };
      if (bin === "git" && a.startsWith("diff --name-only")) return { stdout: `${CAFE_PATH}\n` };
      return {};
    });
    const { git, lines } = makeGit(handler);
    const svc = createShipService({ git, sessionBranch: "main", getActiveWorktree: () => WORKTREE, getActiveNameSync: () => ({ synced: true }) });
    const res = await svc.openPr(baseInput);
    expect(res).toEqual({ ok: true, prUrl: PR_URL });
    expect(lines()).toContain("git -c core.quotePath=false status --porcelain");
    expect(lines()).toContain(`git add -- ${CAFE_PATH}`);
  });
});

describe("createShipService.diff", () => {
  it('scopes to the blog dir for "post" and runs inside the worktree', async () => {
    const { git, calls, lines } = makeGit(happy);
    const svc = createShipService({ git, sessionBranch: "main", getActiveWorktree: () => WORKTREE, getActiveNameSync: () => ({ synced: true }) });
    const res = await svc.diff("post");
    expect(res.status).toContain(BLOG_PATH);
    expect(res.diff).toContain("diff --git");
    expect(calls.every((c) => c.cwd === WT_PATH)).toBe(true);
    const seq = lines();
    expect(seq).toContain("git -c core.quotePath=false status --short --untracked-files=all -- src/content/blog");
    expect(seq).toContain("git diff -- src/content/blog");
    expect(seq).toContain("git diff --staged -- src/content/blog");
  });

  it("returns empty output when there is no active post", async () => {
    const { git, calls } = makeGit(happy);
    const svc = createShipService({ git, sessionBranch: "main", getActiveWorktree: () => null, getActiveNameSync: () => ({ synced: true }) });
    const res = await svc.diff("post");
    expect(res).toEqual({ status: "", diff: "" });
    expect(calls).toHaveLength(0);
  });

  it("includes untracked (new) posts in the review diff", async () => {
    const NEW_POST = "src/content/blog/2026-07-11_brand-new.mdx";
    const handler = withOverride(happy, (bin, args) => {
      const a = subcommand(args);
      if (bin === "git" && a.startsWith("status --short")) return { stdout: `?? ${NEW_POST}\n` };
      if (bin === "git" && a.startsWith("diff --no-index")) {
        return { code: 1, stdout: `diff --git a/dev/null b/${NEW_POST}\n@@ -0,0 +1 @@\n+brand new untracked body\n` };
      }
      if (bin === "git" && a.startsWith("diff")) return { stdout: "" };
      return {};
    });
    const { git, lines } = makeGit(handler);
    const svc = createShipService({ git, sessionBranch: "main", getActiveWorktree: () => WORKTREE, getActiveNameSync: () => ({ synced: true }) });
    const res = await svc.diff("post");
    expect(res.diff).toContain("brand new untracked body");
    expect(lines()).toContain(`git diff --no-index -- /dev/null ${NEW_POST}`);
  });
});
