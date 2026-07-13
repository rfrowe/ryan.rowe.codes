import { useEffect, useState } from "react";
import { readThemeMode, type ThemeMode } from "@styles/theme-script";

/**
 * The current theme, kept in sync with `<html data-theme>` across islands via a
 * MutationObserver. Seeds from the DOM when it exists (client:only islands render in the
 * browser, so this avoids a wrong-theme flash); server-rendered islands seed dark and correct
 * on mount.
 */
export const useThemeMode = (): ThemeMode => {
  const [mode, setMode] = useState<ThemeMode>(() => (typeof document === "undefined" ? "dark" : readThemeMode()));

  useEffect(() => {
    setMode(readThemeMode());
    const observer = new MutationObserver(() => setMode(readThemeMode()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return mode;
};
