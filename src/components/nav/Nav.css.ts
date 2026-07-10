import { style } from "@vanilla-extract/css";
import { vars, transitions, typography } from "@styles/theme.css.ts";
import { mediaUp, mediaDown, spacing, transition } from "@styles/theme-utils";

/**
 * Sticky bar reproducing the pre-migration `NavBar` (src/components/layout/nav/bar.tsx):
 * `position: sticky` AppBar with a bottom divider border and no box-shadow. The
 * hide-on-scroll slide (wired up by the inline <script> in Nav.astro) reuses
 * `transitions.duration.shorter` rather than MUI Slide's own enteringScreen/leavingScreen
 * durations (225ms/195ms) -- those weren't part of Phase 2's token subset, and 200ms is
 * close enough for a bar this small; Phase 8's screenshot diffing is the real gate on
 * this being visually right.
 */
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

// Reproduces MUI's default `Toolbar`: flex row, centered cross-axis, min-height 56px below
// `sm` / 64px at `sm`+, and gutter padding 16px below `sm` / 24px at `sm`+ (MUI's
// `Toolbar` uses `theme.spacing(2)`/`spacing(3)` gutters -- the earlier build hard-coded
// 16px at all widths, which under-inset the nav on desktop).
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

// Base link styling shared by every nav item (icon or text), reproducing the
// pre-migration `NavBarLink`: MUI `Link` typography='h5' + `spacing(0, 1)` margin.
export const link = style([
  {
    display: "inline-flex",
    alignItems: "center",
    margin: spacing(0, 1),
  },
  // Spread the full h5 fragment so nav links pick up its responsive `@media` steps too.
  typography.h5,
]);

// Text links (Blog/About/home) additionally get MUI Link's own defaults: primary color
// + underline.
export const textLink = style({
  color: vars.palette.primary.main,
  textDecoration: "underline",
});

// Icon links get the tighter `spacing(0, 0.5)` margin from the pre-migration
// `NavBarIconLink`, plus `spacing(1)` (8px) padding to reproduce the MUI `IconButton` the
// original wrapped each icon in -- that padding is what spread the icons apart and inset
// the first one; omitting it packed the icons too tightly against each other and the edge.
// Colour is `action.active` (IconButton's own default, which won out over the theme
// switcher's explicit `color='primary'` -- see the old nav/theme.tsx: the emotion `css`
// override was injected after MUI's styles and won the tie).
export const iconLink = style({
  margin: spacing(0, 0.5),
  padding: spacing(1),
  color: vars.palette.action.active,
});

// Reproduces `zoomOnHover` (src/components/layout/nav/icon.tsx): the icon scales up 1.1x
// over `transitions.duration.shortest` when its parent link is hovered -- pure CSS, no JS.
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

// --- Namemail hover-reveal-@ (CSS-only) ---------------------------------------------
//
// Reproduces src/components/layout/nav/namemail.tsx without any JS: hovering the email
// icon link (`emailTrigger`, which always precedes the home link in DOM order) reveals
// the `@` and hides the first `.` of "ryan.rowe.codes", morphing it into "ryan@rowe.codes".
// A general-sibling selector (`~`) can reach across the intervening mobile-only Home
// icon link because it only requires a shared parent + a later DOM position, not
// adjacency.
//
// The reveal is driven by `font-size` (0 <-> 1em) on plain `display: inline` spans rather
// than `width` on `inline-block` spans. This is deliberate: Chromium serializes an
// `inline-block` boundary into `window.getSelection().toString()` as stray whitespace, so
// the original width technique made a copy of the link read "ryan .rowe.codes". With inline
// spans there is no such boundary, so the `@` is the real, selectable email separator (it
// stays in the selection even while collapsed to `font-size: 0`) and the decorative `.` is
// excluded from the copy (`user-select: none` + `aria-hidden` in the markup) -- selecting
// the link yields a clean "ryan@rowe.codes" in both the default and hovered states.

export const emailTrigger = style({});

// The shared `link` style is `display: inline-flex`, which turns every direct child (each
// text run and glyph span) into its own flex item; Chromium serializes those item
// boundaries into `getSelection().toString()` as newlines, so copying the link produced a
// mangled multi-line string. The home link carries only plain inline text, so drop it back
// to normal inline flow -- no flex items, no boundary artifacts, and the copied text stays
// a single continuous string.
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
  // A 0-duration transition with a delay reproduces the original's `setTimeout` snap:
  // the dot collapses instantly, but only after half the `@` reveal has played, masking
  // the swap instead of an abrupt cut.
  transitionProperty: "font-size",
  transitionDuration: "0s",
  transitionDelay: `${transitions.duration.shorter / 2}ms`,
  selectors: {
    [`${emailTrigger}:hover ~ ${homeLink} &`]: {
      fontSize: 0,
    },
  },
});
