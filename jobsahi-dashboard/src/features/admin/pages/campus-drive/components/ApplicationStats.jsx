import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant'
import { getMethod } from '../../../../../service/api'
import apiService from '../../../services/serviceUrl'
import {
  LuUsers,
  LuClock,
  LuCheck,
  LuX,
  LuTrendingUp,
  LuCalendar,
  LuBuilding2
} from 'react-icons/lu'

export default function ApplicationStats() {
  const [stats, setStats] = useState(null)
  const [drives, setDrives] = useState([])
  const [selectedDriveId, setSelectedDriveId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrives()
  }, [])

  useEffect(() => {
    if (selectedDriveId || drives.length > 0) {
      fetchStats()
    }
  }, [selectedDriveId])

  const fetchDrives = async () => {
    try {
      const response = await getMethod({
        apiUrl: apiService.getCampusDrives
      })
      if (response.status) {
        setDrives(response.data || [])
        if (response.data?.length > 0 && !selectedDriveId) {
          setSelectedDriveId(response.data[0].id.toString())
        }
      }
    } catch (error) {
      console.error('Error fetching drives:', error)
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      const params = selectedDriveId ? { drive_id: selectedDriveId } : {}
      const response = await getMethod({
        apiUrl: apiService.getApplicationStats,
        params
      })

      if (response.status) {
        setStats(response.data)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to fetch statistics'
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch statistics'
      })
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      red: 'bg-red-50 text-red-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      purple: 'bg-purple-50 text-purple-600'
    }

    return (
      <div className={`${TAILWIND_COLORS.CARD} p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>{title}</p>
            <p className="text-3xl font-bold" style={{ color: `var(--color-${color})` }}>
              {value || 0}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
            {Icon && <Icon size={24} />}
          </div>
        </div>
      </div>
    )
  }

  if (loading && !stats) {
    return (
      <div className={`${TAILWIND_COLORS.CARD} p-12 text-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className={`mt-4 ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading statistics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${TAILWIND_COLORS.CARD} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Application Statistics
            </h2>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
              Comprehensive analytics and insights
            </p>
          </div>
          <div className="w-64">
            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">All Drives</option>
              {drives.map(drive => (
                <option key={drive.id} value={drive.id}>{drive.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      {stats?.overall && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Applications"
            value={stats.overall.total_applications}
            icon={LuUsers}
            color="blue"
          />
          <StatCard
            title="Pending"
            value={stats.overall.pending}
            icon={LuClock}
            color="yellow"
          />
          <StatCard
            title="Shortlisted"
            value={stats.overall.shortlisted}
            icon={LuCheck}
            color="blue"
          />
          <StatCard
            title="Rejected"
            value={stats.overall.rejected}
            icon={LuX}
            color="red"
          />
          <StatCard
            title="Selected"
            value={stats.overall.selected}
            icon={LuCheck}
            color="green"
          />
        </div>
      )}

      {/* Stats by Day */}
      {stats?.by_day && stats.by_day.length > 0 && (
        <div className={`${TAILWIND_COLORS.CARD} p-6`}>
          <h3 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
            Statistics by Day
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className={`text-left ${TAILWIND_COLORS.TEXT_MUTED} border-b`}>
                  <th className="py-3 px-4 font-medium">Day</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Capacity</th>
                  <th className="py-3 px-4 font-medium">Filled</th>
                  <th className="py-3 px-4 font-medium">Pending</th>
                  <th className="py-3 px-4 font-medium">Shortlisted</th>
                  <th className="py-3 px-4 font-medium">Rejected</th>
                  <th className="py-3 px-4 font-medium">Selected</th>
                </tr>
              </thead>
              <tbody>
                {stats.by_day.map((day) => (
                  <tr key={day.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-medium">Day {day.day_number}</span>
                    </td>
                    <td className="py-4 px-4">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">{day.capacity}</td>
                    <td className="py-4 px-4">
                      <span className="font-medium">{day.filled_count}</span>
                      <span className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} ml-1`}>
                        ({Math.round((day.filled_count / day.capacity) * 100)}%)
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-yellow-600 font-medium">{day.pending || 0}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-blue-600 font-medium">{day.shortlisted || 0}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-red-600 font-medium">{day.rejected || 0}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-green-600 font-medium">{day.selected || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats by Company */}
      {stats?.by_company && stats.by_company.length > 0 && (
        <div className={`${TAILWIND_COLORS.CARD} p-6`}>
          <h3 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
            Company Preference Statistics
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className={`text-left ${TAILWIND_COLORS.TEXT_MUTED} border-b`}>
                  <th className="py-3 px-4 font-medium">Company</th>
                  <th className="py-3 px-4 font-medium text-center">Pref 1</th>
                  <th className="py-3 px-4 font-medium text-center">Pref 2</th>
                  <th className="py-3 px-4 font-medium text-center">Pref 3</th>
                  <th className="py-3 px-4 font-medium text-center">Pref 4</th>
                  <th className="py-3 px-4 font-medium text-center">Pref 5</th>
                  <th className="py-3 px-4 font-medium text-center">Pref 6</th>
                  <th className="py-3 px-4 font-medium text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.by_company
                  .sort((a, b) => b.total_preferences - a.total_preferences)
                  .map((company) => (
                    <tr key={company.company_id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium">{company.company_name}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium text-blue-600">{company.pref1_count || 0}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium text-blue-500">{company.pref2_count || 0}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium text-blue-400">{company.pref3_count || 0}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium text-gray-600">{company.pref4_count || 0}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium text-gray-500">{company.pref5_count || 0}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium text-gray-400">{company.pref6_count || 0}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-purple-600">{company.total_preferences || 0}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!stats && !loading && (
        <div className={`${TAILWIND_COLORS.CARD} p-12 text-center`}>
          <LuTrendingUp className={`mx-auto ${TAILWIND_COLORS.TEXT_MUTED}`} size={48} />
          <p className={`mt-4 ${TAILWIND_COLORS.TEXT_MUTED}`}>No statistics available</p>
        </div>
      )}
    </div>
  )
}

