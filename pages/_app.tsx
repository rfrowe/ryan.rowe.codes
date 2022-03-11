import '@styles/globals.css'
import type { AppProps } from 'next/app'
import Tina from '@tina/components/TinaProvider'

function App({ Component, pageProps }: AppProps) {
  return (
      <Tina>
        <Component {...pageProps} />
      </Tina>
  )
}

export default App
