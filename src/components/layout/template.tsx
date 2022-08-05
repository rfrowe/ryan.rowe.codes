import NavBar from "./nav";
import {css, PropsWithStyle} from "@emotion/react";
import {Box} from "@mui/material";
import {PropsWithChildren} from "react";

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
}: PropsWithChildren<PropsWithStyle>) => (
    <Box css={containerStyle}>
        <NavBar />
        <main css={[mainStyle, css]} className={className}>
            {children}
        </main>
    </Box>
)

export default PageTemplate
