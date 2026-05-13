import React, { useState, useEffect, useCallback } from 'react'
import { LuStar, LuUser, LuMessageSquare, LuCheck, LuRefreshCw, LuX } from 'react-icons/lu'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import { Button } from '../../../../shared/components/Button'
import { getMethod, postMethod, putMethod } from '../../../../service/api'
import apiService from '../../services/serviceUrl'
import Swal from 'sweetalert2'

const PanelManagement = () => {
  const [formData, setFormData] = useState({
    interview_id: '',
    candidate_name: '', // Store candidateName for panelist_name
    rating: 0,
    feedback: ''
  })

  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [studentsList, setStudentsList] = useState([])

  // ✅ Update modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch scheduled interviews to get student list - THIS IS CALLED FIRST
  const fetchScheduledInterviews = useCallback(async () => {
    try {
      setLoadingStudents(true)
      console.log('🔄 Step 1: Fetching scheduled interviews...')
      console.log('📤 API URL:', apiService.getScheduledInterviews)
      
      // ✅ Fetch both scheduled interviews and recent applicants to get job titles
      const [response, applicantsResponse] = await Promise.all([
        getMethod({ apiUrl: apiService.getScheduledInterviews }),
        getMethod({ apiUrl: apiService.getRecentApplicants })
      ])
      
      // ✅ Create a map of application_id -> job_title from applicants
      const jobTitleMap = {};
      if (applicantsResponse?.status && applicantsResponse?.all_applicants?.data) {
        applicantsResponse.all_applicants.data.forEach((app) => {
          const appId = String(app.application_id || app.applicationId || '');
          const jobTitle = app.applied_for || app.job_title || app.jobTitle || '';
          if (appId && jobTitle) {
            jobTitleMap[appId] = jobTitle;
          }
        });
        console.log('📋 Job title map created:', Object.keys(jobTitleMap).length, 'applications with job titles');
      }

      console.log('📅 Scheduled Interviews Response:', response)
      console.log('📅 Response Type:', typeof response)
      console.log('📅 Response Keys:', Object.keys(response || {}))

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      if (isSuccess) {
        let interviews = []
        
        // Try multiple possible response structures
        if (Array.isArray(response.data)) {
          interviews = response.data
          console.log('✅ Found interviews in response.data (array)')
        } else if (response.data && Array.isArray(response.data.data)) {
          interviews = response.data.data
          console.log('✅ Found interviews in response.data.data')
        } else if (response.interviews && Array.isArray(response.interviews)) {
          interviews = response.interviews
          console.log('✅ Found interviews in response.interviews')
        } else if (Array.isArray(response)) {
          interviews = response
          console.log('✅ Response itself is an array')
        } else {
          console.warn('⚠️ No interviews array found. Response structure:', response)
        }
        
        console.log('📊 Total interviews found:', interviews.length)

        // Map to get student list - only essential fields needed
        // Log first item to see available fields
        if (interviews.length > 0) {
          console.log('📋 First interview item structure:', interviews[0])
          console.log('📋 Available fields in first item:', Object.keys(interviews[0]))
          console.log('📋 Checking for job title fields:', {
            jobTitle: interviews[0].jobTitle,
            job_title: interviews[0].job_title,
            jobName: interviews[0].jobName,
            job_name: interviews[0].job_name,
            title: interviews[0].title,
            job: interviews[0].job
          })
        }
        
        // Extract only the 4 important fields: interviewId, candidateName, candidateId, jobTitle
        const allStudents = interviews.map((item, index) => {
          // ✅ Log complete item structure for first few items
          if (index < 3) {
            console.log(`📋 Item ${index} complete structure:`, JSON.stringify(item, null, 2));
            console.log(`📋 Item ${index} all keys:`, Object.keys(item));
          }
          
          // ✅ Try multiple possible field names for interview_id
          const interviewId = item.interviewId || item.interview_id || item.id || item.interviewId || null
          const candidateName = item.candidateName || item.candidate_name || item.name || item.candidate || 'N/A'
          const candidateId = item.candidateId || item.student_id || item.studentId || item.user_id || item.candidate_id
          
          // ✅ Try multiple possible field names for job_title (including nested)
          let jobTitle = item.jobTitle || 
                          item.job_title || 
                          item.title || 
                          item.applied_for || 
                          item.job_name || 
                          item.jobName || 
                          item.job || 
                          item.position ||
                          item.position_title ||
                          (item.jobDetails && (item.jobDetails.title || item.jobDetails.job_title || item.jobDetails.jobTitle)) ||
                          (item.job_info && (item.job_info.title || item.job_info.job_title || item.job_info.jobTitle)) ||
                          (item.job && typeof item.job === 'object' && (item.job.title || item.job.job_title || item.job.jobTitle || item.job.name)) ||
                          ''
          
          // ✅ If job title not found in interview item, try to get it from jobTitleMap using application_id
          if (!jobTitle || jobTitle === '') {
            const appId = String(item.application_id || item.applicationId || '');
            if (appId && jobTitleMap[appId]) {
              jobTitle = jobTitleMap[appId];
              console.log(`✅ Found job title from map for application_id ${appId}:`, jobTitle);
            }
          }
          
          // ✅ Log job title extraction for debugging
          if (index < 3) {
            console.log(`📋 Item ${index} job title extraction:`, {
              jobTitle: item.jobTitle,
              job_title: item.job_title,
              title: item.title,
              applied_for: item.applied_for,
              job_name: item.job_name,
              jobName: item.jobName,
              job: item.job,
              position: item.position,
              position_title: item.position_title,
              extracted_jobTitle: jobTitle
            });
          }
          
          // Log for debugging if required fields are missing
          if (!interviewId || !candidateName) {
            console.warn('⚠️ Missing required fields in item:', {
              interviewId,
              candidateName,
              candidateId,
              jobTitle,
              availableFields: Object.keys(item),
              fullItem: item
            })
          }
          
          // ✅ Keep interview_id as number, but ensure it's valid
          const parsedInterviewId = interviewId ? (typeof interviewId === 'string' ? parseInt(interviewId) : interviewId) : null
          
          return {
            interview_id: parsedInterviewId,
            candidate_name: candidateName,
            candidate_id: candidateId ? (typeof candidateId === 'string' ? parseInt(candidateId) : candidateId) : null,
            job_title: jobTitle,
            // ✅ Keep original data for debugging
            originalData: item
          }
        }).filter(s => s.interview_id !== null && s.candidate_name !== 'N/A') // ✅ Filter out invalid entries
        
        // ✅ Group by candidate_id to remove duplicates - keep first interview_id for each unique candidate
        const groupedByCandidate = {};
        const seenCandidateIds = new Set();
        
        allStudents.forEach((student) => {
          const candidateId = String(student.candidate_id || student.candidate_name);
          
          // Only add if we haven't seen this candidate before
          if (!seenCandidateIds.has(candidateId)) {
            seenCandidateIds.add(candidateId);
            groupedByCandidate[candidateId] = { ...student }; // Create a copy
          } else {
            // If candidate already exists, update job_title if current one is missing or empty
            const existing = groupedByCandidate[candidateId];
            if ((!existing.job_title || existing.job_title === '') && student.job_title) {
              // Update job_title if existing doesn't have one
              existing.job_title = student.job_title;
            } else if (student.job_title && existing.job_title && existing.job_title !== student.job_title) {
              // If both have job titles and they're different, keep the first one (or combine)
              // For now, keep the first one
            }
          }
        });
        
        // ✅ Convert back to array - each candidate appears only once
        const students = Object.values(groupedByCandidate);
        
        console.log('📋 Total interviews before deduplication:', allStudents.length);
        console.log('📋 Unique candidates after deduplication:', students.length);
        console.log('📋 Mapped students with job titles:', students.map(s => ({ 
          interview_id: s.interview_id,
          candidate_name: s.candidate_name, 
          job_title: s.job_title,
          has_job_title: !!s.job_title && s.job_title !== ''
        })))
        
        // ✅ Debug: Check if any students have job_title
        const studentsWithJobTitle = students.filter(s => s.job_title && s.job_title !== '');
        console.log('📋 Students with job_title:', studentsWithJobTitle.length, 'out of', students.length);
        if (studentsWithJobTitle.length > 0) {
          console.log('📋 Sample student with job_title:', studentsWithJobTitle[0]);
        } else {
          console.warn('⚠️ No students have job_title! Checking first student:', students[0]);
          if (students[0] && students[0].originalData) {
            console.log('📋 Original data fields:', Object.keys(students[0].originalData));
            console.log('📋 Original data:', students[0].originalData);
          }
        }

        console.log('✅ Step 1 Complete: Mapped Students List with interview_id and candidate_name:', students)
        console.log('📋 Total students found:', students.length)
        setStudentsList(students)
        
        if (students.length === 0) {
          console.warn('⚠️ No valid students found after mapping')
        }
        
        return true // Return success
      } else {
        console.warn('⚠️ API returned unsuccessful status. Response:', response)
        setStudentsList([])
        return false
      }
    } catch (error) {
      console.error('❌ Error fetching scheduled interviews:', error)
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data
      })
      setStudentsList([])
      return false
    } finally {
      setLoadingStudents(false)
    }
  }, [])

  // Fetch panel feedbacks - THIS IS CALLED AFTER getScheduledInterviews
  const fetchPanelFeedbacks = useCallback(async () => {
    try {
      console.log('🔄 Step 2: Fetching panel feedbacks...')
      console.log('📤 API URL:', apiService.getInterviewPanel)
      console.log('📤 Auth Token:', localStorage.getItem('authToken') ? 'Present' : 'Missing')
      
      setLoading(true)
      const response = await getMethod({
        apiUrl: apiService.getInterviewPanel
      })

      console.log('📊 Panel Feedbacks Raw Response:', response)
      console.log('📊 Response Type:', typeof response)
      console.log('📊 Response Keys:', Object.keys(response || {}))
      console.log('📊 Response Status:', response?.status)
      console.log('📊 Response Message:', response?.message)
      console.log('📊 Response Data:', response?.data)
      console.log('📊 Response Data Type:', typeof response?.data)
      console.log('📊 Is Data Array?', Array.isArray(response?.data))

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      console.log('📊 Is Success?', isSuccess)

      if (isSuccess) {
        let feedbacks = []
        
        // Try multiple possible response structures
        if (Array.isArray(response.data)) {
          feedbacks = response.data
          console.log('✅ Found feedbacks in response.data (array)')
        } else if (response.data && Array.isArray(response.data.data)) {
          feedbacks = response.data.data
          console.log('✅ Found feedbacks in response.data.data')
        } else if (response.feedbacks && Array.isArray(response.feedbacks)) {
          feedbacks = response.feedbacks
          console.log('✅ Found feedbacks in response.feedbacks')
        } else if (response.panelists && Array.isArray(response.panelists)) {
          feedbacks = response.panelists
          console.log('✅ Found feedbacks in response.panelists')
        } else {
          console.warn('⚠️ No feedbacks array found in response. Response structure:', response)
        }

        console.log('📊 Extracted Feedbacks Count:', feedbacks.length)
        console.log('📊 First Feedback Item:', feedbacks[0])

        // Map API response to UI format
        const mappedFeedbacks = feedbacks.map((item) => {
          // Convert string numbers to integers if needed
          const rating = typeof item.rating === 'string' ? parseInt(item.rating) : (item.rating || 0)
          
          // Get panel_id from multiple possible field names
          const panelId = item.panel_id || item.id || item.interview_panel_id || item.panelId
          
          return {
            id: panelId, // Use panel_id as primary ID
            panel_id: panelId, // Also store as panel_id for easy access
            interview_id: item.interview_id,
            candidate: item.panelist_name || item.candidate_name || item.candidate || item.student_name || `Interview #${item.interview_id}`,
            interviewDetails: item.created_at 
              ? `Interview #${item.interview_id} - ${new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`
              : `Interview #${item.interview_id}`,
            rating: rating,
            panelist: item.panelist_name || item.panelist || 'N/A',
            role: item.panelist_role || item.role || 'Panel Member',
            remarks: item.feedback || item.remarks || '',
            decision: item.notes || item.decision || '',
            // Keep original data for update
            originalData: item
          }
        })

        console.log('✅ Mapped Feedbacks:', mappedFeedbacks)
        setFeedbackList(mappedFeedbacks)
      } else {
        console.warn('⚠️ API returned unsuccessful status. Response:', response)
        setFeedbackList([])
      }
    } catch (error) {
      console.error('❌ Error fetching panel feedbacks:', error)
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data,
        fullError: error
      })
      setFeedbackList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // First call getScheduledInterviews, then getInterviewPanel
    const loadData = async () => {
      console.log('🚀 Loading scheduled interviews...')
      await fetchScheduledInterviews()
      console.log('🚀 Loading panel feedbacks...')
      await fetchPanelFeedbacks()
    }
    
    loadData()
  }, [fetchScheduledInterviews, fetchPanelFeedbacks])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }))
  }

  const handleSubmitFeedback = async () => {
    // Debug logging
    console.log('🔍 Form submission - Current formData:', formData)
    console.log('🔍 Validation check:', {
      hasInterviewId: !!formData.interview_id,
      hasCandidateName: !!formData.candidate_name,
      hasFeedback: !!formData.feedback && formData.feedback.trim().length > 0,
      hasRating: formData.rating > 0,
      interview_id: formData.interview_id,
      candidate_name: formData.candidate_name,
      feedback: formData.feedback,
      rating: formData.rating
    })
    
    // Check if all required fields are filled
    const hasInterviewId = formData.interview_id && String(formData.interview_id).trim() !== ''
    const hasCandidateName = formData.candidate_name && formData.candidate_name.trim() !== ''
    const hasFeedback = formData.feedback && formData.feedback.trim().length > 0
    const hasRating = formData.rating > 0
    
    if (!hasInterviewId || !hasCandidateName || !hasFeedback || !hasRating) {
      const missingFields = []
      if (!hasInterviewId) missingFields.push('candidate selection')
      if (!hasCandidateName) missingFields.push('candidate name')
      if (!hasFeedback) missingFields.push('feedback')
      if (!hasRating) missingFields.push('rating')
      
      console.warn('⚠️ Validation failed. Missing fields:', missingFields)
      
      Swal.fire({
        title: "Validation Error",
        text: "Please select a candidate, provide feedback, and give a rating.",
        icon: "error",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Payload: interview_id, panelist_name (candidateName), feedback, rating
      // ✅ Convert interview_id to number, but keep original value for validation
      const interviewIdValue = formData.interview_id
      const interviewId = typeof interviewIdValue === 'string' ? parseInt(interviewIdValue) : interviewIdValue
      
      if (!interviewId || isNaN(interviewId) || interviewId <= 0) {
        console.error('❌ Invalid interview_id:', formData.interview_id)
        Swal.fire({
          title: "Error",
          text: "Invalid interview ID. Please select a candidate again.",
          icon: "error",
        })
        setIsSubmitting(false)
        return
      }
      
      // ✅ Verify interview_id exists in studentsList
      const validInterview = studentsList.find(s => 
        s.interview_id && (s.interview_id === interviewId || String(s.interview_id) === String(interviewId))
      )
      
      if (!validInterview) {
        console.error('❌ Interview ID not found in scheduled interviews:', interviewId)
        Swal.fire({
          title: "Error",
          text: "Selected interview is not valid. Please refresh and select again.",
          icon: "error",
        })
        setIsSubmitting(false)
        return
      }
      
      // ✅ Try sending interview_id as number first (if API expects string, we'll handle in error)
      const payload = {
        interview_id: interviewId, // Send as number
        panelist_name: formData.candidate_name.trim(),
        feedback: formData.feedback.trim(),
        rating: parseInt(formData.rating) || 0
      }
      const response = await postMethod({
        apiUrl: apiService.addInterviewPanel,
        payload: payload
      })

      console.log('📥 Add Panel Feedback Response:', response)
      console.log('📥 Response status:', response?.status)
      console.log('📥 Response message:', response?.message)
      console.log('📥 Full response:', JSON.stringify(response, null, 2))

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      if (isSuccess) {
        Swal.fire({
          title: "Success!",
          text: "Feedback submitted successfully",
          icon: "success",
        }).then(() => {
          setFormData({ interview_id: '', candidate_name: '', rating: 0, feedback: '' })
          fetchPanelFeedbacks() // Refresh feedback list after successful submission
        })
      } else {
        // Show detailed error message
        const errorMessage = response?.message || response?.error || "Failed to submit feedback. Please try again."
        console.error('❌ API Error Response:', {
          status: response?.status,
          message: errorMessage,
          fullResponse: response
        })
        
        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
        })
      }
    } catch (error) {
      console.error('❌ Error submitting feedback:', error)
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data,
        fullError: error
      })
      
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          "Something went wrong. Please try again."
      
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateFeedback = (id) => {
    // Find feedback by id or panel_id
    const feedback = feedbackList.find(f => 
      f.id === id || f.panel_id === id || String(f.id) === String(id) || String(f.panel_id) === String(id)
    )
    
    if (!feedback) {
      console.error('❌ Feedback not found for ID:', id)
      Swal.fire({
        title: "Error",
        text: "Feedback not found. Please refresh and try again.",
        icon: "error",
        confirmButtonColor: '#d33'
      })
      return
    }
    
    // Get panel_id from originalData (API response has 'id' field which is the panel_id)
    const panelId = feedback.originalData?.id || 
                   feedback.originalData?.panel_id || 
                   feedback.id || 
                   feedback.panel_id
    
    // Ensure all required fields are set, especially originalData
    const feedbackWithPanelId = {
      ...feedback,
      panel_id: panelId, // Ensure panel_id is set
      // Preserve originalData - this is critical for update
      originalData: feedback.originalData || {
        id: panelId,
        interview_id: feedback.interview_id,
        panelist_name: feedback.panelist || feedback.candidate,
        feedback: feedback.remarks,
        rating: feedback.rating
      }
    }
    
    console.log('📋 Selected feedback for update:', feedbackWithPanelId)
    console.log('📋 Panel ID extracted:', panelId)
    console.log('📋 Original Data:', feedbackWithPanelId.originalData)
    setSelectedFeedback(feedbackWithPanelId)
    setShowUpdateModal(true)
  }

  const handleProceedNextRound = (id) => {
    alert(`Candidate ID ${id} moved to next round`)
  }

  const handleSaveUpdate = async () => {
    if (!selectedFeedback) {
      Swal.fire({
        title: "Error",
        text: "No feedback selected. Please try again.",
        icon: "error",
        confirmButtonColor: '#d33'
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Get data from originalData (from GET API response)
      // GET response structure: { id: 3, interview_id: 5, panelist_name: "...", feedback: "...", rating: 5, ... }
      // id = panel record ID (primary key)
      // interview_id = interview ID (foreign key)
      
      const panelId = selectedFeedback.originalData?.id || 
                     selectedFeedback.id || 
                     selectedFeedback.panel_id

      const interviewId = selectedFeedback.originalData?.interview_id || 
                         selectedFeedback.interview_id

      console.log('🔍 Debug - Data from GET response:', {
        'originalData': selectedFeedback.originalData,
        'panelId (originalData.id)': selectedFeedback.originalData?.id,
        'interviewId (originalData.interview_id)': selectedFeedback.originalData?.interview_id,
        'Final panelId': panelId,
        'Final interviewId': interviewId,
        'Full selectedFeedback': selectedFeedback
      })

      // Validate required fields
      if (!panelId || panelId === null || panelId === undefined) {
        Swal.fire({
          title: "Error",
          text: "Panel ID is missing. Please refresh and try again.",
          icon: "error",
          confirmButtonColor: '#d33'
        })
        setIsSubmitting(false)
        return
      }

      if (!interviewId || interviewId === null || interviewId === undefined) {
        Swal.fire({
          title: "Error",
          text: "Interview ID is missing. Please refresh and try again.",
          icon: "error",
          confirmButtonColor: '#d33'
        })
        setIsSubmitting(false)
        return
      }

      // Convert to numbers
      const panelIdNumber = typeof panelId === 'string' ? parseInt(panelId) : Number(panelId)
      const interviewIdNumber = typeof interviewId === 'string' ? parseInt(interviewId) : Number(interviewId)

      // Build payload using values from GET response (originalData)
      // panel_id = panel record ID (id from GET response)
      // interview_id = interview ID (interview_id from GET response)
      const payload = {
        panel_id: panelIdNumber,  // ✅ Panel record ID (id from GET response)
        interview_id: interviewIdNumber,  // ✅ Interview ID (interview_id from GET response)
        panelist_name: selectedFeedback.panelist || selectedFeedback.candidate || selectedFeedback.originalData?.panelist_name || '',
        feedback: selectedFeedback.remarks || selectedFeedback.originalData?.feedback || '',
        rating: parseInt(selectedFeedback.rating || selectedFeedback.originalData?.rating || 0)
      }

      console.log('📤 Update Panel Feedback Payload:', payload)
      console.log('📤 Selected Feedback:', selectedFeedback)
      console.log('📤 Original Data:', selectedFeedback.originalData)

      const response = await putMethod({
        apiUrl: apiService.updateInterviewPanel,
        payload: payload
      })

      console.log('📥 Update Panel Feedback Response:', response)

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      if (isSuccess) {
        Swal.fire({
          title: "Success!",
          text: "Feedback updated successfully",
          icon: "success",
          confirmButtonColor: '#5C9A24'
        }).then(() => {
          setShowUpdateModal(false)
          setSelectedFeedback(null)
          fetchPanelFeedbacks() // Refresh list
        })
      } else {
        const errorMessage = response?.message || response?.error || response?.error_message || "Failed to update feedback. Please try again."
        console.error('❌ Update failed:', {
          response,
          payload,
          selectedFeedback
        })
        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonColor: '#d33'
        })
      }
    } catch (error) {
      console.error('❌ Error updating feedback:', error)
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          "Something went wrong. Please try again."
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: '#d33'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating, interactive = false, onChange = null) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onChange && onChange(star)}
          className={`w-5 h-5 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          } ${interactive ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}
        >
          <LuStar className="w-full h-full fill-current" />
        </button>
      ))}
    </div>
  )

  return (
    <div className="p-2 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Section - Add Feedback Form */}
        <div className={`${TAILWIND_COLORS.CARD} p-5`}>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <LuMessageSquare className={`w-4 h-4 ${TAILWIND_COLORS.TEXT_MUTED}`} />
              </div>
              <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                Add Feedback
              </h3>
            </div>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
              Provide feedback for completed interviews
            </p>
          </div>

          <div className="space-y-4">
            {/* Select Candidate */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                Select Candidate
              </label>
              {loadingStudents ? (
                <div className={`w-full px-3 py-2 border ${TAILWIND_COLORS.BORDER} rounded-lg bg-gray-50 flex items-center gap-2`}>
                  <LuRefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                  <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading candidates...</span>
                </div>
              ) : (
                <>
                  <select
                    value={formData.interview_id ? String(formData.interview_id) : ''}
                    onChange={(e) => {
                      const selectedInterviewId = e.target.value
                      
                      // If user selects "Choose Candidate" (empty value), reset form
                      if (!selectedInterviewId || selectedInterviewId === '') {
                        setFormData(prev => ({
                          ...prev,
                          interview_id: '',
                          candidate_name: '',
                          rating: 0,
                          feedback: ''
                        }))
                        return
                      }
                      
                      console.log('🔍 Selected interview_id from dropdown:', selectedInterviewId)
                      console.log('🔍 Available students:', studentsList)
                      
                      // Find student by interview_id - handle both string and number comparison
                      const selectedStudent = studentsList.find(s => {
                        const studentId = String(s.interview_id || '')
                        const selectedId = String(selectedInterviewId || '')
                        return studentId === selectedId && studentId !== ''
                      })
                      
                      if (selectedStudent && selectedStudent.interview_id && selectedStudent.candidate_name) {
                        console.log('✅ Selected student found:', selectedStudent)
                        
                        // Use functional update to avoid stale state conflicts
                        setFormData(prev => {
                          // Only update if the selection actually changed
                          if (String(prev.interview_id) !== String(selectedStudent.interview_id)) {
                            return {
                              ...prev,
                              interview_id: selectedStudent.interview_id,
                              candidate_name: selectedStudent.candidate_name,
                              // Reset rating and feedback when changing candidate
                              rating: 0,
                              feedback: ''
                            }
                          }
                          return prev
                        })
                        
                        console.log('✅ Updated formData with candidate:', {
                          interview_id: selectedStudent.interview_id,
                          candidate_name: selectedStudent.candidate_name
                        })
                      } else {
                        console.warn('⚠️ No valid student found for interview_id:', selectedInterviewId)
                        // Reset to empty if invalid selection
                        setFormData(prev => ({
                          ...prev,
                          interview_id: '',
                          candidate_name: ''
                        }))
                      }
                    }}
                    className={`w-full px-3 py-2 border ${TAILWIND_COLORS.BORDER} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Choose Candidate</option>
                    {studentsList.length > 0 ? (
                      studentsList
                        .filter(student => student.interview_id && student.candidate_name) // Filter out invalid entries
                        .map((student) => {
                          // ✅ Get job title - check multiple conditions
                          const jobTitle = student.job_title && student.job_title.trim() !== '' 
                            ? student.job_title 
                            : '';
                          const displayText = jobTitle 
                            ? `${student.candidate_name} (${jobTitle})` 
                            : student.candidate_name;
                          
                          return (
                            <option key={student.interview_id} value={String(student.interview_id)}>
                              {displayText}
                            </option>
                          );
                        })
                    ) : (
                      <option value="" disabled>No candidates available</option>
                    )}
                  </select>
                  {studentsList.length === 0 && !loadingStudents && (
                    <p className={`text-xs mt-1 ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      No scheduled interviews found. Please schedule interviews first.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Rating */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                Rate Candidate (1-5 stars)
              </label>
              {renderStars(formData.rating, true, handleRatingChange)}
            </div>

            {/* Feedback */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                Feedback
              </label>
              <textarea
                placeholder="Enter detailed feedback..."
                value={formData.feedback}
                onChange={(e) => handleInputChange('feedback', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border ${TAILWIND_COLORS.BORDER} rounded-lg focus:ring-2 focus:ring-blue-500 resize-none`}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitFeedback}
              variant="primary"
              size="md"
              fullWidth
              icon={<LuCheck className="w-4 h-4" />}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </div>

        {/* Right Section - Feedback List */}
        <div className={`${TAILWIND_COLORS.CARD} p-5 flex flex-col`}>
          <div className="mb-6 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <LuUser className={`w-4 h-4 ${TAILWIND_COLORS.TEXT_MUTED}`} />
              </div>
              <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                Panel Feedback Summary
              </h3>
            </div>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
              Overview of submitted interview feedback
            </p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-96 pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className={TAILWIND_COLORS.TEXT_MUTED}>Loading feedbacks...</p>
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className={TAILWIND_COLORS.TEXT_MUTED}>No feedback available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbackList.map((feedback) => (
                <div key={feedback.id} className={`border ${TAILWIND_COLORS.BORDER} rounded-lg p-4 shadow-sm`}>
                  <div className="mb-3">
                    <h4 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                      {feedback.candidate}
                    </h4>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      {feedback.interviewDetails}
                    </p>
                  </div>

                  <div className="mb-3">{renderStars(feedback.rating)}</div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 bg-gray-100 text-xs ${TAILWIND_COLORS.TEXT_MUTED} rounded-full`}>
                      {feedback.panelist}
                    </span>
                    <span className={`px-2 py-1 bg-gray-100 text-xs ${TAILWIND_COLORS.TEXT_MUTED} rounded-full`}>
                      {feedback.role}
                    </span>
                  </div>

                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-3`}>
                    {feedback.remarks}
                  </p>

                  {/* ✅ Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleProceedNextRound(feedback.id)}
                      icon={<LuCheck className="w-4 h-4" />}
                    >
                      Proceed to Next Round
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateFeedback(feedback.id)}
                      icon={<LuRefreshCw className="w-4 h-4" />}
                    >
                      Update Feedback
                    </Button>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Update Feedback Modal */}
      {showUpdateModal && selectedFeedback && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Update Feedback</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className={`${TAILWIND_COLORS.TEXT_MUTED} hover:text-text-primary`}
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4">
              {/* Candidate - Read Only */}
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  Candidate
                </label>
                <input
                  type="text"
                  value={selectedFeedback.candidate || selectedFeedback.panelist || ''}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              {/* Rating */}
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  Rating
                </label>
                {renderStars(selectedFeedback.rating, true, (r) =>
                  setSelectedFeedback(prev => ({ ...prev, rating: r }))
                )}
              </div>

              {/* Remarks */}
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  Remarks
                </label>
                <textarea
                  rows={3}
                  value={selectedFeedback.remarks}
                  onChange={(e) =>
                    setSelectedFeedback(prev => ({ ...prev, remarks: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Decision */}
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  Decision
                </label>
                <input
                  type="text"
                  value={selectedFeedback.decision}
                  onChange={(e) =>
                    setSelectedFeedback(prev => ({ ...prev, decision: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
              <Button variant="secondary" onClick={() => setShowUpdateModal(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveUpdate} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Feedback"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PanelManagement
