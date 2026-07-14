/**
 * Shared frontmatter contract for blog posts: the required keys plus framework-free
 * parse/validate helpers, used by both the Astro content schema and the studio so the two
 * can't drift. No `astro:content` import, so non-Astro tooling can import it directly.
 */

export const REQUIRED_FRONTMATTER_KEYS = ["title", "slug", "headline", "created_at"] as const;

export type RequiredFrontmatterKey = (typeof REQUIRED_FRONTMATTER_KEYS)[number];

/** Raw (pre-Zod-coercion) frontmatter as authored in an `.mdx` file. */
export interface PostFrontmatter {
  title: string;
  slug: string;
  headline: string;
  /** ISO 8601 date string; Astro coerces this to a `Date` at load time. */
  created_at: string;
}

export interface FrontmatterValue {
  /** Value with a single pair of surrounding quotes stripped. */
  value: string;
  /** Whether the raw value was wrapped in matching quotes. */
  quoted: boolean;
}

/** The leading `---`…`---` block at the top of an MDX source (group 1 is its body). */
export const FRONTMATTER_BLOCK = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
/** A `key: value` line inside the frontmatter block. */
export const FRONTMATTER_LINE = /^([A-Za-z0-9_-]+)[ \t]*:[ \t]*(.*)$/;

/** Strip a single pair of matching surrounding quotes, reporting whether any were present. */
export function unquote(value: string): FrontmatterValue {
  if (value.length >= 2) {
    const first = value[0];
    if ((first === '"' || first === "'") && value[value.length - 1] === first) {
      return { value: value.slice(1, -1), quoted: true };
    }
  }
  return { value, quoted: false };
}

/**
 * Parse the leading `---`…`---` block into `key: value` pairs. Null when there's no well-formed
 * block. A small YAML subset, enough for the flat, string-valued blog frontmatter contract.
 */
export function parseFrontmatter(mdxSource: string): Record<string, FrontmatterValue> | null {
  // Tolerate a leading BOM; the block must otherwise start at byte 0.
  const src = mdxSource.charCodeAt(0) === 0xfeff ? mdxSource.slice(1) : mdxSource;
  const block = FRONTMATTER_BLOCK.exec(src);
  if (!block) return null;

  const data: Record<string, FrontmatterValue> = {};
  for (const rawLine of block[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const pair = FRONTMATTER_LINE.exec(line);
    if (!pair) continue;
    const [, key, rawValue] = pair;
    data[key] = unquote(rawValue.trim());
  }
  return data;
}

/** Best-effort post title from its frontmatter `title` (unquoted); null if absent/empty. */
export function frontmatterTitle(text: string): string | null {
  return parseFrontmatter(text)?.title?.value || null;
}

// created_at must resolve to the same calendar date in dev (local zone) and CI (UTC). A
// timezone-less datetime doesn't, so the URL and derived filename can disagree by a day; only
// a bare date or a datetime carrying its own timezone is allowed.
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /\d{2}:\d{2}/;
const TIMEZONE_RE = /(?:Z|[+-]\d{2}(?::?\d{2})?)$/;

/**
 * Validate a raw `created_at` against the timezone-unambiguity rule: a date-only `YYYY-MM-DD`, or
 * a datetime carrying `Z` / an explicit offset. Returns an error string otherwise, null if fine.
 * Checks format, not calendar validity: `2026-13-45` passes (a separate `new Date` parse catches it).
 */
export function createdAtError(raw: string): string | null {
  const value = raw.trim();
  if (value === "") return "created_at is empty";
  if (DATE_ONLY_RE.test(value)) return null;
  const hasTime = TIME_RE.test(value);
  const hasTimezone = TIMEZONE_RE.test(value);
  if (hasTime && hasTimezone) return null;
  if (hasTime && !hasTimezone) {
    return (
      `created_at "${raw}" has a time but no timezone — its date is ambiguous between the studio's ` +
      `local zone and the UTC build. Use a date-only YYYY-MM-DD, or add a Z (UTC) or an offset like +00:00.`
    );
  }
  return `created_at "${raw}" is not a valid date — use YYYY-MM-DD, or a datetime with a timezone (Z or ±HH:MM).`;
}
