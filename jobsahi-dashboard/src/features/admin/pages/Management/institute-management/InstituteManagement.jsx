import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { MatrixCard } from '../../../../../shared/components/metricCard'
import { PillNavigation } from '../../../../../shared/components/navigation'
import { 
  LuCheck, 
  LuBookOpen, 
  LuUsers, 
  LuAward, 
  LuMessageSquare 
} from 'react-icons/lu'
import PendingInstituteApprovals from './PendingInstitute'
import CourseMonitoring from './CourseMonitoring'
import PlacementStudent from './PlacementStudent'
import CertificateIssuance from './CertificateIssuance'
import MessageInstitute from './MessageInstitute'
import { getMethod } from '../../../../../service/api'
import apiService from '../../../../admin/services/serviceUrl'
import { TAILWIND_COLORS } from '../../../../../shared/WebConstant'


export default function InstituteManagement() {
  const [activeTab, setActiveTab] = useState(0)
  const [previousTab, setPreviousTab] = useState(0)
  const [institutes, setInstitutes] = useState([])
  const [pendingApprovalInstitutes, setPendingApprovalInstitutes] = useState([])
  const [totalInstituteCount, setTotalInstituteCount] = useState('0')
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState('0')

  useEffect(() => {
  
      async function fetchData() {
        try {
          var data = {
            apiUrl: apiService.institutesList,
            payload: {
            },
          };
  
          var response = await getMethod(data);
          console.log('Institute API Response:', response)
          if (response.status === 'success' || response.status === true) {
            // ✅ Pass raw API response data directly to ensure all fields (including is_verified) are available
            // Map API response to required format while preserving raw data
            const formatted = response.data.map((item, index) => ({
              id: item.user_info.user_id,
              name: item.user_info.user_name, // User name
              email: item.user_info.email,
              phone: item.user_info.phone_number,
              institute_id: item.profile_info.institute_id,
              institute_name: item.profile_info.institute_name,
              institute_type: item.profile_info.institute_type,
              website: item.profile_info.website,
              description: item.profile_info.description,
              address: item.profile_info.address,
              city: item.profile_info.city,  
              state: item.profile_info.state,
              country: item.profile_info.country,
              postal_code: item.profile_info.postal_code,
              contact_person: item.profile_info.contact_person,
              contact_designation: item.profile_info.contact_designation,
              accreditation: item.profile_info.accreditation ? item.profile_info.accreditation.split(",").map((s) => s.trim()) : [],
              established_year: item.profile_info.established_year,    
              location: item.profile_info.location,
              courses: item.courses || [], // Courses array from API response
              courses_offered: item.courses ? item.courses.map(c => c.title || c.course_name || c.name).filter(Boolean) : (item.profile_info.courses_offered ? item.profile_info.courses_offered.split(",").map((c) => c.trim()) : []),
              status: item.profile_info.admin_action,
              created_at: item.profile_info.created_at,
              modified_at: item.profile_info.modified_at,
              deleted_at: item.profile_info.deleted_at,
              // ✅ Include is_verified from user_info
              is_verified: item.user_info.is_verified ?? 0,
              // ✅ Preserve raw data for PendingInstitute to access
              user_info: item.user_info,
              profile_info: item.profile_info,
            }));
  
            const pendingFormatted = response.data
            .filter((item) => item.profile_info.admin_action !== "approved")
            .map((item, index) => ({
              id: item.user_info.user_id,
              name: item.user_info.user_name, // User name
              email: item.user_info.email,
              phone: item.user_info.phone_number,
              institute_id: item.profile_info.institute_id,
              institute_name: item.profile_info.institute_name,
              institute_type: item.profile_info.institute_type,
              website: item.profile_info.website,
              description: item.profile_info.description,
              address: item.profile_info.address,
              city: item.profile_info.city,  
              state: item.profile_info.state,
              country: item.profile_info.country,
              postal_code: item.profile_info.postal_code,
              contact_person: item.profile_info.contact_person,
              contact_designation: item.profile_info.contact_designation,
              accreditation: item.profile_info.accreditation ? item.profile_info.accreditation.split(",").map((s) => s.trim()) : [],
              established_year: item.profile_info.established_year,    
              location: item.profile_info.location,
              courses: item.courses || [], // Courses array from API response
              courses_offered: item.courses ? item.courses.map(c => c.title || c.course_name || c.name).filter(Boolean) : (item.profile_info.courses_offered ? item.profile_info.courses_offered.split(",").map((c) => c.trim()) : []),
              status: item.profile_info.admin_action,
              created_at: item.profile_info.created_at,
              modified_at: item.profile_info.modified_at,
              deleted_at: item.profile_info.deleted_at,
              // ✅ Include is_verified from user_info
              is_verified: item.user_info.is_verified ?? 0,
              // ✅ Preserve raw data for PendingInstitute to access
              user_info: item.user_info,
              profile_info: item.profile_info,
            }));
  
            // ✅ Pass raw API response data directly (similar to EmployerManagement)
            setInstitutes(response.data);
            setPendingApprovalInstitutes(pendingFormatted);
            setTotalInstituteCount(response.count);
            setPendingApprovalsCount(pendingFormatted.length);
          } else {
            Swal.fire({
              title: "Failed",
              text: response.message || "Failed to retrieve institutes",
              icon: "error"
            });
          }
        } catch (error) {
          console.error("Institute API Error:", error)
          Swal.fire({
            title: "API Error",
            text: error.message || "Something went wrong. Please try again.",
            icon: "error"
          });
        }
      }
      fetchData();
    }, [])

  // Navigation tabs configuration
  const navigationTabs = [
    { id: 'verify-approve', label: 'Verify / Approve Skill Partner', icon: LuCheck },
    { id: 'course-monitoring', label: 'Course & Enrollment Monitoring', icon: LuBookOpen },
    { id: 'placement-students', label: 'Placement-Ready Students', icon: LuUsers },
    { id: 'certificate-issuance', label: 'Certificate Issuance', icon: LuAward },
    { id: 'message-institute', label: 'Message Specific Skill Partner', icon: LuMessageSquare }
  ]

  return (
    <div className={`space-y-4 sm:space-y-6 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
      {/* Title Section with MatrixCard */}
      <MatrixCard 
        title="Skill Partner Management"
        subtitle="Manage skill partner onboarding, course monitoring, payments, and communications."
        className="mb-4 sm:mb-6"  
      />

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
        storageKey="admin_institute_management_tab"
      />

      {/* Conditional Content */}
      {activeTab === 0 && (
        <PendingInstituteApprovals institutes={institutes} />
      )}

      {activeTab === 1 && (
        <CourseMonitoring />
      )}

      {activeTab === 2 && (
        <PlacementStudent />
      )}

      {activeTab === 3 && (
        <CertificateIssuance />
      )}

      {activeTab === 4 && (
        <MessageInstitute onBack={() => setActiveTab(previousTab)} />
      )}
     </div>
  )
}