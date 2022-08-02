import {GetStaticPaths, GetStaticProps} from "next";
import {serialize} from "next-mdx-remote/serialize";
import React, {ComponentProps} from "react";
import BlogPost from "@components/blog/post";
import {getAllPosts, getPost, postMdxOptions} from "@lib/post";

export default BlogPost

type SlugQuery = {slug: string}

export const getStaticPaths: GetStaticPaths<SlugQuery> = async () => {
    const posts = await getAllPosts()
    return {
        paths: posts.map(({slug}) => ({params: {slug}})),
        fallback: false,
    }
}

export const getStaticProps: GetStaticProps<ComponentProps<typeof BlogPost>, SlugQuery> = async (context) => {
    // Lookup Post by slug.
    const posts = await getAllPosts()
    const post = posts.find(({slug}) => slug == context.params?.slug)
    if (post === undefined) {
        return {notFound: true}
    }

    // Fetch document from file system.
    const response = await getPost({relativePath: post._sys.relativePath})
    const mdx = await serialize(response.data.post.body, postMdxOptions)
    return {
        props: {
            mdx,
            data: response,
        }
    }
}
