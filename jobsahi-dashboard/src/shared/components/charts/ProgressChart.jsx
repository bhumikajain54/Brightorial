import React from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const ProgressChart = ({ 
  percentage, 
  label, 
  color = '#10B981',
  size = 120 
}) => {
  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [color, '#E5E7EB'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
  }

  return (
    <div className="text-center">
      <div className="relative inline-block" style={{ width: size, height: size }}>
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mt-4">{label}</h3>
    </div>
  )
}

export default ProgressChart
