# Studio UI end-to-end

A **Playwright** suite that drives the real studio SPA in a headless browser — ⌘P, the New-post
dialog, CodeMirror, the name-sync banner, the ⌘P Update affordance, the conflict chat note — asserting
on the **rendered UI** and on **git ground truth** in an isolated sandbox. It exercises the frontend
and the frontend↔backend wiring; the backend in isolation is covered by `studio:test`.

Hermetic by construction: `harness.mjs` builds a throwaway sandbox (a local bare `origin` + working
clone) and boots the sidecar + vite SPA on ephemeral loopback ports (never the studio's fixed
4318/4319/4321/5199), threading one per-launch token into both (`STUDIO_TOKEN` for the sidecar,
`VITE_STUDIO_TOKEN` baked into the served SPA) so the browser is authenticated without any 403. Nothing
touches GitHub, the real `origin`, `main`, or any live worktree; the sandbox is removed on teardown.

The journeys share ONE booted studio (a worker-scoped fixture) and run sequentially in a single worker;
each creates its own post (unique slug) so they stay independent.

## Run it

```sh
npm run studio:e2e                                       # the UI journeys (agent resolution skipped)
npm run studio:e2e -- -g rename                           # one journey by title
STUDIO_E2E_KEEP=1 STUDIO_E2E_VERBOSE=1 npm run studio:e2e  # keep the sandbox + echo sidecar logs
STUDIO_E2E_AGENT=1 npm run studio:e2e -- -g conflict      # the paid agent resolution (needs a key)
```

Env: `STUDIO_E2E_REF` (sandbox source ref, default `HEAD`); `STUDIO_E2E_KEY_FILE` (Anthropic key file,
default `/tmp/anthropic_key.txt`); `STUDIO_E2E_AGENT=1` to run the paid conflict resolution — **off by
default**, so a stray funded key is never spent locally or by an untrusted CI run; `STUDIO_E2E_KEEP=1`,
`STUDIO_E2E_VERBOSE=1`.

## Journeys

1. **create → edit → autosave** (⌘P + New-post dialog + CodeMirror; edit lands on disk).
2. **rename via frontmatter → accept** (edit the slug → name-sync banner → "Rename worktree" → file/
   branch/worktree all move).
3. **adopt + update a behind remote draft from ⌘P** (⌘⇧F, the palette "Update" affordance → tracking
   branch + worktree, rebased onto origin).
4. **conflict → agent resolution** (update an old draft whose base moved → the conflict is handed to the
   post's agent: a "studio" chat note + a conflicted worktree, always; the agent then resolves + the
   rebase completes, only with `STUDIO_E2E_AGENT=1` + a funded key, pinned to Sonnet + low effort).
5. **reload rehydrates** from the connect snapshot.

Selectors are hybrid: semantic first (roles, labels, visible text, placeholders — `role="tab"`,
"Rename worktree", "Create", "Model"/"Sonnet 5"), with the palette rows / conflict note / lifebar
addressed by their stable classes where there's no accessible handle. No `data-testid`s were needed.

Backend-only cases the UI can't naturally trigger (the docsync worktree-vanish FS race; docSync's
external-edit classification) live in `studio:test`, not here.

## In CI

`.github/workflows/integration.yml` runs this in a `node:24` container with Playwright's chromium on
every PR and push to `main` (report + trace uploaded as an artifact on failure). The `ui` job runs the
deterministic journeys key-free. The `agent` job runs the conflict resolution's paid half only in
**trusted contexts** — a push to `main`, or a maintainer's `integration-agent` label on a **same-repo**
PR (never a fork) — and only when an `ANTHROPIC_API_KEY` secret is set. So CI never silently spends
credits, and a stranger's PR can't trigger a paid run.
