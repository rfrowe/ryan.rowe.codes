import { style } from "@vanilla-extract/css";
import { typography, vars } from "@styles/theme.css.ts";
import { spacing } from "@styles/theme-utils";

/**
 * Reproduces the pre-migration MDX overrides (src/components/blog/overrides.tsx): MUI
 * `Typography` renders every heading variant with `margin: 0` by default -- only the `p`
 * override explicitly added `spacing(2)` top/bottom margin on top of `body1`.
 */
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

// Reproduces `gatsby-theme-material-ui`'s `Link`: MUI `Link`'s default appearance
// (primary color + underline) applies the same regardless of internal/external routing --
// only the `target`/`rel` attributes (set in Link.astro) differ.
export const link = style({
  color: vars.palette.primary.main,
  textDecoration: "underline",
});
