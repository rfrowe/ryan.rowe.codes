import {CodeBlock, PreBlock} from "@components/blog/code"
import overrides from "@components/blog/overrides"
import {MDXComponents} from "mdx/types"
import React from "react"

const mdxComponents: MDXComponents = {
    ...overrides,
    CodeBlock,
    pre: PreBlock,
}

export default mdxComponents
