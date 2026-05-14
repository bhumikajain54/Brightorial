import React, { useState, useEffect } from "react";
import { LuCalendar, LuX } from "react-icons/lu";
import { getMethod, putMethod, postMethod } from "../../../../service/api";
import service from "../../services/serviceUrl";
import Swal from "sweetalert2";
import RichTextEditor from "@shared/components/RichTextEditor";
import { TAILWIND_COLORS } from "../../../../shared/WebConstant";
import { Button, IconButton } from "../../../../shared/components/Button";

const EditCard = ({ isOpen, onClose, job, onSave }) => {
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobSector: "",
    jobDescription: "",
    salaryType: "",
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

  const [errors, setErrors] = useState({});
  const [showWarning, setShowWarning] = useState(false);
  const [jobCategories, setJobCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getMethod({ apiUrl: service.getJobCategory });
        if (res?.status && Array.isArray(res.categories)) {
          setJobCategories(res.categories);
        }
      } catch (err) {
        console.error("Error fetching job categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch Job Details or Load Draft
  useEffect(() => {
    if (!isOpen || !job?.id) return;

    // ✅ If it's a draft, load directly from job object (no API call needed)
    if (job.isDraft || job.draftId) {
      setLoading(false);
      
      // ✅ Convert backend "paused" to frontend "draft" for display
      let displayStatus = job.vacancyStatus || job.status || "";
      if (displayStatus?.toLowerCase() === "paused") {
        displayStatus = "draft"; // Convert "paused" → "draft" for frontend display
      }
      
      setFormData({
        jobTitle: job.jobTitle || job.title || "",
        jobSector: job.jobSector || job.category_name || "",
        jobSectorId: job.jobSectorId || job.category_id || "",
        jobDescription: job.jobDescription || job.description || "",
        salaryType: job.salaryType || "",
        minSalary: job.minSalary || job.salary_min || "",
        maxSalary: job.maxSalary || job.salary_max || "",
        jobType: job.jobType || job.job_type || "",
        requiredSkills: job.requiredSkills || job.skills_required || "",
        experience: job.experience || job.experience_required || "",
        location: job.location || "",
        contactPerson: job.contactPerson || job.person_name || "",
        phone: job.phone || "",
        additionalContact: job.additionalContact || job.additional_contact || "",
        vacancyStatus: displayStatus, // ✅ Use converted status (paused → draft)
        no_of_vacancies: job.no_of_vacancies || "",
        closingDate: job.closingDate || job.application_deadline?.split(" ")[0] || "",
        draftId: job.draftId || job.id, // Keep draftId for reference
      });
      return;
    }

    // ✅ Regular job - fetch from API
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const res = await getMethod({
          apiUrl: `${service.getJobDetail}?id=${job.id}`,
        });

        if (res?.status && res?.data?.job_info) {
          const d = res.data.job_info;
          
          // ✅ Convert backend "paused" to frontend "draft" for display
          // Backend sends "paused" but frontend shows "draft"
          let displayStatus = d.status || "";
          if (displayStatus?.toLowerCase() === "paused") {
            displayStatus = "draft"; // Convert "paused" → "draft" for frontend display
          }
          
          setFormData({
            jobTitle: d.title || "",
            jobSector: d.category_id?.toString() || "",
            jobSectorName: d.category_name || "",
            jobDescription: d.description || "",
            salaryType: d.salary_type
              ? d.salary_type.charAt(0).toUpperCase() +
                d.salary_type.slice(1).toLowerCase()
              : "",
            minSalary: d.salary_min || "",
            maxSalary: d.salary_max || "",
            jobType: d.job_type?.toLowerCase().replace(" ", "_") || "",
            requiredSkills: Array.isArray(d.skills_required)
              ? d.skills_required.join(", ")
              : d.skills_required || "",
            experience: d.experience_required || "",
            location: d.location || "",
            contactPerson: d.person_name || "",
            phone: d.phone || "",
            additionalContact: d.additional_contact || "",
            vacancyStatus: displayStatus, // ✅ Use converted status (paused → draft)
            no_of_vacancies: d.no_of_vacancies || "",
            closingDate: d.application_deadline?.split(" ")[0] || "",
          });
          
          console.log("📥 [EditCard] ➜ Status conversion:", {
            backend: d.status,
            frontend: displayStatus,
            note: d.status?.toLowerCase() === "paused" ? "✅ Converted 'paused' → 'draft' for display" : "✅ No conversion needed"
          });
        }
      } catch (err) {
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [isOpen, job]);

  // ✅ Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRichTextChange = (value) => {
    setFormData((prev) => ({ ...prev, jobDescription: value }));
  };

  // ✅ Add category modal logic
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
      jobSector: newCatId.toString(),
      jobSectorName: newCategory.trim(),
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

  const handleCancelAddCategory = () => {
    setShowAddCategoryModal(false);
    setNewCategory("");
  };

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    if (!formData.jobSector) newErrors.jobSector = "Job sector is required";
    if (
      !formData.jobDescription ||
      formData.jobDescription.replace(/<[^>]+>/g, "").trim() === ""
    )
      newErrors.jobDescription = "Job description is required";

    if (!formData.minSalary) newErrors.minSalary = "Min salary required";
    if (!formData.maxSalary) newErrors.maxSalary = "Max salary required";
    if (!formData.jobType) newErrors.jobType = "Job type is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.vacancyStatus)
      newErrors.vacancyStatus = "Vacancy status is required";
    if (!formData.no_of_vacancies)
      newErrors.no_of_vacancies = "No. of vacancies required";
    if (!formData.closingDate)
      newErrors.closingDate = "Closing date is required";
    console.log(newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) {
  //     setShowWarning(true);
  //     setTimeout(() => setShowWarning(false), 3000);
  //     return;
  //   }

  //   const payload = {
  //     title: formData.jobTitle,
  //     category_name: formData.jobSector,
  //     description: formData.jobDescription,
  //     salary_type: formData.salaryType,
  //     salary_min: formData.minSalary,
  //     salary_max: formData.maxSalary,
  //     job_type: formData.jobType,
  //     skills_required: formData.requiredSkills,
  //     experience_required: formData.experience,
  //     location: formData.location,
  //     person_name: formData.contactPerson,
  //     phone: formData.phone,
  //     additional_contact: formData.additionalContact,
  //     status: formData.vacancyStatus,
  //     no_of_vacancies: formData.no_of_vacancies,
  //     application_deadline: formData.closingDate,
  //   };

  //   try {
  //     const res = await putMethod({
  //       apiUrl: `${service.updateJob}?id=${job.id}`,
  //       payload,
  //     });
  //     console.log(res);

  //     if (res?.status) {
  //       toast.success("🎉 Job updated successfully!", {
  //         position: "top-right",
  //         autoClose: 2000,
  //         hideProgressBar: true,
  //       });
  //       if (onSave) onSave();
  //       onClose();
  //     } else {
  //       toast.error("❌ Failed to update job!");
  //     }
  //   } catch (err) {
  //     console.error("Update error:", err);
  //     toast.error("⚠️ Network or API error!");
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🟢 [EditCard] ➜ Update Job button clicked");

    if (!validateForm()) {
      console.warn("⚠️ Validation failed:", formData);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }

    // ✅ Handle vacancy status: If "draft" is selected in frontend, send "paused" to backend
    // Backend enum has "paused" value (not "draft"), so we need to convert "draft" → "paused"
    let statusToSend = formData.vacancyStatus?.toLowerCase() || formData.vacancyStatus;
    
    // ✅ Critical: When "draft" is selected in frontend, convert it to "paused" for backend
    // Backend enum values: open, closed, paused (NOT "draft")
    if (statusToSend === "draft") {
      statusToSend = "paused"; // Convert "draft" to "paused" for backend enum
    } else if (statusToSend === "open") {
      statusToSend = "open";
    } else if (statusToSend === "closed") {
      statusToSend = "closed";
    }
    
    console.log("📋 [EditCard] ➜ Vacancy Status:", {
      original: formData.vacancyStatus,
      processed: statusToSend,
      note: formData.vacancyStatus?.toLowerCase() === "draft" ? "✅ Converted 'draft' → 'paused' for backend" : "✅ Sending as-is"
    });

    const payload = {
      title: formData.jobTitle,
      category_id: formData.jobSector,
      category_name: formData.jobSectorName,
      description: formData.jobDescription.replace(/<[^>]+>/g, "").trim(),
      salary_type: formData.salaryType,
      salary_min: formData.minSalary,
      salary_max: formData.maxSalary,
      job_type: formData.jobType,
      skills_required: formData.requiredSkills,
      experience_required: formData.experience,
      location: formData.location,
      person_name: formData.contactPerson,
      phone: formData.phone,
      additional_contact: formData.additionalContact,
      status: statusToSend, // ✅ Use processed status (draft, not paused)
      no_of_vacancies: formData.no_of_vacancies,
      application_deadline: formData.closingDate,
    };

    console.log("📦 [EditCard] ➜ Payload ready:", payload);

    try {
      // ✅ If it's a draft, create new job (POST) instead of updating
      if (job.isDraft || job.draftId || formData.draftId) {
        const draftId = formData.draftId || job.draftId || job.id;
        
        // Create new job via POST API
        const res = await postMethod({
          apiUrl: service.createJob,
          payload: {
            ...payload,
            category_id: formData.jobSectorId || formData.jobSector || payload.category_id,
          },
        });
        console.log("✅ [EditCard] ➜ Draft saved as job - API Response:", res);

        if (res?.status || res?.success) {
          // ✅ Remove draft from cache
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
          const draftsKey = getUserSpecificKey('job_drafts');
          const drafts = JSON.parse(localStorage.getItem(draftsKey) || '[]');
          const updatedDrafts = drafts.filter(d => d.draftId !== draftId);
          localStorage.setItem(draftsKey, JSON.stringify(updatedDrafts));
          // Trigger refresh event
          window.dispatchEvent(new Event('draftSaved'));

          Swal.fire({
            title: "Success!",
            text: "Draft saved as job successfully!",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#3085d6",
          }).then(() => {
            if (onSave) onSave();
            onClose();
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: res?.message || "Failed to save draft as job. Please try again.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#d33",
          });
        }
      } else {
        // ✅ Regular job - update via PUT API
        // ✅ Check if job was previously approved - if yes, set admin_action to "pending" for edit approval
        const wasApproved = job.admin_action === 'approved' || job.admin_status === 'approved';
        
        // If job was approved, add admin_action: "pending" to require admin approval for edits
        const updatePayload = wasApproved 
          ? { ...payload, admin_action: "pending" }
          : payload;
        
        console.log("📋 [EditCard] ➜ Job Edit Approval Check:", {
          jobId: job.id,
          wasApproved,
          admin_action: job.admin_action,
          admin_status: job.admin_status,
          requiresApproval: wasApproved,
          payload: updatePayload
        });

        const res = await putMethod({
          apiUrl: `${service.updateJob}?id=${job.id}`,
          payload: updatePayload,
        });
        console.log("✅ [EditCard] ➜ API Response:", res);

        if (res?.status) {
          Swal.fire({
            title: wasApproved ? "Job Updated - Pending Admin Approval" : "Success!",
            text: wasApproved 
              ? "Your job changes have been submitted. The job will be hidden from candidates until admin approves the changes."
              : "Job updated successfully!",
            icon: wasApproved ? "info" : "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#3085d6",
          }).then(() => {
            if (onSave) onSave();
            onClose();
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: res?.message || "Failed to update job. Please try again.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#d33",
          });
        }
      }
    } catch (err) {
      console.error("🚨 [EditCard] ➜ Network or API error:", err);
      Swal.fire({
        title: "Error!",
        text: "Network or API error occurred. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative z-[9999] bg-white rounded-xl max-w-6xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className={`text-2xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Edit Job Post
          </h2>
          <IconButton
            label="Close"
            onClick={onClose}
            variant="light"
            className="hover:bg-gray-100"
          >
            <LuX size={20} />
          </IconButton>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-8"
        >
          {showWarning && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              ⚠️ Please fill in all required fields!
            </div>
          )}

          {/* BASIC INFO */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className={`text-xl font-bold mb-8 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Basic Information</h2>

            {/* Job Title */}
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                JOB TITLE <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY} ${
                  errors.jobTitle ? "border-red-500" : ""
                }`}
                placeholder="Enter job title"
              />
              {errors.jobTitle && (
                <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>
              )}
            </div>

            {/* Job Sector with Add Category Button */}
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                JOB CATEGORY <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <select
                  name="jobSector"
                  value={formData.jobSectorName || ""} // ✅ use the category name instead of ID
                  onChange={(e) => {
                    const selectedName = e.target.value; // selected category name
                    const selectedCategory = jobCategories.find(
                      (cat) => cat.category_name === selectedName
                    );
                    setFormData((prev) => ({
                      ...prev,
                      jobSector: selectedCategory?.id || "", // keep id internally
                      jobSectorName: selectedName, // store name for payload
                    }));
                  }}
                  className={`flex-1 px-4 py-3 border rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY} ${
                    errors.jobSector ? "border-red-500" : ""
                  }`}
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
                <p className="text-red-500 text-sm mt-1">{errors.jobSector}</p>
              )}
            </div>

            {/* Add Category Modal */}
            {showAddCategoryModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
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
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
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

            {/* Job Description */}
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                JOB DESCRIPTION <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={formData.jobDescription}
                onChange={handleRichTextChange}
                placeholder="Describe the job responsibilities..."
                height="180px"
              />
              {errors.jobDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.jobDescription}</p>
              )}
            </div>

            {/* Salary Section */}
            <div className="mt-6">
              <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                MONTHLY SALARY <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    name="minSalary"
                    value={formData.minSalary}
                    onChange={handleInputChange}
                    placeholder="Min Salary"
                    className={`w-full border px-4 py-3 rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY} ${
                      errors.minSalary ? "border-red-500" : ""
                    }`}
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
                    placeholder="Max Salary"
                    className={`w-full border px-4 py-3 rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY} ${
                      errors.maxSalary ? "border-red-500" : ""
                    }`}
                  />
                  {errors.maxSalary && (
                    <p className="text-red-500 text-sm mt-1">{errors.maxSalary}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Job Type */}
            <div className="mt-6">
              <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                JOB TYPE <span className="text-red-500">*</span>
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY} ${
                  errors.jobType ? "border-red-500" : ""
                }`}
              >
                <option value="">Choose job type</option>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
              {errors.jobType && (
                <p className="text-red-500 text-sm mt-1">{errors.jobType}</p>
              )}
            </div>

            {/* Skills */}
            <div className="mt-6">
              <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                REQUIRED SKILLS
              </label>
              <input
                type="text"
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleInputChange}
                placeholder="e.g. JavaScript, React, Node.js"
                className={`w-full px-4 py-3 border rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY}`}
              />
            </div>

            {/* Experience */}
            <div className="mt-6">
              <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                EXPERIENCE REQUIRED
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="e.g. 2-5 years"
                className={`w-full px-4 py-3 border rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY}`}
              />
            </div>
          </div>

          {/* LOCATION */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className={`text-xl font-bold mb-8 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Address / Location</h2>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                JOB LOCATION <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY} ${
                  errors.location ? "border-red-500" : ""
                }`}
                placeholder="Enter complete address"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>
          </div>

          {/* CONTACT INFO */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className={`text-xl font-bold mb-8 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Contact Information</h2>
            <div className="mb-4">
              <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                CONTACT PERSON
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                placeholder="Enter contact person name"
              />
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                PHONE NUMBER
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                ADDITIONAL CONTACT EMAIL
              </label>
              <input
                type="email"
                name="additionalContact"
                value={formData.additionalContact}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                placeholder="Enter additional contact email"
              />
            </div>
          </div>

          {/* DATES + STATUS */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className={`text-xl font-bold mb-8 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Dates & Status</h2>

            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                NUMBER OF VACANCIES <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="no_of_vacancies"
                value={formData.no_of_vacancies}
                onChange={handleInputChange}
                placeholder="Enter number of vacancies"
                className={`w-full px-4 py-3 border rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY} ${
                  errors.no_of_vacancies ? "border-red-500" : ""
                }`}
              />
              {errors.no_of_vacancies && (
                <p className="text-red-500 text-sm mt-1">{errors.no_of_vacancies}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  CLOSING DATE <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="closingDate"
                  value={formData.closingDate}
                  onChange={handleInputChange}
                  className={`w-full border px-4 py-3 rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY} ${
                    errors.closingDate ? "border-red-500" : ""
                  }`}
                />
                {errors.closingDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.closingDate}</p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  VACANCY STATUS <span className="text-red-500">*</span>
                </label>
                <select
                  name="vacancyStatus"
                  value={formData.vacancyStatus}
                  onChange={handleInputChange}
                  className={`w-full border px-4 py-3 rounded-lg ${TAILWIND_COLORS.TEXT_PRIMARY} ${
                    errors.vacancyStatus ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Choose Status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
                {errors.vacancyStatus && (
                  <p className="text-red-500 text-sm mt-1">{errors.vacancyStatus}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-4 border-t pt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="neutral"
              size="md"
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              variant="primary"
              size="md"
              className="px-6 py-2"
              loading={loading}
              disabled={loading}
            >
              Update Job
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCard;
