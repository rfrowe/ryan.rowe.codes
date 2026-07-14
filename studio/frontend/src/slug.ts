// Slug helpers shared by the new-post dialog and the tab rename affordance.

/** Derive a kebab-case slug from free text (title): lowercase, non-alphanumerics to hyphens. */
export function kebabSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The slug of a post from its file path. A simple post is `YYYY-MM-DD_slug.mdx`; a folder
 * post is `.../YYYY-MM-DD_slug/post.mdx`. Strips the date prefix when present.
 */
export function slugFromPath(path: string): string {
  const base = path.replace(/\/post\.mdx$/, "").replace(/\.mdx$/, "");
  const name = base.split("/").pop() ?? "";
  const m = name.match(/^\d{4}-\d{2}-\d{2}[_-](.+)$/);
  return m ? m[1] : name;
}
