import ThemeSwitcher from "@components/theming/switcher";
import {css} from "@emotion/react";
import ThemedStyles from "@lib/types/css";
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import {AppBar, Box, IconButton, Link, Slide, Toolbar, useScrollTrigger} from "@mui/material";

import {useRouter} from "next/router";
import {ReactElement} from "react";

const iconButtonStyle: ThemedStyles = theme => css({
    marginRight: theme.spacing(1)
})

const brandStyle: ThemedStyles = theme => css({
    flexGrow: 1,
    margin: `0 ${theme.spacing(2)}`
})

const logoStyle = (hide: boolean) => css({
    display: hide ? 'none' : 'inherit'
})

const linksStyle: ThemedStyles = theme => css({
    marginLeft: theme.spacing(1)
})

function HideOnScroll({children}: { children: ReactElement }) {
    const trigger = useScrollTrigger()

    return (
        <Slide appear={false} direction='down' in={!trigger}>
            {children}
        </Slide>
    );
}

const NavBar = () => {
    const route = useRouter()
    const hideRootLink = route.pathname === '/'

    return (
        <HideOnScroll>
            <AppBar component='nav' css={css({background: 'transparent'})}>
                <Toolbar>
                    <ThemeSwitcher css={[
                        iconButtonStyle,
                        theme => css({color: theme.palette.action.active})
                    ]}/>
                    <Link href='https://github.com/rfrowe' css={iconButtonStyle}>
                        <IconButton>
                            <GitHubIcon/>
                        </IconButton>
                    </Link>
                    <Link href='mailto:ryan@rowe.codes' css={iconButtonStyle}>
                        <IconButton>
                            <EmailIcon/>
                        </IconButton>
                    </Link>

                    {/* TODO: use next/link */}
                    <Box css={brandStyle}>
                        <Link href='/'>
                            <h2 css={logoStyle(hideRootLink)}>ryan.rowe.codes</h2>
                        </Link>
                    </Box>

                    {/* TODO: use next/link */}
                    <Link href='/blog' css={linksStyle}>
                        Blog
                    </Link>
                    <Link href='/about' css={linksStyle}>
                        About
                    </Link>
                </Toolbar>
            </AppBar>
        </HideOnScroll>
    )
}

export default NavBar
