// ⌘P command palette: a fuzzy-filterable list of open tabs and every existing post, plus a
// "create new post" command. Selecting a post opens (or focuses) it; the create command opens
// the New Post dialog seeded with the search term. Type to filter, ↑/↓ to move, Enter, Esc.

import { useEffect, useMemo, useRef, useState } from "react";
import { getBranchStatuses, getDirtyPosts, getPosts } from "./api";
import { slugFromPath } from "./slug";
import type { TabDescriptor } from "./TabBar";
import type { BranchStatus } from "../../shared/protocol";

interface PaletteEntry {
  path: string;
  title: string;
  open: boolean;
  /** A worktree already exists for this post on disk. */
  local: boolean;
  /** This post's branch has been pushed to origin (via ship or save draft). */
  remote: boolean;
  /** Has changes not yet persisted by save-draft or ship. */
  dirty: boolean;
  /** Present in the studio's root worktree (already live). */
  published: boolean;
  /** Its branch is already merged into the default branch, so reopening forks a fresh one over it
   *  instead of adopting its (shipped) content. */
  stale: boolean;
}

/** A navigable palette row: an existing post to open, or the create-new-post command. */
type PaletteRow = { kind: "post"; entry: PaletteEntry } | { kind: "create"; title: string };

function emptyEntry(path: string, title = ""): PaletteEntry {
  return { path, title, open: false, local: false, remote: false, dirty: false, published: false, stale: false };
}

/**
 * Every row keyed by canonical path, with each source (open tabs, main-tree posts, branch statuses,
 * the dirty scan) layering its own fields onto whatever's already there instead of one source
 * winning outright, so a post known to more than one source accumulates chips from all of them.
 */
export function mergePaletteEntries(
  openTabs: readonly TabDescriptor[],
  posts: readonly { path: string; title: string }[] | null,
  branches: readonly BranchStatus[],
  dirty: ReadonlySet<string>,
): PaletteEntry[] {
  const byPath = new Map<string, PaletteEntry>();
  for (const t of openTabs) byPath.set(t.path, { ...emptyEntry(t.path, t.title), open: true });
  for (const p of posts ?? []) {
    const existing = byPath.get(p.path);
    byPath.set(p.path, { ...(existing ?? emptyEntry(p.path)), title: existing?.open ? existing.title : p.title, published: true });
  }
  for (const b of branches) {
    const existing = byPath.get(b.path) ?? emptyEntry(b.path);
    byPath.set(b.path, { ...existing, local: b.local, remote: b.remote, stale: b.stale });
  }
  for (const p of dirty) {
    const existing = byPath.get(p);
    if (existing) byPath.set(p, { ...existing, dirty: true });
  }
  return [...byPath.values()];
}

interface CommandPaletteProps {
  openTabs: TabDescriptor[];
  activePath: string | null;
  onSelect: (path: string) => void;
  /** Open the New Post dialog, seeding its title with the current search term (may be empty). */
  onCreate: (title: string) => void;
  onClose: () => void;
}

/** Subsequence match (chars of `q` appear in order in `text`), the usual palette feel. */
function fuzzyMatch(text: string, q: string): boolean {
  if (q.length === 0) return true;
  const hay = text.toLowerCase();
  let i = 0;
  for (const ch of q.toLowerCase()) {
    i = hay.indexOf(ch, i);
    if (i === -1) return false;
    i += 1;
  }
  return true;
}

export function CommandPalette({ openTabs, activePath, onSelect, onCreate, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<{ path: string; title: string }[] | null>(null);
  // Every blog/* branch's local/remote/stale status, merged in as chips below.
  const [branches, setBranches] = useState<BranchStatus[]>([]);
  // Posts with unshipped changes, driving the "dirty" chip. Best-effort probe on open.
  const [dirty, setDirty] = useState<Set<string>>(() => new Set());
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let live = true;
    getDirtyPosts()
      .then((res) => {
        if (live) setDirty(new Set(res.dirty));
      })
      .catch(() => {
        /* best-effort: leave the chip set empty */
      });
    return () => {
      live = false;
    };
  }, []);

  // Pull the full post inventory; open tabs are always available even if the fetch fails.
  useEffect(() => {
    let live = true;
    getPosts()
      .then((res) => {
        if (live) setPosts(res.posts.map((p) => ({ path: p.path, title: p.title })));
      })
      .catch(() => {
        if (live) setPosts([]);
      });
    return () => {
      live = false;
    };
  }, []);

  // Pull every blog/* branch's status so a draft (open, published, or neither) shows its chips.
  useEffect(() => {
    let live = true;
    getBranchStatuses()
      .then((res) => {
        if (live) setBranches(res.branches);
      })
      .catch(() => {
        /* best-effort: no branch chips */
      });
    return () => {
      live = false;
    };
  }, []);

  const entries = useMemo(() => mergePaletteEntries(openTabs, posts, branches, dirty), [openTabs, posts, branches, dirty]);

  const filtered = useMemo(
    () => entries.filter((e) => fuzzyMatch(`${e.title} ${slugFromPath(e.path)}`, query.trim())),
    [entries, query],
  );

  // Matching posts first (so Enter on a partial query opens the top match), then the create command.
  const rows = useMemo<PaletteRow[]>(() => {
    const list: PaletteRow[] = filtered.map((entry) => ({ kind: "post", entry }));
    list.push({ kind: "create", title: query.trim() });
    return list;
  }, [filtered, query]);

  // Keep the highlighted row in range as the filter narrows.
  useEffect(() => {
    setCursor((c) => Math.min(c, Math.max(0, rows.length - 1)));
  }, [rows.length]);

  function choose(row: PaletteRow | undefined): void {
    if (!row) return;
    onClose();
    if (row.kind === "post") onSelect(row.entry.path);
    else onCreate(row.title);
  }

  return (
    <div className="palette" role="dialog" aria-label="Open or create a post">
      <input
        ref={inputRef}
        className="palette__input"
        placeholder="Open a post, or create one — type to filter…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setCursor((c) => Math.min(c + 1, rows.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setCursor((c) => Math.max(c - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            choose(rows[cursor]);
          } else if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
      />
      <ul className="palette__list">
        {posts === null && <li className="palette__hint">Loading posts…</li>}
        {posts !== null && filtered.length === 0 && query.trim().length > 0 && (
          <li className="palette__hint">No posts match.</li>
        )}
        {rows.map((row, i) => {
          const selected = i === cursor;
          if (row.kind === "create") {
            return (
              <li
                key="__create__"
                className={`palette__row ${selected ? "palette__row--sel" : ""}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => choose(row)}
              >
                <span className="palette__title">
                  {row.title ? `Create new post “${row.title}”` : "Create new post…"}
                </span>
                <span className="palette__meta">new</span>
              </li>
            );
          }
          const { entry } = row;
          return (
            <li
              key={entry.path}
              className={`palette__row ${selected ? "palette__row--sel" : ""}`}
              onMouseEnter={() => setCursor(i)}
              onClick={() => choose(row)}
            >
              <span className="palette__title">{entry.title || slugFromPath(entry.path)}</span>
              {entry.stale && (
                <span
                  className="palette__badge palette__badge--stale"
                  title="Stale — already merged; reopening forks a fresh branch instead of adopting this one"
                >
                  Stale
                </span>
              )}
              {entry.local && (
                <span className="palette__chip" title="Has a worktree on disk, on this machine">
                  local
                </span>
              )}
              {entry.remote && (
                <span className="palette__chip" title="Pushed to origin, via ship or save draft">
                  remote
                </span>
              )}
              {entry.dirty && (
                <span className="palette__chip palette__chip--dirty" title="Has changes not yet persisted by save draft or ship">
                  dirty
                </span>
              )}
              {entry.published && (
                <span className="palette__chip" title="Present in the studio's root worktree">
                  published
                </span>
              )}
              <span className="palette__meta">
                {entry.open && (entry.path === activePath ? "active · " : "open · ")}
                {slugFromPath(entry.path)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="palette__foot">↑↓ to move · Enter to select · Esc to close</div>
    </div>
  );
}
