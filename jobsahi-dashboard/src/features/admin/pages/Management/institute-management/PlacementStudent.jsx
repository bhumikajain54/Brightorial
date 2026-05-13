import React, { useState, useEffect, useCallback } from 'react'
import { 
  LuEye, 
  LuUser,
  LuMail,
  LuPhone,
  LuMapPin,
  LuCalendar,
  LuFileText,
  LuGraduationCap,
  LuAward,
  LuBriefcase,
  LuGlobe
} from 'react-icons/lu'
import { HiDotsVertical } from 'react-icons/hi'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant'
import { Button } from '../../../../../shared/components/Button'
import { getMethod } from '../../../../../service/api'
import apiService from '../../../../admin/services/serviceUrl'

// Placement Ready Students Table Component
function PlacementReadyStudentsTable() {
  const [studentCVModal, setStudentCVModal] = useState({ isOpen: false, student: null })
  const [studentData, setStudentData] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch data from API
  const fetchPlacementStudents = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getMethod({ 
        apiUrl: apiService.adminInstituteManagement 
      })

      console.log('📊 Placement Students API Response:', response)

      // Check if response is successful
      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true
      
      if (isSuccess && response) {
        // Extract placement ready students from API response - check all possible paths
        let students = null
        
        if (response.data?.placement_ready_students) {
          students = response.data.placement_ready_students
        } else if (response.placement_ready_students) {
          students = response.placement_ready_students
        } else if (response.data?.data?.placement_ready_students) {
          students = response.data.data.placement_ready_students
        } else {
          students = []
        }
        
        console.log('👥 Placement Ready Students:', students)
        
        // Map API data to component format
        if (Array.isArray(students) && students.length > 0) {
          const mappedStudents = students.map((student, index) => ({
            id: student.id || student.student_id || student.user_id || index,
            name: student.student_name || student.name || 'N/A',
            courseField: student.course_name || student.course || 'N/A',
            courseDegree: student.degree || student.qualification || '',
            jobTitle: student.job_title || '',
            companyName: student.company_name || '',
            placementDrive: student.placement_drive || student.placement_date || 'N/A',
            status: student.status || 'Eligible',
            // Keep all original data for view details
            ...student
          }))
          
          console.log('✅ Mapped Students:', mappedStudents)
          setStudentData(mappedStudents)
        } else {
          console.warn('⚠️ No placement ready students found')
          setStudentData([])
        }
      } else {
        console.error('❌ Failed to fetch placement students:', response?.message)
        setStudentData([])
      }
    } catch (error) {
      console.error('❌ Error fetching placement students:', error)
      setStudentData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlacementStudents()
  }, [fetchPlacementStudents])

  // Handle View Details - Fetch student details by ID
  const handleViewDetails = async (student) => {
    try {
      // Show loading state
      setStudentCVModal({ isOpen: true, student: { ...student, loading: true } })
      
      // Call API with student ID - use profile_id as student ID
      const studentId = student.id || student.student_id || student.user_id || student.profile_id
      
      if (!studentId) {
        console.error('❌ Student ID not found')
        setStudentCVModal({ isOpen: true, student })
        return
      }

      console.log('🔍 Fetching student details for ID:', studentId)
      
      const response = await getMethod({
        apiUrl: `${apiService.studentsList}?id=${studentId}`
      })

      console.log('📊 Student Details API Response:', response)

      // Check if response is successful
      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true
      
      if (isSuccess && response?.data) {
        // Find the specific student from response
        let studentDetails = null
        
        // If response.data is an array, find by ID (check both user_id and profile_id)
        if (Array.isArray(response.data)) {
          studentDetails = response.data.find(s => {
            const userId = s.user_info?.user_id
            const profileId = s.profile_info?.profile_id
            return userId == studentId || profileId == studentId || s.id == studentId || s.user_id == studentId
          })
        } else if (response.data.user_info || response.data.profile_info) {
          // If single student object
          studentDetails = response.data
        }

        if (studentDetails) {
          // Extract user_info and profile_info properly
          const userInfo = studentDetails.user_info || {}
          const profileInfo = studentDetails.profile_info || {}
          
          // Map API response to component format - use actual API data only
          const mappedStudent = {
            id: userInfo.user_id || profileInfo.profile_id || studentId,
            name: userInfo.user_name || student.name || '',
            email: userInfo.email || '',
            phone: userInfo.phone_number || '',
            profile_id: profileInfo.profile_id || '',
            courseField: profileInfo.trade || student.courseField || '',
            courseDegree: profileInfo.education || student.courseDegree || '',
            skills: profileInfo.skills 
              ? profileInfo.skills.split(",").map((s) => s.trim()).filter(Boolean)
              : [],
            resume: profileInfo.resume || '',
            certificates: profileInfo.certificates || '',
            portfolio: profileInfo.portfolio_link || '',
            linkedin: profileInfo.linkedin_url || '',
            dob: profileInfo.dob || '',
            gender: profileInfo.gender || '',
            job_type: profileInfo.job_type || '',
            region: profileInfo.location || '',
            bio: profileInfo.bio || '',
            experience: profileInfo.experience || '',
            graduation_year: profileInfo.graduation_year || '',
            cgpa: profileInfo.cgpa || '',
            // Keep placement data from original student
            jobTitle: student.jobTitle || '',
            companyName: student.companyName || '',
            placementDrive: student.placementDrive || '',
            status: student.status || ''
          }
          
          console.log('✅ Mapped Student Details:', mappedStudent)
          setStudentCVModal({ isOpen: true, student: mappedStudent })
        } else {
          console.warn('⚠️ Student details not found in response')
          setStudentCVModal({ isOpen: true, student })
        }
      } else {
        console.error('❌ Failed to fetch student details:', response?.message)
        setStudentCVModal({ isOpen: true, student })
      }
    } catch (error) {
      console.error('❌ Error fetching student details:', error)
      // Still show modal with existing data
    setStudentCVModal({ isOpen: true, student })
    }
  }

  const handleCloseViewDetails = () => {
    setStudentCVModal({ isOpen: false, student: null })
  }

  // Action Dropdown Component
  const ActionDropdown = ({ student, onViewDetails }) => {
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
      onViewDetails(student)
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
              className={`w-full px-4 py-2 text-left text-sm ${TAILWIND_COLORS.TEXT_MUTED} hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200`}
            >
              <LuEye size={16} />
              View Details
            </button>
          </div>
        )}
      </div>
    )
  }

  // Student CV Modal Component
  const StudentCVModal = ({ student, isOpen, onClose }) => {
    if (!isOpen || !student) return null

    // Show loading state
    if (student.loading) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full p-8">
            <div className="flex items-center justify-center py-8">
              <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>Loading student details...</p>
            </div>
          </div>
        </div>
      )
    }

    // Handle download - open in new tab without white screen
    const handleDownload = (url, filename) => {
      if (!url) return
      
      // Open in new tab for viewing/downloading
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
      if (!newWindow) {
        // If popup blocked, fallback to direct link
        const link = document.createElement('a')
        link.href = url
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Student CV Details</h2>
            <button
              onClick={onClose}
              className={`${TAILWIND_COLORS.TEXT_MUTED} hover:text-gray-600 transition-colors duration-200`}
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuUser className="text-blue-600" size={20} />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Full Name</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>{student.name}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Email Address</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                    <LuMail size={16} className="text-gray-400" />
                    {student.email ? (
                      <a href={`mailto:${student.email}`} className="text-blue-600 hover:underline">
                        {student.email}
                    </a>
                    ) : (
                      <span className={TAILWIND_COLORS.TEXT_MUTED}>Not available</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Phone Number</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                    <LuPhone size={16} className="text-gray-400" />
                    {student.phone ? (
                      <a href={`tel:${student.phone}`} className="text-blue-600 hover:underline">
                        {student.phone}
                    </a>
                    ) : (
                      <span className={TAILWIND_COLORS.TEXT_MUTED}>Not available</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Date of Birth</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                    <LuCalendar size={16} className="text-gray-400" />
                    {student.dob || 'Not available'}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Address</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                    <LuMapPin size={16} className="text-gray-400" />
                    {student.region || 'Not available'}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>LinkedIn Profile</label>
                  <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2`}>
                    <LuGlobe size={16} className="text-gray-400" />
                    {student.linkedin ? (
                      <a href={student.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {student.linkedin}
                    </a>
                    ) : (
                      <span className={TAILWIND_COLORS.TEXT_MUTED}>Not available</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Educational Background */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuGraduationCap className="text-green-600" size={20} />
                Educational Background
              </h3>
              <div className="space-y-4">
                {student.courseDegree || student.courseField ? (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {student.courseDegree ? `${student.courseDegree}${student.courseField ? ` in ${student.courseField}` : ''}` : student.courseField}
                      </h4>
                      {student.graduation_year && (
                        <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{student.graduation_year}</span>
                      )}
                  </div>
                    {student.cgpa && (
                      <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>CGPA: {student.cgpa}</p>
                    )}
                    {student.courseDegree && !student.courseDegree.includes(student.courseField) && (
                      <p className={TAILWIND_COLORS.TEXT_MUTED}>{student.courseDegree}</p>
                    )}
                  </div>
                ) : (
                  <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-center py-4`}>No data available</p>
                )}
              </div>
            </div>

            {/* Skills & Competencies */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuAward className="text-purple-600" size={20} />
                Skills & Competencies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>Technical Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {student.skills && student.skills.length > 0 ? (
                      student.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {skill}
                      </span>
                      ))
                    ) : (
                      <span className={TAILWIND_COLORS.TEXT_MUTED}>No skills listed</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-2`}>Soft Skills</label>
                  <div className="flex flex-wrap gap-2">
                    <span className={TAILWIND_COLORS.TEXT_MUTED}>No data available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Experience */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                <LuBriefcase className="text-orange-600" size={20} />
                Work Experience
              </h3>
              {student.experience ? (
              <div className="space-y-4">
                  {(() => {
                    try {
                      const exp = typeof student.experience === 'string' ? JSON.parse(student.experience) : student.experience;
                      const expArray = Array.isArray(exp) ? exp : [exp];
                      return expArray.map((item, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                          {item.role && (
                            <h4 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>{item.role}</h4>
                          )}
                          {item.company && (
                            <p className={`${TAILWIND_COLORS.TEXT_MUTED} font-medium`}>{item.company}</p>
                          )}
                          {item.duration && (
                            <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{item.duration}</span>
                          )}
                  </div>
                      ));
                    } catch (e) {
                      return (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <p className={TAILWIND_COLORS.TEXT_MUTED}>{student.experience}</p>
                  </div>
                      );
                    }
                  })()}
                </div>
              ) : (
                <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-center py-4`}>No data available</p>
              )}
            </div>

            {/* Projects */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Projects</h3>
              <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-center py-4`}>No data available</p>
            </div>

            {/* Certifications & Achievements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Certifications & Achievements</h3>
              {student.certificates ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div className="flex-1">
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      {student.certificates.split('/').pop() || 'Certificate'}
                    </p>
                </div>
                  <button
                    onClick={() => handleDownload(student.certificates, student.certificates.split('/').pop() || 'certificate.pdf')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
                  >
                    Download
                  </button>
                </div>
              ) : (
                <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-center py-4`}>No data available</p>
              )}
            </div>

            {/* Placement Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Placement Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Placement Drive Date</label>
                  <p className={TAILWIND_COLORS.TEXT_PRIMARY}>{student.placementDrive}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Current Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    student.status === 'Placed' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {student.status}
                  </span>
                </div>
                {student.jobTitle && (
                <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Job Title</label>
                    <p className={TAILWIND_COLORS.TEXT_PRIMARY}>{student.jobTitle}</p>
                </div>
                )}
                {student.companyName && (
                <div>
                    <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Company Name</label>
                    <p className={TAILWIND_COLORS.TEXT_PRIMARY}>{student.companyName}</p>
                </div>
                )}
              </div>
            </div>

            {/* Resume/CV Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Resume/CV</h3>
              {student.resume ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div className="flex-1">
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      {student.resume.split('/').pop() || `${student.name}_Resume.pdf`}
                    </p>
                </div>
                  <button
                    onClick={() => handleDownload(student.resume, student.resume.split('/').pop() || `${student.name}_Resume.pdf`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
                  >
                  Download CV
                </button>
              </div>
              ) : (
                <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-center py-4`}>No data available</p>
              )}
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
            <Button
              onClick={onClose}
              variant="neutral"
              size="md"
              className="px-6 py-2"
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
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">✓</span>
        </div>
        <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Placement Ready Student</h2>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Name
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Course Name
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Job Title
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Placement Drive
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>Loading placement students...</p>
                  </td>
                </tr>
              ) : studentData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>No placement ready students found</p>
                  </td>
                </tr>
              ) : (
                studentData.map((student, index) => (
                  <tr key={student.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{student.courseField}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{student.jobTitle || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{student.placementDrive}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        student.status === 'Placed' || student.status === 'placed'
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ActionDropdown 
                      student={student} 
                      onViewDetails={handleViewDetails} 
                    />
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student CV Modal */}
      <StudentCVModal 
        student={studentCVModal.student}
        isOpen={studentCVModal.isOpen}
        onClose={handleCloseViewDetails}
      />
    </div>
  )
}

export default function PlacementStudent() {
  return <PlacementReadyStudentsTable />
}
