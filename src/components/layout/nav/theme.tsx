import {zoomOnHover} from "@components/layout/nav/icon";
import ThemeSwitcher from "@components/theming/switcher";
import {css} from "@emotion/react";

const NavBarThemeSwitcher = () => (
    <ThemeSwitcher
        css={[
            zoomOnHover,
            theme => css({
                color: theme.palette.action.active,
                margin: theme.spacing(0, 0.5),
            })
        ]}
    />
)

export default NavBarThemeSwitcher
