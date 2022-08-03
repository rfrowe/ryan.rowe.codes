import type {IntrinsicProps} from "./overrides";
import {useThemeMode} from "../theming";
import {css} from "@emotion/react";
import React, {PropsWithChildren, ComponentType} from "react"
import {Prism, SyntaxHighlighterProps} from "react-syntax-highlighter"
import {materialDark as light, materialOceanic as dark} from "react-syntax-highlighter/dist/cjs/styles/prism"

// TODO: for some reason, SyntaxHighlighter is incorrectly typed
const SyntaxHighlighter = Prism as ComponentType<SyntaxHighlighterProps>

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

type PreBlockProps = PropsWithChildren<Omit<SyntaxHighlighterProps, 'children'>>

export const PreBlock = ({children, ...props}: PreBlockProps) => {
    const inner = children as React.ReactElement<IntrinsicProps<'code'>>
    const match = /language-(\w+)/.exec(inner.props.className || '')
    const language = match ? match[1] : undefined

    return (
        <CodeBlock
            language={language}
            {...props}
        >
            {inner.props.children as string}
        </CodeBlock>
    )
}
