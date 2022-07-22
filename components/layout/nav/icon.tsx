import NavBarLink from "@components/layout/nav/link";
import {css} from "@emotion/react";
import {IconButton, SvgIcon} from "@mui/material";
import {ComponentProps} from "react";

interface Props extends ComponentProps<typeof NavBarLink> {
    icon: typeof SvgIcon
}

const NavBarIconLink = ({icon: Icon, ...props}: Props) => (
    <NavBarLink {...props} css={theme => css({margin: theme.spacing(0, 0.5)})}>
        <IconButton>
            <Icon />
        </IconButton>
    </NavBarLink>
)

export default NavBarIconLink
