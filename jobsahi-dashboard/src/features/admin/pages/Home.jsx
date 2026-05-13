import React, { useState, useEffect, useCallback } from 'react'
import { TAILWIND_COLORS } from '../../../shared/WebConstant.js'
import MetricCard, { MatrixCard, Horizontal4Cards } from '../../../shared/components/metricCard.jsx'
import DataTable from '../../../shared/components/DataTable.jsx'
import { Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js'
import {
  LuGraduationCap,
  LuBriefcase,
  LuUserCheck,
  LuTrendingUp,
  LuX,
  LuMail,
  LuPhone,
  LuMapPin,
  LuCalendar,
  LuCheck,
  LuBuilding2,
  LuUsers,
  LuSchool,
} from 'react-icons/lu'
import { getChartTooltipStyle, getChartTextColor, getChartGridColor, getChartColors } from '../../../shared/utils/chartColors'
import { getMethod } from '../../../service/api'
import apiService from '../services/serviceUrl'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler, ArcElement)

// View Details Modal Component
function ViewRegistrationModal({ registration, isOpen, onClose }) {
  if (!isOpen || !registration) return null

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Student':
        return <LuGraduationCap className="w-6 h-6 text-blue-600" />
      case 'Recruiter':
        return <LuBriefcase className="w-6 h-6 text-green-600" />
      case 'Institute':
        return <LuUserCheck className="w-6 h-6 text-purple-600" />
      default:
        return <LuUserCheck className="w-6 h-6 text-gray-600" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Student':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Recruiter':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'Institute':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[95vh] overflow-y-auto my-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10 shadow-sm">
          <h2 className={`text-lg sm:text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Registration Details
          </h2>
          <button
            onClick={onClose}
            className={`${TAILWIND_COLORS.TEXT_MUTED} hover:text-gray-600 transition-colors p-1`}
            aria-label="Close"
          >
            <LuX size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
            <div className={`p-3 rounded-lg ${getTypeColor(registration.type)}`}>
              {getTypeIcon(registration.type)}
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                {registration.name}
              </h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(registration.type)}`}>
                {registration.type}
              </span>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                registration.status === 'Active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {registration.status === 'Active' ? (
                  <LuCheck size={16} />
                ) : (
                  <LuX size={16} />
                )}
                {registration.status}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <LuMail className={`w-5 h-5 ${TAILWIND_COLORS.TEXT_MUTED} mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  {registration.email}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <LuPhone className={`w-5 h-5 ${TAILWIND_COLORS.TEXT_MUTED} mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  {registration.phone}
                </p>
              </div>
            </div>

            {/* Registration Date */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <LuCalendar className={`w-5 h-5 ${TAILWIND_COLORS.TEXT_MUTED} mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-xs text-gray-500 mb-1">Registration Date</p>
                <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  {registration.registrationDate}
                </p>
              </div>
            </div>

            {/* Verified Status */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className={`w-5 h-5 ${TAILWIND_COLORS.TEXT_MUTED} mt-0.5 flex-shrink-0 flex items-center justify-center`}>
                {registration.verified === 'Yes' ? (
                  <LuCheck className="w-5 h-5 text-green-600" />
                ) : (
                  <LuX className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Verification Status</p>
                <p className={`text-sm font-medium ${
                  registration.verified === 'Yes' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {registration.verified === 'Yes' ? 'Verified' : 'Not Verified'}
                </p>
              </div>
            </div>

            {/* Location */}
            {registration.location && registration.location !== '—' && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                <LuMapPin className={`w-5 h-5 ${TAILWIND_COLORS.TEXT_MUTED} mt-0.5 flex-shrink-0`} />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {registration.location}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Type-Specific Details */}
          {registration.type === 'Student' && registration.fullData && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <h4 className={`text-base font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>Student Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registration.fullData.profile_info?.dob && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {new Date(registration.fullData.profile_info.dob).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                )}
                
                {registration.fullData.profile_info?.gender && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Gender</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info.gender}
                    </p>
                  </div>
                )}
                
                {registration.fullData.profile_info?.cgpa && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">CGPA</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info.cgpa}
                    </p>
                  </div>
                )}
                
                {registration.fullData.profile_info?.graduation_year && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Graduation Year</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info.graduation_year}
                    </p>
                  </div>
                )}
              </div>
              
              {registration.fullData.profile_info?.skills && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {typeof registration.fullData.profile_info.skills === 'string' 
                      ? registration.fullData.profile_info.skills.split(',').map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {skill.trim()}
                          </span>
                        ))
                      : Array.isArray(registration.fullData.profile_info.skills)
                      ? registration.fullData.profile_info.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {skill}
                          </span>
                        ))
                      : null
                    }
                  </div>
                </div>
              )}
              
              {registration.fullData.profile_info?.bio && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Bio</p>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {registration.fullData.profile_info.bio}
                  </p>
                </div>
              )}
              
              {registration.fullData.profile_info?.education && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Education</p>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {typeof registration.fullData.profile_info.education === 'string' 
                      ? registration.fullData.profile_info.education
                      : JSON.stringify(registration.fullData.profile_info.education)
                    }
                  </p>
                </div>
              )}
              
              {registration.fullData.profile_info?.experience && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Experience</p>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {typeof registration.fullData.profile_info.experience === 'string' 
                      ? registration.fullData.profile_info.experience
                      : JSON.stringify(registration.fullData.profile_info.experience)
                    }
                  </p>
                </div>
              )}
              
              {registration.fullData.courses && registration.fullData.courses.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Courses</p>
                  <div className="flex flex-wrap gap-2">
                    {registration.fullData.courses.map((course, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {course.course_name || course.title || course.name || 'Course'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {registration.type === 'Recruiter' && registration.fullData && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <h4 className={`text-base font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>Company Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(registration.fullData.profile_info?.company_name || registration.fullData.profile?.company_name) && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Company Name</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info?.company_name || registration.fullData.profile?.company_name}
                    </p>
                  </div>
                )}
                
                {(registration.fullData.profile_info?.industry_type || registration.fullData.profile?.industry) && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Industry Type</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info?.industry_type || registration.fullData.profile?.industry}
                    </p>
                  </div>
                )}
                
                {(registration.fullData.profile_info?.designation || registration.fullData.profile?.designation) && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Designation</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info?.designation || registration.fullData.profile?.designation}
                    </p>
                  </div>
                )}
                
                {(registration.fullData.profile_info?.company_website || registration.fullData.profile?.website) && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Website</p>
                    <a href={registration.fullData.profile_info?.company_website || registration.fullData.profile?.website} target="_blank" rel="noopener noreferrer" className={`text-sm font-medium text-blue-600 hover:underline`}>
                      {registration.fullData.profile_info?.company_website || registration.fullData.profile?.website}
                    </a>
                  </div>
                )}
                
                {(registration.fullData.profile_info?.gst_pan || registration.fullData.profile?.gst_pan) && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">GST/PAN</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info?.gst_pan || registration.fullData.profile?.gst_pan}
                    </p>
                  </div>
                )}
              </div>
              
              {(registration.fullData.profile_info?.office_address || registration.fullData.profile?.location) && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Office Address</p>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {registration.fullData.profile_info?.office_address || registration.fullData.profile?.location}
                  </p>
                </div>
              )}
            </div>
          )}

          {registration.type === 'Institute' && registration.fullData && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <h4 className={`text-base font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>Institute Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registration.fullData.profile_info?.institute_name && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Institute Name</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info.institute_name}
                    </p>
                  </div>
                )}
                
                {registration.fullData.profile_info?.institute_type && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Institute Type</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info.institute_type}
                    </p>
                  </div>
                )}
                
                {registration.fullData.profile_info?.registration_number && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Registration Number</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info.registration_number}
                    </p>
                  </div>
                )}
                
                {registration.fullData.profile_info?.affiliation_details && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Affiliation</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info.affiliation_details}
                    </p>
                  </div>
                )}
                
                {registration.fullData.profile_info?.principal_name && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Principal/Head Name</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info.principal_name}
                    </p>
                  </div>
                )}
                
                {registration.fullData.profile_info?.established_year && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Established Year</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info.established_year}
                    </p>
                  </div>
                )}
                
                {registration.fullData.profile_info?.institute_website && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Website</p>
                    <a href={registration.fullData.profile_info.institute_website} target="_blank" rel="noopener noreferrer" className={`text-sm font-medium text-blue-600 hover:underline`}>
                      {registration.fullData.profile_info.institute_website}
                    </a>
                  </div>
                )}
                
                {registration.fullData.profile_info?.postal_code && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Postal Code</p>
                    <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {registration.fullData.profile_info.postal_code}
                    </p>
                  </div>
                )}
              </div>
              
              {registration.fullData.profile_info?.institute_address && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Institute Address</p>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {registration.fullData.profile_info.institute_address}
                  </p>
                </div>
              )}
              
              {registration.fullData.profile_info?.description && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Description</p>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {registration.fullData.profile_info.description}
                  </p>
                </div>
              )}
              
              {registration.fullData.profile_info?.courses_offered && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Courses Offered</p>
                  <div className="flex flex-wrap gap-2">
                    {typeof registration.fullData.profile_info.courses_offered === 'string' 
                      ? registration.fullData.profile_info.courses_offered.split(',').map((course, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {course.trim()}
                          </span>
                        ))
                      : Array.isArray(registration.fullData.profile_info.courses_offered)
                      ? registration.fullData.profile_info.courses_offered.map((course, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {course}
                          </span>
                        ))
                      : null
                    }
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ID Information */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Registration ID</p>
            <p className={`text-sm font-mono ${TAILWIND_COLORS.TEXT_MUTED}`}>
              {registration.id}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${TAILWIND_COLORS.BTN_PRIMARY} text-white font-medium hover:opacity-90 transition-opacity`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function PlacementSuccess({ funnelData }) {
  const items = [
    { value: funnelData?.applications || '0', label: 'Applications', sub: 'Ready for placement', color: 'bg-emerald-500' },
    { value: funnelData?.interviews || '0', label: 'Interviews', sub: 'Shortlisted candidates', color: 'bg-blue-500' },
    { 
      value: funnelData?.active_courses || funnelData?.offers || '0', 
      label: 'Courses', 
      sub: 'Courses currently active', 
      color: 'bg-amber-500' 
    },
    { value: funnelData?.hired || '0', label: 'Hired', sub: 'Successfully placed', color: 'bg-rose-500' },
  ]
  return (
    <div className={`${TAILWIND_COLORS.CARD} p-3 sm:p-4 md:p-5`}>
      <div className="font-medium my-3 sm:my-4 md:mb-6 lg:mb-10 text-lg sm:text-xl text-center md:text-left">Placement Success Funnel</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((it)=> (
          <div key={it.label} className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 ${it.color} rounded-full flex items-center justify-center text-white text-sm sm:text-base lg:text-lg xl:text-xl font-semibold shadow-sm`}>{it.value}</div>
            <div className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-gray-800">{it.label}</div>
            <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-500 text-center">{it.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    cards: {
      total_students: '0',
      applied_jobs: '0',
      interview_jobs: '0',
      active_jobs: '0',
      active_courses: '0',
      total_institutes: '0',
      total_recruiters: '0'
    },
    placement_funnel: {
      applications: '0',
      interviews: '0',
      active_courses: '0',
      hired: '0'
    },
    applications_trend: [],
    top_jobs_in_demand: [],
    recent_applications: []
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [recentRegistrations, setRecentRegistrations] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(false)
  const [viewModal, setViewModal] = useState({ isOpen: false, registration: null })

  // Format number with commas
  const formatNumber = (num) => {
    if (!num) return '0'
    return Number(num).toLocaleString('en-IN')
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === '—') return '—'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard data and jobs in parallel
      const [dashboardResponse, jobsResponse] = await Promise.allSettled([
        getMethod({ apiUrl: apiService.adminDashboard }),
        getMethod({ apiUrl: apiService.getJobs })
      ])

      const response = dashboardResponse.status === 'fulfilled' ? dashboardResponse.value : null
      const jobsData = jobsResponse.status === 'fulfilled' ? jobsResponse.value : null

      console.log('📊 Admin Dashboard API Response:', response)
      console.log('📊 Jobs API Response:', jobsData)

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      // Calculate job counts from jobs API
      let appliedJobsCount = '0'
      let interviewJobsCount = '0'
      let activeJobsCount = '0'

      if (jobsData?.status === true && Array.isArray(jobsData?.data)) {
        const allJobs = jobsData.data
        // Count active jobs (approved and active status)
        activeJobsCount = String(allJobs.filter(job => 
          job.admin_action === 'approved' || 
          job.status === 'active' || 
          job.status === 'open' ||
          (job.admin_action !== 'rejected' && job.admin_action !== 'pending')
        ).length)
        
        console.log('📊 Job counts calculated:', {
          totalJobs: allJobs.length,
          activeJobs: activeJobsCount
        })
      }

      // Use placement_funnel data for applications and interviews
      if (isSuccess && response?.data) {
        const placementFunnel = response.data.placement_funnel || {}
        appliedJobsCount = placementFunnel.applications || response.data.cards?.applied_jobs || '0'
        interviewJobsCount = placementFunnel.interviews || response.data.cards?.interview_jobs || '0'
        
        setDashboardData({
          cards: {
            total_students: response.data.cards?.total_students || '0',
            applied_jobs: appliedJobsCount,
            interview_jobs: interviewJobsCount,
            active_jobs: activeJobsCount,
            active_courses: response.data.cards?.active_courses || '0',
            total_institutes: response.data.cards?.total_institutes || '0',
            total_recruiters: response.data.cards?.total_recruiters || '0'
          },
          placement_funnel: placementFunnel,
          applications_trend: response.data.applications_trend || [],
          top_jobs_in_demand: response.data.top_jobs_in_demand || [],
          recent_applications: response.data.recent_applications || []
        })
        
        // Format recent applications for table
        const formattedApplications = (response.data.recent_applications || []).map((app, index) => {
          const dateString = app.applied_date || app.created_at || app.date || '—'
          return {
            id: app.application_id || app.id || index + 1,
            name: app.candidate_name || app.student_name || app.name || app.user_name || '—',
            jobTitle: app.job_title || app.jobTitle || app.applied_for || '—',
            company: app.company_name || app.company || '—',
            datePosted: formatDate(dateString),
            status: app.status || 'Pending',
            email: app.email || '—',
            phone: app.phone_number || app.phone || '—'
          }
        })
        setRecentApplications(formattedApplications)
      } else {
        console.error('❌ Failed to fetch dashboard data:', response?.message)
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch recent registrations (Students, Recruiters, Institutes)
  const fetchRecentRegistrations = useCallback(async () => {
    // Format date helper function
    const formatDateForTable = (dateString) => {
      if (!dateString || dateString === '—') return '—'
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } catch {
        return dateString
      }
    }

    try {
      setLoadingRecent(true)
      
      // Fetch all three types in parallel with error handling
      const results = await Promise.allSettled([
        getMethod({ apiUrl: apiService.studentsList }),
        getMethod({ apiUrl: apiService.employersList }),
        getMethod({ apiUrl: apiService.institutesList })
      ])
      
      const [studentsRes, recruitersRes, institutesRes] = results.map((result, index) => {
        const typeName = index === 0 ? 'students' : index === 1 ? 'recruiters' : 'institutes'
        if (result.status === 'fulfilled') {
          const response = result.value
          console.log(`✅ ${typeName} API success:`, {
            status: response?.status,
            hasData: !!response?.data,
            dataLength: Array.isArray(response?.data) ? response.data.length : 'not array',
            dataType: typeof response?.data,
            keys: response ? Object.keys(response) : []
          })
          return response
        } else {
          console.error(`❌ Error fetching ${typeName}:`, result.reason)
          return { status: false, data: [], rows: [] }
        }
      })

      console.log('📊 Recent Registrations API Responses:', {
        students: studentsRes,
        recruiters: recruitersRes,
        institutes: institutesRes
      })

      // Log data structure for debugging
      console.log('📋 Students data structure:', {
        isArray: Array.isArray(studentsRes?.data),
        hasData: !!studentsRes?.data,
        hasRows: !!studentsRes?.rows,
        dataType: typeof studentsRes?.data,
        keys: studentsRes ? Object.keys(studentsRes) : []
      })

      // Process students - handle nested structure (user_info, profile_info)
      // Check if response is successful first
      const isStudentsSuccess = studentsRes?.status === true || studentsRes?.status === 'success' || studentsRes?.success === true
      const studentsData = isStudentsSuccess && Array.isArray(studentsRes?.data) 
        ? studentsRes.data 
        : Array.isArray(studentsRes?.rows) 
        ? studentsRes.rows 
        : Array.isArray(studentsRes) 
        ? studentsRes 
        : []
      
      console.log('📋 Processing students:', {
        isSuccess: isStudentsSuccess,
        dataLength: studentsData.length,
        firstItem: studentsData[0] ? Object.keys(studentsData[0]) : 'no items'
      })
      
      const students = studentsData.map(item => {
        // Handle nested structure (user_info, profile_info)
        const userInfo = item.user_info || item
        const profileInfo = item.profile_info || item
        
        return {
          id: userInfo.user_id || userInfo.id || item.id || '—',
          type: 'Student',
          name: userInfo.user_name || userInfo.name || item.name || item.student_name || '—',
          email: userInfo.email || item.email || '—',
          phone: userInfo.phone_number || userInfo.phone || item.phone_number || item.phone || '—',
          registrationDate: profileInfo.created_at || userInfo.created_at || item.created_at || item.registration_date || item.date || '—',
          status: userInfo.status || profileInfo.status || item.status || (userInfo.is_verified === 1 ? 'Active' : 'Pending'),
          verified: userInfo.is_verified === 1 || profileInfo.is_verified === 1 ? 'Yes' : 'No',
          location: profileInfo.location || userInfo.location || item.location || '—',
          // Store full original data for modal
          fullData: {
            user_info: userInfo,
            profile_info: profileInfo,
            courses: item.courses || [],
            applied_jobs: item.applied_jobs || []
          }
        }
      })

      // Process recruiters - handle nested structure
      const isRecruitersSuccess = recruitersRes?.status === true || recruitersRes?.status === 'success' || recruitersRes?.success === true
      const recruitersData = isRecruitersSuccess && Array.isArray(recruitersRes?.data) 
        ? recruitersRes.data 
        : Array.isArray(recruitersRes?.rows) 
        ? recruitersRes.rows 
        : Array.isArray(recruitersRes) 
        ? recruitersRes 
        : []
      
      console.log('📋 Processing recruiters:', {
        isSuccess: isRecruitersSuccess,
        dataLength: recruitersData.length,
        firstItem: recruitersData[0] ? {
          keys: Object.keys(recruitersData[0]),
          hasProfile: !!recruitersData[0].profile,
          hasUserInfo: !!recruitersData[0].user_info,
          hasProfileInfo: !!recruitersData[0].profile_info,
          sample: recruitersData[0]
        } : 'no items'
      })
      
      const recruiters = recruitersData.map(item => {
        // Handle different response structures
        // Structure 1: item.profile (from employersList API) - most common
        // Structure 2: item.user_info, item.profile_info (nested)
        // Structure 3: flat structure
        
        const profile = item.profile || item.profile_info || item.recruiter_info || {}
        const userInfo = item.user_info || item
        
        // Extract date from multiple possible fields
        const registrationDate = profile.applied_date || 
                               profile.created_at || 
                               item.created_at || 
                               userInfo.created_at || 
                               item.registration_date || 
                               item.date ||
                               profile.registration_date ||
                               '—'
        
        return {
          id: item.user_id || userInfo.user_id || userInfo.id || item.id || profile.profile_id || '—',
          type: 'Recruiter',
          name: item.user_name || userInfo.user_name || profile.company_name || item.company_name || item.name || '—',
          email: item.email || userInfo.email || profile.company_email || item.company_email || '—',
          phone: item.phone_number || userInfo.phone_number || profile.company_contact || item.company_contact || item.phone_number || item.phone || '—',
          registrationDate: registrationDate,
          status: profile.status || item.status || userInfo.status || (item.is_verified === 1 ? 'Active' : 'Pending'),
          verified: item.is_verified === 1 || userInfo.is_verified === 1 ? 'Yes' : 'No',
          location: profile.location || profile.office_address || item.office_address || item.location || '—',
          // Store full original data for modal
          fullData: {
            user_info: userInfo,
            profile_info: profile,
            profile: profile,
            original: item
          }
        }
      })
      
      console.log('✅ Processed recruiters:', {
        count: recruiters.length,
        sample: recruiters[0] || null,
        allRecruiters: recruiters
      })

      // Process institutes - handle nested structure
      const isInstitutesSuccess = institutesRes?.status === true || institutesRes?.status === 'success' || institutesRes?.success === true
      const institutesData = isInstitutesSuccess && Array.isArray(institutesRes?.data) 
        ? institutesRes.data 
        : Array.isArray(institutesRes?.rows) 
        ? institutesRes.rows 
        : Array.isArray(institutesRes) 
        ? institutesRes 
        : []
      
      console.log('📋 Processing institutes:', {
        isSuccess: isInstitutesSuccess,
        dataLength: institutesData.length
      })
      
      const institutes = institutesData.map(item => {
        // Handle nested structure
        const userInfo = item.user_info || item
        const profileInfo = item.profile_info || item.institute_info || item
        
        return {
          id: userInfo.user_id || userInfo.id || item.id || '—',
          type: 'Institute',
          name: userInfo.user_name || profileInfo.institute_name || item.institute_name || item.name || '—',
          email: userInfo.email || profileInfo.institute_email || item.institute_email || item.email || '—',
          phone: userInfo.phone_number || profileInfo.institute_contact || item.institute_contact || item.phone_number || item.phone || '—',
          registrationDate: profileInfo.created_at || userInfo.created_at || item.created_at || item.registration_date || item.date || '—',
          status: userInfo.status || profileInfo.status || item.status || (userInfo.is_verified === 1 ? 'Active' : 'Pending'),
          verified: userInfo.is_verified === 1 || profileInfo.is_verified === 1 ? 'Yes' : 'No',
          location: profileInfo.institute_address || profileInfo.location || item.institute_address || item.location || '—',
          // Store full original data for modal
          fullData: {
            user_info: userInfo,
            profile_info: profileInfo,
            institute_info: profileInfo
          }
        }
      })

      // Combine all and sort by date (most recent first)
      console.log('📊 Before combining:', {
        students: students.length,
        recruiters: recruiters.length,
        institutes: institutes.length,
        sampleRecruiter: recruiters[0] || null
      })
      
      const allRegistrations = [...students, ...recruiters, ...institutes]
        .filter(item => {
          // Don't filter out items without dates, just use a default
          if (!item.registrationDate || item.registrationDate === '—') {
            item.registrationDate = new Date().toISOString() // Use current date as fallback
          }
          return true
        })
        .sort((a, b) => {
          const dateA = new Date(a.registrationDate)
          const dateB = new Date(b.registrationDate)
          // Handle invalid dates
          if (isNaN(dateA.getTime())) return 1
          if (isNaN(dateB.getTime())) return -1
          return dateB - dateA // Most recent first
        })
      
      console.log('📊 After combining and sorting:', {
        total: allRegistrations.length,
        byType: {
          students: allRegistrations.filter(r => r.type === 'Student').length,
          recruiters: allRegistrations.filter(r => r.type === 'Recruiter').length,
          institutes: allRegistrations.filter(r => r.type === 'Institute').length
        }
      })
      
      // Take at least 10 records (or all if less than 10)
      const limitedRegistrations = allRegistrations.length >= 10 
        ? allRegistrations.slice(0, 10) 
        : allRegistrations

      // Format dates (preserve fullData)
      const formattedRegistrations = limitedRegistrations.map(item => ({
        ...item,
        registrationDate: formatDateForTable(item.registrationDate),
        // Ensure fullData is preserved
        fullData: item.fullData || {}
      }))

      setRecentRegistrations(formattedRegistrations)
      console.log('✅ Recent Registrations formatted:', formattedRegistrations)
      console.log('📊 Total registrations found:', {
        students: students.length,
        recruiters: recruiters.length,
        institutes: institutes.length,
        total: allRegistrations.length,
        limited: limitedRegistrations.length,
        formatted: formattedRegistrations.length
      })
    } catch (error) {
      console.error('❌ Error fetching recent registrations:', error)
      // Set empty array on error to prevent breaking the UI
      setRecentRegistrations([])
    } finally {
      setLoadingRecent(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    // Call fetchRecentRegistrations on mount
    fetchRecentRegistrations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const overview = [
    { title:'Total Students', value: formatNumber(dashboardData.cards.total_students), icon:<LuGraduationCap className="w-5 h-5" /> },
    { title:'Total Institutes', value: formatNumber(dashboardData.cards.total_institutes), icon:<LuSchool className="w-5 h-5" /> },
    { title:'Total Recruiters', value: formatNumber(dashboardData.cards.total_recruiters), icon:<LuBuilding2 className="w-5 h-5" /> },
    { title:'Active Jobs', value: formatNumber(dashboardData.cards.active_jobs), icon:<LuTrendingUp className="w-5 h-5" /> },
  ]

  const palette = getChartColors()

  // Get last 6 months dynamically
  const getLast6Months = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentDate = new Date()
    const last6Months = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      last6Months.push(months[date.getMonth()])
    }
    
    return last6Months
  }

  // Process applications trend data for chart - always show last 6 months
  const processTrendData = () => {
    const last6Months = getLast6Months()
    const dataMap = new Map()
    
    // Map API data by month name (handle different formats)
    if (dashboardData.applications_trend && dashboardData.applications_trend.length > 0) {
      dashboardData.applications_trend.forEach(item => {
        let monthName = item.month_name || item.month || item.label || ''
        // Normalize month name to match our format (first 3 letters)
        if (monthName.length > 3) {
          monthName = monthName.substring(0, 3)
        }
        monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase()
        const value = Number(item.total || item.value || item.count || 0)
        dataMap.set(monthName, value)
      })
    }
    
    // Create data array for last 6 months, using 0 if no data
    const data = last6Months.map(month => dataMap.get(month) || 0)
    
    return { labels: last6Months, data }
  }

  const trendData = processTrendData()

  const lineData = {
    labels: trendData.labels,
    datasets: [
      {
        label: 'Applications',
        data: trendData.data,
        borderColor: palette.info,
        backgroundColor: 'rgba(12, 90, 141, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: palette.info,
        pointBorderColor: palette.info,
      },
    ],
  }
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false }, 
      tooltip: { 
        mode: 'index', 
        intersect: false,
        ...getChartTooltipStyle()
      } 
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: {
          color: getChartTextColor(),
          font: {
            size: 12
          }
        }
      },
      y: { 
        grid: { color: getChartGridColor() }, 
        beginAtZero: true,
        ticks: { 
          stepSize: trendData.data.length > 0 && Math.max(...trendData.data) > 0 
            ? Math.max(1, Math.ceil(Math.max(...trendData.data) / 5)) 
            : 1,
          color: getChartTextColor(),
          font: {
            size: 12
          }
        } 
      },
    },
  }


  return (
    <div className="space-y-4 sm:space-y-6">
      <MatrixCard 
        title="Dashboard Overview"
        subtitle="Monitor your platform's key metrics and performance"
      />

      <Horizontal4Cards data={overview} />

      <PlacementSuccess funnelData={dashboardData.placement_funnel} />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className={`${TAILWIND_COLORS.CARD} p-3 sm:p-4`}> 
          <div className="font-medium my-3 sm:my-4 md:mb-6 lg:mb-10 text-lg sm:text-xl text-center md:text-left">Applications Trend (Last 6 Months)</div>
          <div className="h-48 sm:h-56 md:h-64">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className={`${TAILWIND_COLORS.CARD} p-3 sm:p-4`}>
          <div className="font-medium my-3 sm:my-4 md:mb-6 lg:mb-10 text-lg sm:text-xl text-center md:text-left">Top Jobs in Demand</div>
          <div className="h-48 sm:h-56 md:h-64">
            {dashboardData.top_jobs_in_demand && dashboardData.top_jobs_in_demand.length > 0 ? (
              <Pie 
                data={{
                  labels: dashboardData.top_jobs_in_demand.map(job => job.title || 'N/A'),
                  datasets: [{
                    data: dashboardData.top_jobs_in_demand.map(job => Number(job.total_applications || 0)),
                    backgroundColor: [
                      palette.info,
                      palette.success,
                      palette.warning,
                      palette.error,
                      palette.secondary,
                      '#8B5CF6',
                      '#EC4899',
                      '#14B8A6',
                    ],
                    borderWidth: 0,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                          size: 11,
                          weight: '400'
                        },
                        color: getChartTextColor(),
                        boxWidth: 6,
                      }
                    },
                    tooltip: {
                      ...getChartTooltipStyle(),
                      callbacks: {
                        label: function(context) {
                          const label = context.label || ''
                          const value = context.parsed
                          return `${label}: ${value} application${value !== 1 ? 's' : ''}`
                        }
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No jobs data available
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Applications Table */}
      {recentApplications.length > 0 && (
        <div className={`${TAILWIND_COLORS.CARD} p-3 sm:p-4`}>
          <DataTable
            title="Recent Applications"
            columns={[
              { header: 'Candidate Name', key: 'name' },
              { header: 'Job Title', key: 'jobTitle' },
              { header: 'Company', key: 'company' },
              { header: 'Applied Date', key: 'datePosted' },
              { header: 'Status', key: 'status' }
            ]}
            data={recentApplications}
            actions={[
              {
                label: 'View',
                variant: 'primary',
                onClick: (row) => {
                  console.log('View application:', row)
                  // Add view functionality here
                }
              }
            ]}
            showActions={true}
            onViewDetails={(row) => {
              console.log('View details:', row)
              // Add view details functionality here
            }}
          />
        </div>
      )}

      {/* Recent Registrations Table (Students, Recruiters, Institutes) */}
      <div className={`${TAILWIND_COLORS.CARD} p-3 sm:p-4`}>
        <DataTable
          title="Recent Registrations"
          columns={[
            { header: 'Type', key: 'type' },
            { header: 'Name', key: 'name' },
            { header: 'Email', key: 'email' },
            { header: 'Phone', key: 'phone' },
            { header: 'Registration Date', key: 'registrationDate' },
            { header: 'Status', key: 'status' },
            { header: 'Verified', key: 'verified' }
          ]}
          data={recentRegistrations}
          actions={[
            {
              label: 'View',
              variant: 'primary',
              onClick: (row) => {
                setViewModal({ isOpen: true, registration: row })
              }
            }
          ]}
          showActions={true}
          onViewDetails={(row) => {
            setViewModal({ isOpen: true, registration: row })
          }}
        />
        {loadingRecent && (
          <div className="text-center py-4 text-gray-500">
            Loading recent registrations...
          </div>
        )}
      </div>

      {/* View Registration Details Modal */}
      <ViewRegistrationModal
        registration={viewModal.registration}
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, registration: null })}
      />
    </div>
  )
}
