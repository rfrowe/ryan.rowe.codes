import remarkGfm from 'remark-gfm'
import remarkMdxCodeMeta from 'remark-mdx-code-meta'

const MdxConfig = {
    extension: /\.mdx?$/,
    /** @type {import('@mdx-js/loader').Options} */
    options: {
        remarkPlugins: [
            remarkGfm,
            remarkMdxCodeMeta,
        ],
        rehypePlugins: [],
    },
}

export default MdxConfig
