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
//
// `WebkitFontSmoothing: antialiased` + `MozOsxFontSmoothing: grayscale` reproduce MUI's
// CssBaseline. Without them macOS defaults to subpixel antialiasing, which renders every
// glyph noticeably HEAVIER than the live site (grayscale AA) -- most visible on the light-
// weight headings at small sizes and on the monospace code blocks. All other font metrics
// (family, size, weight, line-height) already match live exactly; this was the last gap.
globalStyle("body", {
  textRendering: "optimizeLegibility",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  backgroundColor: vars.palette.background.default,
  color: vars.palette.text.primary,
});
