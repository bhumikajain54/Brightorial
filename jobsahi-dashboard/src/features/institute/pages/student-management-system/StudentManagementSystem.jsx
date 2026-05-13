import React, { useState } from 'react'
import { LuPlus, LuUsers, LuBookOpen, LuTrendingUp, LuMessageSquare, LuEye } from 'react-icons/lu'
import { MatrixCard } from '../../../../shared/components/metricCard'
import { PillNavigation } from '../../../../shared/components/navigation'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import ViewStudents from './ViewStudents'
// import AddStudents from './AddStudents'
import AssignCourse from './AssignCourse'
// import TrackProgress from './TrackProgress'
import SendMessages from './SendMessages'

export default function StudentManagementSystem() {
  const [activeTab, setActiveTab] = useState(0)
  const [previousTab, setPreviousTab] = useState(null)

  // Navigation tabs configuration
  const navigationTabs = [
    {
      id: 'view-students',
      label: 'View Students',
      icon: LuUsers
    },
    // {
    //   id: 'add-students',
    //   label: 'Add Students',
    //   icon: LuPlus
    // },
    {
      id: 'assign-course',
      label: 'Assign Course/Batch',
      icon: LuBookOpen
    },
    // {
    //   id: 'track-progress',
    //   label: 'Track Progress',
    //   icon: LuTrendingUp
    // },
    {
      id: 'send-messages',
      label: 'Send Messages',
      icon: LuMessageSquare
    }
  ]

  const handleTabChange = (index) => {
    if (index === activeTab) return
    setPreviousTab(activeTab)
    setActiveTab(index)
  }

  const handleReturnToPreviousTab = () => {
    setActiveTab(previousTab ?? 0)
  }

  return (
    <div className={`p-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
      {/* Header Section with MatrixCard */}
      <div className="mb-5">
        <MatrixCard 
          title="Student Management System"
          subtitle="Manage student enrollments, track progress, and communicate effectively"
          className="mb-6"
        />
      </div>

      {/* Navigation Buttons with PillNavigation */}
      <div className="flex justify-center">
        <PillNavigation 
          tabs={navigationTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          storageKey="institute_student_management_tab"
          className="w-full max-w-4xl"
        />
      </div>

      {/* Conditional Content Rendering */}
      <div className={`mt-6 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
        {activeTab === 0 && <ViewStudents />}
        {/* {activeTab === 1 && <AddStudents />} */}
        {activeTab === 1 && <AssignCourse />}
        {/* {activeTab === 3 && <TrackProgress />} */}
        {activeTab === 2 && <SendMessages onComingSoonClose={handleReturnToPreviousTab} />}
        {/* Add other tab components here as needed */}
      </div>
    </div>
  )
}
