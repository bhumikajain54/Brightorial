import React, { useState, useEffect } from 'react'
import { 
  LuSearch, 
  LuFilter, 
  LuDownload, 
  LuEye,
  LuUser
} from 'react-icons/lu'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import CertificateDetailsModal from './CertificateDetailsModal'
import { getMethod, postMultipart } from "../../../../service/api";
import apiService from "../../services/serviceUrl";


function IssuanceLogs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCertificateId, setSelectedCertificate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [logs, setLogs] = useState([]);
const [loading, setLoading] = useState(false);

// ✅ Fetch all issuance logs from certificates_issuance.php API (without id parameter)
// API Response Format (List Mode - no id):
// {
//   "status": true,
//   "message": "Certificate issuance list fetched",
//   "count": 1,
//   "data": [
//     {
//       "certificate_id": "CERT-2025-001",
//       "student_name": "Aarti Nathani",
//       "institute_name": "Brightorial Institute",
//       "course_title": "Assistant Electrician",
//       "batch_name": "Assistant Electrician - March 2025 (Morning Batch)",
//       "issue_date": "2025-11-22",
//       "status": "Approved"
//     }
//   ]
// }
// Note: List mode does NOT include file_url, student_email, or phone_number (only in single certificate view with ?id=xxx)
useEffect(() => {
  const fetchLogs = async () => {
    setLoading(true);
    try {
      
      // Use postMultipart for consistency (send empty FormData for list view)
      const formData = new FormData();
      // No id parameter means list mode
      
      const response = await postMultipart({
        apiUrl: apiService.certificatesIssuance, // certificates_issuance.php (without id) - returns list of certificates
        data: formData, // Empty FormData for list view
      });

      // Check if response is successful
      const isSuccess = response?.status === true || 
                       response?.status === 1 || 
                       response?.status === "true" ||
                       (response?.data && Array.isArray(response.data) && response.data.length > 0);

      if (!isSuccess) {
        setLogs([]);
        return;
      }

      // Extract data array from response
      // Expected: response.data is an array of certificate objects
      let dataArray = [];
      if (Array.isArray(response?.data)) {
        dataArray = response.data;
      } else if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        // If data is a single object (shouldn't happen in list mode, but handle gracefully)
        dataArray = [response.data];
      } else {
        setLogs([]);
        return;
      }


      if (dataArray.length === 0) {
        setLogs([]);
        return;
      }

      // Step 2: Fetch template data for each certificate using getCertificate and getCertificateTemplate APIs
      // First, get template_id from getCertificate API for each certificate
      
      const enrichedLogs = await Promise.all(
        dataArray.map(async (log) => {
          const certificateId = log.certificate_id || log.id || '';
          let templateId = null;
          let templateData = null;
          
          // Step 2a: Get template_id from getCertificate API
          try {
            const certificateResponse = await getMethod({
              apiUrl: `${apiService.getCertificate}?id=${certificateId}`, // Use get-certificate.php to get template_id
            });
            
            if (certificateResponse?.status && certificateResponse?.data) {
              const certData = Array.isArray(certificateResponse.data) ? certificateResponse.data[0] : certificateResponse.data;
              templateId = certData.template_id || certData.templateId || certData.template?.id || certData.template?.template_id;
            }
          } catch (certError) {
          }
          
          // Step 2b: Get template details from getCertificateTemplate API
          if (templateId) {
            try {
              const templateResponse = await getMethod({
                apiUrl: `${apiService.getCertificateTemplate}?id=${templateId}`, // Call certificate_templates.php?id={template_id} to get template_name and template_description
              });
              
              if (templateResponse?.status && templateResponse?.data) {
                // Extract template data from response
                if (Array.isArray(templateResponse.data)) {
                  templateData = templateResponse.data.find(t => 
                    String(t.id || t.template_id) === String(templateId)
                  ) || templateResponse.data[0];
                } else {
                  templateData = templateResponse.data;
                }
              }
            } catch (templateError) {
              // Error fetching template, use fallback data
            }
          }
          
          // Merge template data with certificate log
          return {
            ...log,
            template_name: templateData?.template_name || templateData?.name || log.template_name || '',
            template_description: templateData?.description || templateData?.footer_text || log.template_description || log.description || '',
          };
        })
      );
      

      // Transform API response to component expected fields
      // Map snake_case API fields to camelCase component fields
      const transformedLogs = enrichedLogs
        .filter((log) => log != null && typeof log === 'object') // Remove null/undefined/invalid items
        .map((log) => {
          // Extract certificate_id (can be string like "CERT-2025-001" or number)
          const certificateId = log.certificate_id || log.id || '';
          
          // Extract batch with multiple fallbacks (handle nested structures)
          const batchName = log.batch_name || 
                           log.batch || 
                           log.batchName || 
                           log.batch?.name ||
                           '';
          
          // Extract phone with multiple fallbacks (handle nested structures and different field names)
          const phoneNumber = log.phone_number || 
                             log.phone || 
                             log.phoneNumber ||
                             log.student?.phone ||
                             log.student?.phone_number ||
                             '';
          
          // Extract email with multiple fallbacks
          const email = log.student_email || 
                       log.email || 
                       log.studentEmail ||
                       log.student?.email ||
                       '';
          
          // Extract template_name from enriched data (from getCertificateTemplate API)
          const templateName = log.template_name || 
                              log.templateName || 
                              log.template?.name ||
                              log.name ||
                              '';
          
          // Extract template_description from enriched data (from getCertificateTemplate API)
          const templateDescription = log.template_description || 
                                     log.templateDescription || 
                                     log.description ||
                                     log.template?.description ||
                                     log.footer_text ||
                                     log.template?.footer_text ||
                                     '';
          
          return {
            // Component fields (camelCase)
            id: certificateId,
            certificateId: certificateId,
            studentName: log.student_name || 
                        log.studentName || 
                        log.student?.name ||
                        '',
            course: log.course_title || 
                   log.course || 
                   log.courseTitle ||
                   log.course?.title ||
                   '',
            batch: batchName, // ✅ Extract batch with fallbacks
            instituteName: log.institute_name || 
                          log.instituteName ||
                          '',
            issuedDate: log.issue_date || 
                       log.issueDate ||
                       log.issued_date ||
                       '',
            status: (() => {
              const apiStatus = (log.status || 'approved').toLowerCase();
              // Map API status "Approved" to component status "issued"
              if (apiStatus === 'approved') return 'issued';
              if (apiStatus === 'pending') return 'pending';
              if (apiStatus === 'issued') return 'issued';
              return 'issued'; // Default fallback
            })(),
            // Extract email and phone if available in list mode
            email: email,
            phone: phoneNumber, // ✅ Extract phone with fallbacks
            fileUrl: log.file_url || 
                    log.fileUrl || 
                    '', // May not be available in list mode
            // ✅ Extract template_name and template_description from getCertificateTemplate API (via getCertificate)
            templateName: templateName, // From getCertificateTemplate API
            templateDescription: templateDescription, // From getCertificateTemplate API
            // Keep original data for API calls (for modal view)
            certificate_id: certificateId,
          };
        })
        .filter((log) => log.certificateId); // Remove entries without certificate_id

      
      setLogs(transformedLogs);
    } catch (error) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  fetchLogs();
}, []);





  const filteredLogs = (logs || [])
    .filter((log) => log != null && typeof log === 'object') // Ensure log is a valid object
    .filter((log) => {
      // Add null/undefined checks to prevent errors
      const studentName = String(log.studentName || '').toLowerCase();
      const certificateId = String(log.certificateId || '').toLowerCase();
      const course = String(log.course || '').toLowerCase();
      const searchTermLower = String(searchTerm || '').toLowerCase();
      
      const matchesSearch = studentName.includes(searchTermLower) ||
                           certificateId.includes(searchTermLower) ||
                           course.includes(searchTermLower);
      const matchesStatus = statusFilter === 'all' || (log.status || 'issued') === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

  // View Certificate - Opens modal which calls APIs in sequence:
  // 1. certificates_issuance.php?id={certificateId} (Step 1) - for certificate details with email/phone
  // 2. get-certificate.php?id={certificateId} (Step 2a) - to get template_id and file_url
  // 3. certificate_templates.php?id={templateId} (Step 2b) - for template assets (logo, seal, signature)
  const handleViewCertificate = (certificate) => {
    const certificateId = certificate.certificate_id || certificate.id;
    setSelectedCertificate(certificateId); // Store certificateId - modal will fetch APIs in sequence
    setIsModalOpen(true);
  };
  
  

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCertificate(null) // Clear certificateId when closing
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>Certificate Issuance Logs</h3>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>View and track all certificate issuances</p>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <LuDownload className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <LuSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by recipient name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <LuFilter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Filter by status</option>
              <option value="issued">Issued</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Student
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Course & Batch
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Certificate ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Issue Date
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className={`ml-3 text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <span className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>No certificate logs found.</span>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  // Create a unique key combining certificateId, studentName, and index to ensure uniqueness
                  const uniqueKey = `${log.certificateId || log.id || 'cert'}-${log.studentName || 'student'}-${log.issuedDate || 'date'}-${index}`;
                  return (
                <tr key={uniqueKey} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <LuUser className={`h-5 w-5 ${TAILWIND_COLORS.TEXT_MUTED}`} />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{log.studentName || '-'}</div>
                        {log.email && (
                          <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{log.email}</div>
                        )}
                        {log.phone && (
                          <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{log.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{log.course}</div>
                    <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{log.batch}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{log.certificateId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                      {log.issuedDate || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        log.status === 'issued' ? 'bg-green-500' : 
                        log.status === 'pending' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        log.status === 'issued' ? 'text-green-600' : 
                        log.status === 'pending' ? 'text-blue-600' : TAILWIND_COLORS.TEXT_MUTED
                      }`}>
                        {(log.status || 'issued').charAt(0).toUpperCase() + (log.status || 'issued').slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewCertificate(log)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors duration-200"
                        title="View Certificate"
                      >
                        <LuEye className="h-4 w-4" />
                      </button>
                     
                    </div>
                  </td>
                </tr>
                  );
                }))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${TAILWIND_COLORS.TEXT_PRIMARY} bg-white hover:bg-gray-50`}>
              Previous
            </button>
            <button className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${TAILWIND_COLORS.TEXT_PRIMARY} bg-white hover:bg-gray-50`}>
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredLogs.length}</span> of{' '}
                <span className="font-medium">{logs.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} hover:bg-gray-50`}>
                  Previous
                </button>
                <button className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} hover:bg-gray-50`}>
                  1
                </button>
                <button className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED} hover:bg-gray-50`}>
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Details Modal */}
      <CertificateDetailsModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        certificateId={selectedCertificateId}
      />

    </div>
  )
}

export default IssuanceLogs
