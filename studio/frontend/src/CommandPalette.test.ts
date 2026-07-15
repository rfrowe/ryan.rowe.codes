import { describe, expect, it } from "vitest";
import type { DraftSummary } from "../../shared/protocol";
import { mergePaletteEntries } from "./CommandPalette";
import type { TabDescriptor } from "./TabBar";

const draft = (path: string, overrides: Partial<DraftSummary> = {}): DraftSummary => ({
  path,
  stem: path,
  origin: "remote",
  stale: false,
  ...overrides,
});

describe("mergePaletteEntries", () => {
  it("layers a remote draft's chip onto its already-published, not-open post instead of dropping it", () => {
    const posts = [{ path: "/repo/algorithmic-art.mdx", title: "Algorithmic Art", open: false }];
    const drafts = [draft("/repo/algorithmic-art.mdx", { origin: "remote" })];
    const entries = mergePaletteEntries([], posts, drafts);
    expect(entries).toEqual([{ path: "/repo/algorithmic-art.mdx", title: "Algorithmic Art", open: false, draft: "remote", stale: false }]);
  });

  it("keeps a published post's original position when annotating it with a draft", () => {
    const posts = [
      { path: "/repo/a.mdx", title: "A", open: false },
      { path: "/repo/b.mdx", title: "B", open: false },
    ];
    const drafts = [draft("/repo/a.mdx")];
    const entries = mergePaletteEntries([], posts, drafts);
    expect(entries.map((e) => e.path)).toEqual(["/repo/a.mdx", "/repo/b.mdx"]);
  });

  it("still appends a draft with no matching post (an unpublished draft) after every post", () => {
    const posts = [{ path: "/repo/a.mdx", title: "A", open: false }];
    const drafts = [draft("/repo/new-draft.mdx")];
    const entries = mergePaletteEntries([], posts, drafts);
    expect(entries.map((e) => e.path)).toEqual(["/repo/a.mdx", "/repo/new-draft.mdx"]);
    expect(entries[1]).toEqual({ path: "/repo/new-draft.mdx", title: "", open: false, draft: "remote", stale: false });
  });

  it("leaves an already-open tab alone: its own state wins over a matching draft", () => {
    const tabs: TabDescriptor[] = [{ path: "/repo/a.mdx", title: "A" }];
    const drafts = [draft("/repo/a.mdx", { stale: true })];
    const entries = mergePaletteEntries(tabs, [], drafts);
    expect(entries).toEqual([{ path: "/repo/a.mdx", title: "A", open: true }]);
  });

  it("open tabs are deduped against posts, keeping the open (title-bearing) entry", () => {
    const tabs: TabDescriptor[] = [{ path: "/repo/a.mdx", title: "A (editing)" }];
    const posts = [{ path: "/repo/a.mdx", title: "A", open: false }];
    const entries = mergePaletteEntries(tabs, posts, []);
    expect(entries).toEqual([{ path: "/repo/a.mdx", title: "A (editing)", open: true }]);
  });
});
