// Effort chip (bottom-right of the chat composer, beside the model + mode chips). Shows the
// authoritative reasoning effort from the `effort.status` broadcast; clicking opens a popover to
// switch it via `effort.set` (takes effect next turn). The meter fills further at higher effort;
// the SDK silently falls back on models that don't support a level (e.g. xhigh to high).

import { useRef, useState } from "react";
import type { EffortLevel } from "../../shared/types";
import { useDismissOnOutsideClick } from "./useDismissOnOutsideClick";

interface EffortChipProps {
  effort: EffortLevel;
  onSetEffort: (effort: EffortLevel) => void;
}

// A horizontal meter whose fill width tracks the level, distinct from the model chip's vertical bars.
const EffortMeter = ({ frac }: { frac: number }) => (
  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" focusable="false">
    <rect fill="currentColor" fillOpacity={0.25} x="3" y="9" width="18" height="6" rx="3" />
    <rect fill="currentColor" x="3" y="9" width={18 * frac} height="6" rx="3" />
  </svg>
);

const EFFORTS: { effort: EffortLevel; label: string; hint: string; frac: number }[] = [
  { effort: "low", label: "low", hint: "Minimal thinking, fastest responses.", frac: 0.2 },
  { effort: "medium", label: "medium", hint: "Moderate thinking; a balanced default.", frac: 0.4 },
  { effort: "high", label: "high", hint: "Deep reasoning for harder tasks.", frac: 0.6 },
  { effort: "xhigh", label: "xhigh", hint: "Deeper than high; best for coding and long agentic work.", frac: 0.8 },
  { effort: "max", label: "max", hint: "Maximum effort; slowest and most thorough.", frac: 1 },
];

function metaFor(effort: EffortLevel): (typeof EFFORTS)[number] {
  return EFFORTS.find((e) => e.effort === effort) ?? EFFORTS[1];
}

export function EffortChip({ effort, onSetEffort }: EffortChipProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useDismissOnOutsideClick(rootRef, open, () => setOpen(false));

  const current = metaFor(effort);

  return (
    <div className="effort" ref={rootRef}>
      <button
        type="button"
        className={`effort__chip ${open ? "effort__chip--open" : ""}`}
        aria-expanded={open}
        title="Reasoning effort"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="effort__icon">
          <EffortMeter frac={current.frac} />
        </span>
        effort: {current.label}
      </button>

      {open && (
        <div className="effort__popover" role="dialog" aria-label="Reasoning effort">
          <div className="effort__popover-head">Reasoning effort</div>
          {EFFORTS.map((e) => (
            <button
              key={e.effort}
              type="button"
              className={`effort__option ${e.effort === effort ? "effort__option--active" : ""}`}
              aria-pressed={e.effort === effort}
              onClick={() => {
                onSetEffort(e.effort);
                setOpen(false);
              }}
            >
              <span className="effort__icon">
                <EffortMeter frac={e.frac} />
              </span>
              <span className="effort__option-text">
                <span className="effort__option-label">
                  {e.label}
                  {e.effort === effort ? " ●" : ""}
                </span>
                <span className="effort__option-hint">{e.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
