import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "@styles/theme.css.ts";
import { mediaDown, spacing } from "@styles/theme-utils";

export const container = style({
  width: "60%",
  margin: `${spacing("2em")} auto`,
  "@media": {
    [mediaDown("sm")]: {
      width: "90%",
    },
  },
});

// !important is load-bearing: the canvas element sets its own inline width/height.
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
