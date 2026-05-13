import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../../../shared/components/Button.jsx';
import { COLORS, TAILWIND_COLORS } from '../../../../shared/WebConstant.js';
import { getMethod, putMethod } from '../../../../service/api';
import apiService from '../../services/serviceUrl';
import Swal from 'sweetalert2';

// Toggle Switch Component
const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <span
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-[var(--color-secondary)]' : 'bg-gray-300'
      }`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </span>
    <span className="text-sm text-text-muted">{label}</span>
  </label>
)

// Course Deadline Settings Card
const CourseDeadlineSettings = ({ settings, onSettingsChange, onUpdateSettings, savingSettings }) => {
  const alertScheduleOptions = [
    '1 day before',
    '2 days before', 
    '1 week before',
    '2 weeks before',
    '1 month before'
  ]

  const handleSubmit = () => {
    onUpdateSettings(settings)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary-10">
          <svg className="w-3 h-3 text-[var(--color-secondary)]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-text-primary">Course Deadline Settings</h2>
      </div>
      <p className="text-sm text-text-muted mb-6">Automatic alerts for course deadlines</p>
      
      {/* Form Content */}
      <div className="space-y-6 flex-1">
        {/* Alert Schedule Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Alert Schedule
          </label>
          <div className="relative">
            <select
              value={settings.alertSchedule}
              onChange={(e) => onSettingsChange({ ...settings, alertSchedule: e.target.value })}
              className="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none appearance-none bg-white pr-9 text-sm"
            >
              <option value="">select alert timing</option>
              {alertScheduleOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Notification Toggles */}
        <div className="space-y-4">
          <Toggle 
            checked={settings.emailNotifications} 
            onChange={(checked) => onSettingsChange({ ...settings, emailNotifications: checked })} 
            label="Email Notifications" 
          />
          <Toggle 
            checked={settings.pushNotifications} 
            onChange={(checked) => onSettingsChange({ ...settings, pushNotifications: checked })} 
            label="Push Notifications" 
          />
        </div>

        {/* Message Template */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Message Template
          </label>
          <input
            type="text"
            value={settings.messageTemplate}
            onChange={(e) => onSettingsChange({ ...settings, messageTemplate: e.target.value })}
            placeholder="Reminder: your course (course_name) deadline is approaching"
            className="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
          />
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button 
            onClick={handleSubmit}
            variant="primary"
            size="md"
            fullWidth
            className="font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-30"
            disabled={savingSettings}
          >
            {savingSettings ? 'Saving...' : 'Save Alert Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Upcoming Deadlines Card
const UpcomingDeadlines = ({ deadlines, loading, onRefresh }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary-10">
            <svg className="w-3 h-3 text-[var(--color-secondary)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Upcoming Deadlines</h2>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
      <p className="text-sm text-text-muted mb-6">Courses with approaching deadlines</p>

      {/* Deadlines List */}
      <div className="space-y-3 flex-1">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">Loading deadlines...</p>
          </div>
        ) : deadlines.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">No upcoming deadlines found</p>
          </div>
        ) : (
          deadlines.map((deadline, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200"
          >
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-text-primary mb-1">
                {deadline.courseName}
              </h3>
              <p className="text-xs text-text-muted">
                {deadline.studentCount} students - Deadline in {deadline.deadline}
              </p>
            </div>

            {/* Status Badge */}
            <span
              className={`px-3 py-1 text-sm font-medium rounded-md whitespace-nowrap ${
                deadline.status === 'alert sent' 
                  ? 'bg-[var(--color-secondary)] text-white' 
                  : 'bg-secondary-10 text-[var(--color-secondary)] border border-green-200'
              }`}
            >
              {deadline.status}
            </span>
          </div>
        ))
        )}
      </div>
    </div>
  )
}

// Main CourseAlerts Component
const CourseAlerts = () => {
  // State management for course deadline settings
  const [settings, setSettings] = useState({
    alertSchedule: '',
    emailNotifications: true,
    pushNotifications: true,
    messageTemplate: 'Reminder: your course (course_name) deadline is approaching'
  })

  // Deadlines data from API
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)

  // Fetch course deadline settings
  const fetchCourseDeadlineSettings = useCallback(async () => {
    try {
      const response = await getMethod({
        apiUrl: apiService.getAlertSettings,
        params: { type: 'course_deadlines' }
      })

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      if (isSuccess) {
        let settingsData = response?.settings || response?.data?.settings || response?.data

        if (settingsData) {
          // Map API fields to component state
          // API fields: alert_timing, email_alert, push_alert, template
          const alertTimingMap = {
            '1_day_before': '1 day before',
            '2_days_before': '2 days before',
            '7_days_before': '1 week before',
            '14_days_before': '2 weeks before',
            '30_days_before': '1 month before'
          }

          setSettings({
            alertSchedule: alertTimingMap[settingsData.alert_timing] || settingsData.alertSchedule || '',
            emailNotifications: settingsData.email_alert !== false && settingsData.emailNotifications !== false,
            pushNotifications: settingsData.push_alert !== false && settingsData.pushNotifications !== false,
            messageTemplate: settingsData.template || settingsData.messageTemplate || 'Reminder: your course (course_name) deadline is approaching'
          })
        }
      }
    } catch (error) {
      // If no settings found, use defaults (already set in useState)
    }
  }, [])

  // Fetch upcoming course deadlines
  const fetchUpcomingDeadlines = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getMethod({
        apiUrl: apiService.getUpcomingCourseDeadlines,
        params: { days: 30 }
      })

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      if (isSuccess) {
        let deadlinesArray = response?.data || response?.deadlines || []

        // Map API response to UI format
        const mappedDeadlines = deadlinesArray.map(item => {
          // Map status from API to UI format
          let status = 'scheduled'
          if (item.status === 'alert_sent' || item.status === 'alert sent') {
            status = 'alert sent'
          } else if (item.status === 'scheduled') {
            status = 'scheduled'
          } else if (item.status === 'expired') {
            status = 'expired'
          }

          return {
            courseName: item.courseName || item.course_name || 'Unknown Course',
            studentCount: item.studentCount || item.student_count || 0,
            deadline: item.deadline || 'N/A',
            status: status,
            courseId: item.courseId || item.course_id,
            batchId: item.batchId || item.batch_id,
            deadlineDate: item.deadlineDate || item.deadline_date
          }
        })

        setDeadlines(mappedDeadlines)
      } else {
        setDeadlines([])
      }
    } catch (error) {
      setDeadlines([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourseDeadlineSettings()
    fetchUpcomingDeadlines()
  }, [fetchCourseDeadlineSettings, fetchUpcomingDeadlines])

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
  }

  const handleUpdateSettings = async (updatedSettings) => {
    try {
      setSavingSettings(true)

      // Map UI fields to API format
      const alertTimingReverseMap = {
        '1 day before': '1_day_before',
        '2 days before': '2_days_before',
        '1 week before': '7_days_before',
        '2 weeks before': '14_days_before',
        '1 month before': '30_days_before'
      }

      const settingsObject = {
        alert_timing: alertTimingReverseMap[updatedSettings.alertSchedule] || '7_days_before',
        email_alert: updatedSettings.emailNotifications === true,
        push_alert: updatedSettings.pushNotifications === true,
        template: updatedSettings.messageTemplate || 'Reminder: your course {course_name} deadline is approaching.',
        // Also include UI fields for backward compatibility
        alertSchedule: updatedSettings.alertSchedule,
        emailNotifications: updatedSettings.emailNotifications,
        pushNotifications: updatedSettings.pushNotifications,
        messageTemplate: updatedSettings.messageTemplate
      }

      const response = await putMethod({
        apiUrl: apiService.updateAlertSettings,
        payload: {
          type: 'course_deadlines',
          settings: settingsObject
        }
      })

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      if (isSuccess) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: response?.message || 'Course deadline settings updated successfully',
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        throw new Error(response?.message || 'Failed to update settings')
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Failed to update course deadline settings. Please try again.',
        confirmButtonText: 'OK'
      })
    } finally {
      setSavingSettings(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Course Deadline Settings */}
        <div>
          <CourseDeadlineSettings 
            settings={settings} 
            onSettingsChange={handleSettingsChange}
            onUpdateSettings={handleUpdateSettings}
            savingSettings={savingSettings}
          />
        </div>

        {/* Right Column - Upcoming Deadlines */}
        <div>
          <UpcomingDeadlines 
            deadlines={deadlines}
            loading={loading}
            onRefresh={fetchUpcomingDeadlines}
          />
        </div>
      </div>
    </div>
  )
};

export default CourseAlerts;
