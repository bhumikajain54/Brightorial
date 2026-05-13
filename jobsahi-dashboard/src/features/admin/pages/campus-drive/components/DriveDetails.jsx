import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant'
import { getMethod, postMethod, putMethod } from '../../../../../service/api'
import apiService from '../../../services/serviceUrl'
import Button from '../../../../../shared/components/Button'
import CompanyApplications from './CompanyApplications'
import {
  LuArrowLeft,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuBuilding2,
  LuCalendar,
  LuMapPin,
  LuUsers,
  LuX,
  LuCheck,
  LuFileText
} from 'react-icons/lu'

export default function DriveDetails({ drive: initialDrive, onBack, onRefresh }) {
  const [drive, setDrive] = useState(initialDrive)
  const [loading, setLoading] = useState(false)
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [companies, setCompanies] = useState([])
  const [availableCompanies, setAvailableCompanies] = useState([])
  const [selectedCompanyForApplications, setSelectedCompanyForApplications] = useState(null)
  const [companyForm, setCompanyForm] = useState({
    company_id: '',
    company_name: '', // For manual entry
    company_location: '', // For manual entry
    job_roles: [],
    criteria: { min_cgpa: '', branches: [], year: [] },
    vacancies: 0
  })
  const [isManualEntry, setIsManualEntry] = useState(false)
  const [newJobRole, setNewJobRole] = useState('')
  const [newBranch, setNewBranch] = useState('')
  const [newYear, setNewYear] = useState('')

  useEffect(() => {
    if (drive?.drive) {
      setCompanies(drive.companies || [])
      fetchAvailableCompanies()
    }
  }, [drive])

  const fetchAvailableCompanies = async () => {
    try {
      const response = await getMethod({
        apiUrl: apiService.employersList
      })
      if (response.status) {
        // Transform the data to ensure we have consistent ID field
        const companies = (response.data || []).map(emp => {
          // The API returns: { user_id, profile: { profile_id, company_name, ... } }
          // We need to use profile_id as the company_id for campus_drive_companies
          return {
            id: emp.profile?.profile_id || emp.profile_id || emp.user_id || emp.id,
            user_id: emp.user_id,
            profile_id: emp.profile?.profile_id || emp.profile_id,
            company_name: emp.profile?.company_name || emp.company_name || emp.company || '',
            company: emp.profile?.company_name || emp.company_name || emp.company || '',
            location: emp.profile?.location || emp.location || '',
            city: emp.profile?.city || emp.city || '',
            address: emp.profile?.address || emp.address || '',
            profile: emp.profile || {}
          }
        })
        setAvailableCompanies(companies)
        console.log('📋 Available companies:', companies)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  // Helper function to reset form state
  const resetFormState = () => {
    setEditingCompany(null)
    setIsManualEntry(false)
    setCompanyForm({
      company_id: '',
      company_name: '',
      company_location: '',
      job_roles: [],
      criteria: { min_cgpa: '', branches: [], year: [] },
      vacancies: 0
    })
    setNewJobRole('')
    setNewBranch('')
    setNewYear('')
  }

  const handleAddCompany = () => {
    // Reset all form states
    resetFormState()
    setShowAddCompany(true)
  }

  const handleEditCompany = (company) => {
    // Parse criteria to check if it's a manual entry
    const criteria = typeof company.criteria === 'string' ? JSON.parse(company.criteria || '{}') : (company.criteria || {})
    const isManual = criteria && criteria.manual_company_name
    
    setEditingCompany(company.id)
    setCompanyForm({
      company_id: isManual ? '' : company.company_id, // Empty for manual entries
      company_name: isManual ? (criteria.manual_company_name || '') : (company.company_name || ''),
      company_location: isManual ? (criteria.manual_company_location || '') : (company.company_location || ''),
      job_roles: typeof company.job_roles === 'string' ? JSON.parse(company.job_roles || '[]') : (company.job_roles || []),
      criteria: criteria,
      vacancies: company.vacancies || 0
    })
    setIsManualEntry(isManual) // Set based on whether it's manual or not
    setShowAddCompany(true)
  }

  const handleSaveCompany = async () => {
    // Validate based on entry type
    if (!isManualEntry) {
      if (!companyForm.company_id || companyForm.company_id === '' || companyForm.company_id === '0') {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Please select a company' })
        return
      }
    } else {
      if (!companyForm.company_name || !companyForm.company_name.trim()) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Please enter company name' })
        return
      }
    }

    try {
      setLoading(true)
      // Build payload - only include company_id if not manual entry
      const payload = {
        drive_id: drive.drive.id,
        job_roles: companyForm.job_roles || [],
        criteria: companyForm.criteria || {},
        vacancies: companyForm.vacancies || 0
      }
      
      // Add company_id or company_name based on entry type
      if (isManualEntry) {
        // Manual entry - send company_name
        payload.company_name = companyForm.company_name.trim()
        if (companyForm.company_location && companyForm.company_location.trim()) {
          payload.company_location = companyForm.company_location.trim()
        }
      } else {
        // Select from existing - send company_id
        const companyId = parseInt(companyForm.company_id)
        if (isNaN(companyId) || companyId <= 0) {
          Swal.fire({ icon: 'error', title: 'Error', text: 'Invalid company selected' })
          setLoading(false)
          return
        }
        payload.company_id = companyId
      }
      
      console.log('📤 Sending payload:', payload)

      let response
      if (editingCompany) {
        // For edit, include company_name/company_location if manual entry
        const updatePayload = {
          id: editingCompany,
          ...payload
        }
        if (isManualEntry) {
          updatePayload.company_name = companyForm.company_name.trim()
          if (companyForm.company_location && companyForm.company_location.trim()) {
            updatePayload.company_location = companyForm.company_location.trim()
          }
        }
        response = await putMethod({
          apiUrl: apiService.updateDriveCompany,
          payload: updatePayload
        })
      } else {
        response = await postMethod({
          apiUrl: apiService.addCompanyToDrive,
          payload
        })
      }

      if (response.status) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: editingCompany ? 'Company updated successfully' : 'Company added successfully',
          timer: 1500
        })
        setShowAddCompany(false)
        resetFormState()
        
        // Always refresh drive details to update company list immediately
        try {
          const refreshResponse = await getMethod({
            apiUrl: apiService.getCampusDriveDetails,
            params: { drive_id: drive.drive.id }
          })
          if (refreshResponse.status) {
            setDrive(refreshResponse.data)
            setCompanies(refreshResponse.data.companies || [])
          }
        } catch (refreshError) {
          console.error('Error refreshing drive details:', refreshError)
          // Still show success even if refresh fails
        }
      } else {
        // Check if it's an authentication error
        if (response.requiresAuth || response.message?.toLowerCase().includes('token') || response.message?.toLowerCase().includes('authentication') || response.message?.toLowerCase().includes('login')) {
          Swal.fire({
            icon: 'error',
            title: 'Authentication Required',
            text: 'Your session has expired. Please login again.',
            confirmButtonText: 'OK'
          }).then(() => {
            // Redirect to login or reload page
            window.location.href = '/login'
          })
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.message || 'Failed to save company'
          })
        }
      }
    } catch (error) {
      console.error('Error saving company:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save company'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCompany = async (companyId) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Remove Company?',
      text: 'Are you sure you want to remove this company from the drive?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        setLoading(true)
        const response = await postMethod({
          apiUrl: apiService.removeCompanyFromDrive,
          payload: { id: companyId }
        })

        if (response.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Company removed successfully',
            timer: 1500
          })
          
          // Always refresh drive details to update company list immediately
          try {
            const refreshResponse = await getMethod({
              apiUrl: apiService.getCampusDriveDetails,
              params: { drive_id: drive.drive.id }
            })
            if (refreshResponse.status) {
              setDrive(refreshResponse.data)
              setCompanies(refreshResponse.data.companies || [])
            }
          } catch (refreshError) {
            console.error('Error refreshing drive details:', refreshError)
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.message || 'Failed to remove company'
          })
        }
      } catch (error) {
        console.error('Error removing company:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to remove company'
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const addJobRole = () => {
    if (newJobRole.trim()) {
      setCompanyForm(prev => ({
        ...prev,
        job_roles: [...prev.job_roles, newJobRole.trim()]
      }))
      setNewJobRole('')
    }
  }

  const removeJobRole = (index) => {
    setCompanyForm(prev => ({
      ...prev,
      job_roles: prev.job_roles.filter((_, i) => i !== index)
    }))
  }

  const addBranch = () => {
    if (newBranch.trim()) {
      setCompanyForm(prev => ({
        ...prev,
        criteria: {
          ...prev.criteria,
          branches: [...(prev.criteria.branches || []), newBranch.trim()]
        }
      }))
      setNewBranch('')
    }
  }

  const removeBranch = (index) => {
    setCompanyForm(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        branches: prev.criteria.branches.filter((_, i) => i !== index)
      }
    }))
  }

  if (!drive?.drive) {
    return (
      <div className={`${TAILWIND_COLORS.CARD} p-12 text-center`}>
        <p className={TAILWIND_COLORS.TEXT_MUTED}>Loading drive details...</p>
      </div>
    )
  }

  // Show CompanyApplications component if a company is selected
  if (selectedCompanyForApplications) {
    return (
      <CompanyApplications
        company={selectedCompanyForApplications}
        driveId={drive.drive.id}
        onBack={() => setSelectedCompanyForApplications(null)}
      />
    )
  }

  const driveData = drive.drive

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${TAILWIND_COLORS.CARD} p-6`}>
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <LuArrowLeft size={20} />
            Back to Drives
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              {driveData.title}
            </h2>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
              {driveData.organizer}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <LuMapPin className={TAILWIND_COLORS.TEXT_MUTED} size={18} />
              <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                {driveData.venue}, {driveData.city}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LuCalendar className={TAILWIND_COLORS.TEXT_MUTED} size={18} />
              <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                {new Date(driveData.start_date).toLocaleDateString()} - {new Date(driveData.end_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LuUsers className={TAILWIND_COLORS.TEXT_MUTED} size={18} />
              <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                Capacity: {driveData.capacity_per_day} per day
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        {drive.stats && (
          <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t md:grid-cols-5">
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Total Applications</p>
              <p className="text-2xl font-bold">{drive.stats.total_applications || 0}</p>
            </div>
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{drive.stats.pending || 0}</p>
            </div>
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Shortlisted</p>
              <p className="text-2xl font-bold text-blue-600">{drive.stats.shortlisted || 0}</p>
            </div>
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Rejected</p>
              <p className="text-2xl font-bold text-red-600">{drive.stats.rejected || 0}</p>
            </div>
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Selected</p>
              <p className="text-2xl font-bold text-green-600">{drive.stats.selected || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Company Modal */}
      {showAddCompany && (
        <div className={`${TAILWIND_COLORS.CARD} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              {editingCompany ? 'Edit Company' : 'Add Company to Drive'}
            </h3>
            <button
              onClick={() => {
                setShowAddCompany(false)
                resetFormState()
              }}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <LuX size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Toggle between Select and Manual Entry */}
            {!editingCompany && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  Add Company:
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isManualEntry}
                    onChange={() => {
                      setIsManualEntry(false)
                      setCompanyForm(prev => ({ ...prev, company_id: '', company_name: '', company_location: '' }))
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Select from existing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={isManualEntry}
                    onChange={() => {
                      setIsManualEntry(true)
                      setCompanyForm(prev => ({ ...prev, company_id: '', company_name: '', company_location: '' }))
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Add manually</span>
                </label>
              </div>
            )}

            {!isManualEntry ? (
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  {editingCompany ? 'Company' : 'Select Company *'}
                </label>
                {editingCompany ? (
                  // When editing regular company, show read-only company info
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="font-medium">{companyForm.company_name || 'N/A'}</p>
                    {companyForm.company_location && (
                      <p className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                        <LuMapPin size={14} />
                        {companyForm.company_location}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">Company cannot be changed when editing</p>
                  </div>
                ) : (
                  // When adding new, show dropdown
                  <>
                    <select
                      value={companyForm.company_id || ''}
                      onChange={(e) => {
                        const selectedId = e.target.value
                        if (!selectedId || selectedId === '') {
                          setCompanyForm(prev => ({ 
                            ...prev, 
                            company_id: '',
                            company_name: '',
                            company_location: ''
                          }))
                          return
                        }
                        
                        // Find company - check multiple possible ID fields
                        const selectedCompany = availableCompanies.find(c => 
                          c.id == selectedId || 
                          c.profile_id == selectedId || 
                          c.user_id == selectedId ||
                          (c.profile && c.profile.profile_id == selectedId)
                        )
                        
                        setCompanyForm(prev => ({ 
                          ...prev, 
                          company_id: selectedId,
                          company_name: selectedCompany?.company_name || selectedCompany?.company || selectedCompany?.profile?.company_name || '',
                          company_location: selectedCompany?.city || selectedCompany?.location || selectedCompany?.address || selectedCompany?.profile?.location || ''
                        }))
                      }}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select a company</option>
                      {availableCompanies
                        .filter(comp => {
                          // Get the ID to check - could be id, profile_id, or user_id
                          const compId = comp.id || comp.profile_id || comp.user_id || comp.profile?.profile_id
                          return !companies.some(c => c.company_id == compId && c.id != editingCompany)
                        })
                        .map(comp => {
                          // Get the ID for the option value
                          const compId = comp.id || comp.profile_id || comp.user_id || comp.profile?.profile_id || ''
                          const companyName = comp.company_name || comp.company || comp.profile?.company_name || ''
                          const location = comp.city || comp.location || comp.address || comp.profile?.city || comp.profile?.location || 'Location not available'
                          return (
                            <option key={compId} value={compId}>
                              {companyName} {location ? `- ${location}` : ''}
                            </option>
                          )
                        })}
                    </select>
                    {companyForm.company_id && (
                      <div className="p-3 mt-2 rounded-lg bg-blue-50">
                        {(() => {
                          const selectedCompany = availableCompanies.find(c => 
                            c.id == companyForm.company_id || 
                            c.profile_id == companyForm.company_id ||
                            (c.profile && c.profile.profile_id == companyForm.company_id)
                          )
                          if (!selectedCompany) return null
                          const companyName = selectedCompany.company_name || selectedCompany.company || selectedCompany.profile?.company_name || ''
                          const location = selectedCompany.city || selectedCompany.location || selectedCompany.address || selectedCompany.profile?.city || selectedCompany.profile?.location || ''
                          return (
                            <div className="text-sm">
                              <p className="font-medium text-blue-900">{companyName}</p>
                              {location && (
                                <p className="flex items-center gap-1 mt-1 text-blue-700">
                                  <LuMapPin size={14} />
                                  {location}
                                </p>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyForm.company_name}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Enter company name"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    Company Location
                  </label>
                  <input
                    type="text"
                    value={companyForm.company_location}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, company_location: e.target.value }))}
                    placeholder="Enter company location (city, state)"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                Job Roles
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newJobRole}
                  onChange={(e) => setNewJobRole(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addJobRole())}
                  placeholder="e.g., Software Engineer"
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <Button onClick={addJobRole} className="px-4">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {companyForm.job_roles.map((role, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-700 rounded-full bg-blue-50"
                  >
                    {role}
                    <button onClick={() => removeJobRole(index)}>
                      <LuX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  Minimum CGPA
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={companyForm.criteria.min_cgpa || ''}
                  onChange={(e) => setCompanyForm(prev => ({
                    ...prev,
                    criteria: { ...prev.criteria, min_cgpa: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., 7.0"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  Vacancies
                </label>
                <input
                  type="number"
                  value={companyForm.vacancies || 0}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, vacancies: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                Eligible Branches
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBranch())}
                  placeholder="e.g., CS, IT, ECE"
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <Button onClick={addBranch} className="px-4">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(companyForm.criteria.branches || []).map((branch, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-green-700 rounded-full bg-green-50"
                  >
                    {branch}
                    <button onClick={() => removeBranch(index)}>
                      <LuX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSaveCompany}
                disabled={loading}
                className="px-6 py-2"
              >
                {loading ? 'Saving...' : editingCompany ? 'Update Company' : 'Add Company'}
              </Button>
              <button
                onClick={() => {
                  setShowAddCompany(false)
                  resetFormState()
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Companies List */}
      <div className={`${TAILWIND_COLORS.CARD} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Companies ({companies.length})
          </h3>
          <Button
            onClick={handleAddCompany}
            variant="success"
            size="md"
            className="flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
            icon={<LuPlus size={18} />}
          >
            Add Company
          </Button>
        </div>
        {companies.length === 0 ? (
          <div className="py-12 text-center">
            <LuBuilding2 className={`mx-auto ${TAILWIND_COLORS.TEXT_MUTED}`} size={48} />
            <p className={`mt-4 ${TAILWIND_COLORS.TEXT_MUTED}`}>No companies added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => {
              const jobRoles = typeof company.job_roles === 'string' 
                ? JSON.parse(company.job_roles || '[]') 
                : (company.job_roles || [])
              const criteria = typeof company.criteria === 'string'
                ? JSON.parse(company.criteria || '{}')
                : (company.criteria || {})
              
              return (
                <div key={company.id} className="p-4 transition-shadow border rounded-lg hover:shadow-md">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {company.company_name}
                      </h4>
                      {(company.company_location || company.location || company.city) && (
                        <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} flex items-center gap-1 mt-1`}>
                          <LuMapPin size={14} />
                          {company.company_location || company.location || company.city}
                        </p>
                      )}
                      {company.logo && (
                        <img src={company.logo} alt={company.company_name} className="h-12 mt-2" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCompanyForApplications(company)}
                        className="p-2 text-green-600 rounded-lg hover:bg-green-50"
                        title="View Applications"
                      >
                        <LuFileText size={16} />
                      </button>
                      <button
                        onClick={() => handleEditCompany(company)}
                        className="p-2 text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Edit Company"
                      >
                        <LuPencil size={16} />
                      </button>
                      <button
                        onClick={() => handleRemoveCompany(company.id)}
                        className="p-2 text-red-600 rounded-lg hover:bg-red-50"
                        title="Delete Company"
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {jobRoles.length > 0 && (
                    <div className="mb-2">
                      <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Job Roles:</p>
                      <div className="flex flex-wrap gap-1">
                        {jobRoles.map((role, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs text-blue-700 rounded bg-blue-50">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1 text-sm">
                    {criteria.min_cgpa && (
                      <p className={TAILWIND_COLORS.TEXT_PRIMARY}>
                        Min CGPA: {criteria.min_cgpa}
                      </p>
                    )}
                    {criteria.branches && criteria.branches.length > 0 && (
                      <p className={TAILWIND_COLORS.TEXT_PRIMARY}>
                        Branches: {criteria.branches.join(', ')}
                      </p>
                    )}
                    <p className={TAILWIND_COLORS.TEXT_PRIMARY}>
                      Vacancies: {company.vacancies || 0}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

