import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { REQUIRED_FRONTMATTER_KEYS, createdAtError } from "@lib/frontmatter";
import { parsePostDate } from "@lib/blog";

const blogSchema = z.object({
  title: z.string(),
  slug: z.string(),
  headline: z.string(),
  // Keep created_at a quoted string, or js-yaml coerces an unquoted value to an offset-less `Date`
  // before Zod runs and the timezone is lost. `createdAtError` enforces the shape; `parsePostDate`
  // reads the author-local day off the string.
  created_at: z
    .string({ error: "created_at must be a quoted string so its timezone offset survives YAML parsing" })
    .refine((v) => createdAtError(v) === null, {
      message: "created_at must be a date (YYYY-MM-DD) or a datetime carrying a timezone (Z or ±HH:MM)",
    })
    .transform((v) => parsePostDate(v)),
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
