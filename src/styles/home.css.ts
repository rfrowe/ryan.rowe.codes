import { style } from "@vanilla-extract/css";
import { shadows, typography, vars } from "@styles/theme.css.ts";
import { mediaDown, mediaUp } from "@styles/theme-utils";

/**
 * Reproduces the pre-migration Home's `containerStyle` (src/pages/index.tsx), which was
 * merged onto `PageTemplate`'s own `mainStyle` (src/components/layout/template.tsx) on a
 * single `<main>` element. Base.astro's `<main>` already reproduces `mainStyle` generically
 * for every page (flexGrow, justify-content, alignItems: center, flexDirection: column) --
 * this page's root instead opts out of that centering (`alignSelf: stretch`) and fills the
 * remaining height (`flexGrow: 1`), then becomes the *real* flex container for the banner +
 * placeholder box: column below `md`, row at `md` and up, stretched cross-axis.
 */
export const container = style({
  display: "flex",
  flexGrow: 1,
  alignSelf: "stretch",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "stretch",
  "@media": {
    [mediaUp("md")]: {
      flexDirection: "row",
    },
  },
});

// Reproduces `bannerStyle`: an equal-share flex child with a drop shadow. `position:
// relative` is required for the shadow to render above the sibling placeholder box.
export const banner = style({
  flexGrow: 1,
  flexBasis: 0,
  boxShadow: shadows[10],
  position: "relative",
  paddingTop: "10%",
  "@media": {
    [mediaDown("md")]: {
      paddingTop: "unset",
      paddingLeft: "10%",
    },
  },
});

// Reproduces `bannerMargin`, applied to both headings below. The original also carried a
// `&:not(:first-of-type)` exception intended to skip this margin for the second heading
// below `md` -- but since the two headings are different tag types (h1/h3), each is its
// own tag's *only* (and therefore first-of-type) element, so that exception never actually
// matched. Both headings render with the same `marginTop` below `md` today; that's what
// this reproduces.
const bannerMargin = style({
  marginLeft: "10%",
  "@media": {
    [mediaDown("md")]: {
      marginLeft: "unset",
      marginTop: "10%",
    },
  },
});

// MUI's `Typography` resets the element's default browser margin to 0 regardless of
// variant; both headings below reproduce that alongside their variant's type scale.
export const heading1 = style([
  bannerMargin,
  {
    margin: 0,
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    lineHeight: typography.h1.lineHeight,
    letterSpacing: typography.h1.letterSpacing,
  },
]);

export const heading3 = style([
  bannerMargin,
  {
    margin: 0,
    fontFamily: "monospace",
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing,
  },
]);

// Reproduces `imageStyle`: the primary-color placeholder standing in for a real image.
export const image = style({
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
  backgroundColor: vars.palette.primary.main,
});
