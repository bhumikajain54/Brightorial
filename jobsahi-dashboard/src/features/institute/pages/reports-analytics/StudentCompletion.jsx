import React, { useEffect, useState } from 'react'
import { BarChart } from '../../../../shared/components/charts'
import { colors } from '../../../../shared/colors'
import { getMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl'

export default function StudentCompletion() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Completed Students',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  })

  const handleExport = () => {
  }

  useEffect(() => {
    const fetchStudentCompletion = async () => {
      try {
        const res = await getMethod({ apiUrl: apiService.INSTITUTE_REPORT })
  
        if (res?.status && Array.isArray(res?.data?.student_completion_chart)) {
          const chartRows = res.data.student_completion_chart
  
          // Course Names
          const labels = chartRows.map(item => item.course_name || 'N/A')
  
          // Completed Students (Correct field from API)
          const data = chartRows.map(item => Number(item.completed_students || 0))
  
          const barColor = colors?.primary?.darkBlue || '#1D4ED8'
  
          setChartData({
            labels,
            datasets: [
              {
                label: 'Completed Students',
                data,
                backgroundColor: labels.map(() => barColor),
                borderColor: labels.map(() => barColor),
                borderWidth: 1,
              },
            ],
          })
        } else {
        }
      } catch (error) {
      }
    }
  
    fetchStudentCompletion()
  }, [])
  

  return (
    <BarChart
      data={chartData}
      title="Enrolled Students"
      subtitle="Institute Performance Dashboard"
      showExport={true}
      onExport={handleExport}
    />
  )
}
