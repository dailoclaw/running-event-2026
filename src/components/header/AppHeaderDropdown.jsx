import { useState, useEffect } from 'react'
import {
  CDropdown, CDropdownDivider, CDropdownHeader,
  CDropdownItem, CDropdownMenu, CDropdownToggle,
} from '@coreui/react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const AppHeaderDropdown = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [user])

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Account'

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="avatar"
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #FF4D4D' }}
          />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#FF4D4D', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <CIcon icon={cilUser} />
          </div>
        )}
      </CDropdownToggle>

      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          {displayName}
          {profile?.full_name && (
            <div className="small text-muted fw-normal">{user?.email}</div>
          )}
        </CDropdownHeader>

        <CDropdownItem style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem style={{ cursor: 'pointer', color: '#dc3545' }} onClick={signOut}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Sign Out
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
