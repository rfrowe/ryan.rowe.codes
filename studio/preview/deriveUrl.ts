// Preview-URL derivation from an MDX source's frontmatter. Pure. Reuses the same parsePostDate,
// required-key contract, and created_at rule as the built route, so the derived URL can't drift
// from the real site.

import { parsePostDate } from "../../src/lib/blog";
import {
  REQUIRED_FRONTMATTER_KEYS,
  createdAtError,
  parseFrontmatter,
} from "../../src/lib/frontmatter";
import { isValidSlug } from "../shared/slug";

export type DeriveUrlResult =
  | { valid: true; url: string; date: string; slug: string }
  | { valid: false; url: null; errors: string[] };

export const DEFAULT_PREVIEW_BASE = "http://localhost:4321";

/**
 * Parse the leading `---` block, require every key present and non-empty (and `created_at` a
 * timezone-unambiguous, parseable date), then derive
 * `${base}/blog/${parsePostDate(<created_at>).day}/${slug}`. The day is read straight off the string,
 * so it matches in the local dev zone and the UTC build. Any problem yields { valid:false, errors }.
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

  // A slug that isn't a valid stem is invalid frontmatter (the slug names the URL, filename, and
  // branch). Only checked once the key is present, since an absent one is already reported above.
  const slugEntry = data["slug"];
  if (slugEntry && slugEntry.value.trim() !== "" && !isValidSlug(slugEntry.value)) {
    errors.push(`invalid slug: ${slugEntry.value} (use lowercase letters, digits, and hyphens)`);
  }

  // Only validate the date once the key is present and non-empty (an absent/empty one already
  // reported above). The tz-unambiguity rule is the primary gate; a value that passes it but still
  // can't be parsed (e.g. `2026-13-45`) is caught by the `new Date` NaN check.
  const createdAtRaw = data["created_at"]?.value;
  let createdAt: string | null = null;
  if (createdAtRaw && createdAtRaw.trim() !== "") {
    const ambiguity = createdAtError(createdAtRaw);
    if (ambiguity) {
      errors.push(ambiguity);
    } else if (Number.isNaN(new Date(createdAtRaw.trim()).getTime())) {
      // Passed the shape rule but isn't a real calendar date; the built route would reject it too.
      errors.push(`invalid created_at date: ${createdAtRaw}`);
    } else {
      createdAt = createdAtRaw.trim();
    }
  }

  if (errors.length > 0 || createdAt === null) {
    return { valid: false, url: null, errors };
  }

  const base = (opts?.base ?? DEFAULT_PREVIEW_BASE).replace(/\/+$/, "");
  const date = parsePostDate(createdAt).day;
  const slug = data["slug"].value;
  return { valid: true, url: `${base}/blog/${date}/${slug}`, date, slug };
}
