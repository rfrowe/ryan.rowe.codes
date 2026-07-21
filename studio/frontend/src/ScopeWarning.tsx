// Nudges toward scope "all" when scope "post" is selected but changes exist outside the post that
// it would leave behind; never blocks "post", just offers a one-click switch. Reuses the same
// warning-triangle icon as the frontmatter/filename desync banner (App.tsx) for a consistent "heads
// up" register.

import { WarnIcon } from "./WarnIcon";

export function ScopeWarning({ count, onSwitchToAll }: { count: number; onSwitchToAll: () => void }) {
  return (
    <div className="scope-warning">
      <WarnIcon size={14} className="scope-warning__icon" />
      <span className="scope-warning__text">
        {count} change{count === 1 ? "" : "s"} outside this post won't be included.
      </span>
      <button type="button" className="scope-warning__action" onClick={onSwitchToAll}>
        Include everything
      </button>
    </div>
  );
}
