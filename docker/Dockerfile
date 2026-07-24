# Toolchain image. The studio isn't baked in: entrypoint.sh clones/pulls origin/main into the
# /data/repo volume and runs from there, so drafts + .worktrees outlive a recreate. What IS baked in is
# a 64-byte content digest (content-hash stage) of the .dockerignore-filtered tree, so the image id --
# and thus a deploy -- changes iff a meaningful file does (studio code, a post, config); ignored churn
# (node_modules/.git/.astro) and empty commits are no-ops. On a change `compose up -d` recreates and
# entrypoint.sh's pull brings it in. Context is the repo root; see docker-compose.yml + komodo builds.toml.

# Digest the filtered tree by content -- sha256sum ignores mtime, so a fresh checkout's timestamps
# don't perturb it: same content, same digest, cached, no redeploy. Only the digest is kept (below).
FROM node:24-slim AS content-hash
WORKDIR /src
COPY . .
RUN find . -type f -print0 \
      | sort -z \
      | xargs -0 sha256sum \
      | sha256sum \
      | cut -d ' ' -f1 > /content-hash

FROM node:24-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      git \
      ca-certificates \
      curl \
    && rm -rf /var/lib/apt/lists/*

# A direct binary download avoids importing an apt signing key just for one tool.
ARG GH_CLI_VERSION=2.63.2
RUN arch="$(dpkg --print-architecture)" \
    && curl -fsSL "https://github.com/cli/cli/releases/download/v${GH_CLI_VERSION}/gh_${GH_CLI_VERSION}_linux_${arch}.tar.gz" \
      | tar -xz -C /usr/local --strip-components=1 "gh_${GH_CLI_VERSION}_linux_${arch}/bin/gh"

# Non-root: the Claude Agent SDK and gh/git credential state live under this user's $HOME.
# node:24-slim already has a uid-1000 `node` user, so let useradd pick the next free uid.
RUN useradd --create-home --shell /bin/bash studio \
    && mkdir -p /data/repo \
    && chown studio:studio /data/repo

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Only the digest lands here -- it moves the image id (see header), never runs. Inspect with `cat`.
COPY --from=content-hash /content-hash /etc/blog-studio-content

ENV HOME=/home/studio \
    REPO_DIR=/data/repo \
    GIT_REPO_URL=https://github.com/rfrowe/ryan.rowe.codes.git \
    GIT_BRANCH=main \
    STUDIO_BIND_HOST=0.0.0.0 \
    STUDIO_NO_OPEN_BROWSER=1

USER studio
WORKDIR /data/repo

# SPA, sidecar (REST+WS), Astro preview. The sidecar's MCP face (StreamableHTTP, for external tool
# clients rather than the browser) isn't part of the Traefik-fronted surface this image targets;
# publish/route it separately if that's ever needed.
EXPOSE 5199 4319 4321

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
