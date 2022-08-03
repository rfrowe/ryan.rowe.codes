import NavBar from "./bar";
import Namemail from "./namemail"
import NavBarIconLink from "./icon";
import NavBarLink from "./link";
import NavBarThemeSwitcher from "./theme";
import {css} from "@emotion/react";
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import {Box, Theme} from "@mui/material";

import {useState} from "react";
import {useLocation} from "@reach/router";

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
    const {pathname} = useLocation()
    const isRoot = pathname === '/'

    const [showEmail, setShowEmail] = useState(false)

    return (
        <NavBar>
            <NavBarThemeSwitcher />
            <NavBarIconLink
                aria-label='Check out my GitHub'
                href='https://github.com/rfrowe'
                icon={GitHubIcon}
            />
            <NavBarIconLink
                aria-label='Send me an email'
                href='mailto:ryan@rowe.codes'
                icon={EmailIcon}
                onMouseEnter={() => setShowEmail(true)}
                onMouseLeave={() => setShowEmail(false)}
            />

            {/* Root links, which are only shown on non-root pages, for mobile and desktop. */}
            <NavBarIconLink href='/' icon={HomeIcon} css={hideOnLarge(isRoot)} />
            <NavBarLink href='/' css={hideOnSmall(isRoot)}>
                <Namemail showEmail={showEmail} />
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
