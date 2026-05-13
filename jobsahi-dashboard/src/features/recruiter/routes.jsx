import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import RecruiterLayout from './components/RecruiterLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import JobManagement from './pages/job-management/JobManagement.jsx'
import CandidateManagement from './pages/candidate-management/CandidateManagement.jsx'
import InterviewScheduler from './pages/interview-scheduler/InterviewScheduler.jsx'
import SkillTest from './pages/skilltest/SkillTest.jsx'
import MessageNotification from './pages/message-notification/MessageNotification.jsx'
import AnalyticsReports from './pages/AnalyticsReports.jsx'
import CompanyProfile from './pages/company-profile/CompanyProfile.jsx'
import RecruiterProfile from '../../shared/auth/AdminProfile.jsx'

export default function RecruiterRoutes() {
  return (
    <Routes>
      <Route element={<RecruiterLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="job-management" element={<JobManagement />} />
        <Route path="candidate-management" element={<CandidateManagement />} />
        <Route path="interview-scheduler" element={<InterviewScheduler />} />
        <Route path="skill-test" element={<SkillTest />} />
        <Route path="message-notification" element={<MessageNotification />} />
        <Route path="analytics-reports" element={<AnalyticsReports />} />
        <Route path="company-profile" element={<CompanyProfile />} />
        <Route path="profile" element={<RecruiterProfile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  )
}