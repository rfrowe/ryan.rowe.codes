import { style } from "@vanilla-extract/css";
import { typography } from "@styles/theme.css.ts";
import { mediaDown, spacing } from "@styles/theme-utils";

// Post layout: responsive left/right margins that shrink at each breakpoint, plus
// `alignSelf: stretch` to opt out of Base.astro's `align-items: center` so the content
// fills the margin-defined width. Content flows top-aligned in normal block order (not
// spread down the full viewport height).
export const article = style({
  alignSelf: "stretch",
  marginTop: spacing(5),
  marginLeft: "20%",
  marginRight: "20%",
  "@media": {
    [mediaDown("xl")]: {
      marginLeft: "15%",
      marginRight: "15%",
    },
    [mediaDown("lg")]: {
      marginLeft: "10%",
      marginRight: "10%",
    },
    [mediaDown("md")]: {
      marginLeft: "5%",
      marginRight: "5%",
    },
    [mediaDown("sm")]: {
      marginLeft: spacing(2),
      marginRight: spacing(2),
    },
  },
});

// Page title: the h1 type scale with `margin: 0`, matching Prose.css.ts's `h1` treatment
// for in-body MDX headings.
export const title = style({ ...typography.h1, margin: 0 });
