import React, { useState, useEffect } from 'react'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import { PillNavigation } from '../../../../shared/components/navigation'
import { LuUsers, LuBuilding2, LuGraduationCap } from 'react-icons/lu'
import StudentManagement from './StudentManagement'
import EmployerManagement from './employer-management/EmployerManagement'
import InstituteManagement from './institute-management/InstituteManagement'

export default function Management() {
  const [activeTab, setActiveTab] = useState(0)

  // Navigation tabs configuration
  const managementTabs = [
    {
      id: 'student',
      label: 'Student Management',
      icon: LuUsers
    },
    {
      id: 'employer',
      label: 'Employer Management',
      icon: LuBuilding2
    },
    {
      id: 'institute',
      label: 'Skill Partner Management',
      icon: LuGraduationCap
    }
  ]

  // Debug: Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    console.log('🔐 Auth Token Status:', token ? 'Present' : 'Missing')
    console.log('🔐 Token Value:', token ? `${token.substring(0, 20)}...` : 'No token')
  }, [])

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <PillNavigation 
          tabs={managementTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          storageKey="admin_management_tab"
        />
      </div>

      {/* Active Component */}
      {activeTab === 0 && <StudentManagement />}
      {activeTab === 1 && <EmployerManagement />}
      {activeTab === 2 && <InstituteManagement />}
    </div>
  )
}
