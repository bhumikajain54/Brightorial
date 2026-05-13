import React from 'react'
import {
  LuLayoutDashboard,
  LuBriefcase,
  LuUsers,
  LuCalendar,
  LuMessageSquare,
  LuBuilding,
  LuSettings,
  LuClipboardCheck,
} from 'react-icons/lu'
import { FiPieChart } from 'react-icons/fi'

const Icon = {
  Dashboard: <LuLayoutDashboard size={20} />,
  JobManagement: <LuBriefcase size={20} />,
  CandidateManagement: <LuUsers size={20} />,
  InterviewScheduler: <LuCalendar size={20} />,
  SkillTest: <LuClipboardCheck size={20} />,
  MessageNotification: <LuMessageSquare size={20} />,
  AnalyticsReports: <FiPieChart size={20} />,
  CompanyProfile: <LuBuilding size={20} />,
  // Settings: <LuSettings size={20} />,
}

export const recruiterSidebarItems = [
  { to: '/recruiter/dashboard', activePath: '/recruiter/dashboard', label: 'Dashboard', icon: Icon.Dashboard },
  { to: '/recruiter/job-management', activePath: '/recruiter/job-management', label: 'Job Management', icon: Icon.JobManagement },
  { to: '/recruiter/candidate-management', activePath: '/recruiter/candidate-management', label: 'Candidate Management', icon: Icon.CandidateManagement },
  { to: '/recruiter/interview-scheduler', activePath: '/recruiter/interview-scheduler', label: 'Interview Scheduler', icon: Icon.InterviewScheduler },
  { to: '/recruiter/skill-test', activePath: '/recruiter/skill-test', label: 'Skill Test', icon: Icon.SkillTest },
  { to: '/recruiter/message-notification', activePath: '/recruiter/message-notification', label: 'Message & Notification', icon: Icon.MessageNotification },
  { to: '/recruiter/analytics-reports', activePath: '/recruiter/analytics-reports', label: 'Analytics & Reports', icon: Icon.AnalyticsReports },
  { to: '/recruiter/company-profile', activePath: '/recruiter/company-profile', label: 'Company Profile & Settings', icon: Icon.CompanyProfile },
  // { to: '/recruiter/profile', activePath: '/recruiter/profile', label: 'Settings', icon: Icon.Settings },
]
