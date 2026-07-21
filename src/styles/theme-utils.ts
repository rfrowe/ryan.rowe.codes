import { breakpoints, transitions, type Breakpoint } from "./theme.css.ts";

/**
 * Plain helper functions built on top of the theme tokens in `theme.css.ts`. These can't
 * live in theme.css.ts itself: vanilla-extract evaluates every export of a `.css.ts`
 * module at build time and only allows plain objects/arrays/strings/numbers, not
 * functions.
 */

export const mediaUp = (bp: Breakpoint): string => `screen and (min-width: ${breakpoints[bp]}px)`;

// Stop just short of the next breakpoint so `up()`/`down()` never both match at the
// boundary pixel.
export const mediaDown = (bp: Breakpoint): string => `screen and (max-width: ${breakpoints[bp] - 0.05}px)`;

const spacingUnitPx = 8;

const toSpacingValue = (value: number | string): string => (typeof value === "number" ? `${value * spacingUnitPx}px` : value);

// Numbers multiply the 8px unit; strings (e.g. 'auto', '2em') pass through untouched.
export const spacing = (...values: Array<number | string>): string => values.map(toSpacingValue).join(" ");

export const transition = (
  props: string | string[],
  { duration = transitions.duration.shorter, easing = transitions.easing.sharp }: { duration?: number; easing?: string } = {},
): string => {
  const properties = Array.isArray(props) ? props : [props];
  return properties.map(prop => `${prop} ${duration}ms ${easing}`).join(", ");
};
