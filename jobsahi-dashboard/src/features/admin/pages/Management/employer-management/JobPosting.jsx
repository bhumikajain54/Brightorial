import React, { useState, useEffect, useCallback } from 'react'
import { 
  LuEye, 
  LuBuilding,
  LuMail,
  LuPhone,
  LuGlobe,
  LuMapPin,
  LuUsers,
  LuBriefcase,
  LuCalendar,
  LuFileText
} from 'react-icons/lu'
import { HiDotsVertical } from 'react-icons/hi'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant.js'
import { Button } from '../../../../../shared/components/Button.jsx'
import { getMethod } from '../../../../../service/api'
import apiService from '../../../../admin/services/serviceUrl'

// Job Posting Analytics Component
function JobPostingAnalytics() {
  const [timeFilter, setTimeFilter] = useState('All Time')
  const [viewDetailsModal, setViewDetailsModal] = useState({ isOpen: false, company: null })
  const [analyticsData, setAnalyticsData] = useState([])
  const [loading, setLoading] = useState(true)

  // Handle View Details
  const handleViewDetails = (company) => {
    setViewDetailsModal({ isOpen: true, company })
  }

  const handleCloseViewDetails = () => {
    setViewDetailsModal({ isOpen: false, company: null })
  }

  const timeFilterOptions = [
    'All Time',
    'Last 7 Days',
    'Last 30 Days',
    'Last 3 Months',
    'Last 6 Months',
    'Last Year'
  ]

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      console.log('📡 Fetching job posting analytics from:', apiService.adminJobPostingAnalytics)
      
      const response = await getMethod({
        apiUrl: apiService.adminJobPostingAnalytics
      })

      console.log('📥 Job Posting Analytics API Response:', response)

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      // ✅ Handle different response structures
      let dataArray = null;
      
      if (Array.isArray(response?.data)) {
        dataArray = response.data;
      } else if (Array.isArray(response)) {
        // If response itself is an array
        dataArray = response;
      } else if (response?.data && Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (response?.analytics && Array.isArray(response.analytics)) {
        dataArray = response.analytics;
      } else if (response?.result && Array.isArray(response.result)) {
        dataArray = response.result;
      }

      console.log('📊 Extracted data array:', dataArray)

      if (isSuccess && dataArray && dataArray.length > 0) {
        const mapped = dataArray.map((item, index) => {
          const jobsPosted = Number(item.jobs_posted || item.jobsPosted || 0)
          const totalApplicants = Number(item.total_applicants || item.totalApplicants || 0)
          const shortlisted = Number(item.shortlisted || 0)

          return {
            id: item.id || item.recruiter_id || item.company_id || index + 1,
            company: item.company_name || item.companyName || item.company || 'N/A',
            contactPerson: item.recruiter_name || item.recruiterName || item.contact_person || item.contactPerson || 'N/A',
            status: item.status || 'Active',
            jobsPosted,
            totalApplicants,
            shortlisted,
            lastActivity: item.last_activity || item.lastActivity || 'N/A',
            industry: item.industry || '—'
          }
        })
        console.log('✅ Mapped analytics data:', mapped)
        setAnalyticsData(mapped)
      } else {
        console.warn('⚠️ No analytics data found', {
          isSuccess,
          hasData: !!dataArray,
          dataLength: dataArray?.length,
          message: response?.message,
          responseKeys: Object.keys(response || {})
        })
        setAnalyticsData([])
      }
    } catch (error) {
      console.error('❌ Error fetching job posting analytics:', error)
      setAnalyticsData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    }
    
    const badgeClasses = statusStyles[status] || 'bg-gray-100 text-gray-800'
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClasses}`}>
        {status || 'N/A'}
      </span>
    )
  }

  const getSuccessRateBar = (rate) => {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{rate}%</span>
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gray-600 h-2 rounded-full" 
            style={{ width: `${rate}%` }}
          ></div>
        </div>
      </div>
    )
  }

  // Action Dropdown Component
  const ActionDropdown = ({ company, onViewDetails }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = React.useRef(null)

    // Close dropdown when clicking outside
    React.useEffect(() => {
      function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleViewDetails = () => {
      setIsOpen(false)
      onViewDetails(company)
    }

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
        >
          <HiDotsVertical className={TAILWIND_COLORS.TEXT_MUTED} size={18} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
            <button
              onClick={handleViewDetails}
              className={`w-full px-4 py-2 text-left text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200`}
            >
              <LuEye size={16} />
              View Details
            </button>
          </div>
        )}
      </div>
    )
  }

  // View Details Modal Component
  const ViewDetailsModal = ({ company, isOpen, onClose }) => {
    if (!isOpen || !company) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Company Details</h2>
            <button
              onClick={onClose}
              className={`${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY} transition-colors duration-200`}
            >
              <span className={`text-2xl ${TAILWIND_COLORS.TEXT_PRIMARY}`}>&times;</span>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Company Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuBuilding className="text-blue-600" size={20} />
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Company Name</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>{company.company}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Industry</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>{company.industry || 'Technology'}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Company Size</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>100-500 employees</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Website</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>
                    <a href={`https://${company.company.toLowerCase()}.com`} target="_blank" rel="noopener noreferrer" className={`${TAILWIND_COLORS.TEXT_PRIMARY} hover:underline`}>
                      {company.company.toLowerCase()}.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Person Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuUsers className="text-green-600" size={20} />
                Contact Person Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Contact Person</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>{company.contactPerson}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Email Address</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                    <LuMail size={16} className={TAILWIND_COLORS.TEXT_MUTED} />
                    <a href={`mailto:${company.contactPerson.toLowerCase().replace(' ', '.')}@${company.company.toLowerCase()}.com`} className={`${TAILWIND_COLORS.TEXT_PRIMARY} hover:underline`}>
                      {company.contactPerson.toLowerCase().replace(' ', '.')}@{company.company.toLowerCase()}.com
                    </a>
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Phone Number</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                    <LuPhone size={16} className={TAILWIND_COLORS.TEXT_MUTED} />
                    <a href="tel:+919876543210" className={`${TAILWIND_COLORS.TEXT_PRIMARY} hover:underline`}>
                      +91 9876543210
                    </a>
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Last Activity</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                    <LuCalendar size={16} className={TAILWIND_COLORS.TEXT_MUTED} />
                    {company.lastActivity}
                  </p>
                </div>
              </div>
            </div>

            {/* Job Posting Statistics */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuBriefcase className="text-purple-600" size={20} />
                Job Posting Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600 text-lg">💼</span>
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Jobs Posted</span>
                  </div>
                  <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{company.jobsPosted}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600 text-lg">👥</span>
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Total Applicants</span>
                  </div>
                  <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{company.totalApplicants.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-600 text-lg">⭐</span>
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Shortlisted</span>
                  </div>
                  <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{company.shortlisted}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 text-lg">🏢</span>
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Industry</span>
                  </div>
                  <p className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{company.industry || '—'}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuFileText className="text-orange-600" size={20} />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Company Address</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>123 Business Street, Tech City, TC 12345</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Registration Number</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>REG-2024-TC-001</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>GST Number</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>GST-2024-TC-001</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>PAN Number</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>PAN-2024-TC-001</p>
                </div>
              </div>
            </div>

            {/* Company Description */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Company Description</h3>
              <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} leading-relaxed`}>
                {company.company} is a leading technology company specializing in innovative solutions for modern businesses. 
                We are committed to providing exceptional services and building long-term partnerships with our clients. 
                Our team consists of experienced professionals dedicated to delivering high-quality results and maintaining 
                the highest standards of excellence in everything we do.
              </p>
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
            <Button
              onClick={onClose}
              variant="neutral"
              size="md"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg font-bold">📊</span>
            </div>
            <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Job Posting Analytics</h2>
          </div>
          <p className={`${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>Track jobs posted, applications received, and shortlisting activity</p>
        </div>
        
        {/* Time Filter */}
        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className={`appearance-none bg-green-50 ${TAILWIND_COLORS.TEXT_PRIMARY} px-4 py-2 pr-8 rounded-full text-sm font-medium border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500`}
          >
            {timeFilterOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className={TAILWIND_COLORS.TEXT_PRIMARY}>▼</span>
          </div>
        </div>
      </div>

      {/* Analytics Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Company
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Jobs Posted
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Total Applicants
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Shortlisted
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Industry
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Last Activity
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading analytics...
                  </td>
                </tr>
              ) : analyticsData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    No analytics data available.
                  </td>
                </tr>
              ) : (
                analyticsData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm font-medium`}>
                          {item.company?.charAt(0) || 'N'}
                        </span>
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{item.company}</div>
                        <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{item.contactPerson}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2">💼</span>
                      <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{item.jobsPosted}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2">👥</span>
                      <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{item.totalApplicants.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-yellow-600 mr-2">⭐</span>
                      <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{item.shortlisted}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {item.industry || '—'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {item.lastActivity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ActionDropdown 
                      company={item} 
                      onViewDetails={handleViewDetails} 
                    />
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      <ViewDetailsModal 
        company={viewDetailsModal.company}
        isOpen={viewDetailsModal.isOpen}
        onClose={handleCloseViewDetails}
      />
    </div>
  )
}

export default JobPostingAnalytics
