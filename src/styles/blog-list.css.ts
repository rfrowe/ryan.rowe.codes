import { style } from "@vanilla-extract/css";
import { transitions, typography, vars } from "@styles/theme.css.ts";
import { mediaDown, spacing, transition } from "@styles/theme-utils";

// Reading-width column, opted out of Base's centered <main> via `alignSelf` so it fills the
// margin-defined width and flows from the top rather than being vertically spread.
export const container = style({
  alignSelf: "stretch",
  width: "100%",
  maxWidth: "760px",
  marginTop: spacing(5),
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: spacing(3),
  paddingRight: spacing(3),
  paddingBottom: spacing(8),
  "@media": {
    [mediaDown("sm")]: {
      marginTop: spacing(3),
      paddingLeft: spacing(2),
      paddingRight: spacing(2),
    },
  },
});

export const heading = style({ ...typography.h2, marginTop: 0, marginBottom: spacing(4) });

export const list = style({
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: spacing(5),
});

export const item = style({
  display: "flex",
  flexDirection: "column",
  gap: spacing(1),
});

// Only the title is the link; keeping the excerpt outside the anchor leaves its own future
// inline links clickable and keeps the tap target focused on the heading.
export const titleLink = style({
  color: "inherit",
  textDecoration: "none",
  transition: transition("color", { duration: transitions.duration.shortest }),
  selectors: {
    "&:hover": { color: vars.palette.primary.main },
  },
});

export const title = style({ ...typography.h4, margin: 0 });

export const date = style({
  color: vars.palette.text.secondary,
  fontSize: "0.875rem",
});

export const preview = style({ ...typography.body1, margin: 0, color: vars.palette.text.secondary });

export const pagination = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing(2),
  marginTop: spacing(6),
});

export const pageStatus = style({ color: vars.palette.text.secondary, fontSize: "0.875rem" });

export const pageLink = style({ color: vars.palette.primary.main, textDecoration: "underline" });

// A missing prev/next edge renders as inert text instead of a link, keeping the row's layout.
export const pageLinkDisabled = style({
  color: vars.palette.text.disabled,
  textDecoration: "none",
  pointerEvents: "none",
});
