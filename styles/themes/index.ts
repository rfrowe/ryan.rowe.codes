import {PaletteMode} from '@mui/material';
import {createTheme} from '@mui/material/styles';

export type ThemeMode = PaletteMode;

const makeTheme = (mode: ThemeMode) => createTheme({
    palette: {mode}
});

export default makeTheme;