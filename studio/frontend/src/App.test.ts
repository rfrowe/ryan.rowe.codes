import { describe, expect, it } from "vitest";

import { isLatestRevertScopeRequest } from "./App";

describe("isLatestRevertScopeRequest", () => {
  it("is the latest when its sequence matches the current one", () => {
    expect(isLatestRevertScopeRequest(3, 3)).toBe(true);
  });

  it("is superseded when a later toggle has since bumped the sequence", () => {
    expect(isLatestRevertScopeRequest(1, 2)).toBe(false);
  });

  it("is superseded even if it somehow resolves ahead of the current sequence", () => {
    expect(isLatestRevertScopeRequest(2, 1)).toBe(false);
  });
});
