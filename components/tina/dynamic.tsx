import { TinaEditProvider } from 'tinacms/dist/edit-state'

import dynamic from 'next/dynamic'
import {TinaCMSProviderDefaultProps} from "tinacms/dist/tina-cms";
const TinaProvider = dynamic(() => import('@components/tina/provider'), { ssr: false })

const DynamicTina = ({ children }: Pick<TinaCMSProviderDefaultProps, 'children'>) => {
    return (
        <>
            <TinaEditProvider editMode={<TinaProvider>{children}</TinaProvider>}>
                {children}
            </TinaEditProvider>
        </>
    )
}

export default DynamicTina
