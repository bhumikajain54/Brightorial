import React, { useState, useEffect, useCallback } from 'react'
import { PrimaryButton, OutlineButton } from '../../../../shared/components/Button.jsx'
import { COLORS, TAILWIND_COLORS } from '../../../../shared/WebConstant.js'
import { getMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl'

// Toggle Switch Component
const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <span
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-[var(--color-secondary)]' : 'bg-gray-300'
      }`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </span>
    <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{label}</span>
  </label>
)

// Spam Detection Rules Card Component
const SpamDetectionRules = ({ rules, onRulesChange, onUpdateRules }) => {
  const { keywords, minLength, autoFlag, flagInactive } = rules

  const handleSubmit = () => {
    onUpdateRules(rules)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Spam Detection Rules</h2>
      </div>
      <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-6`}>Configure automatic job spam detection</p>

      {/* Form Content */}
      <div className="space-y-6 flex-1">
        {/* Keywords Filter */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Keywords Filters
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => onRulesChange({ ...rules, keywords: e.target.value })}
            placeholder="Enter spam keywords (comma separated)"
            className="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Minimum Length */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Minimum job description length
          </label>
          <input
            type="number"
            value={minLength}
            onChange={(e) => onRulesChange({ ...rules, minLength: e.target.value })}
            placeholder="50"
            className="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Toggle Switches */}
        <div className="space-y-4">
          <Toggle 
            checked={autoFlag} 
            onChange={(checked) => onRulesChange({ ...rules, autoFlag: checked })} 
            label="Auto-flag suspicious jobs" 
          />
          <Toggle 
            checked={flagInactive} 
            onChange={(checked) => onRulesChange({ ...rules, flagInactive: checked })} 
            label="Flag inactive users (90+ days)" 
          />
        </div>

        {/* Update Button */}
        <div className="pt-4">
          <PrimaryButton 
            onClick={handleSubmit}
            fullWidth={true}
            size="lg"
          >
            Update Rules
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

// Flagged Items Review Card
const FlaggedItemsReview = ({ flaggedItems, onReviewItem, onRefresh, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Flagged Items</h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          title="Refresh"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-6`}>Review automatically flagged content</p>

      {/* Flagged Items List */}
      <div className="space-y-3 flex-1">
        {loading ? (
          <div className="text-center py-8">
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading flagged items...</p>
          </div>
        ) : flaggedItems.length === 0 ? (
          <div className="text-center py-8">
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>No flagged items found</p>
          </div>
        ) : (
          flaggedItems.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-200"
          >
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                {item.title}
              </h3>
              <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>
                {item.reason}
              </p>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center gap-2 ml-4">
              {/* Status Badge */}
              <span
                className={`px-3 py-1 text-sm font-medium rounded-md whitespace-nowrap ${
                  item.status === 'Reviewed' 
                    ? 'bg-[var(--color-secondary)] text-white' 
                    : 'text-[var(--color-secondary)] border-2 border-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-white'
                }`}
              >
                {item.status}
              </span>
              
              {/* Review Button */}
              {item.status === 'Pending' && (
                <OutlineButton 
                  onClick={() => onReviewItem(index)}
                  size="sm"
                >
                  Review
                </OutlineButton>
              )}
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  )
}

// Main ExpiryReminder Component
const ExpiryReminder = () => {
  // State management for spam detection rules
  const [rules, setRules] = useState({
    keywords: '',
    minLength: '50',
    autoFlag: false,
    flagInactive: true
  })

  // Flagged items from API
  const [flaggedItems, setFlaggedItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch flagged jobs
  const fetchFlaggedJobs = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getMethod({
        apiUrl: apiService.getJobFlags
      })

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      if (isSuccess) {
        let flagsArray = []
        
        // Check multiple possible response structures
        if (response?.data?.flags && Array.isArray(response.data.flags)) {
          flagsArray = response.data.flags
        } else if (Array.isArray(response?.data)) {
          flagsArray = response.data
        } else if (Array.isArray(response?.flags)) {
          flagsArray = response.flags
        }

        if (flagsArray && flagsArray.length > 0) {
          // Map all flags to display format
          const mappedFlags = flagsArray.map(flag => {
            const adminAction = (flag.admin_action || '').toLowerCase()
            const reviewed = flag.reviewed === 1 || flag.reviewed === true || flag.reviewed === '1'
            
            // Determine status
            let status = 'Pending'
            if (reviewed || adminAction === 'approved') {
              status = 'Reviewed'
            } else if (adminAction === 'pending' || adminAction === 'flagged') {
              status = 'Pending'
            }

            // Get job title from various possible fields
            const jobTitle = flag.job_title || 
                           flag.title || 
                           flag.job?.title || 
                           flag.job?.job_title ||
                           `Job ID: ${flag.job_id || flag.id || 'N/A'}`

            // Get reason from various possible fields
            const reason = flag.reason || 
                          flag.flag_reason || 
                          flag.description ||
                          (adminAction === 'pending' ? 'Job flagged for review' : 'Job reviewed')

            return {
              id: flag.flag_id || flag.id,
              jobId: flag.job_id || flag.id,
              title: jobTitle,
              reason: reason,
              status: status,
              flagDate: flag.created_at || flag.flag_date || flag.created_date,
              adminAction: adminAction,
              reviewed: reviewed
            }
          })

          // Sort: Pending first, then Reviewed
          mappedFlags.sort((a, b) => {
            if (a.status === 'Pending' && b.status === 'Reviewed') return -1
            if (a.status === 'Reviewed' && b.status === 'Pending') return 1
            return 0
          })

          // Limit to 10 items
          setFlaggedItems(mappedFlags.slice(0, 10))
        } else {
          setFlaggedItems([])
        }
      } else {
        setFlaggedItems([])
      }
    } catch (error) {
      setFlaggedItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFlaggedJobs()
  }, [fetchFlaggedJobs])

  const handleRulesChange = (newRules) => {
    setRules(newRules)
  }

  const handleUpdateRules = (updatedRules) => {
    // In a real app, this would call an API
    console.log('Updated rules:', updatedRules)
    alert('Rules updated successfully!')
  }

  const handleReviewItem = (itemIndex) => {
    setFlaggedItems(prev => 
      prev.map((item, index) => 
        index === itemIndex 
          ? { ...item, status: item.status === 'Pending' ? 'Reviewed' : 'Pending' }
          : item
      )
    )
    console.log('Reviewing item:', itemIndex)
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Spam Detection Rules */}
        <div>
          <SpamDetectionRules 
            rules={rules} 
            onRulesChange={handleRulesChange}
            onUpdateRules={handleUpdateRules}
          />
        </div>

        {/* Right Column - Flagged Items Review */}
        <div>
          <FlaggedItemsReview 
            flaggedItems={flaggedItems}
            onReviewItem={handleReviewItem}
            onRefresh={fetchFlaggedJobs}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export default ExpiryReminder