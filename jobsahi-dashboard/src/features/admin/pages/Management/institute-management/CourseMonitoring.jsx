import React, { useState, useEffect, useCallback } from 'react'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant'
import Button from '../../../../../shared/components/Button'
import { getMethod } from '../../../../../service/api'
import apiService from '../../../../admin/services/serviceUrl'

// Course List Table Component
function CourseListTable({ courseData, onViewCourse, loading }) {

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 shadow-sm flex flex-col" style={{ height: '500px', maxHeight: '500px' }}>
        <h3 className={`text-base sm:text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3 sm:mb-4 flex-shrink-0`}>Course List</h3>
        <div className="flex items-center justify-center flex-1">
          <p className={`text-sm sm:text-base ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading courses...</p>
        </div>
      </div>
    )
  }

  if (!courseData || courseData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 shadow-sm flex flex-col" style={{ height: '500px', maxHeight: '500px' }}>
        <h3 className={`text-base sm:text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3 sm:mb-4 flex-shrink-0`}>Course List</h3>
        <div className="flex items-center justify-center flex-1">
          <p className={`text-sm sm:text-base ${TAILWIND_COLORS.TEXT_MUTED}`}>No courses available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 shadow-sm flex flex-col" style={{ height: '500px', maxHeight: '500px' }}>
      <h3 className={`text-base sm:text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3 sm:mb-4 flex-shrink-0`}>Course List</h3>
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto overflow-x-auto" style={{ maxHeight: 'calc(500px - 80px)' }}>
          <div className="min-w-full">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {courseData.map((course, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} text-sm truncate flex-1`}>
                      {course.course_name || course.courseName || 'N/A'}
                    </h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full ml-2 flex-shrink-0 ${
                      (course.certificate === 'Active' || course.certificate === 'active') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.certificate || 'Inactive'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className={`${TAILWIND_COLORS.TEXT_MUTED}`}>Category:</span>
                      <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>{course.category || 'N/A'}</p>
                    </div>
                    <div>
                      <span className={`${TAILWIND_COLORS.TEXT_MUTED}`}>Enrolled:</span>
                      <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>{course.enrolled || '0'}</p>
                    </div>
                  </div>
                  <Button 
                    variant="light" 
                    size="sm"
                    onClick={() => onViewCourse(course)}
                    className="w-full text-xs"
                  >
                    {course.status || 'View'}
                  </Button>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="w-full hidden md:table">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-gray-200">
                  <th className={`text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Course Name</th>
                  <th className={`text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Category</th>
                  <th className={`text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Enrolled</th>
                  <th className={`text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Certificate</th>
                  <th className={`text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {courseData.map((course, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className={`py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{course.course_name || course.courseName || 'N/A'}</td>
                    <td className={`py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{course.category || 'N/A'}</td>
                    <td className={`py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{course.enrolled || '0'}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs rounded-full ${
                        (course.certificate === 'Active' || course.certificate === 'active') 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {course.certificate || 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <Button 
                        variant="light" 
                        size="sm"
                        onClick={() => onViewCourse(course)}
                        className="text-xs"
                      >
                        {course.status || 'View'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enrollment Trends Chart Component
function EnrollmentTrendsChart({ enrollmentTrends, loading }) {
  const [timeFilter, setTimeFilter] = useState('Last 6 Months')
  
  // All months array
  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Create a map of month to value from API data
  const trendsMap = {};
  if (enrollmentTrends && Array.isArray(enrollmentTrends)) {
    enrollmentTrends.forEach(trend => {
      const month = (trend.month || trend.Month || '').trim();
      if (month) {
        // Match month name (case insensitive, partial match)
        const matchedMonth = allMonths.find(m => 
          m.toLowerCase() === month.toLowerCase() || 
          month.toLowerCase().startsWith(m.toLowerCase())
        );
        if (matchedMonth) {
          trendsMap[matchedMonth] = parseInt(trend.value) || 0;
        }
      }
    });
  }

  // Filter months based on time filter
  const getFilteredMonths = () => {
    const now = new Date()
    const currentMonth = now.getMonth() // 0-11 (Jan = 0, Dec = 11)
    
    switch (timeFilter) {
      case 'Last 6 Months':
        // Get last 6 months from current month (including current month)
        const last6Months = []
        for (let i = 5; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12
          last6Months.push(allMonths[monthIndex])
        }
        return last6Months
      
      case 'Last 12 Months':
        return allMonths
      
      case 'This Year':
        // Get months from January to current month (including current month)
        return allMonths.slice(0, currentMonth + 1)
      
      default:
        return allMonths
    }
  }

  const filteredMonths = getFilteredMonths()
  
  // Create filtered trends map - include all filtered months (even if no data)
  const filteredTrendsMap = {}
  filteredMonths.forEach(month => {
    // Always include the month, use 0 if no data
    filteredTrendsMap[month] = trendsMap[month] !== undefined ? trendsMap[month] : 0
  })

  // Calculate statistics from filtered data (only months with data > 0)
  const allValues = Object.values(filteredTrendsMap).filter(v => v > 0)
  const totalEnrollments = allValues.reduce((sum, val) => sum + val, 0)
  const averageEnrollments = allValues.length > 0 ? Math.round(totalEnrollments / allValues.length) : 0
  const maxEnrollments = allValues.length > 0 ? Math.max(...allValues) : 0
  const monthsWithData = allValues.length
  
  // Calculate max value for scaling (add 20% padding for better visualization)
  const maxValue = allValues.length > 0 
    ? Math.ceil(Math.max(...allValues) * 1.2)
    : 100

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 shadow-sm h-full flex flex-col">
        <h3 className={`text-base sm:text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3 sm:mb-4`}>Enrollment Trends</h3>
        <div className="flex items-center justify-center py-6 sm:py-8 flex-1">
          <p className={`text-sm sm:text-base ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading trends...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 shadow-sm flex flex-col" style={{ height: '500px', maxHeight: '500px' }}>
      {/* Header with Stats */}
      <div className="mb-3 sm:mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2">
          <h3 className={`text-base sm:text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Enrollment Trends</h3>
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="Last 12 Months">Last 12 Months</option>
            <option value="This Year">This Year</option>
          </select>
        </div>
        
        {/* Key Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-100">
            <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mb-0.5 sm:mb-1`}>Total</p>
            <p className={`text-base sm:text-lg md:text-xl font-bold text-blue-600`}>{totalEnrollments}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-100">
            <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mb-0.5 sm:mb-1`}>Average</p>
            <p className={`text-base sm:text-lg md:text-xl font-bold text-green-600`}>{averageEnrollments}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 sm:p-3 border border-purple-100">
            <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mb-0.5 sm:mb-1`}>Peak</p>
            <p className={`text-base sm:text-lg md:text-xl font-bold text-purple-600`}>{maxEnrollments}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-2 sm:p-3 border border-orange-100">
            <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mb-0.5 sm:mb-1`}>Active Months</p>
            <p className={`text-base sm:text-lg md:text-xl font-bold text-orange-600`}>{monthsWithData}</p>
          </div>
        </div>
      </div>
      
      {/* Bar Chart with All Months */}
      <div className="flex-1 min-h-0 flex flex-col" style={{ minHeight: '200px', maxHeight: '300px' }}>
        {/* Y-axis labels */}
        <div className="flex items-end justify-between mb-1 px-1 sm:px-2 flex-1" style={{ minHeight: '180px' }}>
          {/* Y-axis scale */}
          <div className="flex flex-col justify-between h-full pr-2 border-r border-gray-200">
            {[0, Math.ceil(maxValue * 0.5), maxValue].map((val, idx) => (
              <span key={idx} className={`text-[9px] sm:text-[10px] ${TAILWIND_COLORS.TEXT_MUTED} -mt-1`}>
                {val}
              </span>
            ))}
          </div>
          
          {/* Chart bars */}
          <div className="flex-1 flex items-end justify-between px-1 sm:px-2 gap-0.5 sm:gap-1 h-full">
            {filteredMonths.map((month, index) => {
              const value = filteredTrendsMap[month] || 0;
              const hasData = value > 0;
              // Calculate height percentage (max 95% of available height)
              const heightPercent = hasData && maxValue > 0 
                ? Math.min((value / maxValue) * 95, 95) 
                : 0;
              
              // Determine bar color based on value
              const barColor = hasData 
                ? value >= maxEnrollments * 0.8 
                  ? 'bg-gradient-to-t from-green-500 to-green-400' 
                  : value >= maxEnrollments * 0.5
                  ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                  : 'bg-gradient-to-t from-blue-400 to-blue-300'
                : '';
              
              return (
                <div key={index} className="flex flex-col items-center flex-1 min-w-0 group relative">
                  <div className="w-full flex flex-col items-center h-full justify-end">
                    {hasData ? (
                      <>
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                          <div className="font-semibold">{month} {new Date().getFullYear()}</div>
                          <div className="text-blue-300">{value} Enrollments</div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                        
                        {/* Bar */}
                        <div 
                          className={`w-full ${barColor} rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer shadow-sm hover:shadow-md relative`}
                          style={{ 
                            height: `${heightPercent}%`,
                            minHeight: heightPercent > 0 ? '8px' : '0px',
                          }}
                          title={`${month}: ${value} enrollments`}
                        >
                          {/* Value label on bar (if bar is tall enough) */}
                          {heightPercent > 15 && (
                            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[10px] sm:text-xs font-semibold text-gray-700 whitespace-nowrap">
                              {value}
                            </div>
                          )}
                        </div>
                        
                        {/* Month label */}
                        <span className={`text-[10px] sm:text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1 sm:mt-2 truncate w-full text-center font-medium`}>
                          {month}
                        </span>
                        
                        {/* Value below (if bar is short) */}
                        {heightPercent <= 15 && (
                          <span className={`text-[10px] sm:text-xs font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mt-0.5 sm:mt-1`}>
                            {value}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="w-full" style={{ height: '0px' }}></div>
                        <span className={`text-[10px] sm:text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1 sm:mt-2 truncate w-full text-center opacity-40`}>
                          {month}
                        </span>
                        <span className={`text-[10px] sm:text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-0.5 sm:mt-1 opacity-40`}>
                          -
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* X-axis label */}
        <div className="text-center mt-2 pt-2 border-t border-gray-100">
          <p className={`text-[10px] sm:text-xs ${TAILWIND_COLORS.TEXT_MUTED} font-medium`}>Months ({new Date().getFullYear()})</p>
        </div>
      </div>
    </div>
  )
}

// Enrollment Issue Table Component
function EnrollmentIssueTable() {
  const issueData = [
    {
      course: "Computer Basics",
      certificate: "95",
      status: "View details"
    },
    {
      course: "Computer Basics",
      certificate: "87",
      status: "Inactive"
    }
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Enrollment Issue</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className={`text-left py-3 px-4 font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Course</th>
              <th className={`text-left py-3 px-4 font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Certificate</th>
              <th className={`text-left py-3 px-4 font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {issueData.map((issue, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className={`py-3 px-4 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{issue.course}</td>
                <td className={`py-3 px-4 ${TAILWIND_COLORS.TEXT_MUTED}`}>{issue.certificate}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    issue.status === 'View details' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {issue.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Certificate Issuance Status Chart Component
function CertificateIssuanceChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Certificate Issuance Status</h3>
      
      {/* Bar Chart Representation */}
      <div className="h-64 flex items-end justify-between px-4">
        <div className="flex flex-col items-center">
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '150px' }}></div>
          <span className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-2`}>Q1</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '190px' }}></div>
          <span className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-2`}>Q2</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '210px' }}></div>
          <span className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-2`}>Q3</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '250px' }}></div>
          <span className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-2`}>Q4</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 bg-blue-500 rounded-t" style={{ height: '160px' }}></div>
          <span className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-2`}>Q5</span>
        </div>
      </div>
    </div>
  )
}

// Course Details Modal Component
function CourseDetailsModal({ course, isOpen, onClose }) {
  if (!isOpen || !course) return null

  const courseName = course.course_name || course.courseName || 'N/A'
  const category = course.category || 'N/A'
  const enrolled = course.enrolled || '0'
  const certificate = course.certificate || 'Inactive'
  const enrolledNum = parseInt(enrolled) || 0
  const description = course.description || course.course_description || ''

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[98vh] sm:max-h-[95vh] md:max-h-[90vh] overflow-y-auto my-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between z-10 shadow-sm">
          <h2 className={`text-base sm:text-lg md:text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} truncate pr-2`}>Course Details</h2>
          <button
            onClick={onClose}
            className={`${TAILWIND_COLORS.TEXT_MUTED} hover:text-gray-600 transition-colors duration-200 p-1 flex-shrink-0`}
            aria-label="Close"
          >
            <span className="text-xl sm:text-2xl md:text-3xl">&times;</span>
          </button>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Course Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-5 md:p-6">
            <h3 className={`text-lg sm:text-xl md:text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2 break-words`}>
              {courseName}
            </h3>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mt-3 flex-wrap">
              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full font-medium ${
                (certificate === 'Active' || certificate === 'active') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {certificate}
              </span>
              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full font-medium bg-blue-100 text-blue-800`}>
                {category}
              </span>
            </div>
          </div>

          {/* Course Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h4 className={`text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1 sm:mb-2`}>Category</h4>
              <p className={`text-base sm:text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} break-words`}>{category}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h4 className={`text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1 sm:mb-2`}>Total Enrolled</h4>
              <p className={`text-base sm:text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{enrolled} Students</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h4 className={`text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1 sm:mb-2`}>Certificate Status</h4>
              <p className={`text-base sm:text-lg font-semibold ${
                (certificate === 'Active' || certificate === 'active') ? 'text-green-600' : 'text-red-600'
              }`}>
                {certificate}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h4 className={`text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1 sm:mb-2`}>Course Status</h4>
              <p className="text-base sm:text-lg font-semibold text-green-600">Active</p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border border-gray-200 rounded-lg p-4 sm:p-5 md:p-6">
            <h4 className={`text-base sm:text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3 sm:mb-4`}>
              Course Overview
            </h4>
            {description ? (
              <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words`}>
                {description}
              </p>
            ) : (
              <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm sm:text-base leading-relaxed`}>
                This course provides comprehensive training in {category.toLowerCase()}. 
                Students will gain practical skills and knowledge through hands-on learning experiences. 
                Upon successful completion, students will receive a certificate recognizing their achievement.
              </p>
            )}
          </div>

          {/* Enrollment Statistics */}
          <div className="bg-blue-50 rounded-lg p-4 sm:p-5 md:p-6">
            <h4 className={`text-base sm:text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3 sm:mb-4`}>
              Enrollment Statistics
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{enrolled}</p>
                <p className={`text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>Total Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {Math.floor(enrolledNum * 0.85)}
                </p>
                <p className={`text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex justify-end gap-2 sm:gap-3 shadow-sm">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base w-full sm:w-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CourseMonitoring() {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [courseData, setCourseData] = useState([])
  const [enrollmentTrends, setEnrollmentTrends] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch data from API
  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getMethod({ 
        apiUrl: apiService.adminInstituteManagement 
      })

      console.log('📊 Course Monitoring API Response:', response)

      // Check if response is successful (handle both boolean and string status)
      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true
      
      if (isSuccess && response) {
        // Extract course list from API response - check multiple possible paths
        const courseList = response.data?.course_enrollment?.course_list || 
                          response.course_enrollment?.course_list || 
                          response.data?.course_list ||
                          []
        console.log('📚 Course List:', courseList)
        setCourseData(courseList)

        // Extract enrollment trends from API response - check ALL possible paths
        let trends = null
        
        // Try different response structures
        if (response.data?.enrollment_trends) {
          trends = response.data.enrollment_trends
        } else if (response.enrollment_trends) {
          trends = response.enrollment_trends
        } else if (response.data?.data?.enrollment_trends) {
          trends = response.data.data.enrollment_trends
        } else if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].enrollment_trends) {
          trends = response.data[0].enrollment_trends
        } else {
          // Last resort: search in the entire response object
          const searchForTrends = (obj) => {
            if (Array.isArray(obj)) {
              return obj.find(item => Array.isArray(item) && item.length > 0 && item[0]?.month) || null
            }
            if (obj && typeof obj === 'object') {
              if (obj.enrollment_trends && Array.isArray(obj.enrollment_trends)) {
                return obj.enrollment_trends
              }
              for (const key in obj) {
                const result = searchForTrends(obj[key])
                if (result) return result
              }
            }
            return null
          }
          trends = searchForTrends(response) || []
        }
        
        console.log('📈 Enrollment Trends Extracted:', trends)
        console.log('📈 Trends Length:', trends?.length)
        console.log('📈 Is Array:', Array.isArray(trends))
        
        // Ensure trends is an array and has data
        if (Array.isArray(trends) && trends.length > 0) {
          // Validate trend structure (should have month and value)
          const validTrends = trends.filter(t => t && (t.month || t.value))
          if (validTrends.length > 0) {
            console.log('✅ Setting enrollment trends:', validTrends)
            setEnrollmentTrends(validTrends)
          } else {
            console.warn('⚠️ Trends array is empty or invalid structure')
            setEnrollmentTrends([])
          }
        } else {
          console.warn('⚠️ No enrollment trends found in response')
          console.warn('⚠️ Response structure:', {
            hasData: !!response.data,
            dataKeys: response.data ? Object.keys(response.data) : [],
            responseKeys: Object.keys(response || {})
          })
          setEnrollmentTrends([])
        }
      } else {
        console.error('❌ Failed to fetch course data:', response?.message || 'Unknown error')
        setCourseData([])
        setEnrollmentTrends([])
      }
    } catch (error) {
      console.error('❌ Error fetching course data:', error)
      setCourseData([])
      setEnrollmentTrends([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourseData()
  }, [fetchCourseData])

  const handleViewCourse = (course) => {
    setSelectedCourse(course)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCourse(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs sm:text-sm font-bold">✓</span>
        </div>
        <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Course & Enrollment</h2>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Course List */}
        <div>
          <CourseListTable 
            courseData={courseData} 
            onViewCourse={handleViewCourse}
            loading={loading}
          />
        </div>
        
        {/* Enrollment Trends */}
        <div>
          <EnrollmentTrendsChart 
            enrollmentTrends={enrollmentTrends}
            loading={loading}
          />
        </div>
        
        {/* Enrollment Issue */}
        {/* <EnrollmentIssueTable /> */}
        
        {/* Certificate Issuance Status */}
        {/* <CertificateIssuanceChart /> */}
      </div>

      {/* Course Details Modal */}
      <CourseDetailsModal 
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
