import { tinaConfig } from '../../tina.config'

import TinaCMS, {TinaCMSProviderProps} from 'tinacms'

// Importing the TinaProvider directly into your page will cause Tina to be added to the production bundle.
// Instead, import the tina/provider/index default export to have it dynamially imported in edit-moode
/**
 *
 * @private Do not import this directly, please import the dynamic provider instead
 */
const TinaProvider = ({ children }: Pick<TinaCMSProviderProps, 'children'>) => {
    return <TinaCMS {...tinaConfig as unknown}>{children}</TinaCMS>
}

export default TinaProvider
