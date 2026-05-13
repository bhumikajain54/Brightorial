import React, { useState } from 'react'
import { LuSend, LuMessageSquare, LuMail, LuBell, LuUsers, LuFileText, LuCalendar, LuBuilding, LuDollarSign } from 'react-icons/lu'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import Button from '../../../../shared/components/Button'
import ComingSoonPopup from '../../../../shared/components/ComingSoon'

const SendMessages = ({ onComingSoonClose }) => {
  const [messageData, setMessageData] = useState({
    messageType: 'Individual Message',
    recipients: '',
    subject: '',
    message: '',
    deliveryOptions: {
      sms: false,
      email: false,
      pushNotification: false
    }
  })

  const messageTypes = [
    'Individual Message',
    'Bulk Message',
    'Group Message',
    'Announcement'
  ]

  const recipients = [
    'Select Recipients',
    'All Students',
    'Active Students',
    'Completed Students',
    'On Hold Students',
    'Specific Course Students',
    'Custom Selection'
  ]

  const quickTemplates = [
    {
      id: 1,
      title: 'Welcome Message',
      description: 'Welcome new students to the course',
      icon: <LuUsers className="w-6 h-6" />,
      template: 'Welcome to our institute! We are excited to have you join our course. Please ensure you complete the registration process and attend the orientation session.'
    },
    {
      id: 2,
      title: 'Assignment Reminder',
      description: 'Remind students about pending assignments',
      icon: <LuFileText className="w-6 h-6" />,
      template: 'This is a reminder that you have pending assignments that need to be submitted. Please check your dashboard for details and submit before the deadline.'
    },
    {
      id: 3,
      title: 'Exam Schedule',
      description: 'Notify about upcoming examinations',
      icon: <LuCalendar className="w-6 h-6" />,
      template: 'Important: Your examination is scheduled. Please review the exam schedule and ensure you are prepared. Contact us if you have any questions.'
    },
    {
      id: 4,
      title: 'Holiday Notice',
      description: 'Inform about institute holidays',
      icon: <LuBuilding className="w-6 h-6" />,
      template: 'This is to inform you that the institute will be closed on the following dates due to holidays. Classes will resume as per the schedule.'
    },
    {
      id: 5,
      title: 'Fee Reminder',
      description: 'Remind about fee payment deadlines',
      icon: <LuDollarSign className="w-6 h-6" />,
      template: 'This is a friendly reminder that your fee payment is due. Please ensure timely payment to avoid any inconvenience. Contact the office for assistance.'
    }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setMessageData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDeliveryOptionChange = (option) => {
    setMessageData(prev => ({
      ...prev,
      deliveryOptions: {
        ...prev.deliveryOptions,
        [option]: !prev.deliveryOptions[option]
      }
    }))
  }

  const handleTemplateSelect = (template) => {
    setMessageData(prev => ({
      ...prev,
      subject: template.title,
      message: template.template
    }))
  }

  const handleSendMessage = () => {
    if (!messageData.recipients || messageData.recipients === 'Select Recipients') {
      alert('Please select recipients')
      return
    }
    if (!messageData.subject.trim()) {
      alert('Please enter a subject')
      return
    }
    if (!messageData.message.trim()) {
      alert('Please enter a message')
      return
    }
    if (!messageData.deliveryOptions.sms && !messageData.deliveryOptions.email && !messageData.deliveryOptions.pushNotification) {
      alert('Please select at least one delivery method')
      return
    }

    alert('Message sent successfully!')
    
    // Reset form
    setMessageData({
      messageType: 'Individual Message',
      recipients: '',
      subject: '',
      message: '',
      deliveryOptions: {
        sms: false,
        email: false,
        pushNotification: false
      }
    })
  }

  return (
    <div className="p-2 min-h-screen">
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Send Messages to Students</h1>
        <p className={`${TAILWIND_COLORS.TEXT_MUTED} mt-2`}>Communicate with students through SMS, Email, or Push Notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Section: Message Composition */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-6`}>Compose Message</h2>
          
          <div className="space-y-6">
            {/* Message Type */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                Message Type
              </label>
              <select
                name="messageType"
                value={messageData.messageType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821] focus:border-transparent"
              >
                {messageTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipients */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                Recipients
              </label>
              <select
                name="recipients"
                value={messageData.recipients}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821] focus:border-transparent"
              >
                {recipients.map((recipient, index) => (
                  <option key={index} value={recipient === 'Select Recipients' ? '' : recipient}>
                    {recipient}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={messageData.subject}
                onChange={handleInputChange}
                placeholder="Enter message subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821] focus:border-transparent"
              />
            </div>

            {/* Message */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                Message
              </label>
              <textarea
                name="message"
                value={messageData.message}
                onChange={handleInputChange}
                placeholder="Type your message here.."
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821] focus:border-transparent resize-none"
              />
            </div>

            {/* Delivery Options */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>
                Delivery Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={messageData.deliveryOptions.sms}
                    onChange={() => handleDeliveryOptionChange('sms')}
                    className={`rounded border-gray-300 ${TAILWIND_COLORS.TEXT_PRIMARY} focus:ring-[#5B9821]`}
                  />
                  <span className={`ml-3 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center`}>
                    <LuMessageSquare className={`w-4 h-4 mr-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`} />
                    Send SMS
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={messageData.deliveryOptions.email}
                    onChange={() => handleDeliveryOptionChange('email')}
                    className={`rounded border-gray-300 ${TAILWIND_COLORS.TEXT_PRIMARY} focus:ring-[#5B9821]`}
                  />
                  <span className={`ml-3 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center`}>
                    <LuMail className={`w-4 h-4 mr-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`} />
                    Send Email
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={messageData.deliveryOptions.pushNotification}
                    onChange={() => handleDeliveryOptionChange('pushNotification')}
                    className={`rounded border-gray-300 ${TAILWIND_COLORS.TEXT_PRIMARY} focus:ring-[#5B9821]`}
                  />
                  <span className={`ml-3 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center`}>
                    <LuBell className={`w-4 h-4 mr-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`} />
                    Push Notification
                  </span>
                </label>
              </div>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              variant="primary"
              icon={<LuSend className="w-5 h-5" />}
              fullWidth
            >
              Send
            </Button>
          </div>
        </div>

        {/* Right Section: Quick Message Templates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-6`}>Quick Message Templates</h2>
          
          <div className="space-y-4">
            {quickTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#5B9821] hover:bg-green-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start">
                  <div className={`w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4 ${TAILWIND_COLORS.TEXT_MUTED}`}>
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                      {template.title}
                    </h3>
                    <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      {template.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Template Usage Instructions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>How to use templates:</h3>
            <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>
              Click on any template above to automatically fill the subject and message fields. 
              You can then customize the content before sending.
            </p>
          </div>
        </div>
      </div>

      {/* Message Preview */}
      {messageData.subject && messageData.message && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Message Preview</h3>
          <div className="space-y-2">
            <div>
              <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>To:</span>
              <span className={`ml-2 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                {messageData.recipients || 'Not selected'}
              </span>
            </div>
            <div>
              <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Subject:</span>
              <span className={`ml-2 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{messageData.subject}</span>
            </div>
            <div>
              <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Delivery:</span>
              <span className={`ml-2 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                {Object.entries(messageData.deliveryOptions)
                  .filter(([_, checked]) => checked)
                  .map(([method, _]) => method.toUpperCase())
                  .join(', ') || 'None selected'}
              </span>
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} block mb-2`}>Message:</span>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} whitespace-pre-wrap`}>{messageData.message}</p>
            </div>
          </div>
        </div>
      )}
      <ComingSoonPopup onClose={onComingSoonClose} />
    </div>
  )
}

export default SendMessages