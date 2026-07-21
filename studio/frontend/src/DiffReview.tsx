// Shared diff-review scaffolding for the ship and save-draft panels: the scope toggle's state, the
// scope-scoped diff load, and the diff/status/warning render. Each panel keeps its own distinct flow
// (confirm gate, commit form, result) around this.

import { useEffect, useState } from "react";
import { getDiff } from "./api";
import { DiffView } from "./DiffView";
import { ScopeWarning } from "./ScopeWarning";

export interface DiffReview {
  scope: "post" | "all";
  setScope: (scope: "post" | "all") => void;
  status: string;
  diff: string | null;
  diffError: string | null;
  outsideCount: number;
}

/**
 * Load the working-tree diff for review, re-fetching whenever the scope changes. Pass `path` to
 * target a specific post (save-draft); omit it for the whole working tree (ship).
 */
export function useDiffReview(path?: string): DiffReview {
  const [scope, setScope] = useState<"post" | "all">("post");
  const [status, setStatus] = useState<string>("");
  const [diff, setDiff] = useState<string | null>(null);
  const [diffError, setDiffError] = useState<string | null>(null);
  const [outsideCount, setOutsideCount] = useState(0);

  useEffect(() => {
    let live = true;
    setDiff(null);
    setDiffError(null);
    getDiff(scope, path)
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
        setOutsideCount(res.outsideCount);
      })
      .catch((e: unknown) => {
        if (live) setDiffError(e instanceof Error ? e.message : "failed to load diff");
      });
    return () => {
      live = false;
    };
  }, [path, scope]);

  return { scope, setScope, status, diff, diffError, outsideCount };
}

/** The scope warning and diff body shared by both panels; `emptyLabel` names the no-diff case. */
export function DiffReviewSection({ review, emptyLabel }: { review: DiffReview; emptyLabel: string }) {
  const { scope, setScope, status, diff, diffError, outsideCount } = review;
  return (
    <>
      {scope === "post" && outsideCount > 0 && <ScopeWarning count={outsideCount} onSwitchToAll={() => setScope("all")} />}

      <section className="ship__diff">
        <div className="ship__diff-status">{status || "working tree"}</div>
        {diffError && <p className="ship__error">{diffError}</p>}
        {!diffError && diff === null && <p className="ship__loading">Loading diff…</p>}
        {diff !== null && (diff.trim() ? <DiffView diff={diff} /> : <p className="ship__loading">{emptyLabel}</p>)}
      </section>
    </>
  );
}
