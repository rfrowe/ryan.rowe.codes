import MdxConfig from "../../mdx.config.mjs";
import PageTemplate from "@components/layout/template";
import {getAllPosts} from "@lib/post";
import {
    ExperimentalGetTinaClient,
    GetPostDocumentQuery,
    GetPostDocumentQueryVariables,
} from "@tina/__generated__/types";

import {GetStaticPaths, GetStaticProps} from "next";
import {MDXRemote, MDXRemoteSerializeResult} from "next-mdx-remote";
import {SerializeOptions} from "next-mdx-remote/dist/types";
import {serialize} from "next-mdx-remote/serialize";
import React, {
    ComponentProps,
    PropsWithChildren,
    ReactElement, useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {useTina} from "tinacms/dist/edit-state";
import {IconButton, Link, Typography} from "@mui/material";
import {MDXComponents} from "mdx/types";
import {css} from "@emotion/react";
import ThemedStyles from "@lib/types/css";
import {useThemeMode} from "@components/theming";
import dynamic from "next/dynamic";
import {SyntaxHighlighterProps} from "react-syntax-highlighter";
import {materialOceanic as dark, materialDark as light} from 'react-syntax-highlighter/dist/cjs/styles/prism';
import AssignmentIcon from '@mui/icons-material/Assignment';

const SyntaxHighlighter = dynamic(async () => (await import('react-syntax-highlighter')).Prism)

const client = ExperimentalGetTinaClient()

interface Props {
    mdx: MDXRemoteSerializeResult
    query: Query<GetPostDocumentQueryVariables, GetPostDocumentQuery>
}

interface Query<VType, DType> {
    query: string,
    variables: VType
    data: DType
}

const templateStyle: ThemedStyles = theme => css({
    marginTop: theme.spacing(5),
    marginLeft: '20%',
    marginRight: '20%',
    alignItems: 'stretch',
    [theme.breakpoints.down('xl')]: {
        marginLeft: '15%',
        marginRight: '15%',
    },
    [theme.breakpoints.down('lg')]: {
        marginLeft: '10%',
        marginRight: '10%',
    },
    [theme.breakpoints.down('md')]: {
        marginLeft: '5%',
        marginRight: '5%',
    },
    [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
    }
})

const BlogPost = (props: Props) => {
    const { data: { getPostDocument: { data: { body: markdown, ...metadata }}} } = useTina(props.query)

    const init = useRef(false)
    const [mdx, setMdx] = useState(props.mdx)
    useEffect(() => {
        if (init.current) {
            import("next-mdx-remote/serialize").then(({serialize}) => serialize(markdown)).then(setMdx)
        } else {
            init.current = true
        }
    }, [markdown])

    const content = useMemo(() => {
        return <MDXRemote {...mdx} scope={{...metadata, markdown: markdown}} components={components} />
    }, [mdx, markdown, metadata])

    return (
        <PageTemplate
            title={metadata.title}
            css={templateStyle}
        >
            {content}
        </PageTemplate>
    )
}

export default BlogPost

type IntrinsicProps<T extends keyof JSX.IntrinsicElements> = Omit<JSX.IntrinsicElements[T], 'ref'>

type IntrinsicComponents = keyof JSX.IntrinsicElements extends infer U
    ? (U extends keyof JSX.IntrinsicElements
        ? {[K in U]: (props: IntrinsicProps<K>) => JSX.Element}
        : never)
    : never

const overrides: IntrinsicComponents = {
    // TODO: use next/link
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
}

const PreTag = ({children, onCopyToClipboard, ...props}: IntrinsicProps<'pre'> & {onCopyToClipboard: () => void}) => (
    <pre {...props}>
        <IconButton css={theme => css({
            float: 'right',
        })} onClick={onCopyToClipboard}>
            <AssignmentIcon />
        </IconButton>
        {children}
    </pre>
)

const CodeBlock = (props: SyntaxHighlighterProps) => {
    const [mode] = useThemeMode()
    const style = mode === 'light' ? light : dark;

    const {children: contents} = props;
    const clipboardText = useMemo(() =>
        typeof contents === 'string' ? contents : contents.join('\n'),
        [contents]);
    const copyToClipboard = useCallback(() => navigator.clipboard.writeText(clipboardText), [clipboardText])

    const FooPreTag = useCallback((props: IntrinsicProps<'pre'>) => <PreTag {...props} onCopyToClipboard={copyToClipboard} />, [copyToClipboard])
    return (
        <SyntaxHighlighter
            PreTag={FooPreTag}
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

const components: MDXComponents = {
    ...overrides,
    CodeBlock,
    pre: ({children, ...props}: PropsWithChildren<Omit<ComponentProps<typeof SyntaxHighlighter>, 'children'>>) => {
        const inner = children as ReactElement<IntrinsicProps<'code'>>
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
    },
}

const serializeOptions: SerializeOptions = {
    mdxOptions: MdxConfig.options,
    parseFrontmatter: false,
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
    // Lookup Post by slug.
    const posts = await getAllPosts()
    const post = posts.find(post => post.data.slug == context.params?.slug)
    if (post === undefined) {
        return { notFound: true }
    }

    // Fetch document from file system.
    const query = await client.getPostDocument({relativePath: post.sys.relativePath})
    const mdx = await serialize(query.data.getPostDocument.data.body, serializeOptions)
    return {
        props: {
            mdx,
            query,
        }
    }
}

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getAllPosts()
    return {
        paths: posts.map(({sys: {filename}, data: {slug}}) => {
            return { params: { slug } }
        }),
        fallback: false,
    }
}
