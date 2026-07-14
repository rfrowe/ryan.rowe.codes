// Pure, import-free slug/stem helpers shared across the studio: the sidecar store, the MCP tools,
// and the browser SPA (the tab bar, new-post dialog, and command palette). Kept free of any `node:`
// import so nothing node-only leaks into the browser bundle — this is the first runtime *value*
// import from `studio/shared` into the frontend, safe only because the module is pure.

/**
 * A post slug: lowercase letters/digits and hyphens, starting with an alphanumeric. It names the
 * URL segment, the filename stem, and the isolation branch, so the studio holds every derivation to
 * this one shape (preview-URL derivation, rename, and complete-rename all consult it).
 */
export const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

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
 * The human-facing slug of a post from its file path. A simple post is `YYYY-MM-DD_slug.mdx`; a
 * folder post is `.../YYYY-MM-DD_slug/post.mdx`. Strips the date prefix when present. Not unique
 * (two posts on different dates can share it); {@link postStem} is the unique per-post identity.
 */
export function slugFromPath(path: string): string {
  const { slug } = stemParts(postStem(path));
  return slug;
}

/**
 * Canonical post-identity stem from a path: the date-qualified filename stem, `<YYYY-MM-DD>_<slug>`
 * for a simple post, or the folder name for a `.../YYYY-MM-DD_slug/post.mdx` folder post (the bare
 * basename when there is no date prefix). Unlike the date-stripped slug this is unique per post
 * (same-slug/different-date posts get distinct stems), and it is both filesystem-safe (a real path
 * segment) and git-ref-safe, so it keys each post's worktree dir and isolation branch.
 */
export function postStem(path: string): string {
  const base = path.replace(/\/post\.mdx$/, "").replace(/\.mdx$/, "");
  return base.split("/").pop() ?? "";
}

/**
 * Split a date-qualified stem `<YYYY-MM-DD>_<slug>` into its `datePrefix` (including the trailing
 * separator, e.g. `2026-07-10_`) and the bare `slug`. When there is no date prefix, `datePrefix` is
 * empty and `slug` is the whole stem. Lets rename/complete-rename recombine a new date and/or slug
 * without re-deriving the prefix regex inline.
 */
export function stemParts(stem: string): { datePrefix: string; slug: string } {
  const m = /^(\d{4}-\d{2}-\d{2}[_-])(.+)$/.exec(stem);
  return m ? { datePrefix: m[1], slug: m[2] } : { datePrefix: "", slug: stem };
}
