import {ThemeModeProvider} from "@components/theming";
import {Global} from "@emotion/react";
import type {GatsbySSR} from "gatsby"
import {CssBaseline} from "@mui/material";
import globalStyles from "@styles/global";

import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-twilight.min.css'

export const wrapPageElement: GatsbySSR["wrapPageElement"] = ({
    element
}) => {
    return (
        <ThemeModeProvider>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <Global styles={globalStyles} />
            {element}
        </ThemeModeProvider>
    )
}
