import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant'
import { getMethod, putMethod } from '../../../../../service/api'
import apiService from '../../../services/serviceUrl'
import Button from '../../../../../shared/components/Button'
import {
  LuArrowLeft,
  LuUser,
  LuMail,
  LuPhone,
  LuFileText,
  LuFilter,
  LuCheck,
  LuX,
  LuClock,
  LuCalendar
} from 'react-icons/lu'

export default function CompanyApplications({ company, driveId, onBack }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [preferenceFilter, setPreferenceFilter] = useState('') // 1-6 or '' for all
  const [statusFilter, setStatusFilter] = useState('') // pending, shortlisted, rejected, selected
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [interviewForm, setInterviewForm] = useState({
    interview_date: '',
    interview_time: '',
    interview_venue: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  })

  useEffect(() => {
    fetchApplications()
  }, [preferenceFilter, statusFilter, pagination.page])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = {
        campus_drive_company_id: company.id,
        drive_id: driveId,
        page: pagination.page,
        limit: pagination.limit
      }
      
      if (preferenceFilter) {
        params.preference = parseInt(preferenceFilter)
      }
      
      if (statusFilter) {
        params.status = statusFilter
      }

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

  const getPreferenceBadge = (prefNum) => {
    const colors = {
      1: 'bg-purple-100 text-purple-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-green-100 text-green-800',
      4: 'bg-yellow-100 text-yellow-800',
      5: 'bg-orange-100 text-orange-800',
      6: 'bg-red-100 text-red-800'
    }
    return colors[prefNum] || 'bg-gray-100 text-gray-800'
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
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    )
  }

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const response = await putMethod({
        apiUrl: apiService.updateApplicationStatus,
        payload: {
          application_id: applicationId,
          status: newStatus,
          company_id: company.id // Pass company ID for company-specific selection
        }
      })

      if (response.status) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: newStatus === 'selected' ? 'Candidate selected for this company' : 'Selection removed',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${TAILWIND_COLORS.CARD} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <LuArrowLeft size={20} />
              Back
            </button>
            <div>
              <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                Applications - {company.company_name}
              </h2>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                View all candidates who applied for this company
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <LuFilter className={TAILWIND_COLORS.TEXT_MUTED} size={18} />
            <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Filters:
            </span>
          </div>
          
          {/* Preference Filter */}
          <select
            value={preferenceFilter}
            onChange={(e) => {
              setPreferenceFilter(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Preferences</option>
            <option value="1">Preference 1</option>
            <option value="2">Preference 2</option>
            <option value="3">Preference 3</option>
            <option value="4">Preference 4</option>
            <option value="5">Preference 5</option>
            <option value="6">Preference 6</option>
          </select>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="selected">Selected</option>
          </select>
          
          <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
            Total: {pagination.total} applications
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
          <p className={`mt-4 ${TAILWIND_COLORS.TEXT_MUTED}`}>
            {preferenceFilter || statusFilter
              ? `No applications found${preferenceFilter ? ` for Preference ${preferenceFilter}` : ''}${statusFilter ? ` with status ${statusFilter}` : ''}`
              : 'No applications found for this company'}
          </p>
        </div>
      ) : (
        <>
          <div className={`${TAILWIND_COLORS.CARD} p-6`}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`text-left ${TAILWIND_COLORS.TEXT_MUTED} border-b`}>
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Phone</th>
                    <th className="py-3 px-4 font-medium">Preference</th>
                    <th className="py-3 px-4 font-medium">Applied At</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                          <LuUser size={16} className={TAILWIND_COLORS.TEXT_MUTED} />
                          {app.student_name || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                          <LuMail size={16} className={TAILWIND_COLORS.TEXT_MUTED} />
                          {app.student_email || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                          <LuPhone size={16} className={TAILWIND_COLORS.TEXT_MUTED} />
                          {app.student_phone || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {app.selected_preference ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPreferenceBadge(app.selected_preference)}`}>
                            Preference {app.selected_preference}
                          </span>
                        ) : (
                          <span className={TAILWIND_COLORS.TEXT_MUTED}>N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                          {new Date(app.applied_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <select
                            value={app.is_selected_by_company ? 'selected' : 'not_selected'}
                            onChange={(e) => {
                              const newStatus = e.target.value === 'selected' ? 'selected' : 'pending'
                              handleStatusChange(app.id, newStatus)
                            }}
                            className="px-2 py-1 border rounded text-xs"
                          >
                            <option value="not_selected">Not Selected</option>
                            <option value="selected">Selected</option>
                          </select>
                          <button
                            onClick={() => {
                              setSelectedApplication(app)
                              setInterviewForm({
                                interview_date: app.interview_date || '',
                                interview_time: app.interview_time || '',
                                interview_venue: app.interview_venue || ''
                              })
                              setShowInterviewModal(true)
                            }}
                            className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100"
                            title="Assign Interview"
                          >
                            <LuCalendar size={14} />
                          </button>
                        </div>
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
                    setInterviewForm({ interview_date: '', interview_time: '', interview_venue: '' })
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

