import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { getChartColorArray, getChartTooltipStyle, getChartTextColor, getChartGridColor } from '../../utils/chartColors'

ChartJS.register(ArcElement, Tooltip, Legend)

const DoubleCircleChart = ({ 
  height = "h-48 sm:h-56 md:h-64",
  className = ""
}) => {
  const chartColors = getChartColorArray();
  
  const doughnutData = {
    labels: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Others'],
    datasets: [
      {
        data: [32, 18, 12, 18, 8, 12],
        backgroundColor: [
          chartColors[9], // Blue - JavaScript (largest segment)
          chartColors[2], // Green - Python
          chartColors[1], // Orange - Java
          chartColors[4], // Red - React
          chartColors[6], // Purple - Node.js
          chartColors[0]  // Green - Others
        ],
        borderWidth: 0,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'bottom', 
        labels: { 
          usePointStyle: true, 
          boxWidth: 6,
          padding: 15,
          font: {
            size: 11,
            weight: '400'
          },
          color: getChartTextColor()
        } 
      },
      tooltip: {
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
    cutout: '65%',
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  }

  return (
    <div className={`${height} ${className}`}>
      <Doughnut data={doughnutData} options={doughnutOptions} />
    </div>
  )
}

export default DoubleCircleChart