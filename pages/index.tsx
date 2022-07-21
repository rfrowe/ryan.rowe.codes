import ConsoleTypist from "@components/console";
import LayoutTemplate from "@components/layout/template";
import { css } from '@emotion/react';
import {getAllPosts} from '@lib/post';
import {isDefined, notNull} from '@lib/util'
import styles from '@styles/Home.module.css'
import {Post} from '@tina/__generated__/types'

import {NextPage, GetStaticProps} from 'next'
import {useCallback, useMemo, useState} from "react";

type PostWithHeadline = Post & {
    headline: NonNullable<string>
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
    const query = await getAllPosts()
    const posts: Post[] = query.map(result => result.data)

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

const Home: NextPage<Props> = ({headlines}: Props) => {
    const [index, setIndex] = useState(0)
    const advanceHeadline = useCallback(() => setIndex(i => i + 1), [])

    const headline = useMemo(() => {
        const headline = headlines[index % headlines.length]

        return (
            <a href={headline.href} css={css({fontFamily: 'monospace'})}>
                <ConsoleTypist text={headline.text} onTypingFinished={advanceHeadline} />
            </a>
        )
    }, [headlines, index])

    return (
        <LayoutTemplate>
            <h1 className={styles.title}>
                Ryan <br/>
                Rowe <br/>
                Codes
            </h1>
            <h3>
                {headline}
            </h3>
        </LayoutTemplate>
    )
}

export default Home
