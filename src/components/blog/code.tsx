import {useThemeMode} from "@components/theming";
import {css} from "@emotion/react";
import React from "react"
import {Prism as SyntaxHighlighter, SyntaxHighlighterProps} from "react-syntax-highlighter"
import {materialDark as light, materialOceanic as dark} from "react-syntax-highlighter/dist/cjs/styles/prism"

export const CodeBlock = ({children, ...props}: SyntaxHighlighterProps) => {
    const [mode] = useThemeMode()
    const style = mode === 'light' ? light : dark

    return (
        <SyntaxHighlighter
            css={theme => css({
                boxShadow: theme.shadows[3],
                borderRadius: '10px',
            })}
            showLineNumbers={true}
            style={style}
            {...props}
        >
            {children}
        </SyntaxHighlighter>
    )
}
