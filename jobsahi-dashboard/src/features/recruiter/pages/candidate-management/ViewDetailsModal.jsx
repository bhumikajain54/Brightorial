import React, { useState, useEffect } from "react";
import {
  LuX,
  LuMail,
  LuPhone,
  LuMapPin,
  LuCalendar,
  LuFileText,
  LuExternalLink,
  LuDownload,
  LuClock,
  LuVideo,
  LuBuilding,
  LuLink,
  LuCheck,
} from "react-icons/lu";
import { TAILWIND_COLORS } from "../../../../shared/WebConstant";
import { Button, IconButton } from "../../../../shared/components/Button";
import Swal from "sweetalert2";
import { postMethod, getMethod, putMethod } from "../../../../service/api";
import apiService from "../../services/serviceUrl";

const ViewDetailsModal = ({ isOpen, onClose, candidate, onDownloadCV, onInterviewScheduled }) => {
  const [scheduleInterview, setScheduleInterview] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewMode, setInterviewMode] = useState("online");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewFeedback, setInterviewFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingInterview, setExistingInterview] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [jobTitle, setJobTitle] = useState("");

  // Fetch recruiter jobs to get job title
  useEffect(() => {
    const fetchRecruiterJobs = async () => {
      if (!candidate || !isOpen) return;
      
      try {
        const res = await getMethod({ apiUrl: apiService.getRecruiterJobs });
        console.log("📊 Recruiter Jobs API Response (Modal):", res);

        if (res?.status === true && Array.isArray(res?.data)) {
          const formattedJobs = res.data.map((job) => ({
            id: job.job_id || job.id,
            title: job.job_title || job.title || job.position || "Untitled Job",
            company: job.company_name || job.company || "—",
          }));
          setRecruiterJobs(formattedJobs);
          
          // Match candidate's job_id with recruiter jobs to get job title
          const candidateJobId = candidate.job_id?.toString() || candidate.jobId?.toString();
          if (candidateJobId) {
            const matchedJob = formattedJobs.find(
              (job) => job.id?.toString() === candidateJobId
            );
            if (matchedJob) {
              setJobTitle(matchedJob.title);
              console.log("✅ Matched job title:", matchedJob.title);
            } else {
              // Fallback to applied_for or job_title
              setJobTitle(candidate.applied_for || candidate.job_title || "—");
            }
          } else {
            // Fallback to applied_for or job_title
            setJobTitle(candidate.applied_for || candidate.job_title || "—");
          }
        } else {
          // Fallback to applied_for or job_title
          setJobTitle(candidate.applied_for || candidate.job_title || "—");
        }
      } catch (err) {
        console.error("❌ Error fetching recruiter jobs (Modal):", err);
        // Fallback to applied_for or job_title
        setJobTitle(candidate.applied_for || candidate.job_title || "—");
      }
    };

    if (isOpen && candidate) {
      fetchRecruiterJobs();
    } else {
      setJobTitle("");
    }
  }, [isOpen, candidate]);

  // Fetch existing interview when modal opens
  useEffect(() => {
    if (isOpen && candidate) {
      fetchExistingInterview();
    } else {
      setExistingInterview(null);
    }
  }, [isOpen, candidate]);

  // Fetch existing scheduled interview for this candidate
  const fetchExistingInterview = async () => {
    if (!candidate) return;

    setLoadingInterview(true);
    try {
      const applicationId = candidate.application_id || candidate.applicationId || candidate.id || null;
      const jobId = candidate.job_id || candidate.jobId || candidate.applied_job_id || null;
      const studentId = candidate.student_id || candidate.studentId || candidate.user_id || null;
      const candidateName = candidate.name || candidate.candidate_name || '';

      // Call GET API to fetch scheduled interviews
      const response = await getMethod({
        apiUrl: apiService.getScheduledInterviews
      });

      // Debug: Log response to check structure
      if (response) {
        // Temporary debug - remove after testing
      }

      if (response?.status === true || response?.status === 'success' || response?.success === true || response?.data) {
        let interviews = [];
        
        // Handle different response structures
        if (Array.isArray(response.data)) {
          interviews = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          interviews = response.data.data;
        } else if (response.interviews && Array.isArray(response.interviews)) {
          interviews = response.interviews;
        } else if (Array.isArray(response)) {
          interviews = response;
        }

        // ✅ STRICT Logic: Show interview ONLY if it matches the EXACT current application/job
        // If student applied for Job A (application_id: 9) and Job B (application_id: 10):
        // - Interview scheduled for Job A (application_id: 9) -> Only show when viewing Job A ✅
        // - When viewing Job B (application_id: 10) -> Don't show interview for Job A ❌
        
        console.log('🔍 Fetching interview for candidate:', {
          applicationId,
          jobId,
          studentId,
          candidateName: candidate.name || candidate.candidate_name
        });
        
        let foundInterview = null;
        
        // ✅ Step 1: STRICT match by application_id (most specific - this is the PRIMARY key)
        // Only match if BOTH application_id exist and match exactly
        if (applicationId) {
          foundInterview = interviews.find((interview) => {
            const interviewAppId = interview.application_id || interview.applicationId;
            const matches = interviewAppId && (interviewAppId == applicationId || String(interviewAppId) === String(applicationId));
            
            if (matches) {
              console.log('✅ Found interview by application_id:', {
                candidateAppId: applicationId,
                interviewAppId: interviewAppId,
                interviewJobId: interview.job_id || interview.jobId
              });
            }
            
            return matches;
          });
        }
        
        // ✅ Step 2: If no match by application_id AND candidate has no application_id, 
        // then try by job_id BUT ensure it matches the candidate's current job_id exactly
        if (!foundInterview && jobId) {
          // Get candidate's current job_id to ensure exact match
          const candidateJobId = candidate.job_id || candidate.jobId || candidate.applied_job_id;
          
          if (candidateJobId) {
            foundInterview = interviews.find((interview) => {
              const interviewJobId = interview.job_id || interview.jobId;
              // ✅ STRICT: Both job_ids must exist and match exactly
              const matches = interviewJobId && candidateJobId && 
                            (interviewJobId == candidateJobId || String(interviewJobId) === String(candidateJobId));
              
              // ✅ Additional check: If interview has application_id, don't match by job_id alone
              // (because application_id is more specific)
              const interviewHasAppId = interview.application_id || interview.applicationId;
              if (matches && interviewHasAppId) {
                console.log('⚠️ Interview has application_id, skipping job_id match to avoid cross-job display');
                return false;
              }
              
              if (matches) {
                console.log('✅ Found interview by job_id:', {
                  candidateJobId: candidateJobId,
                  interviewJobId: interviewJobId
                });
              }
              
              return matches;
            });
          }
        }
        
        // ✅ Step 3: STRICT verification - Double check the match before showing
        if (foundInterview) {
          const interviewAppId = foundInterview.application_id || foundInterview.applicationId;
          const interviewJobId = foundInterview.job_id || foundInterview.jobId;
          const candidateJobId = candidate.job_id || candidate.jobId || candidate.applied_job_id;
          
          // ✅ STRICT matching: Must match by application_id OR (job_id AND no application_id mismatch)
          let shouldShow = false;
          
          if (applicationId && interviewAppId) {
            // ✅ Primary match: application_id must match exactly
            shouldShow = (interviewAppId == applicationId || String(interviewAppId) === String(applicationId));
            console.log('🔍 Verifying by application_id:', {
              candidateAppId: applicationId,
              interviewAppId: interviewAppId,
              shouldShow
            });
          } else if (candidateJobId && interviewJobId && !applicationId) {
            // ✅ Fallback match: job_id must match exactly AND candidate has no application_id
            shouldShow = (interviewJobId == candidateJobId || String(interviewJobId) === String(candidateJobId));
            console.log('🔍 Verifying by job_id:', {
              candidateJobId: candidateJobId,
              interviewJobId: interviewJobId,
              shouldShow
            });
          }
          
          // Only show if strict match passes
          if (shouldShow) {
            // Normalize interview data
            // ✅ CRITICAL: Map feedback to interview_info (API sends 'feedback', DB stores as 'interview_info')
            const mappedInterviewInfo = foundInterview.interview_info || 
                                       foundInterview.interviewInfo || 
                                       foundInterview.feedback || 
                                       foundInterview.notes || 
                                       foundInterview.description || 
                                       '';
            
            const normalizedInterview = {
              ...foundInterview,
              // ✅ CRITICAL: Preserve interview_id for update functionality
              interview_id: foundInterview.interview_id || foundInterview.id || foundInterview.interviewId,
              id: foundInterview.id || foundInterview.interview_id || foundInterview.interviewId,
              scheduled_at: foundInterview.scheduled_at || foundInterview.scheduledAt || foundInterview.scheduled_date || foundInterview.date,
              scheduledAt: foundInterview.scheduled_at || foundInterview.scheduledAt || foundInterview.scheduled_date || foundInterview.date,
              scheduled_date: foundInterview.scheduled_at || foundInterview.scheduledAt || foundInterview.scheduled_date || foundInterview.date,
              mode: foundInterview.mode || foundInterview.interviewMode || foundInterview.interview_mode,
              interview_link: foundInterview.interview_link || foundInterview.interviewLink || foundInterview.meeting_link || foundInterview.meetingLink || foundInterview.link,
              location: foundInterview.location || foundInterview.interview_location || foundInterview.address,
              platform_name: foundInterview.platform_name || foundInterview.platformName || foundInterview.platform,
              status: foundInterview.status || foundInterview.interview_status,
              // ✅ CRITICAL: Map feedback to interview_info for consistent display
              interview_info: mappedInterviewInfo,
              feedback: mappedInterviewInfo, // Also keep feedback for API compatibility
              application_id: interviewAppId
            };
            
            console.log('✅ Normalized Interview Data:', {
              interview_id: normalizedInterview.interview_id,
              id: normalizedInterview.id,
              application_id: normalizedInterview.application_id,
              scheduled_at: normalizedInterview.scheduled_at
            });
            
            setExistingInterview(normalizedInterview);
            
            // Pre-fill form with existing interview data
            if (normalizedInterview.scheduled_at) {
              try {
                const scheduledDate = new Date(normalizedInterview.scheduled_at);
                if (!isNaN(scheduledDate.getTime())) {
                  setInterviewDate(scheduledDate.toISOString().split('T')[0]);
                  const hours = String(scheduledDate.getHours()).padStart(2, '0');
                  const minutes = String(scheduledDate.getMinutes()).padStart(2, '0');
                  setInterviewTime(`${hours}:${minutes}`);
                }
              } catch (e) {
                // Date parsing error
              }
            }
            if (normalizedInterview.mode) {
              setInterviewMode(normalizedInterview.mode.toLowerCase());
            }
            if (normalizedInterview.interview_link) {
              setInterviewLocation(normalizedInterview.interview_link);
            } else if (normalizedInterview.location) {
              setInterviewLocation(normalizedInterview.location);
            }
            if (normalizedInterview.interview_info) {
              setInterviewFeedback(normalizedInterview.interview_info || '');
            }
          } else {
            // ❌ Interview found but doesn't match this application/job - don't show it
            console.log('❌ Interview found but does NOT match current application/job:', {
              candidateAppId: applicationId,
              candidateJobId: candidate.job_id || candidate.jobId || candidate.applied_job_id,
              interviewAppId: foundInterview.application_id || foundInterview.applicationId,
              interviewJobId: foundInterview.job_id || foundInterview.jobId
            });
            setExistingInterview(null);
          }
        } else {
          // ❌ No interview found for this application/job
          console.log('❌ No interview found for this application/job:', {
            applicationId,
            jobId: candidate.job_id || candidate.jobId || candidate.applied_job_id,
            totalInterviews: interviews.length
          });
          setExistingInterview(null);
        }
      } else {
        setExistingInterview(null);
      }
    } catch (error) {
      // Error fetching interview - continue without showing existing interview
      setExistingInterview(null);
    } finally {
      setLoadingInterview(false);
    }
  };

  if (!isOpen || !candidate) return null;

  const handleDownloadCV = () => {
    if (onDownloadCV) {
      onDownloadCV(candidate);
    } else {
      // Fallback download logic
      const candidateData = `
        Candidate Information
        ====================
        Name: ${candidate.name}
        Email: ${candidate.email}
        Phone: ${candidate.phone_number || "Not provided"}
        Location: ${candidate.location || "Not provided"}
        Qualification: ${candidate.qualification}
        Experience: ${candidate.experience || "Not provided"}
        Skills: ${candidate.skills}
        Applied For: ${candidate.appliedFor}
        Applied Date: ${candidate.applied_date || "Not provided"}
        Status: ${candidate.status}
      `.trim();

      const blob = new Blob([candidateData], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${candidate.name.replace(/\s+/g, "_")}_CV.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const handleScheduleInterview = async () => {
    // Validation
    if (!interviewDate || !interviewTime) {
      Swal.fire({
        title: "Validation Error",
        text: "Please select both date and time for the interview",
        icon: "error",
      });
      return;
    }

    if (!interviewLocation) {
      Swal.fire({
        title: "Validation Error",
        text: interviewMode === "online" 
          ? "Please provide the meeting link/URL" 
          : "Please provide the interview location/address",
        icon: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine date and time into scheduled_at format (YYYY-MM-DD HH:MM:SS)
      const scheduledAt = `${interviewDate} ${interviewTime}:00`;

      // ✅ Get application_id from candidate (required field in interviews table)
      // This is CRITICAL - each application has a unique application_id
      // If student applied to Job A (app_id: 9) and Job B (app_id: 10),
      // interview for Job A should use app_id: 9, not app_id: 10
      const applicationId = candidate.application_id || 
                           candidate.applicationId || 
                           null;
      
      const jobId = candidate.job_id || 
                   candidate.jobId || 
                   candidate.applied_job_id ||
                   candidate.job?.job_id ||
                   candidate.job?.id ||
                   null;
      
      const studentId = candidate.student_id || 
                       candidate.studentId || 
                       candidate.user_id || 
                       candidate.id ||
                       null;

      console.log('📅 Scheduling interview with:', {
        applicationId,
        jobId,
        studentId,
        candidateName: candidate.name || candidate.candidate_name,
        appliedFor: candidate.applied_for || candidate.job_title
      });

      // Check if we have required IDs
      if (!applicationId && (!jobId || !studentId)) {
        Swal.fire({
          title: "Error",
          text: `Application ID or (Job ID and Student ID) is missing. Please check the candidate data.`,
          icon: "error",
        });
        setIsSubmitting(false);
        return;
      }

      // ✅ Check if we're updating an existing interview or creating a new one
      // Try multiple possible field names for interview_id
      const interviewId = existingInterview?.interview_id || 
                          existingInterview?.id || 
                          existingInterview?.interviewId ||
                          null;
      
      const isUpdate = existingInterview && interviewId;

      console.log('🔄 Interview Action Check:', {
        isUpdate,
        interviewId,
        existingInterviewExists: !!existingInterview,
        existingInterviewKeys: existingInterview ? Object.keys(existingInterview) : [],
        interview_id: existingInterview?.interview_id,
        id: existingInterview?.id
      });

      let response;
      
      if (isUpdate && interviewId) {
        // ✅ UPDATE EXISTING INTERVIEW
        // Prepare update payload - Backend expects "interview_info" (DB field name)
        const updatePayload = {
          interview_id: Number(interviewId), // Ensure it's a number
          scheduled_at: scheduledAt,
          mode: interviewMode === "online" ? "online" : "offline", // lowercase as per DB enum
          status: existingInterview.status || "scheduled", // Keep existing status or default to "scheduled"
          // ✅ CRITICAL: Backend expects "interview_info" (DB field name), not "feedback"
          interview_info: interviewFeedback || existingInterview.interview_info || existingInterview.feedback || "Initial screening interview.",
          // Conditional fields based on mode
          ...(interviewMode === "online" ? {
            interview_link: interviewLocation // For online interviews
            // Don't send location for online interviews
          } : {
            location: interviewLocation // For offline interviews
            // Don't send interview_link for offline interviews
          })
        };

        console.log('📤 Update Interview Payload:', updatePayload);
        console.log('📤 Update Interview - interview_info being sent:', updatePayload.interview_info);
        console.log('📤 Update Interview - Full existingInterview:', existingInterview);

        try {
          // 📅 API Call: PUT /applications/update_interview.php
          response = await putMethod({
            apiUrl: apiService.updateInterview, // "/applications/update_interview.php"
            payload: updatePayload
          });

          console.log('📥 Update Interview API Response:', response);
        } catch (error) {
          console.error('❌ Update Interview API Error:', error);
          Swal.fire({
            title: "❌ Error",
            text: error?.message || "Failed to update interview. Please check console for details.",
            icon: "error",
          });
          setIsSubmitting(false);
          return;
        }
      } else if (existingInterview && !interviewId) {
        // ❌ Interview exists but interview_id is missing
        console.error('❌ Cannot update: Interview exists but interview_id is missing:', existingInterview);
        Swal.fire({
          title: "❌ Error",
          text: "Interview ID is missing. Please refresh the page and try again.",
          icon: "error",
        });
        setIsSubmitting(false);
        return;
      } else {
        // ✅ CREATE NEW INTERVIEW
        // Prepare payload according to database structure
        // Database fields: application_id, scheduled_at, mode, interview_link, location, status, interview_info, platform_name
        const createPayload = {
          // Primary: application_id (foreign key to applications table)
          ...(applicationId && { application_id: applicationId }),
          // Fallback: if application_id not available, send job_id and student_id
          ...(!applicationId && jobId && { job_id: jobId }),
          ...(!applicationId && studentId && { student_id: studentId }),
          // Required fields
          scheduled_at: scheduledAt,
          mode: interviewMode === "online" ? "online" : "offline", // lowercase as per DB enum
          status: "scheduled", // as per DB enum
          // Conditional fields based on mode
          ...(interviewMode === "online" ? {
            interview_link: interviewLocation, // For online interviews
            platform_name: interviewLocation.includes('zoom') ? 'Zoom' : 
                          interviewLocation.includes('meet') ? 'Google Meet' : 
                          interviewLocation.includes('teams') ? 'Microsoft Teams' : 
                          'Other'
          } : {
            location: interviewLocation // For offline interviews
          }),
          // Additional info/notes
          interview_info: interviewFeedback || "Initial screening interview." // DB field name is interview_info, not feedback
        };

        console.log('📤 Create Interview Payload:', createPayload);

        // 📅 API Call: POST /applications/schedule_interview.php
        // This API schedules an interview for a candidate
        response = await postMethod({
          apiUrl: apiService.scheduleInterview, // "/applications/schedule_interview.php"
          payload: createPayload
        });

        console.log('📥 Create Interview API Response:', response);
      }

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true;

      if (isSuccess) {
        // ✅ Immediately update interview data from response if available
        if (response?.data || response?.interview) {
          const interviewData = response.data || response.interview;
          
          // ✅ CRITICAL: Map feedback to interview_info (DB field name)
          // API sends 'feedback' but DB stores as 'interview_info'
          const mappedInterviewInfo = interviewData.interview_info || 
                                     interviewData.feedback || 
                                     interviewFeedback || 
                                     existingInterview?.interview_info || 
                                     "Initial screening interview.";
          
          const normalizedInterview = {
            ...interviewData,
            // ✅ Use the NEW scheduled_at from form (not old one)
            scheduled_at: scheduledAt, // Always use the new value from form
            scheduledAt: scheduledAt, // Also set camelCase version
            scheduled_date: scheduledAt, // Also set alternative field name
            mode: interviewMode === "online" ? "online" : "offline", // Use new mode from form
            interview_link: interviewMode === "online" ? interviewLocation : (interviewData.interview_link || null),
            location: interviewMode === "offline" ? interviewLocation : (interviewData.location || null),
            status: interviewData.status || existingInterview?.status || "scheduled",
            // ✅ CRITICAL: Map feedback to interview_info for display
            interview_info: mappedInterviewInfo,
            feedback: mappedInterviewInfo, // Also keep feedback for API compatibility
            platform_name: interviewMode === "online" ? (interviewLocation.includes('zoom') ? 'Zoom' : interviewLocation.includes('meet') ? 'Google Meet' : interviewLocation.includes('teams') ? 'Microsoft Teams' : 'Other') : (interviewData.platform_name || null),
            // ✅ Ensure application_id and interview_id are preserved
            application_id: interviewData.application_id || applicationId || existingInterview?.application_id,
            interview_id: interviewData.interview_id || interviewData.id || interviewData.interviewId || interviewId,
            id: interviewData.id || interviewData.interview_id || interviewData.interviewId || interviewId
          };
          
          console.log(`✅ Interview ${isUpdate ? 'updated' : 'scheduled'} successfully:`, {
            interview_id: normalizedInterview.interview_id,
            application_id: normalizedInterview.application_id,
            job_id: normalizedInterview.job_id || jobId,
            scheduled_at: normalizedInterview.scheduled_at,
            interview_info: normalizedInterview.interview_info,
            mode: normalizedInterview.mode
          });
          
          setExistingInterview(normalizedInterview);
        } else if (isUpdate) {
          // ✅ If update response doesn't have data, update existing interview with new values from form
          const updatedInterview = {
            ...existingInterview,
            // ✅ CRITICAL: Use NEW values from form, not old ones
            scheduled_at: scheduledAt, // NEW scheduled time
            scheduledAt: scheduledAt, // Also set camelCase version
            scheduled_date: scheduledAt, // Also set alternative field name
            mode: interviewMode === "online" ? "online" : "offline", // NEW mode
            interview_link: interviewMode === "online" ? interviewLocation : (existingInterview.interview_link || null),
            location: interviewMode === "offline" ? interviewLocation : (existingInterview.location || null),
            // ✅ CRITICAL: Map feedback to interview_info
            interview_info: interviewFeedback || existingInterview.interview_info || "Initial screening interview.",
            feedback: interviewFeedback || existingInterview.feedback || existingInterview.interview_info || "Initial screening interview.",
            platform_name: interviewMode === "online" ? (interviewLocation.includes('zoom') ? 'Zoom' : interviewLocation.includes('meet') ? 'Google Meet' : interviewLocation.includes('teams') ? 'Microsoft Teams' : 'Other') : (existingInterview.platform_name || null)
          };
          
          console.log('✅ Updated existingInterview state with new values:', {
            scheduled_at: updatedInterview.scheduled_at,
            interview_info: updatedInterview.interview_info,
            mode: updatedInterview.mode
          });
          
          setExistingInterview(updatedInterview);
        }
        
        // ✅ For updates, don't re-fetch immediately (use updated state instead)
        // For creates, we can optionally fetch to get the full interview object
        if (!isUpdate) {
          // Only fetch for new interviews to get complete data
          fetchExistingInterview();
        }
        
        // ✅ Immediately refresh applicants list (get recent applications API)
        if (onInterviewScheduled && typeof onInterviewScheduled === 'function') {
          onInterviewScheduled();
        }
        
        // Reset form immediately (this will close the form and show updated interview)
        setScheduleInterview(false);
        setInterviewDate("");
        setInterviewTime("");
        setInterviewMode("online");
        setInterviewLocation("");
        setInterviewFeedback("");
        
        // Show success message
        Swal.fire({
          title: isUpdate ? "✅ Interview Updated!" : "✅ Interview Scheduled!",
          text: isUpdate 
            ? `Interview updated successfully for ${interviewDate} at ${interviewTime} (${interviewMode})`
            : `Interview scheduled for ${interviewDate} at ${interviewTime} (${interviewMode})`,
          icon: "success",
          confirmButtonText: "OK",
          timer: 2000,
          showConfirmButton: true
        });
      } else {
        Swal.fire({
          title: "❌ Error",
          text: response?.message || (isUpdate 
            ? "Failed to update interview. Please try again." 
            : "Failed to schedule interview. Please try again."),
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error?.message || "Something went wrong. Please try again.",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Handle skills safely
  const skills = Array.isArray(candidate.skills)
    ? candidate.skills
    : typeof candidate.skills === "string"
    ? candidate.skills.split(", ")
    : [];

  // ✅ Handle experience JSON safely
  let experienceList = [];
  try {
    experienceList = JSON.parse(candidate.experience);
    if (!Array.isArray(experienceList)) experienceList = [];
  } catch {
    experienceList = [];
  }

  // ✅ Handle education JSON safely
  let educationList = [];
  try {
    if (typeof candidate.education === 'string' && candidate.education.trim() !== '') {
      educationList = JSON.parse(candidate.education);
    } else if (Array.isArray(candidate.education)) {
      educationList = candidate.education;
    }
    if (!Array.isArray(educationList)) educationList = [];
  } catch (error) {
    educationList = [];
  }

  // ✅ Handle social_links safely
  let socialLinks = [];
  try {
    if (Array.isArray(candidate.social_links)) {
      socialLinks = candidate.social_links;
    } else if (typeof candidate.social_links === 'string' && candidate.social_links.trim() !== '') {
      const parsed = JSON.parse(candidate.social_links);
      socialLinks = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
    }
  } catch (error) {
    socialLinks = [];
  }

  const handleViewResume = (e) => {
    e.preventDefault();
    if (candidate.resume_url) {
      // Trigger download instead of opening in new tab
      const link = document.createElement('a');
      link.href = candidate.resume_url;
      link.download = `${candidate.name?.replace(/\s+/g, "_") || "resume"}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback to download CV function
      handleDownloadCV();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] my-4 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-start space-x-3 sm:space-x-4 w-full sm:w-auto">
            {/* Avatar */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className={`text-lg sm:text-xl font-semibold ${TAILWIND_COLORS.TEXT_MUTED}`}>
                {candidate.name
                  ? candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "NA"}
              </span>
            </div>

            {/* Name and Applied For */}
            <div className="flex-1 min-w-0">
              <h2
                className={`text-xl sm:text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2 truncate`}
              >
                {candidate.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                  Applied for
                </span>
                <span className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {jobTitle || candidate.applied_for || candidate.job_title || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
            {candidate.resume_url && (
              <button
                onClick={handleViewResume}
                className="flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                <LuFileText className="w-4 h-4" />
                <span>View Resume</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className={`text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_MUTED} hidden sm:inline`}>
                STATUS
              </span>
              <Button variant="primary" size="sm" className="text-xs sm:text-sm font-medium">
                {candidate.status || "Applied"}
              </Button>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <LuX size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Bio / Description */}
          <div className="mb-6">
            <h3
              className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}
            >
              About Candidate
            </h3>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} leading-relaxed`}>
                {candidate.bio || "No bio available for this candidate."}
              </p>
            </div>
          </div>

          {/* Cover Letter */}
          {candidate.cover_letter && candidate.cover_letter !== "—" && (
            <div className="mb-6">
              <h3
                className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}
              >
                Cover Letter
              </h3>
              <div className="bg-gray-100 rounded-lg p-4">
                <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} leading-relaxed`}>
                  {candidate.cover_letter}
                </p>
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6">
            {/* Personal Details */}
            <div>
              <h3
                className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
              >
                Personal Details
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 py-2 border-b border-gray-200">
                  <span
                    className={`text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                  >
                    FULL NAME
                  </span>
                  <span className={`text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} break-words`}>
                    {candidate.name}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 py-2 border-b border-gray-200">
                  <span
                    className={`text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                  >
                    EMAIL
                  </span>
                  <div className="flex items-center space-x-2">
                    <LuMail className={`w-3 h-3 sm:w-4 sm:h-4 ${TAILWIND_COLORS.TEXT_MUTED}`} />
                    <span
                      className={`text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} break-all`}
                    >
                      {candidate.email}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 py-2 border-b border-gray-200">
                  <span
                    className={`text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                  >
                    PHONE
                  </span>
                  <div className="flex items-center space-x-2">
                    <LuPhone className={`w-3 h-3 sm:w-4 sm:h-4 ${TAILWIND_COLORS.TEXT_MUTED}`} />
                    <span
                      className={`text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                    >
                      {candidate.phone_number || "—"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 py-2 border-b border-gray-200">
                  <span
                    className={`text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                  >
                    LOCATION
                  </span>
                  <div className="flex items-center space-x-2">
                    <LuMapPin className={`w-3 h-3 sm:w-4 sm:h-4 ${TAILWIND_COLORS.TEXT_MUTED}`} />
                    <span
                      className={`text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} break-words`}
                    >
                      {candidate.location || "—"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 py-2 border-b border-gray-200">
                  <span
                    className={`text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                  >
                    APPLIED DATE
                  </span>
                  <div className="flex items-center space-x-2">
                    <LuCalendar className={`w-3 h-3 sm:w-4 sm:h-4 ${TAILWIND_COLORS.TEXT_MUTED}`} />
                    <span
                      className={`text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                    >
                      {candidate.applied_date || "—"}
                    </span>
                  </div>
                </div>

                {/* Applied For / Job Title */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 py-2">
                  <span
                    className={`text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                  >
                    APPLIED FOR
                  </span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs sm:text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} font-medium`}
                    >
                      {jobTitle || candidate.applied_for || candidate.job_title || "—"}
                    </span>
                  </div>
                </div>

                {/* Portfolio Link */}
                {candidate.portfolio_link && (
                  <div className="flex justify-between items-center py-2">
                    <span
                      className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                    >
                      PORTFOLIO
                    </span>
                    <a
                      href={candidate.portfolio_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <LuExternalLink className="w-4 h-4" />
                      <span>View</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Education Info */}
            <div>
              <h3
                className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
              >
                Education Information
              </h3>
              <div className="space-y-4">
                {educationList.length > 0 ? (
                  educationList.map((edu, index) => {
                    const qualification = edu.qualification || edu.degree || '';
                    const institute = edu.institute || edu.college || edu.school || '';
                    const startYear = edu.start_year || edu.startYear || '';
                    const endYear = edu.end_year || edu.endYear || '';
                    const isPursuing = edu.is_pursuing || edu.isPursuing || false;
                    
                    // Build qualification text
                    let qualificationText = qualification;
                    if (institute) {
                      qualificationText += qualification ? ` from ${institute}` : institute;
                    }
                    
                    // Build year range text
                    let yearText = '';
                    if (startYear && endYear) {
                      yearText = `${startYear} - ${endYear}`;
                    } else if (startYear) {
                      yearText = isPursuing ? `Started ${startYear} (Pursuing)` : `Started ${startYear}`;
                    } else if (endYear) {
                      yearText = `Completed ${endYear}`;
                    } else if (isPursuing) {
                      yearText = 'Currently Pursuing';
                    }
                    
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                          <span className={`text-xs font-semibold ${TAILWIND_COLORS.TEXT_MUTED}`}>
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                          >
                            {qualificationText || "Not specified"}
                          </h4>
                          {yearText && (
                            <p
                              className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}
                            >
                              {yearText}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mt-1">
                      <span className={`text-xs font-semibold ${TAILWIND_COLORS.TEXT_MUTED}`}>1</span>
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                      >
                        {candidate.qualification || "No education details available"}
                      </h4>
                      <p
                        className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}
                      >
                        Verified Candidate:{" "}
                        {candidate.verified === "Yes" || candidate.verified === true ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-6">
            <h3
              className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
            >
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <span
                    key={index}
                    className={`bg-gray-200 ${TAILWIND_COLORS.TEXT_PRIMARY} px-3 py-1 rounded-full text-sm font-medium`}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span
                  className={`bg-gray-200 ${TAILWIND_COLORS.TEXT_PRIMARY} px-3 py-1 rounded-full text-sm font-medium`}
                >
                  No skills added
                </span>
              )}
            </div>
          </div>

          {/* Social Links Section */}
          {socialLinks && socialLinks.length > 0 && (
            <div className="mb-6">
              <h3
                className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
              >
                Social Links
              </h3>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.profile_url || link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1 px-3 py-1.5 bg-blue-50 rounded-md transition-colors border border-blue-200"
                  >
                    <LuLink className="w-4 h-4" />
                    <span>{link.title || 'Link'}</span>
                    <LuExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section */}
          <div className="mb-6">
            <h3
              className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
            >
              Work Experience
            </h3>
            {experienceList.length > 0 ? (
              <div className="space-y-4">
                {experienceList.map((exp, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <h4 className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {exp.role} @ {exp.company}
                    </h4>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                      {exp.duration}
                    </p>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-2 leading-relaxed`}>
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm`}>
                No experience details available.
              </p>
            )}
          </div>

          {/* Schedule Interview Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
              Interview Schedule
            </h3>
            
            {/* Show Existing Interview if Available */}
            {loadingInterview ? (
              <div className="mb-4 text-center text-sm text-gray-500">
                Checking for existing interview...
              </div>
            ) : existingInterview ? (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <LuCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">
                      Interview Already Scheduled
                    </h4>
                    <div className="space-y-3 text-sm">
                      {/* Date & Time - Always Show */}
                      {(existingInterview.scheduled_at || existingInterview.scheduledAt || existingInterview.scheduled_date) && (
                        <div className="flex items-start gap-2">
                          <LuCalendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                          <div className="flex-1">
                            <strong className="text-green-800 block mb-1">Scheduled Date & Time:</strong>
                            <span className="text-green-700 font-medium">
                              {(() => {
                                // ✅ Get the most recent scheduled_at value (prioritize scheduled_at)
                                const dateStr = existingInterview.scheduled_at || 
                                               existingInterview.scheduledAt || 
                                               existingInterview.scheduled_date;
                                
                                console.log('📅 Displaying interview date:', {
                                  scheduled_at: existingInterview.scheduled_at,
                                  scheduledAt: existingInterview.scheduledAt,
                                  scheduled_date: existingInterview.scheduled_date,
                                  dateStr: dateStr
                                });
                                
                                if (!dateStr) return 'Not scheduled';
                                
                                try {
                                  // ✅ Parse date string (format: "YYYY-MM-DD HH:MM:SS")
                                  // Handle both "2025-12-02 05:30:00" and ISO formats
                                  let date;
                                  if (dateStr.includes('T')) {
                                    // ISO format
                                    date = new Date(dateStr);
                                  } else {
                                    // MySQL datetime format: "YYYY-MM-DD HH:MM:SS"
                                    // Parse as local time to avoid timezone conversion
                                    const [datePart, timePart] = dateStr.split(' ');
                                    const [year, month, day] = datePart.split('-');
                                    const [hours, minutes, seconds] = timePart ? timePart.split(':') : ['00', '00', '00'];
                                    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds || 0));
                                  }
                                  
                                  if (!isNaN(date.getTime())) {
                                    const formattedDate = date.toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    });
                                    const formattedTime = date.toLocaleTimeString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    });
                                    return `${formattedDate} at ${formattedTime}`;
                                  }
                                  return dateStr;
                                } catch (error) {
                                  console.error('❌ Error parsing date:', error, dateStr);
                                  return dateStr;
                                }
                              })()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Mode - Always Show */}
                      {(existingInterview.mode || existingInterview.interviewMode || existingInterview.interview_mode) && (
                        <div className="flex items-start gap-2">
                          {(existingInterview.mode || existingInterview.interviewMode || existingInterview.interview_mode)?.toLowerCase() === 'online' ? (
                            <LuVideo className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                          ) : (
                            <LuBuilding className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                          )}
                          <div className="flex-1">
                            <strong className="text-green-800 block mb-1">Interview Mode:</strong>
                            <span className="text-green-700 capitalize font-medium">
                              {(() => {
                                const mode = existingInterview.mode || existingInterview.interviewMode || existingInterview.interview_mode || '';
                                return mode.charAt(0).toUpperCase() + mode.slice(1);
                              })()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* For Online Interviews - Show Meeting Link and Platform */}
                      {(existingInterview.mode || existingInterview.interviewMode || existingInterview.interview_mode)?.toLowerCase() === 'online' && (
                        <>
                          {(existingInterview.interview_link || existingInterview.interviewLink || existingInterview.meeting_link || existingInterview.meetingLink || existingInterview.link) && (
                            <div className="flex items-start gap-2">
                              <LuLink className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <div className="flex-1">
                                <strong className="text-green-800 block mb-1">Meeting Link:</strong>
                                <a 
                                  href={existingInterview.interview_link || existingInterview.interviewLink || existingInterview.meeting_link || existingInterview.meetingLink || existingInterview.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline break-all font-medium"
                                >
                                  {existingInterview.interview_link || existingInterview.interviewLink || existingInterview.meeting_link || existingInterview.meetingLink || existingInterview.link}
                                </a>
                              </div>
                            </div>
                          )}
                          {(existingInterview.platform_name || existingInterview.platformName || existingInterview.platform) && (
                            <div className="flex items-start gap-2">
                              <LuVideo className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <div className="flex-1">
                                <strong className="text-green-800 block mb-1">Platform:</strong>
                                <span className="text-green-700 font-medium">
                                  {existingInterview.platform_name || existingInterview.platformName || existingInterview.platform}
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* For Offline Interviews - Show Location */}
                      {(existingInterview.mode || existingInterview.interviewMode || existingInterview.interview_mode)?.toLowerCase() === 'offline' && (existingInterview.location || existingInterview.interview_location || existingInterview.address) && (
                        <div className="flex items-start gap-2">
                          <LuMapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                          <div className="flex-1">
                            <strong className="text-green-800 block mb-1">Interview Location:</strong>
                            <span className="text-green-700 font-medium">
                              {existingInterview.location || existingInterview.interview_location || existingInterview.address}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Status - Always Show */}
                      {existingInterview.status && (
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <strong className="text-green-800 block mb-1">Status:</strong>
                            <span className="capitalize font-medium text-green-700 px-2 py-1 bg-green-100 rounded inline-block">
                              {existingInterview.status}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Notes/Feedback - Always Show if Available */}
                      {(existingInterview.interview_info || existingInterview.interviewInfo || existingInterview.feedback || existingInterview.notes) && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div>
                            <strong className="text-green-800 block mb-1">Additional Notes:</strong>
                            <p className="text-green-700 whitespace-pre-wrap">
                              {existingInterview.interview_info || existingInterview.interviewInfo || existingInterview.feedback || existingInterview.notes || ''}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Schedule Interview Button */}
            {!scheduleInterview && (
              <div className="mb-4">
                <Button
                  onClick={() => {
                    setScheduleInterview(true);
                    // Reset form if no existing interview
                    if (!existingInterview) {
                      setInterviewDate("");
                      setInterviewTime("");
                      setInterviewMode("online");
                      setInterviewLocation("");
                      setInterviewFeedback("");
                    }
                  }}
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  icon={<LuCalendar size={18} />}
                >
                  {existingInterview ? "Update Interview Schedule" : "Schedule Interview"}
                </Button>
              </div>
            )}

            {scheduleInterview && (
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                {/* Date Field */}
                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
                  >
                    Interview Date
                  </label>
                  <div className="relative">
                    <LuCalendar
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED}`}
                      size={20}
                    />
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Time Slot Field */}
                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
                  >
                    Time Slot
                  </label>
                  <div className="relative">
                    <LuClock
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED}`}
                      size={20}
                    />
                    <input
                      type="time"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Mode Selection */}
                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
                  >
                    Interview Mode
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="interviewMode"
                        value="online"
                        checked={interviewMode === "online"}
                        onChange={(e) => {
                          setInterviewMode(e.target.value);
                          setInterviewLocation(""); // Clear location when mode changes
                        }}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <LuVideo className={`w-4 h-4 ${TAILWIND_COLORS.TEXT_MUTED}`} />
                        <span className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          Online
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="interviewMode"
                        value="offline"
                        checked={interviewMode === "offline"}
                        onChange={(e) => {
                          setInterviewMode(e.target.value);
                          setInterviewLocation(""); // Clear location when mode changes
                        }}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <LuBuilding className={`w-4 h-4 ${TAILWIND_COLORS.TEXT_MUTED}`} />
                        <span className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          Offline
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Location Field */}
                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
                  >
                    {interviewMode === "online" ? "Meeting Link/URL" : "Interview Location/Address"}
                  </label>
                  <div className="relative">
                    {interviewMode === "online" ? (
                      <LuLink
                        className={`absolute left-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED}`}
                        size={20}
                      />
                    ) : (
                      <LuMapPin
                        className={`absolute left-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED}`}
                        size={20}
                      />
                    )}
                    <input
                      type="text"
                      value={interviewLocation}
                      onChange={(e) => setInterviewLocation(e.target.value)}
                      placeholder={interviewMode === "online" ? "https://meet.example.com/xyz" : "Enter interview address"}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Feedback Field */}
                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
                  >
                    Feedback/Notes (Optional)
                  </label>
                  <textarea
                    value={interviewFeedback}
                    onChange={(e) => setInterviewFeedback(e.target.value)}
                    placeholder="Initial screening interview."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex gap-3">
                  <Button
                    onClick={() => {
                      setScheduleInterview(false);
                      // Reset form
                      if (!existingInterview) {
                        setInterviewDate("");
                        setInterviewTime("");
                        setInterviewMode("online");
                        setInterviewLocation("");
                        setInterviewFeedback("");
                      }
                    }}
                    variant="outline"
                    size="md"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleScheduleInterview}
                    variant="primary"
                    size="md"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Scheduling..." : existingInterview ? "Update Schedule" : "Confirm Schedule"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsModal;
