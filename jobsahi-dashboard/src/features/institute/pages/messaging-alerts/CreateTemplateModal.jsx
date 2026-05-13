import React, { useState, useEffect } from 'react'
import { LuBookOpen, LuAward, LuFileText, LuCalendar, LuX } from 'react-icons/lu'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import Button from '../../../../shared/components/Button'

export default function CreateTemplateModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingTemplate = null 
}) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'Course',
    iconColor: 'bg-green-100 text-green-600'
  })

  const templateTypes = ['Course', 'Assignment', 'Exam', 'General', 'Certificate']
  const iconColors = [
    { name: 'Green', value: 'bg-green-100 text-green-600' },
    { name: 'Blue', value: 'bg-blue-100 text-blue-600' },
    { name: 'Orange', value: 'bg-orange-100 text-orange-600' },
    { name: 'Purple', value: 'bg-purple-100 text-purple-600' },
    { name: 'Red', value: 'bg-red-100 text-red-600' },
    { name: 'Yellow', value: 'bg-yellow-100 text-yellow-600' },
  ]

  const availableVariables = [
    '{studentName}',
    '{courseName}',
    '{updateDetails}',
    '{instituteName}',
    '{date}',
    '{time}'
  ]

  // Populate form when editing
  useEffect(() => {
    if (editingTemplate) {
      setFormData({
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        content: editingTemplate.content,
        type: editingTemplate.type,
        iconColor: editingTemplate.iconColor
      })
    } else {
      setFormData({
        name: '',
        subject: '',
        content: '',
        type: 'Course',
        iconColor: 'bg-green-100 text-green-600'
      })
    }
  }, [editingTemplate, isOpen])

  // Handle form change
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Insert variable into content
  const insertVariable = (variable) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + ' ' + variable
    }))
  }

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Extract variables from content
    const variablePattern = /\{[^}]+\}/g
    const extractedVariables = [...new Set([
      ...(formData.subject.match(variablePattern) || []),
      ...(formData.content.match(variablePattern) || [])
    ])]

    // Determine icon based on type
    let icon = LuFileText
    if (formData.type === 'Course') icon = LuBookOpen
    else if (formData.type === 'Certificate') icon = LuAward
    else if (formData.type === 'Exam') icon = LuCalendar

    const templateData = {
      ...formData,
      icon,
      variables: extractedVariables
    }

    onSave(templateData, editingTemplate)
    handleCancel()
  }

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      type: 'Course',
      iconColor: 'bg-green-100 text-green-600'
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h2>
          <button
            onClick={handleCancel}
            className={`${TAILWIND_COLORS.TEXT_MUTED} hover:text-text-primary transition-colors`}
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
          {/* Basic Information Section */}
          <div>
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Template Name */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  TEMPLATE NAME
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="e.g., Course Update, Assignment Reminder"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Template Type */}
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  TEMPLATE TYPE
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {templateTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Icon Color */}
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  ICON COLOR
                </label>
                <select
                  value={formData.iconColor}
                  onChange={(e) => handleFormChange('iconColor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {iconColors.map(color => (
                    <option key={color.value} value={color.value}>{color.name}</option>
                  ))}
                </select>
              </div>

              {/* Subject Line */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  SUBJECT LINE
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  placeholder="e.g., Important Update - {courseName}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Message Content Section */}
          <div>
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Message Content</h3>
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                CONTENT
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                placeholder="Dear {studentName}, ..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                required
              />
            </div>
          </div>

          {/* Available Variables Section */}
          <div>
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Available Variables</h3>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-4`}>
              Click on a variable to insert it into your message content
            </p>
            <div className="flex flex-wrap gap-2">
              {availableVariables.map((variable, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => insertVariable(variable)}
                  className={`px-3 py-1.5 text-sm ${TAILWIND_COLORS.BADGE_INFO} rounded-full hover:opacity-80 transition-opacity`}
                >
                  {variable}
                </button>
              ))}
            </div>
          </div> 

          {/* Preview Section */}
          <div>
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Template Preview</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                    Subject:
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {formData.subject || <span className="text-gray-400 italic">Subject will appear here...</span>}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                    Content:
                  </label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} whitespace-pre-wrap`}>
                    {formData.content || <span className="text-gray-400 italic">Content will appear here...</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          </div>
        </form>

        {/* Fixed Footer - Action Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            size="md"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            variant="primary"
            size="md"
          >
            {editingTemplate ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  )
}

