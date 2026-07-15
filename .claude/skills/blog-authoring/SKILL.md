---
name: blog-authoring
description: >
  Conventions for authoring and editing posts on this Astro + MDX blog
  (ryan.rowe.codes): the Studio MCP toolkit and how a post is edited, required
  frontmatter, file vs. folder posts, inline MDX components vs. co-located
  islands, co-located vs. reusable (@components) components, figure and
  interactive-widget recipes, Expressive Code fenced-block meta strings, and
  styling tokens. Use whenever creating a new post, editing an existing post's
  content or components, adding a figure or code block, or adding an
  interactive island.
metadata:
  type: reference
---

# Blog authoring

A personal portfolio/blog: Astro + TypeScript, content authored in MDX. The
author writes the prose. Your job is components, figures, research, and
mechanical edits — never rewrite the author's voice, and never reorder or
reformat prose that wasn't part of the requested change. Preserve everything
else in a file byte-for-byte.

## How you're running

You are almost always attached through the local authoring **studio**, which
opens one post at a time. That post is checked out in its **own git worktree**,
and that worktree is your working directory. Edit the post's file (and its
sibling components) there **directly with the native tools** — `Read`, `Edit`,
`Write`. There is no `apply_edit` or write-document MCP tool: the worktree *is*
the isolation, so no mutation gate is needed. A PreToolUse hook makes any edit
whose path escapes the worktree prompt the human, so keep edits inside it.

Resolve "here" / "this" / "the title" against the editor state before editing,
and don't reformat lines you weren't asked to touch.

### The Studio MCP toolkit (`mcp__studio__*`)

Six tools, all auto-approved (they never prompt):

- **`describe`** — a briefing: what the blog is, the authoring conventions (this
  skill), the path of the post currently open, and a *live* app-structure digest
  scanned at call time (framework and key versions, tsconfig path aliases, the
  reusable-component inventory with client-island annotations, and the
  styling/util entry points). **Call this first** if you're unsure of the repo
  layout — trust its digest over any hardcoded list here, since it can't drift.
- **`list_posts`** — every post under the content tree as `{ path, title, url }`.
- **`scaffold_post`** — the create path for a **new** post. Give it valid
  frontmatter (`title`, `slug`, `headline`, `created_at`); it writes
  `src/content/blog/<YYYY-MM-DD>_<slug>.mdx` into a fresh worktree, makes it the
  active post, and returns `{ ok, path, url }`. Start a post this way, then edit
  the file. Don't hand-create the file for a brand-new post.
- **`get_editor_context`** — the live editor state `{ path, cursor, selection,
  viewport }` (UTF-16 offsets). Use it to turn a deictic reference into a
  concrete region before editing.
- **`preview_status`** — `{ valid: true, url }` when the frontmatter parses, else
  `{ valid: false, errors }`. Check it after touching frontmatter.
- **`open_pr`** — asks the **studio** (never you) to run the git/gh ship flow.
  Human-gated: it refuses unless `confirm: true`, which is only set after a human
  has reviewed the diff. Commit and PR text are human-authored.

### Shipping and drafts (studio-run, human-gated)

You edit files; you don't run git. Two flows the studio owns:

- **Ship as PR** stages only the post, commits under the pinned
  `Ryan Rowe <ryan@rowe.codes>` identity, pushes, and opens a PR. It never
  merges, and it's gated on a human confirm.
- **Save draft to remote** commits and pushes the post's `blog/<slug>` branch
  **without** a PR, so a draft can be resumed later — reopened from the studio's
  post picker as an adoptable remote draft, or checked out elsewhere.

Both are reached from the studio UI, not from a tool you call. Your part ends at
the file edits (and, at most, proposing an `open_pr` once a human has reviewed).

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
  The date is the **author-local day** in `created_at` (its leading `YYYY-MM-DD`,
  honoring the offset — the day the author was experiencing, not a UTC-normalized
  day), parsed once by `parsePostDate` in `src/lib/blog.ts`. `created_at` must be
  **quoted** and ISO 8601: quoting stops Astro's YAML parser from coercing it to
  an offset-less `Date` and dropping the timezone. It must be
  **timezone-unambiguous** — a date-only `YYYY-MM-DD`, or a datetime carrying `Z`
  or an explicit offset (e.g. `"2026-07-10T12:00:00-07:00"`). Never a bare
  offset-less time like `2026-07-10T12:00:00`: the studio rejects it and the
  build breaks.
- `headline` — feeds the animated typist on the home page; keep it short.

Never drop or rename these keys, and never touch frontmatter you weren't asked
to change. Confirm validity with `preview_status`.

## File posts vs. folder posts

Two shapes, both under `src/content/blog/`:

- **File post** — a single `YYYY-MM-DD_slug.mdx`. Holds prose, math, fenced code,
  and *inline* MDX components (below). It has no siblings, so it can't carry a
  separate `.tsx`, `.css.ts`, test, or committed asset.
- **Folder post** — `YYYY-MM-DD_slug/post.mdx` plus sibling files imported by
  relative path. Use it the moment you need a co-located island, its `.css.ts`,
  a test, or a committed image. `2017-01-01_algorithmic-art/` is the reference:
  `post.mdx` beside `cubeCard.tsx`, `cubeCard.css.ts`, `cubeRenderer.tsx`, and an
  `assets/` submodule.

The decision is purely "does this post need a sibling file?" A file post can grow
an inline component without becoming a folder; it only converts when a real
sibling appears. The studio keeps the editor in sync across a file↔folder flip,
so renaming the shape is safe — but for a brand-new post, prefer `scaffold_post`
and let the studio own the layout.

New-file HMR in the dev server is flaky: prefer scaffolding a post (or writing a
sibling file) first, then editing content into it, rather than expecting a
freshly created file to hot-reload immediately.

## Components: inline, co-located, or reusable

Three homes, in order of reach:

- **Inline in the MDX** — a top-level `export const Box = (props) => <div .../>`
  (or a plain `const`) declared in the post body. Right for a small, *static*,
  one-off presentational bit used by this post only. It renders as server HTML;
  it **cannot** be an interactive island (islands must be importable modules), so
  no `client:*` on an inline-defined component. Needs no sibling file, so it
  keeps a file post a file post.
- **Co-located in the folder post** — a sibling `.tsx` (with an optional
  `.css.ts`) imported by relative path with no extension, e.g.
  `import CubeCard from './cubeCard'`. Right for a post-specific widget that
  needs hydration, its own styles, or tests. Files here are camelCase
  (`cubeCard.tsx`), matching their post.
- **Reusable under `src/components`** (the `@components/*` alias) — PascalCase
  (`HeadlineCycler.tsx`, `ConsoleTypist.tsx`, `ThemeToggle.tsx`), used by pages,
  layouts, or more than one post. Promote something here only when a second
  consumer actually appears or it's genuinely site-wide. Don't pull a one-off
  into `@components`, and don't leave post-specific widgets there. `describe`
  returns the current `@components` inventory.

### Hydration directives (for imported islands)

- `client:load` — the component renders on the server and just needs to hydrate.
  Prefer this so the island still server-renders.
- `client:only="react"` — only when the component touches `window`/canvas/DOM at
  *import* time and would crash Astro's Node static build if imported eagerly
  (e.g. anything pulling in `p5` / `@p5-wrapper/react`). `algorithmic-art` uses
  `<CubeCard client:only="react" />` for exactly this reason.

Pass data via **props, not children**: Astro pre-renders an island's children to
opaque HTML, so raw data passed as children arrives escaped.

## Figures

**Static figure** (a rendered image that doesn't react to data or theme):

1. Render/export the image offline and commit a `.webp` next to `post.mdx`
   (folder post).
2. Embed it as an image followed immediately by an *italic* caption line:

   ```md
   ![The anchor tool: two source panels with numbered markers…](./anchor-tool.webp)
   *Click a marker, then click inside its 5x loupe to place it precisely.*
   ```

   Write real alt text describing the image content, not the caption repeated.

**Interactive figure** (client-side state, canvas, or hydration): a co-located
`.tsx` (+ `.css.ts`) island, the same folder-post pattern as `cubeCard.tsx` /
`cubeCard.css.ts` / `cubeRenderer.tsx` in `2017-01-01_algorithmic-art/`.

## Math and code

- **Math** is KaTeX via `remark-math` / `rehype-katex`: `$…$` inline, `$$…$$`
  for display (use `\begin{align*}…\end{align*}` inside for multi-line). See
  `2017-01-01_algorithmic-art/post.mdx` for real display math.
- **Fenced code blocks** (` ```python `, ` ```tsx `, …) are highlighted at build
  time by `astro-expressive-code`. Tag the language, then add features in the
  **meta string** after it:
  - `title="server.ts"` — a titled frame (a `// filename` first line is also
    auto-detected).
  - `{1,3-5}` — highlight those lines; `ins={2}` / `del={5}` mark inserted /
    deleted lines; `mark`/`ins`/`del` also accept `"text"` or `/regex/` to mark
    matches.
  - `showLineNumbers` (and `startLineNumber=N`) — from the line-numbers plugin;
    numbers are off unless asked for.
  - `frame="none"|"terminal"`, `collapse={2-8}`, `wrap` — frame style,
    collapsible ranges, soft-wrap.

  Themes track the site's `data-theme` (the header light/dark toggle), not
  `prefers-color-scheme` — wired in `ec.config.mjs`, so blocks follow the page.
- To highlight a **runtime string** instead of a literal fence, use the same
  engine's component: `import { Code } from 'astro-expressive-code/components'`,
  then `<Code code={someString} lang="mdx" meta={…} />`. The `code` must be a
  string prop; `<Code>` rejects children. The `hello-world` post feeds it
  `props.source` with `meta={`title="${props.fileName}"`}` to print its own
  source under its filename.

## Styling co-located components

Component styles are vanilla-extract `.css.ts` files beside the `.tsx` they style
(e.g. `cubeCard.css.ts` next to `cubeCard.tsx`):

- Pull design tokens from `@styles/theme.css.ts` (`vars.palette.primary.main`,
  `vars.palette.text.secondary`, …) rather than hardcoding colors, so light/dark
  mode is automatic.
- Use the non-serializable helpers from `@styles/theme-utils` for anything that
  isn't a plain value (vanilla-extract requires every `.css.ts` export to be a
  plain value, so this logic lives there, not in `theme.css.ts`):
  - `spacing(…)` — multiples of the 8px unit (numbers), or passthrough strings
    (`'auto'`, `'2em'`).
  - `mediaUp(bp)` / `mediaDown(bp)` / `mediaBetween(start, end)` — media queries
    keyed on the breakpoint tokens (`sm`/`md`/`lg`/`xl`).
  - `transition(props, { duration, easing })`.
- If a component needs the current theme in JS (not just CSS), use
  `useThemeMode()` (`src/lib/useThemeMode.ts`): it tracks `<html data-theme>`
  across islands via a `MutationObserver`, which matters for `client:only`
  islands that render before hydration state is otherwise available.

## What not to do

- Don't add "Claude"/"Anthropic"/AI-attribution text, comments, or credits to
  post content or components.
- Don't reformat, reorder, or "clean up" prose outside the specific change
  requested — the author's voice and phrasing are the point.
- Don't invent frontmatter keys or drop the required four.
- Don't reach for `client:only="react"` by default — only when the component
  genuinely touches `window`/canvas/DOM at import time; otherwise `client:load`
  so it still server-renders.
- Don't run git, push, or open PRs yourself. Shipping and draft-saving are
  studio-run and human-gated.
