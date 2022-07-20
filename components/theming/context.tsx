import {createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {ThemeProvider as MuiThemeProvider} from "@mui/system";
import makeTheme, {ThemeMode} from "@styles/themes";
import {useMediaQuery} from "@mui/material";
import {ThemeProvider as EmotionThemeProvider} from "@emotion/react";

type ToggleThemeFn = () => void;
type ThemeModeContext = [ThemeMode, ToggleThemeFn];

const ThemeModeContext = createContext<ThemeModeContext | undefined>(undefined);

function useThemeModeContextState(): ThemeModeContext {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const systemMode = prefersDarkMode ? 'dark' : 'light';

    // Default theme mode to system mode and automatically change this when system mode changes.
    const [mode, setMode] = useState<ThemeMode>(systemMode);
    useEffect(() => setMode(systemMode), [systemMode]);

    const toggleMode = useCallback(() => setMode(prev => prev === 'dark' ? 'light' : 'dark'), []);

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
