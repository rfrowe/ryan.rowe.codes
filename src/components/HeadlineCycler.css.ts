import { style } from "@vanilla-extract/css";
import { fontFamily, vars } from "@styles/theme.css.ts";

// Reproduces the pre-migration `headlineStyle`: the pre-migration `gatsby-theme-material-ui`
// `Link` defaults to `color="primary"` + `underline="always"` -- explicit `primary.main` +
// `textDecorationLine: "none"` reproduces that base then strips the underline, which
// `typedText` below re-adds for just the typed characters (see src/components/nav/Nav.css.ts
// `textLink` for the same MUI-`Link`-default reproduction elsewhere).
export const link = style({
  fontFamily: fontFamily.mono,
  color: vars.palette.primary.main,
  textDecorationLine: "none",
});

// Underlines only the typed text (not ConsoleTypist's blinking cursor), matching the
// pre-migration `linkStyle` applied to the inner span rather than the anchor.
export const typedText = style({
  textDecorationLine: "underline",
  textDecorationColor: "inherit",
});
