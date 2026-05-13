import React from 'react'
import { TAILWIND_COLORS } from '../WebConstant'
import { LuLogOut, LuX } from 'react-icons/lu'

const LogoutConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userName = 'User',
  isLoading = false 
}) => {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
  }

  const handleCancel = () => {
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl border border-[rgba(0,57,91,0.18)]">
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          disabled={isLoading}
        >
          <LuX size={20} />
        </button>

        {/* Modal content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-50">
            <LuLogOut size={32} className="text-red-500" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
            Confirm Logout
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 text-center mb-6">
            Are you sure you want to logout from your account{' '}
            <span className="font-medium text-gray-800">{userName}</span>?
            <br />
            <span className="text-xs text-gray-500 mt-1 block">
              You will need to login again to access your account.
            </span>
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className={`flex-1 h-11 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 h-11 rounded-lg font-medium ${TAILWIND_COLORS.BTN_PRIMARY} ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
              } transition-all duration-200 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logging out...
                </>
              ) : (
                <>
                  <LuLogOut size={16} />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogoutConfirmationModal
