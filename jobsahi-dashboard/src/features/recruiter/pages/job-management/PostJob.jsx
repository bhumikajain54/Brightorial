import React, { useState, useEffect } from "react";
import { LuUpload, LuCalendar } from "react-icons/lu";
import RichTextEditor from "@shared/components/RichTextEditor";
import { postMethod, getMethod } from "../../../../service/api";
import service from "../../services/serviceUrl";
import Swal from "sweetalert2";
import { Button } from "@shared/components/Button";
import { TAILWIND_COLORS } from "@shared/WebConstant";

// Helper function for user-specific localStorage keys
const getUserSpecificKey = (baseKey) => {
  try {
    const authUser = localStorage.getItem("authUser");
    if (authUser) {
      const user = JSON.parse(authUser);
      const userId = user.id || user.uid;
      const userRole = user.role;
      if (userId && userRole) {
        return `${baseKey}_${userRole}_${userId}`;
      }
    }
  } catch (error) {
    console.error('Error getting user-specific key:', error);
  }
  return baseKey;
};

const PostJob = ({ onJobSubmit }) => {
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobSector: "",
    jobSectorId: "",
    jobDescription: "",
    minSalary: "",
    maxSalary: "",
    jobType: "",
    requiredSkills: "",
    experience: "",
    location: "",
    contactPerson: "",
    phone: "",
    additionalContact: "",
    vacancyStatus: "",
    no_of_vacancies: "",
    closingDate: "",
    draftId: null, // For tracking if this is from a draft
  });

  const [errors, setErrors] = useState({});
  const [showWarning, setShowWarning] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [jobCategories, setJobCategories] = useState([]);

  // ✅ Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // ✅ Phone: only digits (max 10)
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Fetch job categories
  useEffect(() => {
    const fetchJobCategories = async () => {
      try {
        const res = await getMethod({ apiUrl: service.getJobCategory });
        if (res?.status && Array.isArray(res.categories)) {
          setJobCategories(res.categories);
        } else {
          console.error("Failed to load job categories:", res);
        }
      } catch (err) {
        console.error("❌ Error fetching job categories:", err);
      }
    };
    fetchJobCategories();
  }, []);

  const handleRichTextChange = (value) => {
    setFormData((prev) => ({ ...prev, jobDescription: value }));
  };

  // ✅ Validation function (fixed)
  const validateForm = () => {
    const newErrors = {};

    if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    if (!formData.jobSector) newErrors.jobSector = "Job sector is required";
    
    // ✅ Fix: Strip HTML tags before checking description
    const descriptionText = formData.jobDescription.replace(/<[^>]+>/g, "").trim();
    if (!descriptionText) {
      newErrors.jobDescription = "Job description is required";
    }
    
    if (!formData.minSalary.trim())
      newErrors.minSalary = "Minimum salary is required";
    if (!formData.maxSalary.trim())
      newErrors.maxSalary = "Maximum salary is required";
    if (!formData.jobType) newErrors.jobType = "Job type is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.vacancyStatus)
      newErrors.vacancyStatus = "Vacancy status is required";
    if (!formData.no_of_vacancies)
      newErrors.no_of_vacancies = "Number of vacancies is required";
    if (!formData.closingDate)
      newErrors.closingDate = "Closing date is required";

    if (formData.phone && formData.phone.length !== 10)
      newErrors.phone = "Phone number must be exactly 10 digits";

    // ✅ Salary validation (inside function)
    if (formData.minSalary && formData.maxSalary) {
      const minSalary = parseFloat(formData.minSalary);
      const maxSalary = parseFloat(formData.maxSalary);
      if (isNaN(minSalary) || isNaN(maxSalary)) {
        newErrors.minSalary = "Please enter valid salary numbers";
      } else if (minSalary >= maxSalary) {
        newErrors.maxSalary =
          "Maximum salary must be greater than minimum salary";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Save as Draft handler (saves to localStorage)
  const handleSaveDraft = (e) => {
    if (e) {
      e.preventDefault(); // Prevent form submission
      e.stopPropagation(); // Stop event bubbling
    }
    
    try {
      // Get category_id from selected category
      const selectedCategory = jobCategories.find(
        (cat) => cat.category_name === formData.jobSector
      );

      const draftData = {
        jobTitle: formData.jobTitle || "",
        jobSector: formData.jobSector || "",
        jobSectorId: selectedCategory?.id || formData.jobSectorId || "",
        category_id: selectedCategory?.id || formData.jobSectorId || "",
        category_name: formData.jobSector || "",
        jobDescription: formData.jobDescription || "",
        minSalary: formData.minSalary || "",
        maxSalary: formData.maxSalary || "",
        jobType: formData.jobType || "",
        requiredSkills: formData.requiredSkills || "",
        experience: formData.experience || "",
        location: formData.location || "",
        contactPerson: formData.contactPerson || "",
        phone: formData.phone || "",
        additionalContact: formData.additionalContact || "",
        vacancyStatus: formData.vacancyStatus || "",
        no_of_vacancies: formData.no_of_vacancies || "",
        closingDate: formData.closingDate || "",
        savedAt: new Date().toISOString(),
        isDraft: true,
      };

      const draftsKey = getUserSpecificKey('job_drafts');
      // Get existing drafts from localStorage
      const existingDrafts = JSON.parse(localStorage.getItem(draftsKey) || '[]');
      
      // Add new draft with unique ID
      const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newDraft = { ...draftData, draftId };
      
      existingDrafts.push(newDraft);
      
      // Save to localStorage
      localStorage.setItem(draftsKey, JSON.stringify(existingDrafts));
      
      // ✅ Trigger custom event to notify ManageJob to refresh
      window.dispatchEvent(new Event('draftSaved'));
      
      Swal.fire({
        title: "Draft Saved!",
        text: "Your job has been saved as draft. You can view it in Manage Job section.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to save draft. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
      });
    }
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
      return;
    }

    // ✅ Check for duplicate job name on same date
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      // Fetch existing jobs to check for duplicates
      const existingJobsRes = await getMethod({ apiUrl: service.getJobs });
      const existingJobs = Array.isArray(existingJobsRes?.data)
        ? existingJobsRes.data
        : Array.isArray(existingJobsRes?.rows)
        ? existingJobsRes.rows
        : Array.isArray(existingJobsRes?.jobs)
        ? existingJobsRes.jobs
        : [];

      // Check if job with same title exists on today's date (from API)
      const duplicateJob = existingJobs.find((job) => {
        const jobTitle = (job.title || '').trim().toLowerCase();
        const newJobTitle = (formData.jobTitle || '').trim().toLowerCase();
        
        if (jobTitle !== newJobTitle) return false;
        
        // Check job creation date
        const jobDateStr = job.created_at || job.posted_date || job.date || job.created_date || job.posted_at || job.createdAt || job.postedAt;
        if (!jobDateStr) return false;
        
        try {
          const jobDate = new Date(jobDateStr);
          jobDate.setHours(0, 0, 0, 0);
          const jobDateStrFormatted = jobDate.toISOString().split('T')[0];
          return jobDateStrFormatted === todayStr;
        } catch {
          return false;
        }
      });

      // Also check drafts in localStorage
      if (!duplicateJob) {
        const drafts = JSON.parse(localStorage.getItem('job_drafts') || '[]');
        const duplicateDraft = drafts.find((draft) => {
          const draftTitle = (draft.jobTitle || '').trim().toLowerCase();
          const newJobTitle = (formData.jobTitle || '').trim().toLowerCase();
          
          if (draftTitle !== newJobTitle) return false;
          
          // Check draft saved date
          if (!draft.savedAt) return false;
          
          try {
            const draftDate = new Date(draft.savedAt);
            draftDate.setHours(0, 0, 0, 0);
            const draftDateStrFormatted = draftDate.toISOString().split('T')[0];
            return draftDateStrFormatted === todayStr;
          } catch {
            return false;
          }
        });

        if (duplicateDraft) {
          Swal.fire({
            title: "Duplicate Job!",
            text: `A job with the name "${formData.jobTitle}" already exists today (as draft). Please create it on a different date or use a different job title.`,
            icon: "warning",
            confirmButtonText: "OK",
            confirmButtonColor: "#3085d6",
          });
          return;
        }
      }

      if (duplicateJob) {
        Swal.fire({
          title: "Duplicate Job!",
          text: `A job with the name "${formData.jobTitle}" already exists today. Please create it on a different date or use a different job title.`,
          icon: "warning",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
    } catch (err) {
      console.error("❌ Error checking for duplicate jobs:", err);
      // Continue with submission if check fails (don't block user)
    }

    // ✅ Get category_id from selected category
    const selectedCategory = jobCategories.find(
      (cat) => cat.category_name === formData.jobSector
    );

    const payload = {
      title: formData.jobTitle,
      category_id: selectedCategory?.id || formData.jobSectorId || "",
      category_name: formData.jobSector,
      description: formData.jobDescription.replace(/<[^>]+>/g, "").trim(),
      location: formData.location,
      skills_required: formData.requiredSkills,
      salary_min: parseInt(formData.minSalary),
      salary_max: parseInt(formData.maxSalary),
      job_type: formData.jobType,
      experience_required: formData.experience,
      application_deadline: formData.closingDate,
      person_name: formData.contactPerson,
      phone: formData.phone,
      additional_contact: formData.additionalContact,
      is_remote: 0,
      no_of_vacancies: parseInt(formData.no_of_vacancies || 1),
      status: formData.vacancyStatus.toLowerCase(),
    };

    try {
      const response = await postMethod({
        apiUrl: service.createJob,
        payload,
      });
      console.log("📦 [PostJob] ➜ API Response:", response);

      if (response?.status === true || response?.success === true) {
        // ✅ If this was saved from a draft, remove it from cache
        const draftId = formData.draftId;
        if (draftId) {
          const draftsKey = getUserSpecificKey('job_drafts');
          const existingDrafts = JSON.parse(localStorage.getItem(draftsKey) || '[]');
          const updatedDrafts = existingDrafts.filter(draft => draft.draftId !== draftId);
          localStorage.setItem(draftsKey, JSON.stringify(updatedDrafts));
        }
        
        // ✅ Also check if formData has draftId from localStorage match
        const draftsKey = getUserSpecificKey('job_drafts');
        const allDrafts = JSON.parse(localStorage.getItem(draftsKey) || '[]');
        const matchingDraft = allDrafts.find(draft => 
          draft.jobTitle === formData.jobTitle && 
          draft.location === formData.location &&
          draft.phone === formData.phone
        );
        if (matchingDraft && matchingDraft.draftId) {
          const updatedDrafts = allDrafts.filter(draft => draft.draftId !== matchingDraft.draftId);
          localStorage.setItem(draftsKey, JSON.stringify(updatedDrafts));
          // Trigger refresh event
          window.dispatchEvent(new Event('draftSaved'));
        }

        Swal.fire({
          title: "Success!",
          text: "Job created successfully!",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6",
        }).then(() => {
          if (onJobSubmit) onJobSubmit(response.data || formData);

          // ✅ Reset form
          setFormData({
            jobTitle: "",
            jobSector: "",
            jobSectorId: "",
            jobDescription: "",
            minSalary: "",
            maxSalary: "",
            jobType: "",
            requiredSkills: "",
            experience: "",
            location: "",
            contactPerson: "",
            phone: "",
            additionalContact: "",
            vacancyStatus: "",
            no_of_vacancies: "",
            closingDate: "",
          });
          setErrors({});
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: response?.message || "Failed to create job. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#d33",
        });
      }
    } catch (err) {
      console.error("❌ [PostJob] ➜ Network error:", err);
      Swal.fire({
        title: "Error!",
        text: "Network or API error occurred. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleCancel = () => console.log("Form cancelled");

  // ✅ Add category modal logic (fixed)
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    // ✅ Check if category already exists (case-insensitive)
    const categoryExists = jobCategories.find(
      (cat) => cat.category_name?.toLowerCase().trim() === newCategory.toLowerCase().trim()
    );
    
    if (categoryExists) {
      // ✅ Show "already exist" popup
      Swal.fire({
        title: "Category Already Exists!",
        text: `The category "${newCategory.trim()}" already exists. Please choose a different name.`,
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      });
      return; // Don't close modal, let user try again
    }
    
    // ✅ Category doesn't exist, add it
    const newCatId = Date.now();
    setJobCategories((prev) => [
      ...prev,
      { id: newCatId, category_name: newCategory.trim() },
    ]);
    setFormData((prev) => ({ 
      ...prev, 
      jobSector: newCategory.trim(),
      jobSectorId: newCatId.toString()
    }));
    
    // ✅ Show success message
    Swal.fire({
      title: "Success!",
      text: `Category "${newCategory.trim()}" added successfully.`,
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6",
      timer: 2000,
      showConfirmButton: true
    });
    
    setShowAddCategoryModal(false);
    setNewCategory("");
  };

  const handleCancelAddCategory = () => setShowAddCategoryModal(false);
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-2">
      {showWarning && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">
            Please fill in all required fields before saving!
          </span>
        </div>
      )}

      {/* HEADER */}
      

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-8">

        <div className="flex flex-col gap-5 sm:flex-row sm:justify-between items-center mb-8">
        <h1 className={`text-3xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
          Create Job Posts
        </h1>
        <div className="flex space-x-2">
          {/* <Button
            onClick={handleCancel}
            variant="light"
            size="md"
            className="rounded-full"
          >
            Cancel
          </Button> */}
          <Button
            onClick={handleSaveDraft}
            type="button"
            variant="light"
            size="md"
            className="rounded-full border border-gray-300"
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="rounded-full"
          >
            Save
          </Button>
        </div>
      </div>
        {/* BASIC INFO SECTION */}
        <div className="bg-white rounded-xl border border-[var(--color-primary)3C] p-5">
          <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-8`}>
            Basic Information
          </h2>

          <div className="space-y-8">
            {/* JOB TITLE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  JOB TITLE <span className="text-red-500">*</span>
                </label>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Add position name</p>
              </div>
              <div className="lg:col-span-2">
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent uppercase outline-none ${
                    errors.jobTitle ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter job title"
                  required
                />
                {errors.jobTitle && (
                  <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>
                )}
              </div>
            </div>

            {/* ✅ JOB SECTOR + Add Category */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  JOB SECTOR <span className="text-red-500">*</span>
                </label>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Choose category</p>
              </div>
              <div className="lg:col-span-2 flex items-center gap-3">
                <select
                  name="jobSector"
                  value={formData.jobSector}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const selectedCategory = jobCategories.find(
                      (cat) => cat.category_name === selectedName
                    );
                    setFormData((prev) => ({
                      ...prev,
                      jobSector: selectedName,
                      jobSectorId: selectedCategory?.id || "",
                    }));
                  }}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 ${
                    errors.jobSector ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">Choose Category</option>
                  {jobCategories.map((cat) => (
                    <option key={cat.id} value={cat.category_name}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={() => setShowAddCategoryModal(true)}
                  variant="primary"
                  size="sm"
                >
                  + Add
                </Button>
              </div>
              {errors.jobSector && (
                <p className="text-red-500 text-sm mt-1 ml-[33.333333%]">{errors.jobSector}</p>
              )}
            </div>

            {/* ✅ Add Category Modal */}
            {showAddCategoryModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-lg">
                  <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
                    Add New Category
                  </h3>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter new category name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-[var(--color-secondary)]"
                  />
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={handleCancelAddCategory}
                      type="button"
                      variant="light"
                      size="md"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddCategory}
                      type="button"
                      variant="primary"
                      size="md"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* JOB DESCRIPTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  JOB DESCRIPTION <span className="text-red-500">*</span>
                </label>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                  For effective candidate selection, enhance job description
                </p>
              </div>
              <div className="lg:col-span-2">
                <RichTextEditor
                  value={formData.jobDescription}
                  onChange={handleRichTextChange}
                  placeholder="Describe the job responsibilities, requirements, and benefits..."
                  height="200px"
                />
                {errors.jobDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.jobDescription}</p>
                )}
              </div>
            </div>

            {/* ✅ SALARY SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  MONTHLY SALARY <span className="text-red-500">*</span>
                </label>
               
              </div>
              <div className="lg:col-span-2 flex flex-col gap-2">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      name="minSalary"
                      value={formData.minSalary}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none ${
                        errors.minSalary ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Min Salary"
                      required
                    />
                    {errors.minSalary && (
                      <p className="text-red-500 text-sm mt-1">{errors.minSalary}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      name="maxSalary"
                      value={formData.maxSalary}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none ${
                        errors.maxSalary ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Max Salary"
                      required
                    />
                    {errors.maxSalary && (
                      <p className="text-red-500 text-sm mt-1">{errors.maxSalary}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ JOB TYPE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  JOB TYPE <span className="text-red-500">*</span>
                </label>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Choose job type</p>
              </div>
              <div className="lg:col-span-2">
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none ${
                    errors.jobType ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="">Select type</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
                {errors.jobType && (
                  <p className="text-red-500 text-sm mt-1">{errors.jobType}</p>
                )}
              </div>
            </div>

            {/* ✅ REQUIRED SKILLS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  REQUIRED SKILLS
                </label>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>List needed skills</p>
              </div>
              <div className="lg:col-span-2">
                <input
                  type="text"
                  name="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                  placeholder="e.g., React, Node.js, Python"
                />
              </div>
            </div>

            {/* ✅ EXPERIENCE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  EXPERIENCE
                </label>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Choose required experience</p>
              </div>
              <div className="lg:col-span-2">
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                  placeholder="e.g., 1-3 years, 5+ years"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ ADDRESS / LOCATION SECTION */}
        <div className="bg-white rounded-xl border border-[var(--color-primary)3C] p-5">
          <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-8`}>
            Address / Location
          </h2>

          <div className="space-y-8">
            {/* FULL ADDRESS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  JOB LOCATION<span className="text-red-500">*</span>
                </label>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Enter full location</p>
              </div>
              <div className="lg:col-span-2">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter complete address with street, area, landmark"
                  required
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ CONTACT INFO + DATES SECTION */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* CONTACT INFO */}
          <div className="bg-white rounded-xl border border-[var(--color-primary)3C] p-5 w-full lg:w-[50%]">
            <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-8`}>
              Contact Information
            </h2>

            <div className="space-y-8">
              {/* CONTACT PERSON */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    PERSON
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                    placeholder="Contact person's name"
                  />
                </div>
              </div>

              {/* PHONE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    PHONE
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Email*/}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    Email
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <input
                    type="email"
                    name="additionalContact"
                    value={formData.additionalContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                    placeholder="Alternate email"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DATES & STATUS */}
          <div className="bg-white rounded-xl border border-[var(--color-primary)3C] p-5 w-full lg:w-[50%]">
            <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-8`}>
              Dates and Status
            </h2>

            <div className="space-y-8">
              {/* VACANCY STATUS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    VACANCY STATUS<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <select
                    name="vacancyStatus"
                    value={formData.vacancyStatus}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none ${
                      errors.vacancyStatus ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  >
                    <option value="">Select status</option>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Draft">Draft</option>
                  </select>
                  {errors.vacancyStatus && (
                    <p className="text-red-500 text-sm mt-1">{errors.vacancyStatus}</p>
                  )}
                </div>
              </div>

              {/* NO OF VACANCIES */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    NUMBER OF VACANCIES<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <input
                    type="number"
                    name="no_of_vacancies"
                    value={formData.no_of_vacancies || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none ${
                      errors.no_of_vacancies ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., 2"
                    min="1"
                    required
                  />
                  {errors.no_of_vacancies && (
                    <p className="text-red-500 text-sm mt-1">{errors.no_of_vacancies}</p>
                  )}
                </div>
              </div>


              {/* Closing Date */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label className={`block text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    CLOSING DATE<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="lg:col-span-2">
                  <input
                    type="date"
                    name="closingDate"
                    value={formData.closingDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none ${
                      errors.closingDate ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.closingDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.closingDate}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
