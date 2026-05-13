import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TAILWIND_COLORS, COLORS } from '../../../shared/WebConstant'
import Button from '../../../shared/components/Button.jsx'
import UserDropdown from '../../../shared/components/UserDropdown.jsx'
import DarkModeToggle from '../../../shared/components/DarkModeToggle.jsx'
import { getMethod } from '../../../service/api'
import apiService from '../services/serviceUrl'

export default function InstituteHeader({ toggleSidebar }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    try {
      const authUser = localStorage.getItem("authUser")
      return authUser ? JSON.parse(authUser) : { user_name: 'Institute User', role: 'Institute' }
    } catch {
      return { user_name: 'Institute User', role: 'Institute' }
    }
  })

  // Notification state
  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

  // Get logged-in institute ID
  const getInstituteId = () => {
    try {
      const authUser = localStorage.getItem("authUser")
      if (authUser) {
        const userData = JSON.parse(authUser)
        return userData.institute_id || userData.id || userData.user_id || null
      }
    } catch (error) {
      console.error('Error getting institute ID:', error)
    }
    return null
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

  // Fetch institute-specific notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const instituteId = getInstituteId()
      if (!instituteId) {
        console.warn('⚠️ Institute ID not found, skipping notifications')
        return
      }

      console.log('🔔 Fetching institute notifications for ID:', instituteId)
      const allNotifications = []

      // Fetch course enrollments (students enrolled in courses)
      try {
        console.log('📤 Fetching institute students from:', apiService.institute_view_students)
        const studentsResponse = await getMethod({
          apiUrl: apiService.institute_view_students
        })
        console.log('📥 Institute Students Response:', studentsResponse)
        
        if (studentsResponse?.status === true && Array.isArray(studentsResponse?.data)) {
          const students = studentsResponse.data
          console.log(`📊 Total students: ${students.length}`)
          
          students.forEach(student => {
            const studentName = student.student_name || student.name || student.user_name || 'A student'
            const courseName = student.course_name || student.course || 'a course'
            const batchName = student.batch_name || student.batch || ''
            const date = student.enrolled_date || student.created_at || student.enrollment_date || new Date().toISOString()
            
            allNotifications.push({
              id: `enrollment-${student.student_id || student.id || Date.now()}`,
              type: 'enrollment',
              title: 'New Student Enrollment',
              message: `${studentName} enrolled in "${courseName}"${batchName ? ` (Batch: ${batchName})` : ''}`,
              date: date,
              icon: '👨‍🎓',
              color: 'bg-blue-100 text-blue-800',
              name: studentName,
              course: courseName,
              batch: batchName
            })
          })
          
          console.log(`✅ Added ${students.length} enrollment activities`)
        }
      } catch (error) {
        console.error('❌ Error fetching institute students:', error)
      }

      // Fetch certificate issuances
      try {
        console.log('📤 Fetching certificates from:', apiService.certificatesIssuance)
        const certificatesResponse = await getMethod({
          apiUrl: apiService.certificatesIssuance
        })
        console.log('📥 Certificates Response:', certificatesResponse)
        
        if (certificatesResponse?.status === true && Array.isArray(certificatesResponse?.data)) {
          const certificates = certificatesResponse.data
          // ✅ Filter by institute_id if available
          const instituteCertificates = certificates.filter(cert => {
            const certInstituteId = cert.institute_id || cert.instituteId
            return !certInstituteId || String(certInstituteId) === String(instituteId)
          })
          
          console.log(`📊 Total certificates (filtered): ${instituteCertificates.length}`)
          
          instituteCertificates.forEach(cert => {
            const studentName = cert.student_name || cert.studentName || 'A student'
            const courseTitle = cert.course_title || cert.courseTitle || cert.course_name || 'a course'
            const date = cert.issue_date || cert.issued_date || cert.created_at || new Date().toISOString()
            
            allNotifications.push({
              id: `certificate-${cert.certificate_id || cert.id || Date.now()}`,
              type: 'certificate',
              title: 'Certificate Issued',
              message: `Certificate issued to ${studentName} for "${courseTitle}"`,
              date: date,
              icon: '🎓',
              color: 'bg-green-100 text-green-800',
              name: studentName,
              course: courseTitle
            })
          })
          
          console.log(`✅ Added ${instituteCertificates.length} certificate activities`)
        }
      } catch (error) {
        console.error('❌ Error fetching certificates:', error)
      }

      // Fetch batches (new batches created)
      try {
        console.log('📤 Fetching batches from:', apiService.getBatches)
        const batchesResponse = await getMethod({
          apiUrl: apiService.getBatches
        })
        console.log('📥 Batches Response:', batchesResponse)
        
        if (batchesResponse?.status === true && Array.isArray(batchesResponse?.data)) {
          const batches = batchesResponse.data
          // ✅ Filter by institute_id if available
          const instituteBatches = batches.filter(batch => {
            const batchInstituteId = batch.institute_id || batch.instituteId
            return !batchInstituteId || String(batchInstituteId) === String(instituteId)
          })
          
          console.log(`📊 Total batches (filtered): ${instituteBatches.length}`)
          
          instituteBatches.forEach(batch => {
            const batchName = batch.batch_name || batch.name || 'A batch'
            const courseName = batch.course_name || batch.course || 'a course'
            const date = batch.created_at || batch.start_date || new Date().toISOString()
            
            allNotifications.push({
              id: `batch-${batch.batch_id || batch.id || Date.now()}`,
              type: 'batch',
              title: 'New Batch Created',
              message: `New batch "${batchName}" created for "${courseName}"`,
              date: date,
              icon: '📚',
              color: 'bg-purple-100 text-purple-800',
              batch: batchName,
              course: courseName
            })
          })
          
          console.log(`✅ Added ${instituteBatches.length} batch activities`)
        }
      } catch (error) {
        console.error('❌ Error fetching batches:', error)
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
        // Error updating user in header
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
        // Error updating user from storage
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
                          if (notification.type === 'enrollment') {
                            navigate('/institute/student-management')
                          } else if (notification.type === 'certificate') {
                            navigate('/institute/certificates-completion')
                          } else if (notification.type === 'batch') {
                            navigate('/institute/batch-management')
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
                            {notification.course && (
                              <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                                Course: {notification.course}
                              </p>
                            )}
                            {notification.batch && (
                              <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                                Batch: {notification.batch}
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
                      navigate('/institute/reports-analytics')
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
