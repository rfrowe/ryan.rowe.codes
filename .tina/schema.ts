import {defineConfig, defineSchema} from 'tinacms';

const schema = defineSchema({
    collections: [
        {
            label: 'Blog Posts',
            name: 'post',
            path: 'content/blog',
            format: 'mdx',
            fields: [
                {
                    type: 'string',
                    label: 'Title',
                    name: 'title',
                    required: true,
                },
                {
                    type: 'string',
                    label: 'Slug',
                    name: 'slug',
                    required: true,
                },
                {
                    type: 'datetime',
                    label: 'Created At',
                    name: 'created_at',
                    required: true,
                },
                {
                    type: 'string',
                    label: 'Headline',
                    name: 'headline',
                },
                {
                    type: 'string',
                    label: 'Blog Post Body',
                    name: 'body',
                    isBody: true,
                    required: true,
                    // ui: {
                    //     component: 'markdown'
                    // },
                },
            ],
        },
    ],
})

export default schema

const branch = 'main'

const apiURL =
    process.env.NODE_ENV == 'development'
        ? 'http://localhost:4001/graphql'
        : `https://content.tinajs.io/content/${process.env.NEXT_PUBLIC_TINA_CLIENT_ID}/github/${branch}`

export const tinaConfig = defineConfig({
    apiURL,
    schema,
    // TODO: figure something else out for this
    // cmsCallback: (cms) => {
    //     import('react-tinacms-editor').then((field)=> {
    //         cms.plugins.add(field.MarkdownFieldPlugin)
    //     })
    //     // This won't work until the following issue is fixed:
    //     // https://github.com/tinacms/tinacms/issues/2684
    //     import('tinacms').then(({RouteMappingPlugin}) => {
    //         const RouteMapping = new RouteMappingPlugin(async (collection: Collection, document: DocumentSys) => {
    //             if (["post"].includes(collection.name)) {
    //                 return import('@tina/__generated__/types').then(({ExperimentalGetTinaClient}) => {
    //                     const client = ExperimentalGetTinaClient()
    //
    //                     const post = await client.getPostDocument({relativePath: document.sys.relativePath})
    //                     const slug = post.data.getPostDocument.data.slug
    //
    //                     return `/${collection.name}/${slug}`
    //                 })
    //             }
    //
    //             return undefined
    //         })
    //
    //         cms.plugins.add(RouteMapping)
    //     })
    //     return cms
    // }
});

