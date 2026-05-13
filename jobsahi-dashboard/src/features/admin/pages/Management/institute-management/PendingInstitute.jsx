import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LuBuilding,
  LuMail,
  LuPhone,
  LuGlobe,
  LuMapPin,
  LuUsers,
  LuCalendar,
  LuFileText,
  LuCheck,
  LuX,
  LuEye,
  LuLogIn
} from 'react-icons/lu'
import Swal from 'sweetalert2'
import { postMethod, putMethod } from '../../../../../service/api'
import apiService from '../../../../admin/services/serviceUrl'
import service from '../../../../../service/serviceUrl'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant'
import { Button } from '../../../../../shared/components/Button'

// Helper Functions
const toTitle = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "N/A");

const statusFromVerified = (v) => {
  if (v === 1 || v === "1" || v === true) return "approved";
  if (v === 0 || v === "0") return "rejected";
  return "pending";
};

// Status Badge Component
function StatusBadge({ status }) {
  const cls =
    status === "approved"
      ? "bg-green-100 text-green-800"
      : status === "rejected"
        ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800";
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${cls}`}>
      {toTitle(status)}
    </span>
  );
}

// Info Row Component
function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{label}:</span>
      <span className={TAILWIND_COLORS.TEXT_PRIMARY}>{value || "N/A"}</span>
    </div>
  );
}

// Institute Approval Card Component (Same structure as Recruiter)
function InstituteApprovalCard({ institute, onViewDetails, onApprove, onReject, is_verified, onLogin }) {
  // Normalize status
  const status = institute.status?.toLowerCase() === "approved" ? "approved" : 
                 institute.status?.toLowerCase() === "rejected" ? "rejected" : 
                 "pending";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        {/* Left Section */}
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <LuBuilding className={TAILWIND_COLORS.TEXT_MUTED} size={24} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3
                className={`text-lg font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}
              >
                {institute.institute_name || 'N/A'}
              </h3>
              <StatusBadge status={status} />
            </div>

            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-3`}>
              {institute.name || institute.user_name || 'N/A'}
            </p>

            <div className="flex flex-wrap gap-4 text-sm mb-3">
              <InfoRow
                label="Email"
                value={institute.email}
                icon={<LuMail size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
              />
              <InfoRow
                label="Phone"
                value={institute.phone}
                icon={<LuPhone size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
              />
              <InfoRow
                label="Website"
                value={institute.website}
                icon={<LuGlobe size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {institute.institute_type || 'N/A'}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <InfoRow
                label="Location"
                value={institute.location || institute.address || "N/A"}
                icon={<LuMapPin size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
              />
              {institute.established_year && (
                <InfoRow
                  label="Established"
                  value={institute.established_year}
                  icon={<LuCalendar size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-col space-y-2 ml-4 shrink-0">
          {/* LOGIN BUTTON */}
          <Button
            onClick={onLogin}
            variant="primary"
            size="sm"
            icon={<LuLogIn size={16} />}
            className="!bg-blue-600 text-white hover:!bg-blue-700"
          >
            Login
          </Button>

          {/* REVIEW BUTTON */}
          <Button
            onClick={onViewDetails}
            variant="light"
            size="sm"
            icon={<LuEye size={16} />}
          >
            Review
          </Button>

          {/* APPROVE BUTTON */}
          <Button
            onClick={onApprove}
            variant="success"
            size="sm"
            icon={<LuCheck size={16} />}
            className={
              is_verified === 1
                ? "opacity-30 cursor-not-allowed !bg-gray-400"
                : "!bg-green-600 text-white hover:!bg-green-700"
            }
            disabled={is_verified === 1}
          >
            Approve
          </Button>

          {/* REJECT BUTTON */}
          <Button
            onClick={onReject}
            variant="danger"
            size="sm"
            icon={<LuX size={16} />}
            className={
              status === "rejected"
                ? "opacity-50 cursor-not-allowed"
                : "!bg-red-500 text-white"
            }
            disabled={status === "rejected"}
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

// View Details Modal Component
function ViewDetailsModal({ institute, isOpen, onClose }) {
  if (!isOpen || !institute) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[98vh] sm:max-h-[95vh] md:max-h-[90vh] overflow-y-auto my-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between z-10 shadow-sm">
          <h2 className={`text-base sm:text-lg md:text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} truncate pr-2`}>Institute Details</h2>
          <button
            onClick={onClose}
            className={`${TAILWIND_COLORS.TEXT_MUTED} hover:text-gray-600 transition-colors duration-200 p-1 flex-shrink-0`}
            aria-label="Close"
          >
            <span className="text-xl sm:text-2xl md:text-3xl">&times;</span>
          </button>
        </div>

        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Institute Information */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h3 className={`text-sm sm:text-base md:text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2 sm:mb-3 md:mb-4 flex items-center gap-2`}>
              <LuBuilding className="text-blue-600 flex-shrink-0" size={16} />
              <span>Skill Partner Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="min-w-0">
                <label className={`block text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Skill Partner Name</label>
                <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} font-medium text-sm sm:text-base break-words`}>{institute.institute_name || 'N/A'}</p>
              </div>
              <div className="min-w-0">
                <label className={`block text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Email Address</label>
                <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2 text-sm sm:text-base`}>
                  <LuMail size={14} className="text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${institute.email}`} className="text-blue-600 hover:underline break-all">
                    {institute.email || 'N/A'}
                  </a>
                </p>
              </div>
              <div className="min-w-0">
                <label className={`block text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Skill Partner Type</label>
                <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-sm sm:text-base`}>{institute.institute_type || 'N/A'}</p>
              </div>
              <div className="min-w-0">
                <label className={`block text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Established Year</label>
                <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2 text-sm sm:text-base`}>
                  <LuCalendar size={14} className="text-gray-400 flex-shrink-0" />
                  {institute.established_year || 'N/A'}
                </p>
              </div>
              <div className="min-w-0 sm:col-span-2">
                <label className={`block text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Courses Offered</label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                  {Array.isArray(institute.courses) && institute.courses.length > 0 ? (
                    institute.courses.map((course, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 sm:py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                      >
                        {course.title || course.course_name || course.name || 'Course'}
                      </span>
                    ))
                  ) : Array.isArray(institute.courses_offered) && institute.courses_offered.length > 0 ? (
                    institute.courses_offered.map((course, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 sm:py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                      >
                        {course}
                      </span>
                    ))
                  ) : (
                    <span className={`${TAILWIND_COLORS.TEXT_MUTED} text-xs sm:text-sm`}>N/A</span>
                  )}
                </div>
              </div>
              <div className="min-w-0 sm:col-span-2">
                <label className={`block text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Accreditation</label>
                <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-sm sm:text-base break-words`}>
                  {Array.isArray(institute.accreditation) && institute.accreditation.length > 0
                    ? institute.accreditation.join(', ')
                    : institute.accreditation || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h3 className={`text-sm sm:text-base md:text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2 sm:mb-3 md:mb-4 flex items-center gap-2`}>
              <LuFileText className="text-green-600 flex-shrink-0" size={16} />
              <span>Additional Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="min-w-0">
                <label className={`block text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Phone Number</label>
                <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2 text-sm sm:text-base`}>
                  <LuPhone size={14} className="text-gray-400 flex-shrink-0" />
                  <a href={`tel:${institute.phone}`} className="text-blue-600 hover:underline break-all">
                    {institute.phone || 'N/A'}
                  </a>
                </p>
              </div>
              <div className="min-w-0">
                <label className={`block text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Website</label>
                <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} flex items-center gap-2 text-sm sm:text-base`}>
                  <LuGlobe size={14} className="text-gray-400 flex-shrink-0" />
                  {institute.website ? (
                    <a href={institute.website.startsWith('http') ? institute.website : `https://${institute.website}`} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline break-all">
                      {institute.website}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
              <div className="min-w-0">
                <label className={`block text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Contact Person</label>
                <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-sm sm:text-base break-words`}>{institute.contact_person || 'N/A'}</p>
              </div>
              <div className="min-w-0">
                <label className={`block text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Contact Designation</label>
                <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-sm sm:text-base break-words`}>{institute.contact_designation || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h3 className={`text-sm sm:text-base md:text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2 sm:mb-3 md:mb-4 flex items-center gap-2`}>
              <LuMapPin className="text-blue-600 flex-shrink-0" size={16} />
              <span>Address Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="min-w-0">
                <label className={`block text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Address</label>
                <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-sm sm:text-base break-words`}>{institute.address || 'N/A'}</p>
              </div>
              <div className="min-w-0">
                <label className={`block text-xs sm:text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Postal Code</label>
                <p className={`${TAILWIND_COLORS.TEXT_PRIMARY} text-sm sm:text-base`}>{institute.postal_code || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Institute Description */}
          {institute.description && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h3 className={`text-sm sm:text-base md:text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2 sm:mb-3 md:mb-4`}>Institute Description</h3>
              <p className={`${TAILWIND_COLORS.TEXT_MUTED} text-xs sm:text-sm md:text-base leading-relaxed break-words`}>
                {institute.description}
              </p>
            </div>
          )}

        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex justify-end shadow-sm">
          <Button
            onClick={onClose}
            variant="neutral"
            size="md"
            className="px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base w-full sm:w-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PendingInstituteApprovals({ institutes: initialInstitutes }) {
  const [viewDetailsModal, setViewDetailsModal] = useState({ isOpen: false, institute: null })
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'pending', 'approved', 'rejected'
  const [institutes, setInstitutes] = useState(initialInstitutes)

  // Update state when prop changes
  useEffect(() => {
    setInstitutes(initialInstitutes)
  }, [initialInstitutes])

  const handleViewDetails = (institute) => {
    setViewDetailsModal({ isOpen: true, institute })
  }

  const handleCloseViewDetails = () => {
    setViewDetailsModal({ isOpen: false, institute: null })
  }

  const handleApprove = async (instituteId) => {
    console.log('🚀 handleApprove called with instituteId:', instituteId);
    Swal.fire({
      title: 'Approve Institute',
      text: 'Are you sure you want to approve this institute?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Approve!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      console.log('✅ SweetAlert result:', result.isConfirmed);
      if (result.isConfirmed) {
        try {
          console.log('🔍 Searching for institute to approve:', {
            instituteId,
            instituteId_type: typeof instituteId,
            institutes_count: institutes.length,
            first_institute_sample: institutes[0] ? {
              has_institute_id: 'institute_id' in institutes[0],
              institute_id_value: institutes[0].institute_id,
              has_profile_info: 'profile_info' in institutes[0],
              profile_info_institute_id: institutes[0].profile_info?.institute_id,
              all_keys: Object.keys(institutes[0])
            } : 'no institutes'
          });

          // ✅ Find the institute - handle both raw API data structure and formatted structure
          // Also handle type coercion (number vs string)
          const institute = institutes.find(inst => {
            // Check formatted structure first (with type coercion)
            if (String(inst.institute_id) === String(instituteId) || inst.institute_id === instituteId) return true;
            // Check raw API data structure (with type coercion)
            const profileInstId = inst.profile_info?.institute_id;
            if (profileInstId && (String(profileInstId) === String(instituteId) || profileInstId === instituteId)) return true;
            return false;
          });
          
          if (!institute) {
            console.error('❌ Institute not found for approval:', {
              instituteId,
              instituteId_type: typeof instituteId,
              institutes_count: institutes.length,
              all_institute_ids: institutes.map(inst => ({
                formatted_id: inst.institute_id,
                raw_id: inst.profile_info?.institute_id,
                user_id: inst.id || inst.user_info?.user_id
              }))
            });
            Swal.fire({
              title: "Error",
              text: "Institute not found",
              icon: "error"
            });
            return;
          }

          // ✅ Extract user_id from both structures
          const userId = institute.id || 
                        institute.user_info?.user_id || 
                        institute.user_id;
          
          if (!userId) {
            console.error('❌ User ID not found:', institute);
            Swal.fire({
              title: "Error",
              text: "User ID not found for this institute",
              icon: "error"
            });
            return;
          }

          console.log('✅ Approving institute:', {
            instituteId,
            userId,
            institute_name: institute.institute_name || institute.profile_info?.institute_name
          });

          // Call verifyUser API with is_verified: 1 for approve
          var data = {
            apiUrl: service.verifyUser,
            payload: {
              uid: userId, // user_id
              is_verified: 1  // 1 for approve, 0 for reject
            },
          };

          console.log('📡 Making API call to verifyUser:', {
            apiUrl: service.verifyUser,
            fullUrl: service.verifyUser,
            payload: data.payload,
            data_object: data
          });

          var response = await postMethod(data);
          console.log('📥 Approve API Response:', response)
          
          if (response.status === true || response.success === true) {
            // ✅ Update state - handle both raw and formatted structures
            setInstitutes(prevInstitutes => 
              prevInstitutes.map(inst => {
                const instId = inst.institute_id || inst.profile_info?.institute_id;
                if (instId === instituteId) {
                  // Update raw API structure
                  if (inst.user_info) {
                    return {
                      ...inst,
                      user_info: {
                        ...inst.user_info,
                        is_verified: 1
                      },
                      profile_info: {
                        ...inst.profile_info,
                        admin_action: 'approved'
                      }
                    };
                  }
                  // Update formatted structure
                  return {
                    ...inst,
                    status: 'approved',
                    admin_action: 'approved',
                    is_verified: 1
                  };
                }
                return inst;
              })
            );
            
            Swal.fire({
              title: 'Approved!',
              text: 'Institute has been approved successfully.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              title: "Failed",
              text: response.message || "Failed to approve institute",
              icon: "error"
            });
          }
        } catch (error) {
          console.error("API Error:", error)
          Swal.fire({
            title: "API Error",
            text: error.message || "Something went wrong. Please try again.",
            icon: "error"
          });
        }
      }
    })
  }

  const handleReject = async (instituteId) => {
    Swal.fire({
      title: 'Reject Institute',
      text: 'Are you sure you want to reject this institute?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Reject!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log('🔍 Searching for institute to reject:', {
            instituteId,
            instituteId_type: typeof instituteId,
            institutes_count: institutes.length
          });

          // ✅ Find the institute - handle both raw API data structure and formatted structure
          // Also handle type coercion (number vs string)
          const institute = institutes.find(inst => {
            // Check formatted structure first (with type coercion)
            if (String(inst.institute_id) === String(instituteId) || inst.institute_id === instituteId) return true;
            // Check raw API data structure (with type coercion)
            const profileInstId = inst.profile_info?.institute_id;
            if (profileInstId && (String(profileInstId) === String(instituteId) || profileInstId === instituteId)) return true;
            return false;
          });
          
          if (!institute) {
            console.error('❌ Institute not found for rejection:', {
              instituteId,
              instituteId_type: typeof instituteId,
              institutes_count: institutes.length,
              all_institute_ids: institutes.map(inst => ({
                formatted_id: inst.institute_id,
                raw_id: inst.profile_info?.institute_id,
                user_id: inst.id || inst.user_info?.user_id
              }))
            });
            Swal.fire({
              title: "Error",
              text: "Institute not found",
              icon: "error"
            });
            return;
          }

          // ✅ Extract user_id from both structures
          const userId = institute.id || 
                        institute.user_info?.user_id || 
                        institute.user_id;
          
          if (!userId) {
            console.error('❌ User ID not found:', institute);
            Swal.fire({
              title: "Error",
              text: "User ID not found for this institute",
              icon: "error"
            });
            return;
          }

          console.log('✅ Rejecting institute:', {
            instituteId,
            userId,
            institute_name: institute.institute_name || institute.profile_info?.institute_name
          });

          // Call verifyUser API with is_verified: 0 for reject
          var data = {
            apiUrl: service.verifyUser,
            payload: {
              uid: userId, // user_id
              is_verified: 0  // 1 for approve, 0 for reject
            },
          };

          console.log('📡 Making API call to verifyUser (Reject):', {
            apiUrl: service.verifyUser,
            fullUrl: service.verifyUser,
            payload: data.payload,
            data_object: data
          });

          var response = await postMethod(data);
          console.log('📥 Reject API Response:', response)
          
          if (response.status === true || response.success === true) {
            // ✅ Update state - handle both raw and formatted structures
            setInstitutes(prevInstitutes => 
              prevInstitutes.map(inst => {
                const instId = inst.institute_id || inst.profile_info?.institute_id;
                if (instId === instituteId) {
                  // Update raw API structure
                  if (inst.user_info) {
                    return {
                      ...inst,
                      user_info: {
                        ...inst.user_info,
                        is_verified: 0
                      },
                      profile_info: {
                        ...inst.profile_info,
                        admin_action: 'rejected'
                      }
                    };
                  }
                  // Update formatted structure
                  return {
                    ...inst,
                    status: 'rejected',
                    admin_action: 'rejected',
                    is_verified: 0
                  };
                }
                return inst;
              })
            );
            
            Swal.fire({
              title: 'Rejected!',
              text: 'Institute has been rejected.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              title: "Failed",
              text: response.message || "Failed to reject institute",
              icon: "error"
            });
          }
        } catch (error) {
          console.error("API Error:", error)
          Swal.fire({
            title: "API Error",
            text: error.message || "Something went wrong. Please try again.",
            icon: "error"
          });
        }
      }
    })
  }

  // ✅ Admin Login as Institute/Skill Partner
  const handleLoginAsInstitute = async (institute) => {
    try {
      Swal.fire({
        title: 'Login as Skill Partner?',
        text: `You will be logged in as ${institute.institute_name || institute.name}. You can return to admin panel later.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Login',
        cancelButtonText: 'Cancel'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // Store current admin session for returning
            const currentAdminToken = localStorage.getItem("authToken");
            const currentAdminUser = localStorage.getItem("authUser");
            
            if (currentAdminToken && currentAdminUser) {
              localStorage.setItem("adminSessionToken", currentAdminToken);
              localStorage.setItem("adminSessionUser", currentAdminUser);
            }

            // Create user object for institute
            const instituteUser = {
              id: institute.id || institute.institute_id,
              user_name: institute.name || institute.user_name,
              email: institute.email,
              role: "institute",
              phone: institute.phone,
            };

            // Generate a temporary token (or call API if available)
            // For now, we'll create a simple token-like string
            // In production, you should call an admin API endpoint to get a valid token
            const tempToken = `admin_impersonate_${institute.id || institute.institute_id}_${Date.now()}`;

            // Set institute's session
            localStorage.setItem("authToken", tempToken);
            localStorage.setItem("authUser", JSON.stringify(instituteUser));
            localStorage.setItem("isAdminImpersonating", "true");

            Swal.fire({
              title: 'Success!',
              text: `Logged in as ${institute.institute_name || institute.name}`,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              // Redirect to institute dashboard
              navigate("/institute/dashboard");
            });
          } catch (error) {
            console.error("Error logging in as institute:", error);
            Swal.fire({
              title: "Error",
              text: "Failed to login as skill partner. Please try again.",
              icon: "error"
            });
          }
        }
      });
    } catch (error) {
      console.error("Error in handleLoginAsInstitute:", error);
    }
  };

  // Format institutes data
  const formattedInstitutes = institutes.map((item, index) => {
    // ✅ Handle both raw API data structure and formatted data structure
    const userInfo = item.user_info || {};
    const profileInfo = item.profile_info || {};
    
    // ✅ Extract is_verified from multiple possible locations
    const isVerifiedRaw = item.is_verified ?? 
      userInfo.is_verified ??
      item.user?.is_verified ??
      profileInfo.is_verified ??
      0;
    
    // Convert to number (handle "1", 1, "0", 0, null, undefined)
    const is_verified = isVerifiedRaw === 1 || isVerifiedRaw === "1" || isVerifiedRaw === true ? 1 : 0;
    
    // ✅ IMPORTANT: Status is determined ONLY by is_verified field
    // is_verified === 1 → "approved"
    // is_verified === 0 → "pending"
    let normalizedStatus;
    if (is_verified === 1) {
      normalizedStatus = 'APPROVED';
    } else {
      normalizedStatus = 'PENDING REVIEW';
    }
    
    // ✅ Extract data from both raw API structure and formatted structure
    const userName = item.name || item.user_name || userInfo.user_name || 'N/A';
    const email = item.email || userInfo.email || 'N/A';
    const phone = item.phone || item.phone_number || userInfo.phone_number || 'N/A';
    const instituteId = item.institute_id || profileInfo.institute_id;
    const instituteName = item.institute_name || profileInfo.institute_name || 'N/A';
    const instituteType = item.institute_type || profileInfo.institute_type || 'N/A';
    const website = item.website || profileInfo.website || null;
    const description = item.description || profileInfo.description || null;
    const address = item.address || profileInfo.address || null;
    const city = item.city || profileInfo.city || null;
    const state = item.state || profileInfo.state || null;
    const country = item.country || profileInfo.country || null;
    const postalCode = item.postal_code || profileInfo.postal_code || null;
    const contactPerson = item.contact_person || profileInfo.contact_person || null;
    const contactDesignation = item.contact_designation || profileInfo.contact_designation || null;
    const accreditation = item.accreditation || (profileInfo.accreditation ? profileInfo.accreditation.split(",").map((s) => s.trim()) : []);
    const establishedYear = item.established_year || profileInfo.established_year || null;
    const location = item.location || profileInfo.location || (city && state ? `${city}, ${state}` : city || state || 'N/A');
    const courses = item.courses || [];
    const coursesOffered = courses.length > 0 
      ? courses.map(c => c.title || c.course_name || c.name).filter(Boolean)
      : (item.courses_offered || []);
    
    console.log(`🔍 Processing institute ${instituteName}:`, {
      is_verified_raw: isVerifiedRaw,
      is_verified,
      status: normalizedStatus,
      has_user_info: !!item.user_info,
      has_profile_info: !!item.profile_info
    });
    
    return {
      id: item.id || userInfo.user_id,
      initials: instituteName ? instituteName.substring(0, 2).toUpperCase() : "ST",
      name: userName,
      user_name: userName,
      email: email,
      phone: phone,
      institute_id: instituteId,
      institute_name: instituteName,
      institute_type: instituteType,
      website: website,
      description: description,
      address: address,
      city: city,
      state: state,
      country: country,
      postal_code: postalCode,
      contact_person: contactPerson,
      contact_designation: contactDesignation,
      accreditation: accreditation,
      location: location,
      established_year: establishedYear,
      courses: courses,
      courses_offered: coursesOffered,
      status: normalizedStatus,
      is_verified: is_verified // ✅ Include is_verified in formatted data
    };
  });

  // Filter institutes based on selected status
  const filteredInstitutes = formattedInstitutes.filter((institute) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return institute.status === 'PENDING REVIEW';
    if (filterStatus === 'approved') return institute.status === 'APPROVED';
    if (filterStatus === 'rejected') return institute.status === 'REJECTED';
    return true;
  });

  // Count by status
  const statusCounts = {
    all: formattedInstitutes.length,
    pending: formattedInstitutes.filter(i => i.status === 'PENDING REVIEW').length,
    approved: formattedInstitutes.filter(i => i.status === 'APPROVED').length,
    rejected: formattedInstitutes.filter(i => i.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Filter Tabs */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs sm:text-sm font-bold">✓</span>
            </div>
            <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Institute Approvals</h2>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-2 md:gap-3">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
              filterStatus === 'pending'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending ({statusCounts.pending})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
              filterStatus === 'approved'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Approved ({statusCounts.approved})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
              filterStatus === 'rejected'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Rejected ({statusCounts.rejected})
          </button>
        </div>
      </div>

      {/* Institute Cards */}
      {filteredInstitutes.length > 0 ? (
        <div className="space-y-4">
          {filteredInstitutes.map((institute) => (
            <InstituteApprovalCard
              key={institute.id}
              institute={institute}
              is_verified={institute.is_verified || 0} // ✅ Pass is_verified prop
              onViewDetails={() => handleViewDetails(institute)}
              onApprove={() => handleApprove(institute.institute_id)}
              onReject={() => handleReject(institute.institute_id)}
              onLogin={() => handleLoginAsInstitute(institute)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-dashed p-8 text-center">
          <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>
            No institutes found with status: <span className="font-semibold">{filterStatus}</span>
          </p>
        </div>
      )}

      {/* View Details Modal */}
      <ViewDetailsModal
        institute={viewDetailsModal.institute}
        isOpen={viewDetailsModal.isOpen}
        onClose={handleCloseViewDetails}
      />
    </div>
  )
}
