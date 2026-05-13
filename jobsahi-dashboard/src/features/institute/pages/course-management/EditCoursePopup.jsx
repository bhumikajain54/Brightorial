import React, { useState, useEffect } from 'react'
import { LuX, LuPlus } from 'react-icons/lu'
import RichTextEditor from '../../../../shared/components/RichTextEditor.jsx'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import { getMethod, putMethod } from '../../../../service/api' // ✅ getMethod add
import apiService from '../../services/serviceUrl'

const EditCoursePopup = ({ course, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    courseTitle: '',
    duration: '',
    category: '', // ✅ yaha ab category_id (string) store hoga
    description: '',
    taggedSkills: '',
    batchLimit: '',
    courseStatus: 'Active',
    mode: '',
    fee: '',
    certificationAllowed: true,
    moduleTitle: '',
    moduleDescription: ''
  })

  const [categories, setCategories] = useState([]) // ✅ backend categories
  const [selectedMedia, setSelectedMedia] = useState([])
  const [validationErrors, setValidationErrors] = useState({})

  // ✅ Step 1: Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getMethod({
          apiUrl: apiService.getCourseCategories // 👈 isko ensure karo: yahi URL get_course_category.php pe point kare
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


  // ✅ Step 2: Pre-fill form from course prop
  useEffect(() => {
    if (!course) return

    // ---- media parse ----
    let parsedMedia = []
    try {
      if (typeof course.media === 'string' && course.media.trim() !== '') {
        const temp = JSON.parse(course.media)
        if (Array.isArray(temp)) {
          parsedMedia = temp
        } else {
          parsedMedia = course.media.split(',').map(m => m.trim())
        }
      } else if (Array.isArray(course.media)) {
        parsedMedia = course.media
      }
    } catch {
      parsedMedia = course.media
        ? course.media.split(',').map(m => m.trim())
        : []
    }

    // ---- category handle (prefer ID) ----
    let categoryValue = ''
    if (course.category_id) {
      categoryValue = String(course.category_id) // ✅ direct ID
    } else if (course.categoryId) {
      categoryValue = String(course.categoryId)
    } else if (course.category && categories.length) {
      // optional: match by name if needed
      const match = categories.find(
        c =>
          c.category_name.toLowerCase() ===
          String(course.category).toLowerCase()
      )
      if (match) categoryValue = String(match.id)
    }

    setFormData(prev => ({
      ...prev,
      courseTitle: course.title || '',
      duration: course.duration || '',
      category: categoryValue || '', // ✅ store id as string
      description: course.description || '',
      taggedSkills: Array.isArray(course.skills)
        ? course.skills.join(', ')
        : course.tagged_skills || '',
      batchLimit: course.batch_limit || course.batchLimit || '',
      courseStatus: course.status || 'Active',
      mode: course.mode || '',
      fee: course.fee || '',
      certificationAllowed:
        course.certification_allowed === 1 ||
        course.certificationAllowed === true,
      moduleTitle: course.module_title || course.moduleTitle || '',
      moduleDescription:
        course.module_description || course.moduleDescription || ''
    }))

    setSelectedMedia(
      Array.isArray(parsedMedia)
        ? parsedMedia.map((m, index) =>
            typeof m === 'string'
              ? {
                  id: `${index}-${m}`,
                  name: m,
                  url: '',
                  type: ''
                }
              : m
          )
        : []
    )
  }, [course, categories])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }

  const handleMediaSelect = e => {
    const files = Array.from(e.target.files)
    const newMedia = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }))
    setSelectedMedia(prev => [...prev, ...newMedia])
  }

  const handleRemoveMedia = id => {
    setSelectedMedia(prev => prev.filter(m => m.id !== id))
  }

  const getInputClass = field =>
    `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
      validationErrors[field]
        ? 'border-red-500 focus:ring-red-500'
        : `${TAILWIND_COLORS.BORDER} focus:ring-[#5C9A24]`
    }`

  // ✅ Step 3: Save (no manual category mapping)
  const handleSave = async () => {
    const required = [
      'courseTitle',
      'duration',
      'category',
      'description',
      'batchLimit',
      'mode',
      'fee'
    ]
    const errors = {}
    required.forEach(f => {
      if (!formData[f] || formData[f].toString().trim() === '') {
        errors[f] = 'This field is required'
      }
    })
    if (Object.keys(errors).length) {
      setValidationErrors(errors)
      alert('Please fill all required fields.')
      return
    }

    const payload = {
      title: formData.courseTitle,
      description: formData.description,
      duration: parseInt(formData.duration),
      fee: parseFloat(formData.fee),
      // ✅ category direct as ID (from select)
      category_id: formData.category ? parseInt(formData.category) : 0,
      tagged_skills: formData.taggedSkills,
      batch_limit: parseInt(formData.batchLimit),
      status: formData.courseStatus,
      // instructor_name: removed - instructor assigned at batch level, not course level
      mode: formData.mode,
      certification_allowed: formData.certificationAllowed ? 1 : 0,
      module_title: formData.moduleTitle || '',
      module_description: formData.moduleDescription || '',
      media:
        selectedMedia && selectedMedia.length > 0
          ? selectedMedia.map(m => m.name || m).join(', ')
          : '',
      admin_action: 'approved'
    }

    try {
      const res = await putMethod({
        apiUrl: `${apiService.updateCourse}?id=${course.id}`,
        payload
      })

      if (res?.status) {
        onSave(payload)
        onClose()
      } else {
        alert(`❌ Update failed: ${res?.message || 'Unknown error'}`)
      }
    } catch (err) {
      alert('Something went wrong while updating the course.')
    }
  }

  if (!course) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Edit Course
          </h2>
          <button
            onClick={onClose}
            className={`${TAILWIND_COLORS.TEXT_MUTED} hover:text-[#1A569A]`}
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Basic Information */}
          <div className={`${TAILWIND_COLORS.CARD} p-6`}>
            <h3
              className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-6`}
            >
              Basic Information
            </h3>

            {/* Course Title */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                COURSE TITLE <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.courseTitle}
                onChange={e =>
                  handleInputChange('courseTitle', e.target.value)
                }
                className={getInputClass('courseTitle')}
                placeholder="e.g. Assistant Electrician"
              />
            </div>

            {/* Duration */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                DURATION (WEEKS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={e =>
                  handleInputChange('duration', e.target.value)
                }
                className={getInputClass('duration')}
                placeholder="e.g. 12"
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                COURSE DESCRIPTION <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={v => handleInputChange('description', v)}
                placeholder="Enter course description"
                height="150px"
                returnPlainText={true}
              />
            </div>

            {/* Skills */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                TAGGED SKILLS
              </label>
              <input
                type="text"
                value={formData.taggedSkills}
                onChange={e =>
                  handleInputChange('taggedSkills', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5C9A24]"
                placeholder="e.g. Wiring, Safety Measures"
              />
            </div>

            {/* Batch Limit */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                BATCH LIMIT <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.batchLimit}
                onChange={e =>
                  handleInputChange('batchLimit', e.target.value)
                }
                className={getInputClass('batchLimit')}
                placeholder="e.g. 30"
              />
            </div>

            {/* Status */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                COURSE STATUS
              </label>
              <select
                value={formData.courseStatus}
                onChange={e =>
                  handleInputChange('courseStatus', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Additional Settings */}
          <div className={`${TAILWIND_COLORS.CARD} p-6`}>
            <h3
              className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-6`}
            >
              Additional Settings
            </h3>

            {/* Category (Dynamic) */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                CATEGORY <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={e =>
                  handleInputChange('category', e.target.value)
                }
                className={getInputClass('category')}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fee */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                fee <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fee}
                onChange={e => handleInputChange('fee', e.target.value)}
                className={getInputClass('fee')}
                placeholder="e.g. 15000"
              />
            </div>

            {/* Instructor - REMOVED: Instructor should be assigned at batch level, not course level */}

            {/* Mode */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                MODE <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.mode}
                onChange={e => handleInputChange('mode', e.target.value)}
                className={getInputClass('mode')}
                placeholder="Online / Offline"
              />
            </div>
          </div>

          {/* Module */}
          <div className={`${TAILWIND_COLORS.CARD} p-6`}>
            <h3
              className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-6`}
            >
              Course Module
            </h3>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                MODULE TITLE
              </label>
              <input
                type="text"
                value={formData.moduleTitle}
                onChange={e =>
                  handleInputChange('moduleTitle', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g. Introduction to Basics"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                MODULE DESCRIPTION
              </label>
              <textarea
                rows="4"
                value={formData.moduleDescription}
                onChange={e =>
                  handleInputChange(
                    'moduleDescription',
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter module description"
              ></textarea>
            </div>
          </div>

          {/* Media Upload */}
          <div className={`${TAILWIND_COLORS.CARD} p-6`}>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#5C9A24] transition">
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleMediaSelect}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <div className="w-12 h-12 bg-gray-100 rounded-md mx-auto mb-4 flex items-center justify-center">
                  <LuPlus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">Click or drag files to upload</p>
              </label>

              {Array.isArray(selectedMedia) && selectedMedia.length > 0 && (
                <div className="mt-6 text-left">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Selected Files:
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedMedia.map(media => (
                      <div
                        key={media.id || media.name || media}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-2"
                      >
                        <span className="text-sm text-gray-700 truncate">
                          {media.name || media}
                        </span>
                        <button
                          onClick={() =>
                            handleRemoveMedia(media.id)
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <LuX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className={`px-6 py-2 ${TAILWIND_COLORS.BTN_LIGHT} rounded-lg`}
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2 ${TAILWIND_COLORS.BTN_PRIMARY} rounded-lg`}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditCoursePopup
