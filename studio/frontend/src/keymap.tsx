// Central registry for every app-level keyboard shortcut. Components declare a binding via
// useCommand instead of hand-rolling their own keydown effect; <KeymapProvider> installs the one
// window listener that dispatches into whichever registered command matches. Client-only: nothing
// here touches the wire.

import { useEffect, type ReactNode } from "react";

export type Chord = string; // normalized, e.g. "mod+shift+f", "mod+shift+?", "mod+k".

export interface Command {
  id: string; // stable, e.g. "git.fetch", "help.shortcuts".
  chord: Chord | null; // null lists the command in the panel without a binding.
  label: string;
  group: string; // panel section: "Git", "Navigation", "Agent", "Editor".
  when?: () => boolean; // live enablement predicate; default always-on.
  run: () => void;
  hidden?: boolean; // registered but omitted from the panel (rare).
}

export interface Keymap {
  register(cmd: Command): () => void;
  list(): Command[];
  subscribe(cb: () => void): () => void;
  handle(e: KeyboardEvent): boolean;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

/** Normalizes a keydown to the same shape a Command declares: "mod" is Cmd on macOS, Ctrl
 *  elsewhere, so a binding never hardcodes one platform. "?" matches the produced character
 *  rather than a hardcoded physical key, so a non-US layout (where "/" isn't under shift) still
 *  resolves it. `mac` defaults to the detected platform; a test passes it explicitly to exercise
 *  both branches regardless of the runner's own platform. */
export function chordFor(e: KeyboardEvent, mac: boolean = isMac): Chord {
  const parts: string[] = [];
  if (mac ? e.metaKey : e.ctrlKey) parts.push("mod");
  if (e.shiftKey) parts.push("shift");
  if (e.altKey) parts.push("alt");
  parts.push(e.key === "?" ? "?" : e.key.toLowerCase());
  return parts.join("+");
}

function createKeymap(): Keymap {
  const commands = new Map<string, Command>();
  const listeners = new Set<() => void>();
  // Cached, only rebuilt on an actual register/unregister: useSyncExternalStore requires
  // getSnapshot to return the same reference when nothing changed, or it re-renders forever.
  let snapshot: Command[] = [];

  function notify(): void {
    snapshot = [...commands.values()];
    for (const l of listeners) l();
  }

  return {
    register(cmd) {
      if (cmd.chord && import.meta.env.DEV) {
        const collision = [...commands.values()].find((c) => c.id !== cmd.id && c.chord === cmd.chord);
        if (collision) {
          throw new Error(`keymap: chord "${cmd.chord}" is already registered to "${collision.id}" (registering "${cmd.id}")`);
        }
      }
      commands.set(cmd.id, cmd);
      notify();
      return () => {
        commands.delete(cmd.id);
        notify();
      };
    },
    list() {
      return snapshot;
    },
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    handle(e) {
      // Something upstream (CodeMirror's own keymap, an existing hand-rolled listener) already
      // handled this event; don't double-fire a command that's registered here purely for the
      // panel's sake (nav.palette, agent.directive) while its real key handling stays put.
      if (e.defaultPrevented) return false;
      const chord = chordFor(e);
      const cmd = [...commands.values()].find((c) => c.chord === chord);
      if (!cmd || cmd.when?.() === false) return false;
      e.preventDefault();
      cmd.run();
      return true;
    },
  };
}

export const keymap: Keymap = createKeymap();

/** Installs the single window keydown listener every registered command dispatches through. An
 *  unregistered chord (CodeMirror's own ⌘F, the browser's ⌘R/⌘T/⌘W/⌘N) is never looked up, so it
 *  passes through untouched. */
export function KeymapProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      keymap.handle(e);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  return <>{children}</>;
}
