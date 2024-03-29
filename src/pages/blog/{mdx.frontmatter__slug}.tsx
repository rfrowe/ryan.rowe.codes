import mdxComponents from "@components/blog/markdown";
import PageTemplate from "@components/layout/template";
import {css} from "@emotion/react";
import {graphql, HeadProps, PageProps} from "gatsby";
import {MDXRenderer} from "gatsby-plugin-mdx";
import ThemedStyles from "@lib/types/css";
import {MDXProvider} from "@mdx-js/react"
import {Typography} from "@mui/material";
import Seo from "@components/seo";

const templateStyle: ThemedStyles = theme => css({
    marginTop: theme.spacing(5),
    marginLeft: '20%',
    marginRight: '20%',
    alignItems: 'stretch',
    [theme.breakpoints.down('xl')]: {
        marginLeft: '15%',
        marginRight: '15%',
    },
    [theme.breakpoints.down('lg')]: {
        marginLeft: '10%',
        marginRight: '10%',
    },
    [theme.breakpoints.down('md')]: {
        marginLeft: '5%',
        marginRight: '5%',
    },
    [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
    }
})

const Post = (props: PageProps<Queries.GetSinglePostQuery>) =>
    <PageTemplate
        css={templateStyle}
    >
        <MDXProvider components={mdxComponents}>
            <Typography variant='h1'>{props.data.mdx!.frontmatter?.title}</Typography>
            <MDXRenderer {...props.data.mdx!.frontmatter} source={props.data.mdx!.rawBody}>
                {props.data.mdx!.body}
            </MDXRenderer>
        </MDXProvider>
    </PageTemplate>

export default Post

export const query = graphql`
    query GetSinglePost($id: String) {
        mdx(id: {eq: $id}) {
            body
            rawBody
            frontmatter {
                slug
                title
                headline
                created_at
            }
        }
    }
`

export const Head = (props: HeadProps<Queries.GetSinglePostQuery>) =>
    <Seo title={props.data.mdx!.frontmatter!.title} />
