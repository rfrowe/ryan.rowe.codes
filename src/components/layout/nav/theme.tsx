import {zoomOnHover} from "./icon";
import ThemeSwitcher from "../../theming/switcher";
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
