import Head from "next/head";
import {PropsWithChildren} from "react";
import NavBar from "@components/layout/nav";
import styles from '@styles/Home.module.css'

interface Props {
    title?: string
}

const LayoutTemplate = ({
    title = 'Ryan Rowe Codes',
    children
}: PropsWithChildren<Props>) => (
    <div className={styles.container}>
        <Head>
            <title>{title}</title>
            <link rel='icon' href='/favicon.ico' />
        </Head>

        <main className={styles.main}>
            <NavBar />
            {children}
        </main>
    </div>
)

export default LayoutTemplate
