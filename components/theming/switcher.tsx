import {useThemeMode} from "@components/theming/context";
import {IconButton} from "@mui/material";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const ThemeSwitcher = () => {
    const [mode, toggleMode] = useThemeMode();

    const opposite = mode === 'light' ? 'dark' : 'light';
    const Icon = opposite === 'light' ? LightModeIcon : DarkModeIcon;

    return (
        <IconButton
            color='primary'
            aria-label={`switch to ${opposite} mode`}
            onClick={toggleMode}
        >
            <Icon />
        </IconButton>
    );
}

export default ThemeSwitcher
