// Unit tests for the status/diff computations shared by ship, save-draft, revert, and delete.

import { describe, expect, it } from "vitest";

import type { GitRunner, RunResult } from "../shared/seams";
import {
  BLOG_CONTENT_DIR,
  buildPushFailure,
  classifyPushFailure,
  computeDiffAgainstRef,
  computeDivergence,
  computeForcePushLossPreview,
  computeWorkingTreeDiff,
  countOutsideBlog,
  parseStatusPaths,
  scopePathspec,
  synthesizeUntrackedDiffs,
  underBlog,
  untrackedPaths,
} from "./diffService";

type Handler = (args: readonly string[]) => Partial<RunResult>;

function makeGit(handler: Handler): { git: GitRunner; lines: () => string[] } {
  const calls: string[] = [];
  const run = async (args: readonly string[]): Promise<RunResult> => {
    calls.push(`git ${args.join(" ")}`);
    const r = handler(args);
    return { stdout: r.stdout ?? "", stderr: r.stderr ?? "", code: r.code ?? 0 };
  };
  return { git: { git: run, gh: run }, lines: () => calls };
}

// Strip leading `-c key=val` globals so handlers can match on the subcommand.
function subcommand(args: readonly string[]): string {
  const rest = [...args];
  while (rest[0] === "-c") rest.splice(0, 2);
  return rest.join(" ");
}

describe("scopePathspec / underBlog", () => {
  it('"post" scopes to the blog content dir', () => {
    expect(scopePathspec("post")).toEqual(["--", BLOG_CONTENT_DIR]);
  });

  it('"all" is an empty pathspec (the whole worktree, relative to cwd)', () => {
    expect(scopePathspec("all")).toEqual([]);
  });

  it("underBlog matches the dir itself and anything nested under it, not a sibling with the same prefix", () => {
    expect(underBlog(BLOG_CONTENT_DIR)).toBe(true);
    expect(underBlog(`${BLOG_CONTENT_DIR}/2026-07-10_post.mdx`)).toBe(true);
    expect(underBlog("src/content/blog-archive/x.mdx")).toBe(false);
    expect(underBlog("astro.config.mjs")).toBe(false);
  });
});

describe("parseStatusPaths / untrackedPaths", () => {
  it("parses porcelain/short v1 lines, unwrapping a rename to its new path", () => {
    const status = " M src/content/blog/a.mdx\nR  src/content/blog/old.mdx -> src/content/blog/new.mdx\n?? src/content/blog/c.mdx\n";
    expect(parseStatusPaths(status)).toEqual(["src/content/blog/a.mdx", "src/content/blog/new.mdx", "src/content/blog/c.mdx"]);
  });

  it("untrackedPaths returns only the ?? entries", () => {
    const status = " M src/content/blog/a.mdx\n?? src/content/blog/b.mdx\n?? astro.config.mjs\n";
    expect(untrackedPaths(status)).toEqual(["src/content/blog/b.mdx", "astro.config.mjs"]);
  });

  it("unwraps a quoted path (control chars, with core.quotePath=false)", () => {
    expect(parseStatusPaths(' M "src/content/blog/weird\\tname.mdx"\n')).toEqual(["src/content/blog/weird\\tname.mdx"]);
  });
});

describe("countOutsideBlog", () => {
  it("counts tracked and untracked paths outside the blog dir, unscoped regardless of any pathspec", async () => {
    const { git, lines } = makeGit(() => ({
      stdout: " M src/content/blog/a.mdx\n M astro.config.mjs\n?? scripts/new-tool.mjs\n",
    }));
    expect(await countOutsideBlog(git, "/wt")).toBe(2);
    expect(lines()).toEqual(["git -c core.quotePath=false status --porcelain --untracked-files=all"]);
  });

  it("is zero when every change is under the blog dir", async () => {
    const { git } = makeGit(() => ({ stdout: " M src/content/blog/a.mdx\n?? src/content/blog/b.mdx\n" }));
    expect(await countOutsideBlog(git, "/wt")).toBe(0);
  });
});

describe("synthesizeUntrackedDiffs", () => {
  it("runs one --no-index diff per path and drops empty results", async () => {
    const { git, lines } = makeGit((args) => {
      if (args.includes("b.mdx")) return { code: 1, stdout: "diff --git a/dev/null b/b.mdx\n+new\n" };
      return { code: 1, stdout: "" }; // --no-index always exits non-zero vs /dev/null
    });
    const parts = await synthesizeUntrackedDiffs(git, "/wt", ["a.mdx", "b.mdx"]);
    expect(parts).toEqual(["diff --git a/dev/null b/b.mdx\n+new\n"]);
    expect(lines()).toEqual(["git diff --no-index -- /dev/null a.mdx", "git diff --no-index -- /dev/null b.mdx"]);
  });
});

describe("computeWorkingTreeDiff", () => {
  it("scopes status/diff to the blog dir for \"post\", combining unstaged + staged with rename detection", async () => {
    const { git, lines } = makeGit((args) => {
      const a = subcommand(args);
      if (a.startsWith("status")) return { stdout: " M src/content/blog/a.mdx\n" };
      if (a.includes("--staged")) return { stdout: "" };
      return { stdout: "diff --git a/x b/x\n+y\n" };
    });
    const res = await computeWorkingTreeDiff(git, "/wt", "post");
    expect(res).toEqual({ status: " M src/content/blog/a.mdx\n", diff: "diff --git a/x b/x\n+y\n", changedFiles: 1 });
    expect(lines()).toContain("git -c core.quotePath=false status --short --untracked-files=all -- src/content/blog");
    expect(lines()).toContain("git diff -M -- src/content/blog");
    expect(lines()).toContain("git diff -M --staged -- src/content/blog");
  });

  it('"all" drops the pathspec entirely', async () => {
    const { git, lines } = makeGit(() => ({ stdout: "" }));
    await computeWorkingTreeDiff(git, "/wt", "all");
    expect(lines()).toContain("git -c core.quotePath=false status --short --untracked-files=all");
    expect(lines()).toContain("git diff -M");
    expect(lines()).toContain("git diff -M --staged");
  });

  it("excludes untracked files from both the count and the diff by default (no HEAD state)", async () => {
    const { git } = makeGit((args) => {
      const a = subcommand(args);
      if (a.startsWith("status")) return { stdout: "?? src/content/blog/new.mdx\n" };
      return { stdout: "" };
    });
    const res = await computeWorkingTreeDiff(git, "/wt", "post");
    expect(res).toEqual({ status: "?? src/content/blog/new.mdx\n", diff: "", changedFiles: 0 });
  });

  it("includeUntracked synthesizes an add-diff per untracked file (ship/save-draft: they'll be staged)", async () => {
    const { git } = makeGit((args) => {
      const a = subcommand(args);
      if (a.startsWith("status")) return { stdout: "?? src/content/blog/new.mdx\n" };
      if (args.includes("--no-index")) return { code: 1, stdout: "diff --git a/dev/null b/new.mdx\n+brand new\n" };
      return { stdout: "" };
    });
    const res = await computeWorkingTreeDiff(git, "/wt", "post", { includeUntracked: true });
    expect(res.diff).toBe("diff --git a/dev/null b/new.mdx\n+brand new\n");
    expect(res.changedFiles).toBe(0); // still untracked, so not "changed" relative to HEAD
  });
});

describe("computeDiffAgainstRef", () => {
  it("diffs against the ref's merge-base with HEAD (not the ref directly), with rename detection and untracked counting", async () => {
    const { git, lines } = makeGit((args) => {
      const a = subcommand(args);
      if (a.startsWith("status")) return { stdout: " M src/content/blog/a.mdx\n?? astro.config.mjs\n" };
      if (a.startsWith("merge-base")) return { stdout: "deadbeef\n" };
      if (args.includes("--no-index")) return { code: 1, stdout: "diff --git a/dev/null b/astro.config.mjs\n+plugin\n" };
      return { stdout: "diff --git a/a b/a\n+z\n" };
    });
    const res = await computeDiffAgainstRef(git, "/wt", "main", "all");
    expect(res.changedFiles).toBe(2);
    expect(res.diff).toBe("diff --git a/a b/a\n+z\n\ndiff --git a/dev/null b/astro.config.mjs\n+plugin\n");
    expect(lines()).toContain("git merge-base main HEAD");
    // Diffs from the merge-base commit, not "main" itself: if main has moved on since the fork,
    // a direct diff against main would surface that drift as if this branch had introduced it.
    expect(lines()).toContain("git -c core.quotePath=false diff -M deadbeef");
    expect(lines()).not.toContain("git -c core.quotePath=false diff -M main");
  });

  it("skips the ref-relative diff (rather than falling back to the raw ref) when merge-base fails", async () => {
    const { git, lines } = makeGit((args) => {
      const a = subcommand(args);
      if (a.startsWith("status")) return { stdout: "?? src/content/blog/new.mdx\n" };
      if (a.startsWith("merge-base")) return { code: 1, stdout: "" };
      if (args.includes("--no-index")) return { code: 1, stdout: "diff --git a/dev/null b/new.mdx\n+new\n" };
      return { stdout: "should not be used" };
    });
    const res = await computeDiffAgainstRef(git, "/wt", "main", "all");
    expect(res.diff).toBe("diff --git a/dev/null b/new.mdx\n+new\n");
    expect(lines()).toContain("git merge-base main HEAD");
    // A failed merge-base must not fall back to diffing "main" directly — that's the exact drift
    // this function exists to avoid.
    expect(lines().some((l) => l.startsWith("git -c core.quotePath=false diff -M"))).toBe(false);
  });

  it("skips the ref-relative diff (but keeps status + untracked synthesis) when ref is null", async () => {
    const { git, lines } = makeGit((args) => {
      const a = subcommand(args);
      if (a.startsWith("status")) return { stdout: "?? src/content/blog/new.mdx\n" };
      if (args.includes("--no-index")) return { code: 1, stdout: "diff --git a/dev/null b/new.mdx\n+new\n" };
      return { stdout: "should not be used" };
    });
    const res = await computeDiffAgainstRef(git, "/wt", null, "all");
    expect(res.diff).toBe("diff --git a/dev/null b/new.mdx\n+new\n");
    expect(lines().some((l) => l.startsWith("git merge-base"))).toBe(false);
    expect(lines().some((l) => l.startsWith("git -c core.quotePath=false diff -M"))).toBe(false);
  });
});

describe("computeDivergence", () => {
  it("returns onOrigin:false and never runs rev-list when the origin ref is absent", async () => {
    const { git, lines } = makeGit((args) => (args.includes("rev-parse") ? { code: 1 } : {}));
    expect(await computeDivergence(git, "/wt", "main")).toEqual({ onOrigin: false, ahead: 0, behind: 0 });
    expect(lines().some((l) => l.includes("rev-list"))).toBe(false);
  });

  it("parses left(behind)/right(ahead) from rev-list --left-right --count", async () => {
    const { git, lines } = makeGit((args) => {
      if (args.includes("rev-parse")) return { code: 0 };
      if (args.includes("rev-list")) return { stdout: "2\t3\n" };
      return {};
    });
    expect(await computeDivergence(git, "/wt", "main")).toEqual({ onOrigin: true, behind: 2, ahead: 3 });
    expect(lines()).toContain("git rev-list --left-right --count origin/main...HEAD");
  });

  it("treats an ahead-only count as not behind (the post's own commits never warn)", async () => {
    const { git } = makeGit((args) => {
      if (args.includes("rev-parse")) return { code: 0 };
      if (args.includes("rev-list")) return { stdout: "0\t5" };
      return {};
    });
    expect(await computeDivergence(git, "/wt", "main")).toEqual({ onOrigin: true, behind: 0, ahead: 5 });
  });

  it("reports behind when origin's base carries commits this HEAD lacks", async () => {
    const { git } = makeGit((args) => {
      if (args.includes("rev-parse")) return { code: 0 };
      if (args.includes("rev-list")) return { stdout: "4\t0" };
      return {};
    });
    expect(await computeDivergence(git, "/wt", "main")).toEqual({ onOrigin: true, behind: 4, ahead: 0 });
  });
});

describe("classifyPushFailure", () => {
  it("recognizes a plain non-fast-forward rejection", () => {
    const stderr = "! [rejected]        blog/foo -> blog/foo (fetch first)\nerror: failed to push some refs";
    expect(classifyPushFailure(stderr)).toBe("non-ff");
  });

  it("recognizes a stale --force-with-lease rejection ahead of the generic \"rejected\" match", () => {
    const stderr = "! [rejected]        blog/foo -> blog/foo (stale info)\nerror: failed to push some refs";
    expect(classifyPushFailure(stderr)).toBe("stale-lease");
  });

  it("recognizes an auth failure", () => {
    expect(classifyPushFailure("fatal: Authentication failed for 'https://github.com/x/y.git/'")).toBe("auth");
    expect(classifyPushFailure("remote: Permission to x/y.git denied to someone.")).toBe("auth");
  });

  it("recognizes a network failure", () => {
    expect(classifyPushFailure("fatal: unable to access '...': Could not resolve host: github.com")).toBe("network");
  });

  it("falls back to \"other\" for anything unrecognized", () => {
    expect(classifyPushFailure("fatal: something unexpected")).toBe("other");
  });
});

describe("computeForcePushLossPreview", () => {
  it("is empty when the remote-tracking ref doesn't exist", async () => {
    const { git, lines } = makeGit((args) => (args.includes("rev-parse") ? { code: 1 } : {}));
    expect(await computeForcePushLossPreview(git, "/wt", "blog/foo")).toEqual({ remoteOnlyCommits: [], diff: "" });
    expect(lines().some((l) => l.startsWith("git log") || l.startsWith("git diff"))).toBe(false);
  });

  it("lists remote-only commits and their accumulated diff", async () => {
    const { git, lines } = makeGit((args) => {
      const a = subcommand(args);
      if (a.startsWith("rev-parse")) return { code: 0 };
      if (a.startsWith("log")) return { stdout: "abc1234 fix typo\ndef5678 add section\n" };
      if (a.startsWith("diff")) return { stdout: "diff --git a/x b/x\n+remote change\n" };
      return {};
    });
    const res = await computeForcePushLossPreview(git, "/wt", "blog/foo");
    expect(res).toEqual({
      remoteOnlyCommits: ["abc1234 fix typo", "def5678 add section"],
      diff: "diff --git a/x b/x\n+remote change\n",
    });
    expect(lines()).toContain("git log --format=%h %s HEAD..origin/blog/foo");
    expect(lines()).toContain("git -c core.quotePath=false diff -M HEAD...origin/blog/foo");
  });
});

describe("buildPushFailure", () => {
  it("fetches and previews the loss for a non-ff rejection", async () => {
    const { git, lines } = makeGit((args) => {
      const a = subcommand(args);
      if (a.startsWith("rev-parse")) return { code: 0 };
      if (a.startsWith("log")) return { stdout: "abc1234 remote commit\n" };
      if (a.startsWith("diff")) return { stdout: "diff --git a/x b/x\n+remote\n" };
      return {};
    });
    const res = await buildPushFailure(git, "/wt", "blog/foo", "! [rejected] blog/foo -> blog/foo (fetch first)");
    expect(res).toEqual({
      reason: "non-ff",
      remoteOnlyCommits: ["abc1234 remote commit"],
      diff: "diff --git a/x b/x\n+remote\n",
    });
    expect(lines()).toContain("git fetch origin blog/foo");
  });

  it("fetches and previews the loss for a stale-lease rejection", async () => {
    const { git, lines } = makeGit((args) => {
      const a = subcommand(args);
      if (a.startsWith("rev-parse")) return { code: 0 };
      if (a.startsWith("log")) return { stdout: "" };
      return {};
    });
    const res = await buildPushFailure(git, "/wt", "blog/foo", "! [rejected] blog/foo -> blog/foo (stale info)");
    expect(res.reason).toBe("stale-lease");
    expect(lines()).toContain("git fetch origin blog/foo");
  });

  it("skips the fetch and preview for a failure a force can't fix", async () => {
    const { git, lines } = makeGit(() => ({}));
    const res = await buildPushFailure(git, "/wt", "blog/foo", "fatal: Authentication failed");
    expect(res).toEqual({ reason: "auth", remoteOnlyCommits: [], diff: "" });
    expect(lines()).toEqual([]);
  });
});
