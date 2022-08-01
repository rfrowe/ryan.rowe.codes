import remarkGfm from 'remark-gfm'

const MdxConfig = {
    extension: /\.mdx?$/,
    /** @type {import('@mdx-js/loader').Options} */
    options: {
        remarkPlugins: [
            remarkGfm,
        ],
        rehypePlugins: [],
    },
}

export default MdxConfig
