import React from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { getChartColorArray, getChartTooltipStyle } from '../../utils/chartColors'

ChartJS.register(ArcElement, Tooltip, Legend)

const TradesPieChart = ({ 
  // height = "",
  className = ""
}) => {
  const chartColors = getChartColorArray();
  
  const pieData = {
    labels: ['Civil', 'Civil', 'Civil', 'Civil', 'Civil', 'Civil', 'Civil'],
    datasets: [
      {
        data: [20, 25, 15, 20, 20, 20, 20],
        backgroundColor: [
          chartColors[0], // Green
          chartColors[1], // Orange
          chartColors[2], // Green
          chartColors[3], // Blue
          chartColors[4], // Red
          chartColors[5], // Yellow
          chartColors[6]  // Purple
        ],
        borderWidth: 0,
      },
    ],
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        ...getChartTooltipStyle(),
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed
            return `${label}: ${value}%`
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  }

  // Legend data matching the chart
  const legendItems = [
    { color: chartColors[0], label: 'Civil' },
    { color: chartColors[1], label: 'Civil' },
    { color: chartColors[2], label: 'Civil' },
    { color: chartColors[3], label: 'Civil' },
    { color: chartColors[4], label: 'Civil' },
    { color: chartColors[5], label: 'Civil' },
    { color: chartColors[6], label: 'Civil' }
  ]

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between h-full">
        {/* Legend */}
        <div className="flex-1 pr-6">
          <div className="space-y-2">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-700 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pie Chart */}
        <div className="w-48 h-48 md:h-72 md:w-72 flex-shrink-0">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
    </div>
  )
}

export default TradesPieChart
