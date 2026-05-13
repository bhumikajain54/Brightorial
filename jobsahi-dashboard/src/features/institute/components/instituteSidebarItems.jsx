import React from 'react'
import {
  LuLayoutDashboard,
  LuBookOpen,
  LuUsers,
  LuMessageSquare,
  LuSettings,
  LuFileText,
  LuGraduationCap,
} from 'react-icons/lu'
import { FiPieChart } from 'react-icons/fi'

const Icon = {
  Dashboard: <LuLayoutDashboard size={20} />,
  CourseManagement: <LuBookOpen size={20} />,
  StudentManagement: <LuUsers size={20} />,
  MessagingAlerts: <LuMessageSquare size={20} />,
  CertificatesCompletion: <LuFileText size={20} />,
  ReportsAnalytics: <FiPieChart size={20} />,
  ProfileSetting: <LuSettings size={20} />,
}

export const instituteSidebarItems = [
  { to: '/institute/dashboard', activePath: '/institute/dashboard', label: 'Dashboard', icon: Icon.Dashboard },
  { to: '/institute/course-management', activePath: '/institute/course-management', label: 'Course Management', icon: Icon.CourseManagement },
  { to: '/institute/student-management', activePath: '/institute/student-management', label: 'Student Management', icon: Icon.StudentManagement },
  { to: '/institute/batch-management', activePath: '/institute/batch-management', label: 'Batch Management', icon: Icon.StudentManagement },
  { to: '/institute/certificates-completion', activePath: '/institute/certificates-completion', label: 'Certificate Completion', icon: Icon.StudentManagement },
  { to: '/institute/placement-collab', activePath: '/institute/placement-collab', label: 'Placement Collabration', icon: Icon.StudentManagement },
  { to: '/institute/messaging-alerts', activePath: '/institute/messaging-alerts', label: 'Messaging & Alerts', icon: Icon.MessagingAlerts },
  { to: '/institute/reports-analytics', activePath: '/institute/reports-analytics', label: 'Reports & Analytics', icon: Icon.ReportsAnalytics },
  { to: '/institute/profile-setting', activePath: '/institute/profile-setting', label: 'Profile & Settings', icon: Icon.ProfileSetting },
]
