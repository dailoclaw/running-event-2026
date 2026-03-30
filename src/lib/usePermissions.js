import { useProfile } from '../context/ProfileContext'

// Role hierarchy: admin > member > viewer
// admin  — full access: edit contacts, drops, campaigns, settings, users, import
// member — edit contacts, drops, campaigns; no settings/import/users
// viewer — view only: no editing, no delete, no campaigns, no import

export function usePermissions() {
  const { profile } = useProfile()
  const role = profile?.role || 'viewer'

  return {
    role,
    isAdmin:   role === 'admin',
    isMember:  role === 'member' || role === 'admin',
    isViewer:  true, // everyone can view

    canEditContacts:   role === 'admin' || role === 'member',
    canDeleteContacts: role === 'admin' || role === 'member',
    canManageDrops:    role === 'admin' || role === 'member',
    canManageCampaigns: role === 'admin' || role === 'member',
    canImport:         role === 'admin',
    canManageSettings: role === 'admin',
    canManageUsers:    role === 'admin',
  }
}
