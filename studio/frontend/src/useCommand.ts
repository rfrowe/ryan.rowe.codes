// Declares a keyboard-shortcut binding as a React effect instead of a hand-rolled keydown
// listener: registers on mount, unregisters on unmount (or when the binding itself changes), so a
// command's lifetime tracks the component that owns it.

import { useEffect, useRef } from "react";
import { keymap, type Command } from "./keymap";

export function useCommand(cmd: Command): void {
  // A caller passes a fresh object literal (and fresh run/when closures) every render, per the
  // registry's own calling convention; this ref always holds the latest one so the registered
  // entry can call through to it without re-registering (and re-notifying every subscriber) on
  // every render.
  const ref = useRef(cmd);
  ref.current = cmd;

  useEffect(
    () =>
      keymap.register({
        id: cmd.id,
        chord: cmd.chord,
        label: cmd.label,
        group: cmd.group,
        hidden: cmd.hidden,
        when: () => ref.current.when?.() ?? true,
        run: () => ref.current.run(),
      }),
    [cmd.id, cmd.chord, cmd.label, cmd.group, cmd.hidden],
  );
}
