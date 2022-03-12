import MdxConfig from "../../mdx.config.mjs";
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
import {useEffect, useMemo, useRef, useState} from "react";
import {useTina} from "tinacms/dist/edit-state";

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

function SinglePost(props: Props) {
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

    return useMemo(() => {
        return <MDXRemote {...mdx} scope={{...metadata}}/>
    }, [mdx, metadata])
}

export default SinglePost

const serializeOptions: SerializeOptions = {
    mdxOptions: MdxConfig.options,
    parseFrontmatter: true,
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
