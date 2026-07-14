// Preview-URL derivation from an MDX source's frontmatter. Pure.
// Imports the same formatPostDate the Astro route uses, and the same required-key
// contract the content collection uses, so the derived URL and validity match the
// built site exactly and cannot drift.

import { formatPostDate } from "../../src/lib/blog";
import { REQUIRED_FRONTMATTER_KEYS } from "../../src/lib/frontmatter";

export type DeriveUrlResult =
  | { valid: true; url: string; date: string; slug: string }
  | { valid: false; url: null; errors: string[] };

export const DEFAULT_PREVIEW_BASE = "http://localhost:4321";

/** A parsed frontmatter value plus whether it was written in matching quotes. */
interface FrontmatterValue {
  /** The value with a single pair of surrounding quotes removed. */
  value: string;
  /** Whether the raw value was wrapped in a matching pair of quotes. */
  quoted: boolean;
}

/**
 * Parse the leading `---` frontmatter block, validate that all
 * REQUIRED_FRONTMATTER_KEYS are present and non-empty (and `created_at` parses to a
 * valid date), then derive `${base}/blog/${formatPostDate(<created_at>)}/${slug}`.
 * Any problem yields { valid:false, errors }.
 *
 * The Astro route derives its date from the same frontmatter. Astro's content loader
 * parses MDX frontmatter with js-yaml, then `z.coerce.date()` (i.e. `new Date`) runs on
 * the result, so the two parsers disagree for a timezone-less datetime, and only for
 * that case does quoting change the result:
 *   - Unquoted (`2026-07-10T22:00:00`): js-yaml yields a Date read as UTC.
 *   - Quoted   (`"2026-07-10T22:00:00"`): js-yaml yields a plain string, so
 *     `z.coerce.date()` does `new Date(str)`, read as local time.
 * `toDateInput` reproduces this per the value's quoting so the derived date matches the
 * route exactly (see the `created_at matches the Astro route` tests).
 */
/**
 * Parse the leading `---`…`---` block into simple `key: value` pairs. Returns null
 * when there is no well-formed frontmatter block at the top of the source.
 */
function parseFrontmatter(mdxSource: string): Record<string, FrontmatterValue> | null {
  // Tolerate a leading BOM; the block must otherwise start at byte 0.
  const src = mdxSource.charCodeAt(0) === 0xfeff ? mdxSource.slice(1) : mdxSource;
  const block = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(src);
  if (!block) return null;

  const data: Record<string, FrontmatterValue> = {};
  for (const rawLine of block[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const pair = /^([A-Za-z0-9_-]+)[ \t]*:[ \t]*(.*)$/.exec(line);
    if (!pair) continue;
    const [, key, rawValue] = pair;
    data[key] = unquote(rawValue.trim());
  }
  return data;
}

/**
 * Produce the string handed to `new Date` so it resolves `created_at` to the same
 * instant the built route does. Astro parses frontmatter with js-yaml, then
 * `z.coerce.date()` (`new Date`) runs on the result:
 *   - date-only (`YYYY-MM-DD`): UTC midnight under both js-yaml and `new Date`; as-is.
 *   - explicit offset/`Z`: the same instant either way; as-is.
 *   - tz-less datetime, unquoted: js-yaml yields a Date read as UTC, so append `Z` so
 *     `new Date` agrees (it would otherwise read the bare string as local time).
 *   - tz-less datetime, quoted: js-yaml yields a string, so `z.coerce.date()` does
 *     `new Date(str)`, read as local time, so leave as-is so `new Date` matches.
 */
function toDateInput(createdAt: string, quoted: boolean): string {
  const value = createdAt.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const hasTime = /\d{2}:\d{2}/.test(value);
  const hasTimezone = /(?:Z|[+-]\d{2}(?::?\d{2})?)$/.test(value);
  return hasTime && !hasTimezone && !quoted ? `${value}Z` : value;
}

/** Strip a single pair of matching surrounding quotes, reporting whether any were present. */
function unquote(value: string): FrontmatterValue {
  if (value.length >= 2) {
    const first = value[0];
    if ((first === '"' || first === "'") && value[value.length - 1] === first) {
      return { value: value.slice(1, -1), quoted: true };
    }
  }
  return { value, quoted: false };
}

export function deriveUrl(mdxSource: string, opts?: { base?: string }): DeriveUrlResult {
  const data = parseFrontmatter(mdxSource);
  if (data === null) {
    return { valid: false, url: null, errors: ["missing frontmatter block"] };
  }

  const errors: string[] = [];
  for (const key of REQUIRED_FRONTMATTER_KEYS) {
    const entry = data[key];
    if (entry === undefined || entry.value.trim() === "") {
      errors.push(`missing or empty frontmatter key: ${key}`);
    }
  }

  // Only bother validating the date once we know the key is actually present. Parse it
  // the way the Astro route does, which depends on whether it was quoted; see toDateInput.
  const createdAtEntry = data["created_at"];
  const createdAt = createdAtEntry?.value;
  const createdAtDate =
    createdAtEntry && createdAt ? new Date(toDateInput(createdAt, createdAtEntry.quoted)) : null;
  if (createdAt && createdAt.trim() !== "" && (createdAtDate === null || Number.isNaN(createdAtDate.getTime()))) {
    errors.push(`invalid created_at date: ${createdAt}`);
  }

  if (errors.length > 0 || createdAtDate === null) {
    return { valid: false, url: null, errors };
  }

  const base = (opts?.base ?? DEFAULT_PREVIEW_BASE).replace(/\/+$/, "");
  const date = formatPostDate(createdAtDate);
  const slug = data["slug"].value;
  return { valid: true, url: `${base}/blog/${date}/${slug}`, date, slug };
}
