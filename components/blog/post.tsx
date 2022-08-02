import mdxComponents from "@components/blog/markdown"
import PageTemplate from "@components/layout/template"
import {css} from "@emotion/react"
import ThemedStyles from "@lib/types/css"
import {MDXRemote, MDXRemoteSerializeResult} from "next-mdx-remote"
import {serialize} from "next-mdx-remote/serialize"
import React, {useEffect, useMemo, useRef, useState} from "react"
import {GetPostDocumentQuery, GetPostDocumentQueryVariables,} from "@tina/__generated__/types"
import {useTina} from "tinacms/dist/edit-state"

interface Query<VType, DType> {
    query: string,
    variables: VType
    data: DType
}

interface Props {
    mdx: MDXRemoteSerializeResult
    query: Query<GetPostDocumentQueryVariables, GetPostDocumentQuery>
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
    const {data: {getPostDocument: {data: {body: markdown, ...metadata}}}} = useTina(props.query)

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
