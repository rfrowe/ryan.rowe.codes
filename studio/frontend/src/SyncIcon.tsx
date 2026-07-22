/** Circular-arrows glyph for the tab bar's fetch-from-origin button; inherits currentColor. */
export function SyncIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 6V3L8 7l4 4V8c2.76 0 5 2.24 5 5 0 .85-.22 1.65-.6 2.35l1.46 1.46A6.96 6.96 0 0019 13c0-3.87-3.13-7-7-7zm0 12c-2.76 0-5-2.24-5-5 0-.85.22-1.65.6-2.35L6.14 9.19A6.96 6.96 0 005 13c0 3.87 3.13 7 7 7v3l4-4-4-4v3z"
      />
    </svg>
  );
}
