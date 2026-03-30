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

// Detect if this is an invite/password-reset link (Supabase puts type in URL hash)
function isPasswordSetFlow() {
  const hash = window.location.hash
  return hash.includes('type=invite') || hash.includes('type=recovery')
}

function Root() {
  const [splashDone, setSplashDone] = useState(false)
  const { user, loading } = useAuth()

  // Always show splash first
  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />
  }

  // Invite / password reset flow — show set-password page
  if (isPasswordSetFlow()) {
    return <SetPassword />
  }

  // Still checking session
  if (loading) return null

  // Not logged in → login page
  if (!user) return <Login />

  // Logged in → app
  return <App />
}

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </Provider>,
)
