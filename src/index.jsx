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

// Check for invite/recovery in URL hash at load time
const hash = window.location.hash
const hashParams = new URLSearchParams(hash.replace('#', ''))
const IS_PASSWORD_FLOW = ['invite', 'recovery'].includes(hashParams.get('type'))

function Root() {
  const [splashDone, setSplashDone] = useState(false)
  const { user, loading } = useAuth()

  // Keep splash visible until both splash timer AND auth check are done
  if (!splashDone || loading) return <SplashScreen onDone={() => setSplashDone(true)} />

  // Invite or password reset link — go straight to set-password
  if (IS_PASSWORD_FLOW) return <SetPassword />

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
