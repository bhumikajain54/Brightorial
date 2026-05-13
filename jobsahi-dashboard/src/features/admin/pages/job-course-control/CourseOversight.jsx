import React, { useState, useEffect, useCallback } from 'react';
import { COLORS, TAILWIND_COLORS } from '../../../../shared/WebConstant.js';
import Button from '../../../../shared/components/Button.jsx';
import CentralizedDataTable from '../../../../shared/components/CentralizedDataTable.jsx';
import { getMethod, postMethod, putMethod, deleteMethod } from '../../../../service/api';
import apiService from '../../services/serviceUrl';
import Swal from 'sweetalert2';

const CourseOversight = () => {
  // ====== STATE MANAGEMENT ======
  // Courses state
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [minTopRated, setMinTopRated] = useState(4.5);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [institutes, setInstitutes] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // ====== COMPUTED VALUES ======
  // ✅ Show all courses (status filter removed)
  const filteredCourses = courses;

  // ====== EVENT HANDLERS ======
  // Course selection handlers (for CentralizedDataTable)
  const handleRowSelect = (selectedIds) => {
    setSelectedCourses(selectedIds);
  };
  
  // Course action handlers
  const updateCourseStatus = (ids, nextStatus) => setCourses(prev => prev.map(c => (ids.includes(c.id) ? { ...c, status: nextStatus } : c)));
   
  // Promote course (placeholder - API integration will be done later)
  const handlePromoteCourse = async (courseId) => {
    // API call removed - will be integrated later
    Swal.fire({
      icon: 'info',
      title: 'Coming Soon',
      text: 'Promote functionality will be available soon.',
      confirmButtonColor: '#5C9A24'
    });
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };
  const handleCloseCourseModal = () => {
    setShowCourseModal(false);
    setSelectedCourse(null);
  };
  
  const handleBulkCoursePromote = async () => {
    if (selectedCourses.length === 0) return;
    
    // API call removed - will be integrated later
    Swal.fire({
      icon: 'info',
      title: 'Coming Soon',
      text: 'Bulk promote functionality will be available soon.',
      confirmButtonColor: '#5C9A24'
    });
  };

  // ====== API CALLS ======
  const fetchCourses = useCallback(async () => {
    try {
      setLoadingCourses(true);
      const response = await getMethod({
        apiUrl: apiService.getCourses
      });

      console.log('📊 Courses API Response:', response);

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true;

      if (isSuccess) {
        // Extract courses array from response (can be in response.courses or response.data)
        const coursesArray = response.courses || response.data || [];
        
        if (Array.isArray(coursesArray) && coursesArray.length > 0) {
          // Map API response to component format
          const mappedCourses = coursesArray.map((course) => {
            const instituteId = course.institute_id;
            // Priority: 1. institute_name from API, 2. institutes map, 3. N/A
            const instituteName = course.institute_name || institutes[instituteId] || 'N/A';
            
            return {
              id: course.id || course.course_id,
              title: course.title || course.course_name || course.name || 'N/A',
              category: course.category_name || course.category || 'N/A',
              // instructor: course.instructor_name || course.instructor || course.faculty_name || 'N/A',
              institute: instituteName,
              institute_id: instituteId,
              rating: parseFloat(course.average_rating || course.rating || course.avg_rating || 0) || 0,
              status: course.admin_action === 'approved' ? 'Approved' :
                     course.is_featured === 1 ? 'Featured' :
                     course.admin_action === 'pending' ? 'Pending' :
                     'Pending',
              // Keep all original data
              ...course
            };
          });

          console.log('✅ Mapped Courses:', mappedCourses);
          setCourses(mappedCourses);
        } else {
          console.warn('⚠️ No courses found in response');
          setCourses([]);
        }
      } else {
        console.error('❌ Failed to fetch courses:', response?.message);
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  // Update courses with institute names when institutes are loaded
  useEffect(() => {
    if (courses.length > 0 && Object.keys(institutes).length > 0) {
      setCourses(prevCourses => {
        const updated = prevCourses.map(course => {
          const instituteId = course.institute_id;
          const instituteName = institutes[instituteId] || 'N/A';
          // Only update if institute name changed
          if (course.institute !== instituteName) {
            return {
              ...course,
              institute: instituteName
            };
          }
          return course;
        });
        // Only update state if something actually changed
        const hasChanges = updated.some((course, index) => course.institute !== prevCourses[index]?.institute);
        return hasChanges ? updated : prevCourses;
      });
    }
  }, [institutes]);

  const fetchInstitutes = useCallback(async () => {
    try {
      const response = await getMethod({
        apiUrl: apiService.institutesList
      });

      console.log('📊 Institutes API Response:', response);

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true;

      if (isSuccess) {
        const institutesArray = response.data || response.institutes || [];
        
        if (Array.isArray(institutesArray) && institutesArray.length > 0) {
          // Create a map of institute_id to institute name
          const institutesMap = {};
          institutesArray.forEach(inst => {
            const instId = inst.user_id || inst.id || inst.institute_id;
            const instName = inst.profile?.institute_name || inst.institute_name || inst.name || inst.user_name || 'N/A';
            if (instId) {
              institutesMap[instId] = instName;
            }
          });
          
          console.log('✅ Institutes Map:', institutesMap);
          setInstitutes(institutesMap);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching institutes:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await getMethod({
        apiUrl: apiService.getCourseCategory
      });

      console.log('📊 Categories API Response:', response);

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true;

      if (isSuccess) {
        // Extract category names from response
        // API returns categories in response.categories or response.data
        let categoryList = [];
        
        if (response.categories && Array.isArray(response.categories)) {
          categoryList = response.categories.map(cat => ({
            id: cat.id,
            name: cat.category_name || cat.name || cat.title || cat
          }));
        } else if (response.data && Array.isArray(response.data)) {
          categoryList = response.data.map(cat => ({
            id: cat.id,
            name: cat.category_name || cat.name || cat.title || cat
          }));
        } else if (Array.isArray(response)) {
          categoryList = response.map(cat => ({
            id: cat.id,
            name: cat.category_name || cat.name || cat.title || cat
          }));
        }
        
        console.log('✅ Categories:', categoryList);
        setCategories(categoryList);
      } else {
        console.error('❌ Failed to fetch categories:', response?.message);
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    // Fetch all data in parallel
    fetchInstitutes();
    fetchCategories();
    fetchCourses();
  }, [fetchInstitutes, fetchCategories, fetchCourses]);

  // Category management handlers
  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) {
      Swal.fire('Error!', 'Please enter a category name', 'error');
      return;
    }

    // Check if category already exists (handle both object and string formats)
    const categoryExists = categories.some(cat => {
      const categoryName = typeof cat === 'object' ? cat.name : cat;
      return categoryName.toLowerCase() === name.toLowerCase();
    });

    if (categoryExists) {
      Swal.fire('Error!', 'Category already exists', 'error');
      return;
    }

    try {
      const response = await postMethod({
        apiUrl: apiService.createCourseCategory,
        payload: {
          category_name: name
        }
      });

      console.log('📊 Create Category API Response:', response);

      if (response?.status === true || response?.success === true) {
        Swal.fire('Success!', 'Category added successfully', 'success');
        setNewCategory('');
        // Auto-refresh will handle the UI update, but refresh immediately for instant feedback
        fetchCategories();
      } else {
        Swal.fire('Error!', response?.message || 'Failed to add category', 'error');
      }
    } catch (error) {
      console.error('❌ Error adding category:', error);
      Swal.fire('Error!', 'Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (category) => {
    const categoryName = typeof category === 'object' ? category.name : category;
    const categoryId = typeof category === 'object' ? category.id : null;

    const result = await Swal.fire({
      title: 'Delete Category?',
      text: `Are you sure you want to delete "${categoryName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        // Call API to delete from database
        if (categoryId) {
          const response = await deleteMethod({
            apiUrl: `${apiService.deleteCourseCategory}?id=${categoryId}`
          });

          console.log('📊 Delete Category API Response:', response);

          if (response?.status === true || response?.success === true) {
            Swal.fire('Deleted!', 'Category has been deleted successfully', 'success');
            // Auto-refresh will handle the UI update, but refresh immediately for instant feedback
            fetchCategories();
          } else {
            Swal.fire('Error!', response?.message || 'Failed to delete category', 'error');
            fetchCategories(); // Refresh to get correct state
          }
        } else {
          Swal.fire('Error!', 'Category ID not found', 'error');
        }
      } catch (error) {
        console.error('❌ Error deleting category:', error);
        Swal.fire('Error!', 'Failed to delete category', 'error');
        fetchCategories(); // Refresh to get correct state
      }
    }
  };

  const handleRenameCategory = (oldName) => {
    const next = window.prompt('Rename category', oldName);
    const name = (next || '').trim();
    if (!name || name === oldName) return;
    setCategories(prev => prev.map(c => (c === oldName ? name : c)));
  };

  // Top-rated tagging handler
  const handleTagTopRated = () => {
    const ids = courses.filter(c => c.rating >= Number(minTopRated)).map(c => c.id);
    if (ids.length) updateCourseStatus(ids, 'Featured');
  };

  return (
    <div className="space-y-6">
      {/* Course Management */}
      <div className={`${TAILWIND_COLORS.CARD} p-6`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.GREEN_PRIMARY }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Course Oversight</h2>
            <p className="text-gray-600 text-sm">Manage course approvals, categories, and quality control</p>
          </div>
        </div>

        {/* Course Table */}
        {loadingCourses ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className={`mt-4 text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading courses...</p>
          </div>
        ) : (
          <CentralizedDataTable
            title="Courses"
            subtitle="Manage and approve courses"
            data={filteredCourses}
            columns={[
              { key: 'title', header: 'Title' },
              { key: 'institute', header: 'Institute' },
              { key: 'category', header: 'Category' },
              // { key: 'instructor', header: 'Instructor' },
              { 
                key: 'rating', 
                header: 'Rating',
                render: (value) => `${value || 0} ⭐`
              },
              {
                key: 'status',
                header: 'Status',
                render: (value) => (
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      value === 'Approved'
                            ? TAILWIND_COLORS.BADGE_SUCCESS
                        : value === 'Featured'
                            ? TAILWIND_COLORS.BADGE_INFO
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                    {value}
                      </span>
                )
              }
            ]}
            actions={[
              {
                label: 'Promote',
                variant: 'primary',
                onClick: (course) => handlePromoteCourse(course.id),
                disabled: (course) => course.status === 'Featured' || course.is_featured === 1
              },
              {
                label: 'View',
                variant: 'outline',
                onClick: (course) => handleViewCourse(course)
              }
            ]}
            searchable={true}
            selectable={true}
            showAutoScrollToggle={false}
            searchPlaceholder="Search courses, categories, or instructors"
            emptyStateMessage="No courses found"
            onBulkAction={(action, selectedIds) => {
              if (action === 'promote') {
                setSelectedCourses(selectedIds);
                handleBulkCoursePromote();
              }
            }}
          />
        )}
      </div>

      {/* Category Management */}
      <div className={`${TAILWIND_COLORS.CARD} p-6`}>
        <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>Category Management</h3>
        
        {loadingCategories ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className={`mt-4 text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>No categories found</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => {
              const categoryName = typeof category === 'object' ? category.name : category;
              const categoryKey = typeof category === 'object' ? category.id || category.name : category;
              
              return (
                <div key={categoryKey} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-sm text-gray-700">{categoryName}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
          <Button onClick={handleAddCategory} variant="primary" size="md">
            Add Category
          </Button>
        </div>
      </div>

      {/* Course Details Modal */}
      {showCourseModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.GREEN_PRIMARY }}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Course Details</h3>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>View complete course information</p>
                </div>
              </div>
              <button
                onClick={handleCloseCourseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Course Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className={`text-md font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>Course Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Course Title</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.title || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Institute</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.institute || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Category</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.category || 'N/A'}</p>
                  </div>
                  {/* <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Instructor</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.instructor || 'N/A'}</p>
                  </div> */}
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Duration</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.duration || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Fee</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.fee ? `₹${selectedCourse.fee}` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Mode</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.mode || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Batch Limit</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.batch_limit || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Rating</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.rating || 0} ⭐</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Status</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.status || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Certification Allowed</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>
                      {selectedCourse.certification_allowed === true || selectedCourse.certification_allowed === 1 ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Tagged Skills</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.tagged_skills || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Created At</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.created_at || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Updated At</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.updated_at || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Course Description */}
              {selectedCourse.description && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className={`text-md font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>
                    Course Description
                  </h4>
                  <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm leading-relaxed whitespace-pre-wrap break-words`}>
                    {selectedCourse.description}
                  </p>
                </div>
              )}

              {/* Module Information */}
              {(selectedCourse.module_title || selectedCourse.module_description) && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className={`text-md font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>
                    Module Information
                  </h4>
                  {selectedCourse.module_title && (
                    <div className="mb-2">
                      <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Module Title</label>
                      <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedCourse.module_title}</p>
                    </div>
                  )}
                  {selectedCourse.module_description && (
                    <div>
                      <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Module Description</label>
                      <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1 whitespace-pre-wrap break-words`}>
                        {selectedCourse.module_description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 shadow-sm">
              <Button
                variant="outline"
                onClick={handleCloseCourseModal}
                className="px-6 py-2"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseOversight;
