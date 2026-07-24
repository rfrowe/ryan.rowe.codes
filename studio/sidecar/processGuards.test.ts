// Proves the split: an unhandled rejection logs and never reaches shutdown; an uncaught exception
// logs and always tears down through it. Getting these two crossed (or merged back into one
// handler) would either resume after an unsafe synchronous throw or crash the whole session over a
// self-contained rejected spawn -- exactly the two things dgb.14/tjp exist to prevent.

import { describe, expect, it, vi } from "vitest";

import { logUncaughtExceptionAndShutdown, logUnhandledRejection } from "./processGuards";

describe("logUnhandledRejection", () => {
  it("logs the reason and takes no other action", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    logUnhandledRejection(new Error("spawn git ENOENT"));
    expect(errSpy).toHaveBeenCalledTimes(1);
    expect(errSpy.mock.calls[0][0]).toContain("unhandledRejection");
    errSpy.mockRestore();
  });
});

describe("logUncaughtExceptionAndShutdown", () => {
  it("logs the error and tears down through the given shutdown, not a bare exit", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const shutdown = vi.fn(async () => {});
    logUncaughtExceptionAndShutdown(new Error("boom"), shutdown);
    expect(errSpy.mock.calls[0][0]).toContain("uncaughtException");
    expect(shutdown).toHaveBeenCalledTimes(1);
    errSpy.mockRestore();
  });
});
