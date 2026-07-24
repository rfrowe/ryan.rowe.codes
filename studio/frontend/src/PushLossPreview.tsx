// The force-push escalation ladder's loss preview (F7): what a force would discard. Shared by the
// ship and save-draft panels; `danger` distinguishes the last-resort raw --force lever (a stale
// lease already ruled out --force-with-lease) from the initial one. The confirm/cancel actions live
// in each panel's own footer, alongside its other phases.

import type { PushFailure } from "../../shared/protocol";
import { DiffView } from "./DiffView";

export function PushLossPreview({ push, danger }: { push: PushFailure; danger: boolean }) {
  const commitWord = push.remoteOnlyCommits.length === 1 ? "commit" : "commits";
  return (
    <div className={`ship__loss${danger ? " ship__loss--danger" : ""}`}>
      <p className="ship__loss-warn">
        {danger ? (
          <>
            <code>--force-with-lease</code> was rejected too — the remote moved again since. A bare{" "}
            <code>--force</code> discards the {commitWord} below with no further safety check.
          </>
        ) : (
          <>
            The remote has {commitWord} this branch doesn't. Pushing anyway (<code>--force-with-lease</code>)
            discards them.
          </>
        )}
      </p>
      {push.remoteOnlyCommits.length > 0 && (
        <ul className="ship__loss-commits">
          {push.remoteOnlyCommits.map((c) => (
            <li key={c}>
              <code>{c}</code>
            </li>
          ))}
        </ul>
      )}
      {push.diff.trim().length > 0 && <DiffView diff={push.diff} />}
    </div>
  );
}
