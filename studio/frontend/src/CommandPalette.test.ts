import { describe, expect, it } from "vitest";
import { mergePaletteEntries } from "./CommandPalette";
import type { TabDescriptor } from "./TabBar";

describe("mergePaletteEntries", () => {
  it("includes every post from the main tree, not just open tabs", () => {
    const posts = [{ path: "/repo/algorithmic-art.mdx", title: "Algorithmic Art" }];
    const entries = mergePaletteEntries([], posts);
    expect(entries).toEqual([{ path: "/repo/algorithmic-art.mdx", title: "Algorithmic Art", open: false }]);
  });

  it("keeps a post's position in the main-tree order", () => {
    const posts = [
      { path: "/repo/a.mdx", title: "A" },
      { path: "/repo/b.mdx", title: "B" },
    ];
    const entries = mergePaletteEntries([], posts);
    expect(entries.map((e) => e.path)).toEqual(["/repo/a.mdx", "/repo/b.mdx"]);
  });

  it("open tabs are deduped against posts, keeping the open (title-bearing) entry", () => {
    const tabs: TabDescriptor[] = [{ path: "/repo/a.mdx", title: "A (editing)" }];
    const posts = [{ path: "/repo/a.mdx", title: "A" }];
    const entries = mergePaletteEntries(tabs, posts);
    expect(entries).toEqual([{ path: "/repo/a.mdx", title: "A (editing)", open: true }]);
  });

  it("an open tab with no matching post (a brand-new draft) still appears", () => {
    const tabs: TabDescriptor[] = [{ path: "/repo/new-draft.mdx", title: "New Draft" }];
    const entries = mergePaletteEntries(tabs, []);
    expect(entries).toEqual([{ path: "/repo/new-draft.mdx", title: "New Draft", open: true }]);
  });

  it("treats posts as empty while still loading (null)", () => {
    const tabs: TabDescriptor[] = [{ path: "/repo/a.mdx", title: "A" }];
    const entries = mergePaletteEntries(tabs, null);
    expect(entries).toEqual([{ path: "/repo/a.mdx", title: "A", open: true }]);
  });
});
