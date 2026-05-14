import React from 'react'
import {
  LuLayoutDashboard,
  LuUsers,
  LuGraduationCap,
  LuBanknote,
  LuMegaphone,
  LuBell,
  LuSettings,
  LuWrench,
  LuCalendar,
} from 'react-icons/lu'
import { FiPieChart } from 'react-icons/fi'

const Icon = {
  Dashboard: <LuLayoutDashboard size={20} />,
  Manage: <LuUsers size={20} />,
  Jobs: <LuGraduationCap size={20} />,
  Biz: <LuBanknote size={20} />,
  Reports: <FiPieChart size={20} />,
  Msg: <LuMegaphone size={20} />,
  Alerts: <LuBell size={20} />,
  Settings: <LuSettings size={20} />,
  Tools: <LuWrench size={20} />,
  CampusDrive: <LuCalendar size={20} />,
}

export const adminSidebarItems = [
  { to: '/admin/dashboard', activePath: '/admin/dashboard', label: 'Dashboard', icon: Icon.Dashboard },
  { 
    to: '/admin/management', 
    activePath: '/admin/management', 
    label: 'Managements', 
    icon: Icon.Manage,
    children: [
      { to: '/admin/management', activePath: '/admin/management', label: 'Candidate Management' },
      { 
        to: '/admin/management?tab=employer', 
        activePath: '/admin/management', 
        label: 'Recruiter Management',
        children: [
          { to: '/admin/management?tab=employer', activePath: '/admin/management', label: 'Approve/Reject' },
          { to: '/admin/management?tab=employer&subtab=job-tracking', activePath: '/admin/management', label: 'Job Tracking' },
          { to: '/admin/management?tab=employer&subtab=ratings', activePath: '/admin/management', label: 'Ratings' },
          { to: '/admin/management?tab=employer&subtab=fraud-control', activePath: '/admin/management', label: 'Fraud Control' },
        ]
      },
      { 
        to: '/admin/management?tab=institute', 
        activePath: '/admin/management', 
        label: 'Skill Partner Management',
        children: [
          { to: '/admin/management?tab=institute', activePath: '/admin/management', label: 'Verify/Approve' },
          { to: '/admin/management?tab=institute&subtab=course-monitoring', activePath: '/admin/management', label: 'Course Monitoring' },
          { to: '/admin/management?tab=institute&subtab=placement-students', activePath: '/admin/management', label: 'Placement Students' },
          { to: '/admin/management?tab=institute&subtab=certificate-issuance', activePath: '/admin/management', label: 'Certificate Issuance' },
        ]
      },
    ]
  },
  { 
    to: '/admin/job-control', 
    activePath: '/admin/job-control', 
    label: 'Job & Course Control', 
    icon: Icon.Jobs,
    children: [
      { to: '/admin/job-control', activePath: '/admin/job-control', label: 'Job Posting Control' },
      { to: '/admin/job-control?tab=course-oversight', activePath: '/admin/job-control', label: 'Course Oversight' },
    ]
  },
  { 
    to: '/admin/campus-drive', 
    activePath: '/admin/campus-drive', 
    label: 'Campus Drive Management', 
    icon: Icon.CampusDrive,
    children: [
      { to: '/admin/campus-drive', activePath: '/admin/campus-drive', label: 'All Drives' },
      { to: '/admin/campus-drive?tab=create', activePath: '/admin/campus-drive', label: 'Create Drive' },
      { to: '/admin/campus-drive?tab=applications', activePath: '/admin/campus-drive', label: 'Applications' },
      { to: '/admin/campus-drive?tab=stats', activePath: '/admin/campus-drive', label: 'Statistics' },
    ]
  },
  // { to: '/admin/business-panel', activePath: '/admin/business-panel', label: 'Business & Revenue Panel', icon: Icon.Biz },
  { 
    to: '/admin/reports', 
    activePath: '/admin/reports', 
    label: 'Reports & Analytics Center', 
    icon: Icon.Reports,
    children: [
      { to: '/admin/reports', activePath: '/admin/reports', label: 'Conversion Reports' },
      { to: '/admin/reports?tab=hiring', activePath: '/admin/reports', label: 'Hiring Funnel' },
      { to: '/admin/reports?tab=completion', activePath: '/admin/reports', label: 'Completion Rates' },
      { to: '/admin/reports?tab=performance', activePath: '/admin/reports', label: 'Course Performance' },
    ]
  },
  // { to: '/admin/messaging-campaigns', activePath: '/admin/messaging-campaigns', label: 'Messaging & Campaigns', icon: Icon.Msg },
  { 
    to: '/admin/alerts-automation', 
    activePath: '/admin/alerts-automation', 
    label: 'Alerts & Automation', 
    children: [
      { to: '/admin/alerts-automation', activePath: '/admin/alerts-automation', label: 'Expiry Reminders' },
      { to: '/admin/alerts-automation?tab=auto-flag', activePath: '/admin/alerts-automation', label: 'Auto Flagging' },
      { to: '/admin/alerts-automation?tab=resume', activePath: '/admin/alerts-automation', label: 'Resume Feedback' },
      { to: '/admin/alerts-automation?tab=course', activePath: '/admin/alerts-automation', label: 'Course Alerts' },
    ]
  },
  // { to: '/admin/settings', activePath: '/admin/settings', label: 'System Settings & Configuration', icon: Icon.Settings },
  // { to: '/admin/tools-logs', activePath: '/admin/tools-logs', label: 'Admin Tools & Logs', icon: Icon.Tools },
]


