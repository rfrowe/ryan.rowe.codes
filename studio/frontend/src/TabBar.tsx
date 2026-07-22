// Browser-style tab strip across the top of the studio: one flush tab per open post
// (title and a close affordance that shows on hover / for the active tab), a new-tab
// `+` button immediately to the right of the last tab, and a subtle connection dot
// at the far right. A tab can be renamed in place (double-click the title, or Rename in
// the right-click menu); the right-click menu also offers Revert to clean and Delete draft.

import { useEffect, useRef, useState } from "react";
import type { SocketStatus } from "./ws";
import { kebabSlug, slugFromPath } from "./slug";
import { WarnIcon } from "./WarnIcon";
import { SyncIcon } from "./SyncIcon";

export interface TabDescriptor {
  path: string;
  title: string;
}

/** One row in the stack-status popover shown when hovering the connection dot. */
export interface StackComponent {
  label: string;
  status: "ok" | "connecting" | "down" | "disabled";
  /** Loopback endpoint, shown in a faded monospace font (e.g. "127.0.0.1:4319"). */
  endpoint?: string;
}

/** Human words for the stack states; the green dot alone conveys "ok" so only the others are shown. */
const STATE_WORD: Record<StackComponent["status"], string> = {
  ok: "ok",
  connecting: "connecting",
  down: "down",
  disabled: "off",
};

/** The origin base the divergence warning is measured against, from the studio's own branch label
 *  (already `origin/<branch>` when in sync, else the bare branch). */
function baseRefLabel(studio: { ref: string } | null): string {
  if (!studio) return "origin";
  return studio.ref.startsWith("origin/") ? studio.ref : `origin/${studio.ref}`;
}

interface TabBarProps {
  tabs: TabDescriptor[];
  activePath: string | null;
  status: SocketStatus;
  /** Per-component stack health (sidecar, LSP, preview, MCP…) for the connection-dot popover. */
  stackStatus: StackComponent[];
  /** The studio's own branch/worktree, shown as a chip + in the popover; null until the sidecar reports it. */
  studio: { ref: string; worktree: string } | null;
  /** How many commits origin's base has that the active post isn't built on; > 0 shows the warning. */
  behind: number;
  /** Canonical paths of open posts that are drafts (unshipped work); drives the tab dot and
   *  gates "Save to remote…" and "Delete draft…" in the right-click menu. */
  dirtyPaths: Set<string>;
  /** Canonical paths with uncommitted edits (⊆ dirtyPaths); gates "Revert to clean…", which has
   *  nothing to discard on a clean (or clean-but-ahead) post. */
  uncommittedPaths: Set<string>;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  onNewPost: () => void;
  onRename: (path: string, newSlug: string) => void;
  /** Commit + push the post's branch to origin (no PR), so the draft can be resumed later. */
  onSaveDraft: (path: string) => void;
  onRevert: (path: string) => void;
  onDelete: (path: string) => void;
  /** Fetch from origin (`git fetch --prune`), refreshing remote-tracking refs and the warning. */
  onFetch: () => void;
  /** A fetch is in flight: the button spins and is disabled. */
  fetching: boolean;
}

export function TabBar({
  tabs,
  activePath,
  status,
  stackStatus,
  studio,
  behind,
  dirtyPaths,
  uncommittedPaths,
  onSelect,
  onClose,
  onNewPost,
  onRename,
  onSaveDraft,
  onRevert,
  onDelete,
  onFetch,
  fetching,
}: TabBarProps) {
  // Path currently being renamed (any tab may enter rename mode via the menu; the active tab also
  // via double-click).
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  // The path whose rename is in progress; commitRename consumes it synchronously. The input's
  // onBlur commits, and removing a still-focused input (on Enter, Escape, or the tab vanishing)
  // fires that blur; this ref is the guard so such a blur can't re-commit or commit a cancel.
  const renameTargetRef = useRef<string | null>(null);
  // Open right-click menu: which tab, anchored at viewport coords.
  const [menu, setMenu] = useState<{ path: string; x: number; y: number } | null>(null);

  useEffect(() => {
    if (renaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [renaming]);

  // Abandon an in-progress rename if the tab closes or focus otherwise moves off it, as a cancel,
  // so the input's unmount blur doesn't commit a rename for a tab that just vanished.
  useEffect(() => {
    if (renaming && !tabs.some((t) => t.path === renaming)) cancelRename();
  }, [tabs, renaming]);

  // Dismiss the context menu on any outside click or Escape. The menu itself stops mousedown
  // propagation so clicking an item doesn't close it before the click fires.
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  // Also drop the menu if its target tab disappears.
  useEffect(() => {
    if (menu && !tabs.some((t) => t.path === menu.path)) setMenu(null);
  }, [tabs, menu]);

  function beginRename(path: string): void {
    renameTargetRef.current = path;
    setDraft(slugFromPath(path));
    setRenaming(path);
  }

  function commitRename(): void {
    const path = renameTargetRef.current;
    if (!path) return; // already committed/cancelled, e.g. the blur from unmounting the input
    renameTargetRef.current = null; // consume synchronously so the unmount blur is a no-op
    setRenaming(null);
    const next = kebabSlug(draft);
    if (next.length > 0 && next !== slugFromPath(path)) onRename(path, next);
  }

  function cancelRename(): void {
    renameTargetRef.current = null; // consume so the ensuing unmount blur can't commit the rename
    setRenaming(null);
  }

  function openMenu(e: React.MouseEvent, path: string): void {
    e.preventDefault();
    setMenu({ path, x: e.clientX, y: e.clientY });
  }

  return (
    <header className="tabbar">
      <div className="tabbar__tabs" role="tablist">
        {tabs.length === 0 && <span className="tabbar__empty">No open posts — press ⌘P to open one</span>}
        {tabs.map((tab) => {
          const active = tab.path === activePath;
          const isRenaming = renaming === tab.path;
          return (
            <div
              key={tab.path}
              className={`tab ${active ? "tab--active" : ""}`}
              role="tab"
              aria-selected={active}
              title={tab.path}
              onContextMenu={(e) => openMenu(e, tab.path)}
            >
              {isRenaming ? (
                <input
                  ref={inputRef}
                  className="tab__rename"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") commitRename();
                    else if (e.key === "Escape") cancelRename();
                  }}
                />
              ) : (
                <>
                  {dirtyPaths.has(tab.path) && (
                    <span className="tab__dot" aria-label="Unshipped draft" title="Draft — unshipped changes" />
                  )}
                  <button
                    type="button"
                    className="tab__label"
                    onClick={() => onSelect(tab.path)}
                    onDoubleClick={() => active && beginRename(tab.path)}
                    title={active ? "Double-click to rename the slug · right-click for more" : tab.title}
                  >
                    {tab.title || slugFromPath(tab.path)}
                  </button>
                </>
              )}
              <button
                type="button"
                className="tab__close"
                aria-label={`Close ${tab.title}`}
                title="Close tab"
                onClick={() => onClose(tab.path)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          );
        })}
        <button type="button" className="tabbar__new" onClick={onNewPost} title="New post" aria-label="New post">
          <span aria-hidden="true">+</span>
        </button>
      </div>

      <div className="tabbar__spacer" />
      {behind > 0 && (
        <span
          className="tabbar__diverged"
          title={`${baseRefLabel(studio)} has ${behind} commit${behind === 1 ? "" : "s"} this post isn't based on — fetch and rebase.`}
        >
          <WarnIcon size={14} />
        </span>
      )}
      <button
        type="button"
        className={`tabbar__fetch ${fetching ? "tabbar__fetch--busy" : ""}`}
        onClick={onFetch}
        disabled={fetching}
        title="Fetch from origin"
        aria-label="Fetch from origin"
      >
        <SyncIcon size={15} />
      </button>
      <div className="tabbar__status" tabIndex={0} role="status" aria-label={`Stack status — sidecar ${status}`}>
        <span className={`tabbar__conn tabbar__conn--${status}`} aria-hidden="true" />
        <div className="tabbar__statuspop" role="tooltip">
          <div className="statuspop__title statuspop__title--stack">
            Stack
            {studio && (
              <span className="statuspop__titleref" title={`${studio.ref} · ${studio.worktree}`}>
                {studio.ref}
              </span>
            )}
          </div>
          {stackStatus.map((c) => (
            <div
              className="statuspop__row"
              key={c.label}
              title={`${c.label}: ${STATE_WORD[c.status]}${c.endpoint ? ` · ${c.endpoint}` : ""}`}
            >
              <span className={`statuspop__dot statuspop__dot--${c.status}`} aria-hidden="true" />
              <span className="statuspop__label">{c.label}</span>
              {/* The dot already conveys "ok"; only spell out abnormal states. */}
              {c.status !== "ok" && (
                <span className={`statuspop__state statuspop__state--${c.status}`}>{STATE_WORD[c.status]}</span>
              )}
              {c.endpoint && <span className="statuspop__endpoint">{c.endpoint}</span>}
            </div>
          ))}
        </div>
      </div>

      {menu && (
        <div
          className="tabmenu"
          style={{ top: menu.y, left: menu.x }}
          role="menu"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="tabmenu__item"
            role="menuitem"
            onClick={() => {
              beginRename(menu.path);
              setMenu(null);
            }}
          >
            Rename…
          </button>
          <button
            type="button"
            className="tabmenu__item"
            role="menuitem"
            disabled={!dirtyPaths.has(menu.path)}
            title={dirtyPaths.has(menu.path) ? undefined : "Nothing to save — already up to date on origin"}
            onClick={() => {
              onSaveDraft(menu.path);
              setMenu(null);
            }}
          >
            Save to remote…
          </button>
          <button
            type="button"
            className="tabmenu__item"
            role="menuitem"
            disabled={!uncommittedPaths.has(menu.path)}
            title={uncommittedPaths.has(menu.path) ? undefined : "No uncommitted changes to revert"}
            onClick={() => {
              onRevert(menu.path);
              setMenu(null);
            }}
          >
            Revert to clean…
          </button>
          {dirtyPaths.has(menu.path) && (
            <button
              type="button"
              className="tabmenu__item tabmenu__item--danger"
              role="menuitem"
              onClick={() => {
                onDelete(menu.path);
                setMenu(null);
              }}
            >
              Delete draft…
            </button>
          )}
          <div className="tabmenu__sep" />
          <button
            type="button"
            className="tabmenu__item"
            role="menuitem"
            onClick={() => {
              onClose(menu.path);
              setMenu(null);
            }}
          >
            Close tab
          </button>
        </div>
      )}
    </header>
  );
}
