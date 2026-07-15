// Save-draft-to-remote panel: review the post's diff, fill a commit message, and push the post's
// branch to origin without opening a PR. Mirrors the ship panel (shares DiffView + the /diff
// endpoint), but is post-scoped and non-destructive: it preserves work so the draft can be resumed
// elsewhere. The sidecar (never the agent) runs git. Surfaces the pushed branch, or the error.

import { useEffect, useRef, useState } from "react";
import type { SaveDraftResponse } from "../../shared/protocol";
import { getDiff, saveDraft } from "./api";
import { DiffView } from "./DiffView";
import { slugFromPath } from "./slug";

interface SaveDraftPanelProps {
  /** Canonical path of the post to save (any open tab, not only the active one). */
  path: string;
  /** The post's isolation branch, display-only (the sidecar pushes its own regardless). */
  branch: string | null;
  /** The post's title, seeding the default commit subject. */
  title: string;
  onClose: () => void;
}

type Phase = "editing" | "saving" | "result";

export function SaveDraftPanel({ path, branch, title, onClose }: SaveDraftPanelProps) {
  const label = title || slugFromPath(path);
  const [status, setStatus] = useState<string>("");
  const [diff, setDiff] = useState<string | null>(null);
  const [diffError, setDiffError] = useState<string | null>(null);

  const [subject, setSubject] = useState(`Save draft: ${label}`);
  const [body, setBody] = useState("");
  const [phase, setPhase] = useState<Phase>("editing");
  const [result, setResult] = useState<SaveDraftResponse | null>(null);
  // The modal can be dismissed (backdrop click) while a save is in flight; the push still completes,
  // but its resolution must not set state on an unmounted panel.
  const alive = useRef(true);
  useEffect(() => () => {
    alive.current = false;
  }, []);

  useEffect(() => {
    let live = true;
    getDiff("post", path)
      .then((res) => {
        if (!live) return;
        // The sidecar replies { error } when the diff fails, and asJson doesn't throw on a 500;
        // guard the shape so an undefined `diff` doesn't reach `diff.trim()` and white-screen.
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
  }, [path]);

  const canSave = subject.trim().length > 0;

  async function doSave(): Promise<void> {
    setPhase("saving");
    let res: SaveDraftResponse;
    try {
      res = await saveDraft({ path, subject: subject.trim(), body, confirm: true });
    } catch (e: unknown) {
      res = { ok: false, error: e instanceof Error ? e.message : "save request failed" };
    }
    if (!alive.current) return; // dismissed mid-save; the push finished regardless
    setResult(res);
    setPhase("result");
  }

  return (
    <div className="ship">
      <header className="ship__head">
        <h2>Save draft to remote</h2>
      </header>

      <section className="ship__diff">
        <div className="ship__diff-status">{status || "working tree"}</div>
        {diffError && <p className="ship__error">{diffError}</p>}
        {!diffError && diff === null && <p className="ship__loading">Loading diff…</p>}
        {diff !== null &&
          (diff.trim() ? <DiffView diff={diff} /> : <p className="ship__loading">Nothing uncommitted — the branch is pushed as-is.</p>)}
      </section>

      {phase !== "result" && (
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
