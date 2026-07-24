// Browser-style tab strip across the top of the studio: one flush tab per open post
// (title and a close affordance that shows on hover / for the active tab), a new-tab
// `+` button immediately to the right of the last tab, and a subtle connection dot
// at the far right. A tab can be renamed in place (double-click the title, or Rename in
// the right-click menu); the right-click menu also offers Revert to clean and Delete draft.

import { useEffect, useRef, useState } from "react";
import type { SocketStatus } from "./ws";
import { kebabSlug, slugFromPath } from "./slug";
import { Lifebar } from "./Lifebar";
import { selectPost, selectPushable, selectRebase, selectRootName, selectUncommitted, selectUpdatable } from "./gitSelectors";
import { updateTriggerLabel } from "./turnSelectors";
import { useCommand } from "./useCommand";
import type { GitState } from "../../shared/protocol";

/** "3m ago" / "2h ago" / "1d ago", for the fetch button's "refs as of …" freshness. */
function ago(at: number): string {
  const mins = Math.max(0, Math.round((Date.now() - at) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

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

interface TabBarProps {
  tabs: TabDescriptor[];
  activePath: string | null;
  status: SocketStatus;
  /** Per-component stack health (sidecar, LSP, preview, MCP…) for the connection-dot popover. */
  stackStatus: StackComponent[];
  /** Every git fact, for each tab's lifebar and the right-click menu's push/revert gating. */
  git: GitState;
  /** The single global turn latch and whether it's produced content yet, for the Update trigger's
   *  Update/Updating…/Queued… label (see turnSelectors.updateTriggerLabel). */
  turn: { promptId: string; path: string } | null;
  turnStarted: boolean;
  /** Paths with an Update REST call in flight, set the instant the trigger fires (before any server
   *  round trip), so the trigger reads "Updating…" immediately rather than as a dead click. */
  updatePending: Set<string>;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  onNewPost: () => void;
  onRename: (path: string, newSlug: string) => void;
  /** Commit + push the post's branch to origin (no PR), so the draft can be resumed later. */
  onSaveDraft: (path: string) => void;
  onRevert: (path: string) => void;
  onDelete: (path: string) => void;
  /** Fetch from origin (`git fetch --prune`): refs only, global, updates every post's behind/incoming
   *  reactively via git.state. The spinner and "refs as of …" freshness read git.fetch, not a prop. */
  onFetch: () => void;
  /** The explicit "Update root from origin" affordance, for when a fetch's own reactive ff-only
   *  advance can't land (a genuine divergence). Shown in the status popover when primary.behind > 0. */
  onUpdateRoot: () => void;
  /** Update/Pull (F3): fetch this post's base then rebase onto it. */
  onUpdate: (path: string) => void;
  /** Abort an in-progress rebase (F6), returning the post to its pre-update tip. */
  onAbortUpdate: (path: string) => void;
}

export function TabBar({
  tabs,
  activePath,
  status,
  stackStatus,
  git,
  turn,
  turnStarted,
  updatePending,
  onSelect,
  onClose,
  onNewPost,
  onRename,
  onSaveDraft,
  onRevert,
  onDelete,
  onFetch,
  onUpdateRoot,
  onUpdate,
  onAbortUpdate,
}: TabBarProps) {
  /** This path's Update/Updating…/Queued… label, from its own rebase phase plus the shared turn latch. */
  function updateLabel(path: string): ReturnType<typeof updateTriggerLabel> {
    return updateTriggerLabel(selectRebase(git, path).phase, turn?.path === path, turnStarted, updatePending.has(path));
  }
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

  // Nothing else re-renders TabBar on its own between fetches, so the fetch button's "refs as of
  // Xm ago" text would otherwise freeze at whatever it read on the last render triggered elsewhere.
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

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

  const root = selectRootName(git);
  const { inFlight: fetching, at } = git.fetch;
  // Shared by the fetch button's title and aria-label, so a screen reader hears the same freshness
  // info a sighted user reads in the tooltip.
  const fetchLabel = fetching ? "Fetching…" : at != null ? `Fetch from origin (refs as of ${ago(at)})` : "Fetch from origin";

  useCommand({
    id: "git.fetch",
    chord: "mod+shift+f",
    label: "Fetch from origin",
    group: "Git",
    when: () => status === "open" && !fetching,
    run: onFetch,
  });

  useCommand({
    id: "git.update",
    chord: "mod+shift+u",
    label: "Update / Pull",
    group: "Git",
    // Not "Update" (i.e. already updating or queued) means the trigger already fired; a repeat
    // ⌘⇧U must be a no-op rather than a dead click re-sending a duplicate request.
    when: () => status === "open" && !!activePath && selectUpdatable(git, activePath) && updateLabel(activePath) === "Update",
    run: () => activePath && onUpdate(activePath),
  });

  return (
    <header className="tabbar">
      <div className="tabbar__tabs" role="tablist">
        {tabs.length === 0 && <span className="tabbar__empty">No open posts — press ⌘P to open one</span>}
        {tabs.map((tab) => {
          const active = tab.path === activePath;
          const isRenaming = renaming === tab.path;
          const post = selectPost(git, tab.path);
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
                  {post && <Lifebar post={post} root={root} variant="compact" />}
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
      <button
        type="button"
        className={`tabbar__fetch ${fetching ? "tabbar__fetch--busy" : ""}`}
        onClick={onFetch}
        disabled={fetching}
        title={fetchLabel}
        aria-label={fetchLabel}
      >
        <span aria-hidden="true">↻</span>
      </button>
      <div className="tabbar__status" tabIndex={0} role="status" aria-label={`Stack status — sidecar ${status}`}>
        <span className={`tabbar__conn tabbar__conn--${status}`} aria-hidden="true" />
        <div className="tabbar__statuspop" role="tooltip">
          <div className="statuspop__title statuspop__title--stack">
            Stack
            {git.primary.worktree && (
              <span className="statuspop__titleref" title={`${git.primary.ref} · ${git.primary.worktree}`}>
                {git.primary.ref}
                {/* Detached HEAD already renders ref as the short sha; don't repeat it. */}
                {git.primary.headSha !== git.primary.ref && ` · ${git.primary.headSha}`}
              </span>
            )}
          </div>
          {git.primary.behind > 0 && (
            // fetchOrigin's own reactive ff-only advance already handles a clean advance; reaching
            // here means the root has diverged, so this is the deliberate, confirmed path.
            <button type="button" className="statuspop__row statuspop__row--action" onClick={onUpdateRoot}>
              <span className="statuspop__dot statuspop__dot--down" aria-hidden="true" />
              <span className="statuspop__label">{git.primary.behind} behind origin</span>
              <span className="statuspop__state statuspop__state--action">Update root</span>
            </button>
          )}
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
          {(() => {
            const label = updateLabel(menu.path);
            const busy = label !== "Update";
            return (
              <button
                type="button"
                className="tabmenu__item"
                role="menuitem"
                disabled={busy || !selectUpdatable(git, menu.path)}
                title={busy || selectUpdatable(git, menu.path) ? undefined : "Nothing to update — not behind, or a rebase is already in progress"}
                onClick={() => {
                  onUpdate(menu.path);
                  setMenu(null);
                }}
              >
                {label === "Update" ? "Update…" : label}
              </button>
            );
          })()}
          {selectRebase(git, menu.path).phase !== "idle" && (
            <button
              type="button"
              className="tabmenu__item"
              role="menuitem"
              onClick={() => {
                onAbortUpdate(menu.path);
                setMenu(null);
              }}
            >
              Abort update…
            </button>
          )}
          <button
            type="button"
            className="tabmenu__item"
            role="menuitem"
            disabled={!selectPushable(git, menu.path)}
            title={selectPushable(git, menu.path) ? undefined : "Nothing to save — already up to date on origin"}
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
            disabled={!selectUncommitted(git, menu.path)}
            title={selectUncommitted(git, menu.path) ? undefined : "No uncommitted changes to revert"}
            onClick={() => {
              onRevert(menu.path);
              setMenu(null);
            }}
          >
            Revert to clean…
          </button>
          {selectPushable(git, menu.path) && (
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
