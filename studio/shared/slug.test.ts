// The pure slug/stem helpers shared by the store, the MCP tools, and the browser SPA.

import { describe, expect, it } from "vitest";

import { kebabSlug, postStem, slugFromPath, stemParts } from "./slug";

describe("kebabSlug", () => {
  it("lowercases, drops quotes, and hyphenates runs of non-alphanumerics", () => {
    expect(kebabSlug("Aligning a Skyline")).toBe("aligning-a-skyline");
    expect(kebabSlug("It's a “Quoted” Title!")).toBe("its-a-quoted-title");
  });

  it("trims leading/trailing hyphens", () => {
    expect(kebabSlug("  --Hello, World--  ")).toBe("hello-world");
    expect(kebabSlug("...")).toBe("");
  });
});

describe("postStem", () => {
  it("returns the date-qualified filename stem of a simple post", () => {
    expect(postStem("/repo/src/content/blog/2026-07-10_aligning-a-skyline.mdx")).toBe(
      "2026-07-10_aligning-a-skyline",
    );
  });

  it("returns the folder name of a folder post", () => {
    expect(postStem("/repo/src/content/blog/2026-07-10_aligning-a-skyline/post.mdx")).toBe(
      "2026-07-10_aligning-a-skyline",
    );
  });

  it("falls back to the bare basename with no date prefix", () => {
    expect(postStem("/x/y/hello.mdx")).toBe("hello");
  });
});

describe("slugFromPath", () => {
  it("strips the date prefix from a simple post", () => {
    expect(slugFromPath("/repo/src/content/blog/2026-07-10_aligning-a-skyline.mdx")).toBe(
      "aligning-a-skyline",
    );
  });

  it("strips the date prefix from a folder post", () => {
    expect(slugFromPath("/repo/src/content/blog/2022-03-11_algorithmic-art/post.mdx")).toBe(
      "algorithmic-art",
    );
  });

  it("is the whole stem when there is no date prefix", () => {
    expect(slugFromPath("/x/y/hello.mdx")).toBe("hello");
  });
});

describe("stemParts", () => {
  it("splits a date-qualified stem into datePrefix (with separator) and slug", () => {
    expect(stemParts("2026-07-10_aligning-a-skyline")).toEqual({
      datePrefix: "2026-07-10_",
      slug: "aligning-a-skyline",
    });
  });

  it("has an empty datePrefix when there is no date", () => {
    expect(stemParts("hello")).toEqual({ datePrefix: "", slug: "hello" });
  });

  it("round-trips: datePrefix + slug reconstructs the stem", () => {
    for (const stem of ["2026-07-10_aligning-a-skyline", "hello", "2022-03-11_algorithmic-art"]) {
      const { datePrefix, slug } = stemParts(stem);
      expect(datePrefix + slug).toBe(stem);
    }
  });
});
