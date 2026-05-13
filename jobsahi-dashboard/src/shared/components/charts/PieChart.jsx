import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const PieChart = ({
  data,
  title = "Chart",
  subtitle = "",
  showExport = true,
  onExport,
  onElementClick,
  className = ""
}) => {
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        align: 'start',
        labels: {
          usePointStyle: true,
          padding: 18,
          font: {
            size: 14,
            weight: '500',
          },
          color: '#1f2937',
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      title: {
        display: false,
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onElementClick) {
        const elementIndex = elements[0].index
        onElementClick(elementIndex, data?.labels?.[elementIndex])
      }
    },
  }), [data, onElementClick])

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 min-h-[420px] ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {showExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#5C9A24] text-white rounded-lg hover:bg-[#3f6c17] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        )}
      </div>

      {/* Chart */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[560px] h-[360px] md:h-[420px]">
          <Pie data={data} options={options} />
        </div>
      </div>
    </div>
  )
}

export default PieChart
