import { globalStyle } from "@vanilla-extract/css";
import { fontFamily, vars } from "./theme.css.ts";

globalStyle("*", {
  boxSizing: "border-box",
});

globalStyle("html, body", {
  margin: 0,
  padding: 0,
  fontFamily: fontFamily.sans,
});

// Paints the themed background/text color as soon as `data-theme`/`prefers-color-scheme`
// resolve a palette (see theme.css.ts) -- without this, the page would render with the
// browser's default white background/black text regardless of theme.
globalStyle("body", {
  textRendering: "optimizeLegibility",
  backgroundColor: vars.palette.background.default,
  color: vars.palette.text.primary,
});
