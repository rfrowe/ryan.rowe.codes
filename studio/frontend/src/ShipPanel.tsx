// Ship-as-PR panel: review the working-tree diff, fill a commit message, and run the ship flow
// behind an explicit confirm gate. The sidecar (never the agent) runs git/gh. Surfaces the
// resulting PR URL, or the error on failure.

import { useState } from "react";
import type { GitState, PushFailure, ShipResponse } from "../../shared/protocol";
import { forcePushShip, ship } from "./api";
import { DiffReviewSection, useDiffReview } from "./DiffReview";
import { PushLossPreview } from "./PushLossPreview";
import { ScopeSelector } from "./ScopeSelector";
import { selectPost, selectRootName, selectShipBlocked } from "./gitSelectors";

interface ShipPanelProps {
  /** The active post's slug, seeding the conventional-commit subject prefix. Null before a post
   *  is active. */
  slug: string | null;
  /** The active post's canonical path, keying the ship gate (F7). Null before a post is active. */
  path: string | null;
  /** Every git fact; the ship gate reads the active post's own `behind`, not `primary.behind`. */
  git: GitState;
  /** Frontmatter/filename name-sync. When `synced` is false, ship is blocked (the sidecar refuses
   *  a desynced post too; this disables the button and explains why). */
  nameSync: { synced: boolean; expectedStem?: string; currentStem?: string };
  onClose: () => void;
}

// F7's escalation ladder: a plain push rejected as diverged opens a loss-preview behind the same
// modal shell instead of just failing; "loss-preview" offers --force-with-lease, and a stale lease
// escalates once more to "raw-force-preview" for a bare --force.
type Phase = "editing" | "confirming" | "shipping" | "loss-preview" | "force-pushing" | "raw-force-preview" | "raw-force-pushing" | "result";

export function ShipPanel({ slug, path, git, nameSync, onClose }: ShipPanelProps) {
  const review = useDiffReview();
  const { scope, setScope } = review;

  const [subject, setSubject] = useState(() => (slug ? `blog(${slug}): ` : ""));
  const [body, setBody] = useState("");

  const [phase, setPhase] = useState<Phase>("editing");
  const [result, setResult] = useState<ShipResponse | null>(null);
  const [pushFailure, setPushFailure] = useState<PushFailure | null>(null);

  // Ship gate (F7): a real hard gate, not merely advisory. The sidecar re-checks this too, so
  // bypassing the disabled button still can't ship.
  const shipBlocked = !!path && selectShipBlocked(git, path);
  const behind = (path && selectPost(git, path)?.behind) || 0;
  const rootName = selectRootName(git);
  const branch = (path && selectPost(git, path)?.branch) || null;

  // Can't ship until the branch resolves, never while the frontmatter/filename is desynced, and
  // never while behind the root (rebase first).
  const canShip = !!branch && subject.trim().length > 0 && nameSync.synced && !shipBlocked;

  async function doShip(): Promise<void> {
    setPhase("shipping");
    let res: ShipResponse;
    try {
      // The sidecar ignores `branch`, but send the true value so the wire matches what happens.
      res = await ship({ branch: branch ?? "", subject: subject.trim(), body, scope, confirm: true });
    } catch (e: unknown) {
      res = { ok: false, error: e instanceof Error ? e.message : "ship request failed", behind: undefined };
    }
    if (!res.ok && res.behind === undefined && res.push?.reason === "non-ff") {
      setPushFailure(res.push);
      setPhase("loss-preview");
      return;
    }
    setResult(res);
    setPhase("result");
  }

  async function doForcePush(mode: "with-lease" | "raw"): Promise<void> {
    setPhase(mode === "with-lease" ? "force-pushing" : "raw-force-pushing");
    let res: ShipResponse;
    try {
      res = await forcePushShip({ mode, subject: subject.trim(), body, confirm: true });
    } catch (e: unknown) {
      res = { ok: false, error: e instanceof Error ? e.message : "force-push request failed", behind: undefined };
    }
    // --force-with-lease itself got rejected because the lease went stale; its own push field was
    // just refreshed against the actual current remote, so escalate once more to raw --force.
    if (mode === "with-lease" && !res.ok && res.behind === undefined && res.push?.reason === "stale-lease") {
      setPushFailure(res.push);
      setPhase("raw-force-preview");
      return;
    }
    setResult(res);
    setPhase("result");
  }

  return (
    <div className="ship">
      <header className="ship__head">
        <h2>Ship as PR</h2>
        <ScopeSelector scope={scope} onChange={setScope} />
      </header>

      <DiffReviewSection review={review} emptyLabel="No changes to ship." />

      {(phase === "editing" || phase === "confirming" || phase === "shipping") && (
        <section className="ship__form">
          {!nameSync.synced && (
            <p className="ship__error">
              This post's deployed URL has changed to <code>{nameSync.expectedStem}</code>. Rename the worktree to
              match, or revert the URL, before shipping.
            </p>
          )}
          {shipBlocked && (
            <p className="ship__error">
              ⚠ {behind} behind <code>{rootName}</code>. Fetch and rebase onto <code>{rootName}</code> before
              shipping.
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

      {(phase === "loss-preview" || phase === "force-pushing") && pushFailure && (
        <PushLossPreview push={pushFailure} danger={false} />
      )}
      {(phase === "raw-force-preview" || phase === "raw-force-pushing") && pushFailure && (
        <PushLossPreview push={pushFailure} danger={true} />
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
        {phase === "loss-preview" && (
          <>
            <button className="btn btn--ghost" onClick={() => setPhase("editing")}>
              Cancel
            </button>
            <button className="btn btn--danger" onClick={() => void doForcePush("with-lease")}>
              Force push
            </button>
          </>
        )}
        {phase === "force-pushing" && <span className="ship__loading">Force pushing…</span>}
        {phase === "raw-force-preview" && (
          <>
            <button className="btn btn--ghost" onClick={() => setPhase("editing")}>
              Cancel
            </button>
            <button className="btn btn--danger" onClick={() => void doForcePush("raw")}>
              Force push anyway
            </button>
          </>
        )}
        {phase === "raw-force-pushing" && <span className="ship__loading">Force pushing…</span>}
        {phase === "result" && result && (
          <div className="ship__result">
            {result.ok ? (
              <p className="ship__ok">
                PR opened:{" "}
                <a href={result.prUrl} target="_blank" rel="noreferrer">
                  {result.prUrl}
                </a>
                {result.previewUrl && (
                  <>
                    <br />
                    Preview (live once Cloudflare builds it):{" "}
                    <a href={result.previewUrl} target="_blank" rel="noreferrer">
                      {result.previewUrl}
                    </a>
                  </>
                )}
              </p>
            ) : (
              <div className="ship__fail">
                <p>
                  Ship failed:{" "}
                  {result.behind !== undefined
                    ? `${result.behind} behind ${rootName}. Fetch and rebase onto ${rootName} before shipping.`
                    : result.error}
                </p>
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
