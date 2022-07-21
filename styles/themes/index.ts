import {PaletteMode, responsiveFontSizes} from '@mui/material';
import {createTheme} from '@mui/material/styles';

export type ThemeMode = PaletteMode;

const makeTheme = (mode: ThemeMode) => responsiveFontSizes(createTheme({
    palette: {mode}
}));

export default makeTheme;