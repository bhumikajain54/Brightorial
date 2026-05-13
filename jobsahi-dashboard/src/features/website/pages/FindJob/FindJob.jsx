import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaFilter, FaTimes } from 'react-icons/fa'
import NewsletterSubscription from '../../components/NewsletterSubscription'
import Footer from '../../components/Footer'
import JobDetails from './JobDetails'
import textunderline from "../../assets/website_text_underline.png";
import Navbar from '../../components/Navbar'
import { 
  WEBSITE_COLORS,
  WEBSITE_COLOR_CLASSES,
  getWebsiteColor,
  getWebsiteColorClass,
} from '../../components/colorClasses'
import { COLOR_CLASSES } from "../../components/colorClasses";
import { getMethod, postMethod } from '../../../../service/api'
import serviceUrl from '../../services/serviceUrl'

// Base filter options - will be dynamically populated from API data
const BASE_EMPLOYMENT_FILTERS = ['Part Time', 'Full Time', 'Remote', 'Internship', 'Freelance']
const BASE_LEVEL_FILTERS = ['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'VP']
// Categories will be completely dynamic from API - no hardcoded base categories

const FindJob = ({ onClose }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const colorHex = getWebsiteColor
  const colorClass = getWebsiteColorClass
  const {
    PRIMARY,
    ACCENT,
    NEUTRAL,
    SURFACE,
    HOVER,
  } = WEBSITE_COLORS
  const [selectedEmployment, setSelectedEmployment] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedLevels, setSelectedLevels] = useState([])
  const [salaryRange, setSalaryRange] = useState([0, 100000]) // Wider range to show all jobs by default
  const [showJobPopup, setShowJobPopup] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [sortOption, setSortOption] = useState('Newest Upward')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [jobListings, setJobListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)
  const [searchLocation, setSearchLocation] = useState('')
  const [searchCategory, setSearchCategory] = useState('')
  const [activeLocationFilter, setActiveLocationFilter] = useState('')
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('')
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const hasFetchedJobsRef = useRef(false)

  // Initialize search filters from URL params
  useEffect(() => {
    const locationParam = searchParams.get('location') || '';
    const categoryParam = searchParams.get('category') || '';
    
    if (locationParam) {
      setSearchLocation(locationParam);
      setActiveLocationFilter(locationParam);
    }
    if (categoryParam) {
      setSearchCategory(categoryParam);
      setActiveCategoryFilter(categoryParam);
    }
  }, [searchParams])

  // Normalize employment type from API to filter format
  const normalizeEmploymentType = useCallback((type) => {
    if (!type) return 'Full Time'
    const typeLower = type.toLowerCase().trim()
    const typeMap = {
      'full_time': 'Full Time',
      'fulltime': 'Full Time',
      'full-time': 'Full Time',
      'part_time': 'Part Time',
      'parttime': 'Part Time',
      'part-time': 'Part Time',
      'remote': 'Remote',
      'internship': 'Internship',
      'freelance': 'Freelance',
      'contract': 'Freelance',
      'contractual': 'Freelance'
    }
    return typeMap[typeLower] || type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
  }, [])

  // Format category from API - keep original, just capitalize properly
  const formatCategory = useCallback((category) => {
    if (!category) return 'Other'
    // Keep original category name, just format it properly
    const trimmed = category.trim()
    // Capitalize first letter of each word
    return trimmed.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }, [])

  // Normalize experience level from API to filter format
  const normalizeExperienceLevel = useCallback((level) => {
    if (!level) return 'Entry Level'
    const levelLower = level.toLowerCase().trim()
    const levelMap = {
      'entry level': 'Entry Level',
      'entry': 'Entry Level',
      'fresher': 'Entry Level',
      'beginner': 'Entry Level',
      'intermediate': 'Mid Level',
      'mid level': 'Mid Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'senior level': 'Senior Level',
      'executive': 'Executive',
      'director': 'Director',
      'vice president': 'VP'
    }
    return levelMap[levelLower] || level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
  }, [])

  // Fetch jobs from API - only once on mount
  const fetchJobs = useCallback(async () => {
    // Prevent multiple calls using ref
    if (hasFetchedJobsRef.current) {
      console.log('Jobs already fetched, skipping API call')
      return
    }

    try {
      hasFetchedJobsRef.current = true // Mark as fetched before API call
      setLoading(true)
      setError(null)
      
      const response = await getMethod({
        apiUrl: serviceUrl.getJobs,
        params: {}
      })

      console.log('Jobs API Response:', response)
      console.log('Response Status:', response.status)
      console.log('Response Data:', response.data)
      
      // Handle different response structures
      let jobsData = []
      // Check multiple status formats (responseModify converts true to 'success')
      const isSuccess = response.status === true || 
                       response.status === 'success' || 
                       response.status === 'true' ||
                       response.success === true
      
      console.log('Response Status Check:', {
        status: response.status,
        success: response.success,
        isSuccess: isSuccess,
        hasData: !!response.data,
        dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
      })
      
      if (isSuccess) {
        if (Array.isArray(response.data)) {
          jobsData = response.data
        } else if (Array.isArray(response.jobs)) {
          jobsData = response.jobs
        } else if (Array.isArray(response)) {
          jobsData = response
        }
      } else {
        // Even if status check fails, try to get data if it exists
        if (Array.isArray(response.data)) {
          jobsData = response.data
        }
      }

      console.log('Is Success:', isSuccess)
      console.log('Extracted Jobs Data:', jobsData)
      console.log('Jobs Count:', jobsData.length)

      if (jobsData.length > 0) {
        // ✅ Filter out jobs that are not approved or are pending edit approval
        // Only show jobs with admin_action === 'approved' to students/candidates
        const approvedJobs = jobsData.filter(job => {
          const adminAction = (job.admin_action || '').toLowerCase();
          // Only show approved jobs to students
          return adminAction === 'approved';
        });

        // Transform API data to match component structure
        const transformedJobs = approvedJobs.map((job, index) => {
          const rawType = job.employment_type || job.job_type || job.type || 'Full Time'
          const rawCategory = job.category_name || job.category || job.job_category || 'Other'
          const rawExperience = job.experience_required || job.experience_level || job.experience || 'Entry Level'
          
          // Extract and format skills from API
          const rawSkills = job.skills_required || job.skills || job.required_skills || ''
          let skillsArray = []
          if (rawSkills) {
            if (Array.isArray(rawSkills)) {
              skillsArray = rawSkills.map(s => s.trim()).filter(s => s)
            } else if (typeof rawSkills === 'string') {
              skillsArray = rawSkills.split(',').map(s => s.trim()).filter(s => s)
            }
          }
          
          // Format salary display
          const salaryDisplay = job.salary_min && job.salary_max 
            ? `${job.salary_min}-${job.salary_max}/Monthly`
            : job.salary || job.salary_range || '1500/Monthly'
          
          return {
            id: job.id || job.job_id || index + 1,
            title: job.title || job.job_title || 'Job Title',
            company: job.company_name || job.employer_name || 'Company',
            location: job.location || job.city || 'Location',
            type: normalizeEmploymentType(rawType),
            category: formatCategory(rawCategory), // Use original category from API
            salary: salaryDisplay,
            applied: job.applied_count || job.applications_count || 0,
            capacity: job.capacity || job.max_applications || job.no_of_vacancies || 100,
            skills: skillsArray.length > 0 ? skillsArray : ['Skill'],
            logo: (job.company_name || job.employer_name || 'C')[0].toUpperCase(),
            logoColor: colorHex('PRIMARY.NAVY'),
            experience: normalizeExperienceLevel(rawExperience),
            postedOn: job.created_at || job.posted_date || new Date().toLocaleDateString(),
            applyBefore: job.deadline || job.apply_before || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            description: job.description || job.job_description || 'Job description not available.',
            responsibilities: job.responsibilities ? (Array.isArray(job.responsibilities) ? job.responsibilities : job.responsibilities.split(',')) : [],
            requirements: job.requirements ? (Array.isArray(job.requirements) ? job.requirements : job.requirements.split(',')) : [],
            benefits: job.benefits ? (Array.isArray(job.benefits) ? job.benefits : job.benefits.split(',').map(b => ({ title: b, icon: 'FaShieldAlt', description: b }))) : []
          }
        })
        console.log('Transformed Jobs:', transformedJobs)
        setJobListings(transformedJobs)
      } else {
        console.log('No jobs data found in response')
        // Fallback to empty array if no data
        setJobListings([])
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError('Failed to load jobs. Please try again later.')
      setJobListings([])
      hasFetchedJobsRef.current = false // Reset on error so it can retry
    } finally {
      setLoading(false)
    }
  }, [normalizeEmploymentType, formatCategory, normalizeExperienceLevel])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    fetchJobs()
  }, [fetchJobs])


  const parsePostedDate = (dateString) => {
    if (!dateString) return 0

    const normalisedDate = dateString.replace(/,/g, '')
    const parsedDate = new Date(normalisedDate)
    return isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime()
  }

  const parseSalaryValue = (salaryString) => {
    if (!salaryString) return 0

    // Handle salary ranges like "20000-35000/Monthly"
    if (typeof salaryString === 'string' && salaryString.includes('-')) {
      const parts = salaryString.split('-')
      if (parts.length >= 2) {
        const minSalary = parts[0].replace(/[^0-9.]/g, '')
        return Number(minSalary) || 0
      }
    }

    const numericPart = salaryString.replace(/[^0-9.]/g, '')
    return Number(numericPart) || 0
  }


  // Get unique values from job listings for dynamic filters
  const employmentTypes = useMemo(() => {
    const uniqueTypes = [...new Set(jobListings.map(job => job.type))]
    const allTypes = [...new Set([...BASE_EMPLOYMENT_FILTERS, ...uniqueTypes])]
    
    return allTypes.map((name) => ({
      name,
      count: jobListings.filter((job) => job.type === name).length,
      selected: selectedEmployment.includes(name),
    })).filter(item => item.count > 0 || BASE_EMPLOYMENT_FILTERS.includes(item.name))
  }, [jobListings, selectedEmployment])

  const jobCategories = useMemo(() => {
    // Get unique categories from actual job listings - show only what exists
    const uniqueCategories = [...new Set(jobListings.map(job => job.category).filter(Boolean))]
    
    return uniqueCategories.map((name) => ({
      name,
      count: jobListings.filter((job) => job.category === name).length,
    })).sort((a, b) => b.count - a.count) // Sort by count descending
  }, [jobListings])

  const jobLevels = useMemo(() => {
    const uniqueLevels = [...new Set(jobListings.map(job => job.experience))]
    const allLevels = [...new Set([...BASE_LEVEL_FILTERS, ...uniqueLevels])]
    
    return allLevels.map((name) => ({
      name,
      count: jobListings.filter((job) => job.experience === name).length,
    })).filter(item => item.count > 0 || BASE_LEVEL_FILTERS.includes(item.name))
  }, [jobListings])

  // Get unique locations and categories for search dropdowns
  const uniqueLocations = useMemo(() => {
    const locations = [...new Set(jobListings.map(job => job.location).filter(Boolean))]
    return locations.sort()
  }, [jobListings])

  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(jobListings.map(job => job.category).filter(Boolean))]
    return categories.sort()
  }, [jobListings])

  // Filter locations and categories based on search input
  const filteredLocations = useMemo(() => {
    if (!searchLocation) return uniqueLocations
    return uniqueLocations.filter(loc => 
      loc.toLowerCase().includes(searchLocation.toLowerCase())
    )
  }, [uniqueLocations, searchLocation])

  const filteredCategories = useMemo(() => {
    if (!searchCategory) return uniqueCategories
    return uniqueCategories.filter(cat => 
      cat.toLowerCase().includes(searchCategory.toLowerCase())
    )
  }, [uniqueCategories, searchCategory])

  const filteredJobListings = useMemo(() => {
    // If no filters are applied, show all jobs
    const hasNoFilters = 
      selectedEmployment.length === 0 &&
      selectedCategories.length === 0 &&
      selectedLevels.length === 0 &&
      (!activeLocationFilter || activeLocationFilter.trim() === '') &&
      (!activeCategoryFilter || activeCategoryFilter.trim() === '') &&
      salaryRange[0] === 0 &&
      salaryRange[1] >= 100000
    
    if (hasNoFilters) {
      console.log('No filters applied - showing all jobs:', jobListings.length)
      return jobListings
    }
    
    console.log('Filtering Jobs:', {
      totalJobs: jobListings.length,
      selectedEmployment,
      selectedCategories,
      selectedLevels,
      salaryRange,
      activeLocationFilter,
      activeCategoryFilter
    })
    
    const filtered = jobListings.filter((job) => {
      // Employment type filter - empty array means show all
    const matchesEmployment = selectedEmployment.length === 0 || selectedEmployment.includes(job.type)
      
      // Category filter - empty array means show all
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(job.category)
      
      // Level filter - empty array means show all
    const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(job.experience)
      
      // Salary filter
    const salaryValue = parseSalaryValue(job.salary)
      // If salary is 0 or not found, include it (might be "Negotiable" or missing)
      // Also handle salary ranges - check if min salary is within range
      const matchesSalary = salaryValue === 0 || (salaryValue >= salaryRange[0] && salaryValue <= salaryRange[1])

      // Search filters - empty string means show all
      const locationFilter = activeLocationFilter ? activeLocationFilter.trim() : ''
      const categoryFilter = activeCategoryFilter ? activeCategoryFilter.trim() : ''
      const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase())
      const matchesSearchCategory = !categoryFilter || job.category.toLowerCase().includes(categoryFilter.toLowerCase())

      const matches = matchesEmployment && matchesCategory && matchesLevel && matchesSalary && matchesLocation && matchesSearchCategory
      
      if (!matches) {
        console.log('Job filtered out:', {
          title: job.title,
          matchesEmployment,
          matchesCategory,
          matchesLevel,
          matchesSalary,
          matchesLocation,
          matchesSearchCategory,
          jobType: job.type,
          jobCategory: job.category,
          jobExperience: job.experience,
          jobSalary: job.salary,
          salaryValue
        })
      }

      return matches
    })
    
    console.log('Filtered Jobs Count:', filtered.length)
    return filtered
  }, [jobListings, selectedEmployment, selectedCategories, selectedLevels, salaryRange, activeLocationFilter, activeCategoryFilter])

  const sortedJobListings = useMemo(() => {
    const listings = [...filteredJobListings]

    switch (sortOption) {
      case 'Newest Upward':
        return listings.sort((a, b) => parsePostedDate(b.postedOn) - parsePostedDate(a.postedOn))
      case 'Oldest First':
        return listings.sort((a, b) => parsePostedDate(a.postedOn) - parsePostedDate(b.postedOn))
      case 'Salary High to Low':
        return listings.sort((a, b) => parseSalaryValue(b.salary) - parseSalaryValue(a.salary))
      case 'Salary Low to High':
        return listings.sort((a, b) => parseSalaryValue(a.salary) - parseSalaryValue(b.salary))
      default:
        return listings
    }
  }, [filteredJobListings, sortOption])

  const handleEmploymentToggle = (type) => {
    if (selectedEmployment.includes(type)) {
      setSelectedEmployment(selectedEmployment.filter(item => item !== type))
    } else {
      setSelectedEmployment([...selectedEmployment, type])
    }
  }

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(item => item !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleLevelToggle = (level) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(item => item !== level))
    } else {
      setSelectedLevels([...selectedLevels, level])
    }
  }

  // Handle search button click with smooth transition
  const handleSearchJobs = async () => {
    setShowLocationDropdown(false)
    setShowCategoryDropdown(false)
    
    // Start transition
    setIsTransitioning(true)
    setSearching(true)
    
    // Small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Apply filters - trim whitespace and set empty string if no value
    const locationFilter = searchLocation.trim() || ''
    const categoryFilter = searchCategory.trim() || ''
    setActiveLocationFilter(locationFilter)
    setActiveCategoryFilter(categoryFilter)
    
    // End transition after a brief moment
    setTimeout(() => {
      setIsTransitioning(false)
      setSearching(false)
    }, 300)
  }

  // Clear all filters function
  const handleClearFilters = () => {
    setSelectedEmployment([])
    setSelectedCategories([])
    setSelectedLevels([])
    setSalaryRange([0, 100000])
    setSearchLocation('')
    setSearchCategory('')
    setActiveLocationFilter('')
    setActiveCategoryFilter('')
    setShowLocationDropdown(false)
    setShowCategoryDropdown(false)
  }

  const handleJobClick = (job) => {
    setSelectedJob(job)
    setShowJobPopup(true)
  }

  const handleClosePopup = () => {
    setShowJobPopup(false)
    setSelectedJob(null)
  }

  const handleApplyJob = useCallback((event, job) => {
    if (event?.stopPropagation) {
      event.stopPropagation()
    }

    setShowJobPopup(false)
    setSelectedJob(null)
    navigate('/login')
  }, [navigate])

  const handleSubscribe = async (subscriberEmail) => {
    try {
      const response = await postMethod({
        apiUrl: serviceUrl.subscribeNewsletter,
        payload: {
          email: subscriberEmail
        }
      })

      if (response.status) {
    setIsSubscribed(true)
    setEmail('')
    setTimeout(() => {
      setIsSubscribed(false)
    }, 5000)
      } else {
        console.error('Newsletter subscription failed:', response.message)
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
    }
  }

  // Prevent body scroll when popup or filters are open
  useEffect(() => {
    if (showJobPopup || isFilterOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showJobPopup, isFilterOpen])

  // Auto-clear filters when search bars are empty and all filters are unchecked
  useEffect(() => {
    const isSearchEmpty = !searchLocation.trim() && !searchCategory.trim()
    const areFiltersEmpty = 
      selectedEmployment.length === 0 &&
      selectedCategories.length === 0 &&
      selectedLevels.length === 0 &&
      salaryRange[0] === 0 &&
      salaryRange[1] >= 100000

    // If search is empty and filters are empty, automatically clear active filters
    if (isSearchEmpty && areFiltersEmpty) {
      if (activeLocationFilter || activeCategoryFilter) {
        setActiveLocationFilter('')
        setActiveCategoryFilter('')
      }
    }
  }, [searchLocation, searchCategory, selectedEmployment, selectedCategories, selectedLevels, salaryRange, activeLocationFilter, activeCategoryFilter])

  // Auto-apply search filters when typing (real-time filtering with debounce)
  useEffect(() => {
    // Debounce the filter application
    const timeoutId = setTimeout(() => {
      const locationFilter = searchLocation.trim() || ''
      const categoryFilter = searchCategory.trim() || ''
      
      // Only update if values have changed
      if (locationFilter !== activeLocationFilter || categoryFilter !== activeCategoryFilter) {
        setActiveLocationFilter(locationFilter)
        setActiveCategoryFilter(categoryFilter)
      }
    }, 300) // 300ms debounce for better performance

    return () => clearTimeout(timeoutId)
  }, [searchLocation, searchCategory, activeLocationFilter, activeCategoryFilter])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both dropdown containers
      const locationInput = event.target.closest('[data-location-input]')
      const categoryInput = event.target.closest('[data-category-input]')
      
      if (!locationInput && !categoryInput) {
        setShowLocationDropdown(false)
        setShowCategoryDropdown(false)
      }
    }

    // Use a slight delay to allow click events on dropdown items
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const renderFilterSections = () => (
    <div
      className="w-full p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl"
      style={{ backgroundColor: colorHex('PRIMARY.NAVY') }}
    >
      {/* Type of Employment */}
      <div className="mb-6 sm:mb-8">
        <h4 className="text-base sm:text-lg font-medium mb-3 sm:mb-4" style={{ color: colorHex('NEUTRAL.WHITE') }}>
          Type Of Employment
        </h4>
        <div className="space-y-2 sm:space-y-3">
          {employmentTypes.map((type) => (
            <label key={type.name} className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={type.selected}
                onChange={() => handleEmploymentToggle(type.name)}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded focus:ring-2 flex-shrink-0"
                style={{
                  accentColor: colorHex('ACCENT.GREEN'),
                  backgroundColor: '#F3F4F6',
                  borderColor: '#D1D5DB',
                }}
              />
              <span className="text-xs sm:text-sm break-words" style={{ color: colorHex('NEUTRAL.WHITE') }}>
                {type.name} ({type.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Categories */}
      <div className="mb-6 sm:mb-8">
        <h4 className="text-base sm:text-lg font-medium mb-3 sm:mb-4" style={{ color: colorHex('NEUTRAL.WHITE') }}>
          Job Categories
        </h4>
        <div className="space-y-2 sm:space-y-3">
          {jobCategories.map((category) => (
            <label key={category.name} className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.name)}
                onChange={() => handleCategoryToggle(category.name)}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded focus:ring-2 flex-shrink-0"
                style={{
                  accentColor: colorHex('ACCENT.GREEN'),
                  backgroundColor: '#F3F4F6',
                  borderColor: '#D1D5DB',
                }}
              />
              <span className="text-xs sm:text-sm break-words" style={{ color: colorHex('NEUTRAL.WHITE') }}>
                {category.name} ({category.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Level */}
      <div className="mb-6 sm:mb-8">
        <h4 className="text-base sm:text-lg font-medium mb-3 sm:mb-4" style={{ color: colorHex('NEUTRAL.WHITE') }}>
          Job Level
        </h4>
        <div className="space-y-2 sm:space-y-3">
          {jobLevels.map((level) => (
            <label key={level.name} className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLevels.includes(level.name)}
                onChange={() => handleLevelToggle(level.name)}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded focus:ring-2 flex-shrink-0"
                style={{
                  accentColor: colorHex('ACCENT.GREEN'),
                  backgroundColor: '#F3F4F6',
                  borderColor: '#D1D5DB',
                }}
              />
              <span className="text-xs sm:text-sm break-words" style={{ color: colorHex('NEUTRAL.WHITE') }}>
                {level.name} ({level.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="mb-6 sm:mb-8">
        <h4 className="text-base sm:text-lg font-medium mb-3 sm:mb-4" style={{ color: colorHex('NEUTRAL.WHITE') }}>
          Salary Range
        </h4>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between text-xs sm:text-sm" style={{ color: colorHex('NEUTRAL.WHITE') }}>
            <span>${salaryRange[0].toLocaleString()}</span>
            <span>${salaryRange[1].toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100000"
            step="5000"
            value={salaryRange[1]}
            onChange={(event) => setSalaryRange([salaryRange[0], parseInt(event.target.value, 10)])}
            className="w-full h-1.5 sm:h-2 rounded-lg appearance-none cursor-pointer slider bg-gray-200"
          />
        </div>
      </div>

      <button
        className="w-full py-2.5 sm:py-3 font-semibold rounded-lg transition-colors text-sm sm:text-base"
        style={{
          color: colorHex('NEUTRAL.WHITE'),
          backgroundColor: colorHex('ACCENT.GREEN'),
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = colorHex('HOVER.ACCENT_GREEN')
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = colorHex('ACCENT.GREEN')
        }}
        onClick={() => setIsFilterOpen(false)}
      >
        Apply Filter
      </button>
    </div>
  )

 
  return (
    <div className={`min-h-screen ${colorClass('BG.PRIMARY_NAVY')}`}>
      <Navbar />
      <div className="w-full">
        {/* Hero Section */}
        <div className={`py-4 xs:py-6 sm:py-8 md:py-12 lg:py-16 rounded-[20px] xs:rounded-[25px] sm:rounded-[30px] md:rounded-[40px] lg:rounded-[50px] ${colorClass('BG.SURFACE_PALE_BLUE')} mx-1 xs:mx-2 sm:mx-3 md:mx-4 lg:mx-6 xl:mx-8 my-2 xs:my-3 sm:my-4 md:my-6 lg:my-8`}>
            <div className="max-w-4xl mx-auto text-center px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="mb-3 sm:mb-4 md:mb-5">
              <div className={`inline-block border-2 ${COLOR_CLASSES.border.accentGreen} ${COLOR_CLASSES.text.accentGreen} px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 lg:px-6 lg:py-2 rounded-full text-[10px] xs:text-xs sm:text-sm font-semibold`}>
                #1 PORTAL JOB PLATFORM
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-12">
              <h1 className={`text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl px-2 sm:px-4 md:px-8 lg:px-12 xl:px-20 font-bold mb-2 sm:mb-4 md:mb-6 lg:mb-8 ${colorClass('TEXT.PRIMARY_DEEP_BLUE')} leading-tight`}>
                Find Your Dream Job
              </h1>
              <img src={textunderline} alt="" className="w-[60%] xs:w-[50%] sm:w-[45%] md:w-[40%] lg:w-[35%] xl:w-[30%] h-[8px] xs:h-[10px] sm:h-[12px] md:h-[15px] lg:h-[20px] xl:h-[25px] -mt-2 sm:-mt-4 md:-mt-6 lg:-mt-8 xl:-mt-10" />
            </div>

            <p className="text-xs xs:text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto px-2 sm:px-4" style={{ color: colorHex('NEUTRAL.BLUE_GRAY') }}>
              Discover thousands of job opportunities from top companies. Start your career journey with just one click.
            </p>

            <div className="rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-lg p-2 xs:p-2.5 sm:p-3 md:p-4 lg:p-6 max-w-2xl mx-auto mb-4 xs:mb-5 sm:mb-6 md:mb-8" style={{ backgroundColor: colorHex('NEUTRAL.WHITE'), position: 'relative', zIndex: 10 }}>
              <div className="flex flex-col gap-2 xs:gap-2.5 sm:gap-3 sm:flex-row sm:items-stretch w-full relative">
                {/* Location Search Input */}
                <div className="flex-1 relative w-full sm:w-auto min-w-0 z-50" data-location-input>
                  <div className="flex items-center px-2 py-1.5 xs:px-2.5 xs:py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 lg:px-5 lg:py-3 xl:px-6 rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-full bg-white shadow-sm sm:shadow-none border border-gray-200 w-full min-w-0">
                    <FaMapMarkerAlt className="mr-1 xs:mr-1.5 sm:mr-2 md:mr-3 text-[10px] xs:text-xs sm:text-sm md:text-base flex-shrink-0" style={{ color: colorHex('ACCENT.GREEN') }} />
                    <input
                      type="text"
                      placeholder="Location..."
                      value={searchLocation}
                      onChange={(e) => {
                        setSearchLocation(e.target.value)
                        setShowLocationDropdown(true)
                      }}
                      onFocus={() => setShowLocationDropdown(true)}
                      onBlur={(e) => {
                        // Delay hiding dropdown to allow click events
                        setTimeout(() => {
                          if (!e.currentTarget.contains(document.activeElement)) {
                            setShowLocationDropdown(false)
                          }
                        }, 200)
                      }}
                      className="flex-1 text-[11px] xs:text-xs sm:text-sm md:text-base outline-none bg-transparent min-w-0 w-0"
                      style={{ color: colorHex('NEUTRAL.BLUE_GRAY') }}
                    />
                    <FaSearch className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm flex-shrink-0 ml-0.5 xs:ml-1" style={{ color: colorHex('NEUTRAL.BLUE_GRAY') }} />
                  </div>
                  {/* Location Dropdown */}
                  {showLocationDropdown && filteredLocations.length > 0 && (
                    <div 
                      className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                      style={{ 
                        top: '100%',
                        left: 0,
                        right: 0,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {filteredLocations.map((location, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSearchLocation(location)
                            setActiveLocationFilter(location)
                            setShowLocationDropdown(false)
                          }}
                          className="px-3 xs:px-4 py-2 hover:bg-gray-100 cursor-pointer text-xs xs:text-sm transition-colors"
                          style={{ color: colorHex('PRIMARY.NAVY') }}
                        >
                          {location}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category Search Input */}
                <div className="flex-1 relative w-full sm:w-auto min-w-0 z-50" data-category-input>
                  <div className="flex items-center px-2 py-1.5 xs:px-2.5 xs:py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 lg:px-5 lg:py-3 xl:px-6 rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-full bg-white shadow-sm sm:shadow-none border border-gray-200 w-full min-w-0">
                    <FaBriefcase className="mr-1 xs:mr-1.5 sm:mr-2 md:mr-3 text-[10px] xs:text-xs sm:text-sm md:text-base flex-shrink-0" style={{ color: colorHex('ACCENT.GREEN') }} />
                    <input
                      type="text"
                      placeholder="Category..."
                      value={searchCategory}
                      onChange={(e) => {
                        setSearchCategory(e.target.value)
                        setShowCategoryDropdown(true)
                      }}
                      onFocus={() => setShowCategoryDropdown(true)}
                      onBlur={(e) => {
                        // Delay hiding dropdown to allow click events
                        setTimeout(() => {
                          if (!e.currentTarget.contains(document.activeElement)) {
                            setShowCategoryDropdown(false)
                          }
                        }, 200)
                      }}
                      className="flex-1 text-[11px] xs:text-xs sm:text-sm md:text-base outline-none bg-transparent min-w-0 w-0"
                      style={{ color: colorHex('NEUTRAL.BLUE_GRAY') }}
                    />
                    <FaSearch className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm flex-shrink-0 ml-0.5 xs:ml-1" style={{ color: colorHex('NEUTRAL.BLUE_GRAY') }} />
                  </div>
                  {/* Category Dropdown */}
                  {showCategoryDropdown && filteredCategories.length > 0 && (
                    <div 
                      className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                      style={{ 
                        top: '100%',
                        left: 0,
                        right: 0,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {filteredCategories.map((category, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSearchCategory(category)
                            setActiveCategoryFilter(category)
                            setShowCategoryDropdown(false)
                          }}
                          className="px-3 xs:px-4 py-2 hover:bg-gray-100 cursor-pointer text-xs xs:text-sm transition-colors"
                          style={{ color: colorHex('PRIMARY.NAVY') }}
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSearchJobs}
                  disabled={searching}
                  className={`w-full sm:w-auto sm:flex-shrink-0 px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-2 xs:py-2.5 sm:py-2.5 md:py-3 rounded-lg xs:rounded-xl sm:rounded-full transition-all duration-300 flex items-center justify-center shadow-sm sm:shadow-none text-[11px] xs:text-xs sm:text-sm md:text-base whitespace-nowrap ${
                    searching ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-md'
                  }`}
                  style={{
                    color: colorHex('NEUTRAL.WHITE'),
                    backgroundColor: colorHex('ACCENT.GREEN'),
                    transform: searching ? 'scale(0.98)' : 'scale(1)',
                  }}
                  onMouseEnter={(event) => {
                    if (!searching) {
                      event.currentTarget.style.backgroundColor = colorHex('HOVER.ACCENT_GREEN')
                    }
                  }}
                  onMouseLeave={(event) => {
                    if (!searching) {
                      event.currentTarget.style.backgroundColor = colorHex('ACCENT.GREEN')
                    }
                  }}
                >
                  {searching ? (
                    <>
                      <div className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5 xs:mr-2"></div>
                      <span className="hidden xs:inline">Searching...</span>
                      <span className="xs:hidden">Search...</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-1 xs:mr-1.5 sm:mr-2 hidden sm:inline">Search Jobs</span>
                      <span className="mr-1 xs:mr-1.5 sm:mr-2 sm:hidden">Search</span>
                      <FaSearch className="text-[10px] xs:text-xs sm:text-sm" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[10px] xs:text-xs sm:text-sm md:text-base px-2 sm:px-4 mt-2 sm:mt-3" style={{ color: colorHex('NEUTRAL.BLUE_GRAY') }}>
              Popular: <span className="font-medium" style={{ color: colorHex('ACCENT.GREEN') }}>UI Designer, Graphic Designer, Data Analyst, Developer</span>
            </p>
          </div>
        </div>
      
        <div className="flex flex-col lg:flex-row lg:gap-4 xl:gap-6 2xl:gap-10 py-4 xs:py-5 sm:py-6 md:py-8 lg:py-10 px-2 xs:px-3 sm:px-4 md:px-5 lg:px-8 xl:px-12 2xl:px-16 mb-8 sm:mb-12 md:mb-16 lg:mb-20 bg-white">
          {/* Left Panel - Filters */}
          <aside className="hidden lg:block lg:w-64 xl:w-72 2xl:w-80 flex-shrink-0">
            <div className="flex items-center justify-between mb-3 xl:mb-4 2xl:mb-6">
              <h3 className="text-base xl:text-lg 2xl:text-xl font-semibold" style={{ color: colorHex('PRIMARY.NAVY') }}>
              Filter By
            </h3>
              {(selectedEmployment.length > 0 || selectedCategories.length > 0 || selectedLevels.length > 0 || activeLocationFilter || activeCategoryFilter || salaryRange[0] > 0 || salaryRange[1] < 100000) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs xl:text-sm font-medium px-2 py-1 rounded hover:underline"
                  style={{ color: colorHex('ACCENT.GREEN') }}
                >
                  Clear All
                </button>
              )}
            </div>
            {renderFilterSections()}
          </aside>

          {/* Right Panel - Job Listings */}
          <div className="flex-1 w-full lg:p-2 xl:p-4 2xl:p-6 rounded-r-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg-white)' }}>
            {/* Header */}
            <div className={`flex flex-col gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 lg:flex-row lg:items-center lg:justify-between mb-3 xs:mb-3.5 sm:mb-4 md:mb-5 lg:mb-6 mx-0.5 xs:mx-1 sm:mx-2 transition-all duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center gap-2 xs:gap-3 flex-wrap">
                <h2 className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold transition-all duration-300 break-words" style={{ color: colorHex('PRIMARY.NAVY') }}>
                  {searching ? 'Searching...' : `All ${sortedJobListings.length} Jobs Found`}
              </h2>
                {(selectedEmployment.length > 0 || selectedCategories.length > 0 || selectedLevels.length > 0 || activeLocationFilter || activeCategoryFilter || salaryRange[0] > 0 || salaryRange[1] < 100000) && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs xs:text-sm font-medium px-2 xs:px-3 py-1 xs:py-1.5 rounded border transition-colors hover:bg-gray-50"
                    style={{ 
                      color: colorHex('ACCENT.GREEN'),
                      borderColor: colorHex('ACCENT.GREEN')
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 md:space-x-3 gap-2 sm:gap-3">
                <button
                  className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-200 shadow-sm transition-colors lg:hidden text-sm sm:text-base"
                  style={{
                    color: colorHex('PRIMARY.NAVY'),
                    backgroundColor: colorHex('NEUTRAL.WHITE'),
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = colorHex('SURFACE.SOFT_GREEN')
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = colorHex('NEUTRAL.WHITE')
                  }}
                  onClick={() => setIsFilterOpen(true)}
                >
                  <FaFilter className="mr-2" />
                  Filter
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>Sort by:</span>
                  <select
                    className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm md:text-base"
                    style={{
                      borderColor: 'var(--color-gray-300)',
                      backgroundColor: 'var(--color-bg-white)',
                      color: colorHex('PRIMARY.NAVY'),
                    }}
                    value={sortOption}
                    onChange={(event) => setSortOption(event.target.value)}
                  >
                    <option value="Newest Upward">Newest Upward</option>
                    <option value="Oldest First">Oldest First</option>
                    <option value="Salary High to Low">Salary High to Low</option>
                    <option value="Salary Low to High">Salary Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Cards */}
            <div className={`space-y-4 sm:space-y-5 md:space-y-6 transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
              {/* Initial Loading State */}
              {loading && !searching && (
                <div className="p-6 sm:p-8 md:p-10 text-center rounded-lg mx-1 sm:mx-2 animate-pulse">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
                    <p className="text-lg sm:text-xl font-medium" style={{ color: colorHex('PRIMARY.NAVY') }}>
                      Loading jobs...
                    </p>
                  </div>
                </div>
              )}
              
              {/* Search Loading State */}
              {searching && (
                <div className="p-6 sm:p-8 md:p-10 text-center rounded-lg mx-1 sm:mx-2 animate-pulse">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
                    <p className="text-base sm:text-lg font-medium" style={{ color: colorHex('PRIMARY.NAVY') }}>
                      Searching jobs...
                    </p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="p-6 sm:p-8 md:p-10 text-center rounded-lg mx-1 sm:mx-2 animate-fade-in" style={{ backgroundColor: '#fee' }}>
                  <p className="text-sm sm:text-base text-red-600">{error}</p>
                </div>
              )}
              
              {!loading && !searching && !error && sortedJobListings.length === 0 && (
                <div className="p-6 sm:p-8 md:p-10 text-center rounded-lg mx-1 sm:mx-2 animate-fade-in" style={{ backgroundColor: 'var(--color-gray-100)' }}>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2" style={{ color: colorHex('PRIMARY.NAVY') }}>
                    No jobs match the selected filters
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base" style={{ color: 'var(--color-text-muted)' }}>
                    Try adjusting your filters to find more opportunities.
                  </p>
                </div>
              )}
              
              {!loading && !searching && !error && sortedJobListings.map((job, index) => (
                <div 
                  key={job.id} 
                  className="rounded-lg p-4 sm:p-5 md:p-6 hover:shadow-md transition-all duration-300 ease-in-out mx-1 sm:mx-2 cursor-pointer animate-fade-in-up" 
                  style={{ 
                    backgroundColor: 'var(--color-bg-white)', 
                    border: '1px solid var(--color-gray-200)',
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both'
                  }}
                  onClick={() => handleJobClick(job)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                      {/* Company Logo */}
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl md:text-2xl flex-shrink-0"
                        style={{ backgroundColor: job.logoColor }}
                      >
                        {job.logo}
                      </div>
                      
                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 break-words" style={{ color: colorHex('PRIMARY.NAVY') }}>{job.title}</h3>
                        <p className="mb-2 sm:mb-3 text-sm sm:text-base break-words" style={{ color: 'var(--color-text-muted)' }}>{job.company} • {job.location}</p>
                        
                        {/* Job Details with Icons */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 md:space-x-6 mb-3 sm:mb-4 gap-2 sm:gap-0">
                          <div className="flex items-center space-x-2">
                            <FaBriefcase className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }} />
                            <span className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>{job.type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: 'var(--color-text-muted)' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>{job.salary}</span>
                          </div>
                        </div>
                        
                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                          {job.skills.map((skill, index) => (
                            <span 
                              key={index}
                              className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium rounded-full"
                              style={{ backgroundColor: 'var(--color-secondary-10)', color: 'var(--color-secondary-dark)' }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        )}
                        
                        {/* Application Progress */}
                        <div className="mb-3 sm:mb-4">
                          <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2" style={{ color: 'var(--color-text-muted)' }}>
                            <span>{job.applied} Applied of {job.capacity} Capacity</span>
                          </div>
                          <div className="w-full rounded-full h-1.5 sm:h-2" style={{ backgroundColor: 'var(--color-gray-200)' }}>
                            <div 
                              className="h-1.5 sm:h-2 rounded-full" 
                              style={{ 
                                width: `${(job.applied / job.capacity) * 100}%`,
                                backgroundColor: colorHex('PRIMARY.NAVY')
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-shrink-0 sm:w-auto w-full" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 font-semibold rounded-lg transition-colors text-sm sm:text-base"
                        style={{ 
                          color: 'var(--color-bg-white)',
                          backgroundColor: 'var(--color-secondary)'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-secondary-dark)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-secondary)'}
                        onClick={(event) => handleApplyJob(event, job)}
                      >
                        Apply Job
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 sm:mt-8 mx-1 sm:mx-2 overflow-x-auto">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button 
                  className="px-2 py-1.5 sm:px-3 sm:py-2 transition-colors text-sm sm:text-base"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => e.target.style.color = colorHex('PRIMARY.NAVY')}
                  onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
                >‹</button>
                <button 
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded text-sm sm:text-base"
                  style={{ 
                    color: 'var(--color-bg-white)',
                    backgroundColor: 'var(--color-secondary)'
                  }}
                >1</button>
                <button 
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors text-sm sm:text-base"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => e.target.style.color = colorHex('PRIMARY.NAVY')}
                  onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
                >2</button>
                <button 
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors text-sm sm:text-base"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => e.target.style.color = colorHex('PRIMARY.NAVY')}
                  onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
                >3</button>
                <button 
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors text-sm sm:text-base"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => e.target.style.color = colorHex('PRIMARY.NAVY')}
                  onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
                >4</button>
                <button 
                  className="px-2 py-1.5 sm:px-3 sm:py-2 transition-colors text-sm sm:text-base"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => e.target.style.color = colorHex('PRIMARY.NAVY')}
                  onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
                >›</button>
              </div>
            </div>
          </div>
        </div>
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="flex-1 bg-black bg-opacity-40"
              onClick={() => setIsFilterOpen(false)}
            />
            <div className="relative w-full max-w-sm sm:max-w-md h-full bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold" style={{ color: colorHex('PRIMARY.NAVY') }}>
                  Filter By
                </h3>
                <button
                  type="button"
                  className="p-1.5 sm:p-2 rounded-full transition-colors hover:bg-gray-100"
                  style={{ color: colorHex('PRIMARY.NAVY') }}
                  onClick={() => setIsFilterOpen(false)}
                  aria-label="Close filters"
                >
                  <FaTimes className="text-lg sm:text-xl" />
                </button>
              </div>
              <div className="px-4 sm:px-5 py-4 sm:py-6 overflow-y-auto flex-1 bg-white">
                {renderFilterSections()}
              </div>
            </div>
          </div>
        )}
      
        {/* Subscribe Section */}
        <NewsletterSubscription 
          headerContent={{
            title: "New Things Will Always Update Regularly"
          }}
          email={email}
          setEmail={setEmail}
          onSubscribe={handleSubscribe}
          isSubscribed={isSubscribed}
        />
   
        {/* Footer */}
        <Footer />
      </div>
      
      {/* Job Detail Popup */}
      {showJobPopup && <JobDetails job={selectedJob} onClose={handleClosePopup} onApplyJob={handleApplyJob} />}
    </div>
  )
}

export default FindJob
