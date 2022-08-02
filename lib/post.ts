import {findDuplicate, isDefined, notNull} from "@lib/util";
import {ExperimentalGetTinaClient, PostConnectionQueryVariables, PostQueryVariables} from "@tina/__generated__/types";
import {SerializeOptions} from "next-mdx-remote/dist/types";
import MdxConfig from "../mdx.config.mjs";

const tinaClient = ExperimentalGetTinaClient()

export const postMdxOptions: SerializeOptions = {
    mdxOptions: MdxConfig.options,
}

export class DuplicatePostError extends Error {
    constructor(slug: string) {
        super(`slug ${slug}`);
        this.name = 'DuplicatePostError'
    }
}

export const getAllPosts = (query: PostConnectionQueryVariables = {}) => tinaClient
    .postConnection(query)
    .then((props) => props.data.postConnection.edges?.map(e => e?.node))
    .then(posts => posts?.filter(isDefined).filter(notNull) || [])
    .then(posts => {
        const dupe = findDuplicate(posts.map(p => p.slug))
        if (dupe != null) {
            throw new DuplicatePostError(dupe.value)
        }
        return posts
    })

export const getPost = (query: PostQueryVariables) => tinaClient
    .post(query)
