import React, { useRef } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Pie } from 'react-chartjs-2'
import { getChartTooltipStyle } from '../../utils/chartColors'

ChartJS.register(ArcElement, Tooltip, Legend)

const TradePieChart = ({ title, data, onDownload }) => {
  const chartRef = useRef(null)

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        ...getChartTooltipStyle(),
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed
            return `${label}: ${value}%`
          }
        }
      }
    },
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="h-80">
        <Pie ref={chartRef} data={data} options={options} />
      </div>
    </div>
  )
}

export default TradePieChart
