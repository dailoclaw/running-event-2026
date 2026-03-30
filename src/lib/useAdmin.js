import { useAuth } from '../context/AuthContext'

// A user is admin if their Supabase user_metadata has role: 'admin'
// Set this in Supabase dashboard: Authentication → Users → click user → Edit → user_metadata: {"role":"admin"}
export function useAdmin() {
  const { user } = useAuth()
  return user?.user_metadata?.role === 'admin'
}
