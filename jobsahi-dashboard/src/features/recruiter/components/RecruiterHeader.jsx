import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TAILWIND_COLORS, COLORS } from '../../../shared/WebConstant'
import Button from '../../../shared/components/Button.jsx'
import UserDropdown from '../../../shared/components/UserDropdown.jsx'
import DarkModeToggle from '../../../shared/components/DarkModeToggle.jsx'
import { getMethod } from '../../../service/api'
import apiService from '../services/serviceUrl'

export default function RecruiterHeader({ toggleSidebar }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    try {
      const authUser = localStorage.getItem("authUser")
      return authUser ? JSON.parse(authUser) : { user_name: 'Recruiter User', role: 'Recruiter' }
    } catch {
      return { user_name: 'Recruiter User', role: 'Recruiter' }
    }
  })

  // Notification state
  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

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

  // Fetch recruiter-specific notifications
  const fetchNotifications = useCallback(async () => {
    try {
      console.log('🔔 Fetching recruiter notifications...')
      const allNotifications = []

      // Fetch recent applicants
      try {
        console.log('📤 Fetching recent applicants from:', apiService.getRecentApplicants)
        const applicantsResponse = await getMethod({
          apiUrl: apiService.getRecentApplicants
        })
        console.log('📥 Recent Applicants Response:', applicantsResponse)
        
        if (applicantsResponse?.status === true) {
          const applicants = applicantsResponse.all_applicants?.data || applicantsResponse.recent_applicants || []
          console.log(`📊 Total applicants: ${applicants.length}`)
          
          applicants.forEach(app => {
            const candidateName = app.candidate_name || app.name || app.user_name || 'A candidate'
            const jobTitle = app.applied_for || app.job_title || app.jobTitle || 'a job'
            const date = app.applied_date || app.created_at || app.date || new Date().toISOString()
            
            allNotifications.push({
              id: `application-${app.application_id || app.id || Date.now()}`,
              type: 'application',
              title: 'New Job Application',
              message: `${candidateName} applied for "${jobTitle}"`,
              date: date,
              icon: '📝',
              color: 'bg-yellow-100 text-yellow-800',
              name: candidateName,
              job: jobTitle
            })
          })
          
          console.log(`✅ Added ${applicants.length} application activities`)
        }
      } catch (error) {
        console.error('❌ Error fetching recent applicants:', error)
      }

      // Fetch scheduled interviews
      try {
        console.log('📤 Fetching scheduled interviews from:', apiService.getScheduledInterviews)
        const interviewsResponse = await getMethod({
          apiUrl: apiService.getScheduledInterviews
        })
        console.log('📥 Scheduled Interviews Response:', interviewsResponse)
        
        if (interviewsResponse?.status === true && Array.isArray(interviewsResponse?.data)) {
          const interviews = interviewsResponse.data
          console.log(`📊 Total interviews: ${interviews.length}`)
          
          interviews.forEach(interview => {
            const candidateName = interview.candidate_name || interview.name || interview.student_name || 'A candidate'
            const jobTitle = interview.job_title || interview.jobTitle || interview.applied_for || 'a job'
            const interviewDate = interview.interview_date || interview.date || interview.scheduled_date || new Date().toISOString()
            const status = interview.status || interview.interview_status || 'Scheduled'
            
            allNotifications.push({
              id: `interview-${interview.interview_id || interview.id || Date.now()}`,
              type: 'interview',
              title: status === 'Completed' ? 'Interview Completed' : 'Interview Scheduled',
              message: `${candidateName} - Interview for "${jobTitle}"`,
              date: interviewDate,
              icon: status === 'Completed' ? '✅' : '📅',
              color: status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800',
              name: candidateName,
              job: jobTitle,
              status: status
            })
          })
          
          console.log(`✅ Added ${interviews.length} interview activities`)
        }
      } catch (error) {
        console.error('❌ Error fetching scheduled interviews:', error)
      }

      // Fetch recruiter jobs (for job status updates)
      try {
        console.log('📤 Fetching recruiter jobs from:', apiService.getRecruiterJobs)
        const jobsResponse = await getMethod({
          apiUrl: apiService.getRecruiterJobs
        })
        console.log('📥 Recruiter Jobs Response:', jobsResponse)
        
        if (jobsResponse?.status === true && Array.isArray(jobsResponse?.data)) {
          const jobs = jobsResponse.data
          console.log(`📊 Total jobs: ${jobs.length}`)
          
          jobs.forEach(job => {
            const jobTitle = job.job_title || job.title || job.position || 'A job'
            const date = job.created_at || job.posted_date || job.date || new Date().toISOString()
            const status = job.status || 'open'
            
            allNotifications.push({
              id: `job-${job.job_id || job.id || Date.now()}`,
              type: 'job',
              title: 'Job Posted',
              message: `Job "${jobTitle}" is ${status}`,
              date: date,
              icon: '💼',
              color: 'bg-emerald-100 text-emerald-800',
              job: jobTitle,
              status: status
            })
          })
          
          console.log(`✅ Added ${jobs.length} job activities`)
        }
      } catch (error) {
        console.error('❌ Error fetching recruiter jobs:', error)
      }

      // Sort by date (newest first)
      allNotifications.sort((a, b) => {
        const dateA = new Date(a.date || 0)
        const dateB = new Date(b.date || 0)
        return dateB - dateA
      })

      // Limit to 50 for better performance
      const limitedNotifications = allNotifications.slice(0, 50)
      
      console.log(`✅ Total notifications found: ${allNotifications.length}`)
      console.log(`✅ Showing: ${limitedNotifications.length} notifications`)
      
      setNotifications(limitedNotifications)
      setNotificationCount(allNotifications.length)
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

  // Check if admin is impersonating
  const isAdminImpersonating = typeof window !== 'undefined' && localStorage.getItem('isAdminImpersonating') === 'true'
  const recruiterName = user.user_name || user.company_name || 'Recruiter'

  return (
    <>
      {/* Admin Impersonation Banner */}
      {isAdminImpersonating && (
        <div className="sticky top-0 z-40 bg-yellow-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Admin logged in - Dashboard is {recruiterName}'s</span>
          </div>
        </div>
      )}
      <header className={`sticky ${isAdminImpersonating ? 'top-8' : 'top-0'} z-30 flex items-center justify-between ${TAILWIND_COLORS.HEADER_BG} px-2 sm:px-4 md:px-6 py-2 sm:py-3 border-b ${TAILWIND_COLORS.BORDER}`}>
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
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
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
              <div className="overflow-y-auto max-h-[500px]">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>No recent activities</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setShowNotifications(false)
                          // Navigate based on notification type
                          if (notification.type === 'application') {
                            navigate('/recruiter/candidate-management')
                          } else if (notification.type === 'interview') {
                            navigate('/recruiter/interview-scheduler')
                          } else if (notification.type === 'job') {
                            navigate('/recruiter/job-management')
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${notification.color}`}>
                            {notification.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                              {notification.title}
                            </p>
                            <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                              {notification.message}
                            </p>
                            {notification.job && (
                              <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                                Job: {notification.job}
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
                      navigate('/recruiter/message-notification')
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
    </>
  )
}
