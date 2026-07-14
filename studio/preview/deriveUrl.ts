// Preview-URL derivation from an MDX source's frontmatter. Pure.
// Imports the same formatPostDate the Astro route uses, the same required-key contract the content
// collection uses, and the same framework-free frontmatter parser + created_at rule both the
// content schema and the studio share, so the derived URL and validity match the built site exactly
// and cannot drift.

import { formatPostDate } from "../../src/lib/blog";
import {
  REQUIRED_FRONTMATTER_KEYS,
  createdAtError,
  parseFrontmatter,
} from "../../src/lib/frontmatter";

export type DeriveUrlResult =
  | { valid: true; url: string; date: string; slug: string }
  | { valid: false; url: null; errors: string[] };

export const DEFAULT_PREVIEW_BASE = "http://localhost:4321";

/**
 * Parse the leading `---` frontmatter block, validate that all REQUIRED_FRONTMATTER_KEYS are present
 * and non-empty (and that `created_at` is a timezone-unambiguous, parseable date), then derive
 * `${base}/blog/${formatPostDate(<created_at>)}/${slug}`. Any problem yields { valid:false, errors }.
 *
 * created_at determinism: the studio enforces (via `createdAtError`) that `created_at` is either
 * date-only `YYYY-MM-DD` or a datetime carrying `Z`/an explicit offset — never a bare timezone-less
 * datetime, whose date would differ between the studio's local zone and the UTC CI build. With that
 * rule the value resolves to the same instant however Astro parses it (js-yaml → z.coerce.date), so
 * `new Date(<trimmed value>)` reproduces the built route exactly, with no quoted/unquoted branch.
 */
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

  // Only validate the date once the key is present and non-empty (an absent/empty one already
  // reported above). The tz-unambiguity rule is the primary gate; a value that passes it but still
  // can't be parsed (e.g. `2026-13-45`) is caught by the `new Date` NaN check.
  const createdAt = data["created_at"]?.value;
  let createdAtDate: Date | null = null;
  if (createdAt && createdAt.trim() !== "") {
    const ambiguity = createdAtError(createdAt);
    if (ambiguity) {
      errors.push(ambiguity);
    } else {
      const parsed = new Date(createdAt.trim());
      if (Number.isNaN(parsed.getTime())) errors.push(`invalid created_at date: ${createdAt}`);
      else createdAtDate = parsed;
    }
  }

  if (errors.length > 0 || createdAtDate === null) {
    return { valid: false, url: null, errors };
  }

  const base = (opts?.base ?? DEFAULT_PREVIEW_BASE).replace(/\/+$/, "");
  const date = formatPostDate(createdAtDate);
  const slug = data["slug"].value;
  return { valid: true, url: `${base}/blog/${date}/${slug}`, date, slug };
}
