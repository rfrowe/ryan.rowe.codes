import {css} from "@emotion/react";
import {AppBar, Slide, Toolbar, useScrollTrigger} from "@mui/material";
import ThemedStyles from "@lib/types/css";
import {PropsWithChildren, ReactElement} from "react";

function HideOnScroll({children}: { children: ReactElement }) {
    const trigger = useScrollTrigger({threshold: 25})

    return (
        <Slide appear={false} direction='down' in={!trigger}>
            {children}
        </Slide>
    );
}

const navStyle: ThemedStyles = theme => css({
    background: theme.palette.background.default,
    borderBottomColor: theme.palette.divider,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    boxShadow: 'none',
})

const NavBar = ({children}: PropsWithChildren<{}>) => (
    <HideOnScroll>
        <AppBar css={navStyle} position='sticky'>
            <Toolbar component='nav'>
                {children}
            </Toolbar>
        </AppBar>
    </HideOnScroll>
)

export default NavBar
