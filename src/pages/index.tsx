import ConsoleTypist from "@components/console";
import Seo from "@components/seo";
import PageTemplate from "@components/layout/template";
import { css } from '@emotion/react';
import {graphql, PageProps} from "gatsby";
import ThemedStyles from "@lib/types/css";
import {isDefined, notNull} from '@lib/util'
import {Box, Link, Typography} from "@mui/material";
import {useCallback, useMemo, useState} from "react";

type Element<T extends readonly unknown[]> = T extends readonly (infer U)[] ? U : never

type RequiredNotNull<T> = {[K in keyof T]: NonNullable<T[K]>}

type Post = RequiredNotNull<NonNullable<Element<Queries.GetAllPostsQuery['allMdx']['nodes']>['frontmatter']>>

const defaultPost: Post = {
    headline: "Absolutely Nothing.",
    slug: '',
}

const containerStyle: ThemedStyles = theme => css({
    alignItems: 'stretch',
    [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
    }
})

const headlineStyle = css({
    fontFamily: 'monospace',
    textDecorationLine: 'none'
})

const linkStyle = css({
    textDecorationLine: 'underline',
    textDecorationColor: 'inherit',
})

const bannerMargin: ThemedStyles = theme => css({
    marginLeft: '10%',
    [theme.breakpoints.down('md')]: {
        marginLeft: 'unset',
        marginTop: '10%',
        '&:not(:first-of-type)': {
            marginTop: 'unset',
        }
    }
})

const bannerStyle: ThemedStyles = theme => css({
    flexGrow: 1,
    flexBasis: 0,
    boxShadow: theme.shadows[10],
    position: 'relative', // necessary for boxShadow
    paddingTop: '10%',
    [theme.breakpoints.down('md')]: {
        paddingTop: 'unset',
        paddingLeft: '10%',
    }
})

const imageStyle: ThemedStyles = theme => css({
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    backgroundColor: theme.palette.primary.main,
})

const Home = ({data}: PageProps<Queries.GetAllPostsQuery>) => {
    const [index, setIndex] = useState(0)
    const advanceHeadline = useCallback(() => setIndex(i => i + 1), [])

    const posts = useMemo(
        () => data
                .allMdx
                .nodes
                .map(node => node.frontmatter)
                .filter((post): post is Post => notNull(post) && isDefined(post.headline) && notNull(post.headline))
            || [defaultPost],
        [data]
    )

    const headline = useMemo(() => {
        const post = posts[index % posts.length]

        return (
            <Link href={post.slug ? `/blog/${post.slug}` : ''} css={headlineStyle}>
                <ConsoleTypist css={linkStyle} text={post.headline} onTypingFinished={advanceHeadline} />
            </Link>
        )
    }, [posts, index])

    return (
        <PageTemplate css={containerStyle}>
            <Box css={bannerStyle}>
                <Typography variant='h1' css={bannerMargin}>
                    Ryan <br/>
                    Rowe <br/>
                    Codes
                </Typography>
                <Typography variant='h3' css={bannerMargin}>
                    {headline}
                </Typography>
            </Box>
            {/* TODO: use a real image here. */}
            <Box css={imageStyle} />
        </PageTemplate>
    )
}

export default Home

export const query = graphql`
    query GetAllPosts {
        allMdx {
            nodes {
                frontmatter {
                    headline
                    slug
                }
            }
        }
    }
`

export const Head = () => <Seo title='ryan.rowe.codes' />
