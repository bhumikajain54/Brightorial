import React, { useState, useEffect } from "react";
import { LuUpload, LuFileText, LuFileImage, LuX } from "react-icons/lu";
import RichTextEditor from "../../../../shared/components/RichTextEditor";
import { TAILWIND_COLORS } from "../../../../shared/WebConstant";
import { putMultipart, getMethod } from "../../../../service/api";
import apiService from "../../services/serviceUrl";
import Swal from "sweetalert2";

function ManageTemplate() {
  const [creating, setCreating] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState({
    templateName: "",
    instituteLogo: null, // Can be File (for upload) or URL string (from database)
    officialSeal: null, // Can be File (for upload) or URL string (from database)
    authorizedSignature: null, // Can be File (for upload) or URL string (from database)
  });

  const [dragActiveLogo, setDragActiveLogo] = useState(false);
  const [dragActiveSeal, setDragActiveSeal] = useState(false);
  const [dragActiveSignature, setDragActiveSignature] = useState(false);

  // ✅ your backend API base (adjust if hosted differently)
  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost/jobsahi/api"; // <- adjust if using /api only

  // 🧠 helper to fix relative URLs
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; // already full
    if (path.startsWith("/")) return `${BASE_URL}${path}`; // attach base
    return `${BASE_URL}/${path}`;
  };

  // ---------------- FETCH TEMPLATES ----------------
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const resp = await getMethod({
          apiUrl: apiService.certificateTemplatesList,
        });

        if (resp?.status && Array.isArray(resp.data)) {
          setTemplates(resp.data);
        } else {
          setTemplates([]);
        }
      } catch (error) {
        setTemplates([]);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // ---------------- INPUT HANDLERS ----------------
  const handleInputChange = (field, value) => {
    setCertificateInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field, e) => {
    const file = e.target.files?.[0];
    if (file) setCertificateInfo((prev) => ({ ...prev, [field]: file }));
  };

  const handleDrag = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    const setDragState = (value) => {
      if (field === "instituteLogo") setDragActiveLogo(value);
      if (field === "officialSeal") setDragActiveSeal(value);
      if (field === "authorizedSignature") setDragActiveSignature(value);
    };
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragState(true);
    } else if (e.type === "dragleave") {
      setDragState(false);
    }
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    if (field === "instituteLogo") setDragActiveLogo(false);
    if (field === "officialSeal") setDragActiveSeal(false);
    if (field === "authorizedSignature") setDragActiveSignature(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCertificateInfo((prev) => ({
        ...prev,
        [field]: e.dataTransfer.files[0],
      }));
    }
  };

  const removeFile = (field) => {
    setCertificateInfo((prev) => ({ ...prev, [field]: null }));
  };

  // ---------------- TEMPLATE SELECTION HANDLER ----------------
  const handleTemplateChange = async (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);

    if (templateId) {
      try {
        // Step 1: First call certificate_templates.php?id={templateId} to get template details
        const templateResp = await getMethod({
          apiUrl: `${apiService.getCertificateTemplate}?id=${templateId}`, // Call: certificate_templates.php?id=5
        });


        if (templateResp?.status && templateResp?.data) {
          // Extract template data from response (could be array or single object)
          let templateData = null;
          if (Array.isArray(templateResp.data)) {
            templateData = templateResp.data.find(t => 
              String(t.id || t.template_id) === String(templateId)
            );
          } else {
            templateData = templateResp.data;
          }

          if (templateData) {
            // Extract media URLs from database API response (logo, seal, signature fields)
            // These are full URLs pointing to institute_certificate_templates folder
            const logoUrl = templateData.logo || templateData.logo_url || null;
            const sealUrl = templateData.seal || templateData.seal_url || null;
            const signatureUrl = templateData.signature || templateData.signature_url || null;
            
            setCertificateInfo((prev) => ({
              ...prev,
              templateName: templateData.template_name || templateData.name || "",
              description: templateData.description || templateData.footer_text || "",
              // Load existing media URLs from database (users can see what's currently there before updating)
              instituteLogo: logoUrl, // URL string from database
              officialSeal: sealUrl, // URL string from database
              authorizedSignature: signatureUrl, // URL string from database
            }));
          } else {
            // Fallback to local templates array
            const selectedTemplate = templates.find(
              (t) => String(t.template_id || t.id) === String(templateId)
            );
            if (selectedTemplate) {
              setCertificateInfo((prev) => ({
                ...prev,
                templateName: selectedTemplate.template_name || "",
                description: selectedTemplate.description || selectedTemplate.footer_text || "",
              }));
            }
          }
        } else {
          // Fallback to local templates array if API call fails
          const selectedTemplate = templates.find(
            (t) => String(t.template_id || t.id) === String(templateId)
          );
          if (selectedTemplate) {
            setCertificateInfo((prev) => ({
              ...prev,
              templateName: selectedTemplate.template_name || "",
              description: selectedTemplate.description || selectedTemplate.footer_text || "",
            }));
          }
        }
      } catch (error) {
        // Fallback to local templates array
        const selectedTemplate = templates.find(
          (t) => String(t.template_id || t.id) === String(templateId)
        );
        if (selectedTemplate) {
          setCertificateInfo((prev) => ({
            ...prev,
            templateName: selectedTemplate.template_name || "",
            description: selectedTemplate.description || selectedTemplate.footer_text || "",
          }));
        }
      }
    } else {
      setCertificateInfo((prev) => ({
        ...prev,
        templateName: "",
        description: "",
        instituteLogo: null,
        officialSeal: null,
        authorizedSignature: null,
      }));
    }
  };

  // ---------------- CREATE TEMPLATE ----------------
  const handleUpdateTemplate = async () => {
    if (
      !selectedTemplateId ||
      !certificateInfo.templateName?.trim() ||
      !certificateInfo.description
    ) {
      alert("Please select a template and fill all required fields (template name and description).");
      return;
    }
    
    // Media files are optional - if not provided, existing ones from database will be kept
    // Only require media if none exist (neither File nor URL)
    const hasLogo = certificateInfo.instituteLogo instanceof File || 
                   (typeof certificateInfo.instituteLogo === 'string' && certificateInfo.instituteLogo.trim() !== '');
    const hasSeal = certificateInfo.officialSeal instanceof File || 
                   (typeof certificateInfo.officialSeal === 'string' && certificateInfo.officialSeal.trim() !== '');
    const hasSignature = certificateInfo.authorizedSignature instanceof File || 
                        (typeof certificateInfo.authorizedSignature === 'string' && certificateInfo.authorizedSignature.trim() !== '');
    
    if (!hasLogo || !hasSeal || !hasSignature) {
      alert("Please ensure all media files (logo, seal, signature) are present. You can upload new files or keep existing ones from the database.");
      return;
    }

    try {
      setCreating(true);

      const form = new FormData();
      form.append("template_name", certificateInfo.templateName.trim());
      form.append("header_text", "Certificate of Completion");

      const footer = (certificateInfo.description || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      form.append("footer_text", footer || "Powered by JobSahi");
      form.append("template_id", selectedTemplateId); // Required for update
      form.append("is_active", "1");
      form.append("admin_action", "approved");

      // Append files only if they are File objects (new uploads)
      // If they are URL strings (from database), they will be kept as-is (don't append)
      if (certificateInfo.instituteLogo instanceof File) {
        form.append("logo", certificateInfo.instituteLogo);
      }
      if (certificateInfo.officialSeal instanceof File) {
        form.append("seal", certificateInfo.officialSeal);
      }
      if (certificateInfo.authorizedSignature instanceof File) {
        form.append("signature", certificateInfo.authorizedSignature);
      }

      // Step 2: Call update_certificate_template.php using PUT method
      const resp = await putMultipart({
        apiUrl: apiService.updateCertificateTemplate,
        data: form, // Use 'data' parameter for putMultipart
      });

      if (resp?.status) {
        // Refresh templates list after successful update
        const refreshResp = await getMethod({
          apiUrl: apiService.certificateTemplatesList,
        });
        
        if (refreshResp?.status && Array.isArray(refreshResp.data)) {
          setTemplates(refreshResp.data);
        }
        
        alert("Template updated successfully!");
        setCertificateInfo((prev) => ({
          ...prev,
          templateName: "",
          description: "",
          completionDate: "",
          instituteLogo: null,
          officialSeal: null,
          authorizedSignature: null,
        }));
        setSelectedTemplateId("");
        setDragActiveLogo(false);
        setDragActiveSeal(false);
        setDragActiveSignature(false);
      } else {
        alert(resp?.message || "Failed to update template");
      }
    } catch (err) {
      alert("Error creating template. Check console for details.");
    } finally {
      setCreating(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="space-y-6 p-6">
      {/* Certificate Info Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className={`text-xl font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>
          Certificate Information
        </h2>

        {/* inputs (same UI) */}
        <div className="space-y-6 mt-6">
          {/* Template Name */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                TEMPLATE NAME <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="lg:col-span-3">
              <select
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                disabled={loadingTemplates}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">
                  {loadingTemplates ? "Loading templates..." : "Select a template"}
                </option>
                {templates.map((template) => (
                  <option
                    key={template.template_id || template.id}
                    value={template.template_id || template.id}
                  >
                    {template.template_name || "Unnamed Template"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                DATE OF COMPLETION <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="lg:col-span-3">
              <input
                type="date"
                value={certificateInfo.completionDate}
                onChange={(e) => handleInputChange("completionDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                DESCRIPTION <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="lg:col-span-3">
              <RichTextEditor
                value={certificateInfo.description}
                onChange={(v) => handleInputChange("description", v)}
                placeholder="Enter course description"
                height="150px"
                className="border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Upload sections */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Logo */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                INSTITUTE LOGO <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  dragActiveLogo ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-400"
                }`}
                onDragEnter={(e) => handleDrag(e, "instituteLogo")}
                onDragLeave={(e) => handleDrag(e, "instituteLogo")}
                onDragOver={(e) => handleDrag(e, "instituteLogo")}
                onDrop={(e) => handleDrop(e, "instituteLogo")}
              >
                {certificateInfo.instituteLogo ? (
                  <div className="relative">
                    {/* Show image preview if it's a URL string (from database) */}
                    {typeof certificateInfo.instituteLogo === 'string' ? (
                      <div className="space-y-2">
                        <img 
                          src={certificateInfo.instituteLogo} 
                          alt="Current Logo" 
                          className="w-full h-32 object-contain mx-auto rounded"
                        />
                        <p className="text-xs text-gray-500">Current logo from database</p>
                        <button 
                          onClick={() => setCertificateInfo(prev => ({ ...prev, instituteLogo: null }))} 
                          className="text-red-500 text-sm hover:underline"
                        >
                          Remove / Replace
                        </button>
                      </div>
                    ) : (
                      /* Show file name if it's a File object (new upload) */
                      <div>
                        <LuFileImage className="w-10 h-10 text-green-600 mx-auto" />
                        <p className="text-sm">{certificateInfo.instituteLogo.name}</p>
                        <button onClick={() => removeFile("instituteLogo")} className="text-red-500">
                          <LuX className="w-5 h-5 mx-auto" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <LuUpload className="h-8 w-8 text-gray-400 mx-auto" />
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/png,image/jpeg"
                      onChange={(e) => handleFileUpload("instituteLogo", e)}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm cursor-pointer"
                    >
                      Choose file
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Seal */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                OFFICIAL SEAL <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  dragActiveSeal ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-400"
                }`}
                onDragEnter={(e) => handleDrag(e, "officialSeal")}
                onDragLeave={(e) => handleDrag(e, "officialSeal")}
                onDragOver={(e) => handleDrag(e, "officialSeal")}
                onDrop={(e) => handleDrop(e, "officialSeal")}
              >
                {certificateInfo.officialSeal ? (
                  <div className="relative">
                    {/* Show image preview if it's a URL string (from database) */}
                    {typeof certificateInfo.officialSeal === 'string' ? (
                      <div className="space-y-2">
                        <img 
                          src={certificateInfo.officialSeal} 
                          alt="Current Seal" 
                          className="w-full h-32 object-contain mx-auto rounded"
                        />
                        <p className="text-xs text-gray-500">Current seal from database</p>
                        <button 
                          onClick={() => setCertificateInfo(prev => ({ ...prev, officialSeal: null }))} 
                          className="text-red-500 text-sm hover:underline"
                        >
                          Remove / Replace
                        </button>
                      </div>
                    ) : (
                      /* Show file name if it's a File object (new upload) */
                      <div>
                        <LuFileImage className="w-10 h-10 text-green-600 mx-auto" />
                        <p className="text-sm">{certificateInfo.officialSeal.name}</p>
                        <button onClick={() => removeFile("officialSeal")} className="text-red-500">
                          <LuX className="w-5 h-5 mx-auto" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <LuUpload className="h-8 w-8 text-gray-400 mx-auto" />
                    <input
                      type="file"
                      id="seal-upload"
                      accept="image/png,image/jpeg"
                      onChange={(e) => handleFileUpload("officialSeal", e)}
                      className="hidden"
                    />
                    <label
                      htmlFor="seal-upload"
                      className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm cursor-pointer"
                    >
                      Choose file
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Authorized Signature */}
            <div>
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                AUTHORIZED SIGNATURE <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  dragActiveSignature ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-400"
                }`}
                onDragEnter={(e) => handleDrag(e, "authorizedSignature")}
                onDragLeave={(e) => handleDrag(e, "authorizedSignature")}
                onDragOver={(e) => handleDrag(e, "authorizedSignature")}
                onDrop={(e) => handleDrop(e, "authorizedSignature")}
              >
                {certificateInfo.authorizedSignature ? (
                  <div className="relative">
                    {/* Show image preview if it's a URL string (from database) */}
                    {typeof certificateInfo.authorizedSignature === 'string' ? (
                      <div className="space-y-2">
                        <img 
                          src={certificateInfo.authorizedSignature} 
                          alt="Current Signature" 
                          className="w-full h-32 object-contain mx-auto rounded bg-white border"
                        />
                        <p className="text-xs text-gray-500">Current signature from database</p>
                        <button 
                          onClick={() => setCertificateInfo(prev => ({ ...prev, authorizedSignature: null }))} 
                          className="text-red-500 text-sm hover:underline"
                        >
                          Remove / Replace
                        </button>
                      </div>
                    ) : (
                      /* Show file name if it's a File object (new upload) */
                      <div>
                        <LuFileImage className="w-10 h-10 text-green-600 mx-auto" />
                        <p className="text-sm">{certificateInfo.authorizedSignature.name}</p>
                        <button onClick={() => removeFile("authorizedSignature")} className="text-red-500">
                          <LuX className="w-5 h-5 mx-auto" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <LuUpload className="h-8 w-8 text-gray-400 mx-auto" />
                    <input
                      type="file"
                      id="signature-upload"
                      accept="image/png,image/jpeg"
                      onChange={(e) => handleFileUpload("authorizedSignature", e)}
                      className="hidden"
                    />
                    <label
                      htmlFor="signature-upload"
                      className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm cursor-pointer"
                    >
                      Choose file
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              onClick={handleUpdateTemplate}
              disabled={creating}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <LuFileText className="h-4 w-4" />
              <span>{creating ? "Saving..." : "Update Template"}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ManageTemplate;
