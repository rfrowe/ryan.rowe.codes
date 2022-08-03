import {useThemeMode} from "@components/theming/context";
import {PropsWithStyle} from '@emotion/react'
import {IconButton} from "@mui/material";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const ThemeSwitcher = ({className, css}: PropsWithStyle) => {
    const [mode, toggleMode] = useThemeMode();

    const opposite = mode === 'light' ? 'dark' : 'light';
    const Icon = opposite === 'light' ? LightModeIcon : DarkModeIcon

    return (
        <IconButton
            color='primary'
            className={className}
            css={css}
            aria-label={`Change theme to ${opposite} mode`}
            onClick={toggleMode}
        >
            <Icon />
        </IconButton>
    );
}

export default ThemeSwitcher
