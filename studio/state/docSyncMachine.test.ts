import { describe, expect, it } from "vitest";
import type { DocRev } from "../shared/types";
import { initialSyncState, transition } from "./docSyncMachine";
import type { SyncEffect, SyncState } from "./docSyncMachine";

const rev = (n: number): DocRev => ({ n, hash: `h${n}` });
const effectTypes = (effects: SyncEffect[]): SyncEffect["type"][] => effects.map((e) => e.type);

describe("initialSyncState", () => {
  it("starts unlocked, clean, and conflict-free at the given base rev", () => {
    expect(initialSyncState(rev(1))).toEqual({
      locked: false,
      dirty: false,
      baseRev: rev(1),
      conflict: false,
    });
  });
});

describe("transition — editing & autosave", () => {
  const base = initialSyncState(rev(1));

  it("marks the buffer dirty on edit with no effect", () => {
    const { state, effects } = transition(base, { type: "edit" });
    expect(state.dirty).toBe(true);
    expect(effects).toEqual([]);
  });

  it("saves on autosave.request only when dirty, unlocked, and conflict-free", () => {
    const dirty = { ...base, dirty: true };
    expect(effectTypes(transition(dirty, { type: "autosave.request" }).effects)).toEqual(["save"]);

    expect(transition(base, { type: "autosave.request" }).effects).toEqual([]); // clean
    expect(transition({ ...dirty, locked: true }, { type: "autosave.request" }).effects).toEqual([]);
    expect(transition({ ...dirty, conflict: true }, { type: "autosave.request" }).effects).toEqual([]);
  });

  it("clears dirty and advances baseRev on autosave.acked", () => {
    const dirty = { ...base, dirty: true };
    const { state, effects } = transition(dirty, { type: "autosave.acked", rev: rev(2) });
    expect(state.dirty).toBe(false);
    expect(state.baseRev).toEqual(rev(2));
    expect(effects).toEqual([]);
  });
});

describe("transition — agent turn lock", () => {
  const base = initialSyncState(rev(1));

  it("locks on prompt.dispatch", () => {
    const { state, effects } = transition(base, { type: "prompt.dispatch" });
    expect(state.locked).toBe(true);
    expect(effects).toEqual([{ type: "lock" }]);
  });

  it("unlocks on agent.turn.end", () => {
    const { state, effects } = transition({ ...base, locked: true }, { type: "agent.turn.end" });
    expect(state.locked).toBe(false);
    expect(effects).toEqual([{ type: "unlock" }]);
  });
});

describe("transition — disk changes", () => {
  const base = initialSyncState(rev(1));

  it("reloads a clean buffer on any external change", () => {
    const { state, effects } = transition(base, { type: "disk.changed", origin: "external", rev: rev(2) });
    expect(state.baseRev).toEqual(rev(2));
    expect(state.dirty).toBe(false);
    expect(state.conflict).toBe(false);
    expect(effects).toEqual([{ type: "reloadFromDisk", rev: rev(2) }]);
  });

  it("NEVER blind-reloads an external change while dirty — banners + flags conflict", () => {
    const dirty = { ...base, dirty: true };
    const { state, effects } = transition(dirty, { type: "disk.changed", origin: "external", rev: rev(2) });
    expect(state.conflict).toBe(true);
    expect(state.dirty).toBe(true); // author edits retained
    expect(state.baseRev).toEqual(rev(2)); // disk position still tracked
    expect(effectTypes(effects)).toContain("showReloadBanner");
    expect(effectTypes(effects)).not.toContain("reloadFromDisk");
  });

  it("reloads (to merge) an agent/self write landing during a locked turn", () => {
    const lockedDirty = { ...base, locked: true, dirty: true };
    for (const origin of ["agent", "self"] as const) {
      const { state, effects } = transition(lockedDirty, { type: "disk.changed", origin, rev: rev(3) });
      expect(effects).toEqual([{ type: "reloadFromDisk", rev: rev(3) }]);
      expect(state.baseRev).toEqual(rev(3));
      expect(state.conflict).toBe(false); // an agent write is a merge, not a conflict
    }
  });

  it("conservatively banners a dirty buffer for a stray writer outside a locked turn", () => {
    const dirty = { ...base, dirty: true };
    const { state, effects } = transition(dirty, { type: "disk.changed", origin: "agent", rev: rev(2) });
    expect(state.conflict).toBe(true);
    expect(effectTypes(effects)).toContain("showReloadBanner");
    expect(effectTypes(effects)).not.toContain("reloadFromDisk");
  });

  it("adopts disk on reload.confirm, dropping local edits", () => {
    const conflicted: SyncState = { ...base, dirty: true, conflict: true, baseRev: rev(5) };
    const { state, effects } = transition(conflicted, { type: "reload.confirm" });
    expect(state.dirty).toBe(false);
    expect(state.conflict).toBe(false);
    expect(effects).toEqual([{ type: "reloadFromDisk", rev: rev(5) }]);
  });
});

describe("transition — invariant: no lost author edits", () => {
  it("an external change while dirty never yields reloadFromDisk without a banner", () => {
    // Exhaustively vary the other state dimensions; dirty is pinned true.
    for (const locked of [true, false]) {
      for (const conflict of [true, false]) {
        const state: SyncState = { locked, dirty: true, conflict, baseRev: rev(1) };
        const { effects } = transition(state, { type: "disk.changed", origin: "external", rev: rev(2) });
        expect(effectTypes(effects)).not.toContain("reloadFromDisk");
        expect(effectTypes(effects)).toContain("showReloadBanner");
      }
    }
  });
});
