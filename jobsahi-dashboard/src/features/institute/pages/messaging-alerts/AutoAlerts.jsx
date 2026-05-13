import React, { useState } from 'react'
import { LuCalendar, LuAward, LuBookOpen, LuClock, LuToggleLeft, LuToggleRight, LuChevronDown } from 'react-icons/lu'
import Button from '../../../../shared/components/Button'
import DynamicButton from '../../../../shared/components/DynamicButton'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'

// Constants
const ALERT_TYPES = {
  COURSE_DEADLINES: {
    id: 1,
    name: 'Course Deadlines',
    icon: LuCalendar,
    iconColor: 'bg-purple-500', // Using chart-color-7 equivalent
    defaultStatus: 'active'
  },
  CERTIFICATE_READY: {
    id: 2,
    name: 'Certificate Ready',
    icon: LuAward,
    iconColor: 'bg-blue-500', // Using chart-color-10 equivalent
    defaultStatus: 'active'
  },
  COURSE_COMPLETION: {
    id: 3,
    name: 'Course Completion',
    icon: LuBookOpen,
    iconColor: 'bg-green-500', // Using chart-color-1 equivalent (secondary green)
    defaultStatus: 'active'
  },
  PAYMENT_REMINDERS: {
    id: 4,
    name: 'Payment Reminders',
    icon: LuClock,
    iconColor: 'bg-orange-500',
    defaultStatus: 'active'
  }
}

const CONFIG_OPTIONS = {
  SUBJECT_TIMING: ['7 days before', '3 days before', '1 days before'],
  MESSAGE_TEMPLATES: ['Assignment Reminder', 'Course Reminder', 'Payment Reminder', 'Certificate Ready'],
  SEND_TIMES: ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'],
  VARIABLES: ['Email', 'In-App', 'SMS']
}

// Initial alert configurations
const getInitialAlertConfigs = () => {
  return Object.values(ALERT_TYPES).map(alertType => ({
    ...alertType,
    status: alertType.defaultStatus,
    subjectTiming: CONFIG_OPTIONS.SUBJECT_TIMING[0], // "7 days before"
    messageTemplate: CONFIG_OPTIONS.MESSAGE_TEMPLATES[0], // "Assignment Reminder"
    sendTime: CONFIG_OPTIONS.SEND_TIMES[0], // "9:00 AM"
    variables: [CONFIG_OPTIONS.VARIABLES[0]] // ["Email"]
  }))
}

export default function AutoAlerts() {
  const [alertConfigs, setAlertConfigs] = useState(getInitialAlertConfigs())

  // Event handlers
  const toggleAlert = (id) => {
    setAlertConfigs(prev => prev.map(alert => 
      alert.id === id 
        ? { ...alert, status: alert.status === 'active' ? 'inactive' : 'active' }
        : alert
    ))
  }

  const updateAlertConfig = (id, field, value) => {
    setAlertConfigs(prev => prev.map(alert => 
      alert.id === id 
        ? { ...alert, [field]: value }
        : alert
    ))
  }

  const toggleVariable = (alertId, variable) => {
    setAlertConfigs(prev => prev.map(alert => {
      if (alert.id === alertId) {
        const currentVariables = alert.variables
        const newVariables = currentVariables.includes(variable)
          ? currentVariables.filter(v => v !== variable)
          : [...currentVariables, variable]
        return { ...alert, variables: newVariables }
      }
      return alert
    }))
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
            Auto-Alert Configuration
          </h1>
          <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-lg`}>
            Configure automated notifications for students
          </p>
        </div>

        {/* Configuration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alertConfigs.map((alert) => {
            const IconComponent = alert.icon
            return (
              <div key={alert.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${alert.iconColor} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {alert.name}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      {alert.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className="p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                      aria-label={`Toggle ${alert.name} alert`}
                    >
                      {alert.status === 'active' ? (
                        <LuToggleRight className={`w-6 h-6 ${TAILWIND_COLORS.TEXT_PRIMARY}`} />
                      ) : (
                        <LuToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Configuration Options */}
                <div className="space-y-4">
                  {/* Subject Timing */}
                  <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                      Subject
                    </label>
                    <div className="flex space-x-2">
                      {CONFIG_OPTIONS.SUBJECT_TIMING.map((option) => (
                        <DynamicButton
                          key={option}
                          onClick={() => updateAlertConfig(alert.id, 'subjectTiming', option)}
                          borderRadius="9999px"
                          padding="8px 12px"
                          fontSize="14px"
                          fontWeight="500"
                          height="32px"
                          className={`transition-colors ${alert.subjectTiming === option ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          {option}
                        </DynamicButton>
                      ))}
                    </div>
                  </div>

                  {/* Message Template */}
                  <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                      Message Template
                    </label>
                    <div className="relative">
                      <select
                        value={alert.messageTemplate}
                        onChange={(e) => updateAlertConfig(alert.id, 'messageTemplate', e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-200 rounded-lg bg-white ${TAILWIND_COLORS.TEXT_PRIMARY} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none`}
                      >
                        {CONFIG_OPTIONS.MESSAGE_TEMPLATES.map((template) => (
                          <option key={template} value={template}>
                            {template}
                          </option>
                        ))}
                      </select>
                      <LuChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                    </div>
                  </div>

                  {/* Send Time */}
                  <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                      Send Time
                    </label>
                    <div className="relative">
                      <select
                        value={alert.sendTime}
                        onChange={(e) => updateAlertConfig(alert.id, 'sendTime', e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-200 rounded-lg bg-white ${TAILWIND_COLORS.TEXT_PRIMARY} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none`}
                      >
                        {CONFIG_OPTIONS.SEND_TIMES.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      <LuChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                    </div>
                  </div>

                  {/* Variables */}
                  <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                      Variables:
                    </label>
                    <div className="flex space-x-2">
                      {CONFIG_OPTIONS.VARIABLES.map((variable) => (
                        <DynamicButton
                          key={variable}
                          onClick={() => toggleVariable(alert.id, variable)}
                          borderRadius="9999px"
                          padding="8px 12px"
                          fontSize="14px"
                          fontWeight="500"
                          height="32px"
                          className={`transition-colors ${alert.variables.includes(variable) ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                          {variable}
                        </DynamicButton>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
