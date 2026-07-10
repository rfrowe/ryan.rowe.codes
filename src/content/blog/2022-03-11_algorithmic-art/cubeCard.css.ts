import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "@styles/theme.css.ts";
import { mediaDown, spacing } from "@styles/theme-utils";

/**
 * Reproduces the pre-migration `cubeCard.tsx` Emotion styles: the cube container is 60%
 * wide from `sm` upward and widens to 90% below `sm`.
 */
export const container = style({
  width: "60%",
  margin: `${spacing("2em")} auto`,
  "@media": {
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
