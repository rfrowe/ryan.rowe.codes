#!/usr/bin/env bash
# Runs as the non-root `studio` user on every container start. Clones the repo into the persistent
# $REPO_DIR volume on first run, pulls $GIT_BRANCH on every run after, wires up GitHub auth, installs
# dependencies, then hands off to the same orchestrator local dev uses.
set -euo pipefail

# `gh` (and, via the credential helper this wires up, plain `git`) reads GH_TOKEN directly -- no
# `gh auth login` needed for headless use. Must run before the clone/fetch below, or a private
# GIT_REPO_URL has no credentials to authenticate with.
if [ -n "${GH_TOKEN:-}" ]; then
  gh auth setup-git
else
  echo "[entrypoint] GH_TOKEN is not set; ship/save-draft's git push and gh pr create will fail." >&2
fi

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "[entrypoint] cloning $GIT_REPO_URL ($GIT_BRANCH) into $REPO_DIR"
  git clone --recursive --branch "$GIT_BRANCH" "$GIT_REPO_URL" "$REPO_DIR"
else
  echo "[entrypoint] fetching latest $GIT_BRANCH"
  git -C "$REPO_DIR" fetch origin
  git -C "$REPO_DIR" checkout "$GIT_BRANCH"
  git -C "$REPO_DIR" pull --ff-only origin "$GIT_BRANCH"
  git -C "$REPO_DIR" submodule update --init --recursive
fi

cd "$REPO_DIR"
npm ci

# Exec the underlying script directly rather than `npm run studio`: npm doesn't reliably forward
# SIGTERM to the child it wraps, which would stop the orchestrator's own graceful shutdown (and its
# cascade to the sidecar/SPA/Astro daemon) from ever running before `docker stop` gives up and kills it.
exec node studio/bin/studio.mjs
