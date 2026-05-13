import React, { useState } from 'react';
import { COLORS, TAILWIND_COLORS } from '../WebConstant';

const CentralizedDataTable = ({
  title,
  subtitle,
  data,
  columns,
  actions = [],
  searchable = true,
  selectable = true,
  showAutoScrollToggle = true,
  onRowSelect,
  onBulkAction,
  searchPlaceholder = "Search...",
  emptyStateMessage = "No data found",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);

  // Filter data based on search term
  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    return columns.some(col => {
      const value = row[col.key];
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Handle row selection
  const handleSelectRow = (rowId, checked) => {
    if (checked) {
      setSelectedRows(prev => [...prev, rowId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== rowId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredData.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Auto scroll effect
  React.useEffect(() => {
    if (autoScrollEnabled && filteredData.length > 0) {
      const interval = setInterval(() => {
        const tableContainer = document.querySelector('.centralized-table-container');
        if (tableContainer) {
          tableContainer.scrollTop += 1;
          if (tableContainer.scrollTop >= tableContainer.scrollHeight - tableContainer.clientHeight) {
            tableContainer.scrollTop = 0;
          }
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [autoScrollEnabled, filteredData.length]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{title}</h2>
            {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
          </div>
          
          {/* Auto Scroll Toggle */}
          {showAutoScrollToggle && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Auto Scroll</span>
              <button
                type="button"
                onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  autoScrollEnabled ? '' : 'bg-gray-200 focus:ring-gray-400'
                }`}
                style={{
                  backgroundColor: autoScrollEnabled ? COLORS.GREEN_PRIMARY : undefined,
                  focusRingColor: autoScrollEnabled ? COLORS.GREEN_PRIMARY : undefined
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    autoScrollEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {searchable && (
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={() => onBulkAction && onBulkAction('promote', selectedRows)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${TAILWIND_COLORS.BTN_PRIMARY}`}
              >
                Promote Selected
              </button>
              <button
                onClick={() => onBulkAction && onBulkAction('delete', selectedRows)}
                className="px-4 py-2 rounded-lg transition-colors duration-200 border-secondary text-secondary bg-bg-white hover:bg-gray-100"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="centralized-table-container overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={filteredData.length > 0 && selectedRows.length === filteredData.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                    style={{ accentColor: COLORS.GREEN_PRIMARY }}
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                  {column.header}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {selectable && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                      className="rounded border-gray-300"
                      style={{ accentColor: COLORS.GREEN_PRIMARY }}
                    />
                  </td>
                )}
                {columns.map((column, index) => (
                  <td key={index} className="px-6 py-4 text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => action.onClick(row)}
                          className={`px-3 py-1 text-xs rounded transition-colors duration-200 ${
                            action.variant === 'primary' 
                              ? TAILWIND_COLORS.BTN_PRIMARY
                              : action.variant === 'danger'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'border-secondary text-secondary bg-bg-white hover:bg-gray-100'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <p className="text-lg font-medium">{emptyStateMessage}</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentralizedDataTable;
