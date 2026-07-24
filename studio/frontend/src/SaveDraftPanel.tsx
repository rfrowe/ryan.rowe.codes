// Save-draft-to-remote panel: review the worktree's diff, fill a commit message, and push the post's
// branch to origin without opening a PR. Mirrors the ship panel (shares DiffView, the /diff endpoint,
// and the scope toggle), but is non-destructive: it preserves work so the draft can be resumed
// elsewhere. The sidecar (never the agent) runs git. Surfaces the pushed branch, or the error.

import { useEffect, useRef, useState } from "react";
import type { GitState, PushFailure, SaveDraftResponse } from "../../shared/protocol";
import { forcePushSaveDraft, saveDraft } from "./api";
import { DiffReviewSection, useDiffReview } from "./DiffReview";
import { PushLossPreview } from "./PushLossPreview";
import { ScopeSelector } from "./ScopeSelector";
import { selectPost } from "./gitSelectors";
import { slugFromPath } from "./slug";

interface SaveDraftPanelProps {
  /** Canonical path of the post to save (any open tab, not only the active one). */
  path: string;
  /** Every git fact; the post's isolation branch (display-only, the sidecar pushes its own
   *  regardless) comes from here. */
  git: GitState;
  onClose: () => void;
}

// Mirrors ship's own escalation ladder (F7): a plain push rejected as diverged opens a loss-preview
// instead of just failing, offering --force-with-lease, and a stale lease escalates once more to a
// bare --force.
type Phase = "editing" | "saving" | "loss-preview" | "force-pushing" | "raw-force-preview" | "raw-force-pushing" | "result";

export function SaveDraftPanel({ path, git, onClose }: SaveDraftPanelProps) {
  const review = useDiffReview(path);
  const { scope, setScope } = review;
  const branch = selectPost(git, path)?.branch ?? null;

  const [subject, setSubject] = useState(`blog(${slugFromPath(path)}): draft`);
  const [body, setBody] = useState("");
  const [phase, setPhase] = useState<Phase>("editing");
  const [result, setResult] = useState<SaveDraftResponse | null>(null);
  const [pushFailure, setPushFailure] = useState<PushFailure | null>(null);
  // The modal can be dismissed (backdrop click) while a save is in flight; the push still completes,
  // but its resolution must not set state on an unmounted panel. Reset to true in the effect body,
  // not just the initializer: Strict Mode's dev-only double-invoke runs this cleanup once immediately
  // after mount, which would otherwise wedge `alive` false before any real save ever starts.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const canSave = subject.trim().length > 0;

  async function doSave(): Promise<void> {
    setPhase("saving");
    let res: SaveDraftResponse;
    try {
      res = await saveDraft({ path, subject: subject.trim(), body, scope, confirm: true });
    } catch (e: unknown) {
      res = { ok: false, error: e instanceof Error ? e.message : "save request failed" };
    }
    if (!alive.current) return; // dismissed mid-save; the push finished regardless
    if (!res.ok && res.push?.reason === "non-ff") {
      setPushFailure(res.push);
      setPhase("loss-preview");
      return;
    }
    setResult(res);
    setPhase("result");
  }

  async function doForcePush(mode: "with-lease" | "raw"): Promise<void> {
    setPhase(mode === "with-lease" ? "force-pushing" : "raw-force-pushing");
    let res: SaveDraftResponse;
    try {
      res = await forcePushSaveDraft({ path, mode, confirm: true });
    } catch (e: unknown) {
      res = { ok: false, error: e instanceof Error ? e.message : "force-push request failed" };
    }
    if (!alive.current) return;
    // --force-with-lease itself got rejected because the lease went stale; its own push field was
    // just refreshed against the actual current remote, so escalate once more to raw --force.
    if (mode === "with-lease" && !res.ok && res.push?.reason === "stale-lease") {
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
        <h2>Save draft to remote</h2>
        <ScopeSelector scope={scope} onChange={setScope} />
      </header>

      <DiffReviewSection review={review} emptyLabel="Nothing uncommitted — the branch is pushed as-is." />

      {(phase === "editing" || phase === "saving") && (
        <section className="ship__form">
          <p className="ship__confirm-msg">
            Commit as Ryan Rowe and push this post's branch to origin, without opening a PR. Reopen it any time
            from ⌘P (it becomes an adoptable remote draft), or check it out in another editor.
          </p>
          <div className="ship__field">
            <span>Branch</span>
            <code className="ship__branch">{branch ?? "the post's branch"}</code>
          </div>
          <label className="ship__field">
            <span>Commit subject</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Save draft" />
          </label>
          <label className="ship__field">
            <span>Body</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Optional commit body." />
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
            <button className="btn btn--primary" disabled={!canSave} onClick={() => void doSave()}>
              Save to remote
            </button>
          </>
        )}
        {phase === "saving" && <span className="ship__loading">Saving… (commit, push)</span>}
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
                {result.noop ? (
                  <>
                    Already up to date on <code>origin/{result.branch}</code> — nothing new to save.
                  </>
                ) : (
                  <>
                    Saved to <code>origin/{result.branch}</code>. Reopen it any time from ⌘P.
                  </>
                )}
              </p>
            ) : (
              <div className="ship__fail">
                <p>Save failed: {result.error}</p>
              </div>
            )}
            <button className="btn btn--ghost" onClick={onClose}>
              Close
            </button>
            {!result.ok && (
              <button className="btn" onClick={() => setPhase("editing")}>
                Edit &amp; retry
              </button>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
