// Persistent banner surfacing the studio root's own agent-assisted rebase-conflict resolution (F4 for
// the root worktree, dispatched by gitStatus.ts's updateRoot). The root has no tab of its own, so this
// is its only visible conversation surface: a status line plus a compact transcript, reusing the same
// message/tool styling as the per-post chat panel. No composer — root's turns are always
// server-dispatched, never human-typed.

import type { ChatItem } from "./chatRuntime";
import { PermissionCard, type PendingPermission } from "./Chat";
import type { PermissionDecision } from "../../shared/types";
import type { RootConflictPhase } from "./turnSelectors";

const PHASE_LABEL: Record<RootConflictPhase, string> = {
  queued: "Queued — waiting for the current turn to finish…",
  resolving: "Resolving a rebase conflict in the root worktree…",
  done: "Root rebase conflict",
};

function RootConflictItem({ item }: { item: ChatItem }) {
  switch (item.kind) {
    case "system":
    case "user":
      return (
        <div className="msg msg--system">
          <div className="msg__body">{item.text}</div>
        </div>
      );
    case "assistant":
      return (
        <div className="msg msg--assistant">
          <div className="msg__body">{item.text}</div>
        </div>
      );
    case "error":
      return (
        <div className="msg msg--error">
          <div className="msg__body">{item.text}</div>
        </div>
      );
    case "tool":
      return (
        <div className={`tool ${item.isError ? "tool--error" : ""}`}>
          <div className="tool__head">
            <span className={`tool__dot tool__dot--${item.isError ? "error" : item.status}`} aria-hidden="true" />
            <span className="tool__name">{item.name}</span>
          </div>
        </div>
      );
  }
}

export function RootConflictBanner({
  phase,
  chat,
  permissions,
  rootPath,
  onPermission,
  onDismiss,
}: {
  phase: RootConflictPhase;
  chat: ChatItem[];
  permissions: PendingPermission[];
  rootPath: string;
  onPermission: (requestId: string, decision: PermissionDecision) => void;
  onDismiss: () => void;
}) {
  // Nothing has ever been dispatched to root, or the human already dismissed the last outcome.
  if (chat.length === 0) return null;
  return (
    <div className="rootconflict">
      <div className="rootconflict__head">
        {phase !== "done" && <span className={`rootconflict__dot rootconflict__dot--${phase}`} aria-hidden="true" />}
        <span className="rootconflict__label">{PHASE_LABEL[phase]}</span>
        <button type="button" className="rootconflict__dismiss" aria-label="Dismiss" onClick={onDismiss}>
          ×
        </button>
      </div>
      <div className="rootconflict__log">
        {chat.map((item) => (
          <RootConflictItem key={item.id} item={item} />
        ))}
      </div>
      {permissions.map((p) => (
        <PermissionCard key={p.requestId} req={p} cwd={rootPath} onPermission={onPermission} />
      ))}
    </div>
  );
}
