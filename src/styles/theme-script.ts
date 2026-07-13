export const themeStorageKey = "themeMode";

/**
 * Sets `data-theme` on <html> before first paint: reads a persisted override from
 * localStorage (written only when it diverges from the OS preference), else falls back to
 * `prefers-color-scheme`; default dark unless the OS prefers light.
 *
 * Exposed as a raw string so Base.astro can inline it synchronously as the first thing in
 * <head> -- it must run before any themed CSS paints, or the wrong theme flashes on load.
 */
export const noFlashThemeScript = `(function(){try{var k=${JSON.stringify(themeStorageKey)};var s=localStorage.getItem(k);var m=(s==='light'||s==='dark')?s:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',m);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export type ThemeMode = "light" | "dark";

const isMode = (value: string | undefined): value is ThemeMode => value === "light" || value === "dark";

/** The current `data-theme` on <html>, defaulting to dark. Client-only (reads document). */
export const readThemeMode = (): ThemeMode =>
  isMode(document.documentElement.dataset.theme) ? document.documentElement.dataset.theme : "dark";

// Length of the light/dark crossfade; keep in sync with transitions.duration.theme
// (theme.css.ts), which styles the `.theme-anim` rule.
export const THEME_TRANSITION_MS = 260;

const getSystemMode = (): ThemeMode =>
  window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

let themeAnimTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Arm the color crossfade: add `theme-anim` to <html> so the global transition
 * (global.css.ts) eases palette colors for one swap, then remove it.
 */
const armThemeTransition = () => {
  const root = document.documentElement;
  root.classList.add("theme-anim");
  clearTimeout(themeAnimTimer);
  themeAnimTimer = setTimeout(() => root.classList.remove("theme-anim"), THEME_TRANSITION_MS + 80);
};

/**
 * Flip `data-theme` on <html> and persist the override, following the same "persist only
 * when it diverges from the OS preference" rule the no-flash script reads back. Returns the
 * new mode. Client-only (touches document/window at call time).
 */
export const toggleThemeMode = (): ThemeMode => {
  const current: ThemeMode = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  const next: ThemeMode = current === "light" ? "dark" : "light";
  armThemeTransition();
  document.documentElement.dataset.theme = next;
  if (next === getSystemMode()) {
    window.localStorage.removeItem(themeStorageKey);
  } else {
    window.localStorage.setItem(themeStorageKey, next);
  }
  return next;
};
