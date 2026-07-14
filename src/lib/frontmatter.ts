/**
 * Shared frontmatter contract for blog posts.
 *
 * Single source of truth for the required frontmatter keys, consumed by both the
 * Astro content collection schema (`src/content.config.ts`) and the authoring
 * studio's preview-URL derivation (`studio/preview/deriveUrl.ts`) so the two cannot
 * drift. Deliberately free of any `astro:content` import so non-Astro tooling (the
 * studio sidecar, run under `tsx`) can import it directly.
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
