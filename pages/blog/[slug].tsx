import MdxConfig from "../../mdx.config.mjs";

import {GetStaticPaths, GetStaticProps} from "next";
import {SerializeOptions} from "next-mdx-remote/dist/types";
import {serialize} from "next-mdx-remote/serialize";
import React, {ComponentProps} from "react";
import BlogPost from "@components/blog/post";
import {getAllPosts} from "@lib/post";
import {ExperimentalGetTinaClient} from "@tina/__generated__/types";

export default BlogPost

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getAllPosts()
    return {
        paths: posts.map(({sys: {filename}, data: {slug}}) => {
            return {params: {slug}}
        }),
        fallback: false,
    }
}

const serializeOptions: SerializeOptions = {
    mdxOptions: MdxConfig.options,
}

const tinaClient = ExperimentalGetTinaClient()

export const getStaticProps: GetStaticProps<ComponentProps<typeof BlogPost>> = async (context) => {
    // Lookup Post by slug.
    const posts = await getAllPosts()
    const post = posts.find(post => post.data.slug == context.params?.slug)
    if (post === undefined) {
        return {notFound: true}
    }

    // Fetch document from file system.
    const query = await tinaClient.getPostDocument({relativePath: post.sys.relativePath})
    const mdx = await serialize(query.data.getPostDocument.data.body, serializeOptions)
    return {
        props: {
            mdx,
            query,
        }
    }
}
