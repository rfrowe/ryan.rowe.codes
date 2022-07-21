import Head from "next/head";
import {PropsWithChildren} from "react";
import NavBar from "@components/layout/nav";
import {css} from "@emotion/react";

interface Props {
    title?: string
}

const mainStyle = css({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
})

const PageTemplate = ({
    title = 'Ryan Rowe Codes',
    children
}: PropsWithChildren<Props>) => (
    <>
        <Head>
            <title>{title}</title>
            <link rel='icon' href='/favicon.ico' />
        </Head>

        <main css={mainStyle}>
            <NavBar />
            {children}
        </main>
    </>
)

export default PageTemplate
