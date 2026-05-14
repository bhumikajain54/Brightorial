import React, { useState, useEffect, useRef } from 'react'
import { LuPlus, LuX, LuFileText, LuChevronDown } from 'react-icons/lu'
import { MatrixCard } from '../../../../shared/components/metricCard'
import { Button } from '../../../../shared/components/Button'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import { getMethod, postMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl'
import Swal from 'sweetalert2'

const CreateSkillPage = () => {
  const [showForm, setShowForm] = useState(false)
  const [questions, setQuestions] = useState([])
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [showJobDropdown, setShowJobDropdown] = useState(false)
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const dropdownRef = useRef(null)
  const [formData, setFormData] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0 // 0=A, 1=B, 2=C, 3=D
  })
  const [errorMessage, setErrorMessage] = useState('')

  const totalQuestions = 3

  // Fetch questions from API when job is selected
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedJob) {
        setQuestions([])
        return
      }

      try {
        setLoadingQuestions(true)
        const jobId = selectedJob.id || selectedJob.job_id
        const res = await getMethod({ 
          apiUrl: `${apiService.getSkillQuestions}?job_id=${jobId}` 
        })
        
        if (res?.status && res?.data) {
          const questionsList = Array.isArray(res.data) ? res.data : []
          // Map API response to local format
          const mappedQuestions = questionsList.map((q, idx) => ({
            id: q.id || q.question_id || Date.now() + idx,
            questionText: q.question_text || q.question || '',
            options: [
              q.option_a || '',
              q.option_b || '',
              q.option_c || '',
              q.option_d || ''
            ],
            correctAnswer: q.correct_option === 'A' ? 0 : q.correct_option === 'B' ? 1 : q.correct_option === 'C' ? 2 : 3,
            jobId: jobId,
            jobTitle: selectedJob.title || selectedJob.job_title || null
          }))
          setQuestions(mappedQuestions)
        } else {
          setQuestions([])
        }
      } catch (err) {
        console.error('❌ Error fetching questions:', err)
        setQuestions([])
      } finally {
        setLoadingQuestions(false)
      }
    }
    
    fetchQuestions()
  }, [selectedJob])

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true)
        const res = await getMethod({ apiUrl: apiService.getJobs })
        
        const jobsList = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.rows)
          ? res.rows
          : Array.isArray(res?.jobs)
          ? res.jobs
          : []
        
        setJobs(jobsList)
      } catch (err) {
        console.error('❌ Error fetching jobs:', err)
      } finally {
        setLoadingJobs(false)
      }
    }
    
    fetchJobs()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowJobDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter questions based on selected job
  const filteredQuestions = selectedJob
    ? questions.filter(q => q.jobId === selectedJob.id || q.jobId === selectedJob.job_id)
    : []

  const questionsCreated = filteredQuestions.length
  const progressPercentage = (questionsCreated / totalQuestions) * 100

  const handleJobSelect = (job) => {
    setSelectedJob(job)
    setShowJobDropdown(false)
    setShowForm(false) // Close form when job changes
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('')
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }))
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('')
    }
  }

  const handleCorrectAnswerChange = (index) => {
    setFormData(prev => ({
      ...prev,
      correctAnswer: index
    }))
  }

  // Convert index to API format (0=A, 1=B, 2=C, 3=D)
  const getCorrectOptionLetter = (index) => {
    return ['A', 'B', 'C', 'D'][index] || 'A'
  }

  const handleAddQuestion = async () => {
    // Check if question limit is reached
    if (questionsCreated >= totalQuestions) {
      setErrorMessage(`You have reached the maximum limit of ${totalQuestions} questions.`)
      return
    }

    // Validation - Check if job is selected
    if (!selectedJob) {
      setErrorMessage('Please select a job first before adding questions.')
      return
    }

    // Validation - Check question text
    if (!formData.questionText.trim()) {
      setErrorMessage('Please fill all fields. Question text is required.')
      return
    }

    // Validation - Check all options
    const hasEmptyOptions = formData.options.some(opt => !opt.trim())
    if (hasEmptyOptions) {
      setErrorMessage('Please fill all fields. All options are required.')
      return
    }

    // Validation - Check if correct answer is selected
    if (formData.correctAnswer === null || formData.correctAnswer === undefined) {
      setErrorMessage('Please select the correct answer.')
      return
    }

    // Clear error message if validation passes
    setErrorMessage('')

    try {
      setLoadingQuestion(true)
      const jobId = selectedJob.id || selectedJob.job_id
      
      // Prepare API payload according to API format
      const payload = {
        job_id: jobId,
        question_text: formData.questionText.trim(),
        option_a: formData.options[0].trim(),
        option_b: formData.options[1].trim(),
        option_c: formData.options[2].trim(),
        option_d: formData.options[3].trim(),
        correct_option: getCorrectOptionLetter(formData.correctAnswer)
      }

      console.log('📤 Sending question to API:', payload)

      const res = await postMethod({
        apiUrl: apiService.addSkillQuestion,
        payload: payload
      })

      if (res?.status) {
        // Success - Add question to local state
        const newQuestion = {
          id: res.data?.id || res.data?.question_id || Date.now(),
          questionText: formData.questionText.trim(),
          options: formData.options.map(opt => opt.trim()),
          correctAnswer: formData.correctAnswer,
          jobId: jobId,
          jobTitle: selectedJob?.title || selectedJob?.job_title || null
        }

        setQuestions(prev => [...prev, newQuestion])
        setFormData({
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        })
        setShowForm(false)
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: res.message || 'Question added successfully!',
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        // API returned error
        setErrorMessage(res.message || 'Failed to add question. Please try again.')
      }
    } catch (err) {
      console.error('❌ Error adding question:', err)
      setErrorMessage('Something went wrong. Please try again.')
    } finally {
      setLoadingQuestion(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    })
    setErrorMessage('')
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
        Manage MCQ questions for your scale test
      </h2>

      {/* Questions Created Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Questions Created: {questionsCreated}/{totalQuestions}
          </span>
          <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
            {Math.round(progressPercentage)}%
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-[var(--color-secondary)] h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {/* Completion Message */}
        {questionsCreated >= totalQuestions && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">
              ✓ All questions have been created! You have reached the maximum limit of {totalQuestions} questions.
            </p>
          </div>
        )}
      </div>

      {/* Jobs Dropdown and Add New Question Button */}
      <div className="flex gap-3">
        {/* Jobs Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowJobDropdown(!showJobDropdown)}
            className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-colors border bg-white border-gray-300 hover:bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY}`}
          >
            {/* <span className="text-sm font-semibold">Select Job:</span> */}
            <span className={`text-sm ${selectedJob ? TAILWIND_COLORS.TEXT_PRIMARY : TAILWIND_COLORS.TEXT_MUTED}`}>
              {selectedJob ? (selectedJob.title || selectedJob.job_title || 'Selected Job') : 'Select Job'}
            </span>
            <LuChevronDown 
              size={16} 
              className={`transition-transform ${showJobDropdown ? 'rotate-180' : ''} ${TAILWIND_COLORS.TEXT_MUTED}`}
            />
          </button>
          
          {/* Dropdown Menu */}
          {showJobDropdown && (
            <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {loadingJobs ? (
                <div className="px-4 py-3 text-sm text-gray-500">Loading jobs...</div>
              ) : jobs.length > 0 ? (
                jobs.map((job) => {
                  const jobId = job.id || job.job_id
                  const jobTitle = job.title || job.job_title || 'Untitled Job'
                  const isSelected = selectedJob && (selectedJob.id === jobId || selectedJob.job_id === jobId)
                  
                  return (
                    <button
                      key={jobId}
                      onClick={() => handleJobSelect(job)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50 font-medium' : ''
                      }`}
                    >
                      <div className={`text-sm ${isSelected ? 'text-blue-600' : TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {jobTitle}
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">No jobs available</div>
              )}
            </div>
          )}
        </div>
        
        {/* Add New Question Button - Disabled when no job selected or limit reached */}
        <button
          onClick={() => {
            if (!selectedJob) {
              setErrorMessage('Please select a job first before adding questions.')
              return
            }
            if (questionsCreated >= totalQuestions) {
              setErrorMessage(`You have reached the maximum limit of ${totalQuestions} questions.`)
              return
            }
            setShowForm(!showForm)
          }}
          disabled={!selectedJob || questionsCreated >= totalQuestions}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedJob && questionsCreated < totalQuestions
              ? `text-white ${TAILWIND_COLORS.BTN_PRIMARY} hover:opacity-90 cursor-pointer`
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
          }`}
        >
          <LuPlus size={20} />
          Add New Question
        </button>
      </div>

      {/* Add Question Form - Inline */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {/* Form Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Add New Question
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <LuX size={20} className={TAILWIND_COLORS.TEXT_MUTED} />
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Form Content */}
          <div className="space-y-6">
            {/* Question Text */}
            <div>
              <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                Question Text
              </label>
              <textarea
                name="questionText"
                value={formData.questionText}
                onChange={handleInputChange}
                placeholder="Enter your question here"
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none resize-y ${
                  errorMessage && !formData.questionText.trim() ? 'border-red-500' : 'border-gray-300'
                } ${TAILWIND_COLORS.TEXT_PRIMARY}`}
              />
            </div>

            {/* Options */}
            <div>
              <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
                Options (Select correct answer)
              </label>
              <div className="space-y-3">
                {formData.options.map((option, index) => {
                  const optionLabel = ['A', 'B', 'C', 'D'][index]
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === index}
                        onChange={() => handleCorrectAnswerChange(index)}
                        className="w-5 h-5 text-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]"
                      />
                      <span className={`w-8 text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {optionLabel}:
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Enter option ${optionLabel}`}
                        className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none ${
                          errorMessage && !option.trim() ? 'border-red-500' : 'border-gray-300'
                        } ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button
              onClick={handleCancel}
              variant="light"
              size="md"
              className="flex items-center gap-2"
            >
              <LuX size={16} />
              Cancel
            </Button>
            <Button
              onClick={handleAddQuestion}
              variant="primary"
              size="md"
              className="flex items-center gap-2"
              disabled={loadingQuestion}
            >
              {loadingQuestion ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <LuFileText size={16} />
                  Add Question
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Empty State or Questions List */}
      {!selectedJob ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className={`text-lg ${TAILWIND_COLORS.TEXT_MUTED}`}>
            Please select a job to view or add questions.
          </p>
        </div>
      ) : filteredQuestions.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className={`text-lg ${TAILWIND_COLORS.TEXT_MUTED}`}>
            No questions added yet for this job. Create your first question to get started.
          </p>
        </div>
      ) : loadingQuestions ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin"></div>
            <p className={`text-lg ${TAILWIND_COLORS.TEXT_MUTED}`}>
              Loading questions...
            </p>
          </div>
        </div>
      ) : filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>
                Question {index + 1}: {question.questionText}
              </h3>
              <div className="space-y-2">
                {question.options.map((option, optIndex) => {
                  const optionLabel = ['A', 'B', 'C', 'D'][optIndex]
                  const isCorrect = optIndex === question.correctAnswer
                  return (
                    <div key={optIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={isCorrect}
                        readOnly
                        className="w-4 h-4"
                      />
                      <span className={`${isCorrect ? 'font-semibold text-green-600' : TAILWIND_COLORS.TEXT_MUTED}`}>
                        Option {optionLabel}: {option}
                        {isCorrect && ' ✓ (Correct Answer)'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default CreateSkillPage

