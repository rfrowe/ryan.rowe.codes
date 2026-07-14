/**
 * Parsing of a post's `created_at`: the one place the raw string is interpreted, so no consumer
 * re-parses it. The content schema runs it in a `.transform` and the studio's live preview runs the
 * same function, so the built site and the studio can't disagree. Kept a quoted string so YAML
 * preserves the author's timezone offset (js-yaml would coerce an unquoted value to an offset-less
 * `Date` before Zod runs).
 */

/** A parsed `created_at`: the author-local day, plus the absolute instant it names. */
export interface PostDate {
  raw: string;
  /** The author-local day `YYYY-MM-DD`, read straight off the string (no UTC round-trip), so it's
   *  the same in the studio's zone and the UTC build. The post's URL/date segment. */
  day: string;
  /** The absolute instant the value names (offset applied); for sorting and `<time>`. */
  instant: Date;
}

/** Parse a `created_at` string into a {@link PostDate}. Assumes it passed the `createdAtError` shape rule. */
export function parsePostDate(createdAt: string): PostDate {
  const raw = createdAt.trim();
  return { raw, day: raw.slice(0, 10), instant: new Date(raw) };
}
