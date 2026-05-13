import React from 'react'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import { Button } from '../../../../shared/components/Button'

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, jobTitle }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Modal Content */}
        <div className="p-8 text-center">
          {/* Title */}
          <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
            Delete This Job Post?
          </h2>
          
          {/* Description */}
          <p className={`${TAILWIND_COLORS.TEXT_MUTED} mb-8 leading-relaxed`}>
            Are you sure you want to delete this job post? This action cannot be undone.
          </p>
          
          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={onConfirm}
              variant="danger"
              size="md"
              className="px-8 py-3"
            >
              Yes, Delete
            </Button>
            <Button
              onClick={onClose}
              variant="light"
              size="md"
              className="px-8 py-3"
            >
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
