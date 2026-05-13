import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuBell, LuMail, LuSmartphone, LuSettings, LuSave, LuArrowLeft } from 'react-icons/lu'
import Button from '../../../../shared/components/Button'
import ComingSoonPopup from '../../../../shared/components/ComingSoon'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'

export default function NotificationPreferences({ onBack }) {
  const navigate = useNavigate()
  const [preferences, setPreferences] = useState({
    // Email Notifications
    emailNotifications: {
      dailyEmailDigest: true,
      newEnrollments: false,
      staffUpdates: true,
      weeklyReports: true
    },
    
    // System Notifications
    systemNotifications: {
      systemUpdates: true,
      eventReminders: false
    },
    
    // Mobile Notifications
    mobileNotifications: {
      smsNotification: true,
      pushNotification: false
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(true)

  const handleBackNavigation = useCallback(() => {
    if (typeof onBack === 'function') {
      onBack()
      return
    }
    navigate('/institute/profile-setting')
  }, [navigate, onBack])

  const handlePreferenceChange = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Handle success/error here
  }

  const notificationCategories = [
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      icon: LuMail,
      settings: [
        { key: 'dailyEmailDigest', label: 'Daily Email Digest', description: 'Receive a summary of daily activities.' },
        { key: 'newEnrollments', label: 'New Enrollments', description: 'Get notified when students enroll.' },
        { key: 'staffUpdates', label: 'Staff Updates', description: 'Notifications about staff changes.' },
        { key: 'weeklyReports', label: 'Weekly Reports', description: 'Weekly performance and analytics reports.' }
      ]
    },
    {
      id: 'systemNotifications',
      title: 'System Notifications',
      icon: LuSettings,
      settings: [
        { key: 'systemUpdates', label: 'System Updates', description: 'Important system updates and maintenance.' },
        { key: 'eventReminders', label: 'Event Reminders', description: 'Reminders for upcoming events and deadlines.' }
      ]
    },
    {
      id: 'mobileNotifications',
      title: 'Mobile Notifications',
      icon: LuSmartphone,
      settings: [
        { key: 'smsNotification', label: 'SMS Notification', description: 'Receive urgent notifications via SMS.' },
        { key: 'pushNotification', label: 'Push Notification', description: 'Browser and mobile app push notifications.' }
      ]
    }
  ]

  return (
    <>
      {showComingSoon && (
        <ComingSoonPopup
          onClose={() => {
            setShowComingSoon(false)
            handleBackNavigation()
          }}
        />
      )}
      <div className="space-y-6">
        {/* Header with Save Button */}
        <div className={`${TAILWIND_COLORS.CARD} p-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Button
                onClick={handleBackNavigation}
                variant="outline"
                size="sm"
                icon={<LuArrowLeft className="w-4 h-4" />}
                className="mt-1"
              >
                Back
              </Button>
              <div>
                <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Notification Preferences</h2>
                <p className={`${TAILWIND_COLORS.TEXT_MUTED} mt-2`}>Configure how and when you receive notifications.</p>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              loading={isSaving}
              className={`${TAILWIND_COLORS.BTN_SECONDARY} px-6 py-2 rounded-md flex items-center gap-2`}
              icon={<LuSave className="w-4 h-4" />}
            >
              Save Preferences
            </Button>
          </div>
        </div>

        {/* Notification Categories */}
        <div className="space-y-6">
          {notificationCategories.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.id} className={`${TAILWIND_COLORS.CARD} p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${TAILWIND_COLORS.BADGE_SUCCESS.split(' ')[1]}`}>
                    <Icon className={`w-5 h-5 text-success`} />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{category.title}</h2>
                  </div>
                </div>

                <div className="space-y-4">
                  {category.settings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{setting.label}</h3>
                        <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[category.id][setting.key]}
                          onChange={(e) => handlePreferenceChange(category.id, setting.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                          preferences[category.id][setting.key] 
                            ? 'bg-secondary' 
                            : 'bg-gray-200'
                        }`}></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
