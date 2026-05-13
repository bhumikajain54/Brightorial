import React, { useEffect, useState } from 'react'
import { PieChart } from '../../../../shared/components/charts'
import { getMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl'
import { LuX } from 'react-icons/lu'

export default function CoursePopularity() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 2,
      },
    ],
  })
  const [courseData, setCourseData] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)

  const handleExport = () => {
  }

  const getColors = (count) => {
    const palette = ['#16A34A', '#F59E0B', '#3B82F6', '#EC4899', '#22C55E', '#8B5CF6', '#E11D48']
    return Array.from({ length: count }, (_, i) => palette[i % palette.length])
  }

  const handleCourseClick = (index, label) => {
    if (courseData[index]) {
      setSelectedCourse(courseData[index])
    }
  }

  const handleCloseDetails = () => {
    setSelectedCourse(null)
  }

  useEffect(() => {
    const fetchCoursePopularity = async () => {
      try {
        const res = await getMethod({ apiUrl: apiService.INSTITUTE_REPORT })

        if (res?.status && Array.isArray(res?.data?.course_popularity_chart)) {
          const rows = res.data.course_popularity_chart
          
          // Store full course data
          setCourseData(rows)

          const labels = rows.map(item => {
            const name = item.course_name || 'N/A'
            const total = Number(item.total_enrolled || 0)
            return `${name} (${total})`
          })

          const data = rows.map(item => Number(item.total_enrolled || 0))
          const colors = getColors(rows.length)

          setChartData({
            labels,
            datasets: [
              {
                label: 'Total Enrolled Students',
                data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2,
              },
            ],
          })
        } else {
        }
      } catch (err) {
      }
    }

    fetchCoursePopularity()
  }, [])

  return (
    <div className="relative">
      <PieChart
        data={chartData}
        title="Course Popularity"
        subtitle="Institute Performance Dashboard"
        showExport={true}
        onExport={handleExport}
        onElementClick={handleCourseClick}
      />
      
      {/* Side Details Box */}
      {selectedCourse && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={handleCloseDetails}
          />
          {/* Details Box */}
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-lg border border-gray-200 shadow-lg p-6 w-80 z-50 max-h-[500px] overflow-y-auto md:block hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Course Details</h3>
              <button
                onClick={handleCloseDetails}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <LuX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">
                  {selectedCourse.course_name || 'N/A'}
                </h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Enrolled</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedCourse.total_enrolled || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Completed</span>
                  <span className="text-sm font-semibold text-green-700">
                    {selectedCourse.completed || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">In Progress</span>
                  <span className="text-sm font-semibold text-yellow-700">
                    {selectedCourse.in_progress || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Not Started</span>
                  <span className="text-sm font-semibold text-blue-700">
                    {selectedCourse.not_started || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Details Box */}
          <div className="fixed inset-4 bg-white rounded-lg border border-gray-200 shadow-lg p-6 z-50 max-h-[80vh] overflow-y-auto md:hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Course Details</h3>
              <button
                onClick={handleCloseDetails}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <LuX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">
                  {selectedCourse.course_name || 'N/A'}
                </h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Enrolled</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedCourse.total_enrolled || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Completed</span>
                  <span className="text-sm font-semibold text-green-700">
                    {selectedCourse.completed || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">In Progress</span>
                  <span className="text-sm font-semibold text-yellow-700">
                    {selectedCourse.in_progress || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Not Started</span>
                  <span className="text-sm font-semibold text-blue-700">
                    {selectedCourse.not_started || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
