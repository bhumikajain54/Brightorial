import React, { useState, useEffect } from 'react'
import { LuX } from 'react-icons/lu'
import Button from '../../../../shared/components/Button'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import { putMethod, getMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl.js'
import Swal from 'sweetalert2'

const EditBatchModal = ({ isOpen, onClose, batchData, onUpdate }) => {
  const [formData, setFormData] = useState({
    batchName: '',
    course: '',
    startDate: '',
    endDate: '',
    timeSlot: '',
    instructor: '',
  })

  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [tempStart, setTempStart] = useState('')
  const [tempEnd, setTempEnd] = useState('')

  // =========================================================
  // When modal opens → load dropdowns + batch detail
  // =========================================================
  useEffect(() => {
    if (!isOpen) return

    const init = async () => {
      await Promise.all([fetchCourses(), fetchInstructors()])
      await fetchBatchDetail()
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // ✅ Fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await getMethod({ apiUrl: apiService.getCourses })
      if (res?.status && Array.isArray(res.courses)) {
        setCourses(res.courses)
      }
    } catch (err) {
    }
  }

  // ✅ Fetch all instructors
  const fetchInstructors = async () => {
    try {
      const res = await getMethod({ apiUrl: apiService.getFaculty })
      if (res?.status && Array.isArray(res.data)) {
        setInstructors(res.data)
      }
    } catch (err) {
    }
  }

  // ✅ Fetch selected batch detail
  const fetchBatchDetail = async () => {
    try {
      const id = batchData?.id || batchData?.batch_id
      if (!id) {
        console.warn('No batch ID found in batchData:', batchData)
        return
      }

      const res = await getMethod({
        apiUrl: `${apiService.getBatches}?batch_id=${id}`
      })

      if (res?.status && res?.batch) {
        const b = res.batch
        // ✅ Keep original time slot format (just trim, don't normalize spacing to match API format)
        const timeSlot = b.batch_time_slot 
          ? b.batch_time_slot.trim()
          : ''
        
        setFormData({
          batchName: b.batch_name || '',
          course: b.course_id || b.course?.id || '',
          startDate: b.start_date || '',
          endDate: b.end_date || '',
          timeSlot: timeSlot,
          instructor: b.instructor_id || b.instructor?.id || '',
        })
      } else {
        console.warn('Batch not found or invalid response:', res)
      }
    } catch (err) {
      console.error('Error fetching batch detail:', err)
    }
  }

  // =========================================================
  // Input handler
  // =========================================================
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatTimeTo12Hour = (time) => {
    if (!time) return ''
    // Handle both "HH:MM" and "HH:MM:SS" formats
    const timeParts = time.split(':')
    let hours = parseInt(timeParts[0], 10)
    const minutes = parseInt(timeParts[1] || 0, 10)
    
    if (isNaN(hours) || isNaN(minutes)) return ''
    
    const period = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const formatTimeTo24Hour = (time) => {
    if (!time) return ''
    const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (!match) return ''
    let [, hh, mm, period] = match
    let hours = parseInt(hh, 10)
    const minutes = parseInt(mm, 10)
    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const handleOpenTimePicker = () => {
    if (formData.timeSlot?.includes('-')) {
      const [start, end] = formData.timeSlot.split('-').map((part) => part.trim())
      setTempStart(formatTimeTo24Hour(start))
      setTempEnd(formatTimeTo24Hour(end))
    } else {
      setTempStart('')
      setTempEnd('')
    }
    setShowTimePicker(true)
  }

  const handleConfirmTimeSlot = () => {
    if (tempStart && tempEnd) {
      const formatted = `${formatTimeTo12Hour(tempStart)} - ${formatTimeTo12Hour(tempEnd)}`
      setFormData((prev) => ({ ...prev, timeSlot: formatted.trim() }))
      setTempStart('')
      setTempEnd('')
      setShowTimePicker(false)
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Time Selection Required',
        text: 'Please select both start and end time',
        confirmButtonColor: '#3085d6'
      })
    }
  }

  // =========================================================
  // Submit → call update_batch.php (PUT)
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // ✅ Get batch ID from multiple possible fields
    const batchId = batchData?.id || 
                   batchData?.batch_id || 
                   batchData?.batch?.batch_id ||
                   batchData?.batch?.id
    
    console.log('Batch ID lookup:', {
      batchData,
      id: batchData?.id,
      batch_id: batchData?.batch_id,
      batch_batch_id: batchData?.batch?.batch_id,
      batch_id_final: batchId
    })
    
    if (!batchId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Batch ID missing. Cannot update batch.',
        confirmButtonColor: '#d33'
      })
      console.error('Batch ID not found in batchData:', batchData)
      return
    }

    // ✅ Validate required fields
    if (!formData.batchName.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a batch name.',
        confirmButtonColor: '#d33'
      })
      return
    }

    if (!formData.course) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a course.',
        confirmButtonColor: '#d33'
      })
      return
    }

    if (!formData.startDate || !formData.endDate) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select both start and end dates.',
        confirmButtonColor: '#d33'
      })
      return
    }

    if (!formData.timeSlot) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a time slot.',
        confirmButtonColor: '#d33'
      })
      return
    }

    setLoading(true)

    try {
      // ✅ Use time slot exactly as formatted (trimmed but keep original format)
      const timeSlotToSend = formData.timeSlot.trim()
      
      // ✅ Get original time slot for comparison
      const originalTimeSlot = batchData?.batch_time_slot || batchData?.batch?.batch_time_slot || ''
      
      const payload = {
        batch_id: Number(batchId), // ✅ Include batch_id in payload as some APIs require it
        course_id: Number(formData.course),
        name: formData.batchName.trim(),
        batch_time_slot: timeSlotToSend,
        start_date: formData.startDate,
        end_date: formData.endDate,
        instructor_id: formData.instructor ? Number(formData.instructor) : 0
      }

      // ✅ Log payload for debugging
      console.log('Updating batch with payload:', payload)
      console.log('Original batch data:', batchData)
      console.log('Time slot comparison:', {
        original: originalTimeSlot,
        new: timeSlotToSend,
        changed: timeSlotToSend !== originalTimeSlot
      })

      const res = await putMethod({
        apiUrl: `${apiService.updateBatch}?batch_id=${batchId}`,
        payload
      })

      console.log('API Response:', res)

      // ✅ Check multiple possible success indicators
      const isSuccess = res?.status === true || 
                       res?.status === 'success' || 
                       res?.success === true ||
                       res?.success === 'success' ||
                       (res?.data && res?.message && !res?.error)

      if (isSuccess) {
        // Find the selected instructor details from the instructors list
        const selectedInstructor = formData.instructor 
          ? instructors.find(inst => String(inst.id) === String(formData.instructor))
          : null

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: res?.message || 'Batch updated successfully!',
          confirmButtonColor: '#3085d6',
          timer: 3000,
          timerProgressBar: true
        }).then(() => {
          onUpdate?.({
            ...batchData,
            ...payload,
            id: batchId,
            batch_id: batchId,
            batch_name: payload.name,
            batch_time_slot: payload.batch_time_slot,
            instructor_id: formData.instructor ? Number(formData.instructor) : null,
            instructor: selectedInstructor ? {
              id: selectedInstructor.id,
              name: selectedInstructor.name,
              email: selectedInstructor.email || '',
              phone: selectedInstructor.phone || ''
            } : null
          })
          onClose()
        })
      } else {
        // ✅ Show the actual API error message
        const errorMessage = res?.message || 
                            res?.error || 
                            res?.error?.message ||
                            'Failed to update batch. Please check the console for details.'
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: errorMessage,
          confirmButtonColor: '#d33'
        })
        console.error('Update failed:', res)
        console.error('Full response:', JSON.stringify(res, null, 2))
        
        // ✅ If error is about no changes, provide helpful message
        if (errorMessage.toLowerCase().includes('no changes') || errorMessage.toLowerCase().includes('invalid data')) {
          console.warn('Possible causes: Time slot format mismatch or no actual changes detected')
          console.warn('Current time slot:', formData.timeSlot)
          console.warn('Original batch time slot:', batchData?.batch_time_slot || batchData?.batch?.batch_time_slot)
        }
      }
    } catch (err) {
      console.error('Error updating batch:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again.',
        confirmButtonColor: '#d33'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // =========================================================
  // UI – untouched
  // =========================================================
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-auto my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-300 bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10">
          <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Edit Batch</h2>
          <button
            onClick={onClose}
            className={`${TAILWIND_COLORS.TEXT_MUTED} hover:text-red-600 transition-all duration-200 hover:scale-110 p-1 rounded-full hover:bg-red-50`}
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
              Basic Information
            </h3>
            <div className="space-y-6">
              {/* Batch Name */}
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  BATCH NAME
                </label>
                <input
                  type="text"
                  value={formData.batchName}
                  onChange={(e) => handleInputChange('batchName', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                />
              </div>

              {/* Select Course */}
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  SELECT COURSE
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => handleInputChange('course', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slot */}
              <div className="relative">
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  BATCH TIME SLOT
                </label>
                <input
                  type="text"
                  value={formData.timeSlot}
                  readOnly
                  placeholder="Select time"
                  onClick={handleOpenTimePicker}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent pr-10 cursor-pointer"
                />
                <div className="absolute right-3 top-2.5 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {showTimePicker && (
                  <div className="absolute bg-white shadow-lg border border-gray-200 rounded-lg p-4 mt-2 z-50 w-64">
                    <p className="text-sm font-medium text-gray-700 mb-2">Select Time Slot</p>
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex flex-col flex-1">
                        <label className="text-xs text-gray-500 mb-1">Start</label>
                        <input
                          type="time"
                          value={tempStart}
                          onChange={(e) => setTempStart(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-secondary"
                        />
                      </div>
                      <span className="text-gray-500">–</span>
                      <div className="flex flex-col flex-1">
                        <label className="text-xs text-gray-500 mb-1">End</label>
                        <input
                          type="time"
                          value={tempEnd}
                          onChange={(e) => setTempEnd(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-secondary"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-3 space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowTimePicker(false)
                          setTempStart('')
                          setTempEnd('')
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmTimeSlot}
                        className="bg-blue-500 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-600"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    START DATE
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    END DATE
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Instructor Assignment */}
          <div>
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
              Instructor Assignment
            </h3>
            <select
              value={formData.instructor}
              onChange={(e) => handleInputChange('instructor', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${TAILWIND_COLORS.TEXT_PRIMARY}`}
            >
              <option value="">Select Instructor</option>
              {instructors.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="light"
              size="md"
              className={TAILWIND_COLORS.BTN_LIGHT}
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBatchModal
