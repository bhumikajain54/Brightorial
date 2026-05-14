import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LuPlus, LuSettings } from 'react-icons/lu'
import { MatrixCard } from '../../../../shared/components/metricCard'
import { PillNavigation } from '../../../../shared/components/navigation'
import { CourseProvider } from '../../context/CourseContext'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import CreateCourse from './CreateCourse'
import ManageCourse from './ManageCourse'

export default function CourseManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  
  // Check if we're on the create course route
  const isCreateRoute = location.pathname.includes('/create')

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
        <div className="mb-8 flex justify-center">
          <PillNavigation 
            tabs={navigationTabs}
            activeTab={isCreateRoute ? 1 : 0}
            onTabChange={(index) => {
              setActiveTabIndex(index)
              if (index === 1) {
                navigate('/institute/course-management/create')
              } else {
                navigate('/institute/course-management')
              }
            }}
            storageKey="institute_course_management_tab"
          />
        </div>

        {/* Content Area */}
        {isCreateRoute ? (
          <CreateCourse />
        ) : (
          <ManageCourse onNavigateToCreateCourse={() => navigate('/institute/course-management/create')} />
        )}
      </div>
    </CourseProvider>
  )
}
