// Document-sync state machine. Pure reducer, no I/O.

import type { DocRev } from "../shared/types";

export interface SyncState {
  /** Editor soft-locked for the full agent turn (dispatch to final result). */
  locked: boolean;
  /** Buffer has unsaved edits relative to `baseRev`. */
  dirty: boolean;
  /** Rev last known on disk. */
  baseRev: DocRev;
  /** An external (non-agent, non-self) disk change was seen while dirty. */
  conflict: boolean;
}

export type SyncEvent =
  | { type: "edit" }
  | { type: "autosave.request" }
  | { type: "autosave.acked"; rev: DocRev }
  | { type: "prompt.dispatch" }
  | { type: "agent.turn.end" }
  | { type: "disk.changed"; origin: "agent" | "self" | "external"; rev: DocRev }
  | { type: "reload.confirm" };

export type SyncEffect =
  | { type: "save" }
  | { type: "lock" }
  | { type: "unlock" }
  | { type: "reloadFromDisk"; rev: DocRev }
  | { type: "showReloadBanner" };

export interface Transition {
  state: SyncState;
  effects: SyncEffect[];
}

export function initialSyncState(baseRev: DocRev): SyncState {
  return { locked: false, dirty: false, baseRev, conflict: false };
}

/**
 * Pure reducer. Invariants the implementation must hold:
 *  - Disk is the single source of truth.
 *  - No lost author edits: an external disk change while `dirty` must not blind-overwrite
 *    the buffer; emit `showReloadBanner` and set `conflict`.
 *  - `prompt.dispatch` assumes save-before-prompt already flushed; it emits `lock`.
 *  - `agent.turn.end` emits `unlock`.
 *  - An `agent`/`self`-origin disk change during a locked turn emits `reloadFromDisk`
 *    (the caller merges, preserving human keystrokes typed after the last autosave).
 */
export function transition(state: SyncState, event: SyncEvent): Transition {
  switch (event.type) {
    // A local keystroke. The buffer diverges from disk until the next autosave ack;
    // this holds even during a locked agent turn (those keystrokes are preserved and
    // merged when the agent's write lands; see the disk.changed handling below).
    case "edit":
      return { state: { ...state, dirty: true }, effects: [] };

    // Debounced autosave tick. Flush only when there is something to flush and it is
    // safe to do so: never while an agent turn holds the lock (the agent is writing),
    // and never while a conflict banner is up (would clobber the external change).
    case "autosave.request":
      return state.dirty && !state.locked && !state.conflict
        ? { state, effects: [{ type: "save" }] }
        : { state, effects: [] };

    // Our own write reached disk: buffer and disk agree again at the acked rev.
    case "autosave.acked":
      return { state: { ...state, dirty: false, baseRev: event.rev }, effects: [] };

    // save-before-prompt has already flushed; take the editor soft-lock for the turn.
    case "prompt.dispatch":
      return { state: { ...state, locked: true }, effects: [{ type: "lock" }] };

    case "agent.turn.end":
      return { state: { ...state, locked: false }, effects: [{ type: "unlock" }] };

    // A file-watcher event. baseRev always advances to the newly-seen disk rev.
    case "disk.changed": {
      const baseRev = event.rev;

      // Agent/self write during a locked turn: adopt disk and let the caller merge in
      // any human keystrokes typed after the last autosave. Not a conflict.
      if (state.locked && (event.origin === "agent" || event.origin === "self")) {
        return { state: { ...state, baseRev }, effects: [{ type: "reloadFromDisk", rev: baseRev }] };
      }

      // No unsaved edits: whatever the origin, the disk is authoritative, so reload.
      if (!state.dirty) {
        return {
          state: { ...state, baseRev, dirty: false, conflict: false },
          effects: [{ type: "reloadFromDisk", rev: baseRev }],
        };
      }

      // Unsaved edits + a change we didn't just make (external, or a stray concurrent
      // writer outside a turn): never blind-overwrite the buffer. Flag the conflict
      // and surface the reload banner; the human resolves via reload.confirm.
      return {
        state: { ...state, baseRev, conflict: true },
        effects: [{ type: "showReloadBanner" }],
      };
    }

    // Human accepted the banner: reload the last-known disk rev, dropping local edits.
    case "reload.confirm":
      return {
        state: { ...state, dirty: false, conflict: false },
        effects: [{ type: "reloadFromDisk", rev: state.baseRev }],
      };
  }
}
