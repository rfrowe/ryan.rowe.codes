import DynamicTina from "@components/tina/dynamic"
import '@styles/globals.css'

import type { AppProps } from 'next/app'

function App({ Component, pageProps }: AppProps) {
  return (
      <DynamicTina>
        <Component {...pageProps} />
      </DynamicTina>
  )
}

export default App
