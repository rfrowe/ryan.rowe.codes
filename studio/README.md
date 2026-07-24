# Blog authoring studio

A **local-only** tool for drafting posts on this blog: a CodeMirror editor over the raw MDX, a live
Astro preview, and an embedded agent that can edit the post alongside you. It never ships to
production and is orthogonal to the site build, so nothing here affects what Cloudflare deploys.

## Requirements

* **Node 24 or newer.** The orchestrator refuses to start on anything older.
* **`gh`**, authenticated, for opening a PR. Everything else works without it.
* An **Anthropic API key or Claude subscription** for the agent panel. The editor, preview, and git
  operations work without one.

## Quick start

```bash
npm run studio                                                        # the most recently modified post
npm run studio -- --post src/content/blog/2022-03-12_hello-world.mdx  # a file post
npm run studio -- --post src/content/blog/2024-12-06_lore-migration/post.mdx  # a folder post
```

Point `--post` at the `.mdx` itself. A simple post is `YYYY-MM-DD_slug.mdx`; a post with co-located
components is `YYYY-MM-DD_slug/post.mdx`.

`npm run studio` runs `bin/studio.mjs`, which boots everything, health-gates each service before
starting the next, opens your browser at the post, and prints a banner with the live links. Ctrl+C
tears down the whole process tree.

The orchestrator is deliberately dependency-free (`node:` builtins only): it is the first thing that
runs, before any devDependency is guaranteed usable.

## What comes up

Four processes, each on its own port. The well-known port is used when free, otherwise an ephemeral
one takes over so a second studio can run beside the first.

| Face | Default port | What it is |
| --- | --- | --- |
| Studio SPA | 5199 | The Vite + React UI you interact with |
| Sidecar web | 4319 | REST plus one WebSocket carrying doc-sync and the agent conversation |
| Studio MCP | 4318 | The Studio MCP over StreamableHTTP, for external clients |
| Astro preview | 4321 | The dev server rendering the post you are editing |

The sidecar owns the Astro daemon rather than the orchestrator. It runs exactly one at a time and
restarts it in the active post's worktree on every switch, because Astro memoizes `getStaticPaths`
in dev and a new post's route would not otherwise exist. It also restarts when a local file that
`astro.config.mjs` imports changes, which Astro's own config watching cannot see.

Both sidecar faces are loopback-bound and guarded by a per-launch bearer token plus Host and Origin
checks. Only `/health` is unauthenticated, so the orchestrator can health-gate startup.

## Per-post git worktrees

Every open post lives in its own git worktree on branch `blog/<slug>`, under `.worktrees/`, forked
from the session branch tip. The agent runs one session per post rooted in that worktree, so
concurrent sessions never contend over a single working tree; a PreToolUse hook makes any edit
outside the worktree prompt first.

New worktrees get `node_modules` symlinked from the repo root and the files matching
[`.worktreeinclude`](../.worktreeinclude) copied in, so gitignored local config such as `.env.local`
is present there too.

The **session branch** is whatever branch you launched the studio on. It is the fork base for new
posts and the target that ship, save-draft, and update all resolve against. The sidecar refuses to
start when `STUDIO_PRIMARY_BRANCH` disagrees with the checked-out HEAD, since that mismatch would
silently rebase or ship against the wrong branch.

## Keyboard

| Chord | Action |
| --- | --- |
| ⌘P | Open or create a post |
| ⌘K | Agent directive |
| ⌘⇧F | Fetch from origin |
| ⌘⇧U | Update / pull |
| ⌘/ | Show all shortcuts |

## Git operations

These are **studio-run, never agent-run**, and each destructive one is gated behind an explicit
confirm. Commits use the pinned `Ryan Rowe <ryan@rowe.codes>` identity.

* **Ship as PR** stages the post (or, in `all` scope, the whole worktree, so a post can carry
  supporting changes like a new rehype plugin), commits, pushes, and opens a PR against the session
  branch. Never `git add -A`, and never a merge. The PR body carries the post's predicted Cloudflare
  preview URL.
* **Save draft to remote** commits and pushes the `blog/<stem>` branch without opening a PR, so a
  draft can be resumed later or picked up in another editor. Unlike ship, it does not gate on a
  frontmatter/filename desync, since a draft may be saved mid-rename.
* **Update** rebases the post onto its moved base. A resulting conflict is handed to the post's own
  agent to resolve, which posts a note into the chat.
* **Fetch** refreshes origin so the header can warn when the active post is behind its base.

`docSync` watches the file on disk and tells apart the store's own writes, the agent's writes during
a locked turn, and genuinely external edits; only the last raises a reload banner.

## Layout

| Path | What lives there |
| --- | --- |
| `bin/` | The `npm run studio` orchestrator |
| `sidecar/` | The backend: web and MCP faces, git services, agent host, docSync, ship |
| `frontend/` | The Vite + React SPA |
| `shared/` | Frozen DI seams, the wire protocol, and shared types |
| `state/` | The document store and the docSync state machine |
| `mcp/` | Studio MCP tool implementations and its HTTP server |
| `git-live/` | Reactive git state |
| `preview/` | Cloudflare Pages preview-URL prediction |
| `sessions/` | Session-picker view model |
| `e2e/` | The Playwright UI suite (see [`e2e/README.md`](e2e/README.md)) |

Route service calls through the seams in `shared/` rather than reaching for concretes.

## The MCP face

The same tools back the embedded agent panel (mounted in-process) and external clients over
StreamableHTTP at `/mcp`: `describe`, `get_editor_context`, `list_posts`, `scaffold_post`,
`preview_status`, and `open_pr`. The contract lives in
[`shared/mcpTools.ts`](shared/mcpTools.ts) and is frozen.

Both the MCP `instructions` and the agent's appended system prompt are read from
`.claude/skills/blog-authoring/SKILL.md` at startup, so the conventions the agent follows cannot
drift from the documented ones.

## Environment

Everything has a working default; none of these are required.

| Variable | Effect |
| --- | --- |
| `STUDIO_POST` | The post to open, same as `--post` |
| `STUDIO_PRIMARY_BRANCH` | Override the session branch (must match HEAD) |
| `STUDIO_FORK_BASE` | Fork new post worktrees from something other than the session-branch tip |
| `STUDIO_CF_PAGES_PROJECT` | Cloudflare Pages project for preview links (default `ryan-rowe-codes`) |
| `STUDIO_NO_OPEN_BROWSER` | Skip the browser launch |
| `STUDIO_MCP_PORT`, `STUDIO_WEB_PORT`, `STUDIO_SPA_PORT`, `STUDIO_ASTRO_PORT` | Pin a face's port |
| `STUDIO_BIND_HOST`, `STUDIO_HOST_SIDECAR`, `STUDIO_HOST_ASTRO`, `STUDIO_PROTOCOL` | Widen the bind address and fix up browser-facing URLs when running behind a reverse proxy |

`STUDIO_TOKEN` is generated per launch and injected by the orchestrator. The sidecar refuses to
start unauthenticated, so don't set it by hand.

## Tests

```bash
npm run studio:typecheck   # tsc -p studio/tsconfig.json --noEmit
npm run studio:test        # vitest, the backend and pure logic in isolation
npm run studio:e2e         # Playwright, the real SPA against a booted sidecar
```

The first two run in the `CI` workflow on every pull request. The end-to-end suite runs in the
separate `Integration` workflow so its heavier run never blocks lint and build feedback; see
[`e2e/README.md`](e2e/README.md) for the journeys it covers and how its paid agent leg is gated.

## Troubleshooting

* **Preview is unavailable.** Another process is probably holding the Astro port. The sidecar logs
  when the daemon fails to bind or never answers.
* **A reload banner you didn't expect.** Something outside the studio wrote the post file. The
  banner is the gate; accept it to pick up the change.
* **Stale routes after editing `astro.config.mjs`.** Clear the worktree's `.astro/` cache directory
  and let the sidecar restart the daemon.
* **A leftover worktree.** Post worktrees live under `.worktrees/`; `git worktree list` shows them
  and the studio self-heals a husk on next open.
