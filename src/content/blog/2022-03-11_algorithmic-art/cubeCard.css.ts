import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "@styles/theme.css.ts";
import { mediaBetween, mediaDown, spacing } from "@styles/theme-utils";

/**
 * Reproduces the pre-migration `cubeCard.tsx` Emotion styles. Per the migration plan,
 * the `mediaBetween("lg", "sm")` call below is DELIBERATELY reproduced with its
 * pre-existing reversed argument order (a pre-existing bug: `lg` is 1200px, `sm` is
 * 600px, so `min-width:1200px and max-width:599.95px` can never match) -- the live site
 * never actually applies this 75% rule, so the container stays at 60% width all the way
 * from `sm` to `lg`. Match current output, don't fix it here.
 */
export const container = style({
  width: "60%",
  margin: `${spacing("2em")} auto`,
  "@media": {
    [mediaBetween("lg", "sm")]: {
      width: "75%",
    },
    [mediaDown("sm")]: {
      width: "90%",
    },
  },
});

// react-p5's `createCanvas` sets the canvas element's own inline `style.width`/
// `style.height` (for pixel-density scaling), which otherwise wins over a plain CSS rule
// -- the `!important` here is load-bearing, carried over from the pre-migration Emotion
// styles for the same reason. A plain `&`-selector can't target a descendant tag (only
// the class's own element/pseudo-states), hence `globalStyle` on the compound selector.
globalStyle(`${container} canvas`, {
  width: "100% !important",
  height: "unset !important",
});

export const controls = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  "@media": {
    [mediaDown("md")]: {
      flexWrap: "wrap",
    },
  },
});

export const label = style({
  flexShrink: 0,
});

export const calculateIcon = style({
  width: "24px",
  height: "24px",
  fill: "currentColor",
  margin: spacing(0, 2),
  flexShrink: 0,
});

export const slider = style({
  flexGrow: 1,
  minWidth: 0,
  width: "100%",
  accentColor: vars.palette.primary.main,
});
