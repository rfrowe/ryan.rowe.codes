import mdxComponents from "@components/blog/markdown"
import PageTemplate from "@components/layout/template"
import {css} from "@emotion/react"
import ThemedStyles from "@lib/types/css"
import {MDXRemote, MDXRemoteSerializeResult} from "next-mdx-remote"
import {serialize} from "next-mdx-remote/serialize"
import React, {useEffect, useMemo, useRef, useState} from "react"
import {ExperimentalGetTinaClient, Post, PostQuery} from "@tina/__generated__/types"
import {useTina} from "tinacms/dist/edit-state"
import {SerializeOptions} from "next-mdx-remote/dist/types";
import MdxConfig from "../../mdx.config.mjs";

type Resolve<T extends Promise<any>> = T extends Promise<infer U> ? U : never;

type PostQueryResult = Resolve<ReturnType<ReturnType<typeof ExperimentalGetTinaClient>['post']>>

interface Props {
    mdx: MDXRemoteSerializeResult
    data: PostQueryResult
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

export const serializeOptions: SerializeOptions = {
    mdxOptions: MdxConfig.options,
}

const BlogPost = (props: Props) => {
    const {data: {post: {body: markdown, ...metadata}}} = useTina(props.data)

    const init = useRef(false)
    const [mdx, setMdx] = useState(props.mdx)
    useEffect(() => {
        if (init.current) {
            import("next-mdx-remote/serialize").then(({serialize}) => serialize(markdown, serializeOptions)).then(setMdx)
        } else {
            init.current = true
        }
    }, [markdown])

    const content = useMemo(() => {
        return <MDXRemote {...mdx} scope={{...metadata, markdown: markdown}} components={mdxComponents}/>
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
