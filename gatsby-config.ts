import type { GatsbyConfig } from "gatsby";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const config: GatsbyConfig = {
    siteMetadata: {
        title: `ryan.rowe.codes`,
        siteUrl: `https://ryan.rowe.coodes`
    },
    // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
    // If you use VSCode you can also use the GraphQL plugin
    // Learn more at: https://gatsby.dev/graphql-typegen
    graphqlTypegen: {
        typesOutputPath: 'gatsby-types.d.ts'
    },
    plugins: [
        `gatsby-plugin-typescript`,
        `gatsby-plugin-tsconfig-paths`,
        `gatsby-plugin-emotion`,
        {
            resolve: `gatsby-plugin-mdx`,
            options: {
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
                gatsbyRemarkPlugins: [
                    {
                        resolve: `gatsby-remark-prismjs`,
                        options: {
                            showLineNumbers: true,
                        }
                    }
                ],
            },
        },
        `gatsby-plugin-material-ui`,
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `content`,
                path: `${__dirname}/src/content`,
            },
        },
    ]
};

export default config;
