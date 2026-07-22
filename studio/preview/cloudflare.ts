// Cloudflare Pages preview-URL prediction. A pushed branch deploys to a per-branch alias whose
// subdomain Cloudflare derives deterministically from the branch name, so a PR can deep-link the
// post at its own preview build without waiting on the deploy or any API. Pure.

/** Cloudflare's branch-alias subdomain length cap. */
export const BRANCH_ALIAS_MAX = 28;

/**
 * The alias subdomain Cloudflare Pages assigns a git branch, or null if the branch normalizes to
 * nothing (never for `blog/…`; defensive). Replicates Cloudflare's rule exactly: lowercase, every
 * non-alphanumeric except a hyphen to a hyphen (consecutive hyphens are kept, not collapsed), trim
 * leading/trailing hyphens, then truncate to 28. Truncation is the norm here (`blog-<date>-` alone
 * spends 16 chars) and only shortens the subdomain: the post path is appended whole, and the alias
 * tracks the branch's latest full-site deploy, which still serves the post at that path.
 */
export function branchAlias(branch: string): string | null {
  const normalized = branch
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized === "" ? null : normalized.slice(0, BRANCH_ALIAS_MAX);
}

/** The origin a branch's preview deploys to (`https://<alias>.<project>.pages.dev`), or null when
 *  the branch has no derivable alias. `project` is the Cloudflare Pages project name. */
export function cloudflarePreviewOrigin(branch: string, project: string): string | null {
  const alias = branchAlias(branch);
  return alias ? `https://${alias}.${project}.pages.dev` : null;
}
