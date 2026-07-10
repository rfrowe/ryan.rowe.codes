import { style } from "@vanilla-extract/css";
import { vars, transitions, typography } from "@styles/theme.css.ts";
import { mediaUp, mediaDown, spacing, transition } from "@styles/theme-utils";

// Sticky bar; slides out of view via the `data-hidden` toggle set by the script in Nav.astro.
export const bar = style({
  position: "sticky",
  top: 0,
  zIndex: 10,
  background: vars.palette.background.default,
  borderBottomStyle: "solid",
  borderBottomWidth: "1px",
  borderBottomColor: vars.palette.divider,
  boxShadow: "none",
  transform: "translateY(0)",
  transition: transition("transform", { duration: transitions.duration.shorter }),
  selectors: {
    '&[data-hidden="true"]': {
      transform: "translateY(-100%)",
    },
  },
});

export const toolbar = style({
  display: "flex",
  alignItems: "center",
  minHeight: "56px",
  padding: spacing(0, 2),
  "@media": {
    [mediaUp("sm")]: {
      minHeight: "64px",
      padding: spacing(0, 3),
    },
  },
});

export const link = style([
  {
    display: "inline-flex",
    alignItems: "center",
    margin: spacing(0, 1),
  },
  // Spread the full h5 fragment so nav links pick up its responsive `@media` steps too.
  typography.h5,
]);

export const textLink = style({
  color: vars.palette.primary.main,
  textDecoration: "underline",
});

// The 8px padding spreads the icons apart and insets the first one from the edge.
export const iconLink = style({
  margin: spacing(0, 0.5),
  padding: spacing(1),
  color: vars.palette.action.active,
});

export const icon = style({
  width: "24px",
  height: "24px",
  fill: "currentColor",
  transition: transition("transform", { duration: transitions.duration.shortest }),
  selectors: {
    [`${iconLink}:hover &`]: {
      transform: "scale(1.1)",
    },
  },
});

export const showOnMobile = style({
  "@media": {
    [mediaUp("sm")]: {
      display: "none",
    },
  },
});

export const showOnDesktop = style({
  "@media": {
    [mediaDown("sm")]: {
      display: "none",
    },
  },
});

export const spacer = style({
  marginLeft: "auto",
  display: "inline-flex",
  alignItems: "center",
});

// Hovering the email link reveals the `@` and hides the first `.`, morphing
// "ryan.rowe.codes" into "ryan@rowe.codes". The reveal is font-size (not width) on inline
// (not inline-block) spans so the collapsed `@` adds no stray whitespace to copied text and
// stays a selectable email separator; the decorative `.` is user-select:none + aria-hidden.
export const emailTrigger = style({});

// The shared `link` style is inline-flex; its flex-item boundaries serialize into
// getSelection() as newlines, so force plain inline flow to keep the copied text on one line.
export const homeLink = style({
  display: "inline",
});

export const at = style({
  display: "inline",
  fontSize: 0,
  transition: transition("font-size", { duration: transitions.duration.shorter }),
  selectors: {
    [`${emailTrigger}:hover ~ ${homeLink} &`]: {
      fontSize: "1em",
    },
  },
});

export const dot = style({
  display: "inline",
  userSelect: "none",
  // 0-duration transition on a delay: the dot collapses instantly, but only after half the
  // `@` reveal has played, masking the swap.
  transitionProperty: "font-size",
  transitionDuration: "0s",
  transitionDelay: `${transitions.duration.shorter / 2}ms`,
  selectors: {
    [`${emailTrigger}:hover ~ ${homeLink} &`]: {
      fontSize: 0,
    },
  },
});
