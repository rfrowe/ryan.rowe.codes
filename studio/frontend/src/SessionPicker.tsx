// Session picker: New / Resume / Fork over the frozen WS session-select message.
// Lists prior Claude Code sessions via GET /sessions (the only session REST DTO the
// protocol froze); the mutation goes over the WS `session.select` message, whose
// `session` reply flows back on the same socket alongside the agent stream.

import { useEffect, useState } from "react";
import type { AgentState, SessionMode } from "../../shared/types";
import type { SessionListItem } from "../../sessions/pickerViewModel";
import { getSessions } from "./api";
import { ScopeSelector, type Scope } from "./ScopeSelector";

interface SessionPickerProps {
  current: AgentState;
  onSelect: (mode: SessionMode, sessionId?: string) => void;
  onClose: () => void;
}

function ago(mtime: number): string {
  const mins = Math.max(0, Math.round((Date.now() - mtime) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function SessionPicker({ current, onSelect, onClose }: SessionPickerProps) {
  const [sessions, setSessions] = useState<SessionListItem[] | null>(null);
  const [selected, setSelected] = useState<string | null>(current.sessionId);
  const [error, setError] = useState<string | null>(null);
  // Open scoped to the active post's worktree; widen to every session on demand.
  const [scope, setScope] = useState<Scope>("post");

  useEffect(() => {
    let live = true;
    setSessions(null);
    setError(null);
    getSessions(scope)
      .then((res) => {
        if (live) setSessions(res.sessions);
      })
      .catch((e: unknown) => {
        if (live) setError(e instanceof Error ? e.message : "failed to load sessions");
      });
    return () => {
      live = false;
    };
  }, [scope]);

  return (
    <div className="picker">
      <header className="picker__head">
        <h2>Session</h2>
        <span className="picker__current">
          current: {current.mode}
          {current.sessionId ? ` · ${current.sessionId}` : ""}
        </span>
      </header>

      <div className="picker__new">
        <button
          className="btn btn--primary"
          onClick={() => {
            onSelect("new");
            onClose();
          }}
        >
          New session
        </button>
        <span className="picker__hint">Fresh cold-post session rooted in the blog repo.</span>
      </div>

      <div className="picker__scope">
        <span className="picker__hint">Show sessions from</span>
        <ScopeSelector scope={scope} onChange={setScope} />
      </div>

      <div className="picker__list">
        {error && <p className="picker__error">{error}</p>}
        {!error && sessions === null && <p className="picker__loading">Loading sessions…</p>}
        {sessions?.length === 0 && <p className="picker__loading">No prior sessions found.</p>}
        {sessions?.map((s) => (
          <label key={s.sessionId} className={`picker__row ${selected === s.sessionId ? "picker__row--sel" : ""}`}>
            <input
              type="radio"
              name="session"
              checked={selected === s.sessionId}
              onChange={() => setSelected(s.sessionId)}
            />
            <span className="picker__title">{s.title}</span>
            <span className="picker__meta">
              {ago(s.mtime)}
              {s.repoPath ? ` · ${s.repoPath}` : ""}
              {s.sizeBytes != null ? ` · ${Math.round(s.sizeBytes / 1024)} KB` : ""}
            </span>
          </label>
        ))}
      </div>

      <footer className="picker__foot">
        <button className="btn btn--ghost" onClick={onClose}>
          Close
        </button>
        <button
          className="btn"
          disabled={!selected}
          onClick={() => {
            if (selected) onSelect("resume", selected);
            onClose();
          }}
        >
          Resume
        </button>
        <button
          className="btn"
          disabled={!selected}
          onClick={() => {
            if (selected) onSelect("fork", selected);
            onClose();
          }}
        >
          Fork
        </button>
      </footer>
    </div>
  );
}
