import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LuBookOpen, 
  LuUsers, 
  LuMessageSquare, 
  LuFileText, 
  LuActivity, 
  LuSettings,
  LuStar,
  LuClock,
  // LuBarChart,
  LuBell,
  LuPlus,
  LuTrophy,
  LuTrendingUp
} from 'react-icons/lu'
import { Horizontal4Cards } from '../../../shared/components/metricCard'
import { TAILWIND_COLORS } from '../../../shared/WebConstant'
import { getMethod } from '../../../service/api'
import apiService from '../services/serviceUrl'

// 🔹 Helper: type → color mapping (for recent activities)
const getActivityColor = (type) => {
  switch (type) {
    case 'enrollment':
      return 'bg-blue-500'
    case 'certificate':
      return 'bg-green-500'
    case 'update':
      return 'bg-purple-500'
    default:
      return 'bg-orange-500'
  }
}

// 🔹 Helper: time ago formatting
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}

export default function Dashboard() {
  const navigate = useNavigate()

  // 🔹 KEY METRICS STATE (initial UI values as fallback)
  const [keyMetrics, setKeyMetrics] = useState([
    {
      title: 'Total Courses',
      value: '24',
      delta: '+2 from last month',
      icon: <LuBookOpen className="w-5 h-5" />
    },
    {
      title: 'Enrolled Students',
      value: '1,234',
      delta: '+15% from last month',
      icon: <LuUsers className="w-5 h-5" />
    },
    {
      title: 'Certified Students',
      value: '850',
      delta: '+8% from last month',
      icon: <LuTrophy className="w-5 h-5" />
    },
    {
      title: 'Placement Rate',
      value: '78%',
      delta: '+5% from last month',
      icon: <LuTrendingUp className="w-5 h-5" />
    }
  ])

  // 🔹 Recent Activities (initial dummy as fallback)
  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      text: 'New student enrolled in Welder course',
      time: '2 minutes ago',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      text: 'Certificate generated for Priya Sharma',
      time: '1 hour ago',
      color: 'bg-green-500'
    },
    {
      id: 3,
      text: 'Welder course curriculum updated',
      time: '3 hours ago',
      color: 'bg-purple-500'
    },
    {
      id: 4,
      text: 'Monthly report generated successfully',
      time: '1 day ago',
      color: 'bg-orange-500'
    }
  ])

  // 🔹 Course Statistics (initial dummy as fallback)
  const [courseStatistics, setCourseStatistics] = useState([
    {
      id: 1,
      course: 'Electrician',
      value: 82
    },
    {
      id: 2,
      course: 'Fitter',
      value: 58
    },
    {
      id: 3,
      course: 'Welder',
      value: 44
    },
    {
      id: 4,
      course: 'Mechanic Diesel',
      value: 36
    },
    {
      id: 5,
      course: 'COPA',
      value: 18
    }
  ])

  // 🔹 Staff Members State (initial empty as fallback)
  const [staffMembers, setStaffMembers] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [staffLoading, setStaffLoading] = useState(false)
  const [instituteName, setInstituteName] = useState('Brightorial')

  // 🔹 API CALL: institute_dashboard_stats.php
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await getMethod({
          apiUrl: apiService.dashboardStats // 👈 yaha apna endpoint key use karo
        })

        // Expect: { status: true, data: { summary, recent_activities, course_statistics } }
        if (!res?.status || !res.data) {
          throw new Error(res?.message || 'Failed to load dashboard stats')
        }

        const { summary, recent_activities, course_statistics } = res.data

        // ✅ 1) UPDATE KEY METRICS (summary)
        if (summary) {
          setKeyMetrics((prev) =>
            prev.map((metric) => {
              if (metric.title === 'Total Courses') {
                return { ...metric, value: String(summary.total_courses ?? 0) }
              }
              if (metric.title === 'Enrolled Students') {
                return { ...metric, value: String(summary.enrolled_students ?? 0) }
              }
              if (metric.title === 'Certified Students') {
                return { ...metric, value: String(summary.certified_students ?? 0) }
              }
              if (metric.title === 'Placement Rate') {
                const rate = summary.placement_rate ?? 0
                return { ...metric, value: `${rate}%` }
              }
              return metric
            })
          )
        }

        // ✅ 2) UPDATE RECENT ACTIVITIES
        if (Array.isArray(recent_activities) && recent_activities.length > 0) {
          const mappedActivities = recent_activities.map((item, idx) => ({
            id: idx + 1,
            text: item.title || item.text || item.message || 'Activity',
            time: formatTimeAgo(item.timestamp || item.created_at || item.date),
            color: getActivityColor(item.type || item.activity_type || 'default')
          }))
          setRecentActivities(mappedActivities)
        } else if (Array.isArray(recent_activities) && recent_activities.length === 0) {
          // If API returns empty array, show empty state (don't use fallback)
          setRecentActivities([])
        }
        // If recent_activities is missing/null, keep fallback data

        // ✅ 3) UPDATE COURSE STATISTICS
        if (Array.isArray(course_statistics)) {
          const mappedStats = course_statistics.map((item, idx) => ({
            id: idx + 1,
            course: item.course_title,
            value: Number(item.completion_rate ?? 0)
          }))
          setCourseStatistics(mappedStats)
        }

      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  // 🔹 API CALL: get_faculty_users.php
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setStaffLoading(true)

        const res = await getMethod({
          apiUrl: apiService.getFaculty
        })

        // Expect: { status: true, data: [faculty objects] }
        if (!res?.status || !Array.isArray(res.data)) {
          throw new Error(res?.message || 'Failed to load faculty data')
        }

        // ✅ MAP FACULTY DATA TO STAFF MEMBERS FORMAT
        const mappedStaff = res.data.map((faculty) => ({
          id: faculty.id,
          name: faculty.name || 'N/A',
          designation: faculty.role === 'faculty' ? 'Faculty' : faculty.role || 'Staff',
          department: faculty.institute_data?.institute_name || 'Institute',
          lastActive: faculty.email || 'N/A',
          email: faculty.email,
          phone: faculty.phone
        }))

        setStaffMembers(mappedStaff)

      } catch (err) {
        // Keep fallback data on error
      } finally {
        setStaffLoading(false)
      }
    }

    fetchFaculty()
  }, [])

  // 🔹 API CALL: getInstituteProfile - Fetch Institute Name
  useEffect(() => {
    const fetchInstituteName = async () => {
      try {
        const res = await getMethod({
          apiUrl: apiService.getInstituteProfile
        })

        if (res?.success) {
          let profile = null

          if (res?.data?.profiles?.length) profile = res.data.profiles[0]
          else if (res?.data) profile = res.data

          if (profile?.institute_info?.institute_name) {
            setInstituteName(profile.institute_info.institute_name)
          }
        }
      } catch (err) {
        // Keep default 'Brightorial' on error
      }
    }

    fetchInstituteName()
  }, [])

  // ================== NAV HANDLERS (same as your UI) ==================
  const handleCourseManagement = () => {
    navigate('/institute/course-management')
  }

  const handleStudentManagement = () => {
    navigate('/institute/student-management')
  }

  const handleMessagingAlerts = () => {
    navigate('/institute/messaging-alerts')
  }

  const handleCertificatesCompletion = () => {
    navigate('/institute/certificates-completion')
  }

  const handleReportsAnalytics = () => {
    navigate('/institute/reports-analytics')
  }

  const handleProfileSetting = () => {
    navigate('/institute/profile-setting')
  }

  const handleAddNewCourse = () => {
    navigate('/institute/course-management/create')
  }

  const handleGenerateReports = () => {
    navigate('/institute/reports-analytics')
  }

  const handleViewStudents = () => {
    navigate('/institute/student-management')
  }

  const handleSendNotification = () => {
    navigate('/institute/messaging-alerts')
  }

  // ================== JSX (UI SAME RAKHA HAI) ==================
  return (
    <div className={`p-2 bg-[#F6FAFF] min-h-screen ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
      {/* Optional small status line */}
      {loading && (
        <p className="text-xs text-gray-500 mb-2">Loading latest dashboard data...</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mb-2">Error: {error}</p>
      )}

      {/* Key Metrics Section - Using Horizontal4Cards */}
      <div className="mb-5">
        <Horizontal4Cards data={keyMetrics} />
      </div>

      {/* Greeting Section */}
      <div className="mb-5">
        <h1 className={`text-2xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Hi! {instituteName}</h1>
      </div>

      {/* Quick Actions and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Quick Actions Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center mb-4">
            <LuStar className="w-6 h-6 text-yellow-500 mr-2" />
            <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Quick Actions</h2>
          </div>
          <p className={`${TAILWIND_COLORS.TEXT_MUTED} mb-5`}>Frequently used actions for quick access.</p>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleAddNewCourse}
              className={`bg-[#3B82F6] ${TAILWIND_COLORS.TEXT_INVERSE} p-4 rounded-lg hover:bg-[#276edf] transition-colors flex items-center justify-center`}
            >
              <LuPlus className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Add New Course</span>
            </button>
            
            <button 
              onClick={handleGenerateReports}
              className={`bg-[#A855F7] ${TAILWIND_COLORS.TEXT_INVERSE} p-4 rounded-lg hover:bg-[#9421ff] transition-colors flex items-center justify-center`}
            >
              {/* <LuBarChart className="w-5 h-5 mr-2" /> */}
              <span className="text-sm font-medium">Generate Reports</span>
            </button>
            
            <button 
              onClick={handleViewStudents}
              className={`bg-[#22C55E] ${TAILWIND_COLORS.TEXT_INVERSE} p-4 rounded-lg hover:bg-[#2bae5b] transition-colors flex items-center justify-center`}
            >
              <LuUsers className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">View Students</span>
            </button>
            
            <button 
              onClick={handleSendNotification}
              className={`bg-[#F97316] ${TAILWIND_COLORS.TEXT_INVERSE} p-4 rounded-lg hover:bg-[#d56d23] transition-colors flex items-center justify-center`}
            >
              <LuBell className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Send Notification</span>
            </button>
          </div>
        </div>

        {/* Recent Activities Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center mb-5">
            <LuClock className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Recent Activities</h2>
          </div>
          <p className={`${TAILWIND_COLORS.TEXT_MUTED} mb-5`}>Latest updates and activities in your institute.</p>
          
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full ${activity.color} mt-2 flex-shrink-0`}></div>
                  <div className="flex-1">
                    <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-sm`}>{activity.text}</p>
                    <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-xs`}>{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm`}>No recent activities found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Statistics & Staff Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Course Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-6`}>Course Statistics</h2>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {courseStatistics.map((stat) => (
              <div
                key={stat.id}
                className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-lg font-semibold`}>{stat.course}</p>
                  <span className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm font-semibold`}>{stat.value}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#E7F0FF]">
                  <div
                    className="h-3 rounded-full bg-[#2563EB]"
                    style={{ width: `${stat.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Staff Management</h2>
            <button
              type="button"
              onClick={() => navigate('/institute/profile-setting/staff-management')}
              className="text-sm font-semibold text-[#2563EB] hover:text-[#1E4ECB]"
            >
              View All
            </button>
          </div>

          {staffLoading ? (
            <div className="text-center py-8">
              <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm`}>Loading staff members...</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {staffMembers.length > 0 ? (
                staffMembers.map((staff) => (
                  <div
                    key={staff.id}
                    className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-lg font-semibold`}>{staff.name}</p>
                        <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm`}>
                          {staff.designation} · {staff.department}
                        </p>
                        {staff.email && (
                          <p className="text-xs text-[#94A3B8] mt-1">Email: {staff.email}</p>
                        )}
                        {staff.phone && (
                          <p className="text-xs text-[#94A3B8]">Phone: {staff.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm`}>No staff members found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
