import { style } from "@vanilla-extract/css";
import { typography } from "@styles/theme.css.ts";
import { mediaDown, spacing } from "@styles/theme-utils";

/**
 * Post layout: the responsive left/right margins from the pre-migration `templateStyle`
 * (shrinking at each breakpoint), plus `alignSelf: stretch` to opt out of Base.astro's
 * `align-items: center` so the content fills the margin-defined width.
 *
 * Content flows top-aligned in normal block order. This is a DELIBERATE departure from the
 * pre-migration site: that build inherited `justify-content: space-between` from the shared
 * `mainStyle`, which spread a short post's blocks down the full viewport height with large
 * uneven gaps (title pinned top, last block pinned bottom). Top-aligned block flow reads
 * like a normal document instead -- so post pages no longer match the live site's vertical
 * distribution, by choice.
 */
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

/**
 * The pre-migration template rendered the title via MUI's `<Typography variant="h1">`
 * with no margin override, so its default `margin: 0` applies -- matches Prose.css.ts's
 * `h1` treatment for in-body MDX headings.
 */
export const title = style({ ...typography.h1, margin: 0 });
