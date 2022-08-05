import {css} from "@emotion/react"
import {Link} from "gatsby-theme-material-ui";
import {Typography} from "@mui/material"
import React from "react"

export type IntrinsicProps<T extends keyof JSX.IntrinsicElements> = Omit<JSX.IntrinsicElements[T], 'ref'>

// This complicated type allows for inference of correct value typing based on key.
type IntrinsicComponents = keyof JSX.IntrinsicElements extends infer U
    ? (U extends keyof JSX.IntrinsicElements
        ? {[K in U]: (props: IntrinsicProps<K>) => JSX.Element}
        : never)
    : never

const overrides: IntrinsicComponents = {
    a: props => <Link {...props} />,
    h1: props => <Typography variant='h1' {...props} />,
    h2: props => <Typography variant='h2' {...props} />,
    h3: props => <Typography variant='h3' {...props} />,
    h4: props => <Typography variant='h4' {...props} />,
    h5: props => <Typography variant='h5' {...props} />,
    h6: props => <Typography variant='h6' {...props} />,
    p: props => (
        <Typography
            variant='body1'
            css={theme => css({
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(2)
            })}
            {...props}
        />
    ),
    // pre: PreBlock,
}

export default overrides
