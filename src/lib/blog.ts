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

const DISPLAY_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * The author-local day rendered for display, e.g. "March 12, 2022". Formats the `day` string
 * components directly (no `Date` round-trip) so it can't drift a day between the author's zone
 * and the UTC build.
 */
export function formatDisplayDate(date: PostDate): string {
  const [year, month, day] = date.day.split("-");
  return `${DISPLAY_MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
}

/** The dated URL for a post, `/blog/<author-local day>/<slug>`, from its blog collection entry. */
export function postHref(post: { data: { created_at: PostDate; slug: string } }): string {
  return `/blog/${post.data.created_at.day}/${post.data.slug}`;
}

/**
 * The post carrying `slug`, resolved against the collection at build time. Throws unless exactly one
 * matches, so a `<PostLink>` to a missing (or ambiguous) slug fails the build instead of shipping a 404.
 */
export function resolvePostBySlug<T extends { data: { slug: string } }>(posts: readonly T[], slug: string): T {
  const matches = posts.filter((post) => post.data.slug === slug);
  if (matches.length !== 1) {
    throw new Error(`resolvePostBySlug("${slug}"): ${matches.length === 0 ? "matches no post" : `matches ${matches.length} posts`}.`);
  }
  return matches[0];
}
