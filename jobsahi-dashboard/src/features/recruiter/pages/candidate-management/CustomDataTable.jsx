import React from "react";
import { FaEye } from "react-icons/fa";
import { LuMail } from "react-icons/lu";
import { TAILWIND_COLORS } from "../../../../shared/WebConstant";

// 🔹 Main CustomDataTable Component
const CustomDataTable = ({
  title = "Recent Applicants",
  columns = [],
  data = [],
  className = "",
  showHeader = true,
  onViewDetails = () => {},
  currentPage = 1,
  recordsPerPage = 10,
}) => {

  // 🔹 Status Badge Colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Shortlisted":
        return "bg-green-100 text-green-800";
      case "Interviewed":
        return "bg-blue-100 text-blue-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`rounded-lg overflow-visible ${className}`}>
      {/* Header (optional) */}
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{title}</h3>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                Sr. No
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                Candidate
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                Qualification
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                Skills
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                Applied For
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                Status
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className={`text-center py-6 ${TAILWIND_COLORS.TEXT_MUTED} text-sm`}
                >
                  No applicants found
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                // Calculate serial number based on pagination
                const serialNumber = (currentPage - 1) * recordsPerPage + rowIndex + 1;
                
                return (
                <tr key={rowIndex} className="hover:bg-gray-50 transition">
                  {/* Serial Number */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}>
                    {serialNumber}
                  </td>
                  
                  {/* Candidate Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {row.name}
                      </div>
                      <div className={`flex items-center text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                        <LuMail className="w-4 h-4 mr-1" />
                        {row.email}
                      </div>
                    </div>
                  </td>

                  {/* Qualification */}
                  <td className={`px-6 py-4 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} max-w-xs`}>
                    <div className="line-clamp-2">{row.qualification}</div>
                  </td>

                  {/* Skills */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(Array.isArray(row.skills)
                        ? row.skills
                        : typeof row.skills === 'string' ? row.skills.split(", ").filter(s => s.trim()) : []
                      ).slice(0, 3).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                        >
                          {skill.trim()}
                        </span>
                      ))}
                      {((Array.isArray(row.skills) ? row.skills : typeof row.skills === 'string' ? row.skills.split(", ").filter(s => s.trim()) : [])).length > 3 && (
                        <span className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>
                          +{((Array.isArray(row.skills) ? row.skills : typeof row.skills === 'string' ? row.skills.split(", ").filter(s => s.trim()) : [])).length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Applied For */}
                  <td className={`px-6 py-4 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} max-w-xs`}>
                    <div className="line-clamp-1">{row.appliedFor}</div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        row.status
                      )}`}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => onViewDetails(row)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <FaEye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomDataTable;
