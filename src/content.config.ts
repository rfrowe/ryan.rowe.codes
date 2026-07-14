import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { REQUIRED_FRONTMATTER_KEYS, createdAtError } from "@lib/frontmatter";

const blogSchema = z.object({
  title: z.string(),
  slug: z.string(),
  headline: z.string(),
  // created_at must be timezone-unambiguous so the derived URL/date is the same in the studio's
  // local zone and this UTC build (see `createdAtError`). This backstop only reaches the case Astro
  // itself can see: a *quoted* datetime, which js-yaml hands to Zod as a plain string. An *unquoted*
  // timezone-less datetime is coerced by js-yaml to a `Date` (read as UTC — deterministic) before
  // Zod runs, so it matches the `z.date()` branch and is accepted here; the studio's live gate and
  // the `frontmatter.test.ts` content scan are what enforce the stricter authoring rule on raw text.
  created_at: z
    .union([
      z.date(),
      z.string().refine((v) => createdAtError(v) === null, {
        message: "created_at must be a date (YYYY-MM-DD) or a datetime carrying a timezone (Z or ±HH:MM)",
      }),
    ])
    .pipe(z.coerce.date()),
});

// Drift guard: the schema's keys must match the shared frontmatter contract in
// `@lib/frontmatter` (which the authoring studio also consumes for preview-URL
// derivation). Fails loudly at collection-load time if the two ever diverge.
const schemaKeys = Object.keys(blogSchema.shape).sort();
const contractKeys = [...REQUIRED_FRONTMATTER_KEYS].sort();
if (JSON.stringify(schemaKeys) !== JSON.stringify(contractKeys)) {
  throw new Error(`Frontmatter schema/contract drift: schema=[${schemaKeys}] contract=[${contractKeys}]`);
}

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: blogSchema,
});

export const collections = { blog };
