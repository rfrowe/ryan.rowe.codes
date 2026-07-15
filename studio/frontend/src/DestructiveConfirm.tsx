// Confirmation dialog for a destructive tab action: delete draft or revert to clean. Surfaces
// exactly what would be lost (uncommitted-file / unmerged-commit counts, plus the diff being
// discarded) behind an explicit confirm button, mirroring the ship flow's confirm gate. Only
// shown when the sidecar reports there is something to lose (a clean delete never reaches here).

import { DiffView } from "./DiffView";

export interface DestructiveConfirmData {
  op: "delete" | "revert";
  path: string;
  changedFiles: number;
  ahead: number;
  diff: string;
}

interface DestructiveConfirmProps {
  data: DestructiveConfirmData;
  /** Human title of the target post (from the tab), for the header. */
  title: string;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  /** Delete only: push the draft to origin first, then delete the local worktree + branch, so the
   *  work survives as a remote draft. Omitted for revert. */
  onSaveAndDelete?: () => void;
  onCancel: () => void;
}

function plural(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

export function DestructiveConfirm({ data, title, busy, error, onConfirm, onSaveAndDelete, onCancel }: DestructiveConfirmProps) {
  const isDelete = data.op === "delete";

  const lossParts: string[] = [];
  if (data.changedFiles > 0) lossParts.push(plural(data.changedFiles, "uncommitted file"));
  if (data.ahead > 0) lossParts.push(plural(data.ahead, "unmerged commit"));
  const lossSummary = lossParts.join(" and ");

  return (
    <div className="confirm">
      <header className="confirm__head">
        <h2>{isDelete ? "Delete draft" : "Revert to clean"}</h2>
        <p className="confirm__sub">
          <code>{title}</code>
        </p>
      </header>

      <div className="confirm__body">
        <p className="confirm__warn">
          {isDelete ? (
            <>
              Removes this post's worktree and its <code>blog/</code> branch
              {lossSummary ? <>, discarding {lossSummary}</> : ""}. This can't be undone. Anything already
              merged to the main branch is untouched.
            </>
          ) : (
            <>Discards your uncommitted edits and restores the post to its last committed state. The changes below will be lost.</>
          )}
        </p>
        {isDelete && onSaveAndDelete && (
          <p className="confirm__hint">
            Want to keep it? Save it to origin first — the local copy is removed, but the draft stays on the
            remote and can be reopened later.
          </p>
        )}
        {data.diff.trim().length > 0 && <DiffView diff={data.diff} />}
        {error && <p className="confirm__error">{error}</p>}
      </div>

      <footer className="confirm__foot">
        <button className="btn btn--ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        {isDelete && onSaveAndDelete && (
          <button className="btn btn--primary" onClick={onSaveAndDelete} disabled={busy}>
            {busy ? "Working…" : "Save to remote & delete"}
          </button>
        )}
        <button className="btn btn--danger" onClick={onConfirm} disabled={busy}>
          {busy ? (isDelete ? "Deleting…" : "Reverting…") : isDelete ? "Delete draft" : "Revert"}
        </button>
      </footer>
    </div>
  );
}
