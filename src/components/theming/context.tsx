import {createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {ThemeProvider as MuiThemeProvider} from "@mui/material";
import makeTheme, {ThemeMode} from "@styles/themes";
import {useMediaQuery} from "@mui/material";
import {ThemeProvider as EmotionThemeProvider} from "@emotion/react";

type ToggleThemeFn = () => void;
type ThemeModeContext = [ThemeMode, ToggleThemeFn];

const ThemeModeContext = createContext<ThemeModeContext | undefined>(undefined);

const themeModeStorageKey = 'themeMode'

function persistThemeMode(mode: ThemeMode | undefined) {
    if (mode === undefined) {
        window.localStorage.removeItem(themeModeStorageKey)
    } else {
        window.localStorage.setItem(themeModeStorageKey, mode)
    }
}

function readPersistedThemeMode(): ThemeMode | undefined {
    const mode = window.localStorage.getItem(themeModeStorageKey)
    if (mode !== null && (mode === 'dark' || mode === 'light')) {
        return mode
    }
}

function useThemeModeContextState(): ThemeModeContext {
    const prefersLightMode = useMediaQuery('(prefers-color-scheme: light)');
    const systemMode = prefersLightMode ? 'light' : 'dark';

    // Default theme mode to system mode and automatically change this when system mode changes.
    const [mode, setMode] = useState<ThemeMode>(systemMode);
    useEffect(() => {
        setMode(readPersistedThemeMode() || systemMode)
    }, [systemMode]);

    const toggleMode = useCallback(() => {
        setMode(prev => {
            const next = prev === 'dark' ? 'light' : 'dark'

            if (next === systemMode) {
                persistThemeMode(undefined)
            } else {
                persistThemeMode(next)
            }

            return next
        })
    }, [systemMode]);

    return [mode, toggleMode];
}

export const ThemeModeProvider = ({ children }: PropsWithChildren<{}>) => {
    const themeModeContext = useThemeModeContextState();

    const [mode] = themeModeContext;
    const theme = useMemo(() => makeTheme(mode), [mode]);

    return (
        <ThemeModeContext.Provider value={themeModeContext}>
            <MuiThemeProvider theme={theme}>
                <EmotionThemeProvider theme={theme}>
                    {children}
                </EmotionThemeProvider>
            </MuiThemeProvider>
        </ThemeModeContext.Provider>
    );
};

export const useThemeMode = () => {
    const context = useContext(ThemeModeContext);
    if (context === undefined) {
        throw new Error("Cannot useThemeMode without ThemeModeProvider");
    }

    return context;
}
