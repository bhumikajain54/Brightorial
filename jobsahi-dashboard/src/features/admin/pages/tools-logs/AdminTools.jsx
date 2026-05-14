import React, { useState } from 'react'
import { MatrixCard } from '../../../../shared/components/metricCard.jsx'
import { PillNavigation } from '../../../../shared/components/navigation.jsx'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant.js'
import ActivityLogs from './ActivityLogs.jsx'
import ErrorLogs from './ErrorLogs.jsx'
import MessageLogs from './MessageLogs.jsx'
import RoleManagement from './RoleManagement.jsx'
import { 
  LuActivity,
  LuX,
  LuMessageSquare,
  LuUsers
} from 'react-icons/lu'

export default function AdminTools() {
  const [activeTab, setActiveTab] = useState(0)

  // Navigation tabs for different admin tools (with icons)
  const adminToolsTabs = [
    {
      id: 'activity',
      label: 'Activity Logs',
      icon: LuActivity
    },
    {
      id: 'error',
      label: 'Error Logs',
      icon: LuX
    },
    {
      id: 'message',
      label: 'Message Logs',
      icon: LuMessageSquare
    },
    {
      id: 'role',
      label: 'Role Management',
      icon: LuUsers
    }
  ]

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <MatrixCard 
        title="Admin Tools & Logs"
        subtitle="Comprehensive logging system and administrative tools for monitoring, debugging, managing your job portal platform"
        titleColor={TAILWIND_COLORS.TEXT_PRIMARY}
        subtitleColor={TAILWIND_COLORS.TEXT_MUTED}
        className=""
      />

      {/* Navigation Buttons */}
      {/* <div className=" "> */}
        {/* <PillNavigation 
          tabs={adminToolsTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          storageKey="admin_tools_logs_tab"
          className=""
        /> */}
      {/* </div> */}

      {/* Conditional Content Based on Active Tab */}
      {/* {activeTab === 0 && <ActivityLogs />} */}
      <ActivityLogs />
      {/* {activeTab === 1 && <ErrorLogs />} */}
      {/* {activeTab === 2 && <MessageLogs />} */}
      {/* {activeTab === 3 && <RoleManagement />} */}

    </div>
  )
}
