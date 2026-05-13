import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant'
import { getMethod, putMethod } from '../../../../../service/api'
import apiService from '../../../services/serviceUrl'
import Button from '../../../../../shared/components/Button'
import {
  LuSearch,
  LuFilter,
  LuUser,
  LuCalendar,
  LuCheck,
  LuX,
  LuClock,
  LuFileText,
  LuEye
} from 'react-icons/lu'

export default function ApplicationsList() {
  const [applications, setApplications] = useState([])
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    drive_id: '',
    day_id: '',
    company_id: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  })
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [interviewForm, setInterviewForm] = useState({
    interview_date: '',
    interview_time: '',
    interview_venue: ''
  })

  useEffect(() => {
    fetchDrives()
    fetchApplications()
  }, [filters, pagination.page])

  const fetchDrives = async () => {
    try {
      const response = await getMethod({
        apiUrl: apiService.getCampusDrives
      })
      if (response.status) {
        setDrives(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching drives:', error)
    }
  }

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      }
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key]
        }
      })

      const response = await getMethod({
        apiUrl: apiService.getCampusApplications,
        params
      })

      if (response.status) {
        setApplications(response.data || [])
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.pagination.total,
            total_pages: response.pagination.total_pages
          }))
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to fetch applications'
        })
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch applications'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const response = await putMethod({
        apiUrl: apiService.updateApplicationStatus,
        payload: {
          application_id: applicationId,
          status: newStatus
        }
      })

      if (response.status) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Application status updated to ${newStatus}`,
          timer: 1500
        })
        fetchApplications()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to update status'
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update status'
      })
    }
  }

  const handleAssignInterview = async () => {
    if (!interviewForm.interview_date && !interviewForm.interview_time && !interviewForm.interview_venue) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please fill at least one interview field' })
      return
    }

    try {
      const response = await putMethod({
        apiUrl: apiService.assignInterview,
        payload: {
          application_id: selectedApplication.id,
          ...interviewForm
        }
      })

      if (response.status) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Interview details assigned successfully',
          timer: 1500
        })
        setShowInterviewModal(false)
        setSelectedApplication(null)
        setInterviewForm({ interview_date: '', interview_time: '', interview_venue: '' })
        fetchApplications()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to assign interview'
        })
      }
    } catch (error) {
      console.error('Error assigning interview:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to assign interview'
      })
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: LuClock, label: 'Pending' },
      shortlisted: { bg: 'bg-blue-100', text: 'text-blue-800', icon: LuCheck, label: 'Shortlisted' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: LuX, label: 'Rejected' },
      selected: { bg: 'bg-green-100', text: 'text-green-800', icon: LuCheck, label: 'Selected' }
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${TAILWIND_COLORS.CARD} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Applications
            </h2>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
              Manage and review all campus drive applications
            </p>
          </div>
          <Button onClick={fetchApplications} className="px-4 py-2">
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              Drive
            </label>
            <select
              value={filters.drive_id}
              onChange={(e) => setFilters(prev => ({ ...prev, drive_id: e.target.value, page: 1 }))}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">All Drives</option>
              {drives.map(drive => (
                <option key={drive.id} value={drive.id}>{drive.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              Search
            </label>
            <div className="relative">
              <LuSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED}`} size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => {
                setFilters({ drive_id: '', day_id: '', company_id: '' })
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="w-full px-4 py-2"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className={`${TAILWIND_COLORS.CARD} p-12 text-center`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className={`${TAILWIND_COLORS.CARD} p-12 text-center`}>
          <LuFileText className={`mx-auto ${TAILWIND_COLORS.TEXT_MUTED}`} size={48} />
          <p className={`mt-4 ${TAILWIND_COLORS.TEXT_MUTED}`}>No applications found</p>
        </div>
      ) : (
        <>
          <div className={`${TAILWIND_COLORS.CARD} p-6`}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`text-left ${TAILWIND_COLORS.TEXT_MUTED} border-b`}>
                    <th className="py-3 px-4 font-medium">Student</th>
                    <th className="py-3 px-4 font-medium">Assigned Day</th>
                    <th className="py-3 px-4 font-medium">Preferences</th>
                    <th className="py-3 px-4 font-medium">Applied At</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                            {app.student_name || 'N/A'}
                          </div>
                          <div className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>
                            {app.student_email || ''}
                          </div>
                          {app.student_phone && (
                            <div className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>
                              {app.student_phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {app.assigned_day ? (
                          <div className="flex items-center gap-1">
                            <LuCalendar size={14} className={TAILWIND_COLORS.TEXT_MUTED} />
                            <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                              {app.assigned_day}
                            </span>
                          </div>
                        ) : (
                          <span className={TAILWIND_COLORS.TEXT_MUTED}>Not assigned</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {app.preferences?.slice(0, 3).map((pref, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {pref.company_name}
                            </span>
                          ))}
                          {app.preferences?.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{app.preferences.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                          {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className={TAILWIND_COLORS.TEXT_MUTED}>
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2"
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <Button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.total_pages}
                    className="px-4 py-2"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Interview Modal */}
      {showInterviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${TAILWIND_COLORS.CARD} p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
              Assign Interview Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  Student: {selectedApplication.student_name}
                </label>
              </div>
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  Interview Date
                </label>
                <input
                  type="date"
                  value={interviewForm.interview_date}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, interview_date: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  Interview Time
                </label>
                <input
                  type="time"
                  value={interviewForm.interview_time}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, interview_time: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  Interview Venue
                </label>
                <input
                  type="text"
                  value={interviewForm.interview_venue}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, interview_venue: e.target.value }))}
                  placeholder="e.g., Room 101, Building A"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleAssignInterview}
                  className="px-6 py-2"
                >
                  Assign Interview
                </Button>
                <button
                  onClick={() => {
                    setShowInterviewModal(false)
                    setSelectedApplication(null)
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

