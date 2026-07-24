import { describe, expect, it } from "vitest";

import { isDuplicateExternalRev, isLatestRevertScopeRequest } from "./App";

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

describe("isDuplicateExternalRev", () => {
  it("is a duplicate when the rev is not strictly newer and the hash matches", () => {
    expect(isDuplicateExternalRev({ n: 2, hash: "abc" }, { n: 2, hash: "abc" })).toBe(true);
    expect(isDuplicateExternalRev({ n: 1, hash: "abc" }, { n: 2, hash: "abc" })).toBe(true);
  });

  it("is not a duplicate when the rev is strictly newer, even with the same hash", () => {
    expect(isDuplicateExternalRev({ n: 3, hash: "abc" }, { n: 2, hash: "abc" })).toBe(false);
  });

  it("is not a duplicate when the hash differs, even if the rev is lower or equal", () => {
    // A sidecar restart followed by a reconnect can resend a lower rev whose content genuinely
    // changed, since the rev counter resets but the file on disk doesn't roll back.
    expect(isDuplicateExternalRev({ n: 1, hash: "def" }, { n: 2, hash: "abc" })).toBe(false);
    expect(isDuplicateExternalRev({ n: 2, hash: "def" }, { n: 2, hash: "abc" })).toBe(false);
  });
});
