// Ship-as-PR panel: review the working-tree diff, fill a commit message, and run the ship flow
// behind an explicit confirm gate. The sidecar (never the agent) runs git/gh. Surfaces the
// resulting PR URL, or the error on failure.

import { useState } from "react";
import type { ShipResponse } from "../../shared/protocol";
import { ship } from "./api";
import { DiffReviewSection, useDiffReview } from "./DiffReview";
import { ScopeSelector } from "./ScopeSelector";

interface ShipPanelProps {
  /** The active post's isolation branch, display-only (the sidecar pushes its own regardless).
   *  Null before a post is active. */
  branch: string | null;
  /** Frontmatter/filename name-sync. When `synced` is false, ship is blocked (the sidecar refuses
   *  a desynced post too; this disables the button and explains why). */
  nameSync: { synced: boolean; expectedStem?: string; currentStem?: string };
  onClose: () => void;
}

type Phase = "editing" | "confirming" | "shipping" | "result";

export function ShipPanel({ branch, nameSync, onClose }: ShipPanelProps) {
  const review = useDiffReview();
  const { scope, setScope } = review;

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [phase, setPhase] = useState<Phase>("editing");
  const [result, setResult] = useState<ShipResponse | null>(null);

  // Can't ship until the branch resolves, and never while the frontmatter/filename is desynced.
  const canShip = !!branch && subject.trim().length > 0 && nameSync.synced;

  async function doShip(): Promise<void> {
    setPhase("shipping");
    try {
      // The sidecar ignores `branch`, but send the true value so the wire matches what happens.
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
        <ScopeSelector scope={scope} onChange={setScope} />
      </header>

      <DiffReviewSection review={review} emptyLabel="No changes to ship." />

      {phase !== "result" && (
        <section className="ship__form">
          {!nameSync.synced && (
            <p className="ship__error">
              This post's deployed URL has changed to <code>{nameSync.expectedStem}</code>. Rename the worktree to
              match, or revert the URL, before shipping.
            </p>
          )}
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
