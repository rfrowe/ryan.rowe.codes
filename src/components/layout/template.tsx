import type {PropsWithChildren} from "react";
import NavBar from "./nav";
import {css, PropsWithStyle} from "@emotion/react";
import {Box} from "@mui/material";

const containerStyle = css({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
})

const mainStyle = css({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
})

const PageTemplate = ({
    children,
    className,
    css,
}: PropsWithStyle<PropsWithChildren>) => (
    <Box css={containerStyle}>
        <NavBar />
        <main css={[mainStyle, css]} className={className}>
            {children}
        </main>
    </Box>
)

export default PageTemplate
