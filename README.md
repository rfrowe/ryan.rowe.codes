# ryan.rowe.codes

[![CI](https://github.com/rfrowe/ryan.rowe.codes/actions/workflows/ci.yml/badge.svg)](https://github.com/rfrowe/ryan.rowe.codes/actions/workflows/ci.yml)
[![Integration](https://github.com/rfrowe/ryan.rowe.codes/actions/workflows/integration.yml/badge.svg)](https://github.com/rfrowe/ryan.rowe.codes/actions/workflows/integration.yml)

This is the source for [my portfolio site](https://ryan.rowe.codes). It's made with:
* [Astro](https://astro.build) and TypeScript
* [MDX](https://mdxjs.com) for post content
* [vanilla-extract](https://vanilla-extract.style) for styling
* React islands for the interactive widgets

The site is statically generated and deployed through [Cloudflare Pages](https://pages.cloudflare.com).

## Setup
Requires Node 24 or newer. The `algorithmic-art` post's assets are a git submodule, so clone recursively:
```bash
git clone --recursive git@github.com:rfrowe/ryan.rowe.codes.git
npm install
```

If you already cloned without `--recursive`, the submodule is empty and the build will be missing those assets:
```bash
git submodule update --init --recursive
```

## Development
Start development server:
```bash
npm run dev
```

## Checks
```bash
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npx astro check    # Astro's own diagnostics, including .astro templates
npm run test       # vitest
```
CI runs all of these plus the build on every pull request. A separate workflow runs the studio's
Playwright end-to-end suite.

## Deploy
This site is deployed in production with Cloudflare Pages at [ryan.rowe.codes](https://ryan.rowe.codes),
built from `main`.

To build the static site for deployment:
```bash
npm run build
```

The deployable artifact will be in `./dist`

## Blog authoring studio
`studio/` is a local-only tool for drafting posts: an MDX editor, a live Astro preview, and an
embedded agent, with each open post isolated in its own git worktree. It never ships to production.

```bash
npm run studio                                    # opens the most recently modified post
npm run studio -- --post src/content/blog/<post>  # opens a specific one
```

See [`studio/README.md`](studio/README.md) for the architecture, the ports it uses, how posts map to
worktrees, shipping a draft as a PR, and its test suites.
