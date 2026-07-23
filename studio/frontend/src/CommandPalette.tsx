// ⌘P command palette: a fuzzy-filterable list of open tabs and every existing post, plus a
// "create new post" command. Selecting a post opens (or focuses) it; the create command opens
// the New Post dialog seeded with the search term. Type to filter, ↑/↓ to move, Enter, Esc.

import { useEffect, useMemo, useRef, useState } from "react";
import { getPosts } from "./api";
import { slugFromPath } from "./slug";
import { Lifebar } from "./Lifebar";
import { selectPost, selectRootName } from "./gitSelectors";
import type { TabDescriptor } from "./TabBar";
import type { GitState } from "../../shared/protocol";

interface PaletteEntry {
  path: string;
  title: string;
  open: boolean;
}

/** A navigable palette row: an existing post to open, or the create-new-post command. */
type PaletteRow = { kind: "post"; entry: PaletteEntry } | { kind: "create"; title: string };

function emptyEntry(path: string, title = ""): PaletteEntry {
  return { path, title, open: false };
}

/**
 * Every row keyed by canonical path: open tabs first (carrying their live title), then every post
 * in the main tree layered on top (a post known to both keeps the open tab's title). Each row's
 * git facts (the lifebar) are looked up separately at render time from `git.state`, not merged in
 * here, since not every post in the main tree has a matching entry there.
 */
export function mergePaletteEntries(
  openTabs: readonly TabDescriptor[],
  posts: readonly { path: string; title: string }[] | null,
): PaletteEntry[] {
  const byPath = new Map<string, PaletteEntry>();
  for (const t of openTabs) byPath.set(t.path, { ...emptyEntry(t.path, t.title), open: true });
  for (const p of posts ?? []) {
    const existing = byPath.get(p.path);
    byPath.set(p.path, { ...(existing ?? emptyEntry(p.path)), title: existing?.open ? existing.title : p.title });
  }
  return [...byPath.values()];
}

interface CommandPaletteProps {
  openTabs: TabDescriptor[];
  activePath: string | null;
  git: GitState;
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

export function CommandPalette({ openTabs, activePath, git, onSelect, onCreate, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<{ path: string; title: string }[] | null>(null);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
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

  const root = selectRootName(git);
  const entries = useMemo(() => mergePaletteEntries(openTabs, posts), [openTabs, posts]);

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
          const post = selectPost(git, entry.path);
          return (
            <li
              key={entry.path}
              className={`palette__row ${selected ? "palette__row--sel" : ""}`}
              onMouseEnter={() => setCursor(i)}
              onClick={() => choose(row)}
            >
              <span className="palette__title">{entry.title || slugFromPath(entry.path)}</span>
              {post && <Lifebar post={post} root={root} variant="full" />}
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
