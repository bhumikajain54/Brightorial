import React, { useState, useEffect, useCallback } from 'react'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant.js'
import Button from '../../../../../shared/components/Button'
import { getMethod } from '../../../../../service/api'
import apiService from '../../../../admin/services/serviceUrl'
import { LuX } from 'react-icons/lu'

// Employer Ratings (Student Feedback) Component
function EmployerRatings() {
  const [timeFilter, setTimeFilter] = useState('All Time')
  const [ratingsData, setRatingsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [showReviewsModal, setShowReviewsModal] = useState(false)

  const timeFilterOptions = [
    'All Time',
    'Last 7 Days',
    'Last 30 Days',
    'Last 3 Months',
    'Last 6 Months',
    'Last Year'
  ]

  // Fetch ratings from API
  const fetchRatings = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getMethod({
        apiUrl: apiService.getEmployerRatings
      })

      console.log('📊 Employer Ratings API Response:', response)

      const isSuccess = response?.success === true || response?.status === true || response?.status === 'success'

      if (isSuccess && response?.data) {
        const ratings = Array.isArray(response.data) ? response.data : []

        // Group ratings by company_name
        const companyRatingsMap = {}
        
        ratings.forEach((rating) => {
          const companyName = rating.company_name || 'Unknown Company'
          
          if (!companyRatingsMap[companyName]) {
            companyRatingsMap[companyName] = {
              company: companyName,
              ratings: [],
              totalReviews: 0,
              averageRating: 0
            }
          }
          
          companyRatingsMap[companyName].ratings.push({
            id: rating.id,
            job_title: rating.job_title || 'N/A',
            rating: rating.rating || 0,
            feedback: rating.feedback || '',
            created_at: rating.created_at || ''
          })
        })

        // Calculate average rating and total reviews for each company
        const groupedRatings = Object.values(companyRatingsMap).map((company) => {
          const totalRating = company.ratings.reduce((sum, r) => sum + (parseFloat(r.rating) || 0), 0)
          const avgRating = company.ratings.length > 0 ? totalRating / company.ratings.length : 0
          
          return {
            id: company.ratings[0]?.id || Math.random(),
            company: company.company,
            rating: parseFloat(avgRating.toFixed(1)),
            totalReviews: company.ratings.length,
            responseRate: 0, // Not available in API
            allRatings: company.ratings // Store all ratings for detailed view
          }
        })

        console.log('✅ Grouped Ratings:', groupedRatings)
        setRatingsData(groupedRatings)
      } else {
        console.error('❌ Failed to fetch ratings:', response?.message)
        setRatingsData([])
      }
    } catch (error) {
      console.error('❌ Error fetching ratings:', error)
      setRatingsData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  // Filter ratings based on time filter
  const filterRatingsByTime = (ratings) => {
    if (timeFilter === 'All Time') {
      return ratings
    }

    const now = new Date()
    let filterDate = new Date()

    switch (timeFilter) {
      case 'Last 7 Days':
        filterDate.setDate(now.getDate() - 7)
        break
      case 'Last 30 Days':
        filterDate.setDate(now.getDate() - 30)
        break
      case 'Last 3 Months':
        filterDate.setMonth(now.getMonth() - 3)
        break
      case 'Last 6 Months':
        filterDate.setMonth(now.getMonth() - 6)
        break
      case 'Last Year':
        filterDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        return ratings
    }

    // Filter ratings based on created_at date
    return ratings.map(company => {
      const filteredRatings = company.allRatings.filter(rating => {
        if (!rating.created_at) return false
        const ratingDate = new Date(rating.created_at)
        return ratingDate >= filterDate
      })

      if (filteredRatings.length === 0) return null

      // Recalculate average rating and total reviews for filtered data
      const totalRating = filteredRatings.reduce((sum, r) => sum + (parseFloat(r.rating) || 0), 0)
      const avgRating = filteredRatings.length > 0 ? totalRating / filteredRatings.length : 0

      return {
        ...company,
        rating: parseFloat(avgRating.toFixed(1)),
        totalReviews: filteredRatings.length,
        allRatings: filteredRatings
      }
    }).filter(company => company !== null)
  }

  const filteredRatingsData = filterRatingsByTime(ratingsData)

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400 text-lg">★</span>
      )
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400 text-lg">☆</span>
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300 text-lg">★</span>
      )
    }

    return stars
  }

  const handleViewReviews = (company) => {
    // Find company data
    const companyData = ratingsData.find(c => c.company === company)
    if (companyData && companyData.allRatings) {
      setSelectedCompany({
        company: company,
        reviews: companyData.allRatings
      })
      setShowReviewsModal(true)
    }
  }

  const closeReviewsModal = () => {
    setShowReviewsModal(false)
    setSelectedCompany(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg font-bold">📝</span>
            </div>
            <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Recruiter Ratings (Candidate Feedback)</h2>
          </div>
          <p className={`${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>Monitor recruiter ratings and feedback from job seekers</p>
        </div>
        
        {/* Time Filter */}
        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className={`appearance-none bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY} px-4 py-2 pr-8 rounded-lg text-sm font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {timeFilterOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className={TAILWIND_COLORS.TEXT_MUTED}>▼</span>
          </div>
        </div>
      </div>

      {/* Ratings Cards */}
      <div className="bg-white rounded-lg border border-blue-200 shadow-sm p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>Loading ratings...</p>
          </div>
        ) : filteredRatingsData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>No ratings available for the selected time period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRatingsData.map((company) => (
              <div key={company.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  {/* Left Side - Company Info */}
                  <div className="flex items-center space-x-4">
                    {/* Company Logo Placeholder */}
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm font-bold`}>
                        {company.company.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Company Info */}
                    <div>
                      <h3 className={`text-lg font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>{company.company}</h3>
                      
                      {/* Rating Stars */}
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {renderStars(company.rating)}
                        </div>
                        <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                          ({company.totalReviews} {company.totalReviews === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Side - Button */}
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={() => handleViewReviews(company.company)}
                      variant="unstyled"
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                    >
                      View Reviews
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Overall Statistics</h3>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>Loading statistics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                {filteredRatingsData.length > 0 
                  ? (filteredRatingsData.reduce((sum, company) => sum + company.rating, 0) / filteredRatingsData.length).toFixed(1)
                  : '0.0'}
              </div>
              <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Average Rating</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                {filteredRatingsData.reduce((sum, company) => sum + company.totalReviews, 0)}
              </div>
              <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Total Reviews</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                {filteredRatingsData.length}
              </div>
              <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Companies</div>
            </div>
          </div>
        )}
      </div>

      {/* Reviews Modal */}
      {showReviewsModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[70vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className={`text-lg font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  Reviews for {selectedCompany.company}
                </h3>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                  {selectedCompany.reviews.length} {selectedCompany.reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>
              <button
                onClick={closeReviewsModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LuX size={20} className={TAILWIND_COLORS.TEXT_MUTED} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {selectedCompany.reviews.map((review, index) => (
                  <div key={review.id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                          {review.job_title || 'N/A'}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {renderStars(parseFloat(review.rating) || 0)}
                          </div>
                          <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                      {review.created_at && (
                        <span className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} whitespace-nowrap ml-2`}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {review.feedback && (
                      <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-2 leading-relaxed`}>
                        {review.feedback}
                      </p>
                    )}
                    {!review.feedback && (
                      <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} italic mt-2`}>
                        No feedback provided
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <Button
                onClick={closeReviewsModal}
                variant="unstyled"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployerRatings
