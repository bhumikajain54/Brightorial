import React, { useState, useEffect } from 'react'
import { 
  LuX,
  LuAward,
  LuMail,
  LuPhone,
  LuCalendar,
  LuDownload,
  LuUser,
  LuGraduationCap
} from 'react-icons/lu'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import { getMethod, postMultipart } from '../../../../service/api'
import apiService from '../../services/serviceUrl'

function CertificateDetailsModal({ isOpen, onClose, certificateId }) {
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch certificate details when modal opens
  useEffect(() => {
    const fetchCertificateDetails = async () => {
      if (!isOpen || !certificateId) {
        // Reset state when modal closes
        setCertificate(null)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Step 1: Fetch certificate details using certificates_issuance.php with postMultipart (like CertificateGeneration.jsx)
        
        // Create FormData to send certificate_id (like CertificateGeneration.jsx uses postMultipart)
        const formData = new FormData();
        formData.append("id", certificateId);
        
        const response = await postMultipart({
          apiUrl: `${apiService.certificatesIssuance}?id=${certificateId}`, // Use certificates_issuance.php?id=xxx with postMultipart (returns: certificate_id, file_url, student_name, student_email, phone_number, course_title, batch_name, issue_date, status)
          data: formData, // Send FormData with id
        })


        // Expected API Response structure from certificates_issuance.php?id={certificateId}:
        // {
        //   "status": true,
        //   "message": "Certificate record found",
        //   "data": {
        //     "certificate_id": 1,
        //     "file_url": "http://localhost/jobsahi-API/api/uploads/institute_certificate/certificate_3.pdf",
        //     "student_name": "Aarti Nathani",
        //     "student_email": "himanshu.app@gmail.com",
        //     "phone_number": "1245124512",
        //     "institute_name": "Brightorial Institute",
        //     "course_title": "Assistant Electrician",
        //     "batch_name": "Assistant Electrician - March 2025 (Morning Batch)",
        //     "issue_date": "2025-11-22",
        //     "template_description": "This is my updated certificate description",  // ✅ From database via certificate_templates join
        //     "template_logo": "http://localhost/jobsahi-API/api/uploads/institute_certificate_templates/logo_xxx.png",  // ✅ NEW: Full URL from database
        //     "template_seal": "http://localhost/jobsahi-API/api/uploads/institute_certificate_templates/seal_xxx.png",  // ✅ NEW: Full URL from database
        //     "template_signature": "http://localhost/jobsahi-API/api/uploads/institute_certificate_templates/signature_xxx.png",  // ✅ NEW: Full URL from database
        //     "status": "approved"
        //   }
        // }
        // Note: response.data is a single object (not an array) for single certificate view with ?id=xxx
        // All template data (logo, seal, signature, description) comes directly from certificates_issuance.php response

        if (response?.status && response?.data) {
          // Extract certificate data - handle both object and array formats
          const certificateData = Array.isArray(response.data) ? response.data[0] : response.data
          
          // Validate that we have the required certificate data
          if (!certificateData || typeof certificateData !== 'object') {
            setError("Invalid certificate data received from server.");
            return;
          }
          
          // Extract basic certificate data from certificates_issuance.php response
          const extractedFileUrl = certificateData.file_url || certificateData.fileUrl || '';
          
          // Extract phone with multiple fallbacks (handle different field names and nested structures)
          const phoneNumber = certificateData.phone_number || 
                             certificateData.phone || 
                             certificateData.phoneNumber ||
                             certificateData.student?.phone ||
                             certificateData.student?.phone_number ||
                             '';
          
          // Extract batch with multiple fallbacks (handle different field names and nested structures)
          const batchName = certificateData.batch_name || 
                           certificateData.batch || 
                           certificateData.batchName ||
                           certificateData.batch?.name ||
                            '';
          
          // Step 2: Extract template data directly from certificates_issuance.php response (no additional API calls needed)
          // The API now returns template_logo, template_seal, template_signature, template_description directly
          let logoUrl = '';
          let sealUrl = '';
          let signatureUrl = '';
          let templateName = '';
          let description = '';
          let templateId = null;
          let templateData = null;
          
          // ✅ PRIMARY: Extract template media URLs directly from certificates_issuance.php response
          // These come from the certificate_templates table join in the PHP API
          // URLs point to: institute_certificate_templates folder (from database)
          logoUrl = certificateData.template_logo || 
                   certificateData.logo_url || 
                   certificateData.logo || 
                   '';
          
          sealUrl = certificateData.template_seal || 
                   certificateData.seal_url || 
                   certificateData.seal || 
                   '';
          
          signatureUrl = certificateData.template_signature || 
                        certificateData.signature_url || 
                        certificateData.signature || 
                        '';
          
          description = certificateData.template_description || 
                       certificateData.description || 
                       '';
          
          // Template name: Use course_title as primary (since certificates_issuance.php doesn't return template_name)
          // This matches the certificate preview where course title is the main title
          templateName = certificateData.course_title || 
                        certificateData.course || 
                        certificateData.template_name || 
                              '';
          
          // ✅ FALLBACK: If template media URLs are not in certificates_issuance.php response, fetch from certificate_templates.php
          // This is a fallback for backward compatibility (if API doesn't return media URLs)
          const needsTemplateAPI = !logoUrl || !sealUrl || !signatureUrl;
          
          if (needsTemplateAPI) {
            
            // Try to get template_id to fetch template details
            templateId = certificateData.template_id || 
                        certificateData.templateId || 
                        certificateData.template?.id || 
                        certificateData.template?.template_id ||
                        null;
            
            // If template_id not in response, try get-certificate.php
            if (!templateId) {
              try {
                const templateIdResponse = await getMethod({
                  apiUrl: `${apiService.getCertificate}?id=${certificateId}`,
                });
                
                if (templateIdResponse?.status && templateIdResponse?.data) {
                  const templateIdData = Array.isArray(templateIdResponse.data) ? templateIdResponse.data[0] : templateIdResponse.data;
                  templateId = templateIdData.template_id || templateIdData.templateId || templateIdData.id || null;
                }
              } catch (templateIdError) {
              }
            }
            
            // Fetch template details from certificate_templates.php if template_id found
            if (templateId && templateId !== '' && templateId !== '0' && templateId !== 0) {
              try {
                const templateResponse = await getMethod({
                  apiUrl: `${apiService.getCertificateTemplate}?id=${templateId}`,
                });
                
                if (templateResponse?.status && templateResponse?.data) {
                  if (Array.isArray(templateResponse.data)) {
                    templateData = templateResponse.data.find(t => 
                      String(t.id || t.template_id) === String(templateId)
                    ) || templateResponse.data[0];
                  } else {
                    templateData = templateResponse.data;
                  }
                  
                  // Use template API data only if not already extracted from certificates_issuance.php
                  // New API response format: logo, seal, signature (not logo_url, seal_url, signature_url)
                  logoUrl = logoUrl || templateData?.logo || templateData?.logo_url || '';
                  sealUrl = sealUrl || templateData?.seal || templateData?.seal_url || '';
                  signatureUrl = signatureUrl || templateData?.signature || templateData?.signature_url || '';
                  // Keep course_title as templateName (don't override with template API)
                  templateName = templateName || templateData?.template_name || templateData?.name || '';
                  description = description || templateData?.description || templateData?.footer_text || '';
                  
                }
              } catch (templateError) {
              }
            }
          } else {
          }
          
          const transformedData = {
            studentName: certificateData.student_name || 
                        certificateData.studentName || 
                        certificateData.student?.name ||
                        '',
            email: certificateData.student_email || 
                  certificateData.email || 
                  certificateData.studentEmail ||
                  certificateData.student?.email ||
                  '',
            phone: phoneNumber, // ✅ Extract phone with fallbacks
            course: certificateData.course_title || 
                   certificateData.course || 
                   certificateData.courseTitle ||
                   certificateData.course?.title ||
                   '',
            batch: batchName, // ✅ Extract batch with fallbacks
            instituteName: certificateData.institute_name || 
                          certificateData.instituteName || 
                          '',
            issuedDate: certificateData.issue_date || 
                       certificateData.issued_date || 
                       certificateData.issuedDate || 
                       certificateData.issueDate || 
                       '',
            status: (() => {
              const apiStatus = (certificateData.status || 'approved').toLowerCase();
              // Map API status "approved" to component status "issued"
              if (apiStatus === 'approved') return 'issued';
              if (apiStatus === 'pending') return 'pending';
              if (apiStatus === 'issued') return 'issued';
              return 'issued';
            })(),
            fileUrl: extractedFileUrl, // ✅ file_url from certificates_issuance.php?id={certificateId} response - REQUIRED for download (institute_certificate folder)
            certificateId: certificateData.certificate_id || certificateData.id || certificateData.certificateId || certificateId,
            // ✅ Dynamic media URLs and template metadata from certificates_issuance.php response (database API - no static data)
            templateName: templateName || certificateData?.course_title || certificateData?.course || '', // ✅ Primary: course_title (from certificates_issuance.php), fallback: from template API
            // ✅ Description from certificates_issuance.php (template_description), or fallback from template API - no static data
            description: description || certificateData?.template_description || '',
            logoUrl: logoUrl, // ✅ From certificates_issuance.php (template_logo) - institute_certificate_templates folder - no static data
            sealUrl: sealUrl, // ✅ From certificates_issuance.php (template_seal) - institute_certificate_templates folder - no static data
            signatureUrl: signatureUrl, // ✅ From certificates_issuance.php (template_signature) - institute_certificate_templates folder - no static data
          }

          setCertificate(transformedData)
        } else {
          setError(response?.message || "Failed to fetch certificate details.")
        }
      } catch (err) {
        // Provide more specific error messages
        if (err?.message?.includes('Network Error') || err?.message?.includes('CORS')) {
          setError("Network Error: Unable to connect to the server. Please check your connection or contact support.")
        } else if (err?.response?.status === 404) {
          setError("Certificate not found. Please verify the certificate ID.")
        } else if (err?.response?.status === 401 || err?.response?.status === 403) {
          setError("Authentication failed. Please log in again.")
        } else {
          setError(err?.message || "Something went wrong while fetching certificate details.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCertificateDetails()
  }, [isOpen, certificateId])

  if (!isOpen || !certificateId) return null

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
            <div className="bg-white px-6 py-12">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading certificate details...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
            <div className="bg-white px-6 py-12">
              <div className="text-center">
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>{error}</p>
                <button
                  onClick={onClose}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show certificate details if loaded
  if (!certificate) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Modal Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              {certificate.templateName || 'Certificate Details'}
            </h3>
            <button
              onClick={onClose}
              className={`text-gray-400 hover:text-gray-600 transition-colors duration-200`}
            >
              <LuX className="h-6 w-6" />
            </button>
          </div>
         
          {/* Modal Body */}
          <div className="bg-white px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Certificate Preview */}
              <div>
                {/* Certificate Preview Card - Matching first image design exactly */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
                  {/* Header Section - Logo and Seal */}
                  <div className="flex justify-between items-start mb-8">
                    {/* Top-Left Logo - Circular with Brightorial logo (dynamic from API) */}
                    {certificate.logoUrl ? (
                      <div className="h-16 w-16 flex items-center justify-center overflow-hidden rounded-full bg-black">
                        <img
                          src={certificate.logoUrl}
                          alt="Institute Logo"
                          className="object-contain h-full w-full rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 bg-black rounded-full flex items-center justify-center">
                        <LuAward className={`h-8 w-8 text-yellow-400`} />
                      </div>
                    )}
                    {/* Top-Right Seal - Red wax seal (dynamic from API) */}
                    {certificate.sealUrl ? (
                      <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
                        <img
                          src={certificate.sealUrl}
                          alt="Official Seal"
                          className="object-contain h-full w-full"
                        />
                    </div>
                    ) : (
                      <div className="h-16 w-16 bg-red-600 rounded-full flex items-center justify-center">
                        <LuGraduationCap className={`h-8 w-8 ${TAILWIND_COLORS.TEXT_INVERSE}`} />
                    </div>
                    )}
                  </div>

                  {/* Main Title - Template Name (like "Assistant Electrician") - Large, bold, italic, blue */}
                  {/* Dynamic from getCertificateTemplate API */}
                  <div className="text-center mb-4">
                    <h1 className={`text-4xl font-bold italic text-blue-600 mb-4`}>
                      {certificate.templateName || certificate.course || "Certificate of Completion"}
                    </h1>
                  </div>

                  {/* Description - Below main title, regular blue font */}
                  {/* Dynamic from getCertificateTemplate API */}
                  {certificate.description && (
                  <div className="text-center mb-8">
                      <p
                        className={`text-sm text-blue-600 max-w-2xl mx-auto leading-relaxed`}
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {certificate.description}
                      </p>
                    </div>
                  )}

                  {/* Recipient Name Section */}
                  <div className="text-center mb-6">
                    <h2 className={`text-3xl font-bold text-blue-600 mb-3`}>
                      {certificate.studentName}
                    </h2>
                    {/* Role/Course - Uppercase, regular blue font */}
                    <p className={`text-lg text-blue-600 uppercase tracking-wide`}>
                      {certificate.course}
                    </p>
                  </div>

                  {/* Footer Section - Date and Signature */}
                  <div className="flex justify-between items-end mb-6">
                    {/* Bottom-Left Date */}
                    <div className={`text-sm text-gray-800`}>
                      Date: {certificate.issuedDate || "—"}
                    </div>
                    {/* Bottom-Right Signature - White rectangular box with border (dynamic from API) */}
                    {certificate.signatureUrl ? (
                      <div className="bg-white border border-gray-300 rounded p-3 h-20 w-36 flex items-center justify-center overflow-hidden shadow-sm">
                        <img
                          src={certificate.signatureUrl}
                          alt="Authorized Signature"
                          className="object-contain h-full w-full"
                        />
                      </div>
                    ) : null}
                  </div>

                  {/* Download Button - Centered at bottom */}
                  {(certificate.certificateId || certificate.fileUrl) && (
                    <div className="flex justify-center mt-6">
                      {certificate.fileUrl ? (
                        <a
                          href={certificate.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200`}
                        >
                          <LuDownload className="h-5 w-5" />
                          <span>Download Certificate</span>
                        </a>
                      ) : certificate.certificateId ? (
                        <button
                          onClick={() => {
                            if (certificate.fileUrl) {
                              window.open(certificate.fileUrl, '_blank');
                            }
                          }}
                          className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200`}
                        >
                          <LuDownload className="h-5 w-5" />
                          <span>Download Certificate</span>
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Student & Certificate Info */}
              <div className="space-y-6">
                {/* Student Information Card */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 uppercase tracking-wide`}>
                    Student Information
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                        <LuUser className={`h-8 w-8 ${TAILWIND_COLORS.TEXT_PRIMARY}`} />
                      </div>
                    </div>
                    <div className="text-center mb-4">
                      <h5 className={`text-lg font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {certificate.studentName || 'N/A'}
                      </h5>
                    </div>
                    <div className="space-y-3 border-t border-gray-300 pt-4">
                      <div className="flex items-start">
                        <LuMail className={`h-5 w-5 ${TAILWIND_COLORS.TEXT_MUTED} mr-3 mt-0.5 flex-shrink-0`} />
                        <div>
                          <p className={`text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Email</p>
                        <span className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} break-all`}>
                            {certificate.email || 'N/A'}
                        </span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <LuPhone className={`h-5 w-5 ${TAILWIND_COLORS.TEXT_MUTED} mr-3 mt-0.5 flex-shrink-0`} />
                        <div>
                          <p className={`text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} mb-1`}>Phone</p>
                        <span className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                            {certificate.phone || 'N/A'}
                        </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificate Information Card */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 uppercase tracking-wide`}>
                    Certificate Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className={`text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase block mb-1`}>
                        Course Name
                      </label>
                      <p className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {certificate.course || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase block mb-1`}>
                        Batch
                      </label>
                      <p className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {certificate.batch || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase block mb-1`}>
                        Issue Date
                      </label>
                      <div className="flex items-center">
                        <LuCalendar className={`h-4 w-4 ${TAILWIND_COLORS.TEXT_MUTED} mr-2`} />
                        <p className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          {certificate.issuedDate || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${TAILWIND_COLORS.TEXT_MUTED} uppercase block mb-1`}>
                        Status
                      </label>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          certificate.status === 'issued' ? 'bg-green-500' : 
                          certificate.status === 'pending' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}></div>
                        <span className={`text-sm font-semibold ${
                          certificate.status === 'issued' ? 'text-green-600' : 
                          certificate.status === 'pending' ? 'text-blue-600' : TAILWIND_COLORS.TEXT_MUTED
                        }`}>
                          {(certificate.status || 'Issued').charAt(0).toUpperCase() + (certificate.status || 'Issued').slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="inline-flex justify-center items-center px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateDetailsModal

