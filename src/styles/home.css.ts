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

// Reproduces `bannerMargin`, applied to both headings below: `marginLeft: 10%` on desktop
// (md+), switching to a top margin below `md` where the banner's own `paddingLeft: 10%`
// takes over the horizontal offset. The MUI `Typography` browser-margin reset is folded in
// here as explicit per-side zeros (top/right/bottom) rather than a `margin: 0` shorthand:
// the shorthand, when placed in a *second* composed style object, overrode this class's
// `marginLeft` (later source order wins the specificity tie), flush-lefting the banner on
// desktop. Keeping every margin declaration in this one class removes that clobber.
const bannerMargin = style({
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: "10%",
  "@media": {
    [mediaDown("md")]: {
      marginLeft: 0,
      marginTop: "10%",
    },
  },
});

// Spread the whole `typography.h1`/`h3` fragment (fontSize + its responsive `@media`
// steps + weight/line-height/spacing) so the headings scale exactly like MUI's
// responsiveFontSizes; picking off individual props would drop the `@media` overrides.
export const heading1 = style([bannerMargin, typography.h1]);

export const heading3 = style([bannerMargin, typography.h3, { fontFamily: "monospace" }]);

// The banner image: a Kerry Park Seattle skyline that swaps day (light) / night (dark).
// The two photos are perspective-aligned (homography on the Space Needle) so the skyline
// stays registered across the swap. `primary.main` remains as a fallback tint behind the
// image (while it loads / if it 404s). Default is the night image to match the site's
// "dark unless the OS prefers light" default; the explicit `data-theme` selectors (higher
// specificity) win once the no-flash script runs. Both photos are CC0 / public domain.
export const image = style({
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
  backgroundColor: vars.palette.primary.main,
  backgroundImage: 'url("/seattle-night.webp")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  "@media": {
    "(prefers-color-scheme: light)": {
      backgroundImage: 'url("/seattle-day.webp")',
    },
  },
  selectors: {
    'html[data-theme="light"] &': { backgroundImage: 'url("/seattle-day.webp")' },
    'html[data-theme="dark"] &': { backgroundImage: 'url("/seattle-night.webp")' },
  },
});
