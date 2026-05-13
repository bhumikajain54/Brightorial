import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LuUsers, 
  LuGraduationCap,
  LuBookOpen,
  LuTrendingUp
} from 'react-icons/lu'
import { Horizontal4Cards, MatrixCard } from '../../../../shared/components/metricCard'
import { PillNavigation } from '../../../../shared/components/navigation'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import StudentCompletion from './StudentCompletion'
import CoursePopularity from './CoursePopularity'
import { getMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl'

export default function ReportsAnalytics() {
  const navigate = useNavigate()
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  // ✅ State for Key Metrics
  const [metrics, setMetrics] = useState({
    total_students: 0,
    completion_rate: 0,
    total_courses: 0,
    active_batches: 0
  })

  // ✅ Fetch metrics once
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await getMethod({ apiUrl: apiService.INSTITUTE_REPORT })
        if (res?.status && res?.data?.metrics) {
          setMetrics({
            total_students: res.data.metrics.total_students ?? 0,
            completion_rate: res.data.metrics.completion_rate ?? 0,
            total_courses: res.data.metrics.total_courses ?? 0,
            active_batches: res.data.metrics.active_batches ?? 0
          })
        } else {
        }
      } catch (err) {
      }
    }
    fetchMetrics()
  }, [])

  // ✅ Dynamic key metrics for UI (no UI change)
  const keyMetrics = [
    {
      title: 'Total Students',
      value: metrics.total_students,
      delta: '+15% from last month',
      icon: <LuUsers className="w-5 h-5" />
    },
    {
      title: 'Completion Rate',
      value: metrics.completion_rate,
      delta: '+8% from last month',
      icon: <LuGraduationCap className="w-5 h-5" />
    },
    {
      title: 'All Courses',
      value: metrics.total_courses,
      delta: '+2 from last month',
      icon: <LuBookOpen className="w-5 h-5" />
    },
    {
      title: 'Active Batches',
      value: metrics.active_batches,
      delta: '+5% from last month',
      icon: <LuTrendingUp className="w-5 h-5" />
    }
  ]

  // ✅ Tabs for navigation (unchanged UI)
  const navigationTabs = [
    {
      id: 'student-completion',
      label: 'Student Completion',
      icon: LuUsers
    },
    {
      id: 'course-popularity',
      label: 'Course Popularity',
      icon: LuUsers
    }
  ]

  return (
    <div className="p-2 bg-[#F6FAFF] min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <MatrixCard 
          title="Reports & Analytics" 
          subtitle="Comprehensive insights and performance metrics for your institute"
          titleColor={TAILWIND_COLORS.TEXT_PRIMARY}
          subtitleColor={TAILWIND_COLORS.TEXT_MUTED}
          className="mb-4"
        />
      </div>

      {/* Key Metrics Section */}
      <div className="mb-6">
        <Horizontal4Cards data={keyMetrics} />
      </div>

      {/* Green Navigation Buttons using PillNavigation */}
      <div className="mb-8">
        <PillNavigation 
          tabs={navigationTabs}
          activeTab={activeTabIndex}
        onTabChange={setActiveTabIndex}
        storageKey="institute_reports_analytics_tab"
        />
      </div>

      {/* Content Area */}
      {activeTabIndex === 0 ? (
        <StudentCompletion />
      ) : (
        <CoursePopularity />
      )}
    </div>
  )
}
