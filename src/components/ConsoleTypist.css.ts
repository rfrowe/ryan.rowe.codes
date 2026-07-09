import { keyframes, style } from "@vanilla-extract/css";

// Reproduces the pre-migration Emotion `blinkingStyle`: a hard on/off blink (not a fade)
// via `step-start` timing, so the cursor is either fully visible or fully hidden with no
// intermediate opacity frame.
const blinker = keyframes({
  "50%": {
    opacity: 0,
  },
});

// `animationDuration` is set inline per-instance (see ConsoleTypist.tsx) because
// `cursorIntervalMillis` is a runtime prop, not a build-time constant vanilla-extract can
// bake in here.
export const cursor = style({
  animationName: blinker,
  animationTimingFunction: "step-start",
  animationIterationCount: "infinite",
});
