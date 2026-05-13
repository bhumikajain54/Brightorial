import React, { useState } from 'react'
import { LuChevronDown, LuUsers, LuArrowUp } from 'react-icons/lu'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import Button from '../../../../shared/components/Button'

export default function SendNotice() {
  const [formData, setFormData] = useState({
    noticeType: 'Custom Message',
    subject: '',
    message: '',
    deliveryChannels: {
      email: true,
      sms: true,
      inApp: true
    },
    course: '',
    batch: ''
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleChannelChange = (channel) => {
    setFormData(prev => ({
      ...prev,
      deliveryChannels: {
        ...prev.deliveryChannels,
        [channel]: !prev.deliveryChannels[channel]
      }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Send Notice Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>Compose Notice</h2>
        <p className={TAILWIND_COLORS.TEXT_MUTED}>Create and send notices to students and batches</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Compose Notice Section */}
        <div>
          <div className="space-y-6">
            {/* Notice Type */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                NOTICE TYPE *
              </label>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>Choose the type of notice to send.</p>
              <div className="relative">
                <select
                  value={formData.noticeType}
                  onChange={(e) => handleInputChange('noticeType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                >
                  <option value="Custom Message">Custom Message</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Reminder">Reminder</option>
                  <option value="Alert">Alert</option>
                </select>
                <LuChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                SUBJECT *
              </label>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>Enter a clear and concise subject for your notice.</p>
              <div className="relative">
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Enter notice subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <LuChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                MESSAGE
              </label>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>Write your message content here.</p>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Enter your message here...."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            </div>

            {/* Delivery Channels */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                DELIVERY CHANNELS
              </label>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>Select how you want to deliver this notice.</p>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Email' },
                  { key: 'sms', label: 'SMS' },
                  { key: 'inApp', label: 'In-App Notification' }
                ].map((channel) => (
                  <label key={channel.key} className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.deliveryChannels[channel.key]}
                        onChange={() => handleChannelChange(channel.key)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.deliveryChannels[channel.key]
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.deliveryChannels[channel.key] && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className={TAILWIND_COLORS.TEXT_PRIMARY}>{channel.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Select Recipients Section */}
        <div>
          <h3 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>Select Recipients</h3>
          <p className={`${TAILWIND_COLORS.TEXT_MUTED} mb-6`}>Choose batches and courses to send the notice to.</p>

          <div className="space-y-6">
            {/* Select Course */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                SELECT COURSE *
              </label>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>Choose the course to send the notice to.</p>
              <div className="relative">
                <select
                  value={formData.course}
                  onChange={(e) => handleInputChange('course', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                >
                  <option value="">Choose a course</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="data-science">Data Science</option>
                  <option value="ui-ux">UI/UX Design</option>
                </select>
                <LuChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Select Batch */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                SELECT BATCH *
              </label>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>Choose the batch to send the notice to.</p>
              <div className="relative">
                <select
                  value={formData.batch}
                  onChange={(e) => handleInputChange('batch', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                >
                  <option value="">Choose a batch</option>
                  <option value="batch-1">Batch 1</option>
                  <option value="batch-2">Batch 2</option>
                  <option value="batch-3">Batch 3</option>
                  <option value="batch-4">Batch 4</option>
                </select>
                <LuChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Recipients Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-2">
                  <LuUsers className="w-6 h-6 text-blue-600" />
                  <LuUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Recipients Summary</p>
                  <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>38 total students</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            iconRight={<LuArrowUp className="w-5 h-5" />}
          >
            Send Notice
          </Button>
        </div>
      </form>
    </div>
  )
}
