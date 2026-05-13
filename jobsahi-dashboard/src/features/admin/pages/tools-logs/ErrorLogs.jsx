import React, { useState } from 'react'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant.js'
import { FilterButton, Button } from '../../../../shared/components/Button.jsx'

export default function ErrorLogs() {
  const [logs, setLogs] = useState([
    {
      id: 1,
      title: 'Database connection timeout',
      timestamp: '2025-05-15 11:00:00',
      status: 'Critical',
      isOpen: true
    },
    {
      id: 2,
      title: 'Email service unavailable',
      timestamp: '2025-05-15 11:00:00',
      status: 'Warning',
      isOpen: false
    },
    {
      id: 3,
      title: 'File upload failed',
      timestamp: '2025-05-15 11:00:00',
      status: 'Error',
      isOpen: true
    }
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Critical':
        return 'bg-green-100 text-success'
      case 'Warning':
        return 'bg-yellow-100 text-warning'
      case 'Error':
        return 'bg-red-100 text-error'
      default:
        return 'bg-gray-100 text-text-muted'
    }
  }

  const toggleStatus = (id) => {
    setLogs(logs.map(log => 
      log.id === id ? { ...log, isOpen: !log.isOpen } : log
    ))
  }

  return (
    <div className="space-y-6 bg-white rounded-lg border border-[var(--color-primary)28] shadow-sm p-6">
      {/* Header Section */}
      <div className="">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Crash/Error Logs
            </h2>
            <p className="text-text-muted">
              Monitor system errors, crashes, and technical issues
            </p>
          </div>
          <div className="flex gap-3">
            <FilterButton />
            <Button 
              variant="outline" 
              size="md"
              icon={
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              onClick={() => console.log('Export clicked')}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Log Entries Section */}
      <div className="bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-primary)28] shadow-sm p-6">
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center bg-white justify-between p-4 border border-[var(--color-primary)28] rounded-lg transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-text-muted text-sm font-medium">
                    {log.title.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">{log.title}</p>
                  <p className="text-text-muted text-sm">{log.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(log.status)}`}>
                  {log.status}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(log.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-offset-2 ${
                      log.isOpen ? 'bg-[var(--color-secondary)]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        log.isOpen ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-text-primary text-sm">
                    {log.isOpen ? 'Open' : 'Resolved'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
