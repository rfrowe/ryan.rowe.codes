import Head from "next/head";
import {PropsWithChildren} from "react";
import NavBar from "@components/layout/nav";
import {css} from "@emotion/react";
import {Box} from "@mui/material";

interface Props {
    title?: string
}

const containerStyle = css({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
})

const mainStyle = css({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
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


        <Box css={containerStyle}>
            <NavBar />
            <main css={mainStyle}>
                {children}
            </main>
        </Box>

    </>
)

export default PageTemplate
