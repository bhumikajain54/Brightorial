import React, { useEffect, useState } from 'react'
import { LuPlus, LuEye } from 'react-icons/lu'
import Button from '../../../../shared/components/Button'
import { MatrixCard } from '../../../../shared/components/metricCard'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import BatchDetail from './BatchDetail'
import CourseDetail from './CourseDetail'
import CreateBatchModal from './CreateBatchModal'
import { getMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl.js'

export default function BatchManagement() {
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCourseForBatch, setSelectedCourseForBatch] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getMethod({
        apiUrl: apiService.courseByBatch
      })
      // Handle response structure: { status: true, courses: [...], count: number, message: string }
      if (response.status && Array.isArray(response.courses)) {
        const mapped = response.courses.map((c) => {
          // Handle admin_action - normalize to lowercase
          let adminAction = c.admin_action
          if (adminAction !== null && adminAction !== undefined) {
            adminAction = String(adminAction).toLowerCase().trim()
          }
          // Default to 'pending' only if truly missing
          adminAction = adminAction || 'pending'
          
          return {
            id: c.course_id,
            title: c.course_title,
            instructor: c.instructor_name,
            fee: c.fee || 0,
            totalBatches: c.total_batches || 0,
            activeBatches: c.active_batches || 0,
            progress: c.overall_progress || 0,
            admin_action: adminAction,
          }
        })
        setCourses(mapped)
      } else {
        setCourses([])
        setError('No courses found')
      }
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isSubscribed = true
    
    const loadData = async () => {
      await fetchData()
    }

    loadData()

    return () => {
      isSubscribed = false
    }
  }, [])

  // ✅ Check localStorage on mount for refresh persistence
  useEffect(() => {
    const storedCourseId = localStorage.getItem('institute_course_detail_id')
    if (storedCourseId && !selectedCourse && !loading) {
      // Fetch course data if we have stored ID but no selected course
      handleViewCourse(Number(storedCourseId))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  // Handle batch creation refresh
  const handleBatchCreated = () => {
    fetchData()
  }

  // ✅ View course detail (fetch from same API using course_id)
  const handleViewCourse = async (courseId) => {
    let isMounted = true
    try {
      const response = await getMethod({
        apiUrl: apiService.courseByBatch,
        params: { course_id: courseId }
      })
      if (isMounted && response.status && response.course) {
        const detailedCourse = {
          id: response.course.course_id,
          title: response.course.course_title,
          instructor: response.course.instructor_name,
          duration: response.course.duration,
          description: response.course.description,
          batches: response.batches || [],
          faculty: response.faculty || [],
        }
        setSelectedCourse(detailedCourse)
      }
    } catch (err) {
      if (isMounted) {
        setError('Failed to load course details')
      }
    }
    return () => {
      isMounted = false
    }
  }

  const handleViewBatch = (courseId, batch) => {
    setSelectedBatch({
      courseId,
      courseTitle: selectedCourse?.title || '',
      batch,
    })
  }

  const handleAddBatch = (courseId) => {
    const course = courses.find((c) => c.id === courseId)
    setSelectedCourseForBatch({
      id: courseId,
      title: course?.title || 'Unknown Course',
    })
    setIsCreateModalOpen(true)
  }

  const handleBackToBatches = () => setSelectedBatch(null)
  const handleBackToCourses = () => setSelectedCourse(null)
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
    setSelectedCourseForBatch(null)
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading course data...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  // ✅ Course Detail View
  if (selectedCourse) {
    // Store course ID in localStorage for refresh persistence
    if (selectedCourse.id) {
      localStorage.setItem('institute_course_detail_id', String(selectedCourse.id))
    }
    return (
      <CourseDetail
        courseData={selectedCourse}
        onBack={() => {
          localStorage.removeItem('institute_course_detail_id')
          handleBackToCourses()
        }}
        onViewBatch={(batch) => handleViewBatch(selectedCourse.id, batch)}
      />
    )
  }

  // ✅ Batch Detail View
  if (selectedBatch) {
    return (
      <BatchDetail
        batchData={selectedBatch}
        onBack={handleBackToBatches}
      />
    )
  }

  // ✅ Overview Grid UI
  return (
    <div className={`p-2 ${TAILWIND_COLORS.BG_PRIMARY} min-h-screen`}>
      <div className="mb-6">
        <MatrixCard
          title="Batch Management"
          subtitle="Manage your course batches, view student enrollments, and track batch performance"
          className="mb-4"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`${TAILWIND_COLORS.CARD} p-5 hover:shadow-md transition-shadow`}
          >
            <div className="mb-3">
              <h3 className={`text-lg font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} leading-tight`}>
                {course.title}
              </h3>
            </div>

            <div className="flex gap-3 mb-4">
              <div className={`${TAILWIND_COLORS.BADGE_INFO} px-3 py-2 rounded-md flex-1`}>
                <div className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-bold text-xl`}>
                  {course.totalBatches}
                </div>
                <div className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-xs font-medium`}>
                  Total Batches
                </div>
              </div>
              <div className={`${TAILWIND_COLORS.BADGE_SUCCESS} px-3 py-2 rounded-md flex-1`}>
                <div className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-bold text-xl`}>
                  {course.activeBatches}
                </div>
                <div className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-xs font-medium`}>
                  Active Batches
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-sm font-medium`}>
                  Overall Progress
                </span>
                <span className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-sm font-semibold`}>
                  {course.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-900 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleViewCourse(course.id)}
                variant="outline"
                size="sm"
                fullWidth
                icon={<LuEye className="w-4 h-4" />}
                className={`${TAILWIND_COLORS.BTN_LIGHT}`}
              >
                View
              </Button>
              <Button
                onClick={() => handleAddBatch(course.id)}
                variant="primary"
                size="sm"
                fullWidth
                icon={<LuPlus className="w-4 h-4" />}
                className={`${TAILWIND_COLORS.BTN_SECONDARY}`}
              >
                Add Batch
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination (Static for now) */}
      <div className={`flex items-center justify-between ${TAILWIND_COLORS.CARD} p-4`}>
        <div className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm font-medium`}>
          Showing {courses.length} from {courses.length} data
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="neutral" size="sm" className={`px-3 py-1 ${TAILWIND_COLORS.BTN_LIGHT}`}>
            &lt;&lt; Previous
          </Button>
          <Button variant="primary" size="sm" className={`px-3 py-1 ${TAILWIND_COLORS.BTN_PRIMARY}`}>
            1
          </Button>
          <Button variant="neutral" size="sm" className={`px-3 py-1 ${TAILWIND_COLORS.BTN_LIGHT}`}>
            Next &gt;&gt;
          </Button>
        </div>
      </div>

      <CreateBatchModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        courseId={selectedCourseForBatch?.id}
        courseTitle={selectedCourseForBatch?.title}
        onBatchCreated={handleBatchCreated}
      />
    </div>
  )
}
