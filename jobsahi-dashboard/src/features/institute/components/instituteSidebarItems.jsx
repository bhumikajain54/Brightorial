import React from 'react'
import {
  LuLayoutDashboard,
  LuBookOpen,
  LuUsers,
  // LuMessageSquare,
  LuSettings,
  LuFileText, 
  LuGraduationCap,
} from 'react-icons/lu'
import { FiPieChart } from 'react-icons/fi'

const Icon = {
  Dashboard: <LuLayoutDashboard size={20} />,
  CourseManagement: <LuBookOpen size={20} />,
  StudentManagement: <LuUsers size={20} />,
  // MessagingAlerts: <LuMessageSquare size={20} />,
  CertificatesCompletion: <LuFileText size={20} />,
  ReportsAnalytics: <FiPieChart size={20} />,
  ProfileSetting: <LuSettings size={20} />,
}

export const instituteSidebarItems = [
  { to: '/institute/dashboard', activePath: '/institute/dashboard', label: 'Dashboard', icon: Icon.Dashboard },
  { 
    to: '/institute/course-management', 
    activePath: '/institute/course-management', 
    label: 'Course Management', 
    icon: Icon.CourseManagement,
    children: [
      { to: '/institute/course-management', activePath: '/institute/course-management', label: 'Manage Course' },
      { to: '/institute/course-management/create', activePath: '/institute/course-management/create', label: 'Create Course' },
    ]
  },
  { 
    to: '/institute/student-management', 
    activePath: '/institute/student-management', 
    label: 'Student Management', 
    icon: Icon.StudentManagement,
    children: [
      { to: '/institute/student-management', activePath: '/institute/student-management', label: 'View Students' },
      { to: '/institute/student-management?tab=assign-course', activePath: '/institute/student-management', label: 'Assign Course/Batch' },
    ]
  },
  { to: '/institute/batch-management', activePath: '/institute/batch-management', label: 'Batch Management', icon: Icon.StudentManagement },
  { 
    to: '/institute/certificates-completion', 
    activePath: '/institute/certificates-completion', 
    label: 'Certificate Completion', 
    icon: Icon.CertificatesCompletion,
    children: [
      { to: '/institute/certificates-completion', activePath: '/institute/certificates-completion', label: 'Certificate Generation' },
      { to: '/institute/certificates-completion?tab=manage-template', activePath: '/institute/certificates-completion', label: 'Manage Template' },
      { to: '/institute/certificates-completion?tab=issuance-logs', activePath: '/institute/certificates-completion', label: 'Issuance Logs' },
    ]
  },
  // { to: '/institute/placement-collab', activePath: '/institute/placement-collab', label: 'Placement Collabration', icon: Icon.StudentManagement },
  // { to: '/institute/messaging-alerts', activePath: '/institute/messaging-alerts', label: 'Messaging & Alerts', icon: Icon.MessagingAlerts },
  { 
    to: '/institute/reports-analytics', 
    activePath: '/institute/reports-analytics', 
    label: 'Reports & Analytics', 
    icon: Icon.ReportsAnalytics,
    children: [
      { to: '/institute/reports-analytics', activePath: '/institute/reports-analytics', label: 'Student Completion' },
      { to: '/institute/reports-analytics?tab=course-popularity', activePath: '/institute/reports-analytics', label: 'Course Popularity' },
    ]
  },
  { 
    to: '/institute/profile-setting', 
    activePath: '/institute/profile-setting', 
    label: 'Profile & Settings', 
    icon: Icon.ProfileSetting,
    children: [
      { to: '/institute/profile-setting', activePath: '/institute/profile-setting', label: 'Institute Profile' },
      { to: '/institute/profile-setting/staff-management', activePath: '/institute/profile-setting/staff-management', label: 'Staff Management' },
    ]
  },
]
