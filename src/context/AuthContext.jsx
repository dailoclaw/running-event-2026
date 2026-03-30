import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { IS_PASSWORD_FLOW } from '../lib/authFlow'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // If the page loaded with an invite/recovery hash, we must force set-password
  const [needsPassword, setNeedsPassword] = useState(IS_PASSWORD_FLOW)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'PASSWORD_RECOVERY') {
        setNeedsPassword(true)
      }
      if (event === 'USER_UPDATED') {
        setNeedsPassword(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = async () => {
    setNeedsPassword(false)
    return supabase.auth.signOut()
  }

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#type=recovery`,
    })

  const updatePassword = async (password) => {
    const result = await supabase.auth.updateUser({ password })
    if (!result.error) setNeedsPassword(false)
    return result
  }

  return (
    <AuthContext.Provider value={{ user, loading, needsPassword, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
