import React, { useState, useEffect, useCallback } from 'react'
import { MatrixCard, Horizontal4Cards } from '../../../../shared/components/metricCard.jsx'
import { PillNavigation } from '../../../../shared/components/navigation.jsx'
import ConversionReports from './ConversionReports.jsx'
import HiringFunnel from './HiringFunnel.jsx'
import CompletionRates from './CompletionRates.jsx'
import CoursePerformance from './CoursePerformance.jsx'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant.js'
import { getMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl'
import { 
  LuEye,
  LuFileText,
  LuUsers,
  LuCheck,
  LuActivity,
  LuTrendingUp,
  LuBookOpen,
  LuTarget
} from 'react-icons/lu'

export default function ReportAnalytics() {
  const [activeTab, setActiveTab] = useState(0)
  const [metricsData, setMetricsData] = useState([
    {
      title: 'Total Visits',
      value: '0',
      icon: <LuEye size={20} />
    },
    {
      title: 'Applications',
      value: '0',
      icon: <LuFileText size={20} />
    },
    {
      title: 'Active Recruiters',
      value: '0',
      icon: <LuUsers size={20} />
    },
    {
      title: 'Successful Hires',
      value: '0',
      icon: <LuCheck size={20} />
    }
  ])
  const [loading, setLoading] = useState(true)

  // Format number with commas
  const formatNumber = (num) => {
    if (!num) return '0'
    return Number(num).toLocaleString('en-IN')
  }

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getMethod({
        apiUrl: apiService.adminDashboard
      })

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      if (isSuccess && response?.data) {
        const cards = response.data.cards || {}
        const placementFunnel = response.data.placement_funnel || {}

        // Update metrics
        setMetricsData([
          {
            title: 'Total Visits',
            value: formatNumber(cards.total_visits || cards.total_students || '0'),
            icon: <LuEye size={20} />
          },
          {
            title: 'Applications',
            value: formatNumber(cards.applied_jobs || placementFunnel.applications || '0'),
            icon: <LuFileText size={20} />
          },
          {
            title: 'Active Recruiters',
            value: formatNumber(cards.active_employers || cards.total_employers || '0'),
            icon: <LuUsers size={20} />
          },
          {
            title: 'Successful Hires',
            value: formatNumber(placementFunnel.hired || cards.hired || '0'),
            icon: <LuCheck size={20} />
          }
        ])
      }
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Navigation tabs for different report types (with icons)
  const navigationTabs = [
    {
      id: 'conversion',
      label: 'Conversion Reports',
      icon: LuActivity
    },
    {
      id: 'hiring',
      label: 'Hiring Funnel',
      icon: LuTrendingUp
    },
    {
      id: 'completion',
      label: 'Completion Rates',
      icon: LuTarget
    },
    {
      id: 'performance',
      label: 'Course Performance',
      icon: LuBookOpen
    }
  ]

  return (
    <div className="space-y-5">
      {/* Title Card */}
      <MatrixCard 
        title="Reports & Analytics Center"
        subtitle="Comprehensive insights and performance metrics for your job portal"
        titleColor={TAILWIND_COLORS.TEXT_PRIMARY}
        subtitleColor={TAILWIND_COLORS.TEXT_MUTED}
        className=""
      />

      {/* Horizontal 4 Cards */}
      <Horizontal4Cards 
        data={metricsData}
        className=""
      />

      {/* Navigation Buttons */}
      <div className="flex justify-center">
        <PillNavigation 
          tabs={navigationTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          storageKey="admin_reports_analytics_tab"
          className=""
        />
      </div>

      {/* Conditional Content Based on Active Tab */}
      {activeTab === 0 && <ConversionReports />}
      {activeTab === 1 && <HiringFunnel />}
      {activeTab === 2 && <CompletionRates />}
      {activeTab === 3 && <CoursePerformance />}
    </div>
  )
}