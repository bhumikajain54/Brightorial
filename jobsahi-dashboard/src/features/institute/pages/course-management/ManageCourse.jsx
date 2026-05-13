import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LuSearch, LuChevronDown, LuCalendar, LuPencil, LuBuilding, LuRefreshCw } from 'react-icons/lu'
import { useCourseContext } from '../../context/CourseContext'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import EditCoursePopup from './EditCoursePopup'
import { getMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl'
import Swal from 'sweetalert2'

export default function ManageCourse({ onNavigateToCreateCourse }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { updateCourse } = useCourseContext()
  
  const [coursesData, setCoursesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    fields: '',
    Courses: ''
  })
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showEditPopup, setShowEditPopup] = useState(false)
  const [categories, setCategories] = useState([])
  const isInitialLoad = useRef(true) // Track if initial load is done
  const debounceTimerRef = useRef(null) // Store debounce timer

  // ✅ Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getMethod({
          apiUrl: apiService.getCourseCategories
        })
        
        if (res?.status && Array.isArray(res.categories)) {
          setCategories(res.categories)
        } else {
          setCategories([])
        }
      } catch (err) {
        setCategories([])
      }
    }
    
    fetchCategories()
  }, [])

  // ✅ Fetch courses on component mount (no debounce for initial load)
  useEffect(() => {
    fetchCourses('') // Pass empty string for initial load
    isInitialLoad.current = false // Mark initial load as done
    
    // Show success message if redirected from create course
    if (location.state?.message) {
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: location.state.message,
          confirmButtonColor: '#5C9A24'
        })
        // Clear the state
        window.history.replaceState({}, document.title)
      }, 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  // ✅ Update course categories when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && coursesData.length > 0) {
      // Update courses with category names only if category is missing or different
      setCoursesData(prevCourses => 
        prevCourses.map(course => {
          const newCategoryName = getCategoryName(course.categoryId)
          // Only update if category name is different or was empty
          if (course.category !== newCategoryName) {
            return {
              ...course,
              category: newCategoryName
            }
          }
          return course
        })
      )
    }
  }, [categories, coursesData.length])

  // ✅ Fetch courses from backend - UPDATED to match backend response
  const fetchCourses = useCallback(async (searchQuery = '') => {
    try {
      setLoading(true)
      
      // Build query params if needed
      const queryParams = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''
      const apiUrl = `${apiService.getCourses}${queryParams}`
      
      const res = await getMethod({ apiUrl })

      if (res?.status && Array.isArray(res.courses)) {
        // Transform backend data to frontend format
        const transformedCourses = res.courses.map(course => ({
          id: course.id,
          instituteId: course.institute_id,
          title: course.title || '',
          description: course.description || '',
          duration: parseInt(course.duration) || 0,
          categoryId: course.category_id,
          category: getCategoryName(course.category_id),
          fee: course.fee ? (typeof course.fee === 'string' ? parseFloat(course.fee.replace(/[^\d.]/g, '')) : parseFloat(course.fee)) : 0,
          status: course.status || '',
          instructorName: course.instructor_name || '',
          mode: course.mode || '',
          skills: course.tagged_skills
            ? course.tagged_skills.split(',').map(s => s.trim()).filter(Boolean)
            : [],
          batchLimit: course.batch_limit,
          certificationAllowed: !!course.certification_allowed,
          moduleTitle: course.module_title || '',
          moduleDescription: course.module_description || '',
          media: course.media || '',
          adminAction: course.admin_action, // Only for admin
          createdAt: course.created_at,
          updatedAt: course.updated_at
        }))
        
        setCoursesData(transformedCourses)
      } else {
        setCoursesData([])
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch courses. Please try again.',
        confirmButtonColor: '#5C9A24'
      })
      setCoursesData([])
    } finally {
      setLoading(false)
    }
  }, [categories])

  // Helper function to get category name from ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return ''
    
    const category = categories.find(cat => 
      cat.id === categoryId || cat.category_id === categoryId
    )
    
    return category?.category_name || category?.name || ''
  }

  // Filter courses based on search and filters
  const filteredCourses = coursesData.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filters.status || course.status.toLowerCase() === filters.status.toLowerCase()
    
    // Match fields by category name or category ID (from API categories)
    const matchesFields = !filters.fields || (() => {
      if (!filters.fields) return true
      
      const filterValue = filters.fields.toLowerCase().trim()
      
      // Check by category name
      const courseCategoryName = (course.category || '').toLowerCase().trim()
      if (courseCategoryName === filterValue || courseCategoryName.includes(filterValue)) {
        return true
      }
      
      // Also check by category ID - find the selected category and match by ID
      const selectedCategory = categories.find(cat => {
        const catName = (cat.category_name || cat.name || '').toLowerCase().trim()
        return catName === filterValue || catName.includes(filterValue)
      })
      
      if (selectedCategory) {
        const selectedCategoryId = selectedCategory.id || selectedCategory.category_id
        const courseCategoryId = course.categoryId
        return selectedCategoryId && courseCategoryId && (
          selectedCategoryId === courseCategoryId || 
          String(selectedCategoryId) === String(courseCategoryId)
        )
      }
      
      return false
    })()
    
    // Match courses by course title (from API courses)
    const matchesCourses = !filters.Courses || (() => {
      const courseTitle = course.title.toLowerCase()
      const filterValue = filters.Courses.toLowerCase()
      return courseTitle === filterValue || courseTitle.includes(filterValue)
    })()
    
    return matchesSearch && matchesStatus && matchesFields && matchesCourses
  })

  const itemsPerPage = 4
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCourses = filteredCourses.slice(startIndex, endIndex)

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setCurrentPage(1)
    
    // ✅ Always clear previous timer when user types
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    
    // ✅ Skip debounce on initial mount (handled by mount effect)
    if (isInitialLoad.current) {
      return
    }
    
    // ✅ Set new timer - API will be called ONLY after 500ms of no typing
    debounceTimerRef.current = setTimeout(() => {
      console.log('🔍 Debounced API call for:', value)
      fetchCourses(value) // Pass current value
      debounceTimerRef.current = null
    }, 500) // Wait 500ms after user stops typing
  }

  // ✅ Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleBuyNow = (courseId) => {
    // Implement buy now logic
  }

  const handleAction = (action, courseId) => {
    const course = coursesData.find(c => c.id === courseId)
    
    if (action === 'edit') {
      setSelectedCourse(course)
      setShowEditPopup(true)
    }
  }

  const handleEditClose = () => {
    setShowEditPopup(false)
    setSelectedCourse(null)
  }

  const handleEditSave = async (updatedCourse) => {
    try {
      // Prepare payload matching backend structure
      const payload = {
        title: updatedCourse.title,
        description: updatedCourse.description,
        duration: parseInt(updatedCourse.duration),
        fee: parseFloat(updatedCourse.fee),        
        category_id: updatedCourse.categoryId,
        tagged_skills: Array.isArray(updatedCourse.skills) 
        ? updatedCourse.skills.join(',') 
        : updatedCourse.skills,
        batch_limit: updatedCourse.batchLimit,
        status: updatedCourse.status,
        instructor_name: updatedCourse.instructorName,
        mode: updatedCourse.mode,
        certification_allowed: updatedCourse.certificationAllowed ? 1 : 0,
        module_title: updatedCourse.moduleTitle,
        module_description: updatedCourse.moduleDescription,
        media: updatedCourse.media
      }

      // Update in backend - uncomment when update API is ready
      // const res = await putMethod({ 
      //   apiUrl: `${apiService.updateCourse}/${selectedCourse.id}`, 
      //   payload 
      // })
      
      // Update local state
      setCoursesData(prev => prev.map(course => 
        course.id === selectedCourse.id ? { ...course, ...updatedCourse } : course
      ))
      
      if (updateCourse) {
        updateCourse(selectedCourse.id, updatedCourse)
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Course updated successfully!',
        confirmButtonColor: '#5C9A24'
      })
      setShowEditPopup(false)
      setSelectedCourse(null)
      
      // Refresh from backend
      fetchCourses(searchTerm)
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update course. Please try again.',
        confirmButtonColor: '#5C9A24'
      })
    }
  }


  const handleRefresh = () => {
    setSearchTerm('')
    setFilters({
      status: '',
      fields: '',
      Courses: ''
    })
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    fetchCourses('') // Refresh with empty search
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LuRefreshCw className="w-8 h-8 animate-spin text-[#5C9A24] mx-auto mb-2" />
          <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      {/* Header Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-[#1A569A]">All Course</h1>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Refresh courses"
          >
            <LuRefreshCw className={`w-5 h-5 ${TAILWIND_COLORS.TEXT_MUTED}`} />
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          {/* Search Bar */}
          <div className="relative">
            <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by course name"
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C9A24] w-full lg:w-64 bg-white"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#5C9A24] min-w-[120px]"
              >
                <option value="">Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <LuChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Fields Filter - Using API Categories */}
            <div className="relative">
              <select
                value={filters.fields}
                onChange={(e) => handleFilterChange('fields', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#5C9A24] min-w-[120px]"
              >
                <option value="">Fields</option>
                {categories.length > 0 ? (
                  categories.map((category) => {
                    const categoryName = category.category_name || category.name || ''
                    if (!categoryName) return null
                    return (
                      <option key={category.id || category.category_id} value={categoryName.toLowerCase()}>
                        {categoryName}
                      </option>
                    )
                  })
                ) : (
                  <option value="" disabled>Loading categories...</option>
                )}
              </select>
              <LuChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Courses Filter - Using API Courses */}
            <div className="relative">
              <select
                value={filters.Courses}
                onChange={(e) => handleFilterChange('Courses', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#5C9A24] min-w-[120px]"
              >
                <option value="">Courses</option>
                {coursesData.length > 0 ? (
                  coursesData
                    .map(course => course.title)
                    .filter((title, index, self) => title && self.indexOf(title) === index) // Get unique course titles
                    .sort()
                    .map(courseTitle => (
                      <option key={courseTitle} value={courseTitle.toLowerCase()}>
                        {courseTitle}
                      </option>
                    ))
                ) : (
                  <option value="" disabled>Loading courses...</option>
                )}
              </select>
              <LuChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            
          </div>
        </div>
      </div>

      {/* Course Count */}
      {coursesData.length > 0 && (
        <div className="mb-4">
          <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
            Showing {currentCourses.length} of {filteredCourses.length} courses
            {filteredCourses.length !== coursesData.length && ` (${coursesData.length} total)`}
          </p>
        </div>
      )}

      {/* Empty State */}
      {coursesData.length === 0 ? (
        <div className={`${TAILWIND_COLORS.CARD} p-12 text-center`}>
          <div className="max-w-md mx-auto">
            <LuBuilding className={`w-16 h-16 ${TAILWIND_COLORS.TEXT_MUTED} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              No Courses Yet
            </h3>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-6`}>
              Start by creating your first course to get started.
            </p>
            <button
              onClick={onNavigateToCreateCourse}
              className={`${TAILWIND_COLORS.BTN_PRIMARY} px-6 py-2 rounded-lg text-sm font-medium`}
            >
              Create Course
            </button>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className={`${TAILWIND_COLORS.CARD} p-12 text-center`}>
          <LuSearch className={`w-12 h-12 ${TAILWIND_COLORS.TEXT_MUTED} mx-auto mb-4`} />
          <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
            No Results Found
          </h3>
          <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <>
          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {currentCourses.map((course) => (
              <div key={course.id} className={`${TAILWIND_COLORS.CARD} p-6`}>
                {/* Status */}
                <div className="flex justify-end items-center mb-3">
                  {course.status && (
                    <span className={`${
                      course.status.toLowerCase() === 'active' 
                        ? TAILWIND_COLORS.BADGE_SUCCESS 
                        : course.status.toLowerCase() === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    } text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                      {course.status}
                    </span>
                  )}
                </div>

                {/* Course Title */}
                <h3 className={`text-lg font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  {course.title}
                </h3>

                {/* Category and Mode */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <LuBuilding className={`w-4 h-4 ${TAILWIND_COLORS.TEXT_MUTED}`} />
                    <span className={`text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase`}>
                      {course.category}
                    </span>
                  </div>
                  {course.mode && (
                    <span className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      • {course.mode}
                    </span>
                  )}
                  {course.duration && (
                    <span className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      • {course.duration} weeks
                    </span>
                  )}
                </div>

                {/* Skills Tags */}
                {course.skills && course.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className={`${TAILWIND_COLORS.BADGE_SUCCESS} text-xs font-medium px-2 py-1 rounded-full`}
                      >
                        {skill}
                      </span>
                    ))}
                    {course.skills.length > 3 && (
                      <span className={`${TAILWIND_COLORS.BADGE_SUCCESS} text-xs font-medium px-2 py-1 rounded-full`}>
                        +{course.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-4 line-clamp-2`}>
                  {course.description || 'No description available'}
                </p>

                {/* Instructor */}
                {course.instructorName && (
                  <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mb-3`}>
                    Instructor: <span className="font-medium">{course.instructorName}</span>
                  </p>
                )}

                {/* fee and Actions */}
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    ₹{course.fee && course.fee > 0 ? course.fee.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBuyNow(course.id)}
                      className={`${TAILWIND_COLORS.BTN_PRIMARY} px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={() => handleAction('edit', course.id)}
                      className={`p-2 ${TAILWIND_COLORS.TEXT_MUTED} hover:text-[#5C9A24] transition-colors`}
                      title="Edit"
                    >
                      <LuPencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} bg-white ${TAILWIND_COLORS.BORDER} rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    currentPage === page
                      ? 'bg-[#5C9A24] text-white'
                      : `${TAILWIND_COLORS.TEXT_MUTED} bg-white ${TAILWIND_COLORS.BORDER} hover:bg-gray-50`
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} bg-white ${TAILWIND_COLORS.BORDER} rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit Course Popup */}
      {showEditPopup && selectedCourse && (
        <EditCoursePopup
          course={selectedCourse}
          onSave={handleEditSave}
          onClose={handleEditClose}
        />
      )}

    </div>
  )
}
