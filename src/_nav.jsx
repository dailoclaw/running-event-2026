import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilPeople,
  cilEnvelopeLetter,
  cilEnvelopeOpen,
  cilMap,
  cilCloudUpload,
  cilSettings,
  cilUser,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

// Base nav — always visible
export const baseNav = [
  {
    component: CNavTitle,
    name: '2026 Adelaide Marathon',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Contacts & Outreach',
  },
  {
    component: CNavItem,
    name: 'All Contacts',
    to: '/contacts',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Letterbox Drops',
    to: '/letterbox',
    icon: <CIcon icon={cilEnvelopeLetter} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Email Campaigns',
    to: '/email',
    icon: <CIcon icon={cilEnvelopeOpen} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Event',
  },
  {
    component: CNavItem,
    name: 'Route Map',
    to: '/map',
    icon: <CIcon icon={cilMap} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Account',
  },
  {
    component: CNavItem,
    name: 'Profile',
    to: '/profile',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
]

// Admin-only nav items
export const adminNav = [
  {
    component: CNavTitle,
    name: 'Admin',
  },
  {
    component: CNavItem,
    name: 'Import Data',
    to: '/import',
    icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Settings',
    to: '/settings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
]

// Default export — base only (AppSidebar will merge admin items if needed)
const _nav = baseNav
export default _nav
