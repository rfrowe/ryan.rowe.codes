import { globalStyle, style } from "@vanilla-extract/css";
import { spacing } from "@styles/theme-utils";

export const diagram = style({
  display: "flex",
  justifyContent: "center",
  margin: `${spacing(3)} 0`,
});

// mermaid emits a fixed-width <svg>; let it shrink to the column on narrow screens.
globalStyle(`${diagram} svg`, {
  maxWidth: "100%",
  height: "auto",
});

// Shown only if a diagram fails to parse, so the source stays legible.
export const fallback = style({
  overflowX: "auto",
});
