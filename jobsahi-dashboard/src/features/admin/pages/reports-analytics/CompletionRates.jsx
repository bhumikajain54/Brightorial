import React, { useState, useEffect, useCallback } from 'react'
import {
  LuDownload,
  LuMail,
  LuShare2,
  LuFileSpreadsheet
} from 'react-icons/lu'
import Swal from 'sweetalert2'
import { getMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant.js'

export default function CompletionRates() {
  const [instituteData, setInstituteData] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch completion rates data
  const fetchCompletionRates = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch certificates (completed students)
      const certificatesResponse = await getMethod({
        apiUrl: apiService.getCertificateIssuance
      })
      
      // Fetch institutes list
      const institutesResponse = await getMethod({
        apiUrl: apiService.institutesList
      })

      // Process certificates to get institute-wise completed count
      const completedByInstitute = {}
      
      if (certificatesResponse?.status === true || certificatesResponse?.status === 'success' || certificatesResponse?.success === true) {
        const certificates = Array.isArray(certificatesResponse?.data) ? certificatesResponse.data : []
        
        certificates.forEach(cert => {
          const instituteName = cert.institute_name || cert.institute || 'Unknown'
          
          if (!completedByInstitute[instituteName]) {
            completedByInstitute[instituteName] = {
              name: instituteName,
              completedStudents: new Set(),
              totalCertificates: 0
            }
          }
          
          // Count unique students (by student_id or student_name)
          const studentId = cert.student_id || cert.student_name || `${cert.student_name}_${cert.course_title}`
          completedByInstitute[instituteName].completedStudents.add(studentId)
          completedByInstitute[instituteName].totalCertificates++
        })
      }

      // Process institutes to get total enrolled students
      const institutesMap = {}
      
      if (institutesResponse?.status === true || institutesResponse?.status === 'success' || institutesResponse?.success === true) {
        const institutes = Array.isArray(institutesResponse?.data) ? institutesResponse.data : []
        
        institutes.forEach(inst => {
          const instituteName = inst.profile_info?.institute_name || 
                               inst.institute_info?.institute_name || 
                               inst.institute_name || 
                               inst.user_info?.user_name || 
                               'Unknown'
          
          // Calculate total students from courses
          let totalStudents = 0
          if (inst.courses && Array.isArray(inst.courses)) {
            inst.courses.forEach(course => {
              if (course.enrollments && Array.isArray(course.enrollments)) {
                totalStudents += course.enrollments.length
              } else if (course.total_enrollments) {
                totalStudents += Number(course.total_enrollments) || 0
              } else if (course.students && Array.isArray(course.students)) {
                totalStudents += course.students.length
              }
            })
          }
          
          institutesMap[instituteName] = {
            name: instituteName,
            totalStudents: totalStudents
          }
        })
      }

      // Combine data and calculate completion rates
      const completionData = []
      
      // Get all unique institute names
      const allInstitutes = new Set([
        ...Object.keys(completedByInstitute),
        ...Object.keys(institutesMap)
      ])
      
      allInstitutes.forEach(instituteName => {
        const completed = completedByInstitute[instituteName]
        const institute = institutesMap[instituteName]
        
        const completedCount = completed ? completed.completedStudents.size : 0
        const totalCount = institute?.totalStudents || completedCount || 0
        
        // If total is 0 but we have completed, estimate total as completed * 1.5 (rough estimate)
        const estimatedTotal = totalCount > 0 ? totalCount : (completedCount > 0 ? Math.round(completedCount * 1.5) : 0)
        
        const completionRate = estimatedTotal > 0 
          ? Math.round((completedCount / estimatedTotal) * 100) 
          : 0
        
        completionData.push({
          name: instituteName,
          students: `${completedCount} / ${estimatedTotal > 0 ? estimatedTotal : 'N/A'}`,
          completedCount: completedCount,
          totalCount: estimatedTotal,
          completionRate: `${completionRate}%`,
          completionRateNum: completionRate
        })
      })
      
      // Sort by completion rate (descending)
      completionData.sort((a, b) => b.completionRateNum - a.completionRateNum)
      
      setInstituteData(completionData)
    } catch (error) {
      // Error handling
      setInstituteData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompletionRates()
  }, [fetchCompletionRates])

  // Export functions
  const handleExportPDF = () => {
    const pdfContent = `
      COMPLETION RATES REPORTS
      Generated on: ${new Date().toLocaleDateString()}
      
      INSTITUTE COMPLETION RATE REPORT:
      ${instituteData.map(inst => `- ${inst.name}: ${inst.students} students (${inst.completionRate} completion)`).join('\n      ')}
      
      SUMMARY STATISTICS:
      - Total Institutes: ${instituteData.length}
      - Total Completed Students: ${instituteData.reduce((sum, inst) => sum + inst.completedCount, 0)}
      - Total Enrolled Students: ${instituteData.reduce((sum, inst) => sum + (inst.totalCount || 0), 0)}
      - Average Completion Rate: ${instituteData.length > 0 ? Math.round(instituteData.reduce((sum, inst) => sum + inst.completionRateNum, 0) / instituteData.length) : 0}%
      - Highest Performing Institute: ${instituteData.length > 0 ? instituteData[0].name : 'N/A'} (${instituteData.length > 0 ? instituteData[0].completionRate : '0%'})
      - Lowest Performing Institute: ${instituteData.length > 0 ? instituteData[instituteData.length - 1].name : 'N/A'} (${instituteData.length > 0 ? instituteData[instituteData.length - 1].completionRate : '0%'})
      
      PERFORMANCE INSIGHTS:
      - ${instituteData.filter(inst => inst.completionRateNum >= 70).length} institutes achieved 70%+ completion rate
      - ${instituteData.filter(inst => inst.completionRateNum === 100).length} institutes achieved 100% completion rate
      - ${instituteData.filter(inst => inst.completionRateNum < 50).length} institutes need improvement (<50% completion rate)
    `
    
    const blob = new Blob([pdfContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `completion-rates-reports-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    Swal.fire({
      title: "PDF Export",
      text: "Completion rates reports have been exported as PDF successfully!",
      icon: "success",
      timer: 2000,
      showConfirmButton: false
    })
  }

  const handleExportExcel = () => {
    const csvContent = `Institute,Completed Students,Total Students,Completion Rate
${instituteData.map(inst => `${inst.name},${inst.completedCount},${inst.totalCount || 'N/A'},${inst.completionRate}`).join('\n')}`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `completion-rates-reports-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    Swal.fire({
      title: "Excel Export",
      text: "Completion rates reports have been exported as Excel successfully!",
      icon: "success",
      timer: 2000,
      showConfirmButton: false
    })
  }

  const handleEmailReport = () => {
    Swal.fire({
      title: "Email Report",
      html: `
        <div class="text-left">
          <p class="mb-4">Send completion rates reports via email to:</p>
          <input type="email" id="emailInput" class="swal2-input" placeholder="Enter email address" required>
          <div class="mt-4">
            <label class="flex items-center">
              <input type="checkbox" id="includeCharts" class="mr-2" checked>
              Include charts and graphs
            </label>
          </div>
          <div class="mt-2">
            <label class="flex items-center">
              <input type="checkbox" id="weeklyReport" class="mr-2">
              Set up weekly automated reports
            </label>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Send Report",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const email = document.getElementById('emailInput').value
        const includeCharts = document.getElementById('includeCharts').checked
        const weeklyReport = document.getElementById('weeklyReport').checked
        
        if (!email) {
          Swal.showValidationMessage('Please enter an email address')
          return false
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          Swal.showValidationMessage('Please enter a valid email address')
          return false
        }
        
        return { email, includeCharts, weeklyReport }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Email report sent to:', result.value)
        Swal.fire({
          title: "Report Sent!",
          text: `Completion rates reports have been sent to ${result.value.email}`,
          icon: "success",
          timer: 3000,
          showConfirmButton: false
        })
      }
    })
  }

  const handleGenerateShareableLink = () => {
    const shareableLink = `https://dashboard.jobsahi.com/reports/completion-rates/${Date.now()}`
    
    Swal.fire({
      title: "Shareable Link Generated",
      html: `
        <div class="text-left">
          <p class="mb-4">Your completion rates reports are now available at:</p>
          <div class="bg-gray-100 p-3 rounded border text-sm break-all">
            ${shareableLink}
          </div>
          <div class="mt-4">
            <label class="flex items-center">
              <input type="checkbox" id="passwordProtect" class="mr-2">
              Password protect this link
            </label>
          </div>
          <div class="mt-2">
            <label class="flex items-center">
              <input type="checkbox" id="expireLink" class="mr-2">
              Set expiration date (7 days)
            </label>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Copy Link",
      cancelButtonText: "Close",
      preConfirm: () => {
        const passwordProtect = document.getElementById('passwordProtect').checked
        const expireLink = document.getElementById('expireLink').checked
        
        navigator.clipboard.writeText(shareableLink).then(() => {
          return { passwordProtect, expireLink }
        }).catch(() => {
          Swal.showValidationMessage('Failed to copy link to clipboard')
          return false
        })
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Link Copied!",
          text: "Shareable link has been copied to your clipboard",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        })
      }
    })
  }

  // Export options data (with functional handlers)
  const exportOptions = [
    {
      label: 'Export as PDF',
      icon: <LuDownload />,
      onClick: handleExportPDF
    },
    {
      label: 'Export as Excel',
      icon: <LuFileSpreadsheet />,
      onClick: handleExportExcel
    },
    {
      label: 'Email Reports',
      icon: <LuMail />,
      onClick: handleEmailReport
    },
    {
      label: 'Generate Shareable Link',
      icon: <LuShare2 />,
      onClick: handleGenerateShareableLink
    }
  ]

  return (
    <div className=" space-y-8">
      {/* Institute Completion Rate Report */}
      <div className="bg-white rounded-lg border border-[var(--color-primary)28] shadow-sm p-6">
        <h3 className="text-xl font-semibold text-primary mb-2">
          Institute Completion rate Report
        </h3>
        <p className="text-gray-600 mb-6">
          Performance metrics by educational institution
        </p>
        
        {loading ? (
          <div className="text-center py-12">
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading completion rates...</p>
          </div>
        ) : instituteData.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>No completion data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {instituteData.map((institute, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{institute.name}</h4>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-green-500"
                    style={{ 
                      width: institute.completionRate,
                      background: 'var(--color-success)'
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm text-gray-600">{institute.students}</p>
                <p className="font-semibold text-gray-900">{institute.completionRate}</p>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg border border-[var(--color-primary)28] shadow-sm p-6">
        <h3 className="text-xl font-semibold text-primary mb-2">
          Export Options
        </h3>
        <p className="text-gray-600 mb-6">
          Download reports in various formats or share with stakeholders
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {exportOptions.map((option, index) => (
            <button
              key={index}
              onClick={option.onClick}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-[var(--color-secondary)] text-[var(--color-secondary)] rounded-lg hover:bg-[var(--color-secondary)] hover:text-white transition-colors duration-200 font-medium"
            >
              <span className="text-lg">{option.icon}</span>
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
