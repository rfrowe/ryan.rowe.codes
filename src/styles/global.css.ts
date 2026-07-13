import { globalStyle } from "@vanilla-extract/css";
import { fontFamily, transitions, vars } from "./theme.css.ts";

globalStyle("*", {
  boxSizing: "border-box",
});

// Whole-site light/dark crossfade. `toggleThemeMode` adds `theme-anim` to <html> for the
// length of the swap so palette colors ease instead of snapping -- only during an explicit
// toggle, so ordinary hover/focus colour changes stay instant.
globalStyle("html.theme-anim, html.theme-anim *, html.theme-anim *::before, html.theme-anim *::after", {
  transitionProperty: "background-color, border-color, color, fill, stroke, box-shadow",
  transitionDuration: `${transitions.duration.theme}ms`,
  transitionTimingFunction: transitions.easing.standard,
});

globalStyle("html, body", {
  margin: 0,
  padding: 0,
  fontFamily: fontFamily.sans,
});

// Grayscale-antialias text; macOS otherwise defaults to heavier subpixel AA.
globalStyle("body", {
  textRendering: "optimizeLegibility",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  backgroundColor: vars.palette.background.default,
  color: vars.palette.text.primary,
});
