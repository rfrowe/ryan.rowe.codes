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
});

describe("deriveUrl — created_at timezone rule", () => {
  // The built route derives its date from the same frontmatter via a two-stage parse: Astro's
  // content loader runs js-yaml, then `z.coerce.date()` (`new Date`) coerces the result, and
  // formatPostDate slices `toISOString()` in UTC. Those two parsers only disagree for a *timezone-
  // less datetime*, and there quoting used to decide which one won (js-yaml reads it as UTC; a
  // quoted string reaches `new Date` and is read as local). Rather than reproduce that fork, the
  // studio now REJECTS every timezone-less datetime (see `createdAtError`): the only values that
  // reach a URL are date-only or tz-carrying, and those resolve to the same instant however they're
  // parsed, so deriveUrl and the built route can never disagree.
  //
  // We pin a non-UTC zone so a near-midnight accepted case would visibly drift if deriveUrl ever
  // parsed the wrong way — it must not, even on a UTC CI runner.
  const originalTz = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = "America/Chicago"; // CDT (UTC-5) in July
  });
  afterAll(() => {
    process.env.TZ = originalTz;
  });

  it("accepts a date-only value as UTC midnight (quoting is irrelevant)", () => {
    // `2026-07-10` is UTC midnight under both js-yaml and `new Date`, quoted or not, so 2026-07-10.
    const result = deriveUrl(post({ ...complete, created_at: "2026-07-10" }));
    expect(result).toMatchObject({ valid: true, date: "2026-07-10" });
  });

  it("rejects an UNQUOTED timezone-less datetime as ambiguous", () => {
    // Unquoted `2026-07-10T22:00:00` would resolve to a different date in dev (local) vs. the UTC
    // build; the studio refuses it rather than let the URL/filename drift between environments.
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

  it("honors an explicit timezone offset (same instant as the route either way)", () => {
    // 22:00 at -05:00 is 2026-07-11 03:00 UTC; the route slices that to 2026-07-11, and so must
    // deriveUrl. Both js-yaml and `new Date` respect an explicit offset identically.
    const result = deriveUrl(post({ ...complete, created_at: "2026-07-10T22:00:00-05:00" }));
    expect(result).toMatchObject({ valid: true, date: "2026-07-11" });
    expect(result.valid && result.url.includes("/blog/2026-07-11/")).toBe(true);
  });

  it("honors a trailing Z as UTC (same instant as the route either way)", () => {
    // `2026-07-10T22:00:00Z` is 22:00 UTC regardless of quoting or host zone, so 2026-07-10.
    const result = deriveUrl(post({ ...complete, created_at: "2026-07-10T22:00:00Z" }));
    expect(result).toMatchObject({ valid: true, date: "2026-07-10" });
    expect(result.valid && result.url.includes("/blog/2026-07-10/")).toBe(true);
  });
});
