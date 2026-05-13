import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant'
import { postMethod, putMethod, getMethod } from '../../../../../service/api'
import apiService from '../../../services/serviceUrl'
import Button from '../../../../../shared/components/Button'
import { LuCalendar, LuMapPin, LuBuilding2, LuUsers, LuX } from 'react-icons/lu'

export default function CreateDrive({ driveId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    venue: '',
    city: '',
    start_date: '',
    end_date: '',
    capacity_per_day: 100,
    status: 'draft'
  })
  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    if (driveId) {
      setIsEditMode(true)
      fetchDriveDetails()
    }
  }, [driveId])

  const fetchDriveDetails = async () => {
    try {
      const response = await getMethod({
        apiUrl: apiService.getCampusDriveDetails,
        params: { drive_id: driveId }
      })

      if (response.status && response.data?.drive) {
        const drive = response.data.drive
        setFormData({
          title: drive.title || '',
          organizer: drive.organizer || '',
          venue: drive.venue || '',
          city: drive.city || '',
          start_date: drive.start_date || '',
          end_date: drive.end_date || '',
          capacity_per_day: drive.capacity_per_day || 100,
          status: drive.status || 'draft'
        })
      }
    } catch (error) {
      console.error('Error fetching drive details:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity_per_day' ? parseInt(value) || 0 : value
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Title is required' })
      return false
    }
    if (!formData.organizer.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Organizer is required' })
      return false
    }
    if (!formData.venue.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Venue is required' })
      return false
    }
    if (!formData.city.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'City is required' })
      return false
    }
    if (!formData.start_date) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Start date is required' })
      return false
    }
    if (!formData.end_date) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'End date is required' })
      return false
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Start date cannot be after end date' })
      return false
    }
    if (formData.capacity_per_day <= 0) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Capacity per day must be greater than 0' })
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      const payload = isEditMode
        ? { drive_id: driveId, ...formData }
        : formData

      const response = isEditMode
        ? await putMethod({
            apiUrl: apiService.updateCampusDrive,
            payload
          })
        : await postMethod({
            apiUrl: apiService.createCampusDrive,
            payload
          })

      if (response.status) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: isEditMode ? 'Drive updated successfully' : 'Drive created successfully',
          timer: 1500
        })
        if (onSuccess) onSuccess()
        if (!isEditMode) {
          setFormData({
            title: '',
            organizer: '',
            venue: '',
            city: '',
            start_date: '',
            end_date: '',
            capacity_per_day: 100,
            status: 'draft'
          })
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to save drive'
        })
      }
    } catch (error) {
      console.error('Error saving drive:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save drive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${TAILWIND_COLORS.CARD} p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            {isEditMode ? 'Edit Campus Drive' : 'Create New Campus Drive'}
          </h2>
          <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
            {isEditMode ? 'Update drive information' : 'Add a new campus hiring drive'}
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <LuX size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              Drive Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Spring 2024 Campus Drive"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Organizer */}
          <div>
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              Organizer *
            </label>
            <input
              type="text"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              placeholder="e.g., ABC University"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* City */}
          <div>
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Mumbai"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Venue */}
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              Venue *
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g., Main Auditorium"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Start Date */}
          <div>
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              Start Date *
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              End Date *
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              min={formData.start_date}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Capacity Per Day */}
          <div>
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              Capacity Per Day *
            </label>
            <input
              type="number"
              name="capacity_per_day"
              value={formData.capacity_per_day}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
              Maximum number of applications per day
            </p>
          </div>

          {/* Status */}
          <div>
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="draft">Draft</option>
              <option value="live">Live</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-2"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Drive' : 'Create Drive'}
          </Button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

