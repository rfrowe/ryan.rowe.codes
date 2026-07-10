import { style } from "@vanilla-extract/css";
import { fontFamily, transitions, vars } from "@styles/theme.css.ts";

// Square "registration mark" geometry, centered on the anchor point. `HALF` is reused to
// left-align the typed labels to the marker box's left edge.
const MARKER = 52;
const HALF = MARKER / 2;

// Theme-dependent NERV accent: hot orange in day (light), cool terminal green at night
// (dark). Applied to the markers and the typed readouts via `data-theme` selectors.
const ORANGE = "#ff6a1a";
const GREEN = "#2effb0";

const textGlow = (c: string) => `0 0 2px #000, 0 0 3px #000, 0 1px 2px #000, 0 0 8px ${c}, 0 0 15px ${c}`;
const markerGlowIdle = (c: string) => `drop-shadow(0 1px 1px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 2px ${c})`;
const markerGlowActive = (c: string) => `drop-shadow(0 1px 1px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 6px ${c})`;
const darkSel = 'html[data-theme="dark"] &';

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

// The crosshair-in-a-box marker. Idle: the accent colour at reduced opacity with a soft
// glow, so it reads against the photo without shouting. Hover/focus: comes alive (below).
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
  color: ORANGE,
  opacity: 0.72,
  pointerEvents: "auto",
  transform: "translate(-50%, -50%)",
  transformOrigin: "center",
  transition: `transform ${transitions.duration.shorter}ms ${transitions.easing.sharp}, color ${transitions.duration.shorter}ms ${transitions.easing.sharp}, opacity ${transitions.duration.shorter}ms ${transitions.easing.sharp}, filter ${transitions.duration.shorter}ms ${transitions.easing.sharp}`,
  filter: markerGlowIdle(ORANGE),
  selectors: {
    [darkSel]: { color: GREEN, filter: markerGlowIdle(GREEN) },
  },
});

// Active marker: full opacity, grown, stronger glow.
export const markerActive = style({
  color: ORANGE,
  opacity: 1,
  transform: "translate(-50%, -50%) scale(1.35)",
  filter: markerGlowActive(ORANGE),
  selectors: {
    [darkSel]: { color: GREEN, filter: markerGlowActive(GREEN) },
  },
});

export const markerSvg = style({
  display: "block",
  width: MARKER,
  height: MARKER,
});

// Shared look for the typed labels: text-only (no pill), accent colour + outline/glow,
// left edge aligned to the marker box's left edge (`left: -HALF`).
const labelBase = style({
  position: "absolute",
  left: -HALF,
  pointerEvents: "none",
  whiteSpace: "nowrap",
  fontFamily: fontFamily.mono,
  fontWeight: 700,
  lineHeight: 1.4,
  color: ORANGE,
  textShadow: textGlow(ORANGE),
  selectors: {
    [darkSel]: { color: GREEN, textShadow: textGlow(GREEN) },
  },
});

// "ANCHOR NN", above the marker (typed first).
export const anchorNum = style([
  labelBase,
  {
    top: -(HALF + 4),
    transform: "translateY(-100%)",
    fontSize: "0.62rem",
    letterSpacing: "0.22em",
  },
]);

// The coordinate + error readout, stacked below the marker (typed after "ANCHOR NN").
export const readout = style([
  labelBase,
  {
    top: HALF + 4,
    fontSize: "0.7rem",
    letterSpacing: "0.06em",
  },
]);
