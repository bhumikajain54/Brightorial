import React, { useState, useEffect, useCallback } from 'react'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant'
import { Button } from '../../../../../shared/components/Button'
import { getMethod } from '../../../../../service/api'
import apiService from '../../../../admin/services/serviceUrl'

// Certificate Issuance Table Component
function CertificateIssuanceTable() {
  const [certificateData, setCertificateData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewModal, setViewModal] = useState({ isOpen: false, certificate: null })

  // Format date from YYYY-MM-DD to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return 'Issued'
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  // Fetch certificate issuance data
  const fetchCertificateIssuance = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getMethod({
        apiUrl: apiService.getCertificateIssuance
      })

      console.log('📜 Certificate Issuance API Response:', response)

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      if (isSuccess && response?.data && Array.isArray(response.data)) {
        // Map API response to component format - store all fields for modal
        const mappedData = response.data.map((cert) => ({
          certificate_id: cert.certificate_id,
          student: cert.student_name || 'N/A',
          student_name: cert.student_name || 'N/A',
          institute: cert.institute_name || 'N/A',
          institute_name: cert.institute_name || 'N/A',
          course: cert.course_title || 'N/A',
          course_title: cert.course_title || 'N/A',
          batch: cert.batch_name || 'N/A',
          batch_name: cert.batch_name || 'N/A',
          completionDate: formatDate(cert.issue_date),
          issue_date: cert.issue_date,
          issueDate: cert.issue_date,
          status: formatStatus(cert.status),
          originalStatus: cert.status,
          // Store all original data for modal
          ...cert
        }))

        console.log('✅ Mapped Certificate Data:', mappedData)
        setCertificateData(mappedData)
      } else {
        console.error('❌ Failed to fetch certificate issuance:', response?.message)
        setError(response?.message || 'Failed to fetch certificate issuance data')
        setCertificateData([])
      }
    } catch (error) {
      console.error('❌ Error fetching certificate issuance:', error)
      setError(error?.message || 'Failed to fetch certificate issuance data')
      setCertificateData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCertificateIssuance()
  }, [fetchCertificateIssuance])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
          <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Certificate Issuance</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchCertificateIssuance}
          className="flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className={`mt-4 text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading certificate data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Error loading certificate data</p>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCertificateIssuance}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                    Student
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                    Course
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                    Completion Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certificateData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className={`${TAILWIND_COLORS.TEXT_MUTED}`}>
                        <p className="text-lg font-medium">No certificates found</p>
                        <p className="text-sm mt-1">No certificate issuance records available</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  certificateData.map((certificate) => (
                    <tr key={certificate.certificate_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{certificate.student}</div>
                          <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{certificate.institute}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{certificate.course}</div>
                          {certificate.batch && (
                            <div className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>{certificate.batch}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{certificate.completionDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded ${
                            certificate.originalStatus === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : certificate.originalStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {certificate.status}
                          </span>
                          <Button
                            variant="light"
                            size="sm"
                            className="px-3 py-1 text-xs bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
                            onClick={() => setViewModal({ isOpen: true, certificate })}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Certificate Modal */}
      {viewModal.isOpen && viewModal.certificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">✓</span>
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Certificate Details</h2>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Certificate ID: #{viewModal.certificate.certificate_id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewModal({ isOpen: false, certificate: null })}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Student Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Student Name</label>
                    <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>{viewModal.certificate.student_name || viewModal.certificate.student || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Institute Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Institute Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Institute Name</label>
                    <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>{viewModal.certificate.institute_name || viewModal.certificate.institute || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Course Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Course Title</label>
                    <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>{viewModal.certificate.course_title || viewModal.certificate.course || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Batch Name</label>
                    <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>{viewModal.certificate.batch_name || viewModal.certificate.batch || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Certificate Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Certificate ID</label>
                    <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>#{viewModal.certificate.certificate_id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Issue Date</label>
                    <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {viewModal.certificate.completionDate || formatDate(viewModal.certificate.issue_date) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      viewModal.certificate.originalStatus === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : viewModal.certificate.originalStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {viewModal.certificate.status || 'N/A'}
                    </span>
                  </div>
                  {viewModal.certificate.issue_date && (
                    <div>
                      <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Raw Date</label>
                      <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-sm`}>{viewModal.certificate.issue_date}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Fields (if any from API) */}
              {Object.keys(viewModal.certificate).some(key => 
                !['certificate_id', 'student', 'student_name', 'institute', 'institute_name', 'course', 'course_title', 
                  'batch', 'batch_name', 'completionDate', 'issue_date', 'issueDate', 'status', 'originalStatus'].includes(key)
              ) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(viewModal.certificate)
                      .filter(([key]) => 
                        !['certificate_id', 'student', 'student_name', 'institute', 'institute_name', 'course', 'course_title', 
                          'batch', 'batch_name', 'completionDate', 'issue_date', 'issueDate', 'status', 'originalStatus'].includes(key)
                      )
                      .map(([key, value]) => (
                        <div key={key}>
                          <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </label>
                          <p className={`${TAILWIND_COLORS.TEXT_PRIMARY}`}>{String(value || 'N/A')}</p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
              <Button
                onClick={() => setViewModal({ isOpen: false, certificate: null })}
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

export default function CertificateIssuance() {
  return <CertificateIssuanceTable />
}


