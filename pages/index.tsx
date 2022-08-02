import ConsoleTypist from "@components/console";
import PageTemplate from "@components/layout/template";
import { css } from '@emotion/react';
import {getAllPosts} from '@lib/post';
import {isDefined, notNull} from '@lib/util'
import {Post} from '@tina/__generated__/types'

import {NextPage, GetStaticProps} from 'next'
import {useCallback, useMemo, useState} from "react";
import ThemedStyles from "@lib/types/css";
import {Box, Link, Typography} from "@mui/material";

type PostWithHeadline = Omit<Post, 'headline'> & {
    headline: NonNullable<Post['headline']>
}

interface Headline {
    text: string
    color: string
    href?: string
}

interface Props {
    headlines: Headline[]
}

const defaultHeadline: Headline = {
    text: "Absolutely Nothing.",
    color: "#000000",
}

export const getStaticProps: GetStaticProps<Props> = async () => {
    const posts = await getAllPosts()

    const headlines: Headline[] = posts
        .filter((post): post is PostWithHeadline => isDefined(post.headline) && notNull(post.headline))
        .map(post => {
            return {
                text: post.headline,
                color: '#000000',
                href: `/blog/${post.slug}`,
            }
        })
        .filter(notNull) || [defaultHeadline]

    return {
        props: {
            headlines
        }
    }
}

const containerStyle: ThemedStyles = theme => css({
    alignItems: 'stretch',
    [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
    }
})

const headlineStyle: ThemedStyles = theme => css({
    fontFamily: 'monospace',
    textDecorationLine: 'none'
})

const linkStyle: ThemedStyles = theme => css({
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

const Home: NextPage<Props> = ({headlines}: Props) => {
    const [index, setIndex] = useState(0)
    const advanceHeadline = useCallback(() => setIndex(i => i + 1), [])

    const headline = useMemo(() => {
        const headline = headlines[index % headlines.length]

        return (
            <Link href={headline.href} css={headlineStyle}>
                <ConsoleTypist css={linkStyle} text={headline.text} onTypingFinished={advanceHeadline} />
            </Link>
        )
    }, [headlines, index])

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
