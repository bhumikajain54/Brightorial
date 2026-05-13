import React, { useState, useEffect } from 'react'
import { LuPlus, LuSearch, LuPencil, LuUserPlus } from 'react-icons/lu'
import Button from '../../../../shared/components/Button'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import Swal from 'sweetalert2'

// ✅ API helpers + endpoints
import { getMethod, postMethod, putMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl'

export default function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // ✅ API data state
  const [instructors, setInstructors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // -------------------------------
  // Helpers: map API → UI object
  // -------------------------------
  const mapApiFacultyToInstructor = (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    status:
      row.admin_action === 'approved'
        ? 'Active'
        : row.admin_action === 'pending'
        ? 'Pending'
        : 'Inactive'
  })

  // -------------------------------
  // GET: Faculty list
  // -------------------------------
  const fetchFaculty = async () => {
    try {
      setIsLoading(true)
      const res = await getMethod({
        apiUrl: apiService.getFaculty
        // if later you want backend search, pass params here
      })

      if (res?.status && Array.isArray(res.data)) {
        const list = res.data.map(mapApiFacultyToInstructor)
        setInstructors(list)
      } else {
        setInstructors([])
      }
    } catch (err) {
      setInstructors([])
    } finally {
      setIsLoading(false)
    }
  }

  // load on first render
  useEffect(() => {
    fetchFaculty()
  }, [])

  const filteredInstructors = instructors.filter((instructor) =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // -------------------------------
  // UI Handlers (Add/Edit/Delete)
  // -------------------------------
  const handleAddInstructor = () => {
    setFormData({ name: '', email: '', phone: '' })
    setEditingInstructor(null)
    setShowAddModal(true)
  }

  const handleEditInstructor = (instructor) => {
    setEditingInstructor(instructor)
    setFormData({
      name: instructor.name,
      email: instructor.email,
      phone: instructor.phone
    })
    setShowEditModal(true)
  }

  // -------------------------------
  // CREATE / UPDATE via API
  // -------------------------------
  const handleSaveInstructor = async () => {
    // simple required validation; backend will still validate
    if (!formData.name.trim() || !formData.email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields (Name and Email)',
        confirmButtonColor: '#5C9A24'
      })
      return
    }

    setIsSaving(true)
    try {
      if (editingInstructor) {
        // ✅ UPDATE (PUT) - update_faculty_user.php
        const payload = {
          id: editingInstructor.id,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim()
          // admin_action only from admin side if needed
        }

        const res = await putMethod({
          apiUrl: apiService.updateFaculty,
          payload: payload
        })

        if (res?.status && res.data) {
          const updated = mapApiFacultyToInstructor(res.data)
          setInstructors((prev) =>
            prev.map((inst) => (inst.id === updated.id ? updated : inst))
          )
          // Refresh faculty list to get latest data
          await fetchFaculty()
          // Roles are always available from database enum, no need to reset
          
          // Show success popup
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Instructor updated successfully!',
            confirmButtonColor: '#5C9A24'
          })
        } else {
          // Show error popup if update failed
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res?.message || 'Failed to update instructor. Please try again.',
            confirmButtonColor: '#5C9A24'
          })
          return
        }

        setShowEditModal(false)
        setEditingInstructor(null)
      } else {
        // ✅ CREATE (POST) - create_faculty_user.php
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim()
        }

        const res = await postMethod({
          apiUrl: apiService.createFaculty,
          payload: payload
        })

        if (res?.status && res.data) {
          const created = mapApiFacultyToInstructor(res.data)
          setInstructors((prev) => [created, ...prev])
          // Refresh faculty list to get latest data
          await fetchFaculty()
          // Roles are always available from database enum, no need to reset
          
          // Show success popup
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Instructor added successfully!',
            confirmButtonColor: '#5C9A24'
          })
        } else {
          // Show error popup if create failed
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res?.message || 'Failed to add instructor. Please try again.',
            confirmButtonColor: '#5C9A24'
          })
          return
        }

        setShowAddModal(false)
      }

      setFormData({ name: '', email: '', phone: '' })
    } catch (err) {
      // Show error popup for unexpected errors
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again.',
        confirmButtonColor: '#5C9A24'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelModal = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setEditingInstructor(null)
    setFormData({ name: '', email: '', phone: '' })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '')
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className={`min-h-screen ${TAILWIND_COLORS.BG_PRIMARY}`}>
      {/* Header Section */}
      <div className={`${TAILWIND_COLORS.HEADER_BG} border-b ${TAILWIND_COLORS.BORDER} px-6 py-4`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Institute Profile</h1>
            <p className={`${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>Institute Performance Dashboard</p>
          </div>
          <Button
            onClick={handleAddInstructor}
            variant="secondary"
            size="md"
            icon={<LuPlus className="w-4 h-4" />}
            disabled={isLoading || isSaving}
          >
            Add Instructor
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className={`${TAILWIND_COLORS.HEADER_BG} border-b ${TAILWIND_COLORS.BORDER} px-6 py-4`}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <LuSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} w-4 h-4`} />
              <input
                type="text"
                placeholder="Search instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${TAILWIND_COLORS.BORDER} rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${TAILWIND_COLORS.TEXT_PRIMARY}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Instructors List */}
      <div className="p-6">
        <div className="space-y-3">
          {filteredInstructors.map((instructor) => (
            <div
              key={instructor.id}
              className={`${TAILWIND_COLORS.CARD} p-4 hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Avatar Placeholder */}
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm font-medium`}>
                      {instructor.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>

                  {/* Instructor Info */}
                  <div>
                    <h3 className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{instructor.name}</h3>
                    <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>{instructor.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditInstructor(instructor)}
                      className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded flex items-center justify-center transition-colors"
                      title="Edit"
                    >
                      <LuPencil className="w-4 h-4 text-secondary" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredInstructors.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <LuUserPlus className={`mx-auto h-12 w-12 ${TAILWIND_COLORS.TEXT_MUTED}`} />
            <h3 className={`mt-2 text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>No instructors found</h3>
            <p className={`mt-1 text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new instructor.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button
                  onClick={handleAddInstructor}
                  variant="secondary"
                  size="md"
                  icon={<LuPlus className="w-4 h-4" />}
                  disabled={isSaving}
                >
                  Add Instructor
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Instructor Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${TAILWIND_COLORS.HEADER_BG} rounded-lg p-6 w-full max-w-md mx-4`}>
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
              {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${TAILWIND_COLORS.BORDER} rounded-md focus:outline-none focus:ring-2 focus:ring-secondary ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                  placeholder="Enter instructor name"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${TAILWIND_COLORS.BORDER} rounded-md focus:outline-none focus:ring-2 focus:ring-secondary ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className={`w-full px-3 py-2 border ${TAILWIND_COLORS.BORDER} rounded-md focus:outline-none focus:ring-2 focus:ring-secondary ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                  placeholder="Enter 10-digit phone number"
                />
              </div>

            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={handleCancelModal}
                variant="light"
                size="md"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveInstructor}
                variant="primary"
                size="md"
                disabled={isSaving}
              >
                {editingInstructor ? 'Update' : 'Add'} Instructor
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
