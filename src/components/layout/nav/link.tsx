import {css, PropsWithStyle} from "@emotion/react";
import ThemedStyles from "../../../lib/types/css";
import {Link} from "@mui/material";
import {ComponentProps} from "react";

const linksStyle: ThemedStyles = theme => css({
    margin: theme.spacing(0, 1)
})

const NavBarLink = ({children, css, className, ...props}: PropsWithStyle<ComponentProps<typeof Link>>) => (
    // TODO: use next/link
    <Link css={[linksStyle, css]} className={className} typography='h5' {...props}>
        {children}
    </Link>
)

export default NavBarLink
