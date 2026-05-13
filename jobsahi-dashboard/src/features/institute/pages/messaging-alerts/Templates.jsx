import React, { useState } from 'react'
import { LuPlus, LuPencil, LuBookOpen, LuAward, LuFileText, LuCalendar } from 'react-icons/lu'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import Button from '../../../../shared/components/Button'
import CreateTemplateModal from './CreateTemplateModal'

export default function Templates() {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Course Update',
      subject: 'Important Course Update - {courseName}',
      content: 'Dear {studentName}, We have an important update regarding your {courseName} course. {updateDetails} Please check your course portal for more information.',
      type: 'Course',
      icon: LuBookOpen,
      iconColor: 'bg-green-100 text-green-600',
      variables: ['{studentName}', '{courseName}', '{updateDetails}', '{instituteName}']
    },
    {
      id: 2,
      name: 'Certificate Ready',
      subject: 'Your Certificate is Ready - {courseName}',
      content: 'Dear {studentName}, Congratulations! Your certificate for {courseName} course is now ready. {updateDetails} Please collect it from the institute office.',
      type: 'Course',
      icon: LuAward,
      iconColor: 'bg-blue-100 text-blue-600',
      variables: ['{studentName}', '{courseName}', '{updateDetails}', '{instituteName}']
    },
    {
      id: 3,
      name: 'Assignment Reminder',
      subject: 'Assignment Submission Reminder - {courseName}',
      content: 'Dear {studentName}, This is a reminder that your assignment for {courseName} course is due soon. {updateDetails} Please submit it before the deadline.',
      type: 'Assignment',
      icon: LuFileText,
      iconColor: 'bg-orange-100 text-orange-600',
      variables: ['{studentName}', '{courseName}', '{updateDetails}', '{instituteName}']
    },
    {
      id: 4,
      name: 'Exam Schedule',
      subject: 'Exam Schedule Update - {courseName}',
      content: 'Dear {studentName}, The exam schedule for {courseName} course has been updated. {updateDetails} Please check the new schedule and prepare accordingly.',
      type: 'Exam',
      icon: LuCalendar,
      iconColor: 'bg-purple-100 text-purple-600',
      variables: ['{studentName}', '{courseName}', '{updateDetails}', '{instituteName}']
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)

  // Handle edit template
  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setShowCreateModal(true)
  }

  // Handle close modal
  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingTemplate(null)
  }

  // Handle save template
  const handleSaveTemplate = (templateData, editingTemplate) => {
    if (editingTemplate) {
      // Update existing template
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id
          ? { ...t, ...templateData }
          : t
      ))
    } else {
      // Create new template
      const newTemplate = {
        id: Math.max(...templates.map(t => t.id), 0) + 1,
        ...templateData
      }
      setTemplates([...templates, newTemplate])
    }
  }


  return (
    <div className={`${TAILWIND_COLORS.CARD} p-6`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>Manage Templates</h2>
          <p className={TAILWIND_COLORS.TEXT_MUTED}>Configure automated notifications for students</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="secondary"
          size="md"
          icon={<LuPlus className="w-5 h-5" />}
        >
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => {
          const IconComponent = template.icon
          return (
            <div key={template.id} className={`${TAILWIND_COLORS.CARD} p-6 hover:shadow-md transition-shadow duration-200`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${template.iconColor}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{template.name}</h3>
                    <span className={`inline-block px-3 py-1 text-xs font-medium ${TAILWIND_COLORS.BADGE_INFO} rounded-full`}>
                      {template.type}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEditTemplate(template)}
                    variant="unstyled"
                    className={`p-2 ${TAILWIND_COLORS.TEXT_MUTED} hover:text-green-600 transition-colors`}
                    icon={<LuPencil className="w-4 h-4" />}
                    aria-label="Edit template"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Subject:</p>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{template.subject}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Content:</p>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} line-clamp-3`}>{template.content}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable, index) => (
                      <span key={index} className={`px-2 py-1 text-xs ${TAILWIND_COLORS.BADGE_INFO} rounded-full`}>
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LuPencil className={`w-8 h-8 ${TAILWIND_COLORS.TEXT_MUTED}`} />
          </div>
          <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>No templates yet</h3>
          <p className={`${TAILWIND_COLORS.TEXT_MUTED} mb-6`}>Create your first template to get started.</p>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="secondary"
            size="md"
            icon={<LuPlus className="w-5 h-5" />}
            className="mx-auto"
          >
            Create Template
          </Button>
        </div>
      )}

      {/* Create/Edit Template Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={handleSaveTemplate}
        editingTemplate={editingTemplate}
      />

    </div>
  )
}
