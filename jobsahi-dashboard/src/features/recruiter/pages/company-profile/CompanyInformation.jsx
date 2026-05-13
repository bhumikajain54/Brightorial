import React, { useState, useRef, useEffect } from "react";
import {
  LuBuilding2,
  LuUpload,
  LuX,
  LuSearch,
  LuLock,
  LuEye,
  LuEyeOff,
} from "react-icons/lu";
import { FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { TAILWIND_COLORS } from "@shared/WebConstant";
import { Button, SaveButton } from "@shared/components/Button";
import {
  getMethod,
  postMultipart,
  putMethod,
  putMultipart,
} from "../../../../service/api";
import apiService from "../../services/serviceUrl";
import apiServiceShared from "../../../../shared/services/serviceUrl";
import { env } from "../../../../service/envConfig";

const CompanyInfo = () => {
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Change Password State
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  const [companyData, setCompanyData] = useState({
    name: "",
    website: "",
    industry: "",
    email: "",
    phone_number: "",
    location: "",
    gst_pan: "",
  });

  // =====================
  // 📌 Fetch Recruiter Profile
  // =====================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMethod({
          apiUrl: apiService.getRecruiterProfile,
        });

        console.log('📥 GET Profile Response:', response);
        console.log('📥 Response structure:', {
          success: response?.success,
          hasData: !!response?.data,
          hasProfiles: !!response?.data?.profiles,
          profilesLength: response?.data?.profiles?.length,
          fullResponse: response
        });

        // ✅ Try multiple response structures
        let profile = null;
        if (response?.success && response?.data?.profiles?.length > 0) {
          profile = response.data.profiles[0];
        } else if (response?.success && response?.data) {
          profile = response.data;
        } else if (response?.data) {
          profile = response.data;
        }

        if (profile) {
          const personal = profile.personal_info || profile.personal || {};
          const professional = profile.professional_info || profile.professional || {};
          const docs = profile.documents || profile.document || {};

          console.log('📋 Profile data:', {
            personal,
            professional,
            docs,
            fullProfile: profile
          });

          setCompanyData({
            name: professional.company_name || professional.name || "",
            website: professional.website || "",
            industry: professional.industry || professional.trade || "",
            email: personal.email || "",
            phone_number: personal.phone_number || personal.phone || "",
            location: professional.location || personal.location || "",
            gst_pan: professional.gst_pan || professional.gstPan || docs.gst_pan || docs.gstPan || "",
          });

          // ✅ Try multiple possible logo field locations
          const logoPath = docs.company_logo 
            || docs.logo 
            || professional.company_logo 
            || professional.logo
            || profile.company_logo
            || profile.logo;

          console.log('🖼️ Logo path found:', logoPath);

          // ✅ Only set logo if we have a valid, non-empty path
          if (logoPath && 
              typeof logoPath === 'string' && 
              logoPath.trim() !== '' && 
              logoPath !== 'null' && 
              logoPath !== 'undefined' &&
              logoPath.length > 0) {
            
            let logoUrl = logoPath.trim();
            
            // ✅ Skip if it's clearly not a valid image filename
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
            const hasImageExtension = imageExtensions.some(ext => 
              logoUrl.toLowerCase().endsWith(ext)
            );
            
            // ✅ If not absolute URL, construct full path
            if (!logoUrl.startsWith('http')) {
              // Remove /api from apiHost and add /uploads
              const baseUrl = env.apiHost.replace('/api', '');
              
              // ✅ Clean up the logo path - remove any leading/trailing slashes
              logoUrl = logoUrl.replace(/^\/+|\/+$/g, '');
              
              // ✅ Handle different path formats
              if (logoUrl.startsWith('uploads/')) {
                // Already has uploads/ prefix
                logoUrl = `${baseUrl}/${logoUrl}`;
              } else if (logoUrl.includes('/uploads/')) {
                // Has /uploads/ somewhere in path
                const uploadsIndex = logoUrl.indexOf('/uploads/');
                logoUrl = `${baseUrl}${logoUrl.substring(uploadsIndex)}`;
              } else {
                // Just filename, add /uploads/ prefix
                logoUrl = `${baseUrl}/uploads/${logoUrl}`;
              }
            }
            
            console.log('🖼️ Final logo URL:', logoUrl);
            
            // ✅ Only set preview if URL is valid and looks like an image
            if (logoUrl && logoUrl.trim() !== '' && (hasImageExtension || logoUrl.startsWith('http'))) {
              setLogoPreview(logoUrl);
            } else {
              console.warn('⚠️ Invalid logo URL or not an image file:', logoUrl);
              setLogoPreview(null);
            }
          } else {
            console.warn('⚠️ No valid logo path found in response:', logoPath);
            setLogoPreview(null);
          }
        } else {
          console.warn('⚠️ No profile data found in response');
        }
      } catch (error) {
        console.error("❌ Error fetching recruiter profile:", error);
        console.error("❌ Error details:", {
          message: error?.message,
          response: error?.response,
          responseData: error?.response?.data
        });
      }
    };

    fetchProfile();
  }, []);

  // =====================
  // 📌 File Upload Handlers
  // =====================
  const handleFileSelect = (file) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/svg+xml",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please select a valid image (JPEG, PNG, SVG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File must be less than 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreview(previewUrl);
    setUploadError(null);
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 1000);
  };

  const handleClick = () => fileInputRef.current?.click();

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
  };

  const handleChange = (field, value) => {
    setCompanyData((prev) => ({ ...prev, [field]: value }));
  };

  // =====================
  // 📌 Save / Update Company Info
  // =====================
  const handleSaveChanges = async () => {
    try {
      const payload = {
        company_name: companyData.name,
        industry: companyData.industry,
        website: companyData.website,
        email: companyData.email,
        phone_number: companyData.phone_number,
        location: companyData.location,
        gst_pan: companyData.gst_pan,
      };

      let res;
      if (logoFile) {
        // ✅ Use FormData for file upload
        const formData = new FormData();
        Object.entries(payload).forEach(([key, val]) => {
          if (val !== null && val !== undefined && val !== '') {
            formData.append(key, val);
          }
        });
        // ✅ Append logo file with proper field name
        formData.append("company_logo", logoFile);

        // ✅ Use putMultipart for updates (not postMultipart)
        res = await putMultipart({
          apiUrl: apiService.updateRecruiterProfile,
          data: formData,
        });
      } else {
        // ✅ Use putMethod for non-file updates
        res = await putMethod({
          apiUrl: apiService.updateRecruiterProfile,
          payload,
        });
      }

      console.log('📤 Update Response:', res);

      if (res?.success || res?.status === true || res?.data?.success) {
        // Show sweetalert popup
        Swal.fire({
          title: "Success!",
          text: res?.message || "Profile updated successfully!",
          icon: "success",
          confirmButtonText: "OK"
        });
        
        toast.success("✅ Profile updated successfully!");
        
        // ✅ Refresh profile data after successful update
        const refreshResponse = await getMethod({
          apiUrl: apiService.getRecruiterProfile,
        });

        console.log('🔄 Refresh Profile Response:', refreshResponse);

        // ✅ Use same logic as fetchProfile
        let profile = null;
        if (refreshResponse?.success && refreshResponse?.data?.profiles?.length > 0) {
          profile = refreshResponse.data.profiles[0];
        } else if (refreshResponse?.success && refreshResponse?.data) {
          profile = refreshResponse.data;
        }

        if (profile) {
          // ✅ Update localStorage with new company name
          try {
            const authUser = localStorage.getItem("authUser");
            if (authUser) {
              const user = JSON.parse(authUser);
              // Update user_name with company name
              const companyName = companyData.name || profile.professional_info?.company_name || profile.professional?.company_name || user.user_name;
              if (companyName) {
                user.user_name = companyName;
                localStorage.setItem("authUser", JSON.stringify(user));
                // Dispatch custom event for real-time updates
                window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { user_name: companyName } }));
              }
            }
          } catch (error) {
            console.error('Error updating localStorage:', error);
          }

          const docs = profile.documents || profile.document || {};
          const professional = profile.professional_info || profile.professional || {};
          
          // ✅ Try multiple possible logo field locations
          const logoPath = docs.company_logo 
            || docs.logo 
            || professional.company_logo 
            || professional.logo
            || profile.company_logo
            || profile.logo;
          
          // ✅ Only set logo if we have a valid, non-empty path
          if (logoPath && 
              typeof logoPath === 'string' && 
              logoPath.trim() !== '' && 
              logoPath !== 'null' && 
              logoPath !== 'undefined' &&
              logoPath.length > 0) {
            
            let logoUrl = logoPath.trim();
            
            // ✅ Check if it's a valid image filename
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
            const hasImageExtension = imageExtensions.some(ext => 
              logoUrl.toLowerCase().endsWith(ext)
            );
            
            if (!logoUrl.startsWith('http')) {
              const baseUrl = env.apiHost.replace('/api', '');
              
              // ✅ Clean up the logo path
              logoUrl = logoUrl.replace(/^\/+|\/+$/g, '');
              
              // ✅ Handle different path formats
              if (logoUrl.startsWith('uploads/')) {
                logoUrl = `${baseUrl}/${logoUrl}`;
              } else if (logoUrl.includes('/uploads/')) {
                const uploadsIndex = logoUrl.indexOf('/uploads/');
                logoUrl = `${baseUrl}${logoUrl.substring(uploadsIndex)}`;
              } else {
                logoUrl = `${baseUrl}/uploads/${logoUrl}`;
              }
            }
            
            console.log('🖼️ Refresh - Final logo URL:', logoUrl);
            
            // ✅ Only set preview if URL is valid and looks like an image
            if (logoUrl && logoUrl.trim() !== '' && (hasImageExtension || logoUrl.startsWith('http'))) {
              setLogoPreview(logoUrl);
            } else {
              console.warn('⚠️ Refresh - Invalid logo URL:', logoUrl);
              setLogoPreview(null);
            }
          } else {
            console.warn('⚠️ Refresh - No valid logo path:', logoPath);
            setLogoPreview(null);
          }
          
          // ✅ Clear logoFile state after successful upload
          setLogoFile(null);
        }
      } else {
        toast.error(res?.message || "❌ Update failed!");
      }
    } catch (err) {
      console.error('❌ Update Error:', err);
      toast.error(err?.response?.data?.message || "Something went wrong!");
    }
  };

  // =====================
  // 📌 Responsive UI Layout (Logo on top, two-column form)
  // =====================
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="bg-white shadow-sm rounded-2xl p-6 md:p-10">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div
            className="w-full max-w-md mx-auto h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
            onClick={handleClick}
          >
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Company Logo"
                  className="max-h-32 object-contain mx-auto rounded-md"
                  onError={(e) => {
                    console.error('❌ Image load error for:', logoPreview);
                    // ✅ If image fails to load, clear preview and show upload area
                    setLogoPreview(null);
                    e.target.style.display = 'none';
                  }}
                />
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogoRemove();
                  }}
                  variant="unstyled"
                  size="sm"
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow hover:bg-gray-100 text-gray-600"
                  icon={<LuX size={16} />}
                />
              </div>
            ) : (
              <>
                <LuUpload
                  size={28}
                  className="text-gray-400 mb-2"
                />
                <p className="text-sm text-gray-600 font-medium">
                  Upload Company Logo
                </p>
                <p className="text-xs text-gray-400">(Max 5MB)</p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          {uploadError && (
            <div className="mt-3 flex justify-center items-center gap-2 text-sm text-red-600">
              <FiAlertCircle size={16} /> {uploadError}
            </div>
          )}
        </div>

        {/* Form Title */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <LuBuilding2 className="text-blue-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-800">
            Company Information
          </h2>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <input
                type="text"
                value={companyData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter company name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Trade</label>
              <input
                type="text"
                value={companyData.industry}
                onChange={(e) => handleChange("industry", e.target.value)}
                placeholder="Enter trade/industry"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="text"
                value={companyData.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                placeholder="Enter contact number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <input
                type="url"
                value={companyData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={companyData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={companyData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Enter company location"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">GST / PAN</label>
              <input
                type="text"
                value={companyData.gst_pan}
                onChange={(e) => handleChange("gst_pan", e.target.value.toUpperCase().slice(0, 10))}
                placeholder="Enter GST or PAN number"
                maxLength={10}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-10 flex justify-end">
          <SaveButton onClick={handleSaveChanges}>Save Changes</SaveButton>
        </div>
      </div>

      {/* Change Password Section */}
      <div className={`${TAILWIND_COLORS.CARD} p-6 mt-8`}>
        <div className="flex items-center gap-3 mb-4">
          <LuLock className={`${TAILWIND_COLORS.SECONDARY}`} size={20} />
          <h3 className={`font-semibold text-lg ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Change Password
          </h3>
        </div>
        <p className={`text-sm mb-6 ${TAILWIND_COLORS.TEXT_MUTED}`}>
          Update your account password to keep your account secure.
        </p>

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className={`text-sm font-medium mb-2 block ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={passwordData.current_password}
                onChange={(e) => {
                  setPasswordData(prev => ({ ...prev, current_password: e.target.value }));
                  if (passwordErrors.current_password) {
                    setPasswordErrors(prev => ({ ...prev, current_password: "" }));
                  }
                }}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 pr-10 ${
                  passwordErrors.current_password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY}`}
              >
                {showPasswords.current ? <LuEyeOff size={18} /> : <LuEye size={18} />}
              </button>
            </div>
            {passwordErrors.current_password && (
              <p className="text-red-500 text-xs mt-1">{passwordErrors.current_password}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className={`text-sm font-medium mb-2 block ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.new_password}
                onChange={(e) => {
                  setPasswordData(prev => ({ ...prev, new_password: e.target.value }));
                  if (passwordErrors.new_password) {
                    setPasswordErrors(prev => ({ ...prev, new_password: "" }));
                  }
                }}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 pr-10 ${
                  passwordErrors.new_password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter new password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY}`}
              >
                {showPasswords.new ? <LuEyeOff size={18} /> : <LuEye size={18} />}
              </button>
            </div>
            {passwordErrors.new_password && (
              <p className="text-red-500 text-xs mt-1">{passwordErrors.new_password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className={`text-sm font-medium mb-2 block ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirm_password}
                onChange={(e) => {
                  setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }));
                  if (passwordErrors.confirm_password) {
                    setPasswordErrors(prev => ({ ...prev, confirm_password: "" }));
                  }
                }}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 pr-10 ${
                  passwordErrors.confirm_password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${TAILWIND_COLORS.TEXT_MUTED} hover:${TAILWIND_COLORS.TEXT_PRIMARY}`}
              >
                {showPasswords.confirm ? <LuEyeOff size={18} /> : <LuEye size={18} />}
              </button>
            </div>
            {passwordErrors.confirm_password && (
              <p className="text-red-500 text-xs mt-1">{passwordErrors.confirm_password}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            variant="primary"
            onClick={async () => {
              // Validate form
              const errors = {};
              if (!passwordData.current_password.trim()) {
                errors.current_password = "Current password is required";
              }
              if (!passwordData.new_password.trim()) {
                errors.new_password = "New password is required";
              } else if (passwordData.new_password.length < 6) {
                errors.new_password = "Password must be at least 6 characters";
              }
              if (!passwordData.confirm_password.trim()) {
                errors.confirm_password = "Please confirm your new password";
              } else if (passwordData.new_password !== passwordData.confirm_password) {
                errors.confirm_password = "Passwords do not match";
              }
              if (passwordData.current_password === passwordData.new_password) {
                errors.new_password = "New password must be different from current password";
              }

              setPasswordErrors(errors);
              if (Object.keys(errors).length > 0) return;

              try {
                setIsChangingPassword(true);
                const authUser = localStorage.getItem("authUser");
                if (!authUser) {
                  Swal.fire({
                    title: "Error",
                    text: "User information not found. Please login again.",
                    icon: "error",
                    confirmButtonColor: '#d33'
                  });
                  return;
                }

                const user = JSON.parse(authUser);
                const userId = user.id || user.user_id || user.uid;

                if (!userId) {
                  Swal.fire({
                    title: "Error",
                    text: "User ID not found. Please login again.",
                    icon: "error",
                    confirmButtonColor: '#d33'
                  });
                  return;
                }

                const payload = {
                  user_id: userId,
                  current_password: passwordData.current_password.trim(),
                  new_password: passwordData.new_password.trim()
                };

                const response = await putMethod({
                  apiUrl: apiServiceShared.changePassword,
                  payload: payload
                });

                const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true;

                if (isSuccess) {
                  Swal.fire({
                    title: "Success!",
                    text: response?.message || "Password changed successfully!",
                    icon: "success",
                    confirmButtonColor: '#5C9A24'
                  }).then(() => {
                    setPasswordData({
                      current_password: "",
                      new_password: "",
                      confirm_password: ""
                    });
                    setPasswordErrors({});
                  });
                } else {
                  const errorMessage = response?.message || response?.error || "Failed to change password. Please try again.";
                  Swal.fire({
                    title: "Error",
                    text: errorMessage,
                    icon: "error",
                    confirmButtonColor: '#d33'
                  });
                }
              } catch (error) {
                console.error('❌ Error changing password:', error);
                Swal.fire({
                  title: "Error",
                  text: error?.message || "Something went wrong. Please try again.",
                  icon: "error",
                  confirmButtonColor: '#d33'
                });
              } finally {
                setIsChangingPassword(false);
              }
            }}
            disabled={isChangingPassword}
            className="min-w-[150px]"
          >
            {isChangingPassword ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;
