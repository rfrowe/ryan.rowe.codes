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
