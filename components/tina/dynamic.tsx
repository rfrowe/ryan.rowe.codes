import { TinaEditProvider } from 'tinacms/dist/edit-state'

import dynamic from 'next/dynamic'
import {TinaCMSProviderProps} from "tinacms";
const TinaProvider = dynamic(() => import('@components/tina/provider'), { ssr: false })

const DynamicTina = ({ children }: Pick<TinaCMSProviderProps, 'children'>) => {
    return (
        <>
            <TinaEditProvider editMode={<TinaProvider>{children}</TinaProvider>}>
                {children}
            </TinaEditProvider>
        </>
    )
}

export default DynamicTina
