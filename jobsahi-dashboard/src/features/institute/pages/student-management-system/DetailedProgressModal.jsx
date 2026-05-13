import React from 'react'
import { LuX } from 'react-icons/lu'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'

const DetailedProgressModal = ({ isOpen, onClose, studentData }) => {
  if (!isOpen || !studentData) return null

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-orange-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Detailed Progress Report
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <LuX className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Student Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-[#5B9821] rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4">
                  {studentData.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {studentData.name}
                  </h3>
                  <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>{studentData.course}</p>
                </div>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
                Overall Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      Overall Progress
                    </span>
                    <span className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {studentData.overallProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProgressColor(studentData.overallProgress)}`}
                      style={{ width: `${studentData.overallProgress}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      Attendance
                    </span>
                    <span className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {studentData.attendance}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-green-500"
                      style={{ width: `${studentData.attendance}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Theory Scores */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
                Theory Scores
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {studentData.theoryScores?.map((theory, index) => (
                  <div
                    key={theory.id}
                    className={`${theory.color} rounded-lg p-4 text-center`}
                  >
                    <p className="text-sm font-medium mb-1">Theory {index + 1}</p>
                    <p className="text-2xl font-bold">{theory.score}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
                Additional Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Course</p>
                  <p className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {studentData.course}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Status</p>
                  <p className="font-medium text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailedProgressModal
