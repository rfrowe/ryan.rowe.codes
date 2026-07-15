// Nudges toward scope "all" when scope "post" is selected but changes exist outside the post that
// it would leave behind; never blocks "post", just offers a one-click switch. Reuses the same
// warning-triangle icon as the frontmatter/filename desync banner (App.tsx) for a consistent "heads
// up" register.

export function ScopeWarning({ count, onSwitchToAll }: { count: number; onSwitchToAll: () => void }) {
  return (
    <div className="scope-warning">
      <svg className="scope-warning__icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
      <span className="scope-warning__text">
        {count} change{count === 1 ? "" : "s"} outside this post won't be included.
      </span>
      <button type="button" className="scope-warning__action" onClick={onSwitchToAll}>
        Include everything
      </button>
    </div>
  );
}
