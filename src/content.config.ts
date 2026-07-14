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

// Build the collection schema literally from the shared FRONTMATTER_FIELDS spec (@lib/frontmatter):
// the schema's keys ARE the spec's keys, so they cannot drift — which is why the old runtime drift
// guard is gone. Every field is a plain string except `created_at`, which the schema transforms via
// `parsePostDate`. The output type is derived from the same spec and cast onto the dynamically-built
// schema so `entry.data` stays precisely typed (created_at: PostDate, the rest string) for the pages
// that read it (e.g. `created_at.day`); a bare `z.object(fromEntries(...))` would otherwise widen the
// value type. The cast target is `ReturnType<typeof z.custom<BlogData>>` — a `ZodType<BlogData>`
// obtained via a value handle, since Astro 7's re-exported `z` is not a type namespace.
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
