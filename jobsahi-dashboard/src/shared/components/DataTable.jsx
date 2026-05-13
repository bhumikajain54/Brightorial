import React from 'react'
import { FaDownload, FaUsers } from 'react-icons/fa'

const DataTable = ({
  title = "Recent Applicants",
  columns = [],
  data = [],
  actions = [],
  className = "",
  showHeader = true,
  showActions = true,
  onViewDetails = () => {},
  onDownloadCV = () => {}
}) => {
  return (
    <div className={`bg-white rounded-lg border border-primary-30 ${className}`}>
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {showActions && actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action Buttons
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {column.key === 'name' && (
                          <div className="w-6 h-6 bg-gray-300 rounded-full mr-3 flex-shrink-0"></div>
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {row[column.key]}
                        </div>
                      </div>
                    </td>
                  ))}
                  {showActions && actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-5 md:justify-between">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick && action.onClick(row, rowIndex)}
                            className={`px-3 md:px-4 py-1 md:py-2 rounded-full text-xs font-medium transition-colors duration-200 ${
                              action.variant === 'success'
                                ? 'bg-secondary text-white hover:bg-secondary-dark'
                                : action.variant === 'danger'
                                ? 'bg-error text-white hover:bg-red-700'
                                : action.variant === 'primary'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                     
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (showActions && actions.length > 0 ? 1 : 0)} className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <FaUsers className="text-4xl mb-3 text-gray-300" />
                    <p className="text-sm font-medium text-gray-700 mb-1">No Recent Applicants</p>
                    <p className="text-xs text-gray-500 max-w-md text-center">
                      This recruiter doesn't have any recent applicants yet. Applicants will appear here once candidates start applying to your job postings.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
