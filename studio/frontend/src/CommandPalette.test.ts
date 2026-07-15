import { describe, expect, it } from "vitest";
import type { BranchStatus } from "../../shared/protocol";
import { mergePaletteEntries } from "./CommandPalette";
import type { TabDescriptor } from "./TabBar";

const NO_DIRTY: ReadonlySet<string> = new Set();

const branch = (path: string, overrides: Partial<BranchStatus> = {}): BranchStatus => ({
  path,
  stem: path,
  local: false,
  remote: true,
  stale: false,
  ...overrides,
});

describe("mergePaletteEntries", () => {
  it("layers a branch's chips onto its already-published, not-open post instead of dropping it", () => {
    const posts = [{ path: "/repo/algorithmic-art.mdx", title: "Algorithmic Art" }];
    const branches = [branch("/repo/algorithmic-art.mdx", { remote: true })];
    const entries = mergePaletteEntries([], posts, branches, NO_DIRTY);
    expect(entries).toEqual([
      {
        path: "/repo/algorithmic-art.mdx",
        title: "Algorithmic Art",
        open: false,
        local: false,
        remote: true,
        dirty: false,
        published: true,
        stale: false,
      },
    ]);
  });

  it("keeps a published post's original position when annotating it with a branch status", () => {
    const posts = [
      { path: "/repo/a.mdx", title: "A" },
      { path: "/repo/b.mdx", title: "B" },
    ];
    const branches = [branch("/repo/a.mdx")];
    const entries = mergePaletteEntries([], posts, branches, NO_DIRTY);
    expect(entries.map((e) => e.path)).toEqual(["/repo/a.mdx", "/repo/b.mdx"]);
  });

  it("still appends a branch status with no matching post (an unpublished draft) after every post", () => {
    const posts = [{ path: "/repo/a.mdx", title: "A" }];
    const branches = [branch("/repo/new-draft.mdx", { local: true, remote: false })];
    const entries = mergePaletteEntries([], posts, branches, NO_DIRTY);
    expect(entries.map((e) => e.path)).toEqual(["/repo/a.mdx", "/repo/new-draft.mdx"]);
    expect(entries[1]).toEqual({
      path: "/repo/new-draft.mdx",
      title: "",
      open: false,
      local: true,
      remote: false,
      dirty: false,
      published: false,
      stale: false,
    });
  });

  it("layers local/remote/stale onto an already-open tab too, so its status chips stay visible while editing", () => {
    const tabs: TabDescriptor[] = [{ path: "/repo/a.mdx", title: "A" }];
    const branches = [branch("/repo/a.mdx", { local: true, remote: true, stale: true })];
    const entries = mergePaletteEntries(tabs, [], branches, NO_DIRTY);
    expect(entries).toEqual([
      { path: "/repo/a.mdx", title: "A", open: true, local: true, remote: true, dirty: false, published: false, stale: true },
    ]);
  });

  it("open tabs are deduped against posts, keeping the open (title-bearing) entry but still marking it published", () => {
    const tabs: TabDescriptor[] = [{ path: "/repo/a.mdx", title: "A (editing)" }];
    const posts = [{ path: "/repo/a.mdx", title: "A" }];
    const entries = mergePaletteEntries(tabs, posts, [], NO_DIRTY);
    expect(entries).toEqual([
      { path: "/repo/a.mdx", title: "A (editing)", open: true, local: false, remote: false, dirty: false, published: true, stale: false },
    ]);
  });

  it("marks a post dirty only when it has a matching entry from another source", () => {
    const posts = [{ path: "/repo/a.mdx", title: "A" }];
    const entries = mergePaletteEntries([], posts, [], new Set(["/repo/a.mdx", "/repo/ghost.mdx"]));
    // The unmatched "ghost" path (dirty with nothing else known about it, which shouldn't happen in
    // practice) creates no phantom row.
    expect(entries.map((e) => e.path)).toEqual(["/repo/a.mdx"]);
    expect(entries[0].dirty).toBe(true);
  });
});
