import React from 'react'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant.js'
import { Button } from '../../../../shared/components/Button.jsx'

export default function MessageLogs() {
  // Sample message log data
  const messageLogs = [
    {
      id: 1,
      title: 'Job application received',
      recipient: 'Email to user@example.com',
      timestamp: '2025-05-15 11:00:00',
      status: 'Sent'
    },
    {
      id: 2,
      title: 'Interview reminder',
      recipient: 'SMS to +91 00000 00000',
      timestamp: '2025-05-15 11:00:00',
      status: 'Delivered'
    },
    {
      id: 3,
      title: 'New job match',
      recipient: 'Push to mobile app user',
      timestamp: '2025-05-15 11:00:00',
      status: 'Failed'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Sent':
        return TAILWIND_COLORS.BADGE_SUCCESS
      case 'Delivered':
        return TAILWIND_COLORS.BADGE_SUCCESS
      case 'Failed':
        return TAILWIND_COLORS.BADGE_ERROR
      default:
        return TAILWIND_COLORS.BADGE_MUTED
    }
  }

  return (
    <div className="space-y-6 bg-white rounded-lg border border-[var(--color-primary)28] shadow-sm p-6">
      {/* Header Section */}
      <div className="">
        <div className="flex justify-between items-start">
          <div>
            <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              Notification/Message Logs
            </h2>
            <p className={TAILWIND_COLORS.TEXT_MUTED}>
              Track all out bound communications and delivery status
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="md"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="md"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Message Log Entries */}
      <div className="bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-primary)28] shadow-sm p-6">
        <div className="space-y-4">
          {messageLogs.map((log) => (
            <div key={log.id} className="flex items-center bg-white justify-between p-4 border border-[var(--color-primary)28] rounded-lg transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm font-medium`}>
                    {log.title.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{log.title}</p>
                  <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm`}>{log.recipient}</p>
                  <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm`}>{log.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(log.status)}`}>
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
