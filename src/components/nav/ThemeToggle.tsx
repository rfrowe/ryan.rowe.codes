import { useCallback, useState } from "react";
import { themeStorageKey } from "@styles/theme-script";
import * as styles from "./Nav.css.ts";

type Mode = "light" | "dark";

const lightModePath =
  "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5M2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1m18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1m0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1M5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0z";

const darkModePath =
  "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1";

const isMode = (value: string | undefined): value is Mode => value === "light" || value === "dark";

const getSystemMode = (): Mode => (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

const persistThemeMode = (mode: Mode | undefined) => {
  if (mode === undefined) {
    window.localStorage.removeItem(themeStorageKey);
  } else {
    window.localStorage.setItem(themeStorageKey, mode);
  }
};

/**
 * Rendered `client:only="react"` (see Nav.astro) rather than `client:load`: the seed
 * value below comes from `document.documentElement.dataset.theme`, which only exists in
 * the browser. `client:load` would still SSR this component first using some guessed
 * default, then correct it on hydration -- showing the wrong icon for a moment, which is
 * exactly the flash this is supposed to prevent. `client:only` skips the SSR render
 * entirely, so the icon never paints before it can read the real value.
 */
const ThemeToggle = () => {
  const [mode, setMode] = useState<Mode>(() => {
    const seeded = document.documentElement.dataset.theme;
    return isMode(seeded) ? seeded : "dark";
  });

  const toggleMode = useCallback(() => {
    setMode(prev => {
      const next: Mode = prev === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      // Persist an override only when it diverges from the OS preference, matching the
      // pre-migration ThemeModeProvider semantics.
      persistThemeMode(next === getSystemMode() ? undefined : next);
      return next;
    });
  }, []);

  const opposite: Mode = mode === "light" ? "dark" : "light";

  return (
    <a
      href="#"
      role="button"
      aria-label={`Change theme to ${opposite} mode`}
      className={`${styles.link} ${styles.iconLink}`}
      onClick={event => {
        event.preventDefault();
        toggleMode();
      }}
    >
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <path d={opposite === "light" ? lightModePath : darkModePath} />
      </svg>
    </a>
  );
};

export default ThemeToggle;
