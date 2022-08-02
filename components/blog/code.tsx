import {IntrinsicProps} from "@components/blog/overrides";
import {useThemeMode} from "@components/theming";
import {css} from "@emotion/react";
import dynamic from "next/dynamic";
import React, {PropsWithChildren} from "react"
import {SyntaxHighlighterProps} from "react-syntax-highlighter"
import {materialDark as light, materialOceanic as dark} from "react-syntax-highlighter/dist/cjs/styles/prism"

// Shouldn't need to be async, but it does...
const SyntaxHighlighter = dynamic(async () => (await import('react-syntax-highlighter')).Prism)

export const CodeBlock = (props: SyntaxHighlighterProps) => {
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
        />
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
