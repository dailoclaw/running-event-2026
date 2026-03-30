import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'
import SplashScreen from './components/SplashScreen'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './views/auth/Login'
import SetPassword from './views/auth/SetPassword'

function Root() {
  const [splashDone, setSplashDone] = useState(false)
  const { user, loading, needsPassword } = useAuth()

  if (!splashDone) return <SplashScreen onDone={() => setSplashDone(true)} />

  // If this is an invite or recovery link — always show set password
  // regardless of whether user/session is resolved yet
  if (needsPassword) return <SetPassword />

  if (loading) return null
  if (!user) return <Login />
  return <App />
}

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </Provider>,
)
