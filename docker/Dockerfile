# Toolchain-only image for the blog authoring studio. It does not bake in a copy of the repo --
# entrypoint.sh clones (or pulls) the real thing into a persistent volume at container start, so
# restarting the container picks up new commits (including studio's own fixes) without an image
# rebuild.

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

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

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
