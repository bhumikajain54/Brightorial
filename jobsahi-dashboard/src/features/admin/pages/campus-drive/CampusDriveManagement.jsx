import React, { useState } from 'react'
import { PillNavigation } from '../../../../shared/components/navigation'
import { LuCalendar, LuList, LuFileText, LuTrendingUp } from 'react-icons/lu'
import DriveList from './components/DriveList'
import CreateDrive from './components/CreateDrive'
import DriveDetails from './components/DriveDetails'
import ApplicationsList from './components/ApplicationsList'
import ApplicationStats from './components/ApplicationStats'

export default function CampusDriveManagement() {
  const [activeTab, setActiveTab] = useState(0)

  // Navigation tabs configuration
  const campusDriveTabs = [
    {
      id: 'drives',
      label: 'All Drives',
      icon: LuList
    },
    {
      id: 'create',
      label: 'Create Drive',
      icon: LuCalendar
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: LuFileText
    },
    {
      id: 'stats',
      label: 'Statistics',
      icon: LuTrendingUp
    }
  ]

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <PillNavigation 
          tabs={campusDriveTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          storageKey="admin_campus_drive_tab"
        />
      </div>

      {/* Active Component */}
      {activeTab === 0 && <DriveList />}
      {activeTab === 1 && <CreateDrive />}
      {activeTab === 2 && <ApplicationsList />}
      {activeTab === 3 && <ApplicationStats />}
    </div>
  )
}

