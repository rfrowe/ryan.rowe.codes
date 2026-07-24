import { describe, expect, it } from "vitest";
import { mergePaletteEntries } from "./CommandPalette";
import type { TabDescriptor } from "./TabBar";
import type { GitPostState } from "../../shared/protocol";

function post(path: string, overrides: Partial<GitPostState> = {}): GitPostState {
  return {
    path,
    stem: path,
    branch: `blog/${path}`,
    open: false,
    hasWorktree: true,
    onRemote: false,
    inRoot: false,
    ahead: 0,
    unpushed: 0,
    incoming: 0,
    behind: 0,
    uncommitted: false,
    rebase: { phase: "idle", conflictedFiles: [] },
    ...overrides,
  };
}

describe("mergePaletteEntries", () => {
  it("includes every post from the main tree, not just open tabs", () => {
    const posts = [{ path: "/repo/algorithmic-art.mdx", title: "Algorithmic Art" }];
    const entries = mergePaletteEntries([], posts, []);
    expect(entries).toEqual([{ path: "/repo/algorithmic-art.mdx", title: "Algorithmic Art", open: false }]);
  });

  it("keeps a post's position in the main-tree order", () => {
    const posts = [
      { path: "/repo/a.mdx", title: "A" },
      { path: "/repo/b.mdx", title: "B" },
    ];
    const entries = mergePaletteEntries([], posts, []);
    expect(entries.map((e) => e.path)).toEqual(["/repo/a.mdx", "/repo/b.mdx"]);
  });

  it("open tabs are deduped against posts, keeping the open (title-bearing) entry", () => {
    const tabs: TabDescriptor[] = [{ path: "/repo/a.mdx", title: "A (editing)" }];
    const posts = [{ path: "/repo/a.mdx", title: "A" }];
    const entries = mergePaletteEntries(tabs, posts, []);
    expect(entries).toEqual([{ path: "/repo/a.mdx", title: "A (editing)", open: true }]);
  });

  it("an open tab with no matching post (a brand-new draft) still appears", () => {
    const tabs: TabDescriptor[] = [{ path: "/repo/new-draft.mdx", title: "New Draft" }];
    const entries = mergePaletteEntries(tabs, [], []);
    expect(entries).toEqual([{ path: "/repo/new-draft.mdx", title: "New Draft", open: true }]);
  });

  it("treats posts as empty while still loading (null)", () => {
    const tabs: TabDescriptor[] = [{ path: "/repo/a.mdx", title: "A" }];
    const entries = mergePaletteEntries(tabs, null, []);
    expect(entries).toEqual([{ path: "/repo/a.mdx", title: "A", open: true }]);
  });

  it("a post known only to git (pushed, unmerged, no worktree, not an open tab) still appears", () => {
    const gitPosts = [post("/repo/src/content/blog/2026-07-22_agentic-blog-studio/post.mdx", { hasWorktree: false, onRemote: true })];
    const entries = mergePaletteEntries([], [], gitPosts);
    expect(entries).toEqual([
      {
        path: "/repo/src/content/blog/2026-07-22_agentic-blog-studio/post.mdx",
        title: "agentic-blog-studio",
        open: false,
      },
    ]);
  });

  it("a git-only entry's title falls back to its slug, since there's no frontmatter to read locally", () => {
    const gitPosts = [post("/repo/src/content/blog/no-frontmatter-here/post.mdx")];
    const entries = mergePaletteEntries([], [], gitPosts);
    expect(entries[0]?.title).toBe("no-frontmatter-here");
  });

  it("doesn't duplicate or override a post already known via open tabs or the main tree", () => {
    const tabs: TabDescriptor[] = [{ path: "/repo/a.mdx", title: "A (editing)" }];
    const posts = [{ path: "/repo/b.mdx", title: "B" }];
    const gitPosts = [post("/repo/a.mdx"), post("/repo/b.mdx")];
    const entries = mergePaletteEntries(tabs, posts, gitPosts);
    expect(entries).toEqual([
      { path: "/repo/a.mdx", title: "A (editing)", open: true },
      { path: "/repo/b.mdx", title: "B", open: false },
    ]);
  });
});
