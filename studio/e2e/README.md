# Studio end-to-end suite

`scenarios.test.mjs` (a separate **Vitest** project, `vitest.config.ts`) boots a **real sidecar**
against a **fully isolated git sandbox** (a local bare `origin` plus a working clone as the studio's
repo root) and drives the studio end to end through the same loopback REST + WebSocket faces the SPA
uses — asserting on ground-truth git, the reactive `git.state`, and sidecar liveness after each
real-world workflow.

It is hermetic by construction: nothing touches GitHub, the real `origin`, `main`, or any live
worktree. The sandbox is a throwaway sibling dir removed on teardown; the sidecar runs on ephemeral
ports (never the studio's fixed 4318/4319/4321/5199), so it can't collide with a running studio.

The scenarios are one **ordered session replay** sharing a single long-lived sidecar (later scenarios
lean on earlier ones), so they run sequentially in a single worker (`pool: "forks"`,
`fileParallelism: false`). It's a separate Vitest project so it never runs inside the fast unit suites
(`npm test` collects only `src/`, `npm run studio:test` only studio `.ts`/`.tsx`).

## Run it

```sh
npm run studio:e2e                                    # the deterministic scenarios (8a skipped)
npm run studio:e2e -- -t 8b                            # a single scenario by name filter
STUDIO_E2E_REF=origin/main npm run studio:e2e          # build the sandbox from a specific ref
STUDIO_E2E_AGENT=1 npm run studio:e2e -- -t 8a         # enable the paid agent scenario (needs a key)
```

Config via env: `STUDIO_E2E_REF` (sandbox source ref, default `HEAD`); `STUDIO_E2E_KEY_FILE`
(Anthropic key file, default `/tmp/anthropic_key.txt`); `STUDIO_E2E_AGENT=1` to enable the paid agent
scenario (8a) — **off by default**, so a stray funded key is never spent locally or by an untrusted CI
run; `STUDIO_E2E_KEEP=1` to keep the sandbox; `STUDIO_E2E_VERBOSE=1` to echo (scrubbed) sidecar logs.

Reactive-`git.state` convergence checks are **soft** (`console.warn`, non-fatal) because the chokidar
doorbell is best-effort under rapid automation; the hard pass/fail is always ground-truth git plus
sidecar liveness. (They are deliberately not `test.retry` — the scenarios are ordered and
state-accumulating, so re-running a body would replay its git mutations against a dirtied sandbox.)

## Scenarios

1. create → edit → autosave · 2. rename via frontmatter → accept · 3. save draft to remote ·
4. fetch · 5. update/pull-behind · 6. continue after pull · 7. adopt a remote-only draft ·
**8a. conflict → agent resolution** (needs a funded key + `STUDIO_E2E_AGENT=1`) · **8b. worktree-vanish
crash probe** (key-free; a deterministic reproduction of the docsync-worktree-crash class — passes on a
fixed studio, fails on an unfixed one) · 9. update-root (ff + diverged) · 10a. revert · 10b. delete
draft · 10c. external-edit classification · 10d. reconnect snapshot.

## In CI

`.github/workflows/integration.yml` runs this in a `node:24-slim` container on every PR and push to
`main`. The `git-flow` job runs the deterministic scenarios key-free (8a skipped) on all of them. The
agent scenario (8a) drives a real, paid Claude turn, so its `agent` job runs only in **trusted
contexts** — a push to `main`, or a maintainer's `integration-agent` label on a **same-repo** PR (never
a fork) — sets `STUDIO_E2E_AGENT=1`, and only spends when an `ANTHROPIC_API_KEY` secret is configured.
So CI never silently spends credits, and a stranger's PR can't trigger a paid run. The agent turn is
pinned to **Sonnet** at **low** reasoning effort (via `model.set` / `effort.set`) — it validates the
flow, not model quality, at the cheapest capable cost.
