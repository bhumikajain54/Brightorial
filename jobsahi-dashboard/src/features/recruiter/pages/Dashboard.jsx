import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  FaBriefcase,
  FaUsers,
  FaCalendarAlt,
  FaEnvelope,
  FaCheck,
  FaTimes,
  FaDownload,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaCode,
  FaLanguage,
} from "react-icons/fa";
import { Horizontal4Cards } from "../../../shared/components/metricCard";
import Calendar from "../../../shared/components/Calendar";
import DataTable from "../../../shared/components/DataTable";
import jsPDF from "jspdf";
import { getMethod } from "../../../service/api";
import service from "../services/serviceUrl";
import ViewDetailsModal from "./candidate-management/ViewDetailsModal";


ChartJS.register(ArcElement, Tooltip, Legend);


const Dashboard = () => {
  // ---------- STATES ----------
  const [dashboardStats, setDashboardStats] = useState({
    jobs_posted: 0,
    applied_job: 0,
    interview_job: 0,
    interview_completed: 0,
  });
  const [interviewDetails, setInterviewDetails] = useState([]);
  const [interviewDates, setInterviewDates] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [recentApplicantsDetailed, setRecentApplicantsDetailed] = useState([]); // Store detailed data
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [tradesData, setTradesData] = useState({ labels: [], datasets: [] });
  const [applicantCards, setApplicantCards] = useState([]);
  const [weekRange, setWeekRange] = useState("");
  const [selectedDate, setSelectedDate] = useState(10);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Current month (0-11)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year
  const [recruiterName, setRecruiterName] = useState("");


  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedCandidate(null);
  };

  // ---------- FETCH ALL DATA ----------
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setDataLoaded(false);
      try {
        await fetchRecruiterProfile(); // Default API call
        await fetchDashboardData();
        await fetchInterviewDetails();
        await fetchWeeklyApplicants();
        await fetchRecentApplicants();
      } finally {
        setIsLoading(false);
        setDataLoaded(true);
      }
    })();
  }, []);

  // ---------- FETCH RECRUITER PROFILE (Default API) ----------
  const fetchRecruiterProfile = async () => {
    try {
      // Get recruiter ID if admin is impersonating
      const impersonatedUserId = localStorage.getItem("impersonatedUserId");
      const params = impersonatedUserId ? { 
        user_id: impersonatedUserId,
        uid: impersonatedUserId,
        recruiter_id: impersonatedUserId,
        employer_id: impersonatedUserId
      } : {};
      
      const res = await getMethod({ apiUrl: service.getRecruiterProfile, params });
      if (res?.success || res?.status) {
        // Extract user_name from response structure: data.profiles[0].personal_info.user_name
        const username = res.data?.profiles?.[0]?.personal_info?.user_name || 
                         res.data?.user_name ||
                         res.user_name ||
                         "";
        if (username) {
          setRecruiterName(username);
        }
      }
    } catch (error) {
      // Error fetching recruiter profile
    }
  };

  // ---------- API CALLS ----------
  // ----------- CACHE DURATION (optional, 30 mins) ------------
  // const CACHE_DURATION = 30 * 60 * 1000;

  // 1️⃣ FETCH DASHBOARD DATA (without cache)
  const fetchDashboardData = async () => {
    // const cached = localStorage.getItem("dashboard_stats");
    // const cachedTime = localStorage.getItem("dashboard_stats_time");

    // if (cached && cachedTime && Date.now() - cachedTime < CACHE_DURATION) {
    //   setDashboardStats(JSON.parse(cached));
    //   console.log("✅ Loaded dashboard data from cache");
    //   return;
    // }

    try {
      // Get recruiter ID if admin is impersonating
      const impersonatedUserId = localStorage.getItem("impersonatedUserId");
      const params = impersonatedUserId ? { 
        user_id: impersonatedUserId,
        uid: impersonatedUserId,
        recruiter_id: impersonatedUserId,
        employer_id: impersonatedUserId
      } : {};
      
      const res = await getMethod({ apiUrl: service.getRecruiterJobs, params });
      if (res?.status) {
        // Check multiple possible response structures for dashboard stats
        const statsData = res.dashboard_stats || res.dashboard || res.data?.dashboard_stats || res.data?.dashboard || {};
        const dataToSave = {
          jobs_posted: statsData.jobs_posted || statsData.jobs_posted_count || res.data?.length || 0,
          applied_job: statsData.applied_job || statsData.applied_count || 0,
          interview_job: statsData.interview_job || statsData.interview_scheduled || 0,
          interview_completed: statsData.interview_completed || statsData.interview_completed_count || 0,
        };
        setDashboardStats(dataToSave);
        // localStorage.setItem("dashboard_stats", JSON.stringify(dataToSave));
        // localStorage.setItem("dashboard_stats_time", Date.now());
      }
    } catch (error) {
      // Error fetching dashboard data
    }
  };

  // 2️⃣ FETCH INTERVIEW DETAILS (without cache)
  const fetchInterviewDetails = async () => {
    // const cached = localStorage.getItem("interview_details");
    // const cachedTime = localStorage.getItem("interview_details_time");

    // if (cached && cachedTime && Date.now() - cachedTime < CACHE_DURATION) {
    //   const data = JSON.parse(cached);
    //   setInterviewDetails(data.details);
    //   setInterviewDates(data.dates);
    //   console.log("✅ Loaded interview details from cache");
    //   return;
    // }

    try {
      // Get recruiter ID if admin is impersonating
      const impersonatedUserId = localStorage.getItem("impersonatedUserId");
      const params = impersonatedUserId ? { 
        user_id: impersonatedUserId,
        uid: impersonatedUserId,
        recruiter_id: impersonatedUserId,
        employer_id: impersonatedUserId
      } : {};
      
      const res = await getMethod({ apiUrl: service.getInterviewDetails, params });
      if (res?.status) {
        // Handle multiple possible response structures
        let dataArr = []
        
        if (Array.isArray(res.current_month_interviews)) {
          dataArr = res.current_month_interviews
        } else if (Array.isArray(res.candidate_interview_details)) {
          dataArr = res.candidate_interview_details
        } else if (res.candidate_interview_details && typeof res.candidate_interview_details === 'object') {
          dataArr = [res.candidate_interview_details]
        } else if (Array.isArray(res.data)) {
          dataArr = res.data
        } else if (Array.isArray(res.interviews)) {
          dataArr = res.interviews
        } else if (res.data && Array.isArray(res.data.interviews)) {
          dataArr = res.data.interviews
        } else if (res.data && Array.isArray(res.data.current_month_interviews)) {
          dataArr = res.data.current_month_interviews
        }

        setInterviewDetails(dataArr);

        // ✅ Extract dates for calendar highlighting (all months, not just current)
        const dates = dataArr
          .map((item) => {
            const interviewDate = item.scheduled_at || item.scheduled_date || item.date || item.interview_date;
            if (!interviewDate) return null;
            
            try {
              let date;
              // Handle "YYYY-MM-DD" format
              if (typeof interviewDate === 'string' && interviewDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = interviewDate.split('-').map(Number);
                date = new Date(year, month - 1, day);
              } else {
                date = new Date(interviewDate);
              }
              
              if (isNaN(date.getTime())) return null;
              return date.getDate();
            } catch {
              return null;
            }
          })
          .filter(Boolean);
        setInterviewDates(dates);

        // localStorage.setItem(
        //   "interview_details",
        //   JSON.stringify({ details: dataArr, dates })
        // );
        // localStorage.setItem("interview_details_time", Date.now());
      }
    } catch (error) {
      // Error fetching interview details
    }
  };

  // 3️⃣ FETCH WEEKLY APPLICANTS (without cache)
  const fetchWeeklyApplicants = async () => {
    // const cached = localStorage.getItem("weekly_applicants");
    // const cachedTime = localStorage.getItem("weekly_applicants_time");

    // if (cached && cachedTime && Date.now() - cachedTime < CACHE_DURATION) {
    //   const data = JSON.parse(cached);
    //   setTradesData(data.tradesData);
    //   setApplicantCards(data.applicantCards);
    //   setWeekRange(data.weekRange);
    //   console.log("✅ Loaded weekly applicants from cache");
    //   return;
    // }

    try {
      // Get recruiter ID if admin is impersonating
      const impersonatedUserId = localStorage.getItem("impersonatedUserId");
      const params = impersonatedUserId ? { 
        user_id: impersonatedUserId,
        uid: impersonatedUserId,
        recruiter_id: impersonatedUserId,
        employer_id: impersonatedUserId
      } : {};
      
      const res = await getMethod({ apiUrl: service.getWeeklyApplicants, params });
      if (res?.status) {
        const chartLabels = res.chart_data.map((item) => item.trade);
        const chartValues = res.chart_data.map(
          (item) => item.total_applications
        );

        const colors = [
          "#22c55e",
          "#f97316",
          "#3b82f6",
          "#8b5cf6",
          "#eab308",
          "#ec4899",
          "#10b981",
          "#6366f1",
          "#f59e0b",
          "#ef4444",
          "#0ea5e9",
        ];

        const tradesData = {
          labels: chartLabels,
          datasets: [
            {
              data: chartValues,
              backgroundColor: colors.slice(0, chartLabels.length),
              borderWidth: 0,
            },
          ],
        };

        const cards = res.weekly_applicants.map((item) => ({
          title: item.job_title,
          trade: item.trade,
          applications: `${item.total_applications} Applications`,
          newCount: `${item.new_applications} new`,
        }));

        const weekRange = `${res.date_range.start} - ${res.date_range.end}`;

        setTradesData(tradesData);
        setApplicantCards(cards);
        setWeekRange(weekRange);

        // localStorage.setItem(
        //   "weekly_applicants",
        //   JSON.stringify({ tradesData, applicantCards: cards, weekRange })
        // );
        // localStorage.setItem("weekly_applicants_time", Date.now());
      }
    } catch (error) {
      // Error fetching weekly applicants
    }
  };

  // 4️⃣ FETCH RECENT APPLICANTS (without cache)
  const fetchRecentApplicants = async () => {
    // const cached = localStorage.getItem("recent_applicants");
    // const cachedFull = localStorage.getItem("recent_applicants_full");
    // const cachedTime = localStorage.getItem("recent_applicants_time");

    // if (
    //   cached &&
    //   cachedFull &&
    //   cachedTime &&
    //   Date.now() - cachedTime < CACHE_DURATION
    // ) {
    //   setRecentApplicants(JSON.parse(cached));
    //   console.log("✅ Loaded recent applicants from cache");
    //   return;
    // }

    try {
      const res = await getMethod({ apiUrl: service.getRecentApplicants });

      if (res?.status) {
        // 🔹 1️⃣ Table data (simple version)
        const formatted = (res.recent_applicants || []).map((r, i) => ({
          id: i + 1,
          name: r.candidate_name || "-",
          jobTitle: r.job_title || "-",
          datePosted: r.applied_date || "-",
          status: r.status || "-",
        }));

        const detailed =
  Array.isArray(res.all_applicants?.data) &&
  res.all_applicants.data.map((a) => ({
    id: a.application_id,
    name: a.name,
    email: a.email,
    phone_number: a.phone_number || "—",
    education: a.education || "—",
    applied_for: a.applied_for || a.job_title || "—",
    job_title: a.job_title || "—",
    status: a.status || "Pending",
    verified: a.verified ? "Yes" : "No",
    location: a.location || "—",
    job_type: a.job_type || "—",
    skills: Array.isArray(a.skills)
      ? a.skills
      : typeof a.skills === "string"
      ? a.skills.split(",")
      : [],
    experience: (() => {
      try {
        return JSON.parse(a.experience || "[]");
      } catch {
        return [];
      }
    })(),
    bio: a.bio || "",
    cover_letter: a.cover_letter || "",
    portfolio_link: a.portfolio_link || "",
    resume_url: a.resume_url || "",
    applied_date: a.applied_date || "",
    social_links: (() => {
      try {
        if (Array.isArray(a.social_links)) {
          return a.social_links;
        } else if (typeof a.social_links === 'string' && a.social_links.trim() !== '') {
          const parsed = JSON.parse(a.social_links);
          return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
        }
        return [];
      } catch {
        return [];
      }
    })(),
    // Add job_id and student_id for schedule interview
    job_id: a.job_id || a.jobId || a.applied_job_id || a.job?.job_id || a.job?.id || null,
    student_id: a.student_id || a.studentId || a.user_id || a.id || a.application_id || null,
    application_id: a.application_id || null,
  }));


        // 🔹 3️⃣ Update States
        setRecentApplicants(formatted);
        setRecentApplicantsDetailed(detailed); // Store detailed data in state

        // 🔹 4️⃣ Save to Cache (commented out)
        // localStorage.setItem("recent_applicants", JSON.stringify(formatted));
        // localStorage.setItem("recent_applicants_full", JSON.stringify(detailed));
        // localStorage.setItem("recent_applicants_time", Date.now());
      } else {
        setRecentApplicants([]);
        setRecentApplicantsDetailed([]);
      }
    } catch (error) {
      setRecentApplicants([]);
      setRecentApplicantsDetailed([]);
    }
  };


  // ---------- TABLE CONFIG ----------
  const tableColumns = [
    { key: "name", header: "Name of applicants" },
    { key: "jobTitle", header: "Job Title" },
    { key: "datePosted", header: "Date of posted" },
  ];

  //  const tableActions = [
  //   {
  //     label: "View",
  //     variant: "info",
  //     onClick: (row) => {
  //       // Find detailed info for this candidate
  //       const fullData = JSON.parse(localStorage.getItem("recent_applicants_full") || "[]");
  //       const match = fullData.find(
  //         (a) => a.name === row.name && a.applied_for === row.jobTitle
  //       );
  //       if (match) {
  //         setSelectedApplicant(match);
  //         setShowApplicantModal(true);
  //       } else {
  //         alert("Detailed data not found for this applicant!");
  //       }
  //     },
  //   },
  //   // { label: "Accept", variant: "success", onClick: (row) => console.log(row) },
  //   // { label: "Decline", variant: "danger", onClick: (row) => console.log(row) },
  // ];


  // ---------- DOWNLOAD CV ----------
  const tableActions = [
    {
      label: "View",
      variant: "info",
      onClick: (row) => {
        // Use state instead of localStorage
        const match = recentApplicantsDetailed.find(
          (a) => a.name === row.name && (a.applied_for === row.jobTitle || a.job_title === row.jobTitle)
        );
        if (match) {
          handleViewDetails(match); // ✅ same popup call
        } else {
          alert("Detailed data not found for this applicant!");
        }
      },
    },
  ];


  const handleDownloadCV = (row) => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(20).text("RESUME", 20, 30);
    doc.setFontSize(16).text(row.name || "", 20, 50);
    doc.setFontSize(12).text(row.jobTitle || "", 20, 60);
    doc.save(`${row.name?.replace(" ", "_")}_Resume.pdf`);
  };

  // ---------- METRIC CARDS ----------
  const metricCardsData = [
    {
      title: "Jobs Posted",
      value: dashboardStats.jobs_posted,
      icon: <FaBriefcase />,
    },
    {
      title: "Applied Job",
      value: dashboardStats.applied_job,
      icon: <FaUsers />,
    },
    {
      title: "Interview Scheduled",
      value: dashboardStats.interview_job,
      icon: <FaCalendarAlt />,
    },
    {
      title: "Interview Completed",
      value: dashboardStats.interview_completed,
      icon: <FaCheck />,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-[var(--color-primary)]">
          {recruiterName ? `Hi! ${recruiterName}` : "Hi! Brightorial"}
        </h1>
      </div>

      {/* Metric Cards */}
      <Horizontal4Cards data={metricCardsData} className="mb-5" />
      
      {/* Empty State for Dashboard Stats */}
      {dataLoaded && 
       dashboardStats.jobs_posted === 0 && 
       dashboardStats.applied_job === 0 && 
       dashboardStats.interview_job === 0 && 
       dashboardStats.interview_completed === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-5">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaBriefcase className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                Welcome to Your Dashboard!
              </h3>
              <p className="text-sm text-blue-700">
                This recruiter account doesn't have any activity yet. Start by posting job openings to see metrics, applications, and interviews appear here.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar + Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* 📅 Calendar + Candidate Interview Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Interview Schedule
          </h3>

          {/* Responsive: Calendar first, Interview below */}
          <div className="flex flex-col gap-6">
            {/* Calendar Section */}
            <div className="w-full flex justify-center">
              <div className="w-full sm:w-[380px] md:w-[400px] lg:w-[420px] border border-gray-100 rounded-xl shadow-sm p-4">
                <Calendar
                  variant="recruiter"
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  interviewDates={interviewDates}
                  onMonthChange={(month, year) => {
                    // ✅ Update selected month/year when calendar month changes
                    console.log(`📅 Month changed to: ${month + 1}/${year}`);
                    setSelectedMonth(month);
                    setSelectedYear(year);
                    setSelectedDate(0); // Reset selected date when month changes
                  }}
                />
              </div>
            </div>

            {/* Candidate Interview Section */}
            <div className="bg-[var(--color-bg-primary)] rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 md:p-5 lg:p-6">
              <h4 className="text-base sm:text-lg md:text-xl font-semibold text-[var(--color-primary)] mb-3 sm:mb-4 text-center sm:text-left">
                Candidate Interview Details
              </h4>

              {(() => {
                // ✅ Filter interviews by selected month and year (STRICTLY)
                // Only show interviews for the currently selected month/year
                
                console.log('🔍 Filtering interviews:', {
                  totalInterviews: interviewDetails.length,
                  selectedMonth: selectedMonth,
                  selectedYear: selectedYear,
                  selectedDate: selectedDate
                });
                
                let filteredInterviews = interviewDetails.filter((item) => {
                  const interviewDate = item.scheduled_at || item.scheduled_date || item.date || item.interview_date
                  if (!interviewDate) {
                    console.log('❌ No interview date found:', item);
                    return false;
                  }
                  
                  try {
                    // Parse date - handle "2025-11-29" format (date only, no time)
                    let date;
                    if (typeof interviewDate === 'string') {
                      // Handle "YYYY-MM-DD" format (date only)
                      if (interviewDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        // Split and create date in local timezone to avoid UTC issues
                        const [year, month, day] = interviewDate.split('-').map(Number);
                        date = new Date(year, month - 1, day); // month is 0-indexed
                        console.log(`📅 Parsed date "${interviewDate}" -> Year: ${year}, Month: ${month} (0-indexed: ${month-1}), Day: ${day}`);
                      } else if (interviewDate.includes('T') || interviewDate.includes(' ')) {
                        // Full datetime string
                        date = new Date(interviewDate);
                      } else {
                        date = new Date(interviewDate);
                      }
                    } else {
                      date = new Date(interviewDate);
                    }
                    
                    if (isNaN(date.getTime())) {
                      console.log('❌ Invalid date:', interviewDate);
                      return false;
                    }
                    
                    // ✅ STRICTLY filter by month and year
                    const interviewMonth = date.getMonth(); // 0-11 (November = 10)
                    const interviewYear = date.getFullYear();
                    
                    console.log(`📊 Interview: ${interviewDate} -> Month: ${interviewMonth}, Year: ${interviewYear} | Selected: Month: ${selectedMonth}, Year: ${selectedYear}`);
                    
                    // Must match selected month AND year
                    if (interviewMonth !== selectedMonth || interviewYear !== selectedYear) {
                      console.log(`❌ Filtered out: Month mismatch (${interviewMonth} !== ${selectedMonth}) or Year mismatch (${interviewYear} !== ${selectedYear})`);
                      return false;
                    }
                    
                    console.log(`✅ Interview matches selected month/year!`);
                    
                    // If a specific date is selected, also filter by day
                    if (selectedDate && selectedDate > 0) {
                      const dayOfMonth = date.getDate();
                      const matches = dayOfMonth === selectedDate;
                      console.log(`📅 Day filter: ${dayOfMonth} === ${selectedDate}? ${matches}`);
                      return matches;
                    }
                    
                    // If no specific date selected, show all interviews for the selected month
                    return true;
                  } catch (error) {
                    console.error('❌ Error parsing date:', interviewDate, error);
                    return false;
                  }
                })
                
                console.log(`✅ Filtered result: ${filteredInterviews.length} interviews for ${selectedMonth + 1}/${selectedYear}`);

                // Format date helper
                const formatDate = (dateString) => {
                  if (!dateString) return "—"
                  try {
                    const date = new Date(dateString)
                    if (isNaN(date.getTime())) return dateString
                    return date.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                  } catch {
                    return dateString
                  }
                }

                // Format time helper
                const formatTime = (timeString) => {
                  if (!timeString) return "—"
                  try {
                    // If it's a full datetime string, extract time
                    if (timeString.includes('T') || timeString.includes(' ')) {
                      const date = new Date(timeString)
                      if (!isNaN(date.getTime())) {
                        return date.toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })
                      }
                    }
                    // If it's already in HH:MM format, return as is
                    return timeString
                  } catch {
                    return timeString
                  }
                }

                // ✅ Show "No interviews" message if no interviews for selected month
                if (filteredInterviews.length === 0) {
                  const monthNames = ["January", "February", "March", "April", "May", "June", 
                                     "July", "August", "September", "October", "November", "December"];
                  const monthName = monthNames[selectedMonth];
                  
                  return (
                    <div className="text-center py-6 sm:py-8 md:py-12 text-gray-500 flex flex-col items-center justify-center">
                      <FaCalendarAlt className="text-3xl sm:text-4xl md:text-5xl mb-3 text-gray-300" />
                      <p className="text-sm sm:text-base font-medium text-gray-700 mb-1">
                        No Interviews Scheduled
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 max-w-xs">
                        {dataLoaded 
                          ? `No interviews scheduled for ${monthName} ${selectedYear}. Change the month to view interviews for other months.`
                          : "Loading interview data..."
                        }
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-y-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px] xl:max-h-[450px] 2xl:max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-1">
                    {filteredInterviews.map((item, i) => {
                      // Extract candidate name
                      const candidateName = item.name || item.candidate_name || item.student_name || "—"
                      
                      // Extract job title from various possible fields
                      const jobTitle = item.job_title || item.jobTitle || item.job_name || item.title || "—"
                      
                      // Extract mode from various possible fields
                      const mode = item.mode || item.interview_mode || item.platform_name || "—"
                      
                      // Extract location from various possible fields
                      const location = item.location || item.interview_location || item.address || ""
                      
                      // Format mode with location if offline
                      const modeDisplay = mode.toLowerCase() === 'offline' && location 
                        ? `${mode} (${location})` 
                        : mode
                      
                      // Extract time from various possible fields
                      const time = formatTime(item.time || item.scheduled_time || item.interview_time || item.scheduled_at)
                      
                      // Format time to 12-hour format with am/pm
                      const formatTime12Hour = (timeStr) => {
                        if (!timeStr || timeStr === "—") return "—"
                        try {
                          // If already in 12-hour format, return as is
                          if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
                            return timeStr
                          }
                          // If in 24-hour format (HH:MM), convert to 12-hour
                          if (timeStr.includes(':') && timeStr.length <= 5) {
                            const [hours, minutes] = timeStr.split(':')
                            const hour = parseInt(hours)
                            const ampm = hour >= 12 ? 'PM' : 'AM'
                            const hour12 = hour % 12 || 12
                            return `${hour12}:${minutes} ${ampm.toLowerCase()}`
                          }
                          return timeStr
                        } catch {
                          return timeStr
                        }
                      }
                      const formattedTime = formatTime12Hour(time)

                      return (
                        <div
                          key={i}
                          className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-3"
                        >
                          <h5 className="text-base font-semibold text-gray-900 mb-4">
                            Candidate Interview Details
                          </h5>
                          
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Name:</span>
                              <span className="text-sm text-gray-900 ml-2">{candidateName}</span>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-700">Job Title:</span>
                              <span className="text-sm text-gray-900 ml-2">{jobTitle}</span>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-700">Mode of Interview:</span>
                              <span className="text-sm text-gray-900 ml-2">{modeDisplay}</span>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-700">Time:</span>
                              <span className="text-sm text-gray-900 ml-2">{formattedTime}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>

          </div>
        </div>


        {/* Right: Chart + Applicants */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl border border-[var(--color-primary)3C] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
              <h3 className="text-lg font-semibold text-gray-900 text-center sm:text-left">
                Total applicants this Month by trades
              </h3>
              <span className="text-sm text-gray-500 text-center sm:text-right">
                {weekRange || "—"}
              </span>
            </div>

            <div className="h-[320px]">
              {tradesData.labels.length > 0 ? (
                <Pie
                  data={tradesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: "right",
                        labels: { usePointStyle: true, color: "#374151" },
                      },
                      tooltip: {
                        callbacks: {
                          label: (ctx) =>
                            `${ctx.label}: ${ctx.parsed} applicants`,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FaUsers className="text-5xl mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    No Applicant Data Available
                  </p>
                  <p className="text-xs text-gray-500 max-w-xs text-center">
                    {dataLoaded 
                      ? "This recruiter hasn't received any applications yet. Applications will appear here once candidates start applying to your job postings."
                      : "Loading applicant data..."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Applicants Cards */}
          <div className="bg-white rounded-xl border border-[var(--color-primary)3C] p-6">
            <h3 className="text-xl font-bold text-[var(--color-primary)] mb-6">
              Total Applicants
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {applicantCards.length > 0 ? (
                applicantCards.map((card, i) => (
                  <div
                    key={i}
                    className="bg-[var(--color-bg-primary)] border border-[var(--color-primary)3C] rounded-lg p-4 min-w-[260px] flex-shrink-0"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                        <FaBriefcase className="text-gray-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-700 text-sm mb-1 truncate">
                          {card.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-1">
                          {card.trade}
                        </p>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-gray-700">
                            {card.applications.split(" ")[0]}
                          </span>
                          <span className="text-sm text-gray-500">
                            Applications
                          </span>
                        </div>
                      </div>
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                        {card.newCount}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 w-full py-12 flex flex-col items-center justify-center">
                  <FaBriefcase className="text-4xl mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    No Applicants Yet
                  </p>
                  <p className="text-xs text-gray-500 max-w-md">
                    {dataLoaded 
                      ? "This recruiter doesn't have any applicant data yet. Applicant cards will appear here once candidates apply to your job postings."
                      : "Loading applicant cards..."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applicants Table */}
      <DataTable
        title="Recent Applicants"
        columns={tableColumns}
        data={recentApplicants}
        actions={tableActions}
        onDownloadCV={handleDownloadCV}
      />

      <ViewDetailsModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModal}
        candidate={selectedCandidate}
        onDownloadCV={(candidate) => {
          const content = `
                Name: ${candidate.name}
                Email: ${candidate.email}
                Phone: ${candidate.phone_number || "Not provided"}
                Location: ${candidate.location || "—"}
                Education: ${candidate.education || "—"}
                Applied For: ${candidate.applied_for || "—"}
                Skills: ${Array.isArray(candidate.skills)
                              ? candidate.skills.join(", ")
                              : candidate.skills || "—"
                            }
                Experience: ${Array.isArray(candidate.experience)
              ? candidate.experience.join(", ")
              : candidate.experience || "—"
            }
          `;
          const blob = new Blob([content], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${candidate.name.replace(/\s+/g, "_")}_Details.txt`;
          link.click();
          URL.revokeObjectURL(url);
        }}
      />

    </div>
  );
};

export default Dashboard;
