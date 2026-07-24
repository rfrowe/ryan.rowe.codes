// Model chip (bottom-right of the chat composer, beside the mode chip). Shows the authoritative
// model from the `model.status` broadcast; clicking opens a popover to switch it via `model.set`
// (takes effect next turn). The ascending bars read as a capability tier, coloured per model:
//   Opus 4.8:  three bars, gold  (most capable)
//   Sonnet 5:  two bars,  blue  (balanced default)
//   Haiku 4.5: one bar,   green (fastest, lightest)

import { useRef, useState } from "react";
import type { ClaudeModel } from "../../shared/types";
import { useDismissOnOutsideClick } from "./useDismissOnOutsideClick";

interface ModelChipProps {
  model: ClaudeModel;
  onSetModel: (model: ClaudeModel) => void;
}

// Three ascending bars; the lowest `level` are filled, the rest dimmed, so the glyph reads as a tier.
const TierBars = ({ level }: { level: 1 | 2 | 3 }) => (
  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" focusable="false">
    <rect fill="currentColor" fillOpacity={level >= 1 ? 1 : 0.25} x="3" y="14" width="4" height="6" rx="1" />
    <rect fill="currentColor" fillOpacity={level >= 2 ? 1 : 0.25} x="10" y="9" width="4" height="11" rx="1" />
    <rect fill="currentColor" fillOpacity={level >= 3 ? 1 : 0.25} x="17" y="4" width="4" height="16" rx="1" />
  </svg>
);

const MODELS: { model: ClaudeModel; label: string; hint: string; level: 1 | 2 | 3 }[] = [
  { model: "claude-opus-4-8", label: "Opus 4.8", hint: "Most capable; best for hard reasoning and long, careful edits.", level: 3 },
  { model: "claude-sonnet-5", label: "Sonnet 5", hint: "Fast and strong; a balanced default for most turns.", level: 2 },
  { model: "claude-haiku-4-5", label: "Haiku 4.5", hint: "Fastest and lightest; good for quick, simple edits.", level: 1 },
];

function metaFor(model: ClaudeModel): (typeof MODELS)[number] {
  return MODELS.find((m) => m.model === model) ?? MODELS[0];
}

export function ModelChip({ model, onSetModel }: ModelChipProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useDismissOnOutsideClick(rootRef, open, () => setOpen(false));

  const current = metaFor(model);

  return (
    <div className="model" ref={rootRef}>
      <button
        type="button"
        className={`model__chip ${open ? "model__chip--open" : ""}`}
        aria-expanded={open}
        title="Model"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`model__icon model__icon--${current.model}`}>
          <TierBars level={current.level} />
        </span>
        model: {current.label}
      </button>

      {open && (
        <div className="model__popover" role="dialog" aria-label="Model">
          <div className="model__popover-head">Model</div>
          {MODELS.map((m) => (
            <button
              key={m.model}
              type="button"
              className={`model__option ${m.model === model ? "model__option--active" : ""}`}
              aria-pressed={m.model === model}
              onClick={() => {
                onSetModel(m.model);
                setOpen(false);
              }}
            >
              <span className={`model__icon model__icon--${m.model}`}>
                <TierBars level={m.level} />
              </span>
              <span className="model__option-text">
                <span className="model__option-label">
                  {m.label}
                  {m.model === model ? " ●" : ""}
                </span>
                <span className="model__option-hint">{m.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
