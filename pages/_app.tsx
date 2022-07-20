import {ThemeModeProvider} from "@components/theming";
import DynamicTina from "@components/tina/dynamic"
import {CssBaseline} from "@mui/material";
import '@styles/globals.css'

import type {AppProps} from 'next/app'

function App({Component, pageProps}: AppProps) {
    return (
        <DynamicTina>
            <ThemeModeProvider>
                <CssBaseline/>
                <Component {...pageProps} />
            </ThemeModeProvider>
        </DynamicTina>
    )
}

export default App
