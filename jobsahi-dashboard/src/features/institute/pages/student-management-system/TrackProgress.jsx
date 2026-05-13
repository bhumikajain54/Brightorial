import React, { useState } from 'react'
import { LuEye } from 'react-icons/lu'
import Swal from 'sweetalert2'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import Button from '../../../../shared/components/Button'
import DetailedProgressModal from './DetailedProgressModal'

const TrackProgress = () => {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mock student progress data
  const studentProgressData = [
    {
      id: 1,
      name: 'Rahul Kumar',
      course: 'Electrician - ELE-2025-M1',
      overallProgress: 75,
      // attendance: 85,
      theoryScores: [
        { id: 1, score: 78, color: 'bg-blue-100 text-blue-800' },
        { id: 2, score: 78, color: 'bg-green-100 text-green-800' },
        { id: 3, score: 94, color: 'bg-purple-100 text-purple-800' }
      ]
    },
    {
      id: 2,
      name: 'Raj Singh',
      course: 'Electrician - ELE-2025-M1',
      overallProgress: 50,
      // attendance: 85,
      theoryScores: [
        { id: 1, score: 50, color: 'bg-blue-100 text-blue-800' },
        { id: 2, score: 68, color: 'bg-green-100 text-green-800' },
        { id: 3, score: 60, color: 'bg-purple-100 text-purple-800' }
      ]
    },
    {
      id: 3,
      name: 'Mohan Kumar',
      course: 'Electrician - ELE-2025-M1',
      overallProgress: 60,
      // attendance: 85,
      theoryScores: [
        { id: 1, score: 60, color: 'bg-blue-100 text-blue-800' },
        { id: 2, score: 94, color: 'bg-green-100 text-green-800' },
        { id: 3, score: 78, color: 'bg-purple-100 text-purple-800' }
      ]
    },
    {
      id: 4,
      name: 'Roy Kumar',
      course: 'Electrician - ELE-2025-M1',
      overallProgress: 94,
      // attendance: 85,
      theoryScores: [
        { id: 1, score: 94, color: 'bg-blue-100 text-blue-800' },
        { id: 2, score: 60, color: 'bg-green-100 text-green-800' },
        { id: 3, score: 78, color: 'bg-purple-100 text-purple-800' }
      ]
    },
    {
      id: 5,
      name: 'Rahul Kumar Singh',
      course: 'Electrician - ELE-2025-M1',
      overallProgress: 60,
      // attendance: 85,
      theoryScores: [
        { id: 1, score: 60, color: 'bg-blue-100 text-blue-800' },
        { id: 2, score: 78, color: 'bg-green-100 text-green-800' },
        { id: 3, score: 94, color: 'bg-purple-100 text-purple-800' }
      ]
    },
    {
      id: 6,
      name: 'Raj Kumar Singh',
      course: 'Electrician - ELE-2025-M1',
      overallProgress: 60,
      // attendance: 85,
      theoryScores: [
        { id: 1, score: 60, color: 'bg-blue-100 text-blue-800' },
        { id: 2, score: 78, color: 'bg-green-100 text-green-800' },
        { id: 3, score: 94, color: 'bg-purple-100 text-purple-800' }
      ]
    }
  ]

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-orange-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleViewDetailedProgress = (studentId) => {
    // Here you would typically navigate to a detailed progress page or open a modal
    Swal.fire({
      title: 'localhost:5173 says',
      text: `Viewing detailed progress for student ID: ${studentId}`,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      customClass: {
        popup: 'swal2-popup-dark',
        title: 'swal2-title-dark',
        content: 'swal2-content-dark',
        confirmButton: 'swal2-confirm-button-dark'
      }
    })
  }

  return (
    <div className="p-2 min-h-screen">
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Student Progress Tracking</h1>
        <p className={`${TAILWIND_COLORS.TEXT_MUTED} mt-2`}>Monitor individual student progress and performance</p>
      </div>

      {/* Student Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studentProgressData.map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Student Information */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#5B9821] rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                {student.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{student.name}</h3>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{student.course}</p>
              </div>
            </div>

            {/* Progress Metrics */}
            <div className="space-y-4 mb-6">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Overall Progress</span>
                  <span className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{student.overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(student.overallProgress)}`}
                    style={{ width: `${student.overallProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Attendance */}
              {/* <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Attendance</span>
                  <span className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{student.attendance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${student.attendance}%` }}
                  ></div>
                </div>
              </div> */}
            </div>

            {/* Theory Scores */}
            <div className="mb-6">
              <h4 className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>Theory Scores</h4>
              <div className="grid grid-cols-3 gap-2">
                {student.theoryScores.map((theory) => (
                  <div
                    key={theory.id}
                    className={`px-3 py-2 rounded-lg text-center text-sm font-semibold ${theory.color}`}
                  >
                    Theory {theory.score}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => handleViewDetailedProgress(student)}
              variant="primary"
              icon={<LuEye className="w-4 h-4" />}
              fullWidth
            >
              View Detailed Progress
            </Button>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 font-bold text-lg">T</span>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Total Students</h3>
              <p className="text-2xl font-bold text-blue-600">{studentProgressData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-green-600 font-bold text-lg">A</span>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Average Progress</h3>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(studentProgressData.reduce((sum, s) => sum + s.overallProgress, 0) / studentProgressData.length)}%
              </p>
            </div>
          </div>
        </div>

        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-purple-600 font-bold text-lg">S</span>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Average Attendance</h3>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(studentProgressData.reduce((sum, s) => sum + s.attendance, 0) / studentProgressData.length)}%
              </p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Detailed Progress Modal */}
      <DetailedProgressModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        studentData={selectedStudent}
      />
    </div>
  )
}

export default TrackProgress