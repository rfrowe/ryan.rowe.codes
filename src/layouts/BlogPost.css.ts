import { style } from "@vanilla-extract/css";
import { mediaDown, spacing } from "@styles/theme-utils";

/**
 * Reproduces the pre-migration `templateStyle` (src/pages/blog/{mdx.frontmatter__slug}.tsx):
 * responsive left/right margins that shrink at each breakpoint, plus `alignSelf: stretch`
 * to opt this one child out of Base.astro's `align-items: center` (post content should
 * fill the margin-defined width, not shrink-wrap and center).
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
