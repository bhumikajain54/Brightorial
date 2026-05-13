import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { TAILWIND_COLORS, COLORS } from '../../../../../shared/WebConstant.js'
import { MatrixCard, MetricPillRow } from '../../../../../shared/components/metricCard'
import { PillNavigation } from '../../../../../shared/components/navigation'
import Button from '../../../../../shared/components/Button'
import PendingRecruiterApprovals from './PendingRecruiter'
import JobPostingAnalytics from './JobPosting'
import PaymentHistory from './Payment'
import EmployerRatings from './EmployerRating'
import ResumeUsageTracker from './ResumeUsage'
import FraudControlSystem from './FraudControl'
import {
  LuBuilding,
  LuUsers,
  LuSearch,
  LuDownload,
  LuCheck,
  LuBriefcase,
  LuBanknote,
  LuStar,
  LuFileText,
  LuShield
} from 'react-icons/lu'
import { getMethod } from '../../../../../service/api'
import apiService from '../../../../admin/services/serviceUrl'
// KPI Card Component
function KPICard({ title, value, icon, color = COLORS.PRIMARY }) {
  return (
    <div className={`${TAILWIND_COLORS.CARD} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>{title}</p>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
        </div>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

// Employer Table Component
function EmployerTable({ employers }) {
  return (
    <div className={`${TAILWIND_COLORS.CARD} p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LuBuilding className={TAILWIND_COLORS.TEXT_MUTED} size={20} />
          <h3 className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>All Recruiter Profiles</h3>
        </div>
        <div className="relative">
          <LuSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED}`} size={16} />
          <input
            type="text"
            placeholder="Search by company name or email..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-80"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className={`text-left ${TAILWIND_COLORS.TEXT_MUTED} border-b`}>
              <th className="py-3 px-4 font-medium">Company</th>
              <th className="py-3 px-4 font-medium">Industry</th>
              <th className="py-3 px-4 font-medium">Location</th>
              <th className="py-3 px-4 font-medium">Active Jobs</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employers.map((employer) => (
              <tr key={employer.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <div className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{employer.company}</div>
                    <div className={`${TAILWIND_COLORS.TEXT_MUTED} text-xs`}>{employer.email}</div>
                  </div>
                </td>
                <td className={`py-4 px-4 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{employer.industry}</td>
                <td className={`py-4 px-4 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{employer.location}</td>
                <td className={`py-4 px-4 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{employer.activeJobs}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    employer.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                    {employer.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <span className={`${TAILWIND_COLORS.TEXT_MUTED} text-sm`}>⋯</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


export default function EmployerManagement() {
  const [employers, setEmployers] = useState([])
  const [pendingApprovalEmployers, setPendingApprovalEmployers] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const [previousTab, setPreviousTab] = useState(0)

  // Navigation tabs configuration
  const navigationTabs = [
    { id: 'approve-reject', label: 'Approve/Reject', icon: LuCheck },
    { id: 'job-tracking', label: 'Job Tracking', icon: LuBriefcase },
    { id: 'payments', label: 'Payments', icon: LuBanknote },
    { id: 'ratings', label: 'Ratings', icon: LuStar },
    { id: 'resume-usage', label: 'Resume Usage', icon: LuFileText },
    { id: 'fraud-control', label: 'Fraud Control', icon: LuShield }
  ]
  const [totalEmployerCount, setTotalEmployerCount] = useState('0')
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState('0')
  const [activeJobsCount, setActiveJobsCount] = useState('0')
  const [monthlyRevenue, setMonthlyRevenue] = useState('0')

  useEffect(() => {

    async function fetchData() {
      try {
        var data = {
          apiUrl: apiService.employersList,
          payload: {
          },
        };
        var response = await getMethod(data);
        console.log('📥 Employer API Response:', response)
        console.log('📥 First employer data:', response.data?.[0])
        console.log('📥 First employer is_verified:', response.data?.[0]?.is_verified)
        // if (response.status === 'success' || response.status === true) {
        //   // Map API response to required format
        //   const formatted = response.data.map((item, index) => ({
        //     id: item.user_id, // or just use index+1 if you want serial id
        //     email: item.email,
        //     role: item.role,
        //     profile_id: item.profile.profile_id,
        //     company_name: item.profile.company_name,
        //   }));

        //   const pendingFormatted = response.data
        //   .filter((item) => item.profile.admin_action !== "approved")
        //   .map((item, index) => ({
        //     id: item.user_id, // or just use index+1 if you want serial id
        //     email: item.email,
        //     role: item.role,
        //     profile_id: item.profile.profile_id,
        //     company_name: item.profile.company_name,
        //   }));

        //   setEmployers(formatted);
        //   setPendingApprovalEmployers(pendingFormatted);
        //   setTotalEmployerCount(response.total_count);
        //   setPendingApprovalsCount(pendingFormatted.length);
        // } 
        if (response.status === 'success' || response.status === true) {
  // ✅ Pass full raw API response data to PendingRecruiter
  // This ensures is_verified and all other fields are available for normalizeEmployer
  // normalizeEmployer will handle the formatting and status determination
  setEmployers(response.data || []); // ✅ Pass raw API response data with is_verified field
  
  // Formatted data for other views (if needed)
  const formatted = response.data.map((item) => ({
    id: item.user_id,
    email: item.email,
    role: item.role,
    user_name: item.user_name,
    phone_number: item.phone_number,
    profile_id: item.profile?.profile_id,
    company_name: item.profile?.company_name,
    company_logo: item.profile?.company_logo,
    industry: item.profile?.industry,
    website: item.profile?.website,
    location: item.profile?.location,
    admin_action: item.profile?.status,
    created_at: item.profile?.applied_date,
    is_verified: item.is_verified ?? 0,
  }));

  // ✅ Pending = not approved (for other views)
  const pendingFormatted = formatted.filter(
    (emp) => emp.admin_action !== "approved"
  );
  // setPendingApprovalEmployers(pendingFormatted);
  // setTotalEmployerCount(response.total_count);
  // setPendingApprovalsCount(pendingFormatted.length);
    if (response.summary) {
    setTotalEmployerCount(response.summary.total_employers || 0);
    setPendingApprovalsCount(response.summary.pending_approvals || 0);
    setActiveJobsCount(response.summary.active_jobs || 0);
    setMonthlyRevenue(response.summary.monthly_revenue || 0);
  }
} 
else {
          Swal.fire({
            title: "Failed",
            text: response.message || "Failed to retrieve employers",
            icon: "error"
          });
        }
      } catch (error) {
        console.error("Employer API Error:", error)
        Swal.fire({
          title: "API Error",
          text: error.message || "Something went wrong. Please try again.",
          icon: "error"
        });
      }
    }
    fetchData();
  }, [])

  // Close dropdown when clicking outside

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <MatrixCard
          title="Recruiter Management"
          subtitle="Comprehensive recruiter management system with approval work flows and analytics"
          className=""
        />

        {/* <div className="flex items-center justify-end gap-3">
          <MetricPillRow items={[
            { key: 'export', label: 'Export Data', icon: <LuDownload size={16} />, onClick: () => console.log('Export Data') },
            // { key: 'notification', label: 'Send Bulk Notification', icon: <LuMessageSquare size={16} />, onClick: () => console.log('Send Notification') },
            // { key: 'add', label: 'Add Employer', icon: <LuPlus size={16} />, onClick: () => console.log('Add Employer') }
          ]} />
        </div> */}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Recruiters"
          value={totalEmployerCount}
          icon={<LuUsers size={24} color={COLORS.PRIMARY} />}
          color={COLORS.PRIMARY}
        />
        <KPICard
          title="Pending Approvals"
          value={pendingApprovalsCount}
          icon={<span className="text-2xl">✅</span>}
          color={COLORS.PRIMARY}
        />
        <KPICard
          title="Active Jobs"
          value={activeJobsCount}
          icon={<span className="text-2xl">📁</span>}
          color={COLORS.PRIMARY}
        />
        <KPICard
          title="Monthly Revenue"
          value={`₹${monthlyRevenue}`}
          icon={<span className="text-2xl">🎯</span>}
          color={COLORS.PRIMARY}
        />
      </div>

      {/* Navigation Tabs */}
      <PillNavigation 
        tabs={navigationTabs}
        activeTab={activeTab}
        onTabChange={(newTab) => {
          if (newTab !== activeTab) {
            setPreviousTab(activeTab)
            setActiveTab(newTab)
          }
        }}
        storageKey="admin_employer_management_tab"
      />

      {/* Conditional Content Rendering */}
      {activeTab === 0 && (
        <PendingRecruiterApprovals employers={employers} />
      )}

      {activeTab === 1 && (
        <JobPostingAnalytics />
      )}

      {activeTab === 2 && (
        <PaymentHistory onComingSoonClose={() => setActiveTab(previousTab)} />
      )}

      {activeTab === 3 && (
        <EmployerRatings />
      )}

      {activeTab === 4 && (
        <ResumeUsageTracker onComingSoonClose={() => setActiveTab(previousTab)} />
      )}

      {activeTab === 5 && (
        <FraudControlSystem />
      )}

    </div>
  )
}