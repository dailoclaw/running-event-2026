import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'
import SplashScreen from './components/SplashScreen'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProfileProvider } from './context/ProfileContext'
import Login from './views/auth/Login'
import SetPassword from './views/auth/SetPassword'

// Read hash ONCE at load time before anything clears it
const hash = window.location.hash
const hashParams = new URLSearchParams(hash.replace('#', ''))
const IS_PASSWORD_FLOW = ['invite', 'recovery'].includes(hashParams.get('type'))

function Root() {
  // Persist across navigation — only show splash once per browser session
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('splashDone') === 'true'
  )
  const { user, loading } = useAuth()

  const handleSplashDone = () => {
    sessionStorage.setItem('splashDone', 'true')
    setSplashDone(true)
  }

  // 1. Show splash only on first visit this session
  if (!splashDone) {
    return <SplashScreen onDone={handleSplashDone} />
  }

  // 2. Splash done — now wait for auth check (show nothing, splash already gone)
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#1F3864',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #FF4D4D', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // 3. Invite or reset link — must set password
  if (IS_PASSWORD_FLOW) return <SetPassword />

  // 4. Not logged in
  if (!user) return <Login />

  // 5. All good — show app wrapped in profile context
  return <ProfileProvider><App /></ProfileProvider>
}

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </Provider>,
)
