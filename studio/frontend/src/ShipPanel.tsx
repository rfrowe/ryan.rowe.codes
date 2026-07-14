// Ship-as-PR panel: review the working-tree diff, fill a human-authored commit
// message, and run the studio ship flow behind an explicit confirm gate. The
// sidecar (never the agent) runs git/gh; the ship is human-gated (the author
// reviews the diff and confirms) with no attribution check. This panel surfaces
// the resulting PR URL, or the error if the ship fails.

import { useEffect, useState } from "react";
import type { ShipResponse } from "../../shared/protocol";
import { getDiff, ship } from "./api";
import { DiffView } from "./DiffView";

interface ShipPanelProps {
  /** The active post's real isolation branch (`blog/<date>_<slug>`), from the `active` broadcast.
   *  Display-only: the sidecar derives and pushes this branch regardless of anything the SPA sends.
   *  Null before a post is active. */
  branch: string | null;
  onClose: () => void;
}

type Phase = "editing" | "confirming" | "shipping" | "result";

export function ShipPanel({ branch, onClose }: ShipPanelProps) {
  const [scope, setScope] = useState<"post" | "all">("post");
  const [status, setStatus] = useState<string>("");
  const [diff, setDiff] = useState<string | null>(null);
  const [diffError, setDiffError] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [phase, setPhase] = useState<Phase>("editing");
  const [result, setResult] = useState<ShipResponse | null>(null);

  useEffect(() => {
    let live = true;
    setDiff(null);
    setDiffError(null);
    getDiff(scope)
      .then((res) => {
        if (!live) return;
        // The sidecar replies { error } (not { status, diff }) when the diff fails (git timeout,
        // git missing). asJson doesn't throw on a 500, so guard the shape here; otherwise an
        // undefined `diff` reaches the render, where `diff.trim()` throws and white-screens.
        if (typeof res.diff !== "string") {
          const message = (res as { error?: string }).error;
          setDiffError(message && message.trim() ? message : "failed to load diff");
          return;
        }
        setStatus(res.status);
        setDiff(res.diff);
      })
      .catch((e: unknown) => {
        if (live) setDiffError(e instanceof Error ? e.message : "failed to load diff");
      });
    return () => {
      live = false;
    };
  }, [scope]);

  // Can't ship until the active post's branch has resolved (null = no active post / still activating).
  const canShip = !!branch && subject.trim().length > 0;

  async function doShip(): Promise<void> {
    setPhase("shipping");
    try {
      // `branch` is the real branch the sidecar will push; it ignores this field, but send the
      // true value rather than a stale guess so the wire matches what actually happens.
      const res = await ship({ branch: branch ?? "", subject: subject.trim(), body, scope, confirm: true });
      setResult(res);
    } catch (e: unknown) {
      setResult({ ok: false, error: e instanceof Error ? e.message : "ship request failed" });
    }
    setPhase("result");
  }

  return (
    <div className="ship">
      <header className="ship__head">
        <h2>Ship as PR</h2>
        <div className="ship__scope">
          <label>
            <input type="radio" checked={scope === "post"} onChange={() => setScope("post")} /> post only
          </label>
          <label>
            <input type="radio" checked={scope === "all"} onChange={() => setScope("all")} /> all changes
          </label>
        </div>
      </header>

      <section className="ship__diff">
        <div className="ship__diff-status">{status || "working tree"}</div>
        {diffError && <p className="ship__error">{diffError}</p>}
        {!diffError && diff === null && <p className="ship__loading">Loading diff…</p>}
        {diff !== null && (diff.trim() ? <DiffView diff={diff} /> : <p className="ship__loading">No changes to ship.</p>)}
      </section>

      {phase !== "result" && (
        <section className="ship__form">
          <div className="ship__field">
            <span>Branch</span>
            <code className="ship__branch">{branch ?? "resolving…"}</code>
          </div>
          <label className="ship__field">
            <span>Subject</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Add the skyline post" />
          </label>
          <label className="ship__field">
            <span>Body</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Optional PR body (human-authored)." />
          </label>
        </section>
      )}

      <footer className="ship__foot">
        {phase === "editing" && (
          <>
            <button className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" disabled={!canShip} onClick={() => setPhase("confirming")}>
              Review & ship…
            </button>
          </>
        )}
        {phase === "confirming" && (
          <>
            <span className="ship__confirm-msg">
              Branch <code>{branch ?? "the post's branch"}</code>, commit as Ryan Rowe, push, and open a PR. Proceed?
            </span>
            <button className="btn btn--ghost" onClick={() => setPhase("editing")}>
              Back
            </button>
            <button className="btn btn--primary" onClick={() => void doShip()}>
              Confirm & open PR
            </button>
          </>
        )}
        {phase === "shipping" && <span className="ship__loading">Shipping… (branch, commit, push, PR)</span>}
        {phase === "result" && result && (
          <div className="ship__result">
            {result.ok ? (
              <p className="ship__ok">
                PR opened:{" "}
                <a href={result.prUrl} target="_blank" rel="noreferrer">
                  {result.prUrl}
                </a>
              </p>
            ) : (
              <div className="ship__fail">
                <p>Ship failed: {result.error}</p>
              </div>
            )}
            <button className="btn btn--ghost" onClick={onClose}>
              Close
            </button>
            {!result.ok && (
              <button className="btn" onClick={() => setPhase("editing")}>
                Edit & retry
              </button>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
