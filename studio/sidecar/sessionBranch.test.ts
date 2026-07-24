// resolveSessionBranch picks <root> once at startup; a STUDIO_PRIMARY_BRANCH override that
// disagrees with the checked-out branch would otherwise rebase/ship/save-draft against the wrong
// target silently (the zao footgun). Exercised against a fake GitRunner: this is a string decision
// at boot, not git plumbing, so there's no need for a real repo the way gitOps.test.ts needs one.

import { describe, expect, it } from "vitest";

import { assertSessionBranchOverrideMatchesHead, resolveSessionBranch } from "./sessionBranch";
import type { GitRunner } from "../shared/seams";

/** `headBranch: null` simulates a detached HEAD (`rev-parse --abbrev-ref HEAD` prints "HEAD"). */
function fakeGit(headBranch: string | null): GitRunner {
  return {
    git: async (args) => {
      if (args[0] === "rev-parse" && args.includes("--abbrev-ref")) {
        return { stdout: `${headBranch ?? "HEAD"}\n`, stderr: "", code: 0 };
      }
      if (args[0] === "rev-parse" && args.includes("--short")) {
        return { stdout: "abc1234\n", stderr: "", code: 0 };
      }
      throw new Error(`fakeGit: unexpected call ${args.join(" ")}`);
    },
    gh: async () => {
      throw new Error("fakeGit: gh not implemented");
    },
  };
}

describe("resolveSessionBranch", () => {
  it("returns the checked-out branch when there is no override", async () => {
    await expect(resolveSessionBranch(fakeGit("feat/foo"), "/repo")).resolves.toBe("feat/foo");
  });

  it("falls back to the short sha on a detached HEAD with no override", async () => {
    await expect(resolveSessionBranch(fakeGit(null), "/repo")).resolves.toBe("abc1234");
  });

  it("accepts an override that matches the checked-out branch", async () => {
    process.env.STUDIO_PRIMARY_BRANCH = "main";
    try {
      await expect(resolveSessionBranch(fakeGit("main"), "/repo")).resolves.toBe("main");
    } finally {
      delete process.env.STUDIO_PRIMARY_BRANCH;
    }
  });

  it("refuses to start when the override names a branch other than the checked-out HEAD", async () => {
    process.env.STUDIO_PRIMARY_BRANCH = "main";
    try {
      await expect(resolveSessionBranch(fakeGit("fix/palette-git-drafts"), "/repo")).rejects.toThrow(
        /STUDIO_PRIMARY_BRANCH="main".*fix\/palette-git-drafts/s,
      );
    } finally {
      delete process.env.STUDIO_PRIMARY_BRANCH;
    }
  });

  it("lets an override stand on a detached HEAD, which has nothing to mismatch against", async () => {
    process.env.STUDIO_PRIMARY_BRANCH = "main";
    try {
      await expect(resolveSessionBranch(fakeGit(null), "/repo")).resolves.toBe("main");
    } finally {
      delete process.env.STUDIO_PRIMARY_BRANCH;
    }
  });
});

describe("assertSessionBranchOverrideMatchesHead", () => {
  it("is silent when the override matches the checked-out branch", () => {
    expect(() => assertSessionBranchOverrideMatchesHead("main", "main")).not.toThrow();
  });

  it("is silent when there is no checked-out branch to compare against (detached HEAD)", () => {
    expect(() => assertSessionBranchOverrideMatchesHead("main", null)).not.toThrow();
  });

  it("throws naming both branches when they disagree", () => {
    expect(() => assertSessionBranchOverrideMatchesHead("main", "fix/session-branch-guard")).toThrow(
      /STUDIO_PRIMARY_BRANCH="main".*fix\/session-branch-guard/s,
    );
  });
});
