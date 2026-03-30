import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'
import SplashScreen from './components/SplashScreen'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './views/auth/Login'

function Root() {
  const [splashDone, setSplashDone] = useState(false)
  const { user, loading } = useAuth()

  // Show splash first, always
  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />
  }

  // Auth loading (checking existing session)
  if (loading) return null

  // Not logged in → show login page
  if (!user) return <Login />

  // Logged in → show the app
  return <App />
}

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </Provider>,
)
