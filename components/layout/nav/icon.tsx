import NavBarLink from "@components/layout/nav/link";
import {css} from "@emotion/react";
import {IconButton, SvgIcon} from "@mui/material";
import {ComponentProps, useState} from "react";
import ThemedStyles from "@lib/types/css";

interface Props extends ComponentProps<typeof NavBarLink> {
    icon: typeof SvgIcon
}

export const zoomOnHover: ThemedStyles = theme => css({
    '> *': {
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    '&:hover > *': {
        transform: 'scale(1.1)',
    }
})

const NavBarIconLink = ({icon: Icon, ...props}: Props) => {

    return (
        <NavBarLink {...props} css={theme => css({margin: theme.spacing(0, 0.5)})}>
            <IconButton css={zoomOnHover} >
                <Icon />
            </IconButton>
        </NavBarLink>
    )
}

export default NavBarIconLink
