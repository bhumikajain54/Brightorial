import React, { useState } from 'react'
import { PillNavigation, MANAGEMENT_TABS } from '../../../../shared/components/navigation'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import StudentManagement from './StudentManagement'
import EmployerManagement from './employer-management/EmployerManagement'
import InstituteManagement from './institute-management/InstituteManagement'

// Active Tab Content Component
function ActiveTabContent({ activeTab }) {
  switch (activeTab) {
    case 0:
      return <StudentManagement />
    case 1:
      return <EmployerManagement />
    case 2:
      return <InstituteManagement />
    default:
      return <StudentManagement />
  }
}

export default function Management() {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex)
  }

  // Debug: Check authentication status
  React.useEffect(() => {
    const token = localStorage.getItem("authToken")
    console.log('🔐 Auth Token Status:', token ? 'Present' : 'Missing')
    console.log('🔐 Token Value:', token ? `${token.substring(0, 20)}...` : 'No token')
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="mb-6">
        <h1 className={`text-3xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>Management Dashboard</h1>
        <p className={TAILWIND_COLORS.TEXT_MUTED}>Manage candidates, recruiters, and skill partners from one place.</p>
      </div> */}

      {/* Navigation using shared component */}
      <PillNavigation 
        tabs={MANAGEMENT_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        storageKey="admin_management_tab"
      />

      {/* Active Component */}
      <ActiveTabContent activeTab={activeTab} />
    </div>
  )
}


