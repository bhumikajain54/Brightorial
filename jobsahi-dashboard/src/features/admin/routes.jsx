import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import AdminLayout from './components/AdminLayout.jsx'
import Dashboard from './pages/Home.jsx'
import Management from './pages/Management/Management.jsx'
import JobCourseControl from './pages/job-course-control/JobCourseControl.jsx'
import BusinessRevenue from './pages/business-revenue/BusinessRevenue.jsx'
import ReportAnalytics from './pages/reports-analytics/ReportAnalytics.jsx'
import MessagingCampaigns from './pages/messaging-campaigns/MessagingCampaignsControl.jsx'
import AlertsAutomation from './pages/alert-automation/AlertAutomation.jsx'
import SystemSetting from './pages/system-setting/SystemSetting.jsx'
import AdminTools from './pages/tools-logs/AdminTools.jsx'
import AdminProfile from '../../shared/auth/AdminProfile.jsx'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="management" element={<Management />} />
        <Route path="job-control" element={<JobCourseControl />} />
        <Route path="business-panel" element={<BusinessRevenue />} />
        <Route path="reports" element={<ReportAnalytics />} />
        <Route path="messaging-campaigns" element={<MessagingCampaigns />} />
        <Route path="alerts-automation" element={<AlertsAutomation />} />
        <Route path="settings" element={<SystemSetting />} />
        <Route path="tools-logs" element={<AdminTools />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  )
}
