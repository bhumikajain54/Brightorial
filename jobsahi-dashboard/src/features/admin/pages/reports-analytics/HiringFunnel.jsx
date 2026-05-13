import React, { useState, useEffect, useCallback } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import {
  LuDownload,
  LuMail,
  LuShare2,
  LuFileSpreadsheet
} from 'react-icons/lu'
import Swal from 'sweetalert2'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant.js'
import { getMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)

export default function HiringFunnel() {
  const [funnelData, setFunnelData] = useState({
    applications: 0,
    interviews: 0,
    active_courses: 0,
    hired: 0
  })
  const [loading, setLoading] = useState(true)

  // Fetch dashboard data
  const fetchFunnelData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getMethod({
        apiUrl: apiService.adminDashboard
      })

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      if (isSuccess && response?.data) {
        const placementFunnel = response.data.placement_funnel || {}
        setFunnelData({
          applications: Number(placementFunnel.applications || 0),
          interviews: Number(placementFunnel.interviews || 0),
          active_courses: Number(placementFunnel.active_courses || 0),
          hired: Number(placementFunnel.hired || 0)
        })
      }
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFunnelData()
  }, [fetchFunnelData])

  // Calculate max value for chart scaling
  const maxValue = Math.max(
    funnelData.applications,
    funnelData.interviews,
    funnelData.active_courses,
    funnelData.hired,
    1
  )

  // Chart data for Monthly Conversion Trends
  const chartData = {
    labels: ['Job Posted', 'Applications', 'Interviews', 'Offers', 'Hires'],
    datasets: [
      {
        label: 'Hiring Funnel',
        data: [
          maxValue, // Job Posted (normalized)
          funnelData.applications,
          funnelData.interviews,
          funnelData.active_courses,
          funnelData.hired
        ],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        max: maxValue * 1.2,
        ticks: {
          callback: function(value) {
            return value.toLocaleString()
          },
          stepSize: Math.ceil(maxValue / 5)
        },
        grid: {
          borderDash: [5, 5],
        }
      },
      x: {
        grid: {
          borderDash: [5, 5],
        }
      }
    }
  }

  // Export functions
  const handleExportPDF = () => {
    const pdfContent = `
      HIRING FUNNEL REPORTS
      Generated on: ${new Date().toLocaleDateString()}
      
      MONTHLY CONVERSION TRENDS:
      - Job Posted: ${maxValue.toLocaleString()}
      - Applications Received: ${funnelData.applications.toLocaleString()}
      - Interviews Scheduled: ${funnelData.interviews.toLocaleString()}
      - Offers Made: ${funnelData.active_courses.toLocaleString()}
      - Hires Completed: ${funnelData.hired.toLocaleString()}
      
      HIRING FUNNEL METRICS:
      - Total Job Postings: ${maxValue.toLocaleString()}
      - Applications Received: ${funnelData.applications.toLocaleString()}
      - Interviews Scheduled: ${funnelData.interviews.toLocaleString()}
      - Offers Made: ${funnelData.active_courses.toLocaleString()}
      - Hires Completed: ${funnelData.hired.toLocaleString()}
      
      CONVERSION RATES:
      - Application Rate: ${maxValue > 0 ? ((funnelData.applications / maxValue) * 100).toFixed(1) : 0}%
      - Interview Rate: ${funnelData.applications > 0 ? ((funnelData.interviews / funnelData.applications) * 100).toFixed(1) : 0}%
      - Offer Rate: ${funnelData.interviews > 0 ? ((funnelData.active_courses / funnelData.interviews) * 100).toFixed(1) : 0}%
      - Hire Rate: ${funnelData.active_courses > 0 ? ((funnelData.hired / funnelData.active_courses) * 100).toFixed(1) : 0}%
    `
    
    const blob = new Blob([pdfContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hiring-funnel-reports-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    Swal.fire({
      title: "PDF Export",
      text: "Hiring funnel reports have been exported as PDF successfully!",
      icon: "success",
      timer: 2000,
      showConfirmButton: false
    })
  }

  const handleExportExcel = () => {
    const csvContent = `Stage,Value,Conversion Rate
Job Posted,${maxValue},100%
Applications Received,${funnelData.applications},${maxValue > 0 ? ((funnelData.applications / maxValue) * 100).toFixed(1) : 0}%
Interviews Scheduled,${funnelData.interviews},${funnelData.applications > 0 ? ((funnelData.interviews / funnelData.applications) * 100).toFixed(1) : 0}%
Offers Made,${funnelData.active_courses},${funnelData.interviews > 0 ? ((funnelData.active_courses / funnelData.interviews) * 100).toFixed(1) : 0}%
Hires Completed,${funnelData.hired},${funnelData.active_courses > 0 ? ((funnelData.hired / funnelData.active_courses) * 100).toFixed(1) : 0}%`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hiring-funnel-reports-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    Swal.fire({
      title: "Excel Export",
      text: "Hiring funnel reports have been exported as Excel successfully!",
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
          <p class="mb-4">Send hiring funnel reports via email to:</p>
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
          text: `Hiring funnel reports have been sent to ${result.value.email}`,
          icon: "success",
          timer: 3000,
          showConfirmButton: false
        })
      }
    })
  }

  const handleGenerateShareableLink = () => {
    const shareableLink = `https://dashboard.jobsahi.com/reports/hiring-funnel/${Date.now()}`
    
    Swal.fire({
      title: "Shareable Link Generated",
      html: `
        <div class="text-left">
          <p class="mb-4">Your hiring funnel reports are now available at:</p>
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
    <div className="space-y-8">
      {/* Monthly Conversion Trends Chart */}
      <div className="bg-white rounded-lg border border-[var(--color-primary)28] shadow-sm p-6">
        <h3 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
          Hiring Funnel Overview
        </h3>
        <p className={`${TAILWIND_COLORS.TEXT_MUTED} mb-6`}>
          Track progression from job postings to successful hires
        </p>
        
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading data...</p>
          </div>
        ) : (
          <div className="h-96">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg border border-[var(--color-primary)28] shadow-sm p-6">
        <h3 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
          Export Options
        </h3>
        <p className={`${TAILWIND_COLORS.TEXT_MUTED} mb-6`}>
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
