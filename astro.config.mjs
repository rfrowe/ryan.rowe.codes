import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  site: "https://ryan.rowe.codes",
  output: "static",
  integrations: [
    expressiveCode({
      plugins: [pluginLineNumbers()],
    }),
    react(),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  vite: {
    plugins: [vanillaExtractPlugin()],
  },
});
