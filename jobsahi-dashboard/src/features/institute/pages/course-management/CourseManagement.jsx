import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuPlus, LuSettings } from 'react-icons/lu'
import { MatrixCard } from '../../../../shared/components/metricCard'
import { PillNavigation } from '../../../../shared/components/navigation'
import { CourseProvider } from '../../context/CourseContext'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import CreateCourse from './CreateCourse'
import ManageCourse from './ManageCourse'

export default function CourseManagement() {
  const navigate = useNavigate()
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const handleCreateCourse = () => {
    navigate('/institute/course-management/create')
  }

  const handleManageCourse = () => {
    navigate('/institute/course-management/manage')
  }

  // Navigation tabs for PillNavigation
  const navigationTabs = [
    {
      id: 'manage-course',
      label: 'Manage Course',
      icon: LuSettings
    },
    {
      id: 'create-course',
      label: 'Create Course',
      icon: LuPlus
    }
  ]

  return (
    <CourseProvider>
      <div className={`p-2 ${TAILWIND_COLORS.BG_PRIMARY} min-h-screen`}>
        {/* Header Section */}
        <div className="mb-6">
          <MatrixCard 
            title="Course Management" 
            subtitle="Manage your courses, create new ones, and track course performance"
            className="mb-4"
          />
        </div>

        {/* Green Navigation Buttons using PillNavigation */}
        <div className="mb-8">
          <PillNavigation 
            tabs={navigationTabs}
            activeTab={activeTabIndex}
            onTabChange={setActiveTabIndex}
            storageKey="institute_course_management_tab"
          />
        </div>

        {/* Content Area */}
        {activeTabIndex === 0 ? (
          <ManageCourse onNavigateToCreateCourse={() => setActiveTabIndex(1)} />
        ) : (
          <CreateCourse />
        )}
      </div>
    </CourseProvider>
  )
}
