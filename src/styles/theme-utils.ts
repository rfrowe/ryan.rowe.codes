import { breakpoints, transitions, type Breakpoint } from "./theme.css.ts";

/**
 * Plain helper functions built on top of the theme tokens in `theme.css.ts`. These can't
 * live in theme.css.ts itself: vanilla-extract evaluates every export of a `.css.ts`
 * module at build time and only allows plain objects/arrays/strings/numbers, not
 * functions.
 */

export const mediaUp = (bp: Breakpoint): string => `screen and (min-width: ${breakpoints[bp]}px)`;

// MUI's `down()` stops just short of the next breakpoint rather than sharing its edge
// pixel with the paired `up()` query, so the two never both match at the boundary.
export const mediaDown = (bp: Breakpoint): string => `screen and (max-width: ${breakpoints[bp] - 0.05}px)`;

export const mediaBetween = (start: Breakpoint, end: Breakpoint): string =>
  `screen and (min-width: ${breakpoints[start]}px) and (max-width: ${breakpoints[end] - 0.05}px)`;

const spacingUnitPx = 8;

const toSpacingValue = (value: number | string): string => (typeof value === "number" ? `${value * spacingUnitPx}px` : value);

// Mirrors MUI's `theme.spacing(...)`: numbers are multiplied by the 8px factor, strings
// (e.g. 'auto', '2em') pass through untouched. Supports 1-4 args like the MUI original.
export const spacing = (...values: Array<number | string>): string => values.map(toSpacingValue).join(" ");

export const transition = (
  props: string | string[],
  { duration = transitions.duration.shorter, easing = transitions.easing.sharp }: { duration?: number; easing?: string } = {},
): string => {
  const properties = Array.isArray(props) ? props : [props];
  return properties.map(prop => `${prop} ${duration}ms ${easing}`).join(", ");
};
