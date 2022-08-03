import {css} from "@emotion/react";
import {Theme} from "@mui/material";

type Styles = ReturnType<typeof css>

type ThemedStyles = (theme: Theme) => Styles

export default ThemedStyles
