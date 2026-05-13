import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuUsers, LuCalendar, LuClock, LuDownload, LuPencil, LuTrash2, LuMail } from 'react-icons/lu'
import Button from '../../../../shared/components/Button'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import EditBatchModal from './EditBatchModal'
import { getMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl.js'

export default function BatchDetail({ batchData, onBack, onBatchUpdate }) {
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownRef = useRef(null)

  const [batchInfo, setBatchInfo] = useState(null)
  const [students, setStudents] = useState([])
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBatchForEdit, setSelectedBatchForEdit] = useState(batchData?.batch ?? null)
  useEffect(() => {
    setSelectedBatchForEdit(batchData?.batch ?? null)
  }, [batchData])

  // Format date from API (YYYY-MM-DD HH:mm:ss or YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A' || dateString === 'null' || dateString === 'undefined') return 'N/A'
    try {
      // Handle different date formats
      let date
      if (typeof dateString === 'string') {
        // Remove time part if present (YYYY-MM-DD HH:mm:ss -> YYYY-MM-DD)
        const dateOnly = dateString.split(' ')[0]
        date = new Date(dateOnly)
      } else {
        date = new Date(dateString)
      }
      
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  // ✅ Calculate completion percentage based on dates (Frontend Logic)
  const calculateCompletionPercentage = (startDate, endDate) => {
    if (!startDate || !endDate || startDate === 'N/A' || endDate === 'N/A') {
      console.warn('⚠️ Missing dates for completion calculation:', { startDate, endDate })
      return 0
    }
    
    try {
      // Parse dates (handle YYYY-MM-DD format, remove time if present)
      let startDateStr = typeof startDate === 'string' ? startDate.split(' ')[0] : startDate
      let endDateStr = typeof endDate === 'string' ? endDate.split(' ')[0] : endDate
      
      // Parse dates in local timezone to avoid UTC issues
      const parseLocalDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number)
        return new Date(year, month - 1, day) // month is 0-indexed
      }
      
      // Create date objects in local timezone
      const start = parseLocalDate(startDateStr)
      const end = parseLocalDate(endDateStr)
      const today = new Date()
      
      // Reset time to midnight for accurate day calculation
      today.setHours(0, 0, 0, 0)
      
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error('❌ Invalid dates:', { startDate: startDateStr, endDate: endDateStr, start, end })
        return 0
      }
      
      // Calculate total days from start to end
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      
      // If batch hasn't started yet
      if (today < start) {
        console.log('📅 Batch not started yet:', { 
          today: today.toISOString().split('T')[0], 
          start: start.toISOString().split('T')[0], 
          end: end.toISOString().split('T')[0] 
        })
        return 0
      }
      
      // If batch has ended
      if (today > end) {
        console.log('📅 Batch ended:', { 
          today: today.toISOString().split('T')[0], 
          start: start.toISOString().split('T')[0], 
          end: end.toISOString().split('T')[0] 
        })
        return 100
      }
      
      // Calculate elapsed days from start to today
      const elapsedDays = Math.max(1, Math.ceil((today - start) / (1000 * 60 * 60 * 24)))
      
      // Calculate percentage
      const percentage = Math.round((elapsedDays / totalDays) * 100)
      
      console.log('📊 Completion Calculation:', {
        startDate: startDateStr,
        endDate: endDateStr,
        today: today.toISOString().split('T')[0],
        totalDays,
        elapsedDays,
        percentage
      })
      
      // Ensure percentage is between 0 and 100
      return Math.min(100, Math.max(0, percentage))
    } catch (error) {
      console.error('❌ Error calculating completion percentage:', error, { startDate, endDate })
      return 0
    }
  }

  // ✅ Fetch Batch Details - Try batch_id first, fallback to course_id
  useEffect(() => {
    const fetchBatchDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // First try to fetch specific batch by batch_id (more direct)
        let response = null
        const batchId = batchData?.batch?.batch_id
        
        if (batchId) {
          try {
            response = await getMethod({
              apiUrl: `${apiService.getBatches}?batch_id=${batchId}`,
            })
            
            // Debug: Log the full API response to see structure
            console.log('🔍 BatchDetail API Response:', response)
            console.log('🔍 Batch ID:', batchId)
            console.log('🔍 API URL:', `${apiService.getBatches}?batch_id=${batchId}`)
            
            // Handle multiple possible response structures
            let studentsData = []
            let batchInfoData = {}
            
            // Case 1: response.students (direct array at root) - This is the actual API response structure
            if (Array.isArray(response?.students)) {
              studentsData = response.students
              
              // Check all possible date field names
              const startDate = response.start_date || response.startDate || response.batch_start_date || 
                               response.startDate || response.batch?.start_date || response.data?.start_date || ''
              const endDate = response.end_date || response.endDate || response.batch_end_date || 
                             response.endDate || response.batch?.end_date || response.data?.end_date || ''
              
              // Check all possible time slot field names
              const timeSlot = response.batch_time_slot || response.time_slot || response.batchTimeSlot || 
                              response.time_slot_name || response.batch?.batch_time_slot || response.batch?.time_slot ||
                              response.data?.batch_time_slot || response.data?.time_slot || ''
              
              console.log('📅 Date Fields Found:', { startDate, endDate, timeSlot })
              
              const formattedStart = startDate ? formatDate(startDate) : 'N/A'
              const formattedEnd = endDate ? formatDate(endDate) : 'N/A'
              
              // ✅ Calculate completion percentage from dates (Frontend Logic)
              const calculatedCompletion = calculateCompletionPercentage(startDate, endDate)
              
              batchInfoData = {
                name: response.batch_name || response.name || batchData?.batch?.batch_name || '',
                status: typeof response.status === 'string' ? response.status : (response.admin_action || 'Active'),
                duration: `${formattedStart} - ${formattedEnd}`,
                timeSlot: timeSlot || 'N/A',
                totalStudents: response.enrolled_students || response.total_students || response.enrolledStudents || studentsData.length,
                maxStudents: response.max_students || response.maxStudents || response.batch_limit || 30,
                activeStudents: studentsData.filter((s) => {
                  const status = s.enrollment_status || s.status || ''
                  const statusStr = typeof status === 'string' ? status : String(status)
                  return statusStr.toLowerCase() === 'active' || statusStr.toLowerCase() === 'enrolled'
                }).length,
                completionPercentage: calculatedCompletion, // ✅ Frontend calculated, not from backend
              }
              
              console.log('✅ Batch Info Data Set:', batchInfoData)
            }
            // Case 2: response.batch (nested object)
            else if (response?.status && response?.batch) {
              const currentBatch = response.batch
              studentsData = currentBatch.students || []
              const startDate = currentBatch.start_date || currentBatch.startDate || currentBatch.batch_start_date || ''
              const endDate = currentBatch.end_date || currentBatch.endDate || currentBatch.batch_end_date || ''
              const formattedStart = startDate ? formatDate(startDate) : 'N/A'
              const formattedEnd = endDate ? formatDate(endDate) : 'N/A'
              
              // ✅ Calculate completion percentage from dates (Frontend Logic)
              const calculatedCompletion = calculateCompletionPercentage(startDate, endDate)
              
              batchInfoData = {
                name: currentBatch.batch_name || currentBatch.name || '',
                status: typeof currentBatch.status === 'string' ? currentBatch.status : (currentBatch.admin_action || 'Active'),
                duration: `${formattedStart} - ${formattedEnd}`,
                timeSlot: currentBatch.batch_time_slot || currentBatch.time_slot || currentBatch.batchTimeSlot || currentBatch.time_slot_name || 'N/A',
                totalStudents: currentBatch.enrolled_students || currentBatch.total_students || currentBatch.enrolledStudents || studentsData.length,
                maxStudents: currentBatch.max_students || currentBatch.maxStudents || currentBatch.batch_limit || 30,
                activeStudents: studentsData.filter((s) => {
                  const status = s.enrollment_status || s.status || ''
                  const statusStr = typeof status === 'string' ? status : String(status)
                  return statusStr.toLowerCase() === 'active' || statusStr.toLowerCase() === 'enrolled'
                }).length,
                completionPercentage: calculatedCompletion, // ✅ Frontend calculated, not from backend
              }
            }
            // Case 3: response.data.students or response.data.batch
            else if (response?.data) {
              if (Array.isArray(response.data.students)) {
                studentsData = response.data.students
              } else if (response.data.batch?.students) {
                studentsData = response.data.batch.students
                batchInfoData = {
                  ...batchInfoData,
                  ...response.data.batch,
                }
              }
              const startDate = response.data.start_date || response.data.startDate || response.data.batch_start_date || ''
              const endDate = response.data.end_date || response.data.endDate || response.data.batch_end_date || ''
              const formattedStart = startDate ? formatDate(startDate) : 'N/A'
              const formattedEnd = endDate ? formatDate(endDate) : 'N/A'
              
              // ✅ Calculate completion percentage from dates (Frontend Logic)
              const calculatedCompletion = calculateCompletionPercentage(startDate, endDate)
              
              batchInfoData = {
                name: response.data.batch_name || response.data.name || batchData?.batch?.batch_name || '',
                status: typeof response.data.status === 'string' ? response.data.status : (response.data.admin_action || 'Active'),
                duration: `${formattedStart} - ${formattedEnd}`,
                timeSlot: response.data.batch_time_slot || response.data.time_slot || response.data.batchTimeSlot || response.data.time_slot_name || 'N/A',
                totalStudents: response.data.enrolled_students || response.data.total_students || response.data.enrolledStudents || studentsData.length,
                maxStudents: response.data.max_students || response.data.maxStudents || response.data.batch_limit || 30,
                activeStudents: studentsData.filter((s) => {
                  const status = s.enrollment_status || s.status || ''
                  const statusStr = typeof status === 'string' ? status : String(status)
                  return statusStr.toLowerCase() === 'active' || statusStr.toLowerCase() === 'enrolled'
                }).length,
                completionPercentage: calculatedCompletion, // ✅ Frontend calculated, not from backend
              }
            }
            
            // If we found students data, process it
            if (studentsData.length > 0 || Object.keys(batchInfoData).length > 0) {
              setBatchInfo(batchInfoData)
              
              setStudents(
                studentsData.map((s) => ({
                  id: s.student_id || s.id || s.studentId,
                  name: s.student_name || s.name || s.user_name || '',
                  email: s.email || s.student_email || '',
                  phone: s.phone || s.phone_number || '',
                  joinDate: s.enrollment_date || s.join_date || s.joinDate || '',
                  status: s.enrollment_status || s.status || '',
                }))
              )
              
              // Get instructor data from response
              let instructorData = null
              const currentBatch = response?.batch || response?.data || response
              
              // Priority 1: Check for faculty array
              if (Array.isArray(currentBatch?.faculty) && currentBatch.faculty.length > 0) {
                instructorData = currentBatch.faculty.map((f) => ({
                  id: f.faculty_id || f.id || f.faculty_user_id,
                  name: f.name || f.instructor_name || f.user_name || '',
                  email: f.email || f.instructor_email || '',
                  phone: f.phone || f.instructor_phone || f.phone_number || '',
                }))
              }
              // Priority 2: Check for assigned_instructor object
              else if (currentBatch?.assigned_instructor) {
                instructorData = [{
                  id: currentBatch.assigned_instructor.faculty_id || currentBatch.assigned_instructor.id || currentBatch.assigned_instructor.faculty_user_id,
                  name: currentBatch.assigned_instructor.name || currentBatch.assigned_instructor.instructor_name || currentBatch.assigned_instructor.user_name || '',
                  email: currentBatch.assigned_instructor.email || currentBatch.assigned_instructor.instructor_email || '',
                  phone: currentBatch.assigned_instructor.phone || currentBatch.assigned_instructor.instructor_phone || currentBatch.assigned_instructor.phone_number || '',
                }]
              }
              // Priority 3: Check for instructor_id, instructor_name, instructor_email, instructor_phone (direct fields)
              else if (currentBatch?.instructor_id || currentBatch?.instructor_name) {
                instructorData = [{
                  id: currentBatch.instructor_id || null,
                  name: currentBatch.instructor_name || 'N/A',
                  email: currentBatch.instructor_email || '',
                  phone: currentBatch.instructor_phone || '',
                }]
                
                // If only instructor_id is available, fetch full details
                if (instructorData[0].id && !instructorData[0].name) {
                  try {
                    const facultyRes = await getMethod({ apiUrl: apiService.getFaculty })
                    if (facultyRes?.status && Array.isArray(facultyRes.data)) {
                      const instructor = facultyRes.data.find(f => 
                        (f.id || f.faculty_id || f.faculty_user_id) === currentBatch.instructor_id
                      )
                      if (instructor) {
                        instructorData = [{
                          id: instructor.id || instructor.faculty_id || instructor.faculty_user_id,
                          name: instructor.name || instructor.user_name || '',
                          email: instructor.email || '',
                          phone: instructor.phone || instructor.phone_number || '',
                        }]
                      }
                    }
                  } catch (err) {
                    // Fallback to basic info if fetching full details fails
                  }
                }
              }
              
              if (instructorData) {
                setInstructors(Array.isArray(instructorData) ? instructorData : [instructorData])
              } else {
                setInstructors([])
              }
              
              setLoading(false)
              return // Successfully processed, exit early
            }
          } catch (err) {
            // Fallback to courseByBatch if getBatches fails
          }
        }
        
        // Fallback: Fetch batch details using course_id
        console.log('🔄 Fallback: Fetching by course_id:', batchData.courseId)
        response = await getMethod({
          apiUrl: apiService.courseByBatch,
          params: { course_id: batchData.courseId },
        })
        console.log('🔍 Fallback API Response:', response)

        if (response.status && response.batches?.length > 0) {
          const currentBatch = response.batches.find(
            (b) => Number(b.batch_id) === Number(batchData.batch.batch_id)
          )
        
          if (currentBatch) {
            // Extract all batch fields properly from API response
            console.log('📦 Current Batch Data:', currentBatch)
            
            const startDate = currentBatch.start_date || currentBatch.startDate || currentBatch.batch_start_date || ''
            const endDate = currentBatch.end_date || currentBatch.endDate || currentBatch.batch_end_date || ''
            const timeSlot = currentBatch.batch_time_slot || currentBatch.time_slot || currentBatch.batchTimeSlot || currentBatch.time_slot_name || ''
            
            console.log('📅 Fallback Date Fields:', { startDate, endDate, timeSlot })
            
            const formattedStart = startDate ? formatDate(startDate) : 'N/A'
            const formattedEnd = endDate ? formatDate(endDate) : 'N/A'
            
            // ✅ Calculate completion percentage from dates (Frontend Logic)
            const calculatedCompletion = calculateCompletionPercentage(startDate, endDate)
            
            const batchInfoToSet = {
              name: currentBatch.batch_name || currentBatch.name || '',
              status: typeof currentBatch.status === 'string' ? currentBatch.status : (currentBatch.admin_action || 'Active'),
              duration: `${formattedStart} - ${formattedEnd}`,
              timeSlot: timeSlot || 'N/A',
              totalStudents: currentBatch.enrolled_students || currentBatch.total_students || currentBatch.enrolledStudents || (currentBatch.students?.length || 0),
              maxStudents: currentBatch.max_students || currentBatch.maxStudents || currentBatch.batch_limit || 30,
              activeStudents: currentBatch.students?.filter((s) => 
                (s.status || '').toLowerCase() === 'active' || 
                (s.status || '').toLowerCase() === 'enrolled'
              ).length || 0,
              completionPercentage: calculatedCompletion, // ✅ Frontend calculated, not from backend
            }
            
            console.log('✅ Fallback Batch Info Set:', batchInfoToSet)
            setBatchInfo(batchInfoToSet)
        
            setStudents(
              (currentBatch.students || []).map((s) => ({
                id: s.student_id || s.id || s.studentId,
                name: s.student_name || s.name || s.user_name || '',
                email: s.email || s.student_email || '',
                phone: s.phone || s.phone_number || '',
                joinDate: s.enrollment_date || s.join_date || s.joinDate || '',
                status: s.enrollment_status || s.status || '',
              }))
            )
        
            // ✅ Get instructor ONLY from batch data (not from course)
            // Batch instructor can be different from course instructor
            let instructorData = null
            
            // Priority 1: Check for faculty array
                if (Array.isArray(currentBatch.faculty) && currentBatch.faculty.length > 0) {
              instructorData = currentBatch.faculty.map((f) => ({
                id: f.faculty_id || f.id || f.faculty_user_id,
                name: f.name || f.instructor_name || f.user_name || '',
                email: f.email || f.instructor_email || '',
                phone: f.phone || f.instructor_phone || f.phone_number || '',
              }))
            }
            // Priority 2: Check for assigned_instructor object
            else if (currentBatch.assigned_instructor) {
              instructorData = [{
                id: currentBatch.assigned_instructor.faculty_id || currentBatch.assigned_instructor.id || currentBatch.assigned_instructor.faculty_user_id,
                name: currentBatch.assigned_instructor.name || currentBatch.assigned_instructor.instructor_name || currentBatch.assigned_instructor.user_name || '',
                email: currentBatch.assigned_instructor.email || currentBatch.assigned_instructor.instructor_email || '',
                phone: currentBatch.assigned_instructor.phone || currentBatch.assigned_instructor.instructor_phone || currentBatch.assigned_instructor.phone_number || '',
              }]
            }
            // Priority 3: Check for instructor_id - fetch details from faculty API
            else if (currentBatch.instructor_id) {
              try {
                const facultyRes = await getMethod({ apiUrl: apiService.getFaculty })
                if (facultyRes?.status && Array.isArray(facultyRes.data)) {
                  const instructor = facultyRes.data.find(f => 
                    Number(f.id || f.faculty_id || f.faculty_user_id) === Number(currentBatch.instructor_id)
                  )
                  if (instructor) {
                    instructorData = [{
                      id: instructor.id || instructor.faculty_id || instructor.faculty_user_id,
                      name: instructor.name || instructor.user_name || '',
                      email: instructor.email || '',
                      phone: instructor.phone || instructor.phone_number || '',
                    }]
                  }
                }
              } catch (err) {
                // If fetch fails, use instructor_name if available
                if (currentBatch.instructor_name) {
                  instructorData = [{
                    id: currentBatch.instructor_id,
                    name: currentBatch.instructor_name,
                    email: currentBatch.instructor_email || '',
                    phone: currentBatch.instructor_phone || '',
                  }]
                }
              }
            }
            // Priority 4: Check for instructor_name directly
            else if (currentBatch.instructor_name) {
              instructorData = [{
                id: currentBatch.instructor_id || null,
                name: currentBatch.instructor_name,
                email: currentBatch.instructor_email || '',
                phone: currentBatch.instructor_phone || '',
              }]
            }
            
            setInstructors(instructorData || [])
          }
        } else {
          setError('Batch details not found')
        }
      } catch (err) {
        setError('Failed to load batch details')
      } finally {
        setLoading(false)
      }
    }

    fetchBatchDetail()
  }, [batchData?.batch?.batch_id, batchData?.courseId])

  const getStatusColor = (status) => {
    // Ensure status is a string before calling toLowerCase
    const statusStr = typeof status === 'string' ? status : (status ? String(status) : '')
    const statusLower = statusStr.toLowerCase()
    switch (statusLower) {
      case 'active':
      case 'enrolled':
        return `${TAILWIND_COLORS.BADGE_SUCCESS}`
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'inactive':
      case 'dropped':
        return `${TAILWIND_COLORS.BADGE_ERROR}`
      default:
        return `${TAILWIND_COLORS.BADGE_WARN}`
    }
  }

  const formatStatus = (status) => {
    // Ensure status is a string before calling toLowerCase
    const statusStr = typeof status === 'string' ? status : (status ? String(status) : '')
    const statusLower = statusStr.toLowerCase()
    switch (statusLower) {
      case 'enrolled':
        return 'Enrolled'
      case 'completed':
        return 'Completed'
      case 'active':
        return 'Active'
      case 'inactive':
        return 'Inactive'
      case 'dropped':
        return 'Dropped'
      default:
        return statusStr || 'N/A'
    }
  }

  const handleExportReport = () => {
  }

  const handleEditBatch = () => {
    setSelectedBatchForEdit(batchData?.batch ?? null)
    setIsEditModalOpen(true)
  }

  const handleUpdateBatch = (updatedData) => {
    setBatchInfo((prev) => {
      if (!prev) return prev

      const updatedDuration =
        updatedData?.start_date && updatedData?.end_date
          ? `${updatedData.start_date} - ${updatedData.end_date}`
          : prev.duration

      // ✅ Explicitly update timeSlot if batch_time_slot is provided in updatedData
      const updatedTimeSlot = updatedData?.batch_time_slot !== undefined 
        ? updatedData.batch_time_slot 
        : prev.timeSlot

      return {
        ...prev,
        name: updatedData?.batch_name || updatedData?.name || prev.name,
        timeSlot: updatedTimeSlot,
        duration: updatedDuration,
      }
    })

    setSelectedBatchForEdit((prev) =>
      prev
        ? {
            ...prev,
            ...updatedData,
            batch_name: updatedData?.batch_name || updatedData?.name || prev.batch_name,
            batch_time_slot: updatedData?.batch_time_slot !== undefined 
              ? updatedData.batch_time_slot 
              : prev.batch_time_slot,
          }
        : prev
    )

    // ✅ Update instructor state in real-time if instructor was updated
    if (updatedData?.instructor) {
      setInstructors([updatedData.instructor])
    } else if (updatedData?.instructor_id === null || updatedData?.instructor_id === 0) {
      // If instructor was removed (set to null or 0), clear the instructors list
      setInstructors([])
    }

    // ✅ Notify parent component (CourseDetail) about the batch update for real-time list update
    if (onBatchUpdate) {
      onBatchUpdate(updatedData)
    }

    setIsEditModalOpen(false)
  }

  const handleDeleteStudent = (studentId) => {
    setOpenDropdown(null)
  }

  const handleSendMessageToAll = () => {
    navigate('/institute/messaging-alerts', {
      state: {
        initialTabId: 'send-notice',
        batchContext: {
          batchId: batchData?.batch?.batch_id,
          batchName: batchInfo?.name,
          courseId: batchData?.courseId,
          courseTitle: batchData?.courseTitle,
          studentCount: students.length,
        },
      },
    })
  }

  const handleSendMessageToStudent = (studentId) => {
    const student = students.find((s) => s.id === studentId)
    if (student) {
      navigate('/institute/message', {
        state: {
          selectedStudent: student,
          batchInfo: batchInfo,
          isBatchMessage: false,
        },
      })
    }
    setOpenDropdown(null)
  }

  // ✅ Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading batch details...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  if (!batchInfo) {
    return <div className="p-4 text-center text-gray-500">No batch data available.</div>
  }

  return (
    <div className={`p-2 ${TAILWIND_COLORS.BG_PRIMARY} min-h-screen`}>
      {/* Header with Back Button */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className={`${TAILWIND_COLORS.BTN_LIGHT}`}
            >
              ← Back
            </Button>
            <div>
              <h1 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                {batchInfo.name}
              </h1>
              {batchData?.courseTitle && (
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                  Course: {batchData.courseTitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportReport}
              variant="outline"
              size="sm"
              icon={<LuDownload className="w-4 h-4" />}
              className={`${TAILWIND_COLORS.BTN_LIGHT}`}
            >
              Export Report
            </Button>
            <Button
              onClick={handleEditBatch}
              variant="primary"
              size="sm"
              icon={<LuPencil className="w-4 h-4" />}
              className={`${TAILWIND_COLORS.BTN_SECONDARY}`}
            >
              Edit Batch
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Students */}
        <div className={`${TAILWIND_COLORS.CARD} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                Total Students
              </h3>
              <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                {batchInfo.totalStudents}/{batchInfo.maxStudents}
              </p>
            </div>
            <div
              className={`w-12 h-12 ${TAILWIND_COLORS.BADGE_INFO} rounded-lg flex items-center justify-center`}
            >
              <LuUsers className={`w-6 h-6 ${TAILWIND_COLORS.TEXT_PRIMARY}`} />
            </div>
          </div>
        </div>

        {/* Completion Percentage */}
        <div className={`${TAILWIND_COLORS.CARD} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                Completion %
              </h3>
              <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                {batchInfo.completionPercentage}%
              </p>
            </div>
            <div
              className={`w-12 h-12 ${TAILWIND_COLORS.BADGE_SUCCESS} rounded-lg flex items-center justify-center`}
            >
              <svg
                className={`w-6 h-6 ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Students */}
        <div className={`${TAILWIND_COLORS.CARD} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                Active Students
              </h3>
              <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                {batchInfo.activeStudents}
              </p>
            </div>
            <div
              className={`w-12 h-12 ${TAILWIND_COLORS.BADGE_WARN} rounded-lg flex items-center justify-center`}
            >
              <LuUsers className={`w-6 h-6 ${TAILWIND_COLORS.TEXT_PRIMARY}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Info */}
        <div className={`${TAILWIND_COLORS.CARD} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Batch Information
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                batchInfo.status
              )}`}
            >
              {batchInfo.status}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <LuCalendar className={`w-5 h-5 ${TAILWIND_COLORS.TEXT_MUTED}`} />
              <div>
                <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Duration</p>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{batchInfo.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LuClock className={`w-5 h-5 ${TAILWIND_COLORS.TEXT_MUTED}`} />
              <div>
                <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Time Slot</p>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{batchInfo.timeSlot}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructors */}
        <div className={`${TAILWIND_COLORS.CARD} p-6`}>
          <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
            Instructor
          </h2>
          <div className="space-y-4">
            {instructors.length > 0 ? (
              instructors.map((instructor, index) => (
                <div
                  key={instructor.id || (instructor.name && typeof instructor.name === 'string' ? instructor.name : `instructor-${index}`)}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      {instructor.name && typeof instructor.name === 'string'
                        ? instructor.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {instructor.name && typeof instructor.name === 'string' ? instructor.name : 'No instructor assigned'}
                    </h3>
                    {instructor.email && (
                      <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>{instructor.email}</p>
                    )}
                    {instructor.phone && (
                      <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>{instructor.phone}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>No instructor assigned</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enrolled Students */}
      <div className={`mt-6 ${TAILWIND_COLORS.CARD}`}>
        <div className={`p-6 ${TAILWIND_COLORS.BORDER}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Enrolled Students ({batchInfo.totalStudents})
            </h2>
            <Button
              onClick={handleSendMessageToAll}
              variant="primary"
              size="sm"
              icon={<LuMail className="w-4 h-4" />}
              className={`${TAILWIND_COLORS.BTN_SECONDARY}`}
            >
              Send Message
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Student
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Join Date
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`${TAILWIND_COLORS.BG_PRIMARY} divide-y ${TAILWIND_COLORS.BORDER}`}
            >
              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={`${student.id}-${student.joinDate}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div
                        className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                      >
                          {student.name || 'N/A'}
                      </div>
                      <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                          {student.email || 'No email'}
                        </div>
                        {student.phone && (
                          <div className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                            {student.phone}
                      </div>
                        )}
                    </div>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                  >
                      {formatDate(student.joinDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        student.status
                      )}`}
                    >
                        {formatStatus(student.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className={`${TAILWIND_COLORS.TEXT_MUTED} hover:text-red-600 p-1 rounded-md hover:bg-red-50`}
                      title="Delete Student"
                    >
                      <LuTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      No students enrolled in this batch yet
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Batch Modal */}
      <EditBatchModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        batchData={selectedBatchForEdit}
        onUpdate={handleUpdateBatch}
      />
    </div>
  )
}
