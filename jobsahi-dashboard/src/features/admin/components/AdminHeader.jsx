import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TAILWIND_COLORS, COLORS } from '../../../shared/WebConstant.js'
import Button from '../../../shared/components/Button.jsx'
import UserDropdown from '../../../shared/components/UserDropdown.jsx'
import DarkModeToggle from '../../../shared/components/DarkModeToggle.jsx'
import { getMethod } from '../../../service/api'
import apiService from '../services/serviceUrl'
import service from '../../../service/serviceUrl'

export default function Header({ toggleSidebar }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    try {
      const authUser = localStorage.getItem("authUser")
      return authUser ? JSON.parse(authUser) : { user_name: 'Admin User', role: 'Administrator' }
    } catch {
      return { user_name: 'Admin User', role: 'Administrator' }
    }
  })

  // Notification state
  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

  // Show all activities - no date filter
  const isWithinLast5Days = (dateString) => {
    // Always return true to show all activities
    return true
  }

  // Parse date string (handles MySQL datetime format and ISO format)
  const parseDate = (dateString) => {
    if (!dateString) return null
    
    // Handle MySQL datetime format: "YYYY-MM-DD HH:MM:SS"
    if (typeof dateString === 'string' && dateString.includes(' ') && !dateString.includes('T')) {
      const [datePart, timePart] = dateString.split(' ')
      const [year, month, day] = datePart.split('-')
      const [hours, minutes, seconds] = timePart ? timePart.split(':') : ['00', '00', '00']
      // Create date in local timezone (not UTC)
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds || 0)
      )
    }
    
    // Handle ISO format or other formats
    return new Date(dateString)
  }

  // Format date for display with proper relative time
  const formatNotificationDate = (dateString) => {
    if (!dateString) return 'Recently'
    
    const date = parseDate(dateString)
    if (!date || isNaN(date.getTime())) return 'Recently'
    
    const now = new Date()
    const diffMs = now - date
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    // Show relative time for recent items
    if (diffSeconds < 60) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    // For older items, show actual date and time
    const formattedDate = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
    const formattedTime = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    return `${formattedDate} at ${formattedTime}`
  }

  // Fetch recent notifications
  const fetchNotifications = useCallback(async () => {
    try {
      console.log('🔔 Fetching notifications...')
      const allNotifications = []

      // Fetch all recruiters
      try {
        console.log('📤 Fetching recruiters from:', service.employersList)
        const recruitersResponse = await getMethod({
          apiUrl: service.employersList
        })
        console.log('📥 Recruiters Response:', recruitersResponse)
        
        if (recruitersResponse?.status === true && recruitersResponse?.data) {
          const allRecruiters = Array.isArray(recruitersResponse.data) ? recruitersResponse.data : []
          console.log(`📊 Total recruiters: ${allRecruiters.length}`)
          
          // Process all recruiters - handle nested structure
          allRecruiters.forEach(recruiter => {
            const profile = recruiter.profile || recruiter.profile_info || recruiter.recruiter_info || {}
            const userInfo = recruiter.user_info || recruiter
            const companyName = recruiter.company_name || profile.company_name || userInfo.company_name || recruiter.name || userInfo.user_name || 'A recruiter'
            const date = recruiter.created_at || profile.created_at || userInfo.created_at || recruiter.registration_date || profile.registration_date || new Date().toISOString()
            
            allNotifications.push({
              id: `recruiter-${recruiter.id || recruiter.user_id || Date.now()}`,
              type: 'recruiter',
              title: 'New Recruiter Joined',
              message: `${companyName} has joined the platform`,
              date: date,
              icon: '👤',
              color: 'bg-blue-100 text-blue-800',
              name: companyName
            })
          })
          
          console.log(`✅ Added ${allRecruiters.length} recruiter activities`)
        } else {
          console.log('⚠️ Recruiters response not successful or no data')
        }
      } catch (error) {
        console.error('❌ Error fetching recruiters:', error)
      }

      // Fetch all institutes
      try {
        console.log('📤 Fetching institutes from:', service.institutesList)
        const institutesResponse = await getMethod({
          apiUrl: service.institutesList
        })
        console.log('📥 Institutes Response:', institutesResponse)
        
        if (institutesResponse?.status === true && institutesResponse?.data) {
          const allInstitutes = Array.isArray(institutesResponse.data) ? institutesResponse.data : []
          console.log(`📊 Total institutes: ${allInstitutes.length}`)
          
          // Process all institutes - handle nested structure
          allInstitutes.forEach(institute => {
            const userInfo = institute.user_info || institute
            const profileInfo = institute.profile_info || institute.institute_info || institute
            const instituteName = userInfo.user_name || profileInfo.institute_name || institute.institute_name || institute.name || 'An institute'
            const date = profileInfo.created_at || userInfo.created_at || institute.created_at || institute.registration_date || new Date().toISOString()
            
            allNotifications.push({
              id: `institute-${institute.id || institute.user_id || Date.now()}`,
              type: 'institute',
              title: 'New Institute Joined',
              message: `${instituteName} has joined the platform`,
              date: date,
              icon: '🏫',
              color: 'bg-green-100 text-green-800',
              name: instituteName
            })
          })
          
          console.log(`✅ Added ${allInstitutes.length} institute activities`)
        } else {
          console.log('⚠️ Institutes response not successful or no data')
        }
      } catch (error) {
        console.error('❌ Error fetching institutes:', error)
      }

      // Fetch all course completions
      try {
        console.log('📤 Fetching certificates from:', apiService.getCertificateIssuance)
        const certificatesResponse = await getMethod({
          apiUrl: apiService.getCertificateIssuance
        })
        console.log('📥 Certificates Response:', certificatesResponse)
        
        if (certificatesResponse?.status === true && certificatesResponse?.data) {
          const allCertificates = Array.isArray(certificatesResponse.data) ? certificatesResponse.data : []
          console.log(`📊 Total certificates: ${allCertificates.length}`)
          
          allCertificates.forEach(cert => {
            const studentName = cert.student_name || 'A student'
            const courseTitle = cert.course_title || 'a course'
            const date = cert.issue_date || new Date().toISOString()
            
            allNotifications.push({
              id: `certificate-${cert.certificate_id || Date.now()}`,
              type: 'certificate',
              title: 'Course Completed',
              message: `${studentName} completed "${courseTitle}"`,
              date: date,
              icon: '🎓',
              color: 'bg-purple-100 text-purple-800',
              institute: cert.institute_name,
              course: courseTitle,
              name: studentName
            })
          })
          
          console.log(`✅ Added ${allCertificates.length} certificate activities`)
        } else {
          console.log('⚠️ Certificates response not successful or no data')
        }
      } catch (error) {
        console.error('❌ Error fetching certificates:', error)
      }

      // Fetch all students
      try {
        console.log('📤 Fetching students from:', apiService.studentsList)
        const studentsResponse = await getMethod({
          apiUrl: apiService.studentsList
        })
        console.log('📥 Students Response:', studentsResponse)
        
        if (studentsResponse?.status === true && studentsResponse?.data) {
          const allStudents = Array.isArray(studentsResponse.data) ? studentsResponse.data : []
          console.log(`📊 Total students: ${allStudents.length}`)
          
          allStudents.forEach((student, index) => {
            const userInfo = student.user_info || student
            const profileInfo = student.profile_info || student
            const studentName = userInfo.user_name || profileInfo.student_name || student.student_name || student.name || 'A student'
            const date = profileInfo.created_at || userInfo.created_at || student.created_at || student.registration_date || new Date().toISOString()
            
            // Generate unique ID - use student.id, user_id, or combination of index and timestamp
            const studentId = student.id || student.user_id || `temp-${index}-${Date.now()}`
            
            allNotifications.push({
              id: `student-${studentId}`,
              type: 'student',
              title: 'New Student Registered',
              message: `${studentName} has registered on the platform`,
              date: date,
              icon: '🎓',
              color: 'bg-indigo-100 text-indigo-800',
              name: studentName
            })
          })
          
          console.log(`✅ Added ${allStudents.length} student activities`)
        } else {
          console.log('⚠️ Students response not successful or no data')
        }
      } catch (error) {
        console.error('❌ Error fetching students:', error)
      }

      // Fetch job applications from admin dashboard
      try {
        console.log('📤 Fetching job applications from:', apiService.adminDashboard)
        const dashboardResponse = await getMethod({
          apiUrl: apiService.adminDashboard
        })
        console.log('📥 Dashboard Response:', dashboardResponse)
        
        if (dashboardResponse?.status === true && dashboardResponse?.data) {
          const recentApplications = dashboardResponse.data.recent_applications || []
          console.log(`📊 Total applications: ${recentApplications.length}`)
          
          recentApplications.forEach(app => {
            const candidateName = app.candidate_name || app.student_name || app.name || app.user_name || 'A candidate'
            const jobTitle = app.job_title || app.jobTitle || app.applied_for || 'a job'
            const companyName = app.company_name || app.company || 'a company'
            const date = app.applied_date || app.created_at || app.date || new Date().toISOString()
            
            allNotifications.push({
              id: `application-${app.application_id || app.id || Date.now()}`,
              type: 'application',
              title: 'New Job Application',
              message: `${candidateName} applied for "${jobTitle}" at ${companyName}`,
              date: date,
              icon: '📝',
              color: 'bg-yellow-100 text-yellow-800',
              name: candidateName,
              job: jobTitle,
              company: companyName
            })
          })
          
          console.log(`✅ Added ${recentApplications.length} job application activities`)
        } else {
          console.log('⚠️ Dashboard response not successful or no data')
        }
      } catch (error) {
        console.error('❌ Error fetching job applications:', error)
      }

      // Fetch job postings
      try {
        console.log('📤 Fetching jobs from:', apiService.getJobs)
        const jobsResponse = await getMethod({
          apiUrl: apiService.getJobs
        })
        console.log('📥 Jobs Response:', jobsResponse)
        
        if (jobsResponse?.status === true && jobsResponse?.data) {
          const allJobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : []
          console.log(`📊 Total jobs: ${allJobs.length}`)
          
          allJobs.forEach(job => {
            const jobTitle = job.job_title || job.title || job.position || 'A job'
            const companyName = job.company_name || job.company || job.employer_name || 'A company'
            const date = job.created_at || job.posted_date || job.date || new Date().toISOString()
            
            allNotifications.push({
              id: `job-${job.job_id || job.id || Date.now()}`,
              type: 'job',
              title: 'New Job Posted',
              message: `${companyName} posted a new job: "${jobTitle}"`,
              date: date,
              icon: '💼',
              color: 'bg-emerald-100 text-emerald-800',
              name: companyName,
              job: jobTitle
            })
          })
          
          console.log(`✅ Added ${allJobs.length} job posting activities`)
        } else {
          console.log('⚠️ Jobs response not successful or no data')
        }
      } catch (error) {
        console.error('❌ Error fetching jobs:', error)
      }

      // Sort by date (newest first)
      allNotifications.sort((a, b) => {
        const dateA = new Date(a.date || 0)
        const dateB = new Date(b.date || 0)
        return dateB - dateA
      })

      // Show all notifications (no limit) or limit to 50 for better performance
      const limitedNotifications = allNotifications.slice(0, 50)
      
      console.log(`✅ Total notifications found: ${allNotifications.length}`)
      console.log(`✅ Showing: ${limitedNotifications.length} notifications`)
      console.log('📋 Notifications:', limitedNotifications)
      
      setNotifications(limitedNotifications)
      setNotificationCount(allNotifications.length) // Show total count, not limited count
    } catch (error) {
      console.error('❌ Error fetching notifications:', error)
    }
  }, [])

  // Fetch notifications on mount and every 5 minutes
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      try {
        const authUser = localStorage.getItem("authUser")
        if (authUser) {
          setUser(JSON.parse(authUser))
        }
      } catch (error) {
        console.error('Error updating user in header:', error)
      }
    }

    // Listen to custom event
    window.addEventListener('profileUpdated', handleProfileUpdate)
    
    // Also listen to storage events (for cross-tab updates)
    window.addEventListener('storage', () => {
      try {
        const authUser = localStorage.getItem("authUser")
        if (authUser) {
          setUser(JSON.parse(authUser))
        }
      } catch (error) {
        console.error('Error updating user from storage:', error)
      }
    })

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate)
    }
  }, [])

  return (
    <header className={`sticky top-0 z-30 flex items-center justify-between ${TAILWIND_COLORS.HEADER_BG} px-2 sm:px-4 md:px-6 py-2 sm:py-3 border-b ${TAILWIND_COLORS.BORDER}`}>
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <Button className="p-1.5 sm:p-2 rounded bg-white " onClick={toggleSidebar} aria-label="Toggle Sidebar" variant="unstyled">
          <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" className="w-5 h-5 sm:w-6 sm:h-6">
            <path d="M3 6h18M3 12h18M3 18h18"/>
          </svg>
        </Button>
      </div>

      <div className="flex-1 max-w-xs sm:max-w-md md:max-w-3xl mx-2 sm:mx-3 md:mx-6">
        <div className={`flex items-center bg-white border ${TAILWIND_COLORS.BORDER} rounded-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 shadow-sm`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="ml-1 sm:ml-2 w-full outline-none text-xs sm:text-sm placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button 
            className="relative p-1.5 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors" 
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 sm:w-5 sm:h-5">
            <path d="M18 16V11a6 6 0 10-12 0v5l-2 2h16l-2-2z"/>
          </svg>
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  Recent Activities ({notificationCount})
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto max-h-80">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>No activities found</p>
                    <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>All activities from the platform will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setShowNotifications(false)
                          // Navigate based on type
                          if (notification.type === 'recruiter') {
                            navigate('/admin/management?tab=employer-management')
                          } else if (notification.type === 'institute') {
                            navigate('/admin/management?tab=institute-management')
                          } else if (notification.type === 'certificate') {
                            navigate('/admin/management?tab=institute-management')
                          } else if (notification.type === 'student') {
                            navigate('/admin/management?tab=student-management')
                          } else if (notification.type === 'application') {
                            navigate('/admin/dashboard')
                          } else if (notification.type === 'job') {
                            navigate('/admin/job-course-control?tab=job-posting')
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${notification.color}`}>
                            {notification.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} truncate`}>
                              {notification.title}
                            </p>
                            <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-0.5 line-clamp-2`}>
                              {notification.message}
                            </p>
                            {notification.name && (
                              <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1 font-medium`}>
                                {notification.type === 'student' && 'Student: '}
                                {notification.type === 'recruiter' && 'Recruiter: '}
                                {notification.type === 'institute' && 'Institute: '}
                                {notification.name}
                              </p>
                            )}
                            {notification.institute && (
                              <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                                Institute: {notification.institute}
                              </p>
                            )}
                            {notification.job && (
                              <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                                Job: {notification.job}
                              </p>
                            )}
                            {notification.company && (
                              <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                                Company: {notification.company}
                              </p>
                            )}
                            <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                              {formatNotificationDate(notification.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      setShowNotifications(false)
                      navigate('/admin/tools-logs?tab=activity-logs')
                    }}
                    className={`text-xs font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} hover:underline w-full text-center`}
                  >
                    View All Activities
        </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Dark Mode Toggle */}
        <DarkModeToggle />

        {/* User Dropdown - Always visible but responsive */}
        <div className="block">
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  )
}
