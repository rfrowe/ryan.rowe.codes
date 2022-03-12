import {findDuplicate, isDefined, notNull} from "@lib/util";
import {ExperimentalGetTinaClient} from "@tina/__generated__/types";

const client = ExperimentalGetTinaClient()

export class DuplicatePostError extends Error {
    constructor(slug: string) {
        super(`slug ${slug}`);
        this.name = 'DuplicatePostError'
    }
}

export const getAllPosts = () => client
    .getPostList()
    .then(({data}) => data.getPostList.edges?.map(e => e?.node))
    .then(posts => posts?.filter(isDefined).filter(notNull) || [])
    .then(posts => {
        const dupe = findDuplicate(posts.map(p => p.data.slug))
        if (dupe != null) {
            throw new DuplicatePostError(dupe.value)
        }
        return posts
    })
