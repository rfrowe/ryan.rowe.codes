import { style } from "@vanilla-extract/css";
import { fontFamily, vars } from "@styles/theme.css.ts";

// Primary colour, no underline on the anchor itself -- `typedText` below re-adds the underline
// for just the typed characters.
export const link = style({
  fontFamily: fontFamily.mono,
  color: vars.palette.primary.main,
  textDecorationLine: "none",
});

// Underlines only the typed text, not ConsoleTypist's blinking cursor.
export const typedText = style({
  textDecorationLine: "underline",
  textDecorationColor: "inherit",
});
