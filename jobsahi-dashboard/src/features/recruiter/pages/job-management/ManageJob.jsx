import React, { useState, useEffect, useMemo } from "react";
import {
  LuSearch,
  LuCalendar,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuEye,
  LuUsers,
  LuMapPin,
  LuPencil,
  LuBriefcase,
} from "react-icons/lu";
import DeleteConfirmModal from "./DeleteConfirmModal";
import EditCard from "./EditCard";
import { getMethod, deleteMethod } from "../../../../service/api";
import service from "../../services/serviceUrl";
import { TAILWIND_COLORS } from "../../../../shared/WebConstant";
import { Button } from "../../../../shared/components/Button";
import DynamicButton from "../../../../shared/components/DynamicButton";

/* ============================
   HELPER FUNCTIONS
============================ */
function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, "").trim();
}

function money(x) {
  if (x == null || x === "") return "—";
  const n = Number(x);
  return isNaN(n) ? x : `₹${n.toLocaleString("en-IN")}`;
}

/* ============================
   COMPANY LOGO COMPONENT
============================ */
function CompanyLogo({ logo, companyName }) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const displayInitial = !logo || imageError;
  const initial = (companyName || 'C').charAt(0).toUpperCase();

  return (
    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
      {!displayInitial && logo ? (
        <img
          src={logo}
          alt={companyName || "Company Logo"}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <span className={`text-lg font-bold ${TAILWIND_COLORS.TEXT_MUTED}`}>
          {initial}
        </span>
      )}
    </div>
  );
}

/* ============================
   MAIN COMPONENT
============================ */
const ManageJob = ({ jobs: initialJobs = [], onEditJob, onDeleteJob, onNavigateToPostJob }) => {
  const [jobs, setJobs] = useState(initialJobs);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);

  /* ============================
     FETCH JOBS FROM API OR DUMMY
  ============================ */
  const fetchJobs = async () => {
    try {
      const res = await getMethod({ apiUrl: service.getJobs });
      console.log("📦 API Jobs Response:", res);

      const rows = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.rows)
        ? res.rows
        : Array.isArray(res?.jobs)
        ? res.jobs
        : [];

      // Use API data (no fallback dummy data)
      const dataToUse = rows;

      // ✅ Get drafts from localStorage and merge with API jobs
      const drafts = JSON.parse(localStorage.getItem('job_drafts') || '[]');
      
      const draftJobs = drafts.map(draft => ({
        ...draft,
        id: draft.draftId || draft.id,
        title: draft.jobTitle || draft.title || 'Untitled Job',
        status: 'Draft',
        isDraft: true,
        savedAt: draft.savedAt,
        company_name: 'Draft',
        salary_min: draft.minSalary || draft.salary_min || 0,
        salary_max: draft.maxSalary || draft.salary_max || 0,
        location: draft.location || '—',
        no_of_vacancies: draft.no_of_vacancies || 0,
        views: 0,
        admin_status: 'draft',
        description: draft.jobDescription || draft.description || '',
      }));

      // Combine API jobs and drafts (drafts first so they appear at top)
      const allJobs = [...draftJobs, ...dataToUse];

      setJobs(allJobs);
    } catch (err) {
      console.error("❌ Jobs load error:", err);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // ✅ Listen for storage changes to refresh drafts
  useEffect(() => {
    const handleDraftChange = () => {
      fetchJobs(); // Refresh when drafts change
    };

    // Listen to custom event for same-tab updates
    window.addEventListener('draftSaved', handleDraftChange);
    // Also listen to storage event for cross-tab updates
    window.addEventListener('storage', (e) => {
      if (e.key === 'job_drafts') {
        fetchJobs();
      }
    });

    return () => {
      window.removeEventListener('draftSaved', handleDraftChange);
    };
  }, []);

  /* ============================
     DELETE HANDLERS
  ============================ */
  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (jobToDelete?.id) {
        // ✅ If it's a draft, remove from localStorage
        if (jobToDelete.isDraft || jobToDelete.draftId) {
          const drafts = JSON.parse(localStorage.getItem('job_drafts') || '[]');
          const updatedDrafts = drafts.filter(draft => draft.draftId !== jobToDelete.draftId && draft.draftId !== jobToDelete.id);
          localStorage.setItem('job_drafts', JSON.stringify(updatedDrafts));
          // Trigger refresh event
          window.dispatchEvent(new Event('draftSaved'));
          await fetchJobs();
        } else {
          // Regular job deletion via API
          if (onDeleteJob) {
            onDeleteJob(jobToDelete.id);
          } else {
            await deleteMethod({
              apiUrl: `${service.deleteJob}?job_id=${jobToDelete.id}`,
            });
          }
          await fetchJobs();
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setShowDeleteModal(false);
      setJobToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  /* ============================
     EDIT & VIEW HANDLERS
  ============================ */
  const handleEditClick = (job) => {
    setJobToEdit(job);
    setShowEditModal(true);
  };

  const handleEditSave = async (jobId, updatedData) => {
    if (onEditJob) onEditJob(jobId, updatedData);
    await fetchJobs();
    setShowEditModal(false);
  };

  const handleEditCancel = () => setShowEditModal(false);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setLocationFilter("");
    setDateFilter("");
  };

  /* ============================
     FILTER JOBS
  ============================ */
  const filteredJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];

    let filtered = [...jobs];

    // Search filter - by job title or company name
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (job) =>
          (job.title && job.title.toLowerCase().includes(searchLower)) ||
          (job.company_name && job.company_name.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((job) => {
        // ✅ Convert backend "paused" to "draft" for filtering
        const jobStatus = job.status?.toLowerCase();
        const normalizedStatus = jobStatus === 'paused' ? 'draft' : jobStatus;
        
        // Check both status field and isDraft flag for Draft status
        if (statusFilter.toLowerCase() === 'draft') {
          return job.isDraft === true || normalizedStatus === 'draft';
        }
        return normalizedStatus === statusFilter.toLowerCase();
      });
    }

    // Location filter - check if location contains the filter value
    if (locationFilter) {
      filtered = filtered.filter(
        (job) =>
          job.location &&
          job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter((job) => {
        // Check multiple possible date fields
        const dateString = job.created_at || job.posted_date || job.date || job.created_date || job.posted_at;
        if (!dateString) {
          // For drafts, check savedAt
          if (job.isDraft && job.savedAt) {
            const draftDate = new Date(job.savedAt);
            draftDate.setHours(0, 0, 0, 0);
            
            switch (dateFilter) {
              case "today":
                return draftDate.getTime() === today.getTime();
              case "week":
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return draftDate >= weekAgo;
              case "month":
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return draftDate >= monthAgo;
              default:
                return true;
            }
          }
          return false;
        }
        
        const jobDate = new Date(dateString);
        if (isNaN(jobDate.getTime())) return false;
        
        // Reset time to start of day for accurate comparison
        jobDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case "today":
            return jobDate.getTime() === today.getTime();
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            weekAgo.setHours(0, 0, 0, 0);
            return jobDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            monthAgo.setHours(0, 0, 0, 0);
            return jobDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [jobs, searchTerm, statusFilter, locationFilter, dateFilter]);

  /* ============================
     PAGINATION
  ============================ */
  const totalItems = filteredJobs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage;
  const endItem = startItem + itemsPerPage;
  const currentJobs = filteredJobs.slice(startItem, endItem);

  // Get unique locations from jobs
  const uniqueLocations = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    const locations = new Set();
    jobs.forEach((job) => {
      if (job.location) {
        // Extract city name from location string (e.g., "Indore, Madhya Pradesh" -> "Indore")
        const city = job.location.split(',')[0].trim();
        if (city) locations.add(city);
      }
    });
    return Array.from(locations).sort();
  }, [jobs]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, locationFilter, dateFilter]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handlePrevious = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 4;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 2) {
      pages.push(1, 2, 3, 4);
    } else if (currentPage >= totalPages - 1) {
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 1; i <= currentPage + 2; i++) pages.push(i);
    }
    return pages;
  };

  /* ============================
     RENDER UI
  ============================ */
  if (loading)
    return <div className={`p-4 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Loading jobs…</div>;
  if (error)
    return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-2">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[var(--color-primary)] mb-2">
          All Jobs
        </h1>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <LuSearch
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED}`}
              size={20}
            />
            <input
              type="text"
              placeholder="Search by job title or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none ${TAILWIND_COLORS.TEXT_PRIMARY}`}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none min-w-[120px] ${TAILWIND_COLORS.TEXT_PRIMARY}`}
              >
                <option value="">Status</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Draft">Draft</option>
              </select>
              <LuChevronDown
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} pointer-events-none`}
                size={16}
              />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className={`appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none min-w-[120px] ${TAILWIND_COLORS.TEXT_PRIMARY}`}
              >
                <option value="">Location</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <LuChevronDown
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} pointer-events-none`}
                size={16}
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={`appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none min-w-[140px] ${TAILWIND_COLORS.TEXT_PRIMARY}`}
              >
                <option value="">Posted Date</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <LuCalendar
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} pointer-events-none`}
                size={16}
              />
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || statusFilter || locationFilter || dateFilter) && (
              <Button
                onClick={handleClearFilters}
                variant="unstyled"
                className={`px-4 py-2 text-sm border border-gray-300 rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY} hover:bg-gray-100 transition-colors whitespace-nowrap`}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Job Cards */}
      {jobs.length === 0 ? (
        /* Empty State - No Jobs */
        <div className={`bg-white rounded-lg border border-gray-200 p-12 text-center`}>
          <div className="max-w-md mx-auto">
            <LuBriefcase className={`w-16 h-16 ${TAILWIND_COLORS.TEXT_MUTED} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              No Jobs Yet
            </h3>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-6`}>
              Start by posting your first job to get started.
            </p>
            {onNavigateToPostJob && (
              <button
                onClick={onNavigateToPostJob}
                className={`${TAILWIND_COLORS.BTN_PRIMARY} px-6 py-2 rounded-lg text-sm font-medium`}
              >
                Post Job
              </button>
            )}
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        /* Empty State - No Results After Filtering */
        <div className={`bg-white rounded-lg border border-gray-200 p-12 text-center`}>
          <div className="max-w-md mx-auto">
            <LuSearch className={`w-12 h-12 ${TAILWIND_COLORS.TEXT_MUTED} mx-auto mb-4`} />
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              No Results Found
            </h3>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-6`}>
              Try adjusting your search or filters
            </p>
            {(searchTerm || statusFilter || locationFilter || dateFilter) && (
              <Button
                onClick={handleClearFilters}
                variant="unstyled"
                className={`px-4 py-2 text-sm border border-gray-300 rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY} hover:bg-gray-100 transition-colors`}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentJobs.map((job) => {
      const salaryDisplay =
        job.salary_min && job.salary_max
          ? `${money(job.salary_min)} – ${money(job.salary_max)}`
          : job.salary_min
          ? `${money(job.salary_min)}`
          : "—";

      const desc = stripHtml(job.description || "").slice(0, 150);

      // Format posted date
      const formatPostedDate = (job) => {
        const dateString = job.created_at || job.posted_date || job.date || job.created_date || job.posted_at || job.createdAt || job.postedAt || job.savedAt;
        if (!dateString) return "—";
        
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "—";
          return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
        } catch {
          return "—";
        }
      };

      const postedDate = formatPostedDate(job);

      // ✅ Convert backend "paused" to frontend "draft" for display
      // Backend sends "paused" but frontend shows "draft"
      const displayStatus = job.status?.toLowerCase() === "paused" 
        ? "draft" 
        : (job.status || "Open");

      return (
        <div
          key={job.id}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {/* Draft Badge */}
                {job.isDraft && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300">
                    📝 Draft
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  job.isDraft 
                    ? 'bg-gray-200 text-gray-700' 
                    : 'bg-[var(--color-secondary)] text-white'
                }`}>
                  {displayStatus}
                </span>
                <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                  {job.company_name || "—"}
                </span>

                {(() => {
                  // ✅ If it's a draft, don't show admin status
                  if (job.isDraft) {
                    return (
                      <span className="inline-block mt-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                        💾 Saved Locally
                      </span>
                    );
                  }
                  // ✅ If admin_status is null/undefined, treat as approved
                  const status = job.admin_status || "approved";
                  return (
                    <span
                      className={`inline-block mt-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                        status === "approved"
                          ? "bg-green-100 text-green-700"
                          : status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : `bg-gray-100 ${TAILWIND_COLORS.TEXT_PRIMARY}`
                      }`}
                    >
                      {status === "approved"
                        ? "✅ Approved"
                        : status === "pending"
                        ? "⏳ Pending"
                        : status}
                    </span>
                  );
                })()}
              </div>

              <h3 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                {job.title}
              </h3>

              <div className={`flex items-center gap-4 text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-3`}>
                <div className="flex items-center gap-1">
                  <LuEye size={16} />
                  <span>{job.views || 0}</span>
                </div>
                <div className="text-[var(--color-secondary)] font-medium">
                  {salaryDisplay}
                </div>
              </div>
            </div>

            <CompanyLogo
              logo={job.company_logo}
              companyName={job.company_name}
            />
          </div>

          <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-sm mb-4 line-clamp-3`}>{desc}</p>

          <div className={`flex items-center gap-2 text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-4`}>
            <LuMapPin size={16} className="text-error" />
            <span>{job.location || "—"}</span>
          </div>

          <div className={`flex items-center gap-2 text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-4`}>
            <LuCalendar size={16} className="text-blue-600" />
            <span>Posted: {postedDate}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <div className="flex items-center gap-1 bg-[var(--color-secondary)] text-white p-1 pe-2 rounded-full text-xs font-medium">
                <div className="bg-white text-[var(--color-secondary)] w-6 h-6 rounded-full flex items-center justify-center">
                  {job.no_of_vacancies ?? 0}
                </div>
                <LuUsers size={14} />
                <span> Vacancies</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleEditClick(job)}
                variant="unstyled"
                className={`p-2 ${TAILWIND_COLORS.TEXT_MUTED} hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors`}
                aria-label="Edit Job"
              >
                <LuPencil size={18} />
              </Button>
            </div>
          </div>
        </div>
      );
    })}
        </div>
      )}


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
          <div className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Showing {currentPage} of {totalPages} pages
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              variant="unstyled"
              className={`px-3 py-2 rounded-lg border border-gray-300 ${TAILWIND_COLORS.TEXT_PRIMARY} hover:bg-gray-100 disabled:opacity-50`}
              aria-label="Previous Page"
            >
              <LuChevronLeft size={16} />
            </Button>
            {getPageNumbers().map((num) => (
              <Button
                key={num}
                onClick={() => handlePageChange(num)}
                variant="unstyled"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  num === currentPage
                    ? "bg-[var(--color-primary)] text-white"
                    : `border border-gray-300 ${TAILWIND_COLORS.TEXT_PRIMARY} hover:bg-gray-100`
                }`}
              >
                {num}
              </Button>
            ))}
            <Button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              variant="unstyled"
              className={`px-3 py-2 rounded-lg border border-gray-300 ${TAILWIND_COLORS.TEXT_PRIMARY} hover:bg-gray-100 disabled:opacity-50`}
              aria-label="Next Page"
            >
              <LuChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          jobTitle={jobToDelete?.title}
        />
      )}

      {showEditModal && jobToEdit && (
        <EditCard
          isOpen={showEditModal}
          onClose={handleEditCancel}
          job={jobToEdit}
          onSave={handleEditSave}
        />
      )}

    </div>
  );
};

export default ManageJob;
