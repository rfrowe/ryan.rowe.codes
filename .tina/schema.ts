import {defineSchema} from 'tinacms';

export default defineSchema({
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
                    ui: {
                        component: 'markdown'
                    },
                },
            ],
        },
    ],
})
