import {css, PropsWithStyle} from "@emotion/react";
import {Link} from "gatsby-theme-material-ui";
import ThemedStyles from "@lib/types/css";
import {ComponentProps} from "react";

const linksStyle: ThemedStyles = theme => css({
    margin: theme.spacing(0, 1)
})

const NavBarLink = ({children, css, className, ...props}: PropsWithStyle<ComponentProps<typeof Link>>) => (
    <Link css={[linksStyle, css]} className={className} typography='h5' {...props}>
        {children}
    </Link>
)

export default NavBarLink
