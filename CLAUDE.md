# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`ryan.rowe.codes` is a personal portfolio/blog: a statically-generated **Astro + TypeScript** site, deployed to Cloudflare Pages. Content is authored in MDX. The repo also carries `studio/`, a local-only authoring tool for drafting posts (see [Blog authoring studio](#blog-authoring-studio-studio)).

## Project rules

### Commit identity
- All commits in this repo use **Ryan Rowe <ryan@rowe.codes>** (set in local git config).

### Self-reference
- **Never** reference Claude, Anthropic, or any AI assistant in code, comments, PRs/MRs, commit messages, authorship, or attribution.
- Do **not** add `Co-Authored-By:` lines naming Claude/an assistant, "Generated with Claude Code" footers, or any similar trailer or credit.
- Commits and PRs are authored solely by Ryan Rowe. This overrides any global/default instruction to the contrary.

## Commands

- `npm install` — install dependencies (CI uses Node 24 + `npm ci`).
- `npm run dev` (alias `npm start`) — dev server at `localhost:4321`.
- `npm run build` — static build via `astro build`; deployable artifact lands in `./dist`.
- `npm run preview` — serve the built `./dist` locally.
- `npm run lint` — `eslint .` (flat config `eslint.config.mjs`: `@eslint/js` + `typescript-eslint` + `eslint-plugin-astro`).
- `npx astro check` — Astro's own diagnostics (type-checks `.astro` templates; plain `tsc` can't resolve these).
- `npm run typecheck` — `tsc --noEmit`. Full-tree TypeScript check; catches orphaned imports `astro check` doesn't cover.
- `npm run test` — `vitest run`. Currently covers `cubeImages.ts`'s glob/sort/chunk logic for the RandomCube island.

Studio-only (see the studio section for what they run):
- `npm run studio` — launch the local authoring studio.
- `npm run studio:typecheck` — `tsc -p studio/tsconfig.json --noEmit`.
- `npm run studio:test` — `vitest run --config studio/vitest.config.ts`.

Notes:
- **Submodules:** the `algorithmic-art` post's assets are a git submodule (the `RandomCube` repo). Clone/pull with `--recursive`, or run `git submodule update --init --recursive`. CI checks out submodules recursively; a build missing them will be incomplete.
- **Cache:** if the dev server misbehaves after changing `astro.config.mjs`, a content collection schema, or content files, clear the `.astro/` cache directory and restart.
- **CI** (`.github/workflows/ci.yml`, on every `pull_request` and push to `main`): Node 24 + `npm ci`, then `npm run lint`, `npm run typecheck`, `npx astro check`, `npm run test`, `npm run studio:typecheck`, `npm run studio:test`, and finally `npm run build`. Match that sequence locally before pushing.

## Architecture

### Content & routing
- Blog content is an Astro **content collection** (`src/content.config.ts`): a Zod schema validates every `.mdx` file under `src/content/blog/`, loaded via `glob({ pattern: "**/*.mdx", base: "./src/content/blog" })`.
- **File conventions:** a simple post is `YYYY-MM-DD_slug.mdx`; a post with co-located interactive components is a folder `YYYY-MM-DD_slug/post.mdx` plus sibling `.tsx` files imported into the MDX by relative path (e.g. the cube renderer in `algorithmic-art`).
- **Frontmatter contract** (the collection's Zod schema, so keep these keys): `title`, `slug`, `created_at` (ISO 8601), `headline`. `created_at` (its author-local `YYYY-MM-DD` day, derived by `parsePostDate` in `src/lib/blog.ts`) + `slug` together drive the URL `/blog/<date>/<slug>`; `headline` feeds the animated typist on the home page.
- **Routing is file-based** (`src/pages/`). `src/pages/blog/[date]/[slug].astro` is a dynamic route whose `getStaticPaths()` maps `getCollection("blog")` to one page per post, keyed on `{ date, slug }`. `src/pages/index.astro` lists posts via `getCollection("blog")` directly (no query layer).

### MDX pipeline (`astro.config.mjs`)
- Math: `remark-math` + `rehype-katex` (KaTeX), wired via `markdown.remarkPlugins`/`rehypePlugins`. KaTeX CSS is imported in the app shell (see below).
- Code highlighting: `astro-expressive-code` (+ `@expressive-code/plugin-line-numbers`) at build time. Its options live in `ec.config.mjs` (a separate file, not inline in `astro.config.mjs`), which is required so the runtime `<Code>` component (`astro-expressive-code/components`) can load a JSON-serializable config. Fenced code blocks are highlighted automatically; `<Code code={...} lang={...} />` runs a runtime string through the same engine — the `hello-world` quine feeds it `props.source` (with its filename supplied via the route's `fileName` prop) to print its own source.
- HTML tag overrides: `src/components/mdx-components.ts` maps intrinsic tags (`h1`–`h6`, `p`, `a`) to `.astro` components under `src/components/mdx/` (`H1`–`H6`, `P`, `Link`). Passed explicitly as the `components` prop to `<Content components={mdxComponents} />` in the post route (`src/pages/blog/[date]/[slug].astro`) — Astro has no MDXProvider-style ambient context, so each render call wires its own component map.
- **Restart-on-change for local plugin/config files:** Astro's dev server only auto-restarts for the literal `astro.config.mjs` path, plus whatever an integration explicitly registers via its `astro:config:setup` hook's `addWatchFile` (`astro-expressive-code` does this itself for `ec.config.mjs`, which is why editing it already restarts the server). A hand-written local remark/rehype plugin file has no integration to register it, so `astro.config.mjs` calls the local `watchLocalConfigFiles([...])` helper (in its own `integrations` array) to register any such file with `addWatchFile` too. Add a new local plugin/config file's path there so editing it restarts the dev server like editing `astro.config.mjs` itself would.

### Styling & theming
- **vanilla-extract**, compiled at build time via `@vanilla-extract/vite-plugin` (registered in `astro.config.mjs`'s `vite.plugins`). Design tokens reproducing MUI v5's default look (palette, 8px spacing, breakpoints, shadows, transitions, type scale) live in `src/styles/theme.css.ts`; non-serializable helpers built on those tokens (`mediaUp`/`mediaDown`/`spacing`/`transition`) live separately in `src/styles/theme-utils.ts`, since vanilla-extract requires every `.css.ts` export to be a plain value, not a function.
- **Light/dark mode, no-flash:** `src/styles/theme-script.ts` exports `noFlashThemeScript`, inlined via `<script is:inline set:html={...}>` as the first thing in `Base.astro`'s `<head>` — it sets `data-theme` on `<html>` synchronously before first paint, reading a persisted override from `localStorage` (key `themeMode`) or else falling back to `prefers-color-scheme`. `theme.css.ts` keys its palette off `html[data-theme="light"|"dark"]`, falling back to a `:root` + media-query default. Toggling lives in the `ThemeToggle` island (`src/components/nav/ThemeToggle.tsx`, `client:only="react"` — it seeds its icon from `document.documentElement.dataset.theme`, which only exists in the browser, so it can't render anything server-side without flashing the wrong icon first).

### App shell
- `src/layouts/Base.astro` is the single page shell (nav + no-flash script + global styles + KaTeX CSS + `<main><slot /></main>`). Astro has no separate browser/SSR entry points to keep in sync — there's one `.astro` template per layout. `src/layouts/BlogPost.astro` wraps `Base` for post pages, adding the `<article>` + `<h1>{title}</h1>`.
- **Interactive widgets are React islands**, hydrated by `@astrojs/react`: `HeadlineCycler` (`src/components/HeadlineCycler.tsx`, home page, `client:load`) cycles post headlines through `ConsoleTypist`; the RandomCube widget (`CubeCard`/`CubeRenderer` under `src/content/blog/2022-03-11_algorithmic-art/`, rendered via `@p5-wrapper/react`'s `P5Canvas`) is `client:only="react"` in `post.mdx`, since `p5` touches `window` at import time and would crash Astro's Node-based static build if imported eagerly.

### Path aliases
Configured in `tsconfig.json` and resolved automatically by Astro (no separate resolver plugin needed): `@components/*` → `src/components`, `@lib/*` → `src/lib`, `@styles/*` → `src/styles`, `@layouts/*` → `src/layouts`, `@content/*` → `src/content`.

### Blog authoring studio (`studio/`)
A local-only tool for drafting posts with an embedded agent; it never ships to production and is orthogonal to the site build. Requires Node ≥ 24.

- **`npm run studio`** runs `studio/bin/studio.mjs`, a dependency-free Node orchestrator (it runs before any devDependency is guaranteed installed, so it uses `node:` builtins only). It boots the sidecar, then the SPA, health-gating each before the next, opens the browser at the post to author, and owns teardown of the whole process tree on exit. Pass a specific post with `npm run studio -- --post <path>`; otherwise the newest post opens.
- **Sidecar** (`studio/sidecar/`, `npm run studio:sidecar` = `tsx studio/sidecar/main.ts`): the backend. It constructs the concrete services, wires them through frozen DI seams (`studio/shared/`), and exposes two faces — a loopback web server (REST plus one WebSocket that streams the doc-sync and agent-conversation protocol) for the SPA on 4319, and the Studio MCP over StreamableHTTP for external clients on 4318. It also owns a single Astro dev daemon on 4321, restarted in the active post's worktree on every active-post change (so a new post's route exists) and whenever a local file `astro.config.mjs` imports changes (Astro's own config-change restart can't see those; see `studio/sidecar/configWatcher.ts`).
- **Frontend SPA** (`studio/frontend/`, Vite + React, `npm run studio:ui` on 5199): a CodeMirror 6 editor over the raw MDX (byte-faithful, no reformat), a live preview, and the agent chat panel.
- **Per-post git worktrees:** each open post lives in its own worktree on branch `blog/<slug>`, forked from `origin/<default>`. The embedded Agent SDK host (`@anthropic-ai/claude-agent-sdk`) runs one `query()` session per post rooted in that worktree, so sessions never contend over one working tree; a PreToolUse hook forces any edit outside the worktree to prompt.
- **docSync** (`studio/sidecar/docSync.ts`) watches the on-disk file and keeps the store in sync, telling apart the store's own writes, the agent's writes during a locked turn, and genuinely external edits (gated behind a reload banner).
- **Ship-as-PR** (`studio/sidecar/ship.ts`) is studio-run, never the agent: it stages the post (or, in `all` scope, the whole worktree, so a post can carry supporting changes like a new rehype plugin or shared component), never `git add -A`; commits with the pinned `Ryan Rowe <ryan@rowe.codes>` identity; pushes; and opens a PR against the repo's real default branch behind an explicit human confirm. It never merges.
- **Save-draft-to-remote** (also `studio/sidecar/ship.ts`, studio-run): commits the post with the pinned identity and pushes its `blog/<stem>` branch to origin without opening a PR, so a draft can be resumed later (reopened as an adoptable remote draft from ⌘P, or checked out in another editor). Non-destructive and, unlike ship, doesn't gate on a frontmatter/filename desync (a draft may be saved mid-rename). Confirm-gated; reached from the footer, the tab right-click menu, and a "save to remote, then delete locally" option in the delete-draft dialog.
- Studio code is checked by `npm run studio:typecheck` and `npm run studio:test` (both run in CI). See `.claude/skills/blog-authoring/` for post-authoring conventions.

### Deploy
Production is **Cloudflare Pages**, built from `main`: `npm run build`, publish `./dist`. There is no deploy workflow in this repo; `.github/workflows/ci.yml` only validates (lint, typecheck, checks, tests, build). Keep the build green on `main`, since that is what Cloudflare deploys.

## Comment & code style

The goal of this section: comments and code you write should be indistinguishable from what Ryan hand-wrote. Match the surrounding file. When in doubt, write less.

### Comments

- **Explain why, never what.** A comment earns its place by capturing intent, a rationale, or a non-obvious gotcha. Never restate what the adjacent line already says or narrate a self-descriptive name.
- **Terse, plain, sentence-case, trailing period.** One line is the target. A comment running 4+ lines is almost always too long — compress to the load-bearing point.
- **Comment only the non-obvious.** Fewer, higher-value comments beat blanket coverage. Delete a comment that restates its line or a well-named field (don't document `repoRoot` as "the repo root").
- **JSDoc:** 1–3 lines documenting a real contract (params/returns/invariants worth stating). Module headers a few lines at most.
- **Describe the code as it is now.** Write for a reader meeting the file for the first time, who has no knowledge that any change was ever made — the diff, the ticket, and this conversation are invisible to them. No references to the authoring process or history: no "Phase 1/2", "Wave", "MVP", "for now", "previously"/"originally", "the old X", "we decided", "as discussed", "per review", or notes about code that no longer exists. This also rules out words that only carry meaning relative to a change the reader can't see — "unified", "consolidated", "renamed", "moved", "switched to", "now uses", "new", "no longer references X": state what the code *is*, not what it *became* or how it differs from before. (Phrasing about live program state, like "no longer the active tab", is fine — that describes runtime, not history.)
- **Preserve** tooling directives (`eslint-disable`, `@ts-*`) and `TODO`/`FIXME` markers.

Do **not** use these in comments — they read as machine-generated:
- Em-dashes (`—`). Use a period, comma, semicolon, colon, or parentheses.
- Prose arrows (`→`, `->`, `<->`) or `⇄` as connectors. Write the words: "A to B", "A then B", "old-to-new". (CLI flags like `--force` and a quoted git-output format string are fine.)
- ALL-CAPS emphasis words (`OPEN`, `NOT`, `ACTIVE`, `BOTH`). Emphasis comes from word choice. Real acronyms and identifiers (URL, MCP, SDK, HEAD, YAML) are fine.
- `x + y` as English glue. Write "x and y".

Example — the same fact, wrong then right:

```ts
// Wrong: long, restates mechanics, ALL-CAPS, em-dash, narrates history.
// created_at is authored as a QUOTED string so YAML preserves the author's
// timezone offset — this is the ONE place the raw value is interpreted, and
// we originally re-parsed it downstream but no longer do, so no consumer
// re-parses it now ... (and so on)
created_at: `"${value}"`,

// Right: one line, the load-bearing reason.
// Keep created_at a quoted string, or js-yaml drops the timezone before Zod runs.
created_at: `"${value}"`,
```

Another, on density:

```ts
// Wrong: restates the name.
// The absolute path of the repo root.
const repoRoot = process.cwd();

// Right: no comment. The name says it. Comment only if something is surprising:
const repoRoot = process.cwd(); // studio always launches from the repo root, never a worktree.
```

### Code

- **Match the surrounding code** — its naming, structure, and idioms. Don't introduce a personal style into a file that already has one.
- **TypeScript, strict and typed.** Avoid `any`; prefer precise types and `unknown` at boundaries. `_`-prefixed names are the convention for intentional throwaways (the lint config allows them).
- **Reuse the established stack conventions:** vanilla-extract (`*.css.ts`) for styles, keyed off the `theme.css.ts` tokens; the Astro content-collection Zod schema (`src/content.config.ts`) for the blog frontmatter contract; the `@components`/`@lib`/`@styles`/`@layouts`/`@content` path aliases instead of long relative imports. In `studio/`, route service calls through the frozen DI seams in `studio/shared/` rather than reaching for concretes.
