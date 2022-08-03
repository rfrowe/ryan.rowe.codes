import overrides from "@components/blog/overrides";
import {MDXProviderComponents} from "@mdx-js/react";
import React from "react"

const mdxComponents: MDXProviderComponents = {
    ...overrides,
    // pre: PreBlock,
}

export default mdxComponents
