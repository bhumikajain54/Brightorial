import React, { useState, useEffect } from 'react'
import { LuCheck, LuEye, LuX } from 'react-icons/lu'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import { Button, PrimaryButton, OutlineButton } from '../../../../shared/components/Button'
import { getMethod, postMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl'

const AssignCourse = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [assignmentData, setAssignmentData] = useState({
    newCourse: '',
    newBatch: '',
    reason: ''
  })
  const [courseOptions, setCourseOptions] = useState([])
  const [batchOptions, setBatchOptions] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingBatches, setLoadingBatches] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  // 🟢 Fetch students on load using get_institute_students.php API
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      try {
        const resp = await getMethod({ apiUrl: apiService.institute_view_students })
        
        console.log('📊 get_institute_students API Response:', resp)
        
        // Handle response structure: { status: true, data: [{ student_id, name, email, course, batch, status, ... }] }
        if (resp?.status && Array.isArray(resp.data)) {
          const formatted = resp.data.map((s) => ({
            id: s.student_id || s.id,
            name: s.name || 'N/A',
            email: s.email || '',
            phone: s.phone || '',
            currentCourse: s.course || s.course_name || 'N/A',
            currentBatch: s.batch && s.batch !== 'Not Assigned' ? s.batch : 'N/A',
            course_id: s.course_id || null,
            batch_id: s.batch_id || null,
            status: s.status || 'Enrolled',
            enrollment_date: s.enrollment_date || null
          }))
          setStudents(formatted)
          console.log('✅ Formatted students:', formatted)
        } else if (resp?.status && Array.isArray(resp.students)) {
          // Fallback: if data is in resp.students
          const formatted = resp.students.map((s) => ({
            id: s.student_id || s.id,
            name: s.name || 'N/A',
            email: s.email || '',
            phone: s.phone || '',
            currentCourse: s.course || s.course_name || 'N/A',
            currentBatch: s.batch && s.batch !== 'Not Assigned' ? s.batch : 'N/A',
            course_id: s.course_id || null,
            batch_id: s.batch_id || null,
            status: s.status || 'Enrolled',
            enrollment_date: s.enrollment_date || null
          }))
          setStudents(formatted)
        } else {
          console.warn('⚠️ No students data found in response:', resp)
          setStudents([])
        }
      } catch (err) {
        console.error('❌ Error fetching students:', err)
        setStudents([])
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true)
      const resp = await getMethod({ apiUrl: apiService.getCourses })
      if (resp?.status && Array.isArray(resp.courses)) {
        const mappedCourses = resp.courses
          .map((course) => ({
            id: course.id ?? course.course_id,
            name: course.title ?? course.course_title ?? course.name ?? 'Untitled Course'
          }))
          .filter((course) => course.id)
        setCourseOptions(mappedCourses)
      } else {
        setCourseOptions([])
      }
    } catch (err) {
      setCourseOptions([])
    } finally {
      setLoadingCourses(false)
    }
  }

  const fetchBatches = async (courseId) => {
    const normalizeId = (value) => {
      if (value === undefined || value === null || value === '') return ''
      const numeric = Number(value)
      return Number.isNaN(numeric) ? String(value) : String(numeric)
    }

    const targetCourseId = normalizeId(courseId)

    if (!targetCourseId) {
      setBatchOptions([])
      return
    }

    const buildCourseParam = (value) => {
      const numeric = Number(value)
      return Number.isNaN(numeric) ? value : numeric
    }

    try {
      setLoadingBatches(true)
      const resp = await getMethod({
        apiUrl: apiService.getBatches,
        params: { course_id: buildCourseParam(courseId) }
      })

      const batchesFromResp =
        (Array.isArray(resp?.batches) && resp.batches) ||
        (Array.isArray(resp?.data) && resp.data) ||
        []

      const extractBatchCourseId = (batch) =>
        batch.course_id ??
        batch.courseId ??
        batch.courseID ??
        batch.course?.course_id ??
        batch.course?.id ??
        batch.course ??
        null

      const mappedBatches = batchesFromResp
        .filter((batch) => {
          const batchCourseId = normalizeId(extractBatchCourseId(batch))
          if (!batchCourseId) return true
          return batchCourseId === targetCourseId
        })
        .map((batch) => ({
          id: batch.batch_id ?? batch.id,
          name: batch.batch_name ?? batch.name ?? 'Unnamed Batch'
        }))
        .filter((batch) => batch.id)

      setBatchOptions(mappedBatches)
    } catch (err) {
      setBatchOptions([])
    } finally {
      setLoadingBatches(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'enrolled':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleStudentSelect = (studentId, checked) => {
    if (checked) setSelectedStudents([...selectedStudents, studentId])
    else setSelectedStudents(selectedStudents.filter(id => id !== studentId))
  }

  const handleSelectAll = (checked) => {
    if (checked) setSelectedStudents(students.map(s => s.id))
    else setSelectedStudents([])
  }

  const handleCourseSelect = async (courseId) => {
    setAssignmentData((prev) => ({
      ...prev,
      newCourse: courseId,
      newBatch: '' // reset batch when course changes
    }))
    await fetchBatches(courseId)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setAssignmentData(prev => ({ ...prev, [name]: value }))
  }

  // 🟢 Assign selected students via API
  const handleAssignSelected = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student')
      return false
    }
    if (!assignmentData.newCourse) {
      alert('Please select a new course')
      return false
    }
    if (!assignmentData.newBatch) {
      alert('Please select a new batch')
      return false
    }
    if (!assignmentData.reason.trim()) {
      alert('Please provide a reason for the assignment change')
      return false
    }

    const parsedCourseId = Number(assignmentData.newCourse)
    const parsedBatchId = Number(assignmentData.newBatch)

    const course_id = Number.isNaN(parsedCourseId) ? assignmentData.newCourse : parsedCourseId
    const batch_id = Number.isNaN(parsedBatchId) ? assignmentData.newBatch : parsedBatchId

    try {
      const payload = {
        student_id: selectedStudents,
        course_id,
        batch_id,
        assignment_reason: assignmentData.reason
      }

      const resp = await postMethod({
        apiUrl: apiService.assign_course_batch,
        payload
      })

      if (resp.status) {
        alert(resp.message || 'Students assigned successfully')
      } else {
        alert('Failed: ' + (resp.message || 'Unknown error'))
        return false
      }

      setSelectedStudents([])
      setAssignmentData({ newCourse: '', newBatch: '', reason: '' })
      return true
    } catch (err) {
      alert('Error assigning students. Check console for details.')
      return false
    }
  }

  const handlePreviewChanges = () => {
    if (selectedStudents.length === 0)
      return alert('Please select at least one student')
    if (!assignmentData.newCourse)
      return alert('Please select a new course')
    if (!assignmentData.newBatch)
      return alert('Please select a new batch')

    const selectedNames = students
      .filter(s => selectedStudents.includes(s.id))
      .map(s => s.name)
      .join(', ')

    const courseName =
      courseOptions.find((course) => String(course.id) === String(assignmentData.newCourse))
        ?.name || 'N/A'
    const batchName =
      batchOptions.find((batch) => String(batch.id) === String(assignmentData.newBatch))?.name ||
      'N/A'

    setPreviewData({
      studentCount: selectedStudents.length,
      studentNames: selectedNames,
      courseName,
      batchName,
      reason: assignmentData.reason || 'Not provided'
    })
    setIsPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setPreviewData(null)
  }

  return (
    <div className="p-2 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Assign Students to Course/Batch</h2>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedStudents.length === students.length && students.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-[#5B9821] focus:ring-[#5B9821]"
              />
              <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Select All</span>
            </div>
          </div>

          {/* Student List */}
          {loading ? (
            <p className={`text-center ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading students...</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map(student => (
                <div key={student.id} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={(e) => handleStudentSelect(student.id, e.target.checked)}
                    className={`rounded border-gray-300 ${TAILWIND_COLORS.TEXT_PRIMARY} focus:ring-[#5B9821] mr-4`}
                  />
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{student.name}</h3>
                    <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      Current: {student.currentCourse} - {student.currentBatch}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(student.status)}`}>
                    {student.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedStudents.length > 0 && (
            <div className="mt-4 p-3 bg-[#5B9821] bg-opacity-10 rounded-lg">
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>
                {selectedStudents.length} student(s) selected
              </p>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-6`}>Assignment Options</h2>

          <div className="space-y-6">
            {/* Course */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>New Course</label>
              <select
                name="newCourse"
                value={assignmentData.newCourse}
                onChange={(e) => handleCourseSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821]"
                disabled={loadingCourses}
              >
                <option value="">{loadingCourses ? 'Loading courses...' : 'Select Course'}</option>
                {courseOptions.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>New Batch</label>
              <select
                name="newBatch"
                value={assignmentData.newBatch}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821]"
                disabled={!assignmentData.newCourse || loadingBatches}
              >
                <option value="">
                  {!assignmentData.newCourse
                    ? 'Select course first'
                    : loadingBatches
                      ? 'Loading batches...'
                      : 'Select Batch'}
                </option>
                {batchOptions.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>Assignment Reason</label>
              <textarea
                name="reason"
                value={assignmentData.reason}
                onChange={handleInputChange}
                placeholder="Enter reason for assignment change..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5B9821] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <PrimaryButton
                onClick={handleAssignSelected}
                icon={<LuCheck className="w-4 h-4" />}
                fullWidth
              >
                Assign Selected
              </PrimaryButton>
              <OutlineButton
                onClick={handlePreviewChanges}
                icon={<LuEye className="w-4 h-4" />}
                fullWidth
              >
                Preview Changes
              </OutlineButton>
            </div>
          </div>

          {selectedStudents.length > 0 && (assignmentData.newCourse || assignmentData.newBatch) && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>Assignment Summary</h3>
              <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} space-y-1`}>
                <p><span className="font-medium">Selected Students:</span> {selectedStudents.length}</p>
                {assignmentData.newCourse && (
                  <p>
                    <span className="font-medium">New Course:</span>{' '}
                    {courseOptions.find((course) => String(course.id) === String(assignmentData.newCourse))?.name || assignmentData.newCourse}
                  </p>
                )}
                {assignmentData.newBatch && (
                  <p>
                    <span className="font-medium">New Batch:</span>{' '}
                    {batchOptions.find((batch) => String(batch.id) === String(assignmentData.newBatch))?.name || assignmentData.newBatch}
                  </p>
                )}
                {assignmentData.reason && <p><span className="font-medium">Reason:</span> {assignmentData.reason}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {isPreviewOpen && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Assignment Preview</h2>
              <button
                onClick={handleClosePreview}
                className={`${TAILWIND_COLORS.TEXT_MUTED} hover:text-red-600 transition-all duration-200 hover:scale-110 p-1 rounded-full hover:bg-red-50`}
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Selected Students</p>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                  {previewData.studentNames || 'Not available'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total: <span className="font-semibold text-gray-700">{previewData.studentCount}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${TAILWIND_COLORS.CARD} border border-gray-200 rounded-lg p-4`}>
                  <p className={`text-xs uppercase tracking-wide ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                    New Course
                  </p>
                  <p className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {previewData.courseName}
                  </p>
                </div>
                <div className={`${TAILWIND_COLORS.CARD} border border-gray-200 rounded-lg p-4`}>
                  <p className={`text-xs uppercase tracking-wide ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                    New Batch
                  </p>
                  <p className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {previewData.batchName}
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className={`text-xs uppercase tracking-wide ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                  Assignment Reason
                </p>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{previewData.reason}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <OutlineButton onClick={handleClosePreview}>Close</OutlineButton>
              <PrimaryButton
                onClick={async () => {
                  const success = await handleAssignSelected()
                  if (success) {
                    handleClosePreview()
                  }
                }}
                icon={<LuCheck className="w-4 h-4" />}
              >
                Confirm & Assign
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignCourse
