import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [needsPassword, setNeedsPassword] = useState(false)

  useEffect(() => {
    // Capture URL hash immediately before Supabase clears it
    const hash = window.location.hash
    const isInvite = hash.includes('type=invite')
    const isRecovery = hash.includes('type=recovery')
    if (isInvite || isRecovery) {
      sessionStorage.setItem('authFlow', isInvite ? 'invite' : 'recovery')
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      // Fired when invite link or password reset link is clicked
      if (event === 'SIGNED_IN') {
        const flow = sessionStorage.getItem('authFlow')
        if (flow === 'invite' || flow === 'recovery') {
          setNeedsPassword(true)
        }
      }

      if (event === 'PASSWORD_RECOVERY') {
        setNeedsPassword(true)
      }

      if (event === 'USER_UPDATED') {
        // Password was set — clear the flag
        setNeedsPassword(false)
        sessionStorage.removeItem('authFlow')
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = async () => {
    setNeedsPassword(false)
    sessionStorage.removeItem('authFlow')
    return supabase.auth.signOut()
  }

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#type=recovery`,
    })

  const updatePassword = (password) =>
    supabase.auth.updateUser({ password })

  return (
    <AuthContext.Provider value={{ user, loading, needsPassword, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
