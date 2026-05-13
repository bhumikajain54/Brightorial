import React, { useState } from 'react'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant.js'
import ComingSoonPopup from '../../../../../shared/components/ComingSoon.jsx'

// Resume Access Usage Tracker Component
function ResumeUsageTracker({ onComingSoonClose }) {
  const [timeFilter, setTimeFilter] = useState('All Time')

  const timeFilterOptions = [
    'All Time',
    'Last 7 Days',
    'Last 30 Days',
    'Last 3 Months',
    'Last 6 Months',
    'Last Year'
  ]

  const usageData = [
    {
      id: 1,
      company: 'TechCorp',
      subscriptionPlan: 'Premium',
      creditsUsed: 522,
      creditsRemaining: 50,
      usageProgress: 5,
      lastAccess: '01-01-2025'
    },
    {
      id: 2,
      company: 'InnovateTech',
      subscriptionPlan: 'Basic',
      creditsUsed: 150,
      creditsRemaining: 350,
      usageProgress: 30,
      lastAccess: '02-01-2025'
    },
    {
      id: 3,
      company: 'DataSoft Solutions',
      subscriptionPlan: 'Premium',
      creditsUsed: 800,
      creditsRemaining: 200,
      usageProgress: 80,
      lastAccess: '28-12-2024'
    },
    {
      id: 4,
      company: 'CloudTech Inc',
      subscriptionPlan: 'Enterprise',
      creditsUsed: 1200,
      creditsRemaining: 300,
      usageProgress: 75,
      lastAccess: '03-01-2025'
    },
    {
      id: 5,
      company: 'StartupHub',
      subscriptionPlan: 'Basic',
      creditsUsed: 75,
      creditsRemaining: 425,
      usageProgress: 15,
      lastAccess: '30-12-2024'
    },
    {
      id: 6,
      company: 'WebCraft Studio',
      subscriptionPlan: 'Premium',
      creditsUsed: 600,
      creditsRemaining: 400,
      usageProgress: 60,
      lastAccess: '29-12-2024'
    }
  ]

  const getPlanBadge = (plan) => {
    const planStyles = {
      'Basic': 'bg-blue-100 text-blue-800',
      'Premium': 'bg-purple-100 text-purple-800',
      'Enterprise': 'bg-indigo-100 text-indigo-800'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${planStyles[plan]}`}>
        {plan}
      </span>
    )
  }

  const getUsageProgressBar = (progress) => {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{progress}%</span>
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gray-600 h-2 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className={`${TAILWIND_COLORS.TEXT_MUTED} text-lg font-bold`}>📝</span>
            </div>
            <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Resume Access Usage Tracker</h2>
          </div>
          <p className={`${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>Monitor resume access credits and usage patterns</p>
        </div>
        
        {/* Time Filter */}
        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className={`appearance-none bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY} px-4 py-2 pr-8 rounded-lg text-sm font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {timeFilterOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className={TAILWIND_COLORS.TEXT_MUTED}>▼</span>
          </div>
        </div>
      </div>

      {/* Usage Tracker Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Company
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Subscription Plan
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Credits Used
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Credits Remaining
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Usage Progress
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Last Access
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usageData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm font-medium`}>
                          {item.company.charAt(0)}
                        </span>
                      </div>
                      <div className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{item.company}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPlanBadge(item.subscriptionPlan)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{item.creditsUsed.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{item.creditsRemaining.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getUsageProgressBar(item.usageProgress)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {item.lastAccess}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className={`${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      <span className="text-lg">⋯</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Total Credits Used</p>
              <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                {usageData.reduce((sum, item) => sum + item.creditsUsed, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Total Credits Remaining</p>
              <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                {usageData.reduce((sum, item) => sum + item.creditsRemaining, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">💎</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Active Companies</p>
              <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{usageData.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">🏢</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Avg Usage Rate</p>
              <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                {Math.round(usageData.reduce((sum, item) => sum + item.usageProgress, 0) / usageData.length)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Popup */}
      <ComingSoonPopup onClose={onComingSoonClose} />
    </div>
  )
}

export default ResumeUsageTracker