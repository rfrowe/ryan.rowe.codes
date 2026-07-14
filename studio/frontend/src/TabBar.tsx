// Browser-style tab strip across the top of the studio: one flush tab per open post
// (title and a close affordance that shows on hover / for the active tab), a new-tab
// `+` button immediately to the right of the last tab, and a subtle connection dot
// at the far right. A tab can be renamed in place (double-click the title, or Rename in
// the right-click menu); the right-click menu also offers Revert to clean and Delete draft.

import { useEffect, useRef, useState } from "react";
import type { SocketStatus } from "./ws";
import { kebabSlug, slugFromPath } from "./slug";

export interface TabDescriptor {
  path: string;
  title: string;
}

interface TabBarProps {
  tabs: TabDescriptor[];
  activePath: string | null;
  status: SocketStatus;
  /** Canonical paths of open posts that are drafts (unshipped work); drives the tab dot and
   *  gates "Delete draft…" in the right-click menu. */
  dirtyPaths: Set<string>;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  onNewPost: () => void;
  onRename: (path: string, newSlug: string) => void;
  onRevert: (path: string) => void;
  onDelete: (path: string) => void;
}

export function TabBar({
  tabs,
  activePath,
  status,
  dirtyPaths,
  onSelect,
  onClose,
  onNewPost,
  onRename,
  onRevert,
  onDelete,
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
      <span
        className={`tabbar__conn tabbar__conn--${status}`}
        role="status"
        aria-label={`Sidecar ${status}`}
        title={`sidecar: ${status}`}
      />

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
