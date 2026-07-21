import { describe, expect, it } from "vitest";
import { formatDisplayDate, parsePostDate, postHref, resolvePostBySlug } from "./blog";

describe("formatDisplayDate", () => {
  it("renders the author-local day as a long-form date", () => {
    expect(formatDisplayDate(parsePostDate("2022-03-12T02:51:10.000-08:00"))).toBe("March 12, 2022");
    expect(formatDisplayDate(parsePostDate("2017-01-01"))).toBe("January 1, 2017");
  });

  it("drops the leading zero on single-digit days", () => {
    expect(formatDisplayDate(parsePostDate("2026-07-05"))).toBe("July 5, 2026");
  });

  it("reads the day off the string, so an offset can't shift it a day", () => {
    // Late-evening author-local time with a negative offset: the UTC instant is the next
    // calendar day, but the displayed date must stay the author's day.
    expect(formatDisplayDate(parsePostDate("2022-03-12T23:30:00-08:00"))).toBe("March 12, 2022");
  });
});

describe("postHref", () => {
  it("builds the dated URL from the post's author-local day and slug", () => {
    const post = { data: { created_at: parsePostDate("2022-03-12T02:51:10.000-08:00"), slug: "hello-world" } };
    expect(postHref(post)).toBe("/blog/2022-03-12/hello-world");
  });
});

describe("resolvePostBySlug", () => {
  const posts = [{ data: { slug: "hello-world" } }, { data: { slug: "algorithmic-art" } }];

  it("returns the one post carrying the slug", () => {
    expect(resolvePostBySlug(posts, "algorithmic-art")).toBe(posts[1]);
  });

  it("throws when no post matches, so a broken link fails the build", () => {
    expect(() => resolvePostBySlug(posts, "does-not-exist")).toThrow(/matches no post/);
  });

  it("throws when the slug is ambiguous", () => {
    const dupes = [{ data: { slug: "twin" } }, { data: { slug: "twin" } }];
    expect(() => resolvePostBySlug(dupes, "twin")).toThrow(/matches 2 posts/);
  });
});
