import { tinaConfig } from '../../tina.config'

import TinaCMS from 'tinacms'
import {TinaCMSProviderDefaultProps} from "tinacms/dist/tina-cms";

// Importing the TinaProvider directly into your page will cause Tina to be added to the production bundle.
// Instead, import the tina/provider/index default export to have it dynamially imported in edit-moode
/**
 *
 * @private Do not import this directly, please import the dynamic provider instead
 */

const TinaProvider = ({ children }: Pick<TinaCMSProviderDefaultProps, 'children'>) => {
    return <TinaCMS {...tinaConfig as TinaCMSProviderDefaultProps}>{children as any}</TinaCMS>
}

export default TinaProvider
