import {ThemeModeProvider} from "@components/theming";
import DynamicTina from "@tina/components/TinaDynamicProvider";
import {Global} from "@emotion/react";
import {CssBaseline} from "@mui/material";
import globalStyles from "@styles/global";

import type {AppProps} from 'next/app'

function App({Component, pageProps}: AppProps) {
    return (
        <DynamicTina>
            <ThemeModeProvider>
                <CssBaseline/>
                <Global styles={globalStyles} />
                <Component {...pageProps} />
            </ThemeModeProvider>
        </DynamicTina>
    )
}

export default App
