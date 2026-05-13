import React, { useState, useEffect } from "react";
import {
  LuSearch,
  LuDownload,
  LuArrowRight,
  LuMessageCircle,
  LuChevronLeft,
  LuChevronRight,
  LuFilter,
  LuChevronDown,
} from "react-icons/lu";
import CustomDataTable from "./CustomDataTable";
import ViewDetailsModal from "./ViewDetailsModal";
import { TAILWIND_COLORS } from "../../../../shared/WebConstant";
import {
  Button,
  NeutralButton,
} from "../../../../shared/components/Button";
import { getMethod } from "../../../../service/api";
import apiService from "../../services/serviceUrl";
import * as XLSX from "xlsx"; // ✅ Excel export library

const ViewApplicants = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [filterType, setFilterType] = useState("all"); // "all" or "byJob"
  const [selectedJobId, setSelectedJobId] = useState("");
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // ✅ Prevent background scroll when modal is open
  useEffect(() => {
    if (isViewModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => (document.body.style.overflow = "auto");
  }, [isViewModalOpen]);

  // ✅ Fetch applicants from API - Extracted as function to be called from outside
  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await getMethod({ apiUrl: apiService.getRecentApplicants });

      console.log("📊 API Response for Applicants:", res);

      if (res?.status && Array.isArray(res?.all_applicants?.data)) {
        const formatted = res.all_applicants.data.map((item, i) => {
          // Log first item to see structure
          if (i === 0) {
            console.log("📋 First applicant item structure:", item);
            console.log("📋 Available fields:", Object.keys(item));
          }

          // Extract job_id with multiple fallbacks
          const jobId = item.job_id || 
                       item.jobId || 
                       item.applied_job_id ||
                       (item.job && (item.job.job_id || item.job.id));

          // Extract student_id with multiple fallbacks
          const studentId = item.student_id || 
                           item.studentId || 
                           item.user_id || 
                           item.id ||
                           item.application_id;

          // Log if job_id is missing
          if (!jobId && i === 0) {
            console.warn("⚠️ job_id not found in item:", item);
          }

          return {
            id: item.application_id || i + 1,
            name: item.name || "N/A",
            email: item.email || "N/A",
            phone_number: item.phone_number || "—",
            qualification: item.education || "—",
            education: item.education || "—",
            skills: Array.isArray(item.skills)
              ? item.skills.join(", ")
              : typeof item.skills === "string"
              ? item.skills
              : "",
            bio: item.bio || "—",
            appliedFor: item.applied_for || "—",
            applied_date: item.applied_date || "—",
            status: item.status || "Pending",
            verified: item.verified ? "Yes" : "No",
            location: item.location || "—",
            experience: item.experience || "—",
            jobType: item.job_type || "Full-time",
            resume_url: item.resume_url || null,
            portfolio_link: item.portfolio_link || null,
            cover_letter: item.cover_letter || "—",
            social_links: (() => {
              try {
                if (Array.isArray(item.social_links)) {
                  return item.social_links;
                } else if (typeof item.social_links === 'string' && item.social_links.trim() !== '') {
                  const parsed = JSON.parse(item.social_links);
                  return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
                }
                return [];
              } catch {
                return [];
              }
            })(),
            // Add job_id and student_id for schedule interview
            job_id: jobId,
            student_id: studentId,
            application_id: item.application_id,
            actions: {
              view: true,
              downloadCV: true,
              delete: true,
              reject: true,
            },
          };
        });

        setApplicants(formatted);
        setFilteredApplicants(formatted);
      } else {
        setApplicants([]);
        setFilteredApplicants([]);
      }
    } catch (err) {
      console.error("❌ Error fetching applicants:", err);
      setApplicants([]);
      setFilteredApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch recruiter jobs
  const fetchRecruiterJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await getMethod({ apiUrl: apiService.getRecruiterJobs });
      console.log("📊 Recruiter Jobs API Response:", res);

      if (res?.status === true && Array.isArray(res?.data)) {
        const formattedJobs = res.data.map((job) => ({
          id: job.job_id || job.id,
          title: job.job_title || job.title || job.position || "Untitled Job",
          company: job.company_name || job.company || "—",
        }));
        setRecruiterJobs(formattedJobs);
        console.log("✅ Formatted Recruiter Jobs:", formattedJobs);
      } else {
        setRecruiterJobs([]);
      }
    } catch (err) {
      console.error("❌ Error fetching recruiter jobs:", err);
      setRecruiterJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  // ✅ Fetch recruiter jobs when filter type changes to "byJob"
  useEffect(() => {
    if (filterType === "byJob" && recruiterJobs.length === 0) {
      fetchRecruiterJobs();
    }
  }, [filterType]);

  // ✅ Fetch applicants on component mount
  useEffect(() => {
    fetchApplicants();
  }, []);

  // ✅ Filter and Search Functionality
  useEffect(() => {
    let filtered = [...applicants];

    // Apply job filter
    if (filterType === "byJob" && selectedJobId) {
      filtered = filtered.filter((app) => {
        // Match by job_id or appliedFor (job name)
        const appJobId = app.job_id?.toString();
        const selectedJobIdStr = selectedJobId.toString();
        
        // Try matching by job_id first
        if (appJobId === selectedJobIdStr) {
          return true;
        }
        
        // If no match, try matching by job name (appliedFor)
        const selectedJob = recruiterJobs.find((job) => job.id.toString() === selectedJobIdStr);
        if (selectedJob && app.appliedFor) {
          return app.appliedFor.toLowerCase().includes(selectedJob.title.toLowerCase()) ||
                 selectedJob.title.toLowerCase().includes(app.appliedFor.toLowerCase());
        }
        
        return false;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((app) =>
        [
          app.name,
          app.email,
          app.phone_number,
          app.appliedFor,
          app.qualification,
          app.skills,
        ]
          .join(" ")
          .toLowerCase()
          .includes(lowerSearch)
      );
    }

    setFilteredApplicants(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [searchTerm, applicants, filterType, selectedJobId, recruiterJobs]);

  // ✅ Export all applicants to Excel
  const handleExportAll = () => {
    if (!filteredApplicants.length) {
      alert("No applicant data to export.");
      return;
    }

    const exportData = filteredApplicants.map((app) => ({
      Name: app.name,
      Email: app.email,
      Phone: app.phone_number,
      Qualification: app.qualification,
      Skills: app.skills,
      Experience: app.experience,
      Applied_For: app.appliedFor,
      Applied_Date: app.applied_date,
      Status: app.status,
      Location: app.location,
      Job_Type: app.jobType,
      Resume_URL: app.resume_url || "—",
      Portfolio_Link: app.portfolio_link || "—",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applicants");

    XLSX.writeFile(wb, "Applicants_List.xlsx");
  };

  // ---------------- ACTIONS ----------------
  const handleViewDetails = (row) => {
    setSelectedCandidate(row);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleDownloadCV = (row) => {
    const candidateData = `
      Candidate Information
      ====================
      Name: ${row.name}
      Email: ${row.email}
      Phone: ${row.phone_number || "Not provided"}
      Location: ${row.location || "Not provided"}
      Qualification: ${row.qualification}
      Experience: ${row.experience || "Not provided"}
      Skills: ${row.skills}
      Applied For: ${row.appliedFor}
      Applied Date: ${row.applied_date || "Not provided"}
      Status: ${row.status}
    `.trim();

    const blob = new Blob([candidateData], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${row.name.replace(/\s+/g, "_")}_CV.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = (row) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${row.name}?`);
    if (confirmed) {
      setApplicants((prev) => prev.filter((a) => a.id !== row.id));
      setFilteredApplicants((prev) => prev.filter((a) => a.id !== row.id));
    }
  };

  const handleReject = (row) => {
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === row.id ? { ...a, status: "Rejected" } : a
      )
    );
    setFilteredApplicants((prev) =>
      prev.map((a) =>
        a.id === row.id ? { ...a, status: "Rejected" } : a
      )
    );
  };

  const totalRecords = filteredApplicants.length;
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
  const paginatedApplicants = filteredApplicants.slice(startIndex, endIndex);

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className={`text-2xl sm:text-3xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
          View Applicants
        </h1>

        <Button
          onClick={handleExportAll}
          variant="primary"
          size="lg"
          icon={<LuDownload size={20} />}
        >
          EXPORT ALL
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filter Type Dropdown */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                if (e.target.value === "all") {
                  setSelectedJobId("");
                }
              }}
              className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none bg-white cursor-pointer min-w-[140px]"
            >
              <option value="all">View All</option>
              <option value="byJob">By Job</option>
            </select>
            <LuChevronDown
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} pointer-events-none`}
              size={20}
            />
          </div>

          {/* Job Dropdown (shown only when "By Job" is selected) */}
          {filterType === "byJob" && (
            <div className="relative">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                disabled={loadingJobs || recruiterJobs.length === 0}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none bg-white cursor-pointer min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingJobs ? "Loading jobs..." : recruiterJobs.length === 0 ? "No jobs found" : "Select a job"}
                </option>
                {recruiterJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <LuChevronDown
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} pointer-events-none`}
                size={20}
              />
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <LuSearch
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED}`}
            size={20}
          />
          <input
            type="text"
            placeholder="Search candidates by name, email, job, or skills"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none bg-white"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="mb-6">
        <CustomDataTable
          title=""
          data={paginatedApplicants}
          showHeader={false}
          onViewDetails={handleViewDetails}
          currentPage={currentPage}
          recordsPerPage={recordsPerPage}
        />
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
          Showing {startIndex + 1}–{endIndex} of {totalRecords} applicants
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <NeutralButton
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            size="sm"
            icon={<LuChevronLeft size={16} />}
          >
            Previous
          </NeutralButton>

          {Array.from({ length: Math.ceil(totalRecords / recordsPerPage) }, (_, i) => i + 1)
            .slice(0, 4)
            .map((page) =>
              currentPage === page ? (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant="primary"
                  size="sm"
                >
                  {page}
                </Button>
              ) : (
                <NeutralButton
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  size="sm"
                >
                  {page}
                </NeutralButton>
              )
            )}

          <NeutralButton
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={endIndex >= totalRecords}
            size="sm"
            iconRight={<LuChevronRight size={16} />}
          >
            Next
          </NeutralButton>
        </div>
      </div>

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModal}
        candidate={selectedCandidate}
        onDownloadCV={handleDownloadCV}
        onInterviewScheduled={fetchApplicants}
      />
    </div>
  );
};

export default ViewApplicants;
