import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  LuPaperclip,
  LuEye,
  LuCheck,
  LuX,
  LuFileText,
  LuBuilding,
  LuCalendar,
  LuGlobe,
  LuPhone,
  LuMail,
  LuMapPin,
  LuUsers,
  LuLogIn,
} from "react-icons/lu";
import { TAILWIND_COLORS } from "../../../../../shared/WebConstant.js";
import { Button } from "../../../../../shared/components/Button";
import { postMethod, getMethod } from "../../../../../service/api";
import service from "../../../../../service/serviceUrl.js";

/* ---------------------------------------------
   Helper Functions
--------------------------------------------- */
const toTitle = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "N/A");

const statusFromVerified = (v) => {
  if (v === 1 || v === "1" || v === true) return "approved";
  if (v === 0 || v === "0") return "rejected";
  return "pending";
};

// ✅ Normalize employer object properly
function normalizeEmployer(raw) {
  const profile = raw.profile || {};
  const userInfo = raw.user_info || {};

  // ✅ correct key usage
  const uid = Number(raw.user_id ?? raw.uid ?? raw.id ?? 0);
  const profile_id = Number(profile.profile_id ?? raw.profile_id ?? 0);

  const company_name = profile.company_name ?? raw.company_name ?? "No Company";
  const company_logo = profile.company_logo ?? raw.company_logo ?? null;
  const industry = profile.industry ?? raw.industry ?? "No Industry";
  const website = profile.website ?? raw.website ?? "";
  const location = profile.location ?? raw.location ?? "";
  const applied_date = profile.applied_date ?? raw.created_at ?? null;
  const last_modified = profile.last_modified ?? raw.modified_at ?? null;

  // ✅ Extract is_verified from top level (API response has it at root level)
  // Handle both string and number values
  const isVerifiedRaw = raw.is_verified ?? 
    raw.user?.is_verified ??
    userInfo.is_verified ?? 
    profile.is_verified ?? 
    0;
  
  // Convert to number (handle "1", 1, "0", 0, null, undefined)
  const is_verified = isVerifiedRaw === 1 || isVerifiedRaw === "1" || isVerifiedRaw === true ? 1 : 0;
  
  // ✅ Debug log
  console.log(`🔍 normalizeEmployer for ${raw.user_name || 'Unknown'}:`, {
    raw_is_verified: raw.is_verified,
    isVerifiedRaw,
    is_verified,
    user_id: raw.user_id || raw.uid || raw.id
  });

  // ✅ IMPORTANT: Status is determined ONLY by is_verified field
  // is_verified === 1 → "approved"
  // is_verified === 0 → "pending"
  // Don't use admin_action or profile.status - only is_verified matters
  let finalStatus;
  if (is_verified === 1) {
    finalStatus = "approved";
  } else {
    // is_verified === 0 or null → "pending"
    finalStatus = "pending";
  }
  
  // ✅ Debug log
  if (is_verified === 1 && finalStatus !== "approved") {
    console.error(`❌ Status mismatch in normalizeEmployer for ${raw.user_name}:`, {
      is_verified,
      finalStatus,
      raw_is_verified: raw.is_verified
    });
  }

  return {
    id: profile_id || uid || Math.random(),
    uid,
    user_name: raw.user_name ?? userInfo.user_name ?? "No Recruiter",
    email: raw.email ?? userInfo.email ?? "No Email",
    phone_number: raw.phone_number ?? userInfo.phone_number ?? "No Phone",
    role: raw.role ?? userInfo.role ?? "recruiter",
    profile_id,
    company_name,
    company_logo,
    industry,
    website,
    location,
    applied_date,
    last_modified,
    is_verified,
    status: finalStatus,
  };
}

/* ---------------------------------------------
   Small UI Components
--------------------------------------------- */
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

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{label}:</span>
      <span className={TAILWIND_COLORS.TEXT_PRIMARY}>{value || "N/A"}</span>
    </div>
  );
}

/* ---------------------------------------------
   Approval Card Component
--------------------------------------------- */
function ApprovalCard({
  company,
  recruiter,
  email,
  phone,
  website,
  industry,
  appliedDate,
  last_modified,
  location,
  documents,
  status,
  is_verified,
  onReview,
  onApprove,
  onReject,
  onLogin,
}) {
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
                {company}
              </h3>
              <StatusBadge status={status} />
            </div>

            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-3`}>
              {recruiter}
            </p>

            <div className="flex flex-wrap gap-4 text-sm mb-3">
              <InfoRow
                label="Email"
                value={email}
                icon={<LuMail size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
              />
              <InfoRow
                label="Phone"
                value={phone}
                icon={<LuPhone size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
              />
              <InfoRow
                label="Website"
                value={website}
                icon={<LuGlobe size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {industry}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <InfoRow
                label="Applied"
                value={appliedDate}
                icon={<LuCalendar size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
              />
              <InfoRow
                label="Last Modified"
                value={last_modified}
                icon={<LuCalendar size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
              />
              <InfoRow
                label="Location"
                value={location || "N/A"}
                icon={<LuMapPin size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
              />
            </div>

            {/* Documents Section - Commented out (static data) */}
            {/* <div>
              <p
                className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}
              >
                Documents submitted:
              </p>
              <div className="flex flex-wrap gap-2">
                {(documents || []).map((doc, i) => (
                  <span
                    key={`${doc}-${i}`}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1"
                  >
                    <LuFileText size={14} />
                    {doc}
                  </span>
                ))}
              </div>
            </div> */}
          </div>
        </div>

        {/* Right Actions */}
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
            onClick={onReview}
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

/* ---------------------------------------------
   Review Modal
--------------------------------------------- */
/* ---------------------------------------------
   Review Modal (Full Data from list_employers)
--------------------------------------------- */
function ReviewModal({ recruiter, isOpen, onClose }) {
  if (!isOpen || !recruiter) return null;

  const logo = recruiter.company_logo
    ? recruiter.company_logo.startsWith("http")
      ? recruiter.company_logo
      : `${import.meta.env.VITE_BASE_URL || ""}${recruiter.company_logo}`
    : "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Recruiter Full Details
          </h2>
          <Button
            onClick={onClose}
            variant="unstyled"
            className={`${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY} p-2`}
          >
            <span className="text-2xl">&times;</span>
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Top Company Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {logo ? (
              <img
                src={logo}
                alt="Company Logo"
                className="w-20 h-20 rounded-lg border object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <LuBuilding className="text-gray-500" size={32} />
              </div>
            )}

            <div>
              <h3
                className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}
              >
                {recruiter.company || recruiter.company_name || "No Company"}
              </h3>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                {recruiter.industry || "No Industry"}
              </p>
              <div className="mt-2">
                <StatusBadge status={recruiter.status} />
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <InfoRow
              label="Recruiter Name"
              value={recruiter.recruiter || recruiter.user_name}
              icon={<LuUsers size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
            />
            <InfoRow
              label="Email"
              value={recruiter.email}
              icon={<LuMail size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
            />
            <InfoRow
              label="Phone"
              value={recruiter.phone || recruiter.phone_number}
              icon={<LuPhone size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
            />
            <div className="flex items-center gap-2">
              <LuGlobe size={16} className={TAILWIND_COLORS.TEXT_MUTED} />
              <span className="text-sm text-gray-500">Website:</span>
              {recruiter.website ? (
                <a
                  href={recruiter.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {recruiter.website}
                </a>
              ) : (
                <span className="text-gray-600">N/A</span>
              )}
            </div>
            <InfoRow
              label="Location"
              value={recruiter.location || "N/A"}
              icon={<LuMapPin size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
            />
            <InfoRow
              label="Applied Date"
              value={
                recruiter.applied_date
                  ? new Date(recruiter.applied_date).toLocaleDateString()
                  : recruiter.appliedDate || "N/A"
              }
              icon={<LuCalendar size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
            />
            <InfoRow
              label="Last Modified"
              value={
                recruiter.last_modified
                  ? new Date(recruiter.last_modified).toLocaleDateString()
                  : recruiter.last_modified || "N/A"
              }
              icon={<LuCalendar size={16} className={TAILWIND_COLORS.TEXT_MUTED} />}
            />
          </div>

          {/* Documents Section - Commented out (static data) */}
          {/* <div className="bg-gray-50 p-4 rounded-lg">
            <p
              className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}
            >
              Documents Submitted:
            </p>
            <div className="flex flex-wrap gap-2">
              {recruiter.documents && recruiter.documents.length > 0 ? (
                recruiter.documents.map((doc, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1"
                  >
                    <LuFileText size={14} />
                    {doc}
                  </span>
                ))
              ) : (
                <>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1">
                    <LuFileText size={14} /> Business License
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1">
                    <LuFileText size={14} /> Tax Certificate
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1">
                    <LuFileText size={14} /> Company Profile
                  </span>
                </>
              )}
            </div>
          </div> */}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <Button onClick={onClose} variant="neutral" size="md">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------
   Main Component
--------------------------------------------- */
// export default function PendingRecruiterApprovals({ employers = [] }) {
//   // ✅ Always normalize fresh from API every render
//   const normalized = useMemo(() => employers.map(normalizeEmployer), [employers]);
//   const [items, setItems] = useState(normalized);

//   // Force sync when API response updates
//   React.useEffect(() => {
//     if (employers && employers.length > 0) {
//       setItems(employers.map(normalizeEmployer));
//     }
//   }, [employers]);

//   // ✅ Approve/Reject logic
//   const updateStatus = async (uid, is_verified, label) => {
//     try {
//       const data = {
//         apiUrl: service.verifyUser,
//         payload: { uid, is_verified }, // ✅ backend expects uid
//       };
//       const res = await postMethod(data);

//       if (res?.success || res?.status) {
//         // update local state immediately
//         setItems((prev) =>
//           prev.map((it) =>
//             it.uid === uid
//               ? { ...it, is_verified, status: is_verified ? "approved" : "rejected" }
//               : it
//           )
//         );

//         Swal.fire({
//           title: `${label}!`,
//           text: `Recruiter has been ${label.toLowerCase()} successfully.`,
//           icon: "success",
//           timer: 1500,
//           showConfirmButton: false,
//         });
//       } else {
//         Swal.fire({
//           title: "Failed",
//           text: res?.message || "Update failed.",
//           icon: "error",
//         });
//       }
//     } catch (e) {
//       Swal.fire({
//         title: "API Error",
//         text: e.message || "Something went wrong.",
//         icon: "error",
//       });
//     }
//   };

//   const handleApprove = (id) => updateStatus(id, 1, "Approved");
//   const handleReject = (id) => updateStatus(id, 0, "Rejected");

//   // ✅ Always calculate status counts dynamically
//   const counts = {
//     approved: items.filter((i) => i.status === "approved").length,
//     pending: items.filter((i) => i.status === "pending").length,
//     rejected: items.filter((i) => i.status === "rejected").length,
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between flex-wrap gap-3">
//         <div className="flex items-center gap-3">
//           <LuPaperclip className={TAILWIND_COLORS.TEXT_MUTED} size={24} />
//           <div>
//             <h1 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
//               Recruiter Approvals
//             </h1>
//             <p className={`${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
//               Manage approved, rejected, and pending recruiters.
//             </p>
//           </div>
//         </div>

//         {/* Summary badges */}
//         <div className="flex gap-2 flex-wrap">
//           <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
//             Approved: {counts.approved}
//           </span>
//           <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
//             Pending: {counts.pending}
//           </span>
//           <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
//             Rejected: {counts.rejected}
//           </span>
//         </div>
//       </div>

//       {/* ✅ Cards — show all (approved, rejected, pending) */}
//       <div className="space-y-4">
//         {items.map((c) => (
//           <ApprovalCard
//             key={c.id}
//             company={c.company_name}
//             recruiter={c.user_name}
//             email={c.email}
//             phone={c.phone_number}
//             website={c.website}
//             industry={c.industry}
//             appliedDate={
//               c.applied_date ? new Date(c.applied_date).toLocaleDateString() : "N/A"
//             }
//             last_modified={
//               c.last_modified ? new Date(c.last_modified).toLocaleDateString() : "N/A"
//             }
//             documents={["Business License", "Tax Certificate", "Company Profile"]}
//             status={c.status}
//             onReview={() => console.log("Review:", c)}
//             onApprove={() => handleApprove(c.uid)}
//             onReject={() => handleReject(c.uid)}
//           />
//         ))}

//         {items.length === 0 && (
//           <div className="bg-white rounded-lg border border-dashed p-8 text-center">
//             <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>
//               No recruiters found.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

export default function PendingRecruiterApprovals({ employers = [] }) {
  const navigate = useNavigate();
  const normalized = useMemo(() => employers.map(normalizeEmployer), [employers]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  // ✅ Fetch verification status from users table and set items
  React.useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!employers || employers.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // ✅ Log full API response structure first
        console.log('🔍 FULL EMPLOYERS API RESPONSE:', {
          total_employers: employers.length,
          first_employer_structure: employers[0] ? {
            all_keys: Object.keys(employers[0]),
            full_object: employers[0],
            has_profile: !!employers[0].profile,
            has_user_info: !!employers[0].user_info,
            profile_keys: employers[0].profile ? Object.keys(employers[0].profile) : [],
            user_info_keys: employers[0].user_info ? Object.keys(employers[0].user_info) : []
          } : 'No employers'
        });
        
        // ✅ Normalize employers - normalizeEmployer already sets status based on is_verified
        const normalizedEmployers = employers.map(normalizeEmployer);
        
        console.log('📊 Normalized employers:', normalizedEmployers.map(emp => ({
          name: emp.user_name,
          uid: emp.uid,
          is_verified: emp.is_verified,
          status: emp.status
        })));

        // ✅ Ensure status matches is_verified (double check)
        const itemsWithVerification = normalizedEmployers.map((emp) => {
          // ✅ Status should match is_verified
          // is_verified === 1 → "approved"
          // is_verified === 0 or null → "pending"
          // Handle both string and number values
          const isVerifiedRaw = emp.is_verified ?? 0;
          const isVerifiedValue = isVerifiedRaw === 1 || isVerifiedRaw === "1" || isVerifiedRaw === true ? 1 : 0;
          
          let finalStatus;
          if (isVerifiedValue === 1) {
            finalStatus = "approved";
          } else {
            finalStatus = "pending";
          }
          
          // ✅ Log if there's a mismatch
          if (emp.status !== finalStatus) {
            console.warn(`⚠️ Status mismatch for ${emp.user_name}:`, {
              current_status: emp.status,
              expected_status: finalStatus,
              is_verified: isVerifiedValue,
              is_verified_raw: emp.is_verified
            });
          }
          
          console.log(`✅ Final status for ${emp.user_name}:`, {
            is_verified: isVerifiedValue,
            status: finalStatus
          });
          
          return {
            ...emp,
            status: finalStatus, // ✅ Force status to match is_verified
            is_verified: isVerifiedValue
          };
        });

        console.log('✅ Final items with verification:', itemsWithVerification.map(emp => ({
          name: emp.user_name,
          is_verified: emp.is_verified,
          status: emp.status
        })));

        setItems(itemsWithVerification);
      } catch (error) {
        console.error("Error fetching verification status:", error);
        // Fallback: use normalized data
      setItems(employers.map(normalizeEmployer));
      } finally {
        setLoading(false);
    }
    };

    fetchVerificationStatus();
  }, [employers]);

  // ✅ Review modal control
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    recruiter: null,
  });

  const openReview = (rec) => setReviewModal({ isOpen: true, recruiter: rec });
  const closeReview = () => setReviewModal({ isOpen: false, recruiter: null });

  // ✅ Approve/Reject logic
  const updateStatus = async (uid, is_verified, label) => {
    try {
      console.log(`📡 Making API call to verifyUser for ${label}:`, {
        uid,
        is_verified,
        apiUrl: service.verifyUser
      });

      const data = {
        apiUrl: service.verifyUser,
        payload: { uid, is_verified },
      };
      
      console.log('📤 API Request Data:', data);
      const res = await postMethod(data);
      console.log('📥 API Response:', res);

      if (res?.success || res?.status) {
        setItems((prev) =>
          prev.map((it) =>
            it.uid === uid
              ? { ...it, is_verified, status: is_verified ? "approved" : "rejected" }
              : it
          )
        );

        Swal.fire({
          title: `${label}!`,
          text: `Recruiter has been ${label.toLowerCase()} successfully.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Failed",
          text: res?.message || "Update failed.",
          icon: "error",
        });
      }
    } catch (e) {
      Swal.fire({
        title: "API Error",
        text: e.message || "Something went wrong.",
        icon: "error",
      });
    }
  };

  const handleApprove = (id) => {
    console.log('🚀 handleApprove called for recruiter with id:', id);
    updateStatus(id, 1, "Approved");
  };
  const handleReject = (id) => {
    console.log('🚀 handleReject called for recruiter with id:', id);
    updateStatus(id, 0, "Rejected");
  };

  // ✅ Admin Login as Recruiter
  const handleLoginAsRecruiter = async (recruiter) => {
    try {
      Swal.fire({
        title: 'Login as Recruiter?',
        text: `You will be logged in as ${recruiter.user_name || recruiter.company_name}. You can return to admin panel later.`,
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

            // Create user object for recruiter (but keep admin token for API calls)
            const recruiterUser = {
              id: recruiter.uid || recruiter.id,
              user_name: recruiter.user_name,
              email: recruiter.email,
              role: "recruiter",
              phone_number: recruiter.phone_number,
              // Store original recruiter ID for API calls
              original_recruiter_id: recruiter.uid || recruiter.id,
            };

            // Use admin's actual token (not a fake one) so API calls work
            // The backend should handle admin impersonation based on the admin token
            // Set recruiter's user info but keep admin's token
            localStorage.setItem("authToken", currentAdminToken); // Keep admin token
            localStorage.setItem("authUser", JSON.stringify(recruiterUser));
            localStorage.setItem("isAdminImpersonating", "true");
            localStorage.setItem("impersonatedUserId", recruiter.uid || recruiter.id); // Store recruiter ID

            Swal.fire({
              title: 'Success!',
              text: `Logged in as ${recruiter.user_name || recruiter.company_name}`,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              // Redirect to recruiter dashboard
              navigate("/recruiter/dashboard");
            });
          } catch (error) {
            console.error("Error logging in as recruiter:", error);
            Swal.fire({
              title: "Error",
              text: "Failed to login as recruiter. Please try again.",
              icon: "error"
            });
          }
        }
      });
    } catch (error) {
      console.error("Error in handleLoginAsRecruiter:", error);
    }
  };

  // Filter items based on selected status
  const filteredItems = items.filter((item) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return item.status === 'pending';
    if (filterStatus === 'approved') return item.status === 'approved';
    if (filterStatus === 'rejected') return item.status === 'rejected';
    return true;
  });

  // Count by status
  const statusCounts = {
    all: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    approved: items.filter(i => i.status === 'approved').length,
    rejected: items.filter(i => i.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Filter Tabs */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <LuPaperclip className={TAILWIND_COLORS.TEXT_MUTED} size={24} />
            <div>
              <h1 className={`text-lg sm:text-xl md:text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                Recruiter Approvals
              </h1>
              <p className={`${TAILWIND_COLORS.TEXT_MUTED} mt-1 text-sm`}>
                Manage approved, rejected, and pending recruiters.
              </p>
            </div>
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

      {/* ✅ Cards */}
      {/* Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg border border-dashed p-8 text-center">
            <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>Checking verification status...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((c) => (
          <ApprovalCard
            key={c.id}
            company={c.company_name}
            recruiter={c.user_name}
            email={c.email}
            phone={c.phone_number}
            website={c.website}
            industry={c.industry}
            location={c.location}
            appliedDate={
              c.applied_date ? new Date(c.applied_date).toLocaleDateString() : "N/A"
            }
            last_modified={
              c.last_modified ? new Date(c.last_modified).toLocaleDateString() : "N/A"
            }
            documents={["Business License", "Tax Certificate", "Company Profile"]}
            status={c.status}
            is_verified={c.is_verified || 0} // ✅ Pass is_verified prop

            // ✅ FIXED LINE ↓↓↓
            onReview={() => {
              console.log("🟢 Review Clicked:", c);
              openReview(c);
            }}

            onApprove={() => handleApprove(c.uid)}
            onReject={() => handleReject(c.uid)}
            onLogin={() => handleLoginAsRecruiter(c)}
          />
          ))
        ) : (
          <div className="bg-white rounded-lg border border-dashed p-8 text-center">
            <p className={`${TAILWIND_COLORS.TEXT_MUTED}`}>
              No recruiters found with status: <span className="font-semibold">{filterStatus}</span>
            </p>
          </div>
        )}
      </div>


      {/* ✅ Review Modal */}
      <ReviewModal
        recruiter={reviewModal.recruiter}
        isOpen={reviewModal.isOpen}
        onClose={closeReview}
      />
    </div>
  );
}
