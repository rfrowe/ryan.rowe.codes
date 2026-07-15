// The post/everything choice, shared everywhere it's real: ship, save-draft, and revert. Delete
// never renders this, since deletion is never partial, so there's nothing to choose.

export type Scope = "post" | "all";

interface ScopeSelectorProps {
  scope: Scope;
  onChange: (scope: Scope) => void;
  disabled?: boolean;
}

const OPTIONS: { value: Scope; label: string }[] = [
  { value: "post", label: "Post only" },
  { value: "all", label: "Everything" },
];

export function ScopeSelector({ scope, onChange, disabled }: ScopeSelectorProps) {
  return (
    <div className="scope-toggle" role="radiogroup" aria-label="Scope">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={scope === opt.value}
          disabled={disabled}
          className={`scope-toggle__option${scope === opt.value ? " scope-toggle__option--active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
