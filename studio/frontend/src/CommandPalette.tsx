// ⌘P command palette: a fuzzy-filterable list of open tabs plus every existing post
// (GET /posts), followed by a "create new post" command. Selecting a post opens it (a
// post.open; the app treats open-of-an-already-open tab as focus); selecting the create
// command opens the New Post dialog seeded with the current search term as the title.
// Keyboard-driven: type to filter, ↑/↓ to move, Enter to select, Esc to close.

import { useEffect, useMemo, useRef, useState } from "react";
import { getDirtyPosts, getPosts } from "./api";
import { slugFromPath } from "./slug";
import type { TabDescriptor } from "./TabBar";

interface PaletteEntry {
  path: string;
  title: string;
  open: boolean;
}

/** A navigable palette row: an existing post to open, or the create-new-post command. */
type PaletteRow = { kind: "post"; entry: PaletteEntry } | { kind: "create"; title: string };

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
  const [posts, setPosts] = useState<PaletteEntry[] | null>(null);
  // Canonical paths of open posts with unshipped changes; drives the "unshipped" badge. Probed
  // once when the palette opens (best-effort; a failed probe simply shows no badges).
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
        /* best-effort: leave the badge set empty */
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
        if (live) setPosts(res.posts.map((p) => ({ path: p.path, title: p.title, open: false })));
      })
      .catch(() => {
        if (live) setPosts([]);
      });
    return () => {
      live = false;
    };
  }, []);

  // Merge: open tabs first (deduped), then every other known post.
  const entries = useMemo<PaletteEntry[]>(() => {
    const openPaths = new Set(openTabs.map((t) => t.path));
    const merged: PaletteEntry[] = openTabs.map((t) => ({ path: t.path, title: t.title, open: true }));
    for (const p of posts ?? []) if (!openPaths.has(p.path)) merged.push(p);
    return merged;
  }, [openTabs, posts]);

  const filtered = useMemo(
    () => entries.filter((e) => fuzzyMatch(`${e.title} ${slugFromPath(e.path)}`, query.trim())),
    [entries, query],
  );

  // Navigable rows: matching posts first (so Enter on a partial query opens the top match, the
  // palette's primary action), then an always-present create command carrying the search term.
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
              {dirty.has(entry.path) && (
                <span className="palette__badge" title="Draft — has unshipped changes (uncommitted or unmerged)">
                  Draft
                </span>
              )}
              <span className="palette__meta">
                {entry.open ? (entry.path === activePath ? "active" : "open") : "post"} · {slugFromPath(entry.path)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="palette__foot">↑↓ to move · Enter to select · Esc to close</div>
    </div>
  );
}
