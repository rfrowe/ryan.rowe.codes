import { afterEach, describe, expect, it } from "vitest";
import { chordFor, keymap, type Command } from "./keymap";

function cmd(overrides: Partial<Command> = {}): Command {
  return { id: "test.cmd", chord: "mod+shift+f", label: "Test", group: "Test", run: () => {}, ...overrides };
}

/** A fake KeyboardEvent: the vitest run targets "node" (no DOM), so `handle()` gets a plain object
 *  matching the shape it actually reads, with a real preventDefault/defaultPrevented pair. */
function keyEvent(key: string, mods: { meta?: boolean; ctrl?: boolean; shift?: boolean; alt?: boolean } = {}): KeyboardEvent {
  let prevented = false;
  return {
    key,
    metaKey: !!mods.meta,
    ctrlKey: !!mods.ctrl,
    shiftKey: !!mods.shift,
    altKey: !!mods.alt,
    get defaultPrevented() {
      return prevented;
    },
    preventDefault() {
      prevented = true;
    },
  } as unknown as KeyboardEvent;
}

// keymap is a module-level singleton; every test cleans up its own registrations so state never
// leaks between tests.
const cleanups: Array<() => void> = [];
function registered(c: Command): Command {
  cleanups.push(keymap.register(c));
  return c;
}
afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

describe("chordFor", () => {
  it("normalizes Cmd to mod on macOS", () => {
    expect(chordFor(keyEvent("f", { meta: true }), true)).toBe("mod+f");
  });

  it("normalizes Ctrl to mod off macOS", () => {
    expect(chordFor(keyEvent("f", { ctrl: true }), false)).toBe("mod+f");
  });

  it("ignores the platform's non-mod modifier key", () => {
    expect(chordFor(keyEvent("f", { ctrl: true }), true)).toBe("f");
    expect(chordFor(keyEvent("f", { meta: true }), false)).toBe("f");
  });

  it("matches the produced character for the shortcuts-panel chord", () => {
    expect(chordFor(keyEvent("?", { meta: true, shift: true }), true)).toBe("mod+shift+?");
  });
});

describe("keymap.register/list/subscribe", () => {
  it("lists a registered command and drops it once unregistered", () => {
    const unregister = keymap.register(cmd({ id: "a" }));
    expect(keymap.list().some((c) => c.id === "a")).toBe(true);
    unregister();
    expect(keymap.list().some((c) => c.id === "a")).toBe(false);
  });

  it("notifies subscribers on register and on unregister", () => {
    let notifications = 0;
    const unsubscribe = keymap.subscribe(() => {
      notifications += 1;
    });
    const unregister = keymap.register(cmd({ id: "b" }));
    expect(notifications).toBe(1);
    unregister();
    expect(notifications).toBe(2);
    unsubscribe();
  });

  it("throws registering a chord already held by another live command", () => {
    registered(cmd({ id: "a", chord: "mod+shift+f" }));
    expect(() => keymap.register(cmd({ id: "b", chord: "mod+shift+f" }))).toThrow(/mod\+shift\+f/);
  });

  it("re-registering the same id under a new chord is not a collision", () => {
    const unregister = keymap.register(cmd({ id: "a", chord: "mod+shift+f" }));
    unregister();
    expect(() => registered(cmd({ id: "a", chord: "mod+shift+g" }))).not.toThrow();
  });
});

describe("keymap.handle", () => {
  it("dispatches the matching command and reports it as owned", () => {
    let ran = false;
    registered(cmd({ id: "a", chord: "mod+shift+f", run: () => (ran = true) }));
    // Both mod keys set: handle() resolves "mod" via this runner's own platform, whichever it is.
    const e = keyEvent("f", { meta: true, ctrl: true, shift: true });
    expect(keymap.handle(e)).toBe(true);
    expect(ran).toBe(true);
    expect(e.defaultPrevented).toBe(true);
  });

  it("passes an unregistered chord through untouched (CodeMirror's own ⌘F, browser ⌘R/⌘T/⌘W/⌘N)", () => {
    const e = keyEvent("f", { meta: true });
    expect(keymap.handle(e)).toBe(false);
    expect(e.defaultPrevented).toBe(false);
  });

  it("does not re-dispatch an event something upstream already handled", () => {
    // Mirrors CodeMirror's own Mod-k binding, or App.tsx's existing ⌘P listener, having already
    // called preventDefault before this event reaches the registry's own window listener.
    let ran = false;
    registered(cmd({ id: "agent.directive", chord: "mod+k", run: () => (ran = true) }));
    const e = keyEvent("k", { meta: true });
    e.preventDefault();
    expect(keymap.handle(e)).toBe(false);
    expect(ran).toBe(false);
  });

  it("re-evaluates when() at dispatch time rather than caching it at registration", () => {
    let enabled = false;
    let ran = false;
    registered(cmd({ id: "a", chord: "mod+shift+f", when: () => enabled, run: () => (ran = true) }));
    const first = keyEvent("f", { meta: true, ctrl: true, shift: true });
    expect(keymap.handle(first)).toBe(false);
    expect(ran).toBe(false);

    enabled = true;
    const second = keyEvent("f", { meta: true, ctrl: true, shift: true });
    expect(keymap.handle(second)).toBe(true);
    expect(ran).toBe(true);
  });
});
