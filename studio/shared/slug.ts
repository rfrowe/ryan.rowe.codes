// Pure slug/stem helpers shared by the store, the MCP tools, and the browser SPA. No `node:`
// import, so nothing node-only leaks into the browser bundle.

/**
 * A post slug: lowercase alphanumerics and hyphens, starting alphanumeric. Names the URL segment,
 * the filename stem, and the isolation branch, so every derivation holds to this one shape.
 */
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

/** Whether `slug` is a valid post slug (see {@link SLUG_RE}). */
export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

/** Derive a kebab-case slug from free text (title): lowercase, non-alphanumerics to hyphens. */
export function kebabSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The human-facing slug from a post's file path, date prefix stripped. Not unique (two posts on
 * different dates can share it); {@link postStem} is the unique per-post identity.
 */
export function slugFromPath(path: string): string {
  const { slug } = stemParts(postStem(path));
  return slug;
}

/**
 * Canonical post-identity stem from a path: `<YYYY-MM-DD>_<slug>` for a simple post, the folder
 * name for a folder post. Unique per post (same-slug/different-date posts get distinct stems), and
 * both filesystem- and git-ref-safe, so it keys each post's worktree dir and isolation branch.
 */
export function postStem(path: string): string {
  const base = path.replace(/\/post\.mdx$/, "").replace(/\.mdx$/, "");
  return base.split("/").pop() ?? "";
}

/**
 * Split a date-qualified stem into its `datePrefix` (with trailing separator, e.g. `2026-07-10_`)
 * and bare `slug`. With no date prefix, `datePrefix` is empty and `slug` is the whole stem. Lets
 * rename recombine a new date and/or slug without re-deriving the prefix regex inline.
 */
export function stemParts(stem: string): { datePrefix: string; slug: string } {
  const m = /^(\d{4}-\d{2}-\d{2}[_-])(.+)$/.exec(stem);
  return m ? { datePrefix: m[1], slug: m[2] } : { datePrefix: "", slug: stem };
}
