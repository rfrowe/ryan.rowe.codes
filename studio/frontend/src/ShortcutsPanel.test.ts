import { describe, expect, it } from "vitest";

import type { Command } from "./keymap";
import { commandEnabled } from "./ShortcutsPanel";

function cmd(overrides: Partial<Command> = {}): Command {
  return { id: "test.cmd", chord: null, label: "Test", group: "Test", run: () => {}, ...overrides };
}

describe("commandEnabled", () => {
  it("defaults to enabled when when() is absent", () => {
    expect(commandEnabled(cmd())).toBe(true);
  });

  it("is enabled when when() returns true", () => {
    expect(commandEnabled(cmd({ when: () => true }))).toBe(true);
  });

  it("is disabled when when() returns false", () => {
    expect(commandEnabled(cmd({ when: () => false }))).toBe(false);
  });
});
