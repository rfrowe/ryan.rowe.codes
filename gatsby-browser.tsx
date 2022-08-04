import {ThemeModeProvider} from "@components/theming";
import {Global} from "@emotion/react";
import type {GatsbyBrowser} from "gatsby"
import {CssBaseline} from "@mui/material";
import globalStyles from "@styles/global";

import 'prismjs/themes/prism-twilight.min.css'

export const wrapPageElement: GatsbyBrowser["wrapPageElement"] = ({
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