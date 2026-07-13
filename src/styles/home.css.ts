import { style } from "@vanilla-extract/css";
import { shadows, typography, vars } from "@styles/theme.css.ts";
import { mediaDown, mediaUp } from "@styles/theme-utils";

// Home's <main>: opt out of Base.astro's centering (`alignSelf: stretch`), fill the
// remaining height, and become the flex container for the banner + box -- column below
// `md`, row at `md` and up, stretched cross-axis.
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

// Equal-share flex child with a drop shadow. `position: relative` is required for the
// shadow to render above the sibling box.
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

// Applied to both headings below: `marginLeft: 10%` at md+, switching to a top margin below
// `md` where the banner's own `paddingLeft: 10%` takes over the horizontal offset. Per-side
// zeros rather than a `margin: 0` shorthand -- a shorthand in a later composed style object
// would override `marginLeft` (later source order wins), flush-lefting the banner.
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

// Spread the whole typography fragment (fontSize + its responsive `@media` steps) so the
// headings keep the responsive steps; picking off individual props would drop them.
export const heading1 = style([bannerMargin, typography.h1]);

export const tagline = style([bannerMargin, typography.h3, { fontFamily: "monospace" }]);

// The banner image: a Kerry Park Seattle skyline that swaps day (light) / night (dark).
// `backgroundColor` is a fallback tint behind the image (while it loads / if it 404s).
// Default is the night image to match the "dark unless the OS prefers light" default; the
// explicit `data-theme` selectors (higher specificity) win once set. Both photos are CC0.
export const image = style({
  flexGrow: 2,
  flexShrink: 1,
  flexBasis: 0,
  // Positioning context for the SkylineAnchors overlay island (absolute, inset: 0),
  // registered to the background photo.
  position: "relative",
  backgroundColor: vars.palette.background.default,
  backgroundImage: 'url("/seattle-night.webp")',
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  // Fill the column; anchor to the top so vertical cropping trims the foreground
  // (bottom), keeping the sky + Space Needle.
  backgroundPosition: "center top",
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
