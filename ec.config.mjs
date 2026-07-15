import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { defineEcConfig } from "astro-expressive-code";

// Expressive Code options live here, not inline in astro.config, so the runtime `<Code>` component
// (astro-expressive-code/components) can load a JSON-serializable config. Both the build-time fenced
// blocks and `<Code>` read this.
export default defineEcConfig({
  // Switch themes on the site's `data-theme` attribute (set before paint by the no-flash script),
  // not prefers-color-scheme, so code blocks follow the header light/dark toggle like the rest of
  // the page. `theme.type` is "dark" or "light", matching the values the toggle writes.
  themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
  useDarkModeMediaQuery: false,
  plugins: [pluginLineNumbers()],
});
