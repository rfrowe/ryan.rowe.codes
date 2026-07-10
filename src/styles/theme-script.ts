export const themeStorageKey = "themeMode";

/**
 * Sets `data-theme` on <html> before first paint: reads a persisted override from
 * localStorage (written only when it diverges from the OS preference -- see the
 * Phase 3 toggle island) and otherwise falls back to `prefers-color-scheme`. Default is
 * dark unless the OS prefers light, matching the pre-migration ThemeModeProvider.
 *
 * Exposed as a raw string so Base.astro can inline it synchronously via
 * `<script set:html={noFlashThemeScript} />` as the first thing in <head> -- it must run
 * (and finish) before any themed CSS paints, or the wrong theme flashes on load.
 */
export const noFlashThemeScript = `(function(){try{var k=${JSON.stringify(themeStorageKey)};var s=localStorage.getItem(k);var m=(s==='light'||s==='dark')?s:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',m);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export type ThemeMode = "light" | "dark";

const getSystemMode = (): ThemeMode =>
  window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

/**
 * Flip `data-theme` on <html> and persist the override, following the same "persist only
 * when it diverges from the OS preference" rule the no-flash script reads back. Returns the
 * new mode. Shared by the nav ThemeToggle and the skyline anchor markers (click to toggle),
 * so both paths stay consistent. Client-only (touches document/window at call time).
 */
export const toggleThemeMode = (): ThemeMode => {
  const current: ThemeMode = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  const next: ThemeMode = current === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  if (next === getSystemMode()) {
    window.localStorage.removeItem(themeStorageKey);
  } else {
    window.localStorage.setItem(themeStorageKey, next);
  }
  return next;
};
