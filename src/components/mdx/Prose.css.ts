import { globalStyle, style } from "@vanilla-extract/css";
import { typography, vars } from "@styles/theme.css.ts";
import { spacing } from "@styles/theme-utils";

// Headings reset margin to 0; only `p` (below) adds vertical margin.
const heading = (variant: keyof typeof typography) => style({ ...typography[variant], margin: 0 });

export const h1 = heading("h1");
export const h2 = heading("h2");
export const h3 = heading("h3");
export const h4 = heading("h4");
export const h5 = heading("h5");
export const h6 = heading("h6");

export const p = style({
  ...typography.body1,
  margin: spacing(2, 0),
});

export const link = style({
  color: vars.palette.primary.main,
  textDecoration: "underline",
});

export const img = style({
  maxWidth: "100%",
  height: "auto",
  borderRadius: "4px",
});

export const figure = style({
  margin: spacing(3, 0),
  padding: 0,
});

globalStyle(`${figure} img`, {
  maxWidth: "100%",
  height: "auto",
  borderRadius: "4px",
});

export const figcaption = style({
  marginTop: spacing(1),
  fontSize: "0.875rem",
  color: vars.palette.text.secondary,
  textAlign: "center",
  fontStyle: "italic",
});

// `ul.spaced` is authored via `:::class{.spaced}` (see remarkDirectiveRender.ts), which
// lands the class directly on the `ul` - no wrapper element to style instead.
globalStyle("ul.spaced li", {
  margin: spacing(1, 0),
});

// `::marker` can't take margin/width, so the bullet is a positioned `::before` instead.
globalStyle("ul", {
  listStyle: "none",
  paddingLeft: "1.5em",
});

// `li` padding is the bullet-to-text gap only; `ul`'s padding above positions the bullet.
globalStyle("ul li", {
  position: "relative",
  paddingLeft: "1.5em",
});

// Em dash is the default bullet; `.em-bullet` names it explicitly, `.en-bullet`/`.bullet` opt into an alternate.
globalStyle("ul li::before", {
  content: '"—"',
  position: "absolute",
  left: 0,
});

globalStyle("ul.em-bullet li::before", {
  content: '"—"',
});

globalStyle("ul.en-bullet li::before", {
  content: '"–"',
});

globalStyle("ul.bullet li::before", {
  content: '"•"',
});
