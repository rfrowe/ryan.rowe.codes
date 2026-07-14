// Permission-mode chip (bottom-right, beside the MCP status). Shows the authoritative mode from the
// `mode.status` broadcast; clicking opens a popover to switch it via `mode.set` (takes effect next
// turn). Each mode has its own icon and colour, matching how the modes read at a glance:
//   auto:         fast-forward, amber   (classifier fast-paths safe calls)
//   accept edits: pencil, pink-purple  (edits flow; still ask to leave the worktree)
//   manual:       pause, grey          (the SDK's "default": pause and ask)
// Deliberately exposes only the safe subset; bypassPermissions/dontAsk/plan are not offered.

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PermissionMode } from "../../shared/types";

interface ModeChipProps {
  mode: PermissionMode;
  onSetMode: (mode: PermissionMode) => void;
}

const FastForwardIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M4 5l7 7-7 7V5zm9 0l7 7-7 7V5z" />
  </svg>
);

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
    />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" focusable="false">
    <rect fill="currentColor" x="6" y="5" width="4" height="14" rx="1" />
    <rect fill="currentColor" x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);

const MODES: { mode: PermissionMode; label: string; hint: string; icon: ReactNode }[] = [
  { mode: "auto", label: "auto", hint: "Classifier approves safe calls; asks on anything risky.", icon: <FastForwardIcon /> },
  { mode: "acceptEdits", label: "accept edits", hint: "Auto-accept edits inside the worktree; still ask to leave it.", icon: <PencilIcon /> },
  { mode: "default", label: "manual", hint: "Ask before anything not already pre-approved.", icon: <PauseIcon /> },
];

function metaFor(mode: PermissionMode): (typeof MODES)[number] {
  return MODES.find((m) => m.mode === mode) ?? MODES[0];
}

export function ModeChip({ mode, onSetMode }: ModeChipProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Dismiss the popover on an outside click (mirrors McpStatusBar).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const current = metaFor(mode);

  return (
    <div className="mode" ref={rootRef}>
      <button
        type="button"
        className={`mode__chip ${open ? "mode__chip--open" : ""}`}
        aria-expanded={open}
        title="Permission mode"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`mode__icon mode__icon--${current.mode}`}>{current.icon}</span>
        mode: {current.label}
      </button>

      {open && (
        <div className="mode__popover" role="dialog" aria-label="Permission mode">
          <div className="mode__popover-head">Permission mode</div>
          {MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              className={`mode__option ${m.mode === mode ? "mode__option--active" : ""}`}
              aria-pressed={m.mode === mode}
              onClick={() => {
                onSetMode(m.mode);
                setOpen(false);
              }}
            >
              <span className={`mode__icon mode__icon--${m.mode}`}>{m.icon}</span>
              <span className="mode__option-text">
                <span className="mode__option-label">
                  {m.label}
                  {m.mode === mode ? " ●" : ""}
                </span>
                <span className="mode__option-hint">{m.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
