import { useCallback, useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa6";
import { toggleThemeMode, type ThemeMode } from "@styles/theme-script";
import * as styles from "./Nav.css.ts";

const isMode = (value: string | undefined): value is ThemeMode => value === "light" || value === "dark";

// Rendered client:only (see Nav.astro): the seed reads document.documentElement.dataset.theme,
// which only exists in the browser. client:load would SSR a guessed default and flash the
// wrong icon before hydration corrects it.
const ThemeToggle = () => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const seeded = document.documentElement.dataset.theme;
    return isMode(seeded) ? seeded : "dark";
  });

  // Keep the icon in sync when the theme is toggled from elsewhere -- e.g. clicking a
  // skyline anchor marker also toggles the theme (both go through `toggleThemeMode`).
  useEffect(() => {
    const sync = () => {
      const seeded = document.documentElement.dataset.theme;
      setMode(isMode(seeded) ? seeded : "dark");
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const toggleMode = useCallback(() => setMode(toggleThemeMode()), []);

  const opposite: ThemeMode = mode === "light" ? "dark" : "light";

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
      {opposite === "light" ? (
        <FaSun className={styles.icon} aria-hidden="true" />
      ) : (
        <FaMoon className={styles.icon} aria-hidden="true" />
      )}
    </a>
  );
};

export default ThemeToggle;
