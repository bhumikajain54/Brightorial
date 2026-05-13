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
}

export const adminSidebarItems = [
  { to: '/admin/dashboard', activePath: '/admin/dashboard', label: 'Dashboard', icon: Icon.Dashboard },
  { to: '/admin/management', activePath: '/admin/management', label: 'Managements', icon: Icon.Manage },
  { to: '/admin/job-control', activePath: '/admin/job-control', label: 'Job & Course Control', icon: Icon.Jobs },
  { to: '/admin/business-panel', activePath: '/admin/business-panel', label: 'Business & Revenue Panel', icon: Icon.Biz },
  { to: '/admin/reports', activePath: '/admin/reports', label: 'Reports & Analytics Center', icon: Icon.Reports },
  { to: '/admin/messaging-campaigns', activePath: '/admin/messaging-campaigns', label: 'Messaging & Campaigns', icon: Icon.Msg },
  { to: '/admin/alerts-automation', activePath: '/admin/alerts-automation', label: 'Alerts & Automation', icon: Icon.Alerts },
  { to: '/admin/settings', activePath: '/admin/settings', label: 'System Settings & Configuration', icon: Icon.Settings },
  { to: '/admin/tools-logs', activePath: '/admin/tools-logs', label: 'Admin Tools & Logs', icon: Icon.Tools },
]


