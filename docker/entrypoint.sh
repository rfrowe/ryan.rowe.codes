#!/usr/bin/env bash
# Runs as the non-root `studio` user on every container start. Clones the repo into the persistent
# $REPO_DIR volume on first run, pulls $GIT_BRANCH on every run after, wires up GitHub auth, installs
# dependencies, then hands off to the same orchestrator local dev uses.
set -euo pipefail

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "[entrypoint] cloning $GIT_REPO_URL into $REPO_DIR"
  git clone --recursive "$GIT_REPO_URL" "$REPO_DIR"
else
  echo "[entrypoint] fetching latest $GIT_BRANCH"
  git -C "$REPO_DIR" fetch origin
  git -C "$REPO_DIR" checkout "$GIT_BRANCH"
  git -C "$REPO_DIR" pull --ff-only origin "$GIT_BRANCH"
  git -C "$REPO_DIR" submodule update --init --recursive
fi

# `gh` (and, via the credential helper this wires up, plain `git push`) reads GH_TOKEN directly --
# no `gh auth login` needed for headless use.
if [ -n "${GH_TOKEN:-}" ]; then
  gh auth setup-git
else
  echo "[entrypoint] GH_TOKEN is not set; ship/save-draft's git push and gh pr create will fail." >&2
fi

cd "$REPO_DIR"
npm ci

exec npm run studio
