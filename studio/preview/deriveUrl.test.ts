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

  it("reports a malformed created_at date", () => {
    const result = deriveUrl(post({ ...complete, created_at: "not-a-date" }));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors).toContain("invalid created_at date: not-a-date");
  });
});

describe("deriveUrl — created_at matches the Astro route", () => {
  // The built route derives its date from the same frontmatter via a two-stage parse:
  // Astro's content loader runs js-yaml, then `z.coerce.date()` (i.e. `new Date`) coerces
  // the result, and formatPostDate slices `toISOString()` in UTC. The two parsers only
  // disagree for a timezone-less datetime, and there quoting decides which one wins:
  //   - Unquoted: js-yaml produces a Date read as UTC.
  //   - Quoted:   js-yaml produces a string, so z.coerce.date does `new Date(str)`, read as local.
  // deriveUrl must reproduce both, so each case below pins the expected date to what the
  // js-yaml to z.coerce.date to formatPostDate pipeline yields.
  //
  // We pin a non-UTC zone so the near-midnight cases would fail if deriveUrl ever parsed
  // the wrong way, and so the quoted/unquoted pair lands on different days, even on a
  // UTC CI runner.
  const originalTz = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = "America/Chicago"; // CDT (UTC-5) in July
  });
  afterAll(() => {
    process.env.TZ = originalTz;
  });

  it("parses a date-only value as UTC midnight (quoting is irrelevant)", () => {
    // `2026-07-10` is UTC midnight under both js-yaml and `new Date`, quoted or not, so 2026-07-10.
    const result = deriveUrl(post({ ...complete, created_at: "2026-07-10" }));
    expect(result).toMatchObject({ valid: true, date: "2026-07-10" });
  });

  it("parses an UNQUOTED timezone-less datetime as UTC (js-yaml), not local time", () => {
    // Unquoted `2026-07-10T22:00:00`: js-yaml reads it as 22:00 UTC, so the route slices to 2026-07-10.
    // A naive local parse in CDT would roll it forward to 2026-07-11, the drift this prevents.
    const result = deriveUrl(post({ ...complete, created_at: "2026-07-10T22:00:00" }));
    expect(result).toMatchObject({ valid: true, date: "2026-07-10" });
    expect(result.valid && result.url.includes("/blog/2026-07-10/")).toBe(true);
  });

  it("parses a QUOTED timezone-less datetime as LOCAL, differing from the unquoted form", () => {
    // Quoted `"2026-07-10T22:00:00"` reaches z.coerce.date as a plain string, so `new Date`
    // reads it in CDT = 2026-07-11 03:00 UTC, so the route slices to 2026-07-11. This is the edge
    // a blanket force-to-UTC would get wrong (it would produce 2026-07-10, a day early vs the route).
    const quoted = deriveUrl(post({ ...complete, created_at: '"2026-07-10T22:00:00"' }));
    expect(quoted).toMatchObject({ valid: true, date: "2026-07-11" });
    expect(quoted.valid && quoted.url.includes("/blog/2026-07-11/")).toBe(true);

    // Same instant, opposite quoting, different day. Pins the quoted/unquoted divergence.
    const unquoted = deriveUrl(post({ ...complete, created_at: "2026-07-10T22:00:00" }));
    expect(unquoted.valid && unquoted.date).toBe("2026-07-10");
    expect(quoted.valid && quoted.date).not.toBe(unquoted.valid && unquoted.date);
  });

  it("honors an explicit timezone offset (same instant as the route either way)", () => {
    // 22:00 at -05:00 is 2026-07-11 03:00 UTC; the route slices that to 2026-07-11, and so
    // must deriveUrl. Both js-yaml and `new Date` respect an explicit offset identically.
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
