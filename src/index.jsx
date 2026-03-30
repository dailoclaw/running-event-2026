import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'
import SplashScreen from './components/SplashScreen'

function Root() {
  const [splashDone, setSplashDone] = useState(false)
  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <div style={{ visibility: splashDone ? 'visible' : 'hidden' }}>
        <App />
      </div>
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <Root />
  </Provider>,
)
