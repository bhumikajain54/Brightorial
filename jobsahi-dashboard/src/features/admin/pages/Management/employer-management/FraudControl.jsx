import React, { useState, useEffect, useCallback } from 'react'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant.js'
import { Button } from '../../../../../shared/components/Button.jsx'
import { getMethod } from '../../../../../service/api'
import apiService from '../../../../admin/services/serviceUrl'
import { PillNavigation } from '../../../../../shared/components/navigation.jsx'
import { LuFlag, LuClock, LuCheck, LuBan, LuX, LuBuilding, LuBriefcase, LuInfo } from 'react-icons/lu'
import Swal from 'sweetalert2'

// Job Flag/Review System (Fraud/spam control) Component
function FraudControlSystem() {
  const [statusFilter, setStatusFilter] = useState(0) // Tab index for status filter
  const [flagsData, setFlagsData] = useState([])
  const [summary, setSummary] = useState({
    total_flags: 0,
    under_review: 0,
    resolved: 0,
    blocked_jobs: 0
  })
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedJobDetails, setSelectedJobDetails] = useState(null)
  const [loadingJobDetails, setLoadingJobDetails] = useState(false)

  // Status filter tabs
  const statusTabs = [
    { id: 'all', label: 'All Flags', icon: LuFlag },
    { id: 'under-review', label: 'Under Review', icon: LuClock },
    { id: 'resolved', label: 'Resolved', icon: LuCheck },
    { id: 'blocked', label: 'Blocked', icon: LuBan }
  ]

  // Fetch job flags from API
  const fetchJobFlags = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getMethod({
        apiUrl: apiService.getJobFlags
      })

      console.log('📊 Job Flags API Response:', response)

      const isSuccess = response?.success === true || response?.status === true || response?.status === 'success'

      if (isSuccess) {
        // Extract summary data
        if (response.summary) {
          setSummary({
            total_flags: response.summary.total_flags || 0,
            under_review: response.summary.under_review || 0,
            resolved: response.summary.resolved || 0,
            blocked_jobs: response.summary.blocked_jobs || 0
          })
        }

        // Extract flags array
        const flags = response.flags || response.data || []
        
        // Map API response to component format
        const mappedFlags = flags.map((flag) => {
          // Map status from admin_action
          let status = 'Under Review'
          if (flag.admin_action === 'approved') {
            status = 'Resolved'
          } else if (flag.admin_action === 'blocked' || flag.status === 'Blocked') {
            status = 'Blocked'
          } else if (flag.status === 'Resolved') {
            status = 'Resolved'
          } else {
            status = 'Under Review'
          }

          return {
            id: flag.flag_id || flag.id,
            jobId: flag.job_id,
            jobTitle: flag.job_title || 'N/A',
            company: flag.company_name || 'N/A',
            flagReason: flag.reason || flag.flag_reason || 'N/A',
            severity: flag.severity || 'Medium',
            status: status,
            admin_action: flag.admin_action || 'pending',
            created_at: flag.created_at || ''
          }
        })

        setFlagsData(mappedFlags)
      } else {
        console.error('❌ Failed to fetch job flags:', response?.message)
        setFlagsData([])
      }
    } catch (error) {
      console.error('❌ Error fetching job flags:', error)
      setFlagsData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobFlags()
  }, [fetchJobFlags])

  // Filter by status tab
  const getStatusFilteredData = () => {
    switch (statusFilter) {
      case 0: // All Flags
        return flagsData
      case 1: // Under Review
        return flagsData.filter(f => f.status === 'Under Review')
      case 2: // Resolved
        return flagsData.filter(f => f.status === 'Resolved')
      case 3: // Blocked
        return flagsData.filter(f => f.status === 'Blocked')
      default:
        return flagsData    
    }
  }

  const finalFilteredData = getStatusFilteredData()

  // Calculate summary from all flags data
  const filteredSummary = {
    total_flags: flagsData.length,
    under_review: flagsData.filter(f => f.status === 'Under Review').length,
    resolved: flagsData.filter(f => f.status === 'Resolved').length,
    blocked_jobs: flagsData.filter(f => f.status === 'Blocked').length
  }

  const getSeverityBadge = (severity) => {
    const severityStyles = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-orange-100 text-orange-800',
      'Low': 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${severityStyles[severity]}`}>
        {severity}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Blocked': 'bg-red-100 text-red-800',
      'Under Review': 'bg-orange-100 text-orange-800',
      'Resolved': 'bg-green-100 text-green-800'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status}
      </span>
    )
  }

  // Fetch job details by ID
  const fetchJobDetails = useCallback(async (jobId) => {
    try {
      setLoadingJobDetails(true)
      const response = await getMethod({
        apiUrl: `${apiService.getJobDetail}?id=${jobId}`
      })

      console.log('📊 Job Details API Response:', response)

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      if (isSuccess && response?.data) {
        const jobInfo = response.data.job_info || response.data
        setSelectedJobDetails({
          id: jobInfo.id || jobInfo.job_id,
          title: jobInfo.title || 'N/A',
          company_name: jobInfo.company_name || jobInfo.company || 'N/A',
          description: jobInfo.description || 'N/A',
          job_type: jobInfo.job_type || 'N/A',
          location: jobInfo.location || 'N/A',
          salary_min: jobInfo.salary_min || 0,
          salary_max: jobInfo.salary_max || 0,
          salary_type: jobInfo.salary_type || 'N/A',
          experience_required: jobInfo.experience_required || 'N/A',
          skills_required: Array.isArray(jobInfo.skills_required) 
            ? jobInfo.skills_required 
            : (jobInfo.skills_required ? jobInfo.skills_required.split(',').map(s => s.trim()) : []),
          no_of_vacancies: jobInfo.no_of_vacancies || 0,
          application_deadline: jobInfo.application_deadline || 'N/A',
          person_name: jobInfo.person_name || 'N/A',
          phone: jobInfo.phone || 'N/A',
          additional_contact: jobInfo.additional_contact || 'N/A',
          category_name: jobInfo.category_name || 'N/A',
          status: jobInfo.status || 'N/A',
          admin_action: jobInfo.admin_action || 'pending',
          created_at: jobInfo.created_at || 'N/A',
          ...jobInfo
        })
        setShowReviewModal(true)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response?.message || 'Failed to fetch job details',
          confirmButtonColor: '#5C9A24'
        })
      }
    } catch (error) {
      console.error('❌ Error fetching job details:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch job details. Please try again.',
        confirmButtonColor: '#5C9A24'
      })
    } finally {
      setLoadingJobDetails(false)
    }
  }, [])

  const handleReview = (jobId) => {
    if (jobId) {
      fetchJobDetails(jobId)
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Job ID not available',
        confirmButtonColor: '#5C9A24'
      })
    }
  }

  const handleCloseReviewModal = () => {
    setShowReviewModal(false)
    setSelectedJobDetails(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className={`${TAILWIND_COLORS.TEXT_MUTED} text-lg font-bold`}>📋</span>
            </div>
            <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Job Flag/Review System (Fraud/spam control)</h2>
          </div>
          <p className={`${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>Monitor & moderate flagged job postings and suspicious activities</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Flags */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Total Flags</p>
              <p className="text-2xl font-bold text-red-600">
                {loading ? '...' : filteredSummary.total_flags}
              </p>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                All time
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-xl">🚩</span>
            </div>
          </div>
        </div>

        {/* Under Review */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Under Review</p>
              <p className="text-2xl font-bold text-orange-600">
                {loading ? '...' : filteredSummary.under_review}
              </p>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>Pending action</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">⏳</span>
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {loading ? '...' : filteredSummary.resolved}
              </p>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                All time
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">✅</span>
            </div>
          </div>
        </div>

        {/* Blocked Jobs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Blocked Jobs</p>
              <p className="text-2xl font-bold text-red-600">
                {loading ? '...' : filteredSummary.blocked_jobs}
              </p>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>Spam/Fraud</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-xl">🚫</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex justify-center">
        <PillNavigation
          tabs={statusTabs}
          activeTab={statusFilter}
          onTabChange={setStatusFilter}
        />
      </div>

      {/* Job Flagging Details Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Job Flagging Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Job Title
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Company
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Flag Reason
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Severity
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>Loading job flags...</p>
                  </td>
                </tr>
              ) : finalFilteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>
                      No flagged jobs found {statusFilter > 0 ? `with status "${statusTabs[statusFilter].label}"` : ''} for the selected time period
                    </p>
                  </td>
                </tr>
              ) : (
                finalFilteredData.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{job.jobTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{job.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{job.flagReason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSeverityBadge(job.severity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        onClick={() => handleReview(job.jobId || job.id)}
                        variant="light"
                        size="sm"
                        icon="👁️"
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Job Details Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <LuBriefcase className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    Job Review Details
                  </h3>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                    Complete job information for review
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseReviewModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LuX size={24} className={TAILWIND_COLORS.TEXT_MUTED} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingJobDetails ? (
                <div className="flex items-center justify-center py-12">
                  <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>Loading job details...</p>
                </div>
              ) : selectedJobDetails ? (
                <div className="space-y-6">
                  {/* Job Title & Company */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className={`text-lg font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                      {selectedJobDetails.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <LuBuilding className={TAILWIND_COLORS.TEXT_MUTED} size={16} />
                      <span className={`${TAILWIND_COLORS.TEXT_MUTED}`}>
                        {selectedJobDetails.company_name}
                      </span>
                    </div>
                  </div>

                  {/* Job Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Job Type */}
                    <div>
                      <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                        Job Type
                      </label>
                      <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {selectedJobDetails.job_type}
                      </p>
                    </div>

                    {/* Location */}
                    <div>
                      <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                        Location
                      </label>
                      <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {selectedJobDetails.location}
                      </p>
                    </div>

                    {/* Salary */}
                    <div>
                      <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                        Salary
                      </label>
                      <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {selectedJobDetails.salary_min && selectedJobDetails.salary_max
                          ? `₹${selectedJobDetails.salary_min.toLocaleString()} - ₹${selectedJobDetails.salary_max.toLocaleString()} ${selectedJobDetails.salary_type || ''}`
                          : 'Not specified'}
                      </p>
                    </div>

                    {/* Experience Required */}
                    <div>
                      <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                        Experience Required
                      </label>
                      <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {selectedJobDetails.experience_required}
                      </p>
                    </div>

                    {/* Number of Vacancies */}
                    <div>
                      <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                        Number of Vacancies
                      </label>
                      <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {selectedJobDetails.no_of_vacancies}
                      </p>
                    </div>

                    {/* Application Deadline */}
                    <div>
                      <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                        Application Deadline
                      </label>
                      <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {selectedJobDetails.application_deadline !== 'N/A' 
                          ? new Date(selectedJobDetails.application_deadline).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>

                    {/* Category */}
                    <div>
                      <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                        Category
                      </label>
                      <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {selectedJobDetails.category_name}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                        Status
                      </label>
                      <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {selectedJobDetails.status}
                      </p>
                    </div>
                  </div>

                  {/* Skills Required */}
                  {selectedJobDetails.skills_required && selectedJobDetails.skills_required.length > 0 && (
                    <div>
                      <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>
                        Skills Required
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedJobDetails.skills_required.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Description */}
                  <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>
                      Job Description
                    </label>
                    <div className={`bg-gray-50 rounded-lg p-4 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: selectedJobDetails.description || 'No description available' 
                        }}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>
                      Contact Information
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                          Contact Person
                        </label>
                        <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          {selectedJobDetails.person_name}
                        </p>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                          Phone
                        </label>
                        <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          {selectedJobDetails.phone}
                        </p>
                      </div>
                      {selectedJobDetails.additional_contact && (
                        <div>
                          <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                            Additional Contact
                          </label>
                          <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                            {selectedJobDetails.additional_contact}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>No job details available</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                onClick={handleCloseReviewModal}
                variant="neutral"
                size="md"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FraudControlSystem