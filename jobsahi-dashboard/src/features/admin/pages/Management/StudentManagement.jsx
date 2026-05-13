import React, { useMemo, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { TAILWIND_COLORS, COLORS } from "../../../../shared/WebConstant.js";
import {
  MatrixCard,
  MetricPillRow,
} from "../../../../shared/components/metricCard";
import { getMethod } from "../../../../service/api";
import apiService from "../../../admin/services/serviceUrl";
import Button, {
  DangerButton,
  PrimaryButton,
} from "../../../../shared/components/Button";
import DynamicButton from "../../../../shared/components/DynamicButton";
import CentralizedDataTable from "../../../../shared/components/CentralizedDataTable";
import {
  LuUsers,
  LuSearch,
  LuFilter,
  LuMessageSquare,
  LuPlus,
  LuEye,
  LuTrash2,
} from "react-icons/lu";
import { HiDotsVertical } from "react-icons/hi";
// KPI Card Component
function KPICard({ title, value, icon, color = COLORS.PRIMARY }) {
  return (
    <div className={`${TAILWIND_COLORS.CARD} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>
            {title}
          </p>
          <p className="text-2xl font-bold" style={{ color }}>
            {value}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// Advanced Filters Component
function AdvancedFilters({
  filters,
  onFilterChange,
  onClearAll,
  onApplyFilter,
  courseList = [],
  tradeList = [],
  skillsList = [],
}) {
  return (
    <div className="bg-white border border-[var(--color-primary)28] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <LuFilter className={TAILWIND_COLORS.TEXT_MUTED} size={20} />
        <h3 className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
          Advanced Filters
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        
        {/* TRADE FILTER - Shows Applied Jobs */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Trade
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={filters.trade || "all"}
            onChange={(e) => onFilterChange({ ...filters, trade: e.target.value })}
          >
            <option value="all">All Jobs</option>
            {tradeList.map((jobTitle, index) => (
              <option key={index} value={jobTitle}>
                {jobTitle}
              </option>
            ))}
          </select>
        </div>

        {/* COURSES FILTER */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Courses
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={filters.course || "all"}
            onChange={(e) => onFilterChange({ ...filters, course: e.target.value })}
          >
            <option value="all">All Courses</option>
            {courseList.map((c, index) => (
              <option key={index} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* PLACEMENT FILTER */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Placement Status
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={filters.placementStatus || "all"}
            onChange={(e) =>
              onFilterChange({ ...filters, placementStatus: e.target.value })
            }
          >
            <option value="all">All Status</option>
            <option value="Selected">Selected</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Applied">Applied</option>
            <option value="Not Applied">Not Applied</option>
            <option value="Placed">Placed</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* SKILLS FILTER */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Skills
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={filters.skills || "all"}
            onChange={(e) => onFilterChange({ ...filters, skills: e.target.value })}
          >
            <option value="all">All Skills</option>
            {skillsList.map((skill, index) => (
              <option key={index} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button onClick={onClearAll} variant="light" size="md">
          Clear All
        </Button>
       
      </div>
    </div>
  );
}


// Skills Tags Component
function SkillsTags({ skills }) {
  const displaySkills = skills.slice(0, 3);
  const remainingCount = skills.length - 3;

  return (
    <div className="flex flex-wrap gap-1">
      {displaySkills.map((skill, index) => (
        <span
          key={index}
          className={`px-2 py-1 text-xs rounded-full bg-blue-100 ${TAILWIND_COLORS.TEXT_PRIMARY}`}
        >
          {skill}
        </span>
      ))}
      {remainingCount > 0 && (
        <span
          className={`px-2 py-1 text-xs rounded-full bg-gray-100 ${TAILWIND_COLORS.TEXT_MUTED}`}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-green-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}

// Action Dropdown Component
function ActionDropdown({ student, onViewCV, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewCV = () => {
    setIsOpen(false);
    onViewCV(student);
  };

  const handleDelete = () => {
    setIsOpen(false);
    onDelete(student);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
      >
        <HiDotsVertical className={TAILWIND_COLORS.TEXT_MUTED} size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
          <button
            onClick={handleViewCV}
            className={`w-full px-4 py-2 text-left text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200`}
          >
            <LuEye size={16} />
            View CV
          </button>
          {/* <button
            onClick={handleDelete}
            className={`w-full px-4 py-2 text-left text-sm text-error hover:bg-red-50 flex items-center gap-2 transition-colors duration-200`}
          >
            <LuTrash2 size={16} />
            Delete
          </button> */}
        </div>
      )}
    </div>
  );
}

// View CV Modal Component
function ViewCVModal({ student, isOpen, onClose }) {
  if (!isOpen || !student) return null;

  const handleDownloadCV = () => {
    // Create a sample CV content (in real app, this would come from API)
    const cvContent = `
CANDIDATE CV

Personal Information:
Name: ${student.name}
Email: ${student.email}
Course: ${student.course}
CGPA: ${student.cgpa}
Region: ${student.region}
Progress: ${student.progress}%

Educational Details:
Highest Qualification: Graduation
College/Institute: ABC Technical Institute
Passing Year: 2023
Marks/CGPA: ${student.cgpa}

Skills:
${student.skills.map((skill) => `- ${skill}`).join("\n")}

Address Information:
City: Mumbai
State: Maharashtra
Country: India
Pin Code: 400001

Additional Information:
Preferred Job Location: Mumbai, Pune
LinkedIn/Portfolio: linkedin.com/in/${student.name
      .toLowerCase()
      .replace(" ", "")}

---
Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    // Create and download the file
    const blob = new Blob([cvContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${student.name}_Resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Show success message
    Swal.fire({
      title: "Download Started!",
      text: `${student.name}'s CV has been downloaded successfully.`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2
            className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}
          >
            Candidate CV Details
          </h2>
          <button
            onClick={onClose}
            className={`${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY} transition-colors duration-200`}
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3
              className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
            >
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Full Name
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>{student.name}</p>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Email
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>{student.email}</p>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Course
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>{student.course}</p>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  CGPA
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>{student.cgpa}</p>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Region
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>{student.region}</p>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Applied Jobs
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>
                  {student.progress}%
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3
              className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
            >
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 text-sm rounded-full bg-blue-100 ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Educational Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3
              className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
            >
              Educational Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Highest Qualification
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>Graduation</p>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  College/Institute
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>
                  ABC Technical Institute
                </p>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Passing Year
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>2023</p>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Marks/CGPA
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>{student.cgpa}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3
              className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
            >
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  City
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>Mumbai</p>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  State
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>Maharashtra</p>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Country
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>India</p>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Pin Code
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>400001</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3
              className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
            >
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  Preferred Job Location
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>Mumbai, Pune</p>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}
                >
                  LinkedIn/Portfolio
                </label>
                <p className={TAILWIND_COLORS.TEXT_PRIMARY}>
                  <a href="#" className="text-blue-600 hover:underline">
                    linkedin.com/in/
                    {student.name.toLowerCase().replace(" ", "")}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Resume/CV Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3
              className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
            >
              Resume/CV
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📄</span>
                <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                  {student.name}_Resume.pdf
                </span>
              </div>
              <PrimaryButton onClick={handleDownloadCV} size="md">
                Download CV
              </PrimaryButton>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <Button onClick={onClose} variant="neutral" size="md">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// Add Student Modal Component
function AddStudentModal({ isOpen, onClose, onAddStudent }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    cgpa: "",
    region: "",
    skills: "",
    bio: "",
    experience: "",
    graduation_year: "",
    dob: "",
    gender: "",
    job_type: "",
    linkedin: "",
    portfolio: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.course.trim()) newErrors.course = "Course is required";
    if (!formData.cgpa.trim()) newErrors.cgpa = "CGPA is required";
    else if (
      isNaN(formData.cgpa) ||
      parseFloat(formData.cgpa) < 0 ||
      parseFloat(formData.cgpa) > 10
    ) {
      newErrors.cgpa = "CGPA must be between 0 and 10";
    }
    if (!formData.region.trim()) newErrors.region = "Region is required";
    if (!formData.skills.trim()) newErrors.skills = "Skills are required";
    if (!formData.graduation_year.trim())
      newErrors.graduation_year = "Graduation year is required";
    else if (
      isNaN(formData.graduation_year) ||
      formData.graduation_year < 1990 ||
      formData.graduation_year > new Date().getFullYear() + 5
    ) {
      newErrors.graduation_year = "Please enter a valid graduation year";
    }
    if (!formData.dob.trim()) newErrors.dob = "Date of birth is required";
    if (!formData.gender.trim()) newErrors.gender = "Gender is required";
    if (!formData.job_type.trim()) newErrors.job_type = "Job type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Convert skills string to array
      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill);

      const studentData = {
        ...formData,
        skills: skillsArray,
        cgpa: parseFloat(formData.cgpa),
        graduation_year: parseInt(formData.graduation_year),
        progress: 0, // New students start with 0% progress
        admin_action: "pending", // New students need approval
      };

      await onAddStudent(studentData);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        course: "",
        cgpa: "",
        region: "",
        skills: "",
        bio: "",
        experience: "",
        graduation_year: "",
        dob: "",
        gender: "",
        job_type: "",
        linkedin: "",
        portfolio: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error adding student:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      course: "",
      cgpa: "",
      region: "",
      skills: "",
      bio: "",
      experience: "",
      graduation_year: "",
      dob: "",
      gender: "",
      job_type: "",
      linkedin: "",
      portfolio: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2
            className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}
          >
            Add New Candidate
          </h2>
          <button
            onClick={handleClose}
            className={`${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY} transition-colors duration-200`}
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div> */}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3
                className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
              >
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                  >
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dob ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.dob && (
                    <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                  >
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                  >
                    Region *
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.region ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter region/city"
                  />
                  {errors.region && (
                    <p className="text-red-500 text-xs mt-1">{errors.region}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Educational Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3
                className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
              >
                Educational Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                  >
                    Course *
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.course ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Course</option>
                    <option value="electrician">Electrician</option>
                    <option value="plumber">Plumber</option>
                    <option value="carpenter">Carpenter</option>
                    <option value="welder">Welder</option>
                    <option value="mechanic">Mechanic</option>
                    <option value="technician">Technician</option>
                  </select>
                  {errors.course && (
                    <p className="text-red-500 text-xs mt-1">{errors.course}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                  >
                    CGPA *
                  </label>
                  <input
                    type="number"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    step="0.01"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cgpa ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter CGPA (0-10)"
                  />
                  {errors.cgpa && (
                    <p className="text-red-500 text-xs mt-1">{errors.cgpa}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                  >
                    Graduation Year *
                  </label>
                  <input
                    type="number"
                    name="graduation_year"
                    value={formData.graduation_year}
                    onChange={handleInputChange}
                    min="1990"
                    max={new Date().getFullYear() + 5}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.graduation_year
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter graduation year"
                  />
                  {errors.graduation_year && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.graduation_year}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                  >
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter years of experience"
                  />
                </div>
              </div>
            </div>

            {/* Skills and Career Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3
                className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}
              >
                Skills & Career Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                  >
                    Skills *
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.skills ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter skills separated by commas (e.g., React, JavaScript, Python)"
                  />
                  {errors.skills && (
                    <p className="text-red-500 text-xs mt-1">{errors.skills}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                  >
                    Job Type *
                  </label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.job_type ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Job Type</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                  {errors.job_type && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.job_type}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                  >
                    Bio/About
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                    >
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}
                    >
                      Portfolio URL
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://portfolio-website.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <Button
              onClick={handleClose}
              variant="neutral"
              size="md"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <PrimaryButton type="submit" size="md" disabled={isSubmitting}>
              {isSubmitting ? "Adding Candidate..." : "Add Candidate"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ student, isOpen, onClose, onConfirm }) {
  if (!isOpen || !student) return null;

  const handleConfirm = () => {
    onConfirm(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <LuTrash2 className="text-red-600" size={24} />
            </div>
            <div>
              <h2
                className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}
              >
                Delete Candidate
              </h2>
              <p className={TAILWIND_COLORS.TEXT_MUTED}>
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className={TAILWIND_COLORS.TEXT_PRIMARY}>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{student.name}</span> from the
              candidate list?
            </p>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mt-2`}>
              This will permanently remove all data associated with this candidate
              including their profile, progress, and records.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button onClick={onClose} variant="neutral" size="md">
              Cancel
            </Button>
            <DangerButton onClick={handleConfirm} size="md">
              Delete Candidate
            </DangerButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// Student Table Component
function StudentTable({
  students,
  onSelectAll,
  selectedStudents,
  onSelectStudent,
  autoScrollEnabled,
  setAutoScrollEnabled,
  onViewCV,
  onDelete,
  searchTerm,
  setSearchTerm,
}) {
  const allSelected =
    selectedStudents.length === students.length && students.length > 0;

  return (
    <div className={`${TAILWIND_COLORS.CARD} p-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        {/* <div className="flex items-center gap-2">
          <LuUsers className="text-gray-600" size={20} />
          <h3 className="font-medium text-gray-800">All Student Profiles</h3>
        </div> */}

        {/* Auto Scroll Toggle */}
        {/* <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Auto Scroll</span>
          <button
            type="button"
            onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${autoScrollEnabled ? '' : 'bg-gray-200 focus:ring-gray-400'
              }`}
            style={{
              backgroundColor: autoScrollEnabled ? COLORS.GREEN_PRIMARY : undefined,
              focusRingColor: autoScrollEnabled ? COLORS.GREEN_PRIMARY : undefined
            }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${autoScrollEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div> */}

        {/* <div className="relative w-full sm:w-auto">
          <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, or candidate ID..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-80"
          />
        </div> */}
      </div>

      {/* ✅ Use CentralizedDataTable for stable UI during search */}
      <CentralizedDataTable
        title="All Candidate Profiles"
        subtitle="Manage and view candidate profiles"
        data={students}
        columns={[
          {
            key: 'name',
            header: 'Name',
            render: (value, row) => (
              <div>
                <div className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  {row.name}
                </div>
                <div className={`${TAILWIND_COLORS.TEXT_MUTED} text-xs`}>
                  {row.email}
                </div>
              </div>
            )
          },
          {
            key: 'placement_status',
            header: 'Placement',
            render: (value, row) => {
              const placementStatus = row.placement_status || "Not Applied";
              const statusMap = {
                "Not Applied": "Not Applied",
                "not_applied": "Not Applied",
                "not applied": "Not Applied",
                "Applied": "Applied",
                "applied": "Applied",
                "Shortlisted": "Shortlisted",
                "shortlisted": "Shortlisted",
                "Selected": "Selected",
                "selected": "Selected",
                "job_selected": "Selected",
                "Placed": "Placed",
                "placed": "Placed",
                "Pending": "Pending",
                "pending": "Pending",
                "Rejected": "Rejected",
                "rejected": "Rejected"
              };
              const displayStatus = statusMap[placementStatus] || placementStatus;
              return (
                <span className={`text-sm font-medium ${
                  displayStatus === "Placed" || displayStatus === "placed" 
                    ? "text-green-600" 
                    : displayStatus === "Selected" || displayStatus === "selected"
                    ? "text-purple-600"
                    : displayStatus === "Shortlisted" || displayStatus === "shortlisted"
                    ? "text-indigo-600"
                    : displayStatus === "Applied" || displayStatus === "applied"
                    ? "text-blue-600"
                    : displayStatus === "Pending" || displayStatus === "pending"
                    ? "text-orange-600"
                    : displayStatus === "Rejected" || displayStatus === "rejected"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}>
                  {displayStatus}
                </span>
              );
            }
          },
          {
            key: 'cgpa',
            header: 'CGPA',
            render: (value) => value || "No CGPA"
          },
          {
            key: 'region',
            header: 'Region',
            render: (value) => value || "No Region"
          },
          {
            key: 'skills',
            header: 'Skills',
            render: (value, row) => (
              row.skills && row.skills.length > 0 ? (
                <SkillsTags skills={row.skills} />
              ) : (
                <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                  No Skills
                </span>
              )
            )
          },
          {
            key: 'applied_jobs',
            header: 'Trade',
            render: (value, row) => (
              row.applied_jobs && row.applied_jobs.length > 0 ? (
                <span className="text-sm">
                  {row.applied_jobs
                    .map((job) => {
                      if (typeof job === 'object' && job !== null) {
                        return job.job_title || job.title || job.jobTitle || 'N/A';
                      }
                      return job;
                    })
                    .filter(title => title && title !== 'N/A')
                    .join(", ")}
                </span>
              ) : (
                <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                  No Applications
                </span>
              )
            )
          }
        ]}
        actions={[
          {
            label: 'View CV',
            variant: 'primary',
            onClick: (row) => onViewCV(row)
          }
        ]}
        searchable={true}
        selectable={true}
        showAutoScrollToggle={false}
        searchPlaceholder="Search by name, email, or candidate ID..."
        emptyStateMessage="No candidates found"
        onRowSelect={(selectedIds) => setSelectedStudents(selectedIds)}
      />
    </div>
  );
}

export default function StudentManagement() {
  const [filters, setFilters] = useState({
    trade: "all",
    course: "all",
    placementStatus: "all",
    skills: "all",
  });
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);

  const [totalStudentCount, setTotalStudentCount] = useState(0);
  const [verifiedProfileCount, setVerifiedProfileCount] = useState(0);
  const [placementReadyCount, setPlacementReadyCount] = useState(0);
  const [placedSuccessCount, setPlacedSuccessCount] = useState(0);

  const [viewCVModal, setViewCVModal] = useState({
    isOpen: false,
    student: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    student: null,
  });
  const [addStudentModal, setAddStudentModal] = useState({ isOpen: false });
  const [jobsList, setJobsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  
  // Fetch Jobs for Trade filter
  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await getMethod({
          apiUrl: apiService.getJobs,
          payload: {},
        });
        
        if (response?.status === "success" || response?.status === true || response?.success === true) {
          const jobs = response.data || response.jobs || response.rows || [];
          // Extract unique job titles
          const uniqueJobTitles = [...new Set(
            jobs
              .map((job) => job.title || job.job_title || '')
              .filter((title) => title && title.trim() !== '')
          )].sort();
          setJobsList(uniqueJobTitles);
        }
      } catch (error) {
        console.error("Jobs API Error:", error);
      }
    }
    fetchJobs();
  }, []);

  // Fetch Courses for Course filter
  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await getMethod({
          apiUrl: apiService.getCourses,
          payload: {},
        });
        
        if (response?.status === "success" || response?.status === true || response?.success === true) {
          const courses = response.courses || response.data || [];
          // Extract unique course titles
          const uniqueCourseTitles = [...new Set(
            courses
              .map((course) => course.title || course.course_name || course.name || '')
              .filter((title) => title && title.trim() !== '')
          )].sort();
          setCoursesList(uniqueCourseTitles);
        }
      } catch (error) {
        console.error("Courses API Error:", error);
      }
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    let called = false;
    // TODO: replace with ApiService
    async function fetchData() {
      if (called) return; // prevent second call
      called = true;
      try {
        var data = {
          apiUrl: apiService.studentsList,
          payload: {},
        };

        var response = await getMethod(data);
        console.log("Student API Response:", response);
        if (response.status === "success" || response.status === true) {
          // Convert response before setting
          const formatted = response.data.map((item) => ({
            id: item.user_info.user_id,
            name: item.user_info.user_name,
            email: item.user_info.email,
            phone: item.user_info.phone_number,
            profile_id: item.profile_info.profile_id,
            // ✅ Properly parse skills - handle JSON string, array, or comma-separated string
            skills: (() => {
              const skillsData = item.profile_info.skills;
              if (!skillsData) return [];
              
              // If it's already an array, return it
              if (Array.isArray(skillsData)) {
                return skillsData.filter(s => s && s.trim() !== '').map(s => s.trim());
              }
              
              // If it's a string, try to parse as JSON first
              if (typeof skillsData === 'string') {
                const trimmed = skillsData.trim();
                
                // Check if it's a JSON array string
                if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                  try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                      return parsed.filter(s => s && s.trim() !== '').map(s => String(s).trim());
                    }
                  } catch (e) {
                    // If JSON parse fails, treat as comma-separated
                  }
                }
                
                // Treat as comma-separated string
                return trimmed.split(',').map(s => s.trim()).filter(s => s !== '' && s !== '[]' && !s.startsWith('[') && !s.endsWith(']'));
              }
              
              return [];
            })(),
            education: item.profile_info.education,
            resume: item.profile_info.resume,
            certificates: item.profile_info.certificates,
            portfolio: item.profile_info.portfolio_link,
            linkedin: item.profile_info.linkedin_url,
            dob: item.profile_info.dob,
            gender: item.profile_info.gender,
            job_type: item.profile_info.job_type,
            // Extract course name - prioritize courses array, then course field, never use trade
            course: (() => {
              // First check if courses array exists and has course names
              if (item.courses && Array.isArray(item.courses) && item.courses.length > 0) {
                const courseName = item.courses[0].course_name || item.courses[0].title || item.courses[0].name;
                if (courseName && courseName.trim() !== '') {
                  return courseName.trim();
                }
              }
              // Then check profile_info.course
              if (item.profile_info.course && item.profile_info.course.trim() !== '' && item.profile_info.course.toLowerCase() !== 'no course') {
                return item.profile_info.course.trim();
              }
              // If no course found, return "No Course"
              return "No Course";
            })(),
            trade: item.profile_info.trade || "",
            region: item.profile_info.location || "No Region",
            cgpa: item.profile_info.cgpa || "No CGPA",
            // ✅ Extract placement_status from multiple possible locations in API response
            placement_status: item.placement_status || 
                             item.profile_info?.placement_status || 
                             item.profile_info?.admin_action || 
                             "Not Applied",
            admin_action: item.profile_info.admin_action,
            bio: item.profile_info.bio,
            experience: item.profile_info.experience,
            graduation_year: item.profile_info.graduation_year,
            applied_jobs: Array.isArray(item.applied_jobs)
              ? item.applied_jobs
              : item.applied_jobs
              ? [item.applied_jobs]
              : [],
            created_at: item.profile_info.created_at,
            modified_at: item.profile_info.modified_at,
            deleted_at: item.profile_info.deleted_at,
          }));

          const pendingFormatted = response.data.filter(
            (item) => item.profile_info.admin_action === "approved"
          );

          // setTotalStudentCount(response.count);
          // setVerifiedProfileCount(pendingFormatted.length);
          setStudents(formatted);
          if (response.summary) {
  setTotalStudentCount(response.summary.total_students || 0);
  setVerifiedProfileCount(response.summary.verified_profiles || 0);
  setPlacementReadyCount(response.summary.placement_ready || 0);
  setPlacedSuccessCount(response.summary.successfully_placed || 0);
}
        } else {
          Swal.fire({
            title: "Failed",
            text: response.message || "Failed to retrieve students",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Student API Error:", error);
        Swal.fire({
          title: "API Error",
          text: error.message || "Something went wrong. Please try again.",
          icon: "error",
        });
      }
    }
    fetchData();
  }, []);

  // Use jobs from API for Trade filter
  const tradeList = useMemo(() => {
    return jobsList;
  }, [jobsList]);

  // Use courses from API for Course filter
  const courseList = useMemo(() => {
    return coursesList;
  }, [coursesList]);

  const skillsList = useMemo(() => {
    const skills = new Set();
    students.forEach((student) => {
      if (Array.isArray(student.skills)) {
        student.skills.forEach((skill) => {
          const trimmed = String(skill).trim();
          // ✅ Filter out malformed entries like "[]", "[", "]", "[React", "Node.js]" etc.
          if (trimmed && 
              trimmed !== '' && 
              trimmed !== '[]' && 
              trimmed !== '[' && 
              trimmed !== ']' &&
              !trimmed.startsWith('[') && 
              !trimmed.endsWith(']') &&
              trimmed.length > 0) {
            skills.add(trimmed);
          }
        });
      } else if (typeof student.skills === 'string' && student.skills.trim() !== '') {
        student.skills.split(',').forEach((skill) => {
          const trimmed = skill.trim();
          // ✅ Filter out malformed entries
          if (trimmed && 
              trimmed !== '' && 
              trimmed !== '[]' && 
              trimmed !== '[' && 
              trimmed !== ']' &&
              !trimmed.startsWith('[') && 
              !trimmed.endsWith(']') &&
              trimmed.length > 0) {
            skills.add(trimmed);
          }
        });
      }
    });
    return Array.from(skills).sort();
  }, [students]);

  // ✅ Filter students by advanced filters only (search is handled by CentralizedDataTable)
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Trade filter (applied jobs - job titles)
      const matchesTrade =
        !filters.trade ||
        filters.trade === "all" ||
        (student.applied_jobs && Array.isArray(student.applied_jobs) && student.applied_jobs.length > 0 &&
          student.applied_jobs.some((job) => {
            const jobTitle = typeof job === 'object' && job !== null
              ? (job.job_title || job.title || job.jobTitle || '')
              : (typeof job === 'string' ? job : '');
            return jobTitle && jobTitle.toLowerCase().trim() === filters.trade.toLowerCase().trim();
          }));

      // Course filter
      const studentCourse = (student.course || '').toLowerCase().trim();
      const matchesCourse =
        !filters.course ||
        filters.course === "all" ||
        studentCourse === filters.course.toLowerCase().trim() ||
        studentCourse.includes(filters.course.toLowerCase().trim());

      // Placement Status filter
      // ✅ Normalize placement status for comparison (case-insensitive)
      const studentPlacementStatus = (student.placement_status || student.admin_action || 'Not Applied').toString().trim();
      const filterPlacementStatus = (filters.placementStatus || '').toString().trim();
      
      const matchesPlacementStatus =
        !filters.placementStatus ||
        filters.placementStatus === "all" ||
        // Case-insensitive comparison
        studentPlacementStatus.toLowerCase() === filterPlacementStatus.toLowerCase() ||
        // Handle variations
        (filterPlacementStatus === "Selected" && (studentPlacementStatus.toLowerCase() === "selected" || studentPlacementStatus.toLowerCase() === "job_selected")) ||
        (filterPlacementStatus === "Shortlisted" && studentPlacementStatus.toLowerCase() === "shortlisted") ||
        (filterPlacementStatus === "Applied" && studentPlacementStatus.toLowerCase() === "applied") ||
        (filterPlacementStatus === "Not Applied" && (studentPlacementStatus.toLowerCase() === "not applied" || studentPlacementStatus.toLowerCase() === "not_applied" || studentPlacementStatus.toLowerCase() === "pending")) ||
        (filterPlacementStatus === "Placed" && studentPlacementStatus.toLowerCase() === "placed") ||
        (filterPlacementStatus === "Rejected" && studentPlacementStatus.toLowerCase() === "rejected") ||
        (filterPlacementStatus === "Pending" && studentPlacementStatus.toLowerCase() === "pending");

      // Skills filter
      const studentSkills = Array.isArray(student.skills) 
        ? student.skills.map(s => s.toLowerCase().trim())
        : (typeof student.skills === 'string' 
          ? student.skills.split(',').map(s => s.trim().toLowerCase())
          : []);
      const matchesSkills =
        !filters.skills ||
        filters.skills === "all" ||
        studentSkills.some((skill) => skill === filters.skills.toLowerCase().trim() || skill.includes(filters.skills.toLowerCase().trim()));

      return matchesTrade && matchesCourse && matchesPlacementStatus && matchesSkills;
    });
  }, [students, filters]);

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((student) => student.id));
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearAll = () => {
    setFilters({
      trade: "all",
      course: "all",
      placementStatus: "all",
      skills: "all",
    });
  };

  const handleApplyFilter = () => {
    // Filter logic is already handled in useMemo
    console.log("Applied filters:", filters);
  };

  // Handle View CV
  const handleViewCV = (student) => {
    setViewCVModal({ isOpen: true, student });
  };

  const handleCloseViewCV = () => {
    setViewCVModal({ isOpen: false, student: null });
  };

  // Handle Delete
  const handleDelete = (student) => {
    setDeleteModal({ isOpen: true, student });
  };

  const handleCloseDelete = () => {
    setDeleteModal({ isOpen: false, student: null });
  };

  const handleConfirmDelete = (student) => {
    // Remove student from the list
    setStudents((prevStudents) =>
      prevStudents.filter((s) => s.id !== student.id)
    );

    // Show success message
    Swal.fire({
      title: "Deleted!",
      text: `${student.name} has been successfully deleted.`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Handle Add Student
  const handleAddStudent = () => {
    setAddStudentModal({ isOpen: true });
  };

  const handleCloseAddStudent = () => {
    setAddStudentModal({ isOpen: false });
  };

  const handleSubmitAddStudent = async (studentData) => {
    try {
      // TODO: Replace with actual API call
      // For now, we'll add the student to the local state
      const newStudent = {
        id: Date.now(), // Temporary ID
        ...studentData,
        email: studentData.email,
        phone: studentData.phone,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
        deleted_at: null,
      };

      // Add to students list
      setStudents((prevStudents) => [newStudent, ...prevStudents]);

      // Update counts
      setTotalStudentCount((prev) => prev + 1);
      if (studentData.admin_action === "approved") {
        setVerifiedProfileCount((prev) => prev + 1);
      }

      // Show success message
      Swal.fire({
        title: "Success!",
        text: `${studentData.name} has been successfully added to the student list.`,
        icon: "success",
        timer: 3000,
        showConfirmButton: false,
      });

      // TODO: Make API call to add student
      // const data = {
      //   apiUrl: apiService.addStudent, // You'll need to add this to your serviceUrl.js
      //   payload: studentData
      // }
      // const response = await postMethod(data)
      // if (response.status === 'success' || response.status === true) {
      //   // Handle success
      // } else {
      //   throw new Error(response.message || 'Failed to add student')
      // }
    } catch (error) {
      console.error("Error adding student:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to add student. Please try again.",
        icon: "error",
      });
      throw error; // Re-throw to let the modal handle the error state
    }
  };

  // Handle Export Data
  const handleExportData = () => {
    // Prepare data for export
    const exportData = filteredStudents.map((student) => ({
      "Candidate ID": student.id,
      Name: student.name,
      Email: student.email,
      Course: student.course,
      CGPA: student.cgpa,
      Region: student.region,
      Skills: Array.isArray(student.skills) ? student.skills.join(", ") : "",
      "Applied Jobs": Array.isArray(student.applied_jobs)
        ? student.applied_jobs.map(job => typeof job === 'object' && job !== null ? (job.job_title || job.title || 'N/A') : job).join(", ")
        : student.applied_jobs || "No Applications",
      "Application Count": Array.isArray(student.applied_jobs)
        ? student.applied_jobs.length
        : student.applied_jobs
        ? 1
        : 0,
    }));

    // Convert to CSV format
    if (exportData.length === 0) {
      Swal.fire({
        title: "No Data!",
        text: "No student records available for export.",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(","),
      ...exportData.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape commas and quotes in CSV
            return typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Student_Applied_Jobs_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Show success message
    Swal.fire({
      title: "Export Successful!",
      text: `Student data exported successfully. ${exportData.length} records downloaded.`,
      icon: "success",
      timer: 3000,
      showConfirmButton: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <MatrixCard
          title="Student Management"
          subtitle="Manage student profiles, track progress, and monitor placements."
          className=""
        />

        <div className="flex items-center justify-end gap-3">
          <MetricPillRow
            items={[
              {
                key: "export",
                label: "Export Data",
                icon: <span className="text-sm">📊</span>,
                onClick: handleExportData,
              },
              // {
              //   key: "notification",
              //   label: "Send Bulk Notification",
              //   icon: <LuMessageSquare size={16} />,
              //   onClick: () => console.log("Send Notification"),
              // },
              // {
              //   key: "add",
              //   label: "Add Student",
              //   icon: <LuPlus size={16} />,
              //   onClick: handleAddStudent,
              // },
            ]}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Students"
          value={totalStudentCount}
          icon={<LuUsers size={24} color={COLORS.PRIMARY} />}
          color={COLORS.PRIMARY}
        />
        <KPICard
          title="Verified Profiles"
          value={verifiedProfileCount}
          icon={<span className="text-2xl">✅</span>}
          color={COLORS.PRIMARY}
        />
        <KPICard
          title="Placement Ready"
          value={placementReadyCount}
          icon={<span className="text-2xl">📁</span>}
          color={COLORS.PRIMARY}
        />
        <KPICard
          title="Successfully Placed"
          value={placedSuccessCount}
          icon={<span className="text-2xl">🎯</span>}
          color={COLORS.PRIMARY}
        />
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
        onApplyFilter={handleApplyFilter}
        tradeList={tradeList}
        courseList={courseList}
        skillsList={skillsList}
      />

      {/* Student Table */}
      <StudentTable
        students={filteredStudents}
        onSelectAll={handleSelectAll}
        selectedStudents={selectedStudents}
        onSelectStudent={handleSelectStudent}
        autoScrollEnabled={autoScrollEnabled}
        setAutoScrollEnabled={setAutoScrollEnabled}
        onViewCV={handleViewCV}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        totalCount={filteredStudents.length}
      />

      {/* View CV Modal */}
      <ViewCVModal
        student={viewCVModal.student}
        isOpen={viewCVModal.isOpen}
        onClose={handleCloseViewCV}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={addStudentModal.isOpen}
        onClose={handleCloseAddStudent}
        onAddStudent={handleSubmitAddStudent}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        student={deleteModal.student}
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
