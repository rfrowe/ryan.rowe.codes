import { style } from "@vanilla-extract/css";
import { fontFamily, transitions, vars } from "@styles/theme.css.ts";

// Overlay root: fills the skyline image div (`position: relative` there) and lets clicks/
// hovers fall through to the photo everywhere except the markers themselves.
export const root = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
});

// One per visible anchor: a zero-size positioning anchor placed at the marker's on-screen
// (screenX, screenY) via inline `left`/`top`. Its children (the marker + tooltip) are
// centered/offset relative to this point.
export const anchor = style({
  position: "absolute",
  width: 0,
  height: 0,
});

// The crosshair-in-a-box marker: subtle and semi-transparent by default so it reads as a
// faint registration mark over the photo, coloured by the theme's text colour (dark on the
// day photo, light on the night photo). Re-enables pointer events so it can be hovered.
export const marker = style({
  position: "absolute",
  left: 0,
  top: 0,
  display: "block",
  padding: 0,
  margin: 0,
  border: "none",
  background: "none",
  cursor: "pointer",
  lineHeight: 0,
  color: vars.palette.text.primary,
  opacity: 0.45,
  pointerEvents: "auto",
  transform: "translate(-50%, -50%)",
  transformOrigin: "center",
  transition: `transform ${transitions.duration.shorter}ms ${transitions.easing.sharp}, color ${transitions.duration.shorter}ms ${transitions.easing.sharp}, opacity ${transitions.duration.shorter}ms ${transitions.easing.sharp}`,
  // A faint shadow keeps the mark legible over both the bright day sky and the dark night
  // sky without a heavy outline.
  filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.45))",
});

// Applied (via React hover/focus state) to the active marker: grows it and switches to the
// livelier theme primary colour.
export const markerActive = style({
  color: vars.palette.primary.main,
  opacity: 1,
  transform: "translate(-50%, -50%) scale(1.35)",
});

export const markerSvg = style({
  display: "block",
  width: 44,
  height: 44,
});

// The coordinate chip shown below the active marker: a small monospace label in an opaque
// themed pill so it stays readable over the photo. Non-interactive (clicks fall through).
export const tooltip = style({
  position: "absolute",
  left: 0,
  top: 30,
  transform: "translateX(-50%)",
  pointerEvents: "none",
  whiteSpace: "nowrap",
  fontFamily: fontFamily.mono,
  fontSize: "0.78rem",
  lineHeight: 1.2,
  color: vars.palette.primary.main,
  backgroundColor: vars.palette.background.default,
  border: `1px solid ${vars.palette.divider}`,
  borderRadius: 6,
  padding: "2px 6px",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
});

// The "Anchor N" label shown ABOVE the active marker, typed out before the coordinate.
export const anchorNum = style({
  position: "absolute",
  left: 0,
  top: -30,
  transform: "translate(-50%, -100%)",
  pointerEvents: "none",
  whiteSpace: "nowrap",
  fontFamily: fontFamily.mono,
  fontSize: "0.72rem",
  lineHeight: 1.2,
  color: vars.palette.text.primary,
  backgroundColor: vars.palette.background.default,
  border: `1px solid ${vars.palette.divider}`,
  borderRadius: 6,
  padding: "2px 6px",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
});
