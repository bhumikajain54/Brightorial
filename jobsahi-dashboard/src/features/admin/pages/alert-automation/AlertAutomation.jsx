import React, { useMemo, useState, useEffect, useCallback } from 'react'
import MetricCard, { MatrixCard, Horizontal4Cards } from '../../../../shared/components/metricCard.jsx'
import { PrimaryButton, OutlineButton } from '../../../../shared/components/Button.jsx'
import { PillNavigation } from '../../../../shared/components/navigation.jsx'
import { COLORS, TAILWIND_COLORS } from '../../../../shared/WebConstant.js'
import ExpiryReminder from './ExpiryReminder.jsx'
import AutoFlagging from './AutoFlagging.jsx'
import ResumeFeedback from './ResumeFeedback.jsx'
import CourseAlerts from './CourseAlerts.jsx'
import { getMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl'

// Navigation tabs configuration
const navigationTabs = [
  { id: 'expiry', label: 'Expiry Reminders', icon: () => <span className="text-lg">⏰</span> },
  { id: 'auto-flag', label: 'Auto Flagging', icon: () => <span className="text-lg">➕</span> },
  { id: 'resume', label: 'Resume Feedback', icon: () => <span className="text-lg">💬</span> },
  { id: 'course', label: 'Course Alerts', icon: () => <span className="text-lg">📊</span> },
]

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-30`}
      style={{ backgroundColor: checked ? COLORS.GREEN_PRIMARY : '#D1D5DB' }}
    >
      <span
        className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
    <span className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{label}</span>
  </label>
)

const AlertsAutomation = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [alertMetrics, setAlertMetrics] = useState([
    { title: "Active Alerts", value: "0", icon: "⚠️" },
    { title: "Automation Rules", value: "0", icon: "⚙️" },
    { title: "Flagged Items", value: "0", icon: "🚩" },
    { title: "Success Rate", value: "0%", icon: "✅" }
  ])
  const [loading, setLoading] = useState(true)

  // Fetch metrics data
  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch flagged jobs
      const flagsResponse = await getMethod({
        apiUrl: apiService.getJobFlags
      })
      
      // Fetch employers
      const employersResponse = await getMethod({
        apiUrl: apiService.employersList
      })
      
      // Fetch institutes
      const institutesResponse = await getMethod({
        apiUrl: apiService.institutesList
      })

      // Calculate flagged items
      let flaggedCount = 0
      if (flagsResponse?.status === true || flagsResponse?.status === 'success' || flagsResponse?.success === true) {
        let flagsArray = []
        if (flagsResponse?.data?.flags && Array.isArray(flagsResponse.data.flags)) {
          flagsArray = flagsResponse.data.flags
        } else if (Array.isArray(flagsResponse?.data)) {
          flagsArray = flagsResponse.data
        } else if (Array.isArray(flagsResponse?.flags)) {
          flagsArray = flagsResponse.flags
        }
        
        // Count pending flags
        flaggedCount = flagsArray.filter(flag => {
          const adminAction = (flag.admin_action || '').toLowerCase()
          const reviewed = flag.reviewed === 1 || flag.reviewed === true
          return adminAction !== 'approved' && !reviewed
        }).length
      }

      // Calculate expiring plans (next 30 days)
      let expiringPlans = 0
      const today = new Date()
      const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      // Check employers
      if (employersResponse?.status === true || employersResponse?.status === 'success' || employersResponse?.success === true) {
        const employers = Array.isArray(employersResponse?.data) ? employersResponse.data : []
        expiringPlans += employers.filter(emp => {
          if (emp.profile?.subscription_expiry || emp.subscription_expiry) {
            const expiryDate = new Date(emp.profile?.subscription_expiry || emp.subscription_expiry)
            return expiryDate >= today && expiryDate <= thirtyDaysLater
          }
          return false
        }).length
      }
      
      // Check institutes
      if (institutesResponse?.status === true || institutesResponse?.status === 'success' || institutesResponse?.success === true) {
        const institutes = Array.isArray(institutesResponse?.data) ? institutesResponse.data : []
        expiringPlans += institutes.filter(inst => {
          if (inst.institute_info?.subscription_expiry || inst.subscription_expiry) {
            const expiryDate = new Date(inst.institute_info?.subscription_expiry || inst.subscription_expiry)
            return expiryDate >= today && expiryDate <= thirtyDaysLater
          }
          return false
        }).length
      }

      // Calculate active alerts
      const activeAlerts = flaggedCount + expiringPlans

      // Calculate automation rules (count enabled toggles - default 2 for now)
      const automationRules = 2

      // Calculate success rate (if we have reviewed flags)
      let successRate = 0
      if (flagsResponse?.status === true || flagsResponse?.status === 'success' || flagsResponse?.success === true) {
        let flagsArray = []
        if (flagsResponse?.data?.flags && Array.isArray(flagsResponse.data.flags)) {
          flagsArray = flagsResponse.data.flags
        } else if (Array.isArray(flagsResponse?.data)) {
          flagsArray = flagsResponse.data
        } else if (Array.isArray(flagsResponse?.flags)) {
          flagsArray = flagsResponse.flags
        }
        
        const totalFlags = flagsArray.length
        const reviewedFlags = flagsArray.filter(flag => {
          const reviewed = flag.reviewed === 1 || flag.reviewed === true
          return reviewed
        }).length
        
        if (totalFlags > 0) {
          successRate = Math.round((reviewedFlags / totalFlags) * 100)
        }
      }

      // Update metrics
      setAlertMetrics([
        { title: "Active Alerts", value: String(activeAlerts), icon: "⚠️" },
        { title: "Automation Rules", value: String(automationRules), icon: "⚙️" },
        { title: "Flagged Items", value: String(flaggedCount), icon: "🚩" },
        { title: "Success Rate", value: `${successRate}%`, icon: "✅" }
      ])
    } catch (error) {
      // Error handling - keep default values
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const renderActiveTab = () => {
    switch (activeTab) {
      case 0:
        return <ExpiryReminder />
      case 1:
        return <AutoFlagging />
      case 2:
        return <ResumeFeedback />
      case 3:
        return <CourseAlerts />
      default:
        return <ExpiryReminder />
    }
  }

  return (
    <div className="space-y-6">
      <MatrixCard 
        title="Alerts & Automation"
        subtitle="Manage automated alerts, flagging system, and notification workflows"
      />

      <Horizontal4Cards data={alertMetrics} />

      <div className="flex justify-center">
        <PillNavigation 
          tabs={navigationTabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          storageKey="admin_alerts_automation_tab"
        />
      </div>

      {renderActiveTab()}
    </div>
  )
}

export default AlertsAutomation


