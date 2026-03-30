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

  // Always show splash first
  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />
  }

  // Still resolving session
  if (loading) return null

  // User is logged in via invite/reset link — must set password before continuing
  if (user && needsPassword) {
    return <SetPassword />
  }

  // Not logged in → login
  if (!user) return <Login />

  // Logged in with password already set → app
  return <App />
}

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </Provider>,
)
