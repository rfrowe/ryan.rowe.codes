import dynamic from 'next/dynamic'
const TinaProvider = dynamic(() => import('@components/tina/provider'), { ssr: false })
import { TinaEditProvider } from 'tinacms/dist/edit-state'

const DynamicTina = ({ children }) => {
    return (
        <>
            <TinaEditProvider editMode={<TinaProvider>{children}</TinaProvider>}>
                {children}
            </TinaEditProvider>
        </>
    )
}

export default DynamicTina
