import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { TAILWIND_COLORS, COLORS } from '../../../../../shared/WebConstant'
import { getMethod, putMethod } from '../../../../../service/api'
import apiService from '../../../services/serviceUrl'
import Button from '../../../../../shared/components/Button'
import DriveDetails from './DriveDetails'
import {
  LuCalendar,
  LuMapPin,
  LuUsers,
  LuBuilding2,
  LuPencil,
  LuEye,
  LuTrash2,
  LuSearch,
  LuFilter,
  LuCheck,
  LuX,
  LuClock
} from 'react-icons/lu'

export default function DriveList() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDrive, setSelectedDrive] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchDrives()
  }, [statusFilter])

  const fetchDrives = async () => {
    try {
      setLoading(true)
      const params = statusFilter !== 'all' ? { status: statusFilter } : {}
      const response = await getMethod({
        apiUrl: apiService.getCampusDrives,
        params
      })

      if (response.status) {
        setDrives(response.data || [])
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to fetch campus drives'
        })
      }
    } catch (error) {
      console.error('Error fetching drives:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch campus drives'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (driveId, newStatus) => {
    try {
      const response = await putMethod({
        apiUrl: apiService.updateCampusDrive,
        payload: {
          drive_id: driveId,
          status: newStatus
        }
      })

      if (response.status) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Drive status updated to ${newStatus}`,
          timer: 1500
        })
        fetchDrives()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to update drive status'
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update drive status'
      })
    }
  }

  const handleViewDetails = async (driveId) => {
    try {
      const response = await getMethod({
        apiUrl: apiService.getCampusDriveDetails,
        params: { drive_id: driveId }
      })

      if (response.status) {
        setSelectedDrive(response.data)
        setShowDetails(true)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to fetch drive details'
        })
      }
    } catch (error) {
      console.error('Error fetching details:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch drive details'
      })
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: LuClock, label: 'Draft' },
      live: { bg: 'bg-green-100', text: 'text-green-800', icon: LuCheck, label: 'Live' },
      closed: { bg: 'bg-red-100', text: 'text-red-800', icon: LuX, label: 'Closed' }
    }
    const badge = badges[status] || badges.draft
    const Icon = badge.icon
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badge.bg} ${badge.text}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    )
  }

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = searchQuery === '' || 
      drive.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.organizer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.city?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (showDetails && selectedDrive) {
    return (
      <DriveDetails 
        drive={selectedDrive} 
        onBack={() => {
          setShowDetails(false)
          setSelectedDrive(null)
        }}
        onRefresh={fetchDrives}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${TAILWIND_COLORS.CARD} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Campus Drives
            </h2>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
              Manage all campus hiring drives
            </p>
          </div>
          <Button
            onClick={fetchDrives}
            className="px-4 py-2"
          >
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <LuSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED}`} size={18} />
            <input
              type="text"
              placeholder="Search by title, organizer, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2 border rounded-lg w-full ${TAILWIND_COLORS.CARD}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <LuFilter className={TAILWIND_COLORS.TEXT_MUTED} size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="live">Live</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drives List */}
      {loading ? (
        <div className={`${TAILWIND_COLORS.CARD} p-12 text-center`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading drives...</p>
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className={`${TAILWIND_COLORS.CARD} p-12 text-center`}>
          <LuCalendar className={`mx-auto ${TAILWIND_COLORS.TEXT_MUTED}`} size={48} />
          <p className={`mt-4 ${TAILWIND_COLORS.TEXT_MUTED}`}>No campus drives found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map((drive) => (
            <div key={drive.id} className={`${TAILWIND_COLORS.CARD} p-6 hover:shadow-lg transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                    {drive.title}
                  </h3>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                    {drive.organizer}
                  </p>
                </div>
                {getStatusBadge(drive.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <LuMapPin className={TAILWIND_COLORS.TEXT_MUTED} size={16} />
                  <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                    {drive.venue}, {drive.city}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <LuCalendar className={TAILWIND_COLORS.TEXT_MUTED} size={16} />
                  <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                    {new Date(drive.start_date).toLocaleDateString()} - {new Date(drive.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <LuBuilding2 className={TAILWIND_COLORS.TEXT_MUTED} size={16} />
                    <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                      {drive.total_companies || 0} Companies
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LuUsers className={TAILWIND_COLORS.TEXT_MUTED} size={16} />
                    <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                      {drive.total_applications || 0} Applications
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleViewDetails(drive.id)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1"
                >
                  <LuEye size={16} />
                  View Details
                </button>
                {drive.status === 'draft' && (
                  <button
                    onClick={() => handleStatusChange(drive.id, 'live')}
                    className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center gap-1"
                  >
                    <LuCheck size={16} />
                    Go Live
                  </button>
                )}
                {drive.status === 'live' && (
                  <button
                    onClick={() => handleStatusChange(drive.id, 'closed')}
                    className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-1"
                  >
                    <LuX size={16} />
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

