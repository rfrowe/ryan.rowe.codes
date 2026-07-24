// Proves both backstop arms log and never do anything else (no exit, no shutdown call): the whole
// point of the "stay up" answer is that neither event needs any recovery action beyond logging,
// since a failed git.git() spawn never leaves shared state half-mutated.

import { describe, expect, it, vi } from "vitest";

import { logUncaughtException, logUnhandledRejection } from "./processGuards";

describe("logUnhandledRejection", () => {
  it("logs the reason and takes no other action", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    logUnhandledRejection(new Error("spawn git ENOENT"));
    expect(errSpy).toHaveBeenCalledTimes(1);
    expect(errSpy.mock.calls[0][0]).toContain("unhandledRejection");
    errSpy.mockRestore();
  });
});

describe("logUncaughtException", () => {
  it("logs the error and takes no other action", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    logUncaughtException(new Error("boom"));
    expect(errSpy).toHaveBeenCalledTimes(1);
    expect(errSpy.mock.calls[0][0]).toContain("uncaughtException");
    errSpy.mockRestore();
  });
});
