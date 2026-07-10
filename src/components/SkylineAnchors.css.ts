import { style } from "@vanilla-extract/css";
import { fontFamily, transitions, vars } from "@styles/theme.css.ts";

// Square "registration mark" geometry, centered on the anchor point. `HALF` is reused to
// left-align the typed labels to the marker box's left edge.
const MARKER = 52;
const HALF = MARKER / 2;

// Neon-Genesis / NERV-terminal accent for the active marker + the typed coordinate
// readouts: a hot orange with a dark outline and a colored glow, so the text stays legible
// over both the peachy day sky and the dark night skyline without any solid backing.
const NGE = "#ff6a1a";
const labelShadow = `0 0 2px #000, 0 0 3px #000, 0 1px 2px #000, 0 0 8px ${NGE}, 0 0 16px ${NGE}`;

// Overlay root: fills the skyline image div (`position: relative` there) and lets clicks/
// hovers fall through to the photo everywhere except the markers themselves.
export const root = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
});

// One per visible anchor: a zero-size positioning anchor placed at the marker's on-screen
// (screenX, screenY) via inline `left`/`top`. Its children are offset relative to this point.
export const anchor = style({
  position: "absolute",
  width: 0,
  height: 0,
});

// The crosshair-in-a-box marker: subtle and semi-transparent by default so it reads as a
// faint registration mark over the photo, coloured by the theme's text colour. Re-enables
// pointer events so it can be hovered.
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
  filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.45))",
});

// Active marker: grows and switches to the NERV orange with a matching glow.
export const markerActive = style({
  color: NGE,
  opacity: 1,
  transform: "translate(-50%, -50%) scale(1.35)",
  filter: `drop-shadow(0 1px 1px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 5px ${NGE})`,
});

export const markerSvg = style({
  display: "block",
  width: MARKER,
  height: MARKER,
});

// Coordinate readout, below the marker. Text-only (no pill): NERV orange with an
// outline+glow. Left edge aligned to the marker box's left edge (`left: -HALF`).
export const tooltip = style({
  position: "absolute",
  left: -HALF,
  top: HALF + 4,
  pointerEvents: "none",
  whiteSpace: "nowrap",
  fontFamily: fontFamily.mono,
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.06em",
  lineHeight: 1.2,
  color: NGE,
  textShadow: labelShadow,
});

// "ANCHOR NN" label above the marker, typed out before the coordinate. Same treatment,
// same left edge as the marker box.
export const anchorNum = style({
  position: "absolute",
  left: -HALF,
  top: -(HALF + 4),
  transform: "translateY(-100%)",
  pointerEvents: "none",
  whiteSpace: "nowrap",
  fontFamily: fontFamily.mono,
  fontSize: "0.62rem",
  fontWeight: 700,
  letterSpacing: "0.22em",
  lineHeight: 1.2,
  color: NGE,
  textShadow: labelShadow,
});
