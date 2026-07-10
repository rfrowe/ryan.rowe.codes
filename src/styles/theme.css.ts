import { assignVars, createGlobalTheme, createThemeContract, globalStyle } from "@vanilla-extract/css";

/**
 * Reproduces the subset of MUI v5's default theme that the pre-migration app actually
 * consumed (see recon notes in .internal/ai/plans/gatsby-to-astro-migration.md): palette,
 * 8px spacing, breakpoints, shadows[3]/shadows[10], the transition duration/easing used
 * by the nav's hover effects, and the h1-h6/body1 type scale. Only tokens referenced by
 * the ported components are populated -- this is a faithful subset, not a full theme port.
 *
 * vanilla-extract evaluates every export of a `.css.ts` module at build time and requires
 * each one to serialize to a plain object/array/string/number -- functions aren't allowed.
 * So the helper *functions* built on top of these tokens (mediaUp/mediaDown/spacing/
 * transition(...)) live in the plain module `./theme-utils.ts` instead, importing the
 * plain-value tokens (breakpoints, transitions, etc.) from here.
 */

// ---------------------------------------------------------------------------
// Breakpoints (MUI v5 defaults)
// ---------------------------------------------------------------------------

export const breakpoints = {
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// ---------------------------------------------------------------------------
// Shadows (MUI v5 default elevation values). Only the elevations actually consumed by
// the ported components -- the quine CodeBlock's shadows[3], the homepage banner's
// shadows[10] -- are reproduced here, matched against MUI's documented default array.
// ---------------------------------------------------------------------------

export const shadows: Record<number, string> = {
  0: "none",
  3: "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)",
  10: "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
};

// ---------------------------------------------------------------------------
// Transitions (MUI v5 defaults; only the values consumed by the nav's zoomOnHover /
// Namemail hover transitions)
// ---------------------------------------------------------------------------

export const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
  },
  easing: {
    sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  },
};

// ---------------------------------------------------------------------------
// Fonts. Roboto was never actually loaded by the pre-migration site (no webfont link
// was ever added), so MUI's Typography always rendered its fallback chain in practice --
// this reproduces that observed rendering directly instead of porting the unused Roboto
// reference. The headline keeps its explicit monospace override.
// ---------------------------------------------------------------------------

// MUI's Typography default `fontFamily` is `"Roboto","Helvetica","Arial",sans-serif`, and
// the pre-migration site never loaded the Roboto webfont -- so browsers fell through to
// Helvetica (Helvetica Neue on macOS). Reproducing that exact stack (rather than a
// `-apple-system` system-UI stack, which resolves to San Francisco and renders a visibly
// different typeface at large sizes) is what makes the headings/prose match the live site.
export const fontFamily = {
  sans: '"Roboto", "Helvetica", "Arial", sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
};

// ---------------------------------------------------------------------------
// Type scale (MUI v5 default typography variants), reproducing `responsiveFontSizes()`
// EXACTLY rather than approximating it. Reverse-engineered from the live site + MUI's
// source (responsiveFontSizes -> responsiveProperty + alignProperty/fontGrid):
//   minRem (the < sm size) = 1 + (maxRem - 1) / factor,   factor = 2
//   raw(bp)               = minRem + (maxRem - minRem) * (bp / lg)     for bp in sm,md,lg
//   aligned(bp)           = round(raw / grid) * grid,   grid = 4 / (lineHeight * 16)
// This matches the measured live sizes to the sub-pixel (e.g. h1: 56 / 75.41 / 85.69 /
// 96px across xs/sm/md/lg). Variants <= 1rem (body1) are left untouched, as MUI does.
// Each variant is a complete style fragment (fontSize + its `@media` step overrides +
// weight/line-height/spacing) so consumers spread the whole object and inherit the
// responsive steps -- picking off just `.fontSize` would drop them.
// ---------------------------------------------------------------------------

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

export const typography = {
  h1: { ...responsiveFontSize(6, 1.167), fontWeight: 300, lineHeight: 1.167, letterSpacing: "-0.01562em" },
  h2: { ...responsiveFontSize(3.75, 1.2), fontWeight: 300, lineHeight: 1.2, letterSpacing: "-0.00833em" },
  h3: { ...responsiveFontSize(3, 1.167), fontWeight: 400, lineHeight: 1.167, letterSpacing: "0em" },
  h4: { ...responsiveFontSize(2.125, 1.235), fontWeight: 400, lineHeight: 1.235, letterSpacing: "0.00735em" },
  h5: { ...responsiveFontSize(1.5, 1.334), fontWeight: 400, lineHeight: 1.334, letterSpacing: "0em" },
  h6: { ...responsiveFontSize(1.25, 1.6), fontWeight: 500, lineHeight: 1.6, letterSpacing: "0.0075em" },
  body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.5, letterSpacing: "0.00938em" },
};

// ---------------------------------------------------------------------------
// Palette (MUI v5 documented defaults) -- token contract + light/dark values
// ---------------------------------------------------------------------------

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

// Default before an explicit [data-theme] is present (e.g. the sliver of time before the
// no-flash script runs, or with JS disabled): dark, unless the OS prefers light --
// matches the pre-migration ThemeModeProvider default.
globalStyle(":root", {
  vars: assignVars(vars, darkPalette),
  "@media": {
    "(prefers-color-scheme: light)": {
      vars: assignVars(vars, lightPalette),
    },
  },
});

// An explicit [data-theme], set by the no-flash script (./theme-script.ts) from
// localStorage or toggled at runtime, always wins over the OS-driven default above.
// Deliberately `html[data-theme=...]` (specificity 0,1,1) rather than `[data-theme=...]`
// (0,1,0, a tie with `:root`): when the dark palette's values are identical between the
// `:root` default and the `[data-theme="dark"]` override, vanilla-extract's compiler
// dedupes them into one rule at `:root`'s *original* source position -- which would put
// it before the "@media (prefers-color-scheme: light)" override above, causing an
// explicit dark override to lose to a light OS preference. The extra `html` specificity
// wins outright regardless of source order, so this can't regress silently.
createGlobalTheme('html[data-theme="dark"]', vars, darkPalette);
createGlobalTheme('html[data-theme="light"]', vars, lightPalette);
