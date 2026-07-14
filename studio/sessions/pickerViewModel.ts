// Session picker view-model. Pure. The sidecar adapts SDK
// `listSessions()` output (and any lazy JSONL reads) into RawSession[].

export interface RawSession {
  sessionId: string;
  summary?: string;
  firstUserMessage?: string;
  mtime: number;
  sizeBytes?: number;
  repoPath?: string;
}

export interface SessionListItem {
  sessionId: string;
  title: string;
  mtime: number;
  sizeBytes: number | null;
  repoPath: string | null;
}

/**
 * Map raw session metadata into a sorted (mtime desc) pick-list.
 * title = summary ?? truncated firstUserMessage ?? "(untitled)".
 */
/** Longest a firstUserMessage-derived title may run before it is ellipsized. */
const TITLE_MAX = 80;

/** Collapse whitespace and trim; returns undefined for blank/absent input. */
function clean(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const collapsed = value.replace(/\s+/g, " ").trim();
  return collapsed === "" ? undefined : collapsed;
}

function truncate(value: string): string {
  return value.length > TITLE_MAX ? `${value.slice(0, TITLE_MAX).trimEnd()}…` : value;
}

export function toPickerViewModel(sessions: readonly RawSession[]): SessionListItem[] {
  return [...sessions]
    .sort((a, b) => b.mtime - a.mtime)
    .map((session) => {
      const summary = clean(session.summary);
      const firstMessage = clean(session.firstUserMessage);
      const title = summary ?? (firstMessage !== undefined ? truncate(firstMessage) : undefined) ?? "(untitled)";
      return {
        sessionId: session.sessionId,
        title,
        mtime: session.mtime,
        sizeBytes: session.sizeBytes ?? null,
        repoPath: session.repoPath ?? null,
      };
    });
}
