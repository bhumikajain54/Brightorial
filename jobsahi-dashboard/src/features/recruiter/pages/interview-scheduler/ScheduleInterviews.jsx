
import React, { useState, useEffect, useRef } from "react";
import {
  LuCalendar,
  LuClock,
  LuVideo,
  LuUsers,
  LuLink,
  LuPlus,
  LuX,
  LuMapPin,
  LuChevronDown,
  LuSearch,
} from "react-icons/lu";
import Calendar from "../../../../shared/components/Calendar";
import { TAILWIND_COLORS } from "../../../../shared/WebConstant";
import { Button } from "../../../../shared/components/Button";
import { getMethod, postMethod ,putMethod} from "../../../../service/api";
import apiService from "../../services/serviceUrl";
import Swal from "sweetalert2";


const ScheduleInterviews = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [showApplicationDropdown, setShowApplicationDropdown] = useState(false);
  const candidateDropdownRef = useRef(null);
  const applicationDropdownRef = useRef(null);

  // dropdown + data
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // main form
  const [formData, setFormData] = useState({
    candidates: "",
    candidate_id: "",
    student_id: "",
    job_id: "",
    application_id: "",
    date: new Date().toISOString().split("T")[0],
    timeSlot: "",
    interviewMode: "",
    location: "",
    interview_link: "",
    platform_name: "",
    status: "Scheduled",
    feedback: "",
  });

  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [hasFetchedStatuses, setHasFetchedStatuses] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [editFormData, setEditFormData] = useState({
    candidate: "",
    date: "",
    timeSlot: "",
    interviewMode: "",
    location: "",
    status: "Scheduled",
    feedback: "",
  });

  // =========================================================
  // 1) FETCH CANDIDATES FROM API - Only show applications with scheduled interviews
  // =========================================================
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoadingCandidates(true);
      try {
        // First, fetch scheduled interviews to know which applications have interviews
        const interviewsRes = await getMethod({ 
          apiUrl: apiService.getScheduledInterviews 
        });
        
        // Extract application_ids from scheduled interviews
        const scheduledApplicationIds = new Set();
        if (interviewsRes?.status && Array.isArray(interviewsRes?.data)) {
          interviewsRes.data.forEach((interview) => {
            const appId = interview.application_id || interview.applicationId;
            if (appId) {
              scheduledApplicationIds.add(String(appId));
            }
          });
        }
        
        // Now fetch all applicants
        const res = await getMethod({ apiUrl: apiService.getRecentApplicants });
        if (res?.status && Array.isArray(res?.all_applicants?.data)) {
          // ✅ Group by student_id to avoid duplicates (not by name)
          const grouped = {};
          const seenStudentIds = new Set(); // ✅ Track seen student IDs
          
          res.all_applicants.data.forEach((item) => {
            const appId = String(item.application_id || item.applicationId || '');
            
            // Only include applications that have scheduled interviews
            if (!scheduledApplicationIds.has(appId)) {
              return; // Skip applications without scheduled interviews
            }
            
            // ✅ Use student_id as unique key to prevent duplicates
            const studentId = String(item.student_id || item.studentId || '');
            if (!studentId) return; // Skip if no student_id
            
            // ✅ Only add student once, even if they have multiple applications
            if (!seenStudentIds.has(studentId)) {
              seenStudentIds.add(studentId);
              grouped[studentId] = {
                candidate_name: item.name || item.candidate_name || '—',
                candidate_id: studentId,
                student_id: studentId,
                applications: [],
              };
            }
            
            // ✅ Add application only if not already added (avoid duplicate applications)
            const existingApp = grouped[studentId].applications.find(
              app => String(app.application_id) === String(item.application_id)
            );
            if (!existingApp) {
              grouped[studentId].applications.push({
                application_id: item.application_id,
                job_id: item.job_id,
                job_title: item.applied_for || item.job_title || "—",
                status: item.status || "Pending",
              });
            }
          });
          
          // ✅ Convert to array - each student_id appears only once
          const uniqueCandidates = Object.values(grouped);
          
          // ✅ Additional safeguard: Filter out any duplicates by student_id
          const finalCandidates = [];
          const finalSeenIds = new Set();
          uniqueCandidates.forEach(candidate => {
            const id = String(candidate.student_id || candidate.candidate_id);
            if (id && !finalSeenIds.has(id)) {
              finalSeenIds.add(id);
              finalCandidates.push(candidate);
            }
          });
          
          console.log('✅ Unique candidates:', finalCandidates.length, 'out of', res.all_applicants.data.length, 'applications');
          setCandidates(finalCandidates);
        } else setCandidates([]);
      } catch (err) {
        console.error("❌ Error fetching candidates:", err);
        setCandidates([]);
      } finally {
        setLoadingCandidates(false);
      }
    };
    fetchCandidates();
  }, []);

  // =========================================================
  // 2) HANDLE OUTSIDE CLICK
  // =========================================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        candidateDropdownRef.current &&
        !candidateDropdownRef.current.contains(e.target)
      )
        setShowCandidateDropdown(false);
      if (
        applicationDropdownRef.current &&
        !applicationDropdownRef.current.contains(e.target)
      )
        setShowApplicationDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================================================
  // 3) HELPERS
  // =========================================================
  const handleInputChange = (f, v) => setFormData((p) => ({ ...p, [f]: v }));
  const formatTimeTo12Hour = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hours = parseInt(h, 10);
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${hour12}:${m} ${ampm}`;
  };
  const buildScheduledAt = () =>
    `${formData.date} ${formData.timeSlot || "00:00"}:00`;

  const handleCandidateSelect = (c) => {
    // Check if same candidate is being selected again
    const isSameCandidate = formData.candidate_id === c.candidate_id;
    
    // Use functional update to avoid state conflicts
    setFormData((p) => {
      // If selecting the same candidate, don't reset everything
      if (isSameCandidate) {
        return p; // Keep current state
      }
      
      // If selecting different candidate, reset related fields
      return {
        ...p,
        candidates: c.candidate_name,
        candidate_id: c.candidate_id,
        student_id: c.candidate_id,
        application_id: "",
        job_id: "",
        applicationTitle: "",
        // Reset other fields when changing candidate
        timeSlot: "",
        interviewMode: "",
        location: "",
        interview_link: "",
        platform_name: "",
        feedback: "",
      };
    });
    
    // Always update applications list for the selected candidate
    setApplications(c.applications || []);
    
    // Close dropdown
    setShowCandidateDropdown(false);
    
    // Reset application dropdown if candidate changed
    if (!isSameCandidate) {
      setShowApplicationDropdown(false);
    }
  };
const handleScheduleInterview = async () => {
  if (!formData.student_id)
    return Swal.fire("Missing Candidate", "Please select candidate.", "warning");
  if (!formData.job_id)
    return Swal.fire("Missing Job", "Please select a job.", "warning");
  if (!formData.application_id)
    return Swal.fire("Missing Application", "Please select an application.", "warning");
  if (!formData.date || !formData.timeSlot)
    return Swal.fire("Missing Date/Time", "Select date & time.", "warning");
  if (!formData.interviewMode)
    return Swal.fire("Missing Mode", "Select interview mode.", "warning");
  
  // Validate online interview requirements
  if (formData.interviewMode === "online") {
    if (!formData.interview_link || !formData.interview_link.trim())
      return Swal.fire("Missing Interview Link", "interview_link is required for online interviews.", "error");
    if (!formData.platform_name || !formData.platform_name.trim())
      return Swal.fire("Missing Platform", "Please enter platform name (e.g., Google Meet, Zoom, Teams).", "warning");
  }
  
  // Validate offline interview requirements
  if (formData.interviewMode === "offline" && !formData.location.trim())
    return Swal.fire("Missing Location", "Enter offline location.", "warning");

  const payload = {
    application_id: formData.application_id,
    student_id: formData.student_id,
    job_id: formData.job_id,
    scheduled_at: buildScheduledAt(),
    mode: formData.interviewMode,
    location: formData.interviewMode === "offline" ? formData.location.trim() : (formData.location || "Online"),
    interview_link: formData.interviewMode === "online" ? formData.interview_link.trim() : null,
    platform_name: formData.interviewMode === "online" ? formData.platform_name.trim() : null,
    status: formData.status || "Scheduled",
    interview_info: formData.feedback || "",
  };

  console.log("📤 Payload Sent:", payload);

  try {
    const res = await postMethod({
      apiUrl: apiService.scheduleInterview,
      payload, // ✅ correct key name
    });

    console.log("📥 API Response:", res);

    if (res?.status === true || res?.success === true) {
      Swal.fire({
        title: "✅ Interview Scheduled",
        text: "Interview scheduled successfully!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // reset form
      const dateObj = new Date(formData.date);
      const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}-${String(
        dateObj.getMonth() + 1
      ).padStart(2, "0")}-${String(dateObj.getFullYear()).slice(-2)}`;
      const formattedTime = formatTimeTo12Hour(formData.timeSlot);

      // ✅ Get original date in YYYY-MM-DD format for highlighting
      const originalDateForHighlight = formData.date;

      const newInterview = {
        id: res.interview_id || scheduledInterviews.length + 1,
        candidate: {
          name: formData.candidates,
          initials: formData.candidates
            .split(" ")
            .map((n) => n[0])
            .join(""),
          jobRole: "—",
          date: formattedDate,
          originalDate: originalDateForHighlight, // ✅ Store for highlighting
        },
        time: formattedTime,
        type:
          formData.interviewMode === "online"
            ? "Virtual Call"
            : "In-Person",
        location: formData.location || "—",
        status: formData.status,
        feedback: formData.feedback,
        panelMembers: ["HR Manager", "Senior Developer"],
      };

      setScheduledInterviews((p) => [newInterview, ...p]);
      setFormData({
        candidates: "",
        candidate_id: "",
        student_id: "",
        job_id: "",
        application_id: "",
        date: new Date().toISOString().split("T")[0],
        timeSlot: "",
        interviewMode: "",
        location: "",
        interview_link: "",
        platform_name: "",
        status: "Scheduled",
        feedback: "",
      });
      setSelectedDate(new Date());
    } else {
      Swal.fire({
        title: "❌ Failed",
        text: res?.message || "Failed to schedule interview.",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    }
  } catch (err) {
    console.error("❌ Error scheduling interview:", err);
    Swal.fire({
      title: "⚠️ Server Error",
      text: "Something went wrong while scheduling the interview.",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
};

// =========================================================
// 4) FETCH ALL SCHEDULED INTERVIEWS (GET API)
// =========================================================
// const fetchScheduledInterviews = async () => {
//   try {
//     const res = await getMethod({
//       apiUrl: apiService.getScheduledInterviews, // ✅ we’ll define this in serviceUrl.js
//     });

//     console.log("📥 Scheduled Interviews API Response:", res);

//     if ((res?.status === "success" || res?.status === true) && Array.isArray(res?.data)) {
//     const mapped = res.data.map((item, index) => {
//   // ✅ Fix date issue properly
//   let formattedDate = "—";
//   if (item.date) {
//     formattedDate = new Date(item.date).toLocaleDateString("en-GB");
//   } else if (item.scheduled_at) {
//     formattedDate = new Date(item.scheduled_at).toLocaleDateString("en-GB");
//   }

//   return {
//     id: item.interviewId || item.interview_id || index + 1,
//     candidate: {
//       name: item.candidateName || item.candidate_name || "—",
//       initials: (item.candidateName || item.candidate_name || "")
//         ?.split(" ")
//         .map((n) => n[0])
//         .join(""),
//       jobRole: item.jobTitle || item.job_title || "—",
//       date: formattedDate, // ✅ properly fixed date
//     },
//     time: item.timeSlot || item.time_slot || "—",
//     type:
//       item.interviewMode?.toLowerCase() === "online" ||
//       item.mode?.toLowerCase() === "online"
//         ? "Virtual Call"
//         : "In-Person",
//     location: item.location || "—",
//     status: item.status || "Scheduled",
//     feedback: item.feedback || "—",
//     meetingLink: item.meetingLink || item.meeting_link || "",
//     scheduledBy: item.scheduledBy || item.scheduled_by || "",
//   };
// });


//       setScheduledInterviews(mapped);
//     } else {
//       setScheduledInterviews([]);
//       console.warn("⚠️ No scheduled interviews found");
//     }
//   } catch (err) {
//     console.error("❌ Error fetching scheduled interviews:", err);
//     setScheduledInterviews([]);
//   }
// };

// // ✅ Call on mount
// useEffect(() => {
//   fetchScheduledInterviews();
// }, []);

 const fetchScheduledInterviews = async () => {
    try {
      const res = await getMethod({
        apiUrl: apiService.getScheduledInterviews,
      });

      console.log("📥 Scheduled Interviews API Response:", res);

      if (
        (res?.status === "success" || res?.status === true) &&
        Array.isArray(res?.data)
      ) {
        // Filter to only show interviews that are actually scheduled (have scheduled_at date)
        const scheduledOnly = res.data.filter((item) => {
          const hasScheduledDate = item.scheduled_at || item.scheduled_date || item.date;
          const hasStatus = item.status && 
            (item.status.toLowerCase() === 'scheduled' || 
             item.status.toLowerCase() === 'pending' ||
             item.status.toLowerCase() === 'upcoming');
          return hasScheduledDate && (hasStatus || true); // Include if has scheduled date
        });
        
        const mapped = scheduledOnly.map((item, index) => {
          // ✅ Extract original date for highlighting (YYYY-MM-DD format)
          let originalDate = null;
          let formattedDate = "—";
          
          const dateValue = item.date || item.scheduled_at;
          if (dateValue) {
            try {
              // ✅ If date is already in YYYY-MM-DD format, use it directly
              if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
                // Extract just the date part (YYYY-MM-DD) if there's time included
                originalDate = dateValue.split(' ')[0].split('T')[0];
                // Format for display (DD/MM/YYYY)
                const dateObj = new Date(originalDate + 'T00:00:00');
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = dateObj.toLocaleDateString("en-GB");
                }
              } else {
                // Fallback: parse other date formats
                const dateObj = new Date(dateValue);
                if (!isNaN(dateObj.getTime())) {
                  originalDate = dateObj.toISOString().split("T")[0];
                  formattedDate = dateObj.toLocaleDateString("en-GB");
                }
              }
            } catch (e) {
              console.warn("Date parsing error:", e);
            }
          }

          return {
            id: item.interviewId || item.interview_id || index + 1,
            application_id: item.application_id || item.applicationId || null,
            candidate: {
              name: item.candidateName || item.candidate_name || "—",
              initials: (item.candidateName || item.candidate_name || "")
                ?.split(" ")
                .map((n) => n[0])
                .join(""),
              jobRole: item.jobTitle || item.job_title || "—",
              date: formattedDate,
              originalDate: originalDate, // ✅ Store for highlighting
            },
            time: item.timeSlot || item.time_slot || "—",
            type:
              item.interviewMode?.toLowerCase() === "online" ||
              item.mode?.toLowerCase() === "online"
                ? "Virtual Call"
                : "In-Person",
            location: item.location || "—",
            status: item.status || "Scheduled",
            feedback: item.interview_info || item.feedback || item.interviewInfo || "—",
            interview_info: item.interview_info || item.feedback || item.interviewInfo || null,
            meetingLink: item.meetingLink || item.meeting_link || "",
            scheduledBy: item.scheduledBy || item.scheduled_by || "",
          };
        });

        setScheduledInterviews(mapped);
      } else {
        setScheduledInterviews([]);
        console.warn("⚠️ No scheduled interviews found");
      }
    } catch (err) {
      console.error("❌ Error fetching scheduled interviews:", err);
      setScheduledInterviews([]);
    }
  };

  useEffect(() => {
    fetchScheduledInterviews();
  }, []);

  // =========================================================
  // 4.5) FETCH APPLICATION STATUS FOR ALL INTERVIEWS ON PAGE LOAD
  // =========================================================
  useEffect(() => {
    const fetchApplicationStatuses = async () => {
      if (hasFetchedStatuses || scheduledInterviews.length === 0) return;

      const interviewsWithAppId = scheduledInterviews.filter((intv) => intv.application_id);
      if (interviewsWithAppId.length === 0) return;

      setHasFetchedStatuses(true);
      console.log("📤 Fetching application statuses for", interviewsWithAppId.length, "interviews on page load");

      try {
        // Fetch status for all interviews that have application_id
        const statusPromises = interviewsWithAppId.map((interview) =>
          getMethod({
            apiUrl: apiService.getApplication,
            params: { id: interview.application_id },
          })
            .then((response) => {
              console.log(`📥 GET Application Status for ID ${interview.application_id}:`, response);
              return {
                interviewId: interview.id,
                applicationId: interview.application_id,
                response,
              };
            })
            .catch((error) => {
              console.error(`❌ Error fetching status for application_id ${interview.application_id}:`, error);
              return {
                interviewId: interview.id,
                applicationId: interview.application_id,
                response: null,
                error,
              };
            })
        );

        const statusResults = await Promise.all(statusPromises);

        console.log("📥 All Application Status Responses:", statusResults);

        // Update local state with fetched statuses
        setScheduledInterviews((prev) =>
          prev.map((intv) => {
            const statusResult = statusResults.find(
              (result) => result.interviewId === intv.id
            );

            if (statusResult && statusResult.response?.status === true && statusResult.response?.data) {
              const updatedStatus = statusResult.response.data.status || intv.status;
              console.log(`✅ Updated status for interview ${intv.id} (app_id: ${intv.application_id}): ${updatedStatus}`);
              return { ...intv, status: updatedStatus };
            }

            return intv;
          })
        );
      } catch (error) {
        console.error("❌ Error fetching application statuses:", error);
        setHasFetchedStatuses(false); // Reset on error so it can retry
      }
    };

    // Only fetch if we have interviews with application_id and haven't fetched yet
    if (scheduledInterviews.length > 0 && scheduledInterviews.some((intv) => intv.application_id) && !hasFetchedStatuses) {
      fetchApplicationStatuses();
    }
  }, [scheduledInterviews.length, hasFetchedStatuses]); // Run when scheduledInterviews count changes

// ✅ Interview waali dates highlight karne ke liye
const [highlightedDates, setHighlightedDates] = useState([]);

useEffect(() => {
  // ✅ Extract dates directly from originalDate field (already in YYYY-MM-DD format)
  const dates = scheduledInterviews
    .map((i) => {
      const date = i.candidate?.originalDate;
      console.log("🔍 Interview date check:", i.candidate?.name, "->", date);
      return date;
    })
    .filter(Boolean); // Remove null/undefined values
  
  console.log("📅 All Highlighted Dates:", dates);
  console.log("📅 Scheduled Interviews Count:", scheduledInterviews.length);
  setHighlightedDates(dates);
}, [scheduledInterviews]);


  // =========================================================
  // 5) SEARCH + EDIT INTERVIEW
  // =========================================================
  const filteredInterviews = scheduledInterviews.filter((interview) => {
    const q = searchQuery.toLowerCase();
    return (
      interview.candidate.name.toLowerCase().includes(q) ||
      interview.time.toLowerCase().includes(q) ||
      interview.status.toLowerCase().includes(q)
    );
  });

  // =========================================================
  // 6) HANDLE SELECT/REJECT CANDIDATES
  // =========================================================
  const handleSelectCandidate = async (interview) => {
    if (!interview.application_id) {
      Swal.fire({
        title: "Error",
        text: "Application ID not found. Cannot update status.",
        icon: "error",
      });
      return;
    }

    try {
      setLoadingAction(true);
      // ✅ API expects application_id as query parameter and status in body
      const response = await putMethod({
        apiUrl: `${apiService.updateApplicationStatus}?id=${interview.application_id}`,
        payload: {
          status: "selected",
          job_selected: 1,
        },
      });

      console.log("📥 Hired API Response:", response);

      if (response?.status === true || response?.status === "success" || response?.success === true) {
        // ✅ Fetch updated application status from GET API
        try {
          console.log("📤 Calling GET Application API with ID:", interview.application_id);
          console.log("📤 GET API URL:", apiService.getApplication);
          console.log("📤 GET API Params:", { id: interview.application_id });
          
          const getResponse = await getMethod({
            apiUrl: apiService.getApplication,
            params: { id: interview.application_id },
          });

          console.log("📥 bbbbbbbbbjsnjsnjGET Application Status Response:", getResponse);
          console.log("📥 GET Response Status:", getResponse?.status);
          console.log("📥 GET Response Data:", getResponse?.data);

          if (getResponse?.status === true && getResponse?.data) {
            const updatedStatus = getResponse.data.status || "selected";
            console.log("✅ Updated Status from GET API:", updatedStatus);
            
            // Update local state with fetched status
            setScheduledInterviews((prev) =>
              prev.map((intv) =>
                intv.id === interview.id
                  ? { ...intv, status: updatedStatus }
                  : intv
              )
            );
          } else {
            console.warn("⚠️ GET API response structure unexpected:", getResponse);
            // Fallback: Update with "selected" if GET API fails
            setScheduledInterviews((prev) =>
              prev.map((intv) =>
                intv.id === interview.id
                  ? { ...intv, status: "selected" }
                  : intv
              )
            );
          }
        } catch (getError) {
          console.error("❌ Error fetching updated status:", getError);
          console.error("❌ Error details:", {
            message: getError?.message,
            response: getError?.response,
            application_id: interview.application_id
          });
          // Fallback: Update with "selected" if GET API fails
          setScheduledInterviews((prev) =>
            prev.map((intv) =>
              intv.id === interview.id
                ? { ...intv, status: "selected" }
                : intv
            )
          );
        }

        // Remove from selected candidates if it was selected
        setSelectedCandidates((prev) => prev.filter(id => id !== interview.id));

        Swal.fire({
          title: "Success!",
          text: `${interview.candidate.name} has been hired successfully.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Failed",
          text: response?.message || "Failed to update candidate status.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error hiring candidate:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Something went wrong.",
        icon: "error",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRejectCandidate = async (interview) => {
    if (!interview.application_id) {
      Swal.fire({
        title: "Error",
        text: "Application ID not found. Cannot update status.",
        icon: "error",
      });
      return;
    }

    try {
      setLoadingAction(true);
      // ✅ API expects application_id as query parameter and status in body
      const response = await putMethod({
        apiUrl: `${apiService.updateApplicationStatus}?id=${interview.application_id}`,
        payload: {
          status: "rejected",
          job_selected: 0,
        },
      });

      console.log("📥 Reject API Response:", response);

      if (response?.status === true || response?.status === "success" || response?.success === true) {
        // ✅ Fetch updated application status from GET API
        try {
          console.log("📤 Calling GET Application API (Reject) with ID:", interview.application_id);
          console.log("📤 GET API URL:", apiService.getApplication);
          console.log("📤 GET API Params:", { id: interview.application_id });
          
          const getResponse = await getMethod({
            apiUrl: apiService.getApplication,
            params: { id: interview.application_id },
          });

          console.log("📥 GET Application Status Response (Reject):", getResponse);
          console.log("📥 GET Response Status:", getResponse?.status);
          console.log("📥 GET Response Data:", getResponse?.data);

          if (getResponse?.status === true && getResponse?.data) {
            const updatedStatus = getResponse.data.status || "rejected";
            console.log("✅ Updated Status from GET API:", updatedStatus);
            
            // Update local state with fetched status
            setScheduledInterviews((prev) =>
              prev.map((intv) =>
                intv.id === interview.id
                  ? { ...intv, status: updatedStatus }
                  : intv
              )
            );
          } else {
            console.warn("⚠️ GET API response structure unexpected:", getResponse);
            // Fallback: Update with "rejected" if GET API fails
            setScheduledInterviews((prev) =>
              prev.map((intv) =>
                intv.id === interview.id
                  ? { ...intv, status: "rejected" }
                  : intv
              )
            );
          }
        } catch (getError) {
          console.error("❌ Error fetching updated status:", getError);
          console.error("❌ Error details:", {
            message: getError?.message,
            response: getError?.response,
            application_id: interview.application_id
          });
          // Fallback: Update with "rejected" if GET API fails
          setScheduledInterviews((prev) =>
            prev.map((intv) =>
              intv.id === interview.id
                ? { ...intv, status: "rejected" }
                : intv
            )
          );
        }

        // Remove from selected candidates if it was selected
        setSelectedCandidates((prev) => prev.filter(id => id !== interview.id));

        Swal.fire({
          title: "Rejected",
          text: `${interview.candidate.name} has been rejected.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Failed",
          text: response?.message || "Failed to update candidate status.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error rejecting candidate:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Something went wrong.",
        icon: "error",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleBulkShortlist = async () => {
    if (selectedCandidates.length === 0) {
      Swal.fire({
        title: "No Selection",
        text: "Please select at least one candidate.",
        icon: "warning",
      });
      return;
    }

    try {
      setLoadingAction(true);
      const selectedInterviews = scheduledInterviews.filter((intv) =>
        selectedCandidates.includes(intv.id)
      );

      // Filter out interviews without application_id
      const validInterviews = selectedInterviews.filter(
        (intv) => intv.application_id
      );

      if (validInterviews.length === 0) {
        Swal.fire({
          title: "Error",
          text: "No valid candidates found for bulk hire.",
          icon: "error",
        });
        return;
      }

      // ✅ Call API for each candidate with application_id as query parameter
      const promises = validInterviews.map((interview) =>
        putMethod({
          apiUrl: `${apiService.updateApplicationStatus}?id=${interview.application_id}`,
          payload: {
            status: "selected",
            job_selected: 1,
          },
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(
        (res) => res?.status === true || res?.status === "success" || res?.success === true
      ).length;

      // ✅ Fetch updated status for all successfully hired candidates
      const successfulInterviews = validInterviews.filter((interview, index) => {
        const result = results[index];
        return result?.status === true || result?.status === "success" || result?.success === true;
      });

      // Fetch updated status for each successful hire
      console.log("📤 Fetching updated status for", successfulInterviews.length, "candidates");
      const statusPromises = successfulInterviews.map((interview) => {
        console.log("📤 GET API for application_id:", interview.application_id);
        return getMethod({
          apiUrl: apiService.getApplication,
          params: { id: interview.application_id },
        });
      });

      try {
        const statusResults = await Promise.all(statusPromises);
        
        // Update local state with fetched statuses
        setScheduledInterviews((prev) =>
          prev.map((intv) => {
            if (selectedCandidates.includes(intv.id)) {
              const interviewIndex = successfulInterviews.findIndex(
                (inv) => inv.id === intv.id
              );
              if (interviewIndex !== -1 && statusResults[interviewIndex]?.data) {
                const updatedStatus = statusResults[interviewIndex].data.status || "selected";
                return { ...intv, status: updatedStatus };
              }
              return { ...intv, status: "selected" };
            }
            return intv;
          })
        );
      } catch (statusError) {
        console.error("Error fetching updated statuses:", statusError);
        // Fallback: Update with "selected" if GET API fails
        setScheduledInterviews((prev) =>
          prev.map((intv) =>
            selectedCandidates.includes(intv.id)
              ? { ...intv, status: "selected" }
              : intv
          )
        );
      }

      // Clear selection
      setSelectedCandidates([]);

      Swal.fire({
        title: "Success!",
        text: `${successCount} candidate(s) have been hired successfully.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error bulk shortlisting:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Something went wrong.",
        icon: "error",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // const handleEditClick = (interview) => {
  //   setSelectedInterview(interview);
  //   const [day, month, year] = interview.candidate.date.split("-");
  //   const fullYear = "20" + year;
  //   const formattedDate = `${fullYear}-${month}-${day}`;
  //   const parseTimeTo24 = (t12) => {
  //     if (!t12) return "";
  //     const [time, period] = t12.split(" ");
  //     const [hh, mm] = time.split(":");
  //     let h = parseInt(hh, 10);
  //     if (period === "PM" && h !== 12) h += 12;
  //     if (period === "AM" && h === 12) h = 0;
  //     return `${String(h).padStart(2, "0")}:${mm}`;
  //   };

  //   setEditFormData({
  //     candidate: interview.candidate.name,
  //     date: formattedDate,
  //     timeSlot: parseTimeTo24(interview.time),
  //     interviewMode: interview.type === "Virtual Call" ? "online" : "offline",
  //     location: interview.location || "",
  //     status: interview.status,
  //     feedback: interview.feedback || "",
  //   });
  //   setShowEditModal(true);
  // };

  const handleEditClick = (interview) => {
  setSelectedInterview(interview);

  // ✅ safely extract full ISO date string from any format
  let formattedDate = "";
  try {
    if (interview.candidate?.date) {
      const d = interview.candidate.date;

      if (d.includes("/")) {
        // dd/mm/yyyy → yyyy-mm-dd
        const [day, month, year] = d.split("/");
        formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      } else if (d.includes("-")) {
        // yyyy-mm-dd or yyyy-mm-ddTHH:mm:ssZ
        formattedDate = d.split("T")[0];
      } else {
        // timestamp fallback
        formattedDate = new Date(d).toISOString().split("T")[0];
      }
    }
  } catch (e) {
    formattedDate = "";
  }

  // ✅ convert 12h → 24h
  const parseTimeTo24 = (t12) => {
    if (!t12) return "";
    const [time, period] = t12.split(" ");
    const [hh, mm] = time.split(":");
    let h = parseInt(hh, 10);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${mm}`;
  };

  // ✅ Get feedback from interview_info or feedback field
  const interviewFeedback = interview.interview_info || interview.feedback || "";
  
  setEditFormData({
    candidate: interview.candidate.name,
    date: formattedDate, // ✅ fixed
    timeSlot: parseTimeTo24(interview.time),
    interviewMode: interview.type === "Virtual Call" ? "online" : "offline",
    location: interview.location && interview.location !== "—" ? interview.location : "",
    status: interview.status,
    feedback: interviewFeedback && interviewFeedback !== "—" ? interviewFeedback : "",
  });

  setShowEditModal(true);
};

  const handleEditInputChange = (f, v) =>
    setEditFormData((p) => ({ ...p, [f]: v }));


const handleUpdateInterview = async () => {
  if (!selectedInterview) return;

  if (!editFormData.date || !editFormData.timeSlot)
    return Swal.fire("Missing Fields", "Please select date and time.", "warning");

  // build scheduled_at in MySQL format
  const scheduled_at = `${editFormData.date} ${editFormData.timeSlot}:00`;

  const payload = {
    interview_id: selectedInterview.id,
    scheduled_at,
    status: editFormData.status,
    interview_info: editFormData.feedback, // ✅ Backend expects interview_info field
    feedback: editFormData.feedback, // Keep for backward compatibility
  };

  console.log("📤 Update Payload:", payload);

  try {
    const res = await putMethod({
      apiUrl: apiService.updateInterview, // ✅ ensure defined in serviceUrl.js
      payload,
    });

    console.log("📥 Update Response:", res);

    if (res?.status === true || res?.status === "success") {
      Swal.fire({
        title: "✅ Interview Updated",
        text: "Interview details have been updated successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowEditModal(false);
      setSelectedInterview(null);

      // Refresh interviews
      fetchScheduledInterviews();
    } else {
      Swal.fire({
        title: "❌ Failed",
        text: res?.message || "Failed to update interview.",
        icon: "error",
      });
    }
  } catch (err) {
    console.error("❌ Error updating interview:", err);
    Swal.fire({
      title: "⚠️ Server Error",
      text: "Something went wrong while updating the interview.",
      icon: "error",
    });
  }
};


  // =========================================================
  // 6) RENDER
  // =========================================================
  return (
    <div className="mt-5">
      {/* Top Section - Calendar and Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-5">
        {/* Calendar */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="mb-4">
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Calendar
            </h3>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
              Select interview date
            </p>
          </div>
      <Calendar
        selectedDate={selectedDate}
        highlightedDates={highlightedDates}
        onDateSelect={(dateObj) => {
          // ✅ Calendar now passes full Date object
          if (!dateObj || !(dateObj instanceof Date)) {
            console.error("Invalid date received:", dateObj);
            return;
          }
          
          // ✅ Validate date before using
          if (isNaN(dateObj.getTime())) {
            console.error("Invalid date:", dateObj);
            return;
          }
          
          // ✅ Format date as YYYY-MM-DD for input field
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          
          console.log(`📅 Date selected from calendar: ${formattedDate}`);
          
          setSelectedDate(dateObj);
          setFormData((prev) => ({
            ...prev,
            date: formattedDate, // ✅ Set date in form field
          }));
        }}
      />


        </div>

        {/* Schedule New Interview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
            Schedule New Interview
          </h3>
          <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
            Configure interview details
          </p>

          {/* Candidate Dropdown */}
          <div className="relative mt-4" ref={candidateDropdownRef}>
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Select Candidate
            </label>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowCandidateDropdown(!showCandidateDropdown);
                // Close application dropdown when opening candidate dropdown
                if (!showCandidateDropdown) {
                  setShowApplicationDropdown(false);
                }
              }}
              className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <span className="flex-1 truncate">
                {formData.candidates ||
                  (loadingCandidates ? "Loading..." : "Choose candidate")}
              </span>
              <LuChevronDown
                className={`w-4 h-4 transition-transform ${showCandidateDropdown ? "rotate-180" : ""}`}
              />
            </button>
            {showCandidateDropdown && (
              <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto">
                {candidates.length > 0 ? (
                  candidates.map((c, index) => {
                    // Get job title(s) from applications
                    const jobTitles = c.applications && c.applications.length > 0
                      ? c.applications.map(app => app.job_title || '—').filter(title => title !== '—')
                      : [];
                    const displayJobTitle = jobTitles.length > 0 
                      ? ` (${jobTitles[0]}${jobTitles.length > 1 ? `, +${jobTitles.length - 1} more` : ''})`
                      : '';
                    
                    return (
                      <button
                        key={`candidate-${c.student_id || c.candidate_id}`}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCandidateSelect(c);
                        }}
                        className={`block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                          formData.candidate_id === c.candidate_id ? 'bg-blue-50 font-medium' : ''
                        }`}
                      >
                        {c.candidate_name}{displayJobTitle}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    {loadingCandidates ? "Loading candidates..." : "No candidates available"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Application Dropdown */}
          {formData.candidate_id && (
            <div className="relative mt-4" ref={applicationDropdownRef}>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                Select Application
              </label>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowApplicationDropdown(!showApplicationDropdown);
                }}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="flex-1 truncate">
                  {formData.applicationTitle || "Choose application"}
                </span>
                <LuChevronDown
                  className={`w-4 h-4 transition-transform ${showApplicationDropdown ? "rotate-180" : ""}`}
                />
              </button>
              {showApplicationDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {applications.length > 0 ? (
                    applications.map((a) => (
                      <button
                        key={a.application_id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Use functional update to avoid conflicts
                          setFormData((p) => {
                            // Check if same application is being selected
                            if (p.application_id === a.application_id) {
                              return p; // Keep current state
                            }
                            return {
                              ...p,
                              application_id: a.application_id,
                              job_id: a.job_id,
                              applicationTitle: `${a.job_title}`,
                            };
                          });
                          setShowApplicationDropdown(false);
                        }}
                        className={`block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                          formData.application_id === a.application_id ? 'bg-blue-50 font-medium' : ''
                        }`}
                      >
                        {a.job_title}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No applications available
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Date & Time */}
          <div className="flex gap-4 mt-4">
            <div className="w-1/2">
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="w-1/2">
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                Time
              </label>
              <input
                type="time"
                value={formData.timeSlot}
                onChange={(e) => handleInputChange("timeSlot", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Interview Mode */}
          <div className="mt-4">
            <label
              className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}
            >
              Interview Mode
            </label>
            <div className="space-y-3">
              {/* Online Mode */}
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  id="online-mode"
                  name="interviewMode"
                  value="online"
                  checked={formData.interviewMode === "online"}
                  onChange={(e) => {
                    const mode = e.target.value;
                    // Reset opposite mode fields when switching
                    if (mode === "online") {
                      setFormData(prev => ({
                        ...prev,
                        interviewMode: mode,
                        location: "", // Clear offline location
                        interview_link: prev.interview_link || "",
                        platform_name: prev.platform_name || ""
                      }));
                    } else if (mode === "offline") {
                      setFormData(prev => ({
                        ...prev,
                        interviewMode: mode,
                        interview_link: "", // Clear online link
                        platform_name: "", // Clear platform name
                        location: prev.location || ""
                      }));
                    } else {
                      handleInputChange("interviewMode", mode);
                    }
                  }}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <LuVideo className="w-5 h-5 text-primary" />
                  <label
                    htmlFor="online-mode"
                    className="cursor-pointer flex-1"
                  >
                    <div
                      className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                    >
                      Online
                    </div>
                    <div className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      Virtual call or video conference
                    </div>
                  </label>
                </div>
              </div>

              {/* Offline Mode */}
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  id="offline-mode"
                  name="interviewMode"
                  value="offline"
                  checked={formData.interviewMode === "offline"}
                  onChange={(e) => {
                    const mode = e.target.value;
                    // Reset opposite mode fields when switching
                    if (mode === "online") {
                      setFormData(prev => ({
                        ...prev,
                        interviewMode: mode,
                        location: "", // Clear offline location
                        interview_link: prev.interview_link || "",
                        platform_name: prev.platform_name || ""
                      }));
                    } else if (mode === "offline") {
                      setFormData(prev => ({
                        ...prev,
                        interviewMode: mode,
                        interview_link: "", // Clear online link
                        platform_name: "", // Clear platform name
                        location: prev.location || ""
                      }));
                    } else {
                      handleInputChange("interviewMode", mode);
                    }
                  }}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <LuUsers className="w-5 h-5 text-green-600" />
                  <label
                    htmlFor="offline-mode"
                    className="cursor-pointer flex-1"
                  >
                    <div
                      className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                    >
                      Offline
                    </div>
                    <div className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>
                      In-person meeting at office
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>


          {/* Online Interview Fields */}
          {formData.interviewMode === "online" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  Interview Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx or https://zoom.us/j/xxxxx"
                  value={formData.interview_link}
                  onChange={(e) => handleInputChange("interview_link", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className={`text-xs mt-1 ${TAILWIND_COLORS.TEXT_MUTED}`}>
                  Enter the meeting link (Google Meet, Zoom, Teams, etc.)
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
                  Platform Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Google Meet, Zoom, Microsoft Teams"
                  value={formData.platform_name}
                  onChange={(e) => handleInputChange("platform_name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className={`text-xs mt-1 ${TAILWIND_COLORS.TEXT_MUTED}`}>
                  Enter the platform name for the video call
                </p>
              </div>
            </div>
          )}

          {/* Location */}
          {formData.interviewMode === "offline" && (
            <div className="mt-4">
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter interview location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Status */}
          <div className="mt-4">
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="reschedule">Rescheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Feedback */}
          <div className="mt-4">
            <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Feedback
            </label>
            <input
              type="text"
              placeholder="Enter feedback"
              value={formData.feedback}
              onChange={(e) => handleInputChange("feedback", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <Button
            onClick={handleScheduleInterview}
            variant="primary"
            size="lg"
            fullWidth
            className="mt-5"
          >
            Confirm Schedule
          </Button>
        </div>
      </div>

      {/* Scheduled Interviews */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={(() => {
                // Only count non-rejected interviews for select all
                const selectableInterviews = filteredInterviews.filter(
                  (intv) => intv.status?.toLowerCase() !== "rejected" && intv.status?.toLowerCase() !== "selected"
                );
                return selectableInterviews.length > 0 && 
                       selectedCandidates.length === selectableInterviews.length &&
                       selectableInterviews.every(intv => selectedCandidates.includes(intv.id));
              })()}
              onChange={(e) => {
                if (e.target.checked) {
                  // Select all filtered interviews EXCEPT rejected and selected ones
                  const selectableInterviews = filteredInterviews.filter(
                    (intv) => intv.status?.toLowerCase() !== "rejected" && intv.status?.toLowerCase() !== "selected"
                  );
                  setSelectedCandidates(selectableInterviews.map(intv => intv.id));
                } else {
                  // Deselect all
                  setSelectedCandidates([]);
                }
              }}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
            />
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Scheduled Interviews
            </h3>
             </div>
             
          <Button
            onClick={handleBulkShortlist}
            variant="primary"
            size="sm"
            disabled={loadingAction || selectedCandidates.length === 0}
            className="flex items-center gap-2"
          >
            Bulk Hire {selectedCandidates.length > 0 && `(${selectedCandidates.length})`}
          </Button>
          
        </div>
        <p>All listed candidates have successfully cleared the interview process and are shortlisted. Final hiring confirmation is now pending. </p>
        
        <div className="mt-4">
          <div className="relative mb-5">
            <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by candidate, time, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg"
            />
          </div>

          {filteredInterviews.length === 0 && (
            <p className="text-gray-500 text-sm">No interviews found</p>
          )}
          <div className="space-y-4">
            {filteredInterviews.map((intv) => (
              <div
                key={intv.id}
                className="border p-4 rounded-lg flex justify-between items-center hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.includes(intv.id)}
                    disabled={intv.status?.toLowerCase() === "rejected" || intv.status?.toLowerCase() === "selected"}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCandidates([...selectedCandidates, intv.id]);
                      } else {
                        setSelectedCandidates(selectedCandidates.filter(id => id !== intv.id));
                      }
                    }}
                    className={`w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary ${
                      intv.status?.toLowerCase() === "rejected" || intv.status?.toLowerCase() === "selected"
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                  />
                  <div className="flex-1">
                    <div
                      className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} cursor-pointer`}
                      onClick={() => handleEditClick(intv)}
                    >
                      {intv.candidate.name}
                    </div>
                    <p className="text-sm text-gray-500">
                      {intv.candidate.date} • {intv.time} • {intv.type}
                      {intv.location && intv.location !== "—" && intv.type === "In-Person" && ` • ${intv.location}`}
                    </p>
                    {intv.feedback && intv.feedback !== "—" && (
                      <p className="text-xs text-gray-400 mt-1">
                        Feedback: {intv.feedback}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {intv.status?.toLowerCase() === "selected" ? (
                    <Button
                      variant="success"
                      size="sm"
                      disabled={true}
                      className="flex items-center gap-1 cursor-not-allowed"
                    >
                      Candidate Selected
                    </Button>
                  ) : intv.status?.toLowerCase() === "rejected" ? (
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={true}
                      className="flex items-center gap-1 cursor-not-allowed"
                    >
                      Candidate Rejected
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleSelectCandidate(intv)}
                        variant="primary"
                        size="sm"
                        disabled={loadingAction}
                        className="flex items-center gap-1"
                      >
                        Hired
                      </Button>
                      <Button
                        onClick={() => handleRejectCandidate(intv)}
                        variant="danger"
                        size="sm"
                        disabled={loadingAction}
                        className="flex items-center gap-1"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                Edit Interview
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedInterview(null);
                }}
              >
                <LuX size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  Candidate
                </label>
                <input
                  type="text"
                  readOnly
                  value={editFormData.candidate}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => handleEditInputChange("date", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    Time
                  </label>
                  <input
                    type="time"
                    value={editFormData.timeSlot}
                    onChange={(e) =>
                      handleEditInputChange("timeSlot", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Mode */}
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  Interview Mode
                </label>
                <div className="flex gap-5 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="online"
                      checked={editFormData.interviewMode === "online"}
                      onChange={(e) =>
                        handleEditInputChange("interviewMode", e.target.value)
                      }
                    />
                    <LuVideo className="text-primary" /> Online
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="offline"
                      checked={editFormData.interviewMode === "offline"}
                      onChange={(e) =>
                        handleEditInputChange("interviewMode", e.target.value)
                      }
                    />
                    <LuUsers className="text-green-600" /> Offline
                  </label>
                </div>
              </div>

              {/* Location */}
              {editFormData.interviewMode === "offline" && (
                <div>
                  <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={editFormData.location}
                    onChange={(e) =>
                      handleEditInputChange("location", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}

              {/* Status */}
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    handleEditInputChange("status", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="reschedule">Rescheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Feedback */}
              <div>
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  Feedback
                </label>
                <input
                  type="text"
                  placeholder="Enter feedback"
                  value={editFormData.feedback}
                  onChange={(e) =>
                    handleEditInputChange("feedback", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedInterview(null);
                }}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateInterview}
                variant="primary"
              >
                Update Interview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleInterviews;
