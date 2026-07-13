import { FaSun, FaMoon } from "react-icons/fa6";
import { toggleThemeMode } from "@styles/theme-script";
import { useThemeMode } from "@lib/useThemeMode";
import * as styles from "./Nav.css.ts";

/**
 * Rendered client:only (see Nav.astro): `useThemeMode` seeds from `document`, so hydrating
 * client-side is what lets the correct icon show without a flash.
 */
const ThemeToggle = () => {
  const mode = useThemeMode();
  const opposite = mode === "light" ? "dark" : "light";

  return (
    <a
      href="#"
      role="button"
      aria-label={`Change theme to ${opposite} mode`}
      className={`${styles.link} ${styles.iconLink}`}
      onClick={event => {
        event.preventDefault();
        toggleThemeMode();
      }}
    >
      {opposite === "light" ? <FaSun className={styles.icon} aria-hidden="true" /> : <FaMoon className={styles.icon} aria-hidden="true" />}
    </a>
  );
};

export default ThemeToggle;
