import { style } from "@vanilla-extract/css";
import { typography } from "@styles/theme.css.ts";
import { mediaDown, spacing } from "@styles/theme-utils";

/**
 * Reproduces the pre-migration `templateStyle` (src/pages/blog/{mdx.frontmatter__slug}.tsx),
 * which was merged onto `PageTemplate`'s `mainStyle`: responsive left/right margins that
 * shrink at each breakpoint, `alignSelf: stretch` to opt out of Base.astro's
 * `align-items: center`, AND -- crucially -- the flex column with `justify-content:
 * space-between` and `flex-grow: 1` that `mainStyle` provided. The title + each MDX block
 * are direct flex children here, so they distribute across the full viewport height:
 * on a short post (hello-world) the title pins to the top and the last block to the bottom
 * with even gaps; on a long post (algorithmic-art) content overflows and simply stacks.
 * Wrapping the content in a plain block element instead (the earlier regression) bunched
 * every block tight at the top.
 */
export const article = style({
  flexGrow: 1,
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "stretch",
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
