import React from "react";
import {css, PropsWithStyle} from "@emotion/react";
import {useTheme} from "@mui/material";
import {PropsWithChildren, useEffect, useMemo, useState} from "react";

interface Props {
    showEmail: boolean
    transitionSpeedMs?: number
}

const Inline = ({css: style, className, children}: PropsWithChildren<PropsWithStyle>) =>
    <span css={[css({display: 'inline-block'}), style]} className={className}>{children}</span>

const Namemail = ({showEmail, transitionSpeedMs}: Props) => {
    const theme = useTheme()
    const transitionSpeed = useMemo(
        () => transitionSpeedMs || theme.transitions.duration.shorter,
        [theme, transitionSpeedMs]
    )

    const [hideDot, setHideDot] = useState(showEmail)
    useEffect(() => {
        const timer = setTimeout(() => setHideDot(showEmail), transitionSpeed / 2)
        return () => clearTimeout(timer)
    }, [showEmail, setHideDot, transitionSpeed])

    // TODO: the existence of the @ span when hidden causes copied text to be "ryan .rowe.codes"
    return (
        <>
            {'ryan'}

            {/*The @ symbol is shown immediately via transition. */}
            <Inline
                css={theme => css({
                    display: 'inline-block',
                    width: showEmail ? '1em' : 0,
                    overflowX: 'clip',
                    transition: theme.transitions.create('width', {
                        duration: transitionSpeed,
                        easing: theme.transitions.easing.sharp,
                    }),
                    userSelect: 'none',
                })}
            >
                @
            </Inline>

            {/* This dot will be hidden during the transition to show the @ symbol to mask its sudden disappearance. */}
            <Inline
                css={css({
                    overflowX: 'clip',
                    width: hideDot ? 0 : 'unset',
                })}
            >
                .
            </Inline>

            {'rowe'}
            <Inline>.</Inline>
            {'codes'}
        </>)
}

export default Namemail