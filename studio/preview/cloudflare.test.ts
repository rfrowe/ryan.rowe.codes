import { describe, expect, it } from "vitest";

import { branchAlias, cloudflarePreviewOrigin } from "./cloudflare";

describe("branchAlias", () => {
  it("lowercases and turns slashes into hyphens", () => {
    expect(branchAlias("fix/api")).toBe("fix-api");
    expect(branchAlias("fix/ship-diff")).toBe("fix-ship-diff");
  });

  it("keeps a short blog branch intact (under 28 chars)", () => {
    expect(branchAlias("blog/2022-03-12_hello-world")).toBe("blog-2022-03-12-hello-world");
  });

  it("truncates a long blog branch to 28 chars, cutting into the slug", () => {
    expect(branchAlias("blog/2026-07-10_aligning-a-skyline")).toBe("blog-2026-07-10-aligning-a-s");
    expect(branchAlias("blog/2026-07-10_aligning-a-skyline")).toHaveLength(28);
  });

  it("truncates a session-prefixed branch before it reaches the slug", () => {
    expect(branchAlias("feat/ship-pr/blog/2026-07-10_x")).toBe("feat-ship-pr-blog-2026-07-10");
  });

  it("matches Cloudflare's own documented example", () => {
    expect(branchAlias("dependabot/npm_and_yarn/dustjs-linkedin-3.0.0")).toBe("dependabot-npm-and-yarn-dust");
  });

  it("leaves a hyphen left at the 28th char by truncation (trim runs before, not after, the cut)", () => {
    expect(branchAlias("blog/2026-07-10_seattle-a-b-c")).toBe("blog-2026-07-10-seattle-a-b-");
  });

  it("returns null when the branch normalizes to nothing", () => {
    expect(branchAlias("///")).toBeNull();
    expect(branchAlias("")).toBeNull();
  });
});

describe("cloudflarePreviewOrigin", () => {
  it("builds the pages.dev origin from the alias and project", () => {
    expect(cloudflarePreviewOrigin("blog/2022-03-12_hello-world", "ryan-rowe-codes")).toBe(
      "https://blog-2022-03-12-hello-world.ryan-rowe-codes.pages.dev",
    );
  });

  it("is null when the branch has no derivable alias", () => {
    expect(cloudflarePreviewOrigin("///", "ryan-rowe-codes")).toBeNull();
  });
});
