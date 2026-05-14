import React, { useEffect, useState } from 'react'
import { LuPlus, LuEye } from 'react-icons/lu'
import Swal from 'sweetalert2'
import Button from '../../../../shared/components/Button'
import { MatrixCard } from '../../../../shared/components/metricCard'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import BatchDetail from './BatchDetail'
import CourseDetail from './CourseDetail'
import CreateBatchModal from './CreateBatchModal'
import { getMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl.js'

// Helper function for user-specific localStorage keys
const getUserSpecificKey = (baseKey) => {
  try {
    const authUser = localStorage.getItem("authUser");
    if (authUser) {
      const user = JSON.parse(authUser);
      const userId = user.id || user.uid;
      const userRole = user.role;
      if (userId && userRole) {
        return `${baseKey}_${userRole}_${userId}`;
      }
    }
  } catch (error) {
    console.error('Error getting user-specific key:', error);
  }
  return baseKey;
};

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
            batchLimit: c.batch_limit || c.batchLimit || null, // ✅ Include batch_limit
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
    // Helper function for user-specific localStorage keys
    const getUserSpecificKey = (baseKey) => {
      try {
        const authUser = localStorage.getItem("authUser");
        if (authUser) {
          const user = JSON.parse(authUser);
          const userId = user.id || user.uid;
          const userRole = user.role;
          if (userId && userRole) {
            return `${baseKey}_${userRole}_${userId}`;
          }
        }
      } catch (error) {
        console.error('Error getting user-specific key:', error);
      }
      return baseKey;
    };
    const courseDetailKey = getUserSpecificKey('institute_course_detail_id');
    const storedCourseId = localStorage.getItem(courseDetailKey)
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
    
    // ✅ Check batch limit before opening modal
    if (course?.batchLimit !== null && course?.batchLimit !== undefined) {
      const batchLimit = Number(course.batchLimit)
      const currentBatches = course.totalBatches || 0
      
      if (currentBatches >= batchLimit) {
        // Show popup warning with clear message
        Swal.fire({
          title: '⚠️ Batch Limit Reached!',
          html: `
            <div style="text-align: left; padding: 10px;">
              <p style="margin-bottom: 15px; font-size: 16px; color: #1f2937;">
                <strong style="color: #111827;">${course.title}</strong>
              </p>
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; margin-bottom: 15px; border-radius: 4px;">
                <p style="margin-bottom: 8px; color: #991b1b; font-weight: 600;">
                  इस course की batch limit <strong>${batchLimit}</strong> है।
                </p>
                <p style="margin-bottom: 0; color: #991b1b;">
                  वर्तमान में <strong>${currentBatches} batch(es)</strong> पहले से मौजूद हैं।
                </p>
              </div>
              <p style="color: #dc2626; font-weight: 600; font-size: 14px; margin-top: 15px;">
                ⚠️ इसलिए और batch create नहीं हो सकती है।
              </p>
              <p style="color: #6b7280; font-size: 13px; margin-top: 10px;">
                कृपया कोई existing batch delete करें या course की batch limit update करें।
              </p>
            </div>
          `,
          icon: 'warning',
          iconColor: '#dc2626',
          confirmButtonText: 'समझ गया',
          confirmButtonColor: '#5C9A24',
          width: '550px',
          customClass: {
            popup: 'batch-limit-popup',
            title: 'batch-limit-title',
            htmlContainer: 'batch-limit-content'
          }
        })
        return // Don't open modal
      }
    }
    
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
      const courseDetailKey = getUserSpecificKey('institute_course_detail_id');
      localStorage.setItem(courseDetailKey, String(selectedCourse.id))
    }
    return (
      <CourseDetail
        courseData={selectedCourse}
        onBack={() => {
          const courseDetailKey = getUserSpecificKey('institute_course_detail_id');
          localStorage.removeItem(courseDetailKey)
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
            {/* Batch Limit Warning */}
            {course.batchLimit !== null && 
             course.batchLimit !== undefined && 
             (course.totalBatches || 0) >= Number(course.batchLimit) && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-700 font-semibold">
                  ⚠️ Batch limit reached ({course.totalBatches}/{course.batchLimit})
                </p>
              </div>
            )}
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
