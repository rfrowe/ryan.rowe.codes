---
name: blog-authoring
description: >
  Conventions for authoring and editing posts on this Astro + MDX blog
  (ryan.rowe.codes): required frontmatter, file layout for simple vs.
  folder posts, figure and interactive-widget recipes, styling tokens, and
  the mutation path to use when editing through the local authoring studio.
  Use whenever creating a new post, editing an existing post's content or
  components, adding a figure, or adding an interactive island to a post.
metadata:
  type: reference
---

# Blog authoring

This is a personal portfolio/blog: Astro + TypeScript, content authored in
MDX. The author writes the prose. Your job is components, figures, research,
and mechanical edits — never rewrite the author's voice or reorder/reformat
prose that wasn't part of the requested change. Preserve everything else in a
file byte-for-byte.

## Mutation path

If a studio `apply_edit` tool (or equivalent sanctioned mutation tool) is
available in this session, use it to write changes to post files instead of
freeform file writes — it's the sanctioned path and enforces the checks
(stale-revision detection, path allowlisting) that keep concurrent edits and
out-of-scope writes from corrupting a post. Fall back to direct file edits
only when no such tool is present.

## Frontmatter contract

Every post is a `.mdx` file validated by a Zod schema
(`src/content.config.ts`). Exactly four keys, always present, always valid:

```yaml
---
title: "Aligning a Skyline"
slug: aligning-a-skyline
created_at: "2026-07-10T12:00:00.000-07:00"
headline: A skyline that follows the sun
---
```

- `title` — page/post title.
- `slug` + `created_at` — together derive the URL `/blog/<YYYY-MM-DD>/<slug>`.
  The date is the **author-local day** written in `created_at` (its leading
  `YYYY-MM-DD`, honoring the offset — the day you were experiencing, not a
  UTC-normalized day), parsed once by `parsePostDate` in `src/lib/blog.ts`.
  `created_at` must be **quoted** and ISO 8601: quoting keeps Astro's YAML
  parser from coercing it to an offset-less `Date` and dropping the timezone.
  It must be **timezone-unambiguous**: a date-only `YYYY-MM-DD` or a datetime
  that carries `Z`/an explicit offset (e.g. `"2026-07-10T12:00:00-07:00"`).
  Never a bare timezone-less time like `2026-07-10T12:00:00` — the studio
  rejects it, and unquoted or offset-less values break the build.
- `headline` — feeds the animated typist on the home page; keep it short.

Never drop or rename these keys, and never touch frontmatter you weren't
asked to change.

## File conventions

Two shapes, both under `src/content/blog/`:

- **Simple post**: a single file, `YYYY-MM-DD_slug.mdx`.
- **Post with co-located components**: a folder `YYYY-MM-DD_slug/post.mdx`
  plus sibling `.tsx`/`.css.ts` files (and any static assets) imported into
  the MDX by relative path, e.g. `import CubeCard from './cubeCard'`.

New-file HMR in the dev server is flaky — prefer scaffolding a post (or its
sibling files) first, then editing content into it, rather than expecting a
freshly created file to hot-reload immediately.

## Figures

**Static figure** (a rendered image, not something that needs to react to
data or theme):
1. Render/export the image offline and commit a `.webp` next to `post.mdx`
   (see `src/content/blog/2026-07-10_aligning-a-skyline/` for the pattern:
   `anchor-tool.webp`, `blend-homography.webp`, etc.).
2. Embed it as `![alt text](./file.webp)` immediately followed by an
   *italic* caption line on the next line, e.g.:

   ```md
   ![The anchor tool: two source panels with numbered markers...](./anchor-tool.webp)
   *Click a marker, then click inside its 5x loupe...*
   ```

   Write real alt text describing the image content, not the caption
   repeated.

**Interactive figure** (needs client-side state, canvas, or hydration):
co-located `.tsx` + `.css.ts` island, same folder-post pattern as
`cubeCard.tsx` / `cubeCard.css.ts` / `cubeRenderer.tsx` in
`src/content/blog/2017-01-01_algorithmic-art/`.

- Import with a relative path and no extension: `import CubeCard from './cubeCard'`.
- Pass data via **props**, not children — e.g.
  `<CodeBlock language='markdown' source={props.source} client:load />`
  (`src/content/blog/2022-03-12_hello-world.mdx`).
- Hydration directive:
  - `client:load` when the component can render on the server and just
    needs to hydrate (e.g. `CodeBlock`).
  - `client:only="react"` when the component touches `window`/canvas at
    *import* time and would crash Astro's Node-based static build if
    imported eagerly — e.g. `<CubeCard client:only="react" />`, because the
    cube renderer pulls in `p5`. Anything using `@p5-wrapper/react`, direct
    DOM/canvas APIs at module scope, or `document`/`window` at import time
    needs this.

## Math and code

- Inline/block math is KaTeX via `remark-math`/`rehype-katex`: `$...$` for
  inline, `$$...$$` (with `\begin{align*}...\end{align*}` for multi-line) for
  display math. See `src/content/blog/2022-03-11_algorithmic-art/post.mdx`
  and `.../2026-07-10_aligning-a-skyline/post.mdx` for real usage.
- Fenced code blocks (` ```python `, ` ```tsx `, etc.) are highlighted at
  build time by `astro-expressive-code` — just use ordinary fenced blocks
  with a language tag. Only use the client-rendered `CodeBlock` island
  (passed `source` as a prop) when the raw source must survive verbatim in
  the static output, as in the `hello-world` post.

## Styling co-located components

Component styles are vanilla-extract `.css.ts` files sitting next to the
`.tsx` they style (e.g. `cubeCard.css.ts` next to `cubeCard.tsx`):

- Pull design tokens from `@styles/theme.css.ts` (`vars.palette.primary.main`,
  `vars.palette.text.secondary`, etc.) rather than hardcoding colors, so
  light/dark mode is automatic.
- Use the non-serializable helpers from `@styles/theme-utils` for anything
  that isn't a plain value — vanilla-extract requires every `.css.ts` export
  to be a plain value, so breakpoint/spacing/transition logic lives there
  instead of in `theme.css.ts`:
  - `spacing(...)` — multiples of the 8px spacing unit (numbers), or
    passthrough strings (`'auto'`, `'2em'`).
  - `mediaUp(bp)` / `mediaDown(bp)` / `mediaBetween(start, end)` — media
    queries keyed on the breakpoint tokens (`sm`/`md`/`lg`/`xl`).
  - `transition(props, { duration, easing })`.
- If a component needs to know the current theme in JS (not just CSS), use
  the `useThemeMode()` hook (`src/lib/useThemeMode.ts`) — it stays in sync
  with `<html data-theme>` across islands via a `MutationObserver`, which
  matters for `client:only` islands that render before hydration state is
  otherwise available.

## What not to do

- Don't add "Claude"/"Anthropic"/AI-attribution text, comments, or credits
  to post content or components.
- Don't reformat, reorder, or "clean up" prose outside the specific change
  requested — the author's voice and phrasing are the point.
- Don't invent frontmatter keys or drop the required four.
- Don't reach for `client:only="react"` by default — only when the
  component genuinely touches `window`/canvas/DOM at import time; prefer
  `client:load` otherwise so the component still server-renders.
