// ⌘/ shortcuts panel: every registered keymap command, grouped, with its chord and live enabled
// state. Doubles as a command menu: clicking a row runs it and closes. Type to filter, Esc closes.
// Mounted once, unconditionally, near the App root: it owns its own open/closed state so its
// help.shortcuts binding (which opens it) is always registered, not only while it's already open.

import { useMemo, useState, useSyncExternalStore } from "react";
import { keymap } from "./keymap";
import type { Command } from "./keymap";
import { useCommand } from "./useCommand";
import type { GitState } from "../../shared/protocol";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);
const GLYPH: Record<string, string> = { mod: isMac ? "⌘" : "Ctrl", shift: "⇧", alt: isMac ? "⌥" : "Alt" };

/** A chord's display glyphs, e.g. "mod+shift+f" -> "⌘⇧F". */
function chordGlyph(chord: string): string {
  return chord
    .split("+")
    .map((part) => GLYPH[part] ?? part.toUpperCase())
    .join(isMac ? "" : "+");
}

/** Whether a command's when() permits it to run right now; absent when() defaults to enabled.
 *  Shared by the row's disabled styling and choose()'s guard, so the two can't drift apart. */
export function commandEnabled(c: Command): boolean {
  return c.when?.() ?? true;
}

interface ShortcutsPanelProps {
  /** Read by commands' own `when()` closures elsewhere; threaded through purely so this panel
   *  re-renders on every git.state push instead of only on register/unregister (a disabled
   *  command must never look enabled from a stale panel). */
  git: GitState;
}

export function ShortcutsPanel({ git: _git }: ShortcutsPanelProps) {
  const [open, setOpen] = useState(false);
  useCommand({
    id: "help.shortcuts",
    // mod+shift+? is swallowed by the macOS Help menu before it reaches the page. mod+/ collides
    // with the editor's own toggle-comment binding, but that's fine: CodeMirror preventDefaults it
    // when the editor is focused, so this only fires when focus is elsewhere (see agent.directive's
    // mod+k for the same pattern).
    chord: "mod+/",
    label: "Keyboard shortcuts",
    group: "Navigation",
    run: () => setOpen((o) => !o),
  });

  const commands = useSyncExternalStore(keymap.subscribe, keymap.list);
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = commands.filter((c) => !c.hidden && (q.length === 0 || `${c.label} ${c.group}`.toLowerCase().includes(q)));
    const byGroup = new Map<string, Command[]>();
    for (const c of visible) byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    return [...byGroup.entries()];
  }, [commands, query]);

  if (!open) return null;

  function close(): void {
    setOpen(false);
    setQuery("");
  }

  function choose(c: Command): void {
    if (!commandEnabled(c)) return;
    close();
    c.run();
  }

  return (
    <div className="shortcuts__scrim" onClick={close}>
      <div
        className="shortcuts"
        role="dialog"
        aria-label="Keyboard shortcuts"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          // Catches Escape from a focused row button; the input below handles its own case
          // directly (and stops it here) so this is purely the fallback for the rest of the dialog.
          if (e.key === "Escape") {
            e.preventDefault();
            close();
          }
        }}
      >
        <input
          autoFocus
          className="shortcuts__input"
          aria-label="Filter shortcuts"
          placeholder="Filter shortcuts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Escape") {
              e.preventDefault();
              close();
            }
          }}
        />
        <div className="shortcuts__list">
          {grouped.length === 0 && <p className="shortcuts__hint">No shortcuts match.</p>}
          {grouped.map(([group, cmds]) => (
            <div key={group} className="shortcuts__group">
              <h3 className="shortcuts__group-label">{group}</h3>
              {cmds.map((c) => {
                const enabled = commandEnabled(c);
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!enabled}
                    className={`shortcuts__row ${enabled ? "" : "shortcuts__row--disabled"}`}
                    onClick={() => choose(c)}
                  >
                    <span className="shortcuts__label">{c.label}</span>
                    {c.chord && <span className="shortcuts__chord">{chordGlyph(c.chord)}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="shortcuts__foot">Esc to close</div>
      </div>
    </div>
  );
}
