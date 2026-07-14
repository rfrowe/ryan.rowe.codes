import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { FRONTMATTER_FIELDS, createdAtError } from "@lib/frontmatter";
import { parsePostDate } from "@lib/blog";

// Keep created_at a quoted string, or js-yaml coerces an unquoted value to an offset-less `Date`
// before Zod runs and the timezone is lost. `createdAtError` enforces the shape; `parsePostDate`
// reads the author-local day off the string.
const createdAtSchema = z
  .string({ error: "created_at must be a quoted string so its timezone offset survives YAML parsing" })
  .refine((v) => createdAtError(v) === null, {
    message: "created_at must be a date (YYYY-MM-DD) or a datetime carrying a timezone (Z or ±HH:MM)",
  })
  .transform((v) => parsePostDate(v));

// Build the collection schema from the shared FRONTMATTER_FIELDS spec (@lib/frontmatter), so the
// schema's keys can't drift from it. Every field is a plain string except `created_at`, which
// transforms via `parsePostDate`. The output type is cast from the same spec so `entry.data` stays
// precisely typed (created_at: PostDate, the rest string); a bare z.object would widen it.
type BlogData = {
  [Field in (typeof FRONTMATTER_FIELDS)[number] as Field["name"]]: Field["zodType"] extends "date"
    ? ReturnType<typeof parsePostDate>
    : string;
};

const blogSchema = z.object(
  Object.fromEntries(FRONTMATTER_FIELDS.map((field) => [field.name, field.zodType === "date" ? createdAtSchema : z.string()])),
) as unknown as ReturnType<typeof z.custom<BlogData>>;

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: blogSchema,
});

export const collections = { blog };
