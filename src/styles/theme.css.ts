import { assignVars, createGlobalTheme, createThemeContract, globalStyle } from "@vanilla-extract/css";

export const breakpoints = {
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Only the elevations actually used (0/3/10).
export const shadows: Record<number, string> = {
  0: "none",
  3: "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)",
  10: "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
};

export const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    // Shared light/dark swap duration; keep in sync with THEME_TRANSITION_MS in theme-script.ts.
    theme: 260,
  },
  easing: {
    sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
    standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

// Explicit Helvetica stack, not a system-UI stack (which resolves to San Francisco and
// renders a visibly different typeface at large sizes). The headline overrides to monospace.
export const fontFamily = {
  sans: '"Roboto", "Helvetica", "Arial", sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
};

// Responsive type scale: interpolate each heading from a reduced min size (< sm) up to
// maxRem at lg, snapping to a 4px grid. Variants <= 1rem (body1) stay fixed.
const RESPONSIVE_BPS = [breakpoints.sm, breakpoints.md, breakpoints.lg]; // 600 / 900 / 1200
const HTML_FONT_SIZE = 16;
const RESPONSIVE_FACTOR = 2;

const responsiveFontSize = (maxRem: number, lineHeight: number): { fontSize: string; "@media"?: Record<string, { fontSize: string }> } => {
  if (maxRem <= 1) return { fontSize: `${maxRem}rem` };
  const minRem = 1 + (maxRem - 1) / RESPONSIVE_FACTOR;
  const gridRem = 4 / (lineHeight * HTML_FONT_SIZE);
  const align = (rem: number) => Math.round(rem / gridRem) * gridRem;
  const media: Record<string, { fontSize: string }> = {};
  for (const bp of RESPONSIVE_BPS) {
    const raw = minRem + (maxRem - minRem) * (bp / breakpoints.lg);
    media[`screen and (min-width: ${bp}px)`] = { fontSize: `${align(raw)}rem` };
  }
  return { fontSize: `${minRem}rem`, "@media": media };
};

// Each variant is a full style fragment (fontSize + its `@media` steps + weight/line-height/
// spacing); spread the whole object so the responsive steps survive.
export const typography = {
  h1: { ...responsiveFontSize(6, 1.167), fontWeight: 300, lineHeight: 1.167, letterSpacing: "-0.01562em" },
  h2: { ...responsiveFontSize(3.75, 1.2), fontWeight: 300, lineHeight: 1.2, letterSpacing: "-0.00833em" },
  h3: { ...responsiveFontSize(3, 1.167), fontWeight: 400, lineHeight: 1.167, letterSpacing: "0em" },
  h4: { ...responsiveFontSize(2.125, 1.235), fontWeight: 400, lineHeight: 1.235, letterSpacing: "0.00735em" },
  h5: { ...responsiveFontSize(1.5, 1.334), fontWeight: 400, lineHeight: 1.334, letterSpacing: "0em" },
  h6: { ...responsiveFontSize(1.25, 1.6), fontWeight: 500, lineHeight: 1.6, letterSpacing: "0.0075em" },
  body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.5, letterSpacing: "0.00938em" },
};

export const vars = createThemeContract({
  palette: {
    primary: { main: null, light: null, dark: null, contrastText: null },
    text: { primary: null, secondary: null, disabled: null },
    divider: null,
    background: { default: null, paper: null },
    action: { active: null },
  },
});

const lightPalette = {
  palette: {
    primary: { main: "#1976d2", light: "#42a5f5", dark: "#1565c0", contrastText: "#fff" },
    text: { primary: "rgba(0, 0, 0, 0.87)", secondary: "rgba(0, 0, 0, 0.6)", disabled: "rgba(0, 0, 0, 0.38)" },
    divider: "rgba(0, 0, 0, 0.12)",
    background: { default: "#fff", paper: "#fff" },
    action: { active: "rgba(0, 0, 0, 0.54)" },
  },
};

const darkPalette = {
  palette: {
    primary: { main: "#90caf9", light: "#e3f2fd", dark: "#42a5f5", contrastText: "rgba(0, 0, 0, 0.87)" },
    text: { primary: "#fff", secondary: "rgba(255, 255, 255, 0.7)", disabled: "rgba(255, 255, 255, 0.5)" },
    divider: "rgba(255, 255, 255, 0.12)",
    background: { default: "#121212", paper: "#121212" },
    action: { active: "#fff" },
  },
};

// Default before an explicit [data-theme] is set (no-flash script hasn't run, or JS
// disabled): dark, unless the OS prefers light.
globalStyle(":root", {
  vars: assignVars(vars, darkPalette),
  "@media": {
    "(prefers-color-scheme: light)": {
      vars: assignVars(vars, lightPalette),
    },
  },
});

// An explicit [data-theme], set by the no-flash script or toggled at runtime, always wins
// over the OS-driven default above. Deliberately `html[data-theme=...]` (specificity 0,1,1)
// rather than bare `[data-theme=...]` (0,1,0, a tie with `:root`): the dark values are
// identical between the `:root` default and the `[data-theme="dark"]` override, so
// vanilla-extract dedupes them into one rule at `:root`'s source position -- before the
// `@media (prefers-color-scheme: light)` override above, which would let an explicit dark
// override lose to a light OS preference. The extra `html` specificity wins regardless of
// source order.
createGlobalTheme('html[data-theme="dark"]', vars, darkPalette);
createGlobalTheme('html[data-theme="light"]', vars, lightPalette);
