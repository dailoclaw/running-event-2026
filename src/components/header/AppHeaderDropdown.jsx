import React from 'react'
import {
  CDropdown, CDropdownDivider, CDropdownHeader,
  CDropdownItem, CDropdownMenu, CDropdownToggle,
} from '@coreui/react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const AppHeaderDropdown = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#FF4D4D', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#fff',
        }}>
          <CIcon icon={cilUser} />
        </div>
      </CDropdownToggle>

      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          {user?.email || 'Account'}
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
