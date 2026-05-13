import React, { useState, useEffect } from "react";
import {
  LuFileText,
  LuUser,
  LuPhone,
  LuMail,
  LuDownload,
  LuGraduationCap,
  LuAward,
  LuUpload,
} from "react-icons/lu";
import Swal from "sweetalert2";
import { TAILWIND_COLORS } from "../../../../shared/WebConstant";
import { getMethod, postMethod, postMultipart } from "../../../../service/api";
import apiService from "../../services/serviceUrl.js";

// Default values for template form
const DEFAULT_TEMPLATE_NAME = "";
const DEFAULT_CERTIFICATE_DESCRIPTION = "";

function CertificateGeneration() {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCertificates, setGeneratedCertificates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [sealFile, setSealFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [sealPreview, setSealPreview] = useState("");
  const [signaturePreview, setSignaturePreview] = useState("");
  // Store last template URLs for reuse
  const [lastTemplateLogoUrl, setLastTemplateLogoUrl] = useState("");
  const [lastTemplateSealUrl, setLastTemplateSealUrl] = useState("");
  const [lastTemplateSignatureUrl, setLastTemplateSignatureUrl] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [previewCertificates, setPreviewCertificates] = useState([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    return () => {
      [logoPreview, sealPreview, signaturePreview].forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [logoPreview, sealPreview, signaturePreview]);
  const [description, setDescription] = useState("");

  // ✅ Fetch all nested data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const nestedRes = await getMethod({
          apiUrl: apiService.CourseBatchStudents,
        });

        // Handle multiple possible response structures
        let coursesData = [];
        
        // Priority 1: Check if data is directly an array
        if (Array.isArray(nestedRes)) {
          coursesData = nestedRes;
        }
        // Priority 2: Check nestedRes.data as array
        else if (Array.isArray(nestedRes?.data)) {
          coursesData = nestedRes.data;
        }
        // Priority 3: Check nestedRes.courses as array
        else if (Array.isArray(nestedRes?.courses)) {
          coursesData = nestedRes.courses;
        }
        // Priority 4: Check nestedRes.data.courses
        else if (nestedRes?.data?.courses && Array.isArray(nestedRes.data.courses)) {
          coursesData = nestedRes.data.courses;
        }
        // Priority 5: Check nestedRes.data.data
        else if (nestedRes?.data?.data && Array.isArray(nestedRes.data.data)) {
          coursesData = nestedRes.data.data;
        }
        // Priority 6: Check if status is true/false and data exists
        else if ((nestedRes?.status === true || nestedRes?.status === 'success' || nestedRes?.success === true || nestedRes?.status === 1) && nestedRes?.data) {
          if (Array.isArray(nestedRes.data)) {
            coursesData = nestedRes.data;
          } else if (nestedRes.data.courses && Array.isArray(nestedRes.data.courses)) {
            coursesData = nestedRes.data.courses;
          } else if (typeof nestedRes.data === 'object' && !Array.isArray(nestedRes.data)) {
            // Try to find any array property in data object
            const dataKeys = Object.keys(nestedRes.data);
            for (const key of dataKeys) {
              if (Array.isArray(nestedRes.data[key])) {
                coursesData = nestedRes.data[key];
                break;
              }
            }
          }
        }
        // Priority 7: Check all top-level keys for arrays
        else if (nestedRes && typeof nestedRes === 'object') {
          const topLevelKeys = Object.keys(nestedRes);
          for (const key of topLevelKeys) {
            if (Array.isArray(nestedRes[key]) && nestedRes[key].length > 0) {
              // Check if first item looks like a course object
              const firstItem = nestedRes[key][0];
              if (firstItem && (firstItem.course_id || firstItem.id || firstItem.course_name || firstItem.title)) {
                coursesData = nestedRes[key];
                break;
              }
            }
          }
        }

        if (coursesData.length > 0) {
          const formattedCourses = coursesData.map((course) => ({
            id: course.course_id || course.id || course.courseId,
            title: course.course_name || course.title || course.courseName || course.name || course.course_title,
            batches: course.batches || course.batch_list || course.batchList || [],
          })).filter(course => course.id && course.title); // Filter out invalid courses
          
          setCourses(formattedCourses);
        } else {
          setCourses([]);
        }
      } catch (err) {
        setCourses([]);
      }
    };
    fetchData();
  }, []);

 useEffect(() => {
  const fetchTemplateDefaults = async () => {
    try {
      const resp = await getMethod({
        apiUrl: apiService.certificateTemplatesList,
      });
  
      // Handle multiple possible response structures
      let templatesData = [];
      
      if (resp?.status && Array.isArray(resp.data)) {
        templatesData = resp.data;
      } else if (Array.isArray(resp?.data)) {
        templatesData = resp.data;
      } else if (Array.isArray(resp)) {
        templatesData = resp;
      } else if (resp?.templates && Array.isArray(resp.templates)) {
        templatesData = resp.templates;
      }

      if (templatesData.length > 0) {
        setTemplates(templatesData);
  
        // Don't auto-select first template - let user choose
        // Reset to default "Choose a template"
        setSelectedTemplateId("");
        setTemplateName("");
        setDescription("");
        setLogoPreview("");
        setSealPreview("");
        setSignaturePreview("");
      } else {
        setTemplates([]);
        setSelectedTemplateId("");
      }
    } catch (error) {
      setTemplates([]);
    }
  };
  
  fetchTemplateDefaults();
}, []);
   // ✅ Select course
  const onCourseChange = (e) => {
    const cid = e.target.value;
    setSelectedCourse(cid);
    setSelectedBatch("");
    setStudents([]);
    setSelectedStudents([]);

    const selected = courses.find((c) => String(c.id) === cid);
    setBatches(selected?.batches || []);
  };

  // ✅ Select batch
  const onBatchChange = (e) => {
    const bid = e.target.value;
    setSelectedBatch(bid);

    const course = courses.find(
      (c) => String(c.id) === String(selectedCourse)
    );
    const batchObj = course?.batches?.find(
      (b) => String(b.batch_id || b.id || b.batchId) === String(bid)
    );

    // Handle multiple possible student data structures
    const studentsList = batchObj?.students || batchObj?.student_list || batchObj?.enrolled_students || [];
    
    let mappedStudents = studentsList.map((s) => ({
      id: s.student_id || s.id || s.studentId,
      name: s.name || s.student_name || s.user_name || '',
      email: s.email || s.student_email || '',
      phone: s.phone || s.phone_number || s.phoneNumber || '',
      enrollmentId: s.student_id || s.id || s.enrollment_id || s.studentId,
    }));

    // ✅ Remove duplicates (sometimes API sends same student twice)
    mappedStudents = mappedStudents.filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i
    );

    setStudents(mappedStudents);
    // Auto-select all students when batch is selected
    setSelectedStudents(mappedStudents.map(s => s.id));
  };

  // ✅ Select template
 const onTemplateChange = (e) => {
  const id = e.target.value;
  setSelectedTemplateId(id);

  const t = templates.find(x => String(x.id) === String(id));
  if (!t) return;

  setTemplateName(t.template_name);
  setDescription(t.description);

  setLogoPreview(t.logo || "");
  setSealPreview(t.seal || "");
  setSignaturePreview(t.signature || "");
};



  const handleAssetSelect = (setFile, setPreview, setLastTemplateUrl = null) => (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid File Type',
        text: 'Please select a valid image file (PNG, JPG, SVG, or WebP).',
        confirmButtonColor: '#5C9A24'
      })
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'File Too Large',
        text: 'File size must be less than 5MB.',
        confirmButtonColor: '#5C9A24'
      })
      return;
    }

    // Clear last template URL when user selects new file
    if (setLastTemplateUrl) {
      setLastTemplateUrl("");
    }

    setFile(file);
    setPreview((prevUrl) => {
      // Only revoke if it's a blob URL (from previous file upload)
      if (prevUrl && prevUrl.startsWith('blob:')) {
        URL.revokeObjectURL(prevUrl);
      }
      return URL.createObjectURL(file);
    });
  };

  const handleAssetRemove = (setFile, setPreview, setLastTemplateUrl = null) => () => {
    setFile(null);
    setPreview((prevUrl) => {
      // Only revoke if it's a blob URL (from file upload)
      if (prevUrl && prevUrl.startsWith('blob:')) {
        URL.revokeObjectURL(prevUrl);
      }
      return "";
    });
    // Clear last template URL when user removes
    if (setLastTemplateUrl) {
      setLastTemplateUrl("");
    }
  };

  // ✅ Generate certificates
  const handleGenerateCertificate = async () => {
    if (!selectedCourse || !selectedBatch || !completionDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in all required fields (Course, Batch, Date)',
        confirmButtonColor: '#5C9A24'
      })
      return;
    }

    if (selectedStudents.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Students Selected',
        text: 'Please select at least one student!',
        confirmButtonColor: '#5C9A24'
      })
      return;
    }

    // Validate template_id is selected (required by API)
    if (!selectedTemplateId) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a template from the dropdown.',
        confirmButtonColor: '#5C9A24'
      })
      return;
    }

    // Get template ID as integer
    const templateIdInt = parseInt(selectedTemplateId, 10);
    if (isNaN(templateIdInt) || templateIdInt <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Template',
        text: 'Selected template ID is invalid. Please select a valid template.',
        confirmButtonColor: '#5C9A24'
      })
      return;
    }

    setIsGenerating(true);
    try {
      const results = [];

      for (const studentId of selectedStudents) {
        // Prepare JSON payload according to new API format
        const payload = {
          student_id: parseInt(studentId, 10),
          course_id: parseInt(selectedCourse, 10),
          template_id: templateIdInt, // API expects template_id, not template_name
          issue_date: completionDate || new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
        };


        try {
          // Changed: Use postMethod with JSON payload instead of postMultipart
          const res = await postMethod({
            apiUrl: apiService.generateCertificate,
            payload: payload
          });


          // Check multiple possible success indicators
          const isSuccess = 
            res?.status === true || 
            res?.status === "success" || 
            res?.status === 1 ||
            res?.status === "true" ||
            res?.success === true ||
            res?.success === "true" ||
            (res?.data && Object.keys(res.data).length > 0) ||
            (res?.message && typeof res.message === 'string' && res.message.toLowerCase().includes('success'));
          

          if (isSuccess) {
            
            // Get student and course info from form data (fallback if API doesn't return)
            const student = students.find(s => String(s.id) === String(studentId));
            const course = courses.find(c => String(c.id) === String(selectedCourse));
            
            // Store the full response with certificate ID for preview
            // API response format: { status: true, message: "...", data: { certificate_id, file_url, ... } }
            const certificateData = {
              ...(res.data || {}),
              response: res,
              student_id: studentId,
              course_id: selectedCourse,
              // Extract certificate_id from API response (format: "CERT-2025-001")
              certificate_id: res?.data?.certificate_id || 
                            res?.certificate_id,
              // Store other response data (with fallbacks from form data)
              file_url: res?.data?.file_url,
              template_name: res?.data?.template_name || templateName,
              student_name: res?.data?.student_name || student?.name || "Student Name",
              course_title: res?.data?.course_title || course?.title || "Course Title",
              description_used: res?.data?.description_used || description
            };
            results.push(certificateData);
          } else if (res && (res.data || res.certificate_id || res.id)) {
            // Even if status check failed, if we have data, try to use it
            const certificateData = {
              ...(res.data || {}),
              ...res,
              response: res,
              student_id: studentId,
              course_id: selectedCourse,
              batch_id: selectedBatch,
              certificate_id: res?.data?.certificate_id || 
                            res?.data?.id || 
                            res?.certificate_id || 
                            res?.id
            };
            results.push(certificateData);
          } else {
            // Check if error is due to certificate already existing
            const errorMessage = res?.message || '';
            const isAlreadyExists = errorMessage.toLowerCase().includes('already exists') || 
                                   errorMessage.toLowerCase().includes('already generated');
            
            // Still show the error message to user
            Swal.fire({
              icon: isAlreadyExists ? 'info' : 'error',
              title: isAlreadyExists ? 'Certificate Already Generated' : 'Generation Failed',
              text: isAlreadyExists ? 'Certificate is already generated.' : (errorMessage || `Failed to generate certificate for student ID: ${studentId}.`),
              confirmButtonColor: '#5C9A24'
            });
          }
        } catch (apiError) {
          Swal.fire({
            icon: 'error',
            title: 'API Error',
            text: apiError?.message || `Error generating certificate for student ID: ${studentId}`,
            confirmButtonColor: '#5C9A24'
          });
        }
      }

      if (results.length > 0) {
        setGeneratedCertificates(results);
        
        // Fetch certificate details for preview
        setIsLoadingPreview(true);
        setShowCertificatePreview(true);
        
        try {
          const previewData = [];
          for (const result of results) {
            // Extract certificate ID from the response
            // API returns certificate_id as "CERT-2025-001" format
            const certificateId = result?.certificate_id;
            
            if (certificateId) {
              try {
                const certRes = await getMethod({
                  apiUrl: `${apiService.getCertificate}?id=${certificateId}`, // Call get-certificate.php for preview
                });
                
                
                if (certRes?.status && certRes?.data) {
                  // Merge fetched certificate data with generation response data to preserve student_id, course_id, etc.
                  const mergedData = {
                    ...result, // Keep original data (student_id, course_id, etc.)
                    ...certRes.data, // Override with fetched data
                    student_id: result?.student_id, // Preserve student_id from generation
                    course_id: result?.course_id, // Preserve course_id from generation
                    certificate_id: certificateId // Ensure certificate_id is set
                  };
                  previewData.push(mergedData);
                } else {
                  // If fetching fails, use the generation response data
                  previewData.push(result);
                }
              } catch (fetchError) {
                // Use the generation response data as fallback
                previewData.push(result);
              }
            } else {
              // No certificate ID, use the result directly - this allows preview even without ID
              previewData.push(result);
            }
          }
          
          setPreviewCertificates(previewData);
          
          // Only show success message if we have preview data
          if (previewData.length > 0) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: `${results.length} certificate(s) generated successfully!`,
              confirmButtonColor: '#5C9A24',
              timer: 2000
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'Preview Unavailable',
              text: 'Certificates were generated but preview could not be loaded.',
              confirmButtonColor: '#5C9A24'
            });
          }
        } catch (previewError) {
          // Still show preview with generation response data
          setPreviewCertificates(results);
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `${results.length} certificate(s) generated successfully!`,
            confirmButtonColor: '#5C9A24'
          });
        } finally {
          setIsLoadingPreview(false);
        }
      } else {
        Swal.fire({
          icon: 'info',
          title: 'No Certificates Generated',
          text: 'Certificate is already generated.',
          confirmButtonColor: '#5C9A24'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred. Check console logs.',
        confirmButtonColor: '#5C9A24'
      })
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ Download certificate (after generation preview)
  const handleDownloadCertificate = async (certificateId) => {
    try {
      const res = await getMethod({
        apiUrl: `${apiService.getCertificate}?id=${certificateId}`, // Changed: use get-certificate.php for preview
      });

      // Handle new API response format: { status: true, data: { file_url, ... } }
      const fileUrl = res?.data?.file_url || 
                     res?.data?.certificate_info?.file_url || 
                     res?.file_url;

      if (res?.status && fileUrl) {
        window.open(fileUrl, "_blank");
      } else {
        Swal.fire({
          icon: 'error',
          title: 'File Not Found',
          text: 'Certificate file not found or not available!',
          confirmButtonColor: '#5C9A24'
        })
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to download certificate',
        confirmButtonColor: '#5C9A24'
      })
    }
  };

  // ✅ Create template
  const handleCreateTemplate = async () => {
  
  if (!templateName.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Validation Error',
      text: 'Please provide a template name.',
      confirmButtonColor: '#5C9A24'
    });
    return;
  }
  if (!description.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Validation Error',
      text: 'Please provide a description.',
      confirmButtonColor: '#5C9A24'
    });
    return;
  }
  
  // Check if files are uploaded OR last template URLs are available
  const hasLogo = logoFile || lastTemplateLogoUrl;
  const hasSeal = sealFile || lastTemplateSealUrl;
  const hasSignature = signatureFile || lastTemplateSignatureUrl;
  
  if (!hasLogo || !hasSeal || !hasSignature) {
    return Swal.fire({
      icon: 'warning',
      title: 'Assets Required',
      text: 'Please upload logo, seal, and signature, or they will be reused from last template.',
      confirmButtonColor: '#5C9A24'
    });
  }

  setIsCreatingTemplate(true);

  try {
    // First, refresh templates list to get latest data
    
    const refreshResp = await getMethod({
      apiUrl: apiService.certificateTemplatesList,
    });

    let latestTemplates = templates;
    if (refreshResp?.status && Array.isArray(refreshResp.data)) {
      latestTemplates = refreshResp.data;
      setTemplates(latestTemplates);
    }

    // Check if template name already exists in latest templates list
    const existingTemplate = latestTemplates.find(
      (t) => {
        const existingName = (t.template_name || "").toLowerCase().trim();
        const newName = templateName.toLowerCase().trim();
        return existingName === newName && existingName !== "";
      }
    );

    if (existingTemplate) {
      setIsCreatingTemplate(false);
      return Swal.fire({
        title: "Template Exists",
        text: `Template "${templateName}" already exists. Please use a different name.`,
        icon: "warning"
      });
    }


    const formData = new FormData();

    formData.append("template_name", templateName.trim());
    formData.append("description", description.trim());
    formData.append("is_active", "1");
    formData.append("admin_action", "approved");

    // Append files if user uploaded new ones, otherwise use last template URLs
    if (logoFile) {
      formData.append("logo", logoFile);
    } else if (lastTemplateLogoUrl) {
      formData.append("logo_url", lastTemplateLogoUrl);
    }

    if (sealFile) {
      formData.append("seal", sealFile);
    } else if (lastTemplateSealUrl) {
      formData.append("seal_url", lastTemplateSealUrl);
    }

    if (signatureFile) {
      formData.append("signature", signatureFile);
    } else if (lastTemplateSignatureUrl) {
      formData.append("signature_url", lastTemplateSignatureUrl);
    }

    
    const res = await postMultipart({
      apiUrl: apiService.createCertificateTemplate,
      data: formData, // Fixed: use 'data' instead of 'formData'
    });


    if (res?.status) {
      Swal.fire("Success", "Template created successfully", "success");

      // 🔥 Refresh template list
      const resp = await getMethod({
        apiUrl: apiService.certificateTemplatesList,
      });

      if (resp?.status) {
        setTemplates(resp.data);
        // Select the newly created template
        const newTemplate = resp.data.find(
          (t) => t.template_name?.toLowerCase().trim() === templateName.toLowerCase().trim()
        );
        if (newTemplate) {
          setSelectedTemplateId(newTemplate.id || newTemplate.template_id);
        }
      }

      // Don't close modal, show preview instead
      setShowPreview(true);
      // Keep template data for preview (don't reset)
    } else {
      // If backend says "already exists" but template not in our list, refresh and check
      const errorMessage = res?.message || res?.data?.message || "";
      
      if (errorMessage.toLowerCase().includes("already exists") || 
          // errorMessage.toLowerCase().includes("already exist") ||
          errorMessage.toLowerCase().includes("duplicate")) {
        
        
        // Refresh templates list to verify
        const resp = await getMethod({
          apiUrl: apiService.certificateTemplatesList,
        });


        if (resp?.status && Array.isArray(resp.data)) {
          setTemplates(resp.data);
          
          // Check again after refresh - check all possible name fields
          const existsAfterRefresh = resp.data.find(
            (t) => {
              const existingName = (t.template_name || t.name || "").toLowerCase().trim();
              const newName = templateName.toLowerCase().trim();
              return existingName === newName && existingName !== "";
            }
          );

          if (existsAfterRefresh) {
            Swal.fire({
              title: "Template Exists",
              text: `Template "${templateName}" already exists in the system.`,
              icon: "warning"
            });
          } else {
            // Template doesn't exist, might be backend issue - show detailed error
            Swal.fire({
              title: "Validation Error",
              text: `Backend validation failed: ${errorMessage}. Please check if a similar template name exists (case-sensitive) or try a different name.`,
              icon: "error"
            });
          }
        } else {
          Swal.fire("Failed", errorMessage || "Could not verify template existence", "error");
        }
      } else {
        Swal.fire("Failed", errorMessage || "Template creation failed", "error");
      }
    }
  } catch (err) {
    Swal.fire("Error", err?.message || "Something went wrong", "error");
  } finally {
    setIsCreatingTemplate(false);
  }
};

  

  const assetInputs = [
    {
      key: "logo",
      label: "Institute Logo",
      helper: "PNG / JPG / WebP up to 5MB",
      file: logoFile,
      preview: logoPreview,
      setFile: setLogoFile,
      setPreview: setLogoPreview,
      setLastTemplateUrl: setLastTemplateLogoUrl,
      inputId: "template-logo-upload",
    },
    {
      key: "seal",
      label: "Official Seal",
      helper: "PNG / JPG / WebP up to 5MB",
      file: sealFile,
      preview: sealPreview,
      setFile: setSealFile,
      setPreview: setSealPreview,
      setLastTemplateUrl: setLastTemplateSealUrl,
      inputId: "template-seal-upload",
    },
    {
      key: "signature",
      label: "Authorized Signature",
      helper: "PNG / JPG / WebP up to 5MB",
      file: signatureFile,
      preview: signaturePreview,
      setFile: setSignatureFile,
      setPreview: setSignaturePreview,
      setLastTemplateUrl: setLastTemplateSignatureUrl,
      inputId: "template-signature-upload",
    },
  ];

  const renderCertificateFormSections = ({
    actionLabel = "Generate Certificate",
    includeCreateButton = false,
  } = {}) => {
    const buttonText = isGenerating ? "Generating..." : actionLabel;

    return (
      <>
        <div className="mb-10">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {includeCreateButton ? (
                <div>
                  <label className="block text-sm font-medium mb-2">SELECT TEMPLATE</label>
                  <select
                    value={selectedTemplateId}
                    onChange={onTemplateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Choose a template</option>
                    {templates.map((template) => (
                      <option 
                        key={template.template_id || template.id} 
                        value={template.template_id || template.id}
                      >
                        {template.template_name || ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">TEMPLATE NAME</label>
                  <input
                    type="text"
                    value={templateName || ""}
                    onChange={(e) => {
                      setTemplateName(e.target.value);
                    }}
                    placeholder="Enter template name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {templateName && (
                    <p className="text-xs text-gray-500 mt-1">Current value: "{templateName}"</p>
                  )}
                </div>
              )}
            </div>

            {!includeCreateButton && (
              <div>
                <label className="block text-sm font-medium mb-2">DESCRIPTION</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-y min-h-[120px]"
                />
                <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-1`}>
                  {description.length} characters
                </p>
              </div>
            )}
          </div>

          {!includeCreateButton && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {assetInputs.map(
                  ({ key, label, helper, file, preview, setFile, setPreview, setLastTemplateUrl, inputId }) => (
                    <div key={key} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2 uppercase">
                          {label}
                        </label>
                      </div>
                      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                        <input
                          type="file"
                          id={inputId}
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleAssetSelect(setFile, setPreview, setLastTemplateUrl)}
                          className="hidden"
                        />
                        {preview ? (
                          <div className="space-y-3">
                            <div className="h-32 w-full bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                              <img
                                src={preview}
                                alt={`${label} preview`}
                                className="object-contain h-full w-full"
                              />
                            </div>
                            <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} truncate`}>
                              {file?.name || (preview.includes('http') || preview.includes('/uploads') ? 'From last template' : 'Preview')}
                            </p>
                            <div className="flex items-center justify-center gap-4 text-sm">
                              <label
                                htmlFor={inputId}
                                className={`${TAILWIND_COLORS.TEXT_SUCCESS} hover:underline cursor-pointer`}
                              >
                                {file ? 'Change' : 'Upload New'}
                              </label>
                              <button
                                type="button"
                                onClick={handleAssetRemove(setFile, setPreview, setLastTemplateUrl)}
                                className="text-red-500 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <LuUpload className={`h-8 w-8 ${TAILWIND_COLORS.TEXT_MUTED} mx-auto`} />
                            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                              Click browse to upload an image
                            </p>
                            <label
                              htmlFor={inputId}
                              className={`inline-block bg-gray-100 hover:bg-gray-200 ${TAILWIND_COLORS.TEXT_PRIMARY} px-3 py-1 rounded text-sm cursor-pointer`}
                            >
                              Browse Files
                            </label>
                            <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>{helper}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
              
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleCreateTemplate}
                  disabled={
                    isCreatingTemplate || 
                    !templateName.trim() || 
                    !description.trim() || 
                    (!logoFile && !lastTemplateLogoUrl) || 
                    (!sealFile && !lastTemplateSealUrl) || 
                    (!signatureFile && !lastTemplateSignatureUrl)
                  }
                  className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${TAILWIND_COLORS.TEXT_INVERSE} ${
                    isCreatingTemplate || 
                    !templateName.trim() || 
                    !description.trim() || 
                    (!logoFile && !lastTemplateLogoUrl) || 
                    (!sealFile && !lastTemplateSealUrl) || 
                    (!signatureFile && !lastTemplateSignatureUrl)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <LuFileText className="h-5 w-5" />
                  <span>{isCreatingTemplate ? "Creating..." : "Create "}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {includeCreateButton && (
          <>
            <div className="mb-8">
              <h4 className={`text-md font-medium ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SELECT COURSE</label>
                  <select
                    value={selectedCourse}
                    onChange={onCourseChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Choose a course</option>
                    {courses && courses.length > 0 ? (
                      courses.map((course) => {
                        const courseId = course.id || course.course_id || course.courseId;
                        const courseTitle = course.title || course.course_name || course.name || course.courseName || `Course ${courseId}`;
                        return (
                          <option key={courseId} value={courseId}>
                            {courseTitle}
                          </option>
                        );
                      })
                    ) : (
                      <option value="" disabled>No courses available</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">SELECT BATCH</label>
                  <select
                    value={selectedBatch}
                    onChange={onBatchChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Choose a batch</option>
                    {batches.map((batch) => {
                      const batchId = batch.batch_id || batch.id || batch.batchId;
                      const batchName = batch.batch_name || batch.name || batch.batchName || `Batch ${batchId}`;
                      return (
                        <option key={batchId} value={batchId}>
                          {batchName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">COMPLETION DATE</label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-md font-medium mb-4">Student in Batch</h4>
              <div className="space-y-3">
                {students.map((student) => {
                  const isSelected = selectedStudents.includes(student.id);
                  return (
                    <div
                      key={`${student.id}-${student.email || student.phone}`}
                      className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mr-4 cursor-pointer"
                      />
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                        <LuUser className={`h-6 w-6 ${TAILWIND_COLORS.TEXT_PRIMARY}`} />
                      </div>
                      <div className="flex-1">
                        <h5 className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{student.name}</h5>
                        <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                          Enrollment ID: {student.enrollmentId}
                        </p>
                      </div>
                      <div className={`flex items-center space-x-4 text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        <div className="flex items-center">
                          <LuPhone className="h-4 w-4 mr-1" />
                          {student.phone || "-"}
                        </div>
                        <div className="flex items-center">
                          <LuMail className="h-4 w-4 mr-1" />
                          {student.email || "-"}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!students.length && (
                  <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                    No students to show. Select a course & batch.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleGenerateCertificate}
                disabled={isGenerating || !students.length}
                className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${TAILWIND_COLORS.TEXT_INVERSE} ${
                  isGenerating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <LuFileText className="h-5 w-5" />
                <span>{buttonText}</span>
              </button>
            </div>
          </>
        )}
      </>
    );
  };

  // Template Preview (for after template creation)
  const renderTemplatePreview = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className={`text-lg font-semibold mb-1 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
        Template Preview
      </h3>
      <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-6`}>
        Preview of your certificate template
      </p>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex justify-between items-start mb-6">
          {logoPreview ? (
            <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
              <img
                src={logoPreview}
                alt="Institute Logo"
                className="object-contain h-full w-full"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <LuAward className={`h-6 w-6 ${TAILWIND_COLORS.TEXT_INVERSE}`} />
            </div>
          )}
          {sealPreview ? (
            <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
              <img
                src={sealPreview}
                alt="Official Seal"
                className="object-contain h-full w-full"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center">
              <LuGraduationCap className={`h-6 w-6 ${TAILWIND_COLORS.TEXT_INVERSE}`} />
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold italic mb-4 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            {templateName?.trim() || "Template Name"}
          </h1>
          <p
            className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} max-w-2xl mx-auto leading-relaxed`}
            style={{ whiteSpace: "pre-line" }}
          >
            {description?.trim() || "Template description will appear here"}
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
            Date: —
          </div>
          {signaturePreview ? (
            <div className="h-16 w-32 flex items-center justify-center overflow-hidden">
              <img
                src={signaturePreview}
                alt="Authorized Signature"
                className="object-contain h-full w-full"
              />
            </div>
          ) : (
            <div className="h-16 w-32 bg-gray-200 rounded flex items-center justify-center">
              <span className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>Signature</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ✅ Render certificate preview after generation (fetched from API)
  const renderGeneratedCertificatePreview = () => {
    if (isLoadingPreview) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading certificate preview...</p>
            </div>
          </div>
        </div>
      );
    }

    if (previewCertificates.length === 0) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-lg font-semibold mb-1 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Certificate Preview
            </h3>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
              Preview of the generated certificates
            </p>
          </div>
          <button
            onClick={() => {
              setShowCertificatePreview(false);
              setPreviewCertificates([]);
            }}
            className={`px-4 py-2 text-sm ${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY} border border-gray-300 rounded-md hover:bg-gray-50`}
          >
            Close Preview
          </button>
        </div>

        <div className="space-y-6">
          {previewCertificates.map((certData, index) => {
            // Extract data from new API response format
            // API returns: { status: true, data: { certificate_id, file_url, template_name, student_name, course_title, description_used } }
            const certInfo = certData?.data || certData;
            const certificateId = certData?.certificate_id || certInfo?.certificate_id;
            const fileUrl = certData?.file_url || certInfo?.file_url;
            
            // Get student and course info from form data as fallback
            const studentId = certData?.student_id;
            const courseId = certData?.course_id;
            const student = students.find(s => String(s.id) === String(studentId));
            const course = courses.find(c => String(c.id) === String(courseId));
            
            // Extract fields with fallback to form data (use different variable names to avoid conflicts)
            const displayTemplateName = certData?.template_name || certInfo?.template_name || templateName;
            const displayStudentName = certData?.student_name || 
                              certInfo?.student_name || 
                              student?.name || 
                              "Student Name";
            const displayCourseTitle = certData?.course_title || 
                              certInfo?.course_title || 
                              course?.title || 
                              "Course Title";
            const displayDescription = certData?.description_used || 
                                  certInfo?.description_used || 
                                  description;

            return (
              <div
                key={certificateId || index}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gradient-to-br from-blue-50 to-indigo-50"
              >
                <div className="flex justify-between items-start mb-6">
                  {logoPreview ? (
                    <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Institute Logo"
                        className="object-contain h-full w-full"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <LuAward className={`h-6 w-6 ${TAILWIND_COLORS.TEXT_INVERSE}`} />
                    </div>
                  )}
                  {sealPreview ? (
                    <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
                      <img
                        src={sealPreview}
                        alt="Official Seal"
                        className="object-contain h-full w-full"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center">
                      <LuGraduationCap className={`h-6 w-6 ${TAILWIND_COLORS.TEXT_INVERSE}`} />
                    </div>
                  )}
                </div>

                <div className="text-center mb-8">
                  <h1 className={`text-3xl font-bold italic mb-4 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                    {displayTemplateName || "Certificate of Completion"}
                  </h1>
                  <p
                    className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} max-w-2xl mx-auto leading-relaxed`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {displayDescription || ""}
                  </p>
                </div>

                <div className="text-center mb-8">
                  <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                    {displayStudentName}
                  </h2>
                  <p className={`text-lg ${TAILWIND_COLORS.TEXT_PRIMARY} uppercase tracking-wide`}>
                    {displayCourseTitle}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                    Date: {completionDate || "—"}
                  </div>
                  {signaturePreview ? (
                    <div className="h-16 w-32 flex items-center justify-center overflow-hidden">
                      <img
                        src={signaturePreview}
                        alt="Authorized Signature"
                        className="object-contain h-full w-full"
                      />
                    </div>
                  ) : null}
                </div>

                {(certificateId || fileUrl) && (
                  <div className="flex justify-center mt-6">
                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`bg-green-600 hover:bg-green-700 ${TAILWIND_COLORS.TEXT_INVERSE} px-6 py-3 rounded-lg flex items-center space-x-2`}
                      >
                        <LuDownload className="h-5 w-5" />
                        <span>Download Certificate</span>
                      </a>
                    ) : certificateId ? (
                      <button
                        onClick={() => handleDownloadCertificate(certificateId)}
                        className={`bg-green-600 hover:bg-green-700 ${TAILWIND_COLORS.TEXT_INVERSE} px-6 py-3 rounded-lg flex items-center space-x-2`}
                      >
                        <LuDownload className="h-5 w-5" />
                        <span>Download Certificate</span>
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCertificatePreview = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className={`text-lg font-semibold mb-1 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
        Certificate Preview
      </h3>
      <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED} mb-6`}>
        Preview of the generated certificate
      </p>

      {selectedStudents.length > 0 ? (
        selectedStudents.map((studentId) => {
          const student = students.find((s) => s.id === studentId);
          const course = courses.find((c) => String(c.id) === String(selectedCourse));
          if (!student) return null;

          return (
            <div
              key={studentId}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50"
            >
              <div className="flex justify-between items-start mb-6">
                {logoPreview ? (
                  <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Institute Logo"
                      className="object-contain h-full w-full"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <LuAward className={`h-6 w-6 ${TAILWIND_COLORS.TEXT_INVERSE}`} />
                  </div>
                )}
                {sealPreview ? (
                  <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
                    <img
                      src={sealPreview}
                      alt="Official Seal"
                      className="object-contain h-full w-full"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center">
                    <LuGraduationCap className={`h-6 w-6 ${TAILWIND_COLORS.TEXT_INVERSE}`} />
                  </div>
                )}
              </div>

              <div className="text-center mb-8">
                <h1 className={`text-3xl font-bold italic mb-4 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  {templateName?.trim() || ""}
                </h1>
                <p
                  className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} max-w-2xl mx-auto leading-relaxed`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {description?.trim() || ""}
                </p>
              </div>

              <div className="text-center mb-8">
                <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
                  {student.name}
                </h2>
                <p className={`text-lg ${TAILWIND_COLORS.TEXT_PRIMARY} uppercase tracking-wide`}>
                  {course?.title || ""}
                </p>
              </div>

              <div className="flex justify-between items-end">
                <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                  Date: {completionDate || "—"}
                </div>
                {signaturePreview && (
                  <div className="h-16 w-32 flex items-center justify-center overflow-hidden">
                    <img
                      src={signaturePreview}
                      alt="Authorized Signature"
                      className="object-contain h-full w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start mb-6">
            {logoPreview ? (
              <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
                <img
                  src={logoPreview}
                  alt="Institute Logo"
                  className="object-contain h-full w-full"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <LuAward className={`h-6 w-6 ${TAILWIND_COLORS.TEXT_INVERSE}`} />
              </div>
            )}
            {sealPreview ? (
              <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
                <img
                  src={sealPreview}
                  alt="Official Seal"
                  className="object-contain h-full w-full"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center">
                <LuGraduationCap className={`h-6 w-6 ${TAILWIND_COLORS.TEXT_INVERSE}`} />
              </div>
            )}
          </div>

          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold italic mb-4 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              {templateName?.trim() || ""}
            </h1>
            <p
              className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} max-w-2xl mx-auto leading-relaxed`}
              style={{ whiteSpace: "pre-line" }}
            >
              {description?.trim() || ""}
            </p>
          </div>

          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-2`}>
              {""}
            </h2>
            <p className={`text-lg ${TAILWIND_COLORS.TEXT_PRIMARY} uppercase tracking-wide`}>
              {""}
            </p>
          </div>

          <div className="flex justify-between items-end">
            <div className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
              Date: {completionDate || "—"}
            </div>
            {signaturePreview && (
              <div className="h-16 w-32 flex items-center justify-center overflow-hidden">
                <img
                  src={signaturePreview}
                  alt="Authorized Signature"
                  className="object-contain h-full w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => handleDownloadCertificate("preview-certificate")}
          className={`bg-green-600 hover:bg-green-700 ${TAILWIND_COLORS.TEXT_INVERSE} px-6 py-3 rounded-lg flex items-center space-x-2`}
        >
          <LuDownload className="h-5 w-5" />
          <span>Direct Download</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Certificate Preview (after generation) - Called via get-certificate.php */}
      {showCertificatePreview && renderGeneratedCertificatePreview()}

      {/* Certificate Generation */}
      {!showCertificatePreview && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
          <button
            type="button"
            onClick={() => {
              // Pre-populate with last template's assets if available
              if (templates.length > 0) {
                const lastTemplate = templates[templates.length - 1];
                if (lastTemplate) {
                  // Set previews from last template
                  if (lastTemplate.logo) {
                    setLogoPreview(lastTemplate.logo);
                    setLastTemplateLogoUrl(lastTemplate.logo);
                  }
                  if (lastTemplate.seal) {
                    setSealPreview(lastTemplate.seal);
                    setLastTemplateSealUrl(lastTemplate.seal);
                  }
                  if (lastTemplate.signature) {
                    setSignaturePreview(lastTemplate.signature);
                    setLastTemplateSignatureUrl(lastTemplate.signature);
                  }
                }
              }
              setIsTemplateModalOpen(true);
            }}
            className={`absolute top-6 right-6 px-4 py-2 bg-green-600 ${TAILWIND_COLORS.TEXT_INVERSE} rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap flex items-center space-x-2 shadow-md`}
          >
            <LuFileText className="h-4 w-4" />
            <span>Create Template</span>
          </button>

          {renderCertificateFormSections({ includeCreateButton: true })}
        </div>
      )}

      {/* Generated Certificates List */}
      {generatedCertificates.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4`}>
            Generated Certificates ({generatedCertificates.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedCertificates.map((cert, index) => {
              const certId = cert?.certificate_id || cert?.id || cert?.data?.certificate_id || index;
              const studentName = cert?.student_name || cert?.data?.student_name || `Student ${index + 1}`;
              const fileUrl = cert?.file_url || cert?.data?.file_url || cert?.certificate_url;
              
              return (
                <div key={certId} className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <LuAward className={`w-5 h-5 ${TAILWIND_COLORS.TEXT_PRIMARY}`} />
                      <span className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        {studentName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (fileUrl) {
                          window.open(fileUrl, '_blank');
                        } else if (certId) {
                          handleDownloadCertificate(certId);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 ${TAILWIND_COLORS.TEXT_INVERSE} rounded-md text-sm transition-colors`}
                    >
                      <LuDownload className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Certificate Preview */}
      {/* {renderCertificatePreview()} */}

      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  Create Certificate Template
                </h3>
               
              </div>
              <button
                type="button"
                onClick={() => {
                  // Reset form when closing modal
                  setTemplateName(DEFAULT_TEMPLATE_NAME);
                  setDescription(DEFAULT_CERTIFICATE_DESCRIPTION);
                  setLogoFile(null);
                  setSealFile(null);
                  setSignatureFile(null);
                  setLogoPreview("");
                  setSealPreview("");
                  setSignaturePreview("");
                  setLastTemplateLogoUrl("");
                  setLastTemplateSealUrl("");
                  setLastTemplateSignatureUrl("");
                  setShowPreview(false);
                  setIsTemplateModalOpen(false);
                }}
                className={`${TAILWIND_COLORS.TEXT_MUTED} hover:text-text-primary text-sm font-medium`}
              >
                Close
              </button>
            </div>
            <div className="space-y-6">
              {!showPreview && renderCertificateFormSections()}
              {showPreview && (
                <>
                  {renderTemplatePreview()}
                  {/* Confirm Button - Show after template preview */}
                  <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPreview(false);
                        setIsTemplateModalOpen(false);
                        // Reset form after closing
                        setTemplateName(DEFAULT_TEMPLATE_NAME);
                        setDescription(DEFAULT_CERTIFICATE_DESCRIPTION);
                        setLogoFile(null);
                        setSealFile(null);
                        setSignatureFile(null);
                        setLogoPreview("");
                        setSealPreview("");
                        setSignaturePreview("");
                        setLastTemplateLogoUrl("");
                        setLastTemplateSealUrl("");
                        setLastTemplateSignatureUrl("");
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        // Close modal first
                        setIsTemplateModalOpen(false);
                        setShowPreview(false);
                        
                        // Reset last template URLs for next time
                        setLastTemplateLogoUrl("");
                        setLastTemplateSealUrl("");
                        setLastTemplateSignatureUrl("");
                        
                        // Check if course, batch, students are selected for certificate generation
                        if (selectedCourse && selectedBatch && selectedStudents.length > 0 && completionDate) {
                          // Generate certificate immediately
                          await handleGenerateCertificate();
                        } else {
                          // Template is ready, user needs to select course, batch, students first
                          Swal.fire({
                            icon: 'info',
                            title: 'Template Created',
                            text: 'Template created successfully! Please select course, batch, and students to generate certificates.',
                            confirmButtonColor: '#5C9A24'
                          });
                        }
                      }}
                      className={`px-6 py-2 rounded-lg flex items-center space-x-2 bg-green-600 hover:bg-green-700 ${TAILWIND_COLORS.TEXT_INVERSE}`}
                    >
                      <LuAward className="h-5 w-5" />
                      <span>Confirm & Generate Certificate</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificateGeneration;
