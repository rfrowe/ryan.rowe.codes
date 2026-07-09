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
