import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DEFAULT_PREVIEW_BASE, deriveUrl } from "./deriveUrl";

/** Build an MDX source with the given frontmatter keys (in insertion order). */
function post(fm: Record<string, string>, body = "The body."): string {
  const lines = Object.entries(fm).map(([k, v]) => `${k}: ${v}`);
  return ["---", ...lines, "---", "", body].join("\n");
}

const complete = {
  title: "Aligning a Skyline",
  slug: "aligning-a-skyline",
  headline: "On least-squares and rooftops",
  created_at: "2026-07-10",
};

describe("deriveUrl — happy path", () => {
  it("derives the route from frontmatter using the default base", () => {
    const result = deriveUrl(post(complete));
    expect(result).toEqual({
      valid: true,
      url: `${DEFAULT_PREVIEW_BASE}/blog/2026-07-10/aligning-a-skyline`,
      date: "2026-07-10",
      slug: "aligning-a-skyline",
    });
  });

  it("preserves a hyphenated slug verbatim", () => {
    const result = deriveUrl(post({ ...complete, slug: "a-long-multi-hyphen-slug" }));
    expect(result.valid && result.url.endsWith("/a-long-multi-hyphen-slug")).toBe(true);
  });

  it("honors a custom base and trims a trailing slash", () => {
    const result = deriveUrl(post(complete), { base: "http://127.0.0.1:9999/" });
    expect(result).toMatchObject({ valid: true, url: "http://127.0.0.1:9999/blog/2026-07-10/aligning-a-skyline" });
  });

  it("strips surrounding quotes from values", () => {
    const result = deriveUrl(post({ ...complete, title: '"Quoted Title"', slug: "'quoted-slug'" }));
    expect(result).toMatchObject({ valid: true, slug: "quoted-slug" });
  });
});

describe("deriveUrl — invalid frontmatter", () => {
  it("reports a missing frontmatter block", () => {
    const result = deriveUrl("Just prose, no frontmatter.");
    expect(result).toEqual({ valid: false, url: null, errors: ["missing frontmatter block"] });
  });

  it("reports each missing required key", () => {
    for (const key of Object.keys(complete)) {
      const partial = { ...complete };
      delete (partial as Record<string, string>)[key];
      const result = deriveUrl(post(partial));
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContain(`missing or empty frontmatter key: ${key}`);
      }
    }
  });

  it("reports an empty value as missing", () => {
    const result = deriveUrl(post({ ...complete, slug: '""' }));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors).toContain("missing or empty frontmatter key: slug");
  });

  it("rejects a malformed created_at value", () => {
    const result = deriveUrl(post({ ...complete, created_at: "not-a-date" }));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.some((e) => /not a valid date/.test(e))).toBe(true);
  });

  it("rejects a slug that isn't a valid stem (so it's preview-invalid, never a false desync)", () => {
    const result = deriveUrl(post({ ...complete, slug: '"Not A Slug"' }));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.some((e) => /invalid slug/.test(e))).toBe(true);
  });
});

describe("deriveUrl — created_at timezone rule", () => {
  // The URL date is the leading `YYYY-MM-DD` read straight off `created_at`, not a UTC-normalized
  // day. We pin a non-UTC zone so any regression to a UTC derivation (which would shift a
  // near-midnight value to the wrong day) fails here, even on a UTC CI runner.
  const originalTz = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = "America/Chicago"; // CDT (UTC-5) in July
  });
  afterAll(() => {
    process.env.TZ = originalTz;
  });

  it("accepts a bare date-only value", () => {
    const result = deriveUrl(post({ ...complete, created_at: "2026-07-10" }));
    expect(result).toMatchObject({ valid: true, date: "2026-07-10" });
  });

  it("rejects an UNQUOTED timezone-less datetime as ambiguous", () => {
    // An unquoted timezone-less datetime resolves to a different day in dev vs. the UTC build, so
    // the studio refuses it.
    const result = deriveUrl(post({ ...complete, created_at: "2026-07-10T22:00:00" }));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.some((e) => /time but no timezone/.test(e))).toBe(true);
  });

  it("rejects a QUOTED timezone-less datetime too (quoting doesn't rescue it)", () => {
    // The rule keys off the value's shape, not its quoting: a bare time is ambiguous either way.
    const result = deriveUrl(post({ ...complete, created_at: '"2026-07-10T22:00:00"' }));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.some((e) => /time but no timezone/.test(e))).toBe(true);
  });

  it("uses the author-local day written in the offset, not the UTC day", () => {
    // Evening of 2026-07-10 in the author's zone (instant 2026-07-11T03:00Z). The URL follows the
    // author's day, 2026-07-10, not the UTC day (2026-07-11).
    const result = deriveUrl(post({ ...complete, created_at: "2026-07-10T22:00:00-05:00" }));
    expect(result).toMatchObject({ valid: true, date: "2026-07-10" });
    expect(result.valid && result.url.includes("/blog/2026-07-10/")).toBe(true);
  });

  it("reads the day off a Z (UTC) value too", () => {
    // The author-local day at offset Z is the leading date, 2026-07-10.
    const result = deriveUrl(post({ ...complete, created_at: "2026-07-10T22:00:00Z" }));
    expect(result).toMatchObject({ valid: true, date: "2026-07-10" });
    expect(result.valid && result.url.includes("/blog/2026-07-10/")).toBe(true);
  });
});
