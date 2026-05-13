import React, { useState } from 'react'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant'
import Button from '../../../../../shared/components/Button'
import DynamicButton from '../../../../../shared/components/DynamicButton'
import ComingSoonPopup from '../../../../../shared/components/ComingSoon'

// Message Specific Institute Component
function MessageSpecificInstitute() {
  const [selectedInstitute, setSelectedInstitute] = useState('')
  const [messageType, setMessageType] = useState('')
  const [messageSubject, setMessageSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')

  const institutes = [
    { id: 1, name: 'SPI Tech Institute', location: 'Mumbai' },
    { id: 2, name: 'Xaviers Institute', location: 'Delhi' },
    { id: 3, name: 'National IT Academy', location: 'Bangalore' },
    { id: 4, name: 'Crescent Institute', location: 'Chennai' },
    { id: 5, name: 'Delhi Technical Institute', location: 'Delhi' },
    { id: 6, name: 'Mumbai Skill Center', location: 'Mumbai' }
  ]

  const messageTypes = [
    'General Notification',
    'Course Update',
    'Certificate Ready',
    'Payment Reminder',
    'Placement Drive',
    'System Maintenance'
  ]

  const handleSendMessage = () => {
    if (selectedInstitute && messageType && messageSubject && messageContent) {
      alert('Message sent successfully!')
      // Reset form
      setSelectedInstitute('')
      setMessageType('')
      setMessageSubject('')
      setMessageContent('')
    } else {
      alert('Please fill in all fields')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">✓</span>
        </div>
        <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Message Specific Skill Partner</h2>
      </div>

      {/* Message Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Institute Selection */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Select Skill Partner</h3>
            
            {/* Institute List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {institutes.map((institute) => (
                <div
                  key={institute.id}
                  onClick={() => setSelectedInstitute(institute.name)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedInstitute === institute.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{institute.name}</div>
                  <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{institute.location}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Message Details */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Message Details</h3>
            
            {/* Message Type */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>
                Message Type
              </label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select message type</option>
                {messageTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>
                Subject
              </label>
              <input
                type="text"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Enter message subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Message Content */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>
                Message Content
              </label>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Enter your message here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSendMessage}
                variant="primary"
                size="md"
              >
                Send Message
              </Button>
              <Button
                onClick={() => {
                  setSelectedInstitute('')
                  setMessageType('')
                  setMessageSubject('')
                  setMessageContent('')
                }}
                variant="outline"
                size="md"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Recent Messages</h3>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Course Update Notification</div>
                <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Sent to SPI Tech Institute</div>
                <div className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>2 hours ago</div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Sent
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Certificate Ready</div>
                <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Sent to Xaviers Institute</div>
                <div className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>1 day ago</div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Sent
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Payment Reminder</div>
                <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Sent to National IT Academy</div>
                <div className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>3 days ago</div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Sent
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessageInstitute({ onBack }) {
  return (
    <ComingSoonPopup 
      onClose={onBack}
      fallbackPath="/admin/dashboard" 
    />
  )
}
