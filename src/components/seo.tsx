import React, {PropsWithChildren} from "react";

interface Props extends PropsWithChildren<{}> {
    title: string
}

const Seo = ({title, children}: Props) =>
    <>
        <title>{title}</title>
        <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'/>
        {children}
    </>

export default Seo
