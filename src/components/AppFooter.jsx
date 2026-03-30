import React from 'react'
import { CFooter } from '@coreui/react'

const VERSION = '1.5.0'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <span className="fw-semibold">Running Event</span>
        <span className="ms-2 text-muted small">v{VERSION}</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
