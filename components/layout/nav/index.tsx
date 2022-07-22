import NavBar from "@components/layout/nav/bar";
import NavBarIconLink from "@components/layout/nav/icon";
import NavBarLink from "@components/layout/nav/link";
import NavBarThemeSwitcher from "@components/layout/nav/theme";
import {css} from "@emotion/react";
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import {Box, Theme} from "@mui/material";

import {useRouter} from "next/router";

const hideOnLarge = (hide: boolean) => (theme: Theme) => css({
    display: hide ? 'none' : 'unset',
    [theme.breakpoints.up('sm')]: {
        display: 'none',
    },
})

const hideOnSmall = (hide: boolean) => (theme: Theme) => css({
    display: hide ? 'none' : 'unset',
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },
})

const Navigation = () => {
    const route = useRouter()
    const isRoot = route.pathname === '/'

    return (
        <NavBar>
            <NavBarThemeSwitcher />
            <NavBarIconLink href='https://github.com/rfrowe' icon={GitHubIcon} />
            <NavBarIconLink href='mailto:ryan@rowe.codes' icon={EmailIcon} />

            {/* Root links, which are only shown on non-root pages, for mobile and desktop. */}
            <NavBarIconLink href='/' icon={HomeIcon} css={hideOnLarge(isRoot)} />
            <NavBarLink href='/' css={hideOnSmall(isRoot)}>
                ryan.rowe.codes
            </NavBarLink>

            <Box css={css({marginLeft: 'auto'})}>
                <NavBarLink href='/blog'>
                    Blog
                </NavBarLink>
                <NavBarLink href='/about'>
                    About
                </NavBarLink>
            </Box>
        </NavBar>
    )
}

export default Navigation
