import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import InstituteLayout from './components/InstituteLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CourseManagement from './pages/course-management/CourseManagement.jsx'
import CreateCourse from './pages/course-management/CreateCourse.jsx'
import StudentManagement from './pages/student-management-system/StudentManagementSystem.jsx'
import BatchManagement from './pages/batch-management/BatchManagement.jsx'
import CertificateCom from './pages/certificates-completion/CertificatesCompletion.jsx'
import PlacementCollab from './pages/placement-collab/PlacementCompletion.jsx'
import MessagingAlert from './pages/messaging-alerts/MessagingAlerts.jsx'
import ReportAnalytics from './pages/reports-analytics/ReportsAnalytics.jsx'
import ProfileSetting from './pages/profile-setting/ProfileSetting.jsx'
import InstituteProfile from './pages/profile-setting/InstituteProfile.jsx'
import StaffManagement from './pages/profile-setting/StaffManagement.jsx'
import NotificationPreferences from './pages/profile-setting/NotificationPreferences.jsx'
import Message from './pages/batch-management/Message.jsx'
import { CourseProvider } from './context/CourseContext'

export default function InstituteRoutes() {
  return (
    <Routes>
      <Route element={<InstituteLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="course-management" element={<CourseManagement />} />
        <Route path="course-management/create" element={<CourseProvider><CreateCourse /></CourseProvider>} />
        <Route path="student-management" element={<StudentManagement />} />
        <Route path="batch-management" element={<BatchManagement />} />
        <Route path="certificates-completion" element={<CertificateCom />} />
        <Route path="placement-collab" element={<PlacementCollab />} />
        <Route path="messaging-alerts" element={<MessagingAlert />} />
        <Route path="reports-analytics" element={<ReportAnalytics />} />
        <Route path="profile-setting" element={<ProfileSetting />} />
        <Route path="profile-setting/institute-profile" element={<InstituteProfile />} />
        <Route path="profile-setting/staff-management" element={<StaffManagement />} />
        <Route path="profile-setting/notification-preferences" element={<NotificationPreferences />} />
        <Route path="message" element={<Message />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  )
}