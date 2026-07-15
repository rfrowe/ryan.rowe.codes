import { defineConfig } from "astro/config";
import { realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import expressiveCode from "astro-expressive-code";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
// The studio previews each post from a git worktree whose node_modules symlinks to the main repo's.
// Vite resolves that symlink to its real path, outside the worktree, so with fs.strict the dev server
// 403s island hydration clients (@astrojs/react) and nothing hydrates. Allow the real deps dir
// alongside the root; in the main tree the two coincide, so it's a no-op there.
const realNodeModules = realpathSync(path.join(projectRoot, "node_modules"));

// Astro's dev server only auto-restarts for this literal file, plus whatever an integration
// registers via addWatchFile (astro-expressive-code does that itself for ec.config.mjs). A local
// remark/rehype plugin file has no integration to register it, so list any here.
function watchLocalConfigFiles(paths) {
  return {
    name: "watch-local-config-files",
    hooks: {
      "astro:config:setup": ({ addWatchFile }) => {
        for (const p of paths) addWatchFile(p);
      },
    },
  };
}

export default defineConfig({
  site: "https://ryan.rowe.codes",
  output: "static",
  integrations: [
    expressiveCode(),
    react(),
    mdx(),
    watchLocalConfigFiles([]),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  vite: {
    plugins: [vanillaExtractPlugin()],
    server: {
      fs: {
        allow: [projectRoot, realNodeModules],
      },
    },
  },
});
