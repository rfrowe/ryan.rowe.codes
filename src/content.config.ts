import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { REQUIRED_FRONTMATTER_KEYS } from "@lib/frontmatter";

const blogSchema = z.object({
  title: z.string(),
  slug: z.string(),
  headline: z.string(),
  created_at: z.coerce.date(),
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
