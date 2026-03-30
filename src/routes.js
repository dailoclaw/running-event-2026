import React from 'react'

const Dashboard    = React.lazy(() => import('./views/marathon/Dashboard'))
const Contacts     = React.lazy(() => import('./views/marathon/Contacts'))
const Letterbox    = React.lazy(() => import('./views/marathon/Letterbox'))
const EmailCamps   = React.lazy(() => import('./views/marathon/EmailCampaigns'))
const RouteMap     = React.lazy(() => import('./views/marathon/RouteMap'))
const ImportData   = React.lazy(() => import('./views/marathon/ImportData'))
const Settings     = React.lazy(() => import('./views/marathon/Settings'))
const Profile      = React.lazy(() => import('./views/auth/Profile'))

const routes = [
  { path: '/',          exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard',       element: Dashboard  },
  { path: '/contacts',  name: 'Contacts',        element: Contacts   },
  { path: '/letterbox', name: 'Letterbox Drops', element: Letterbox  },
  { path: '/email',     name: 'Email Campaigns', element: EmailCamps },
  { path: '/map',       name: 'Route Map',       element: RouteMap   },
  { path: '/import',    name: 'Import Data',     element: ImportData },
  { path: '/settings',  name: 'Settings',        element: Settings   },
  { path: '/profile',   name: 'Profile',         element: Profile    },
]

export default routes
