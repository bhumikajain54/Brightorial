import React from 'react'
import { LuX, LuTrash2, LuAlertTriangle } from 'react-icons/lu'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'

const DeleteConfirmationPopup = ({ course, onConfirm, onClose }) => {
  if (!course) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-bg-white rounded-lg shadow-xl max-w-md w-full`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${TAILWIND_COLORS.BORDER}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <LuAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Delete Course</h2>
          </div>
          <button
            onClick={onClose}
            className={`${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY} transition-colors`}
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className={`${TAILWIND_COLORS.TEXT_MUTED} mb-4`}>
              Are you sure you want to delete this course? This action cannot be undone.
            </p>
            
            {/* Course Info */}
            <div className={`bg-gray-50 p-4 rounded-lg ${TAILWIND_COLORS.BORDER}`}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <LuTrash2 className={`w-6 h-6 ${TAILWIND_COLORS.TEXT_MUTED}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{course.title}</h3>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} uppercase`}>{course.category}</p>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>₹{course.price}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <LuAlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Warning:</p>
                <p>This will permanently delete the course and all associated data including student enrollments, progress, and media files.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 p-6 border-t ${TAILWIND_COLORS.BORDER}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 ${TAILWIND_COLORS.BTN_LIGHT} rounded-lg transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <LuTrash2 className="w-4 h-4" />
            Delete Course
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationPopup
