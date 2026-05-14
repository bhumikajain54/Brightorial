import axios from './axios';
import { respChanges } from './responseModify';
import { env } from './envConfig';

export const SERVICE_URL = env.apiHost;  // ✅ expose same base URL for direct use if needed
const backendHost = SERVICE_URL;

/**
 * 🟢 Common header generator
 */
const getHeaders = (includeAuth = true) => {
  const headers = { "content-type": "application/json" };
  const token = localStorage.getItem("authToken");
  
  if (includeAuth) {
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn('⚠️ Warning: Authentication token not found in localStorage. Request may fail.');
    }
    // Note: Not adding custom headers to avoid CORS issues
    // Recruiter ID will be passed in params/payload instead
  }
  return headers;
};

/**
 * 🟢 GET method
 */
export const getMethod = async (data) => {
  try {
    // Validate apiUrl exists and is a string
    if (!data || !data.apiUrl || typeof data.apiUrl !== 'string') {
      console.error('❌ GET Error: Invalid or missing apiUrl:', data);
      return {
        status: false,
        message: 'Invalid API endpoint configuration',
        data: []
      };
    }

    // Check if token exists for authenticated endpoints
    const token = localStorage.getItem("authToken");
    if (!token || token === '' || token === 'null' || token === 'undefined') {
      console.error('❌ GET Error: No authentication token found. Please login again.');
      return {
        status: false,
        message: 'Authentication required. Please login again.',
        data: [],
        requiresAuth: true
      };
    }

    const headers = getHeaders();
    const isAdminImpersonating = localStorage.getItem("isAdminImpersonating") === "true";
    const impersonatedUserId = localStorage.getItem("impersonatedUserId");

    // If admin is impersonating and this is a recruiter/institute endpoint, add user ID to params
    let params = data.params || {};
    if (isAdminImpersonating && impersonatedUserId) {
      const isRecruiterEndpoint = data.apiUrl.includes('/employer/') || data.apiUrl.includes('/recruiter/') || data.apiUrl.includes('/applications/');
      const isInstituteEndpoint = data.apiUrl.includes('/institute/') || data.apiUrl.includes('/courses/') || data.apiUrl.includes('/batches/') || data.apiUrl.includes('/faculty/') || data.apiUrl.includes('/certificates/');
      
      if (isRecruiterEndpoint || isInstituteEndpoint) {
        // Add recruiter/institute ID to params so backend knows which user's data to fetch
        // Always add these params, even if they exist, to ensure backend gets the right ID
        if (isInstituteEndpoint) {
          // For institute endpoints, use institute-specific param names
          params = {
            ...params,
            user_id: impersonatedUserId,
            uid: impersonatedUserId,
            institute_id: impersonatedUserId,
            instituteId: impersonatedUserId
          };
        } else {
          // For recruiter endpoints, use recruiter-specific param names
          params = {
            ...params,
            user_id: impersonatedUserId,
            uid: impersonatedUserId,
            recruiter_id: impersonatedUserId,
            employer_id: impersonatedUserId,
            recruiter_uid: impersonatedUserId,
            employer_uid: impersonatedUserId
          };
        }
      }
    }

    const fullUrl = backendHost + data.apiUrl;
    // Only log if not impersonating to reduce console noise
    if (!isAdminImpersonating) {
      console.log('🌐 GET Request:', {
        url: fullUrl,
        token: token ? `${token.substring(0, 15)}...` : 'No token',
        params: params
      });
    }

    const respData = await axios({
      method: 'get',
      url: fullUrl,
      params: params, // ✅ use params with recruiter ID if impersonating
      headers
    });

    // Only log if not impersonating to reduce console noise
    if (!isAdminImpersonating) {
      console.log('✅ GET Response:', respData.data);
    }
    return respChanges(respData.data);
  } catch (err) {
    const errorUrl = data?.apiUrl ? backendHost + data.apiUrl : 'undefined';
    const isAdminImpersonating = localStorage.getItem("isAdminImpersonating") === "true";
    const is401Error = err.response?.status === 401;
    
    // Suppress 401 errors in console when admin is impersonating (expected behavior)
    if (!isAdminImpersonating || !is401Error) {
      console.error('❌ GET Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: errorUrl,
        apiUrl: data?.apiUrl
      });
    }
    // Suppress all error logs when admin is impersonating to keep console clean
    
    return {
      status: false,
      message: err.response?.data?.message || err.message || 'Network error occurred',
      data: []
    };
  }
};

/**
 * 🟢 POST method
 */
export const postMethod = async (data) => {
  try {
    // Skip token for signup, create_user, and profile creation endpoints
    const skipToken = data?.apiUrl && (
      data.apiUrl.includes('signup') || 
      data.apiUrl.includes('create_user') ||
      data.apiUrl.includes('create_recruiter_profile') ||
      data.apiUrl.includes('create_institute_profile') ||
      data.apiUrl.includes('create_student_profile')
    );
    
    // Check if token exists for authenticated endpoints
    if (!skipToken) {
      const token = localStorage.getItem("authToken");
      if (!token || token === '' || token === 'null' || token === 'undefined') {
        console.error('❌ POST Error: No authentication token found. Please login again.');
        return {
          status: false,
          message: 'Authentication required. Please login again.',
          data: [],
          requiresAuth: true
        };
      }
    }
    
    const headers = getHeaders(!skipToken);
    
    const isAdminImpersonating = localStorage.getItem("isAdminImpersonating") === "true";
    const impersonatedUserId = localStorage.getItem("impersonatedUserId");
    
    // If admin is impersonating and this is a recruiter/institute endpoint, add user ID to payload
    let payload = data.payload || {};
    if (isAdminImpersonating && impersonatedUserId && !skipToken) {
      const isRecruiterEndpoint = data.apiUrl.includes('/employer/') || data.apiUrl.includes('/recruiter/') || data.apiUrl.includes('/applications/');
      const isInstituteEndpoint = data.apiUrl.includes('/institute/') || data.apiUrl.includes('/courses/') || data.apiUrl.includes('/batches/') || data.apiUrl.includes('/faculty/') || data.apiUrl.includes('/certificates/');
      
      if (isRecruiterEndpoint || isInstituteEndpoint) {
        // Add recruiter/institute ID to payload so backend knows which user's data to fetch
        // Always add these params, even if they exist, to ensure backend gets the right ID
        if (isInstituteEndpoint) {
          // For institute endpoints, use institute-specific param names
          payload = {
            ...payload,
            user_id: impersonatedUserId,
            uid: impersonatedUserId,
            institute_id: impersonatedUserId,
            instituteId: impersonatedUserId
          };
        } else {
          // For recruiter endpoints, use recruiter-specific param names
          payload = {
            ...payload,
            user_id: impersonatedUserId,
            uid: impersonatedUserId,
            recruiter_id: impersonatedUserId,
            employer_id: impersonatedUserId,
            recruiter_uid: impersonatedUserId,
            employer_uid: impersonatedUserId
          };
        }
      }
    }

    console.log('🌐 POST Request:', {
      url: backendHost + data.apiUrl,
      payload: payload,
      token: headers.Authorization ? `${headers.Authorization.substring(0, 20)}...` : 'No token',
      isAdminImpersonating: isAdminImpersonating
    });

    const respData = await axios({
      method: 'post',
      url: backendHost + data.apiUrl,
      data: payload,
      headers
    });

    const response = respChanges(respData.data);
    response.httpStatus = respData.status;
    // Only log if not impersonating to reduce console noise
    if (!isAdminImpersonating) {
      console.log('✅ POST Response:', response);
    }
    return response;
  } catch (err) {
    const isAdminImpersonating = localStorage.getItem("isAdminImpersonating") === "true";
    const is401Error = err.response?.status === 401;
    
    // Suppress 401 errors in console when admin is impersonating
    if (!isAdminImpersonating || !is401Error) {
      console.error('❌ POST Error:', err.response?.data || err);
    }
    
    return {
      status: false,
      message: err.response?.data?.message || 'Something went wrong while posting data.',
      data: []
    };
  }
};

/**
 * 🟢 PUT method
 */
export const putMethod = async (data) => {
  try {
    // Skip token if user_id is present in payload (for account creation profile update)
    const hasUserId = (data.payload?.user_id || data.data?.user_id) && 
                      (data.apiUrl.includes('update_recruiter_profile') || 
                       data.apiUrl.includes('institute_profile_updated') || 
                       data.apiUrl.includes('profile_updated'));
    const headers = getHeaders(!hasUserId);
    
    const isAdminImpersonating = localStorage.getItem("isAdminImpersonating") === "true";
    const impersonatedUserId = localStorage.getItem("impersonatedUserId");
    
    // If admin is impersonating and this is a recruiter/institute endpoint, add user ID to payload
    let payload = data.payload || data.data || {};
    if (isAdminImpersonating && impersonatedUserId && !hasUserId) {
      const isRecruiterEndpoint = data.apiUrl.includes('/employer/') || data.apiUrl.includes('/recruiter/') || data.apiUrl.includes('/applications/');
      const isInstituteEndpoint = data.apiUrl.includes('/institute/') || data.apiUrl.includes('/courses/') || data.apiUrl.includes('/batches/') || data.apiUrl.includes('/faculty/') || data.apiUrl.includes('/certificates/');
      
      if (isRecruiterEndpoint || isInstituteEndpoint) {
        // Add recruiter/institute ID to payload so backend knows which user's data to update
        // Always add these params, even if they exist, to ensure backend gets the right ID
        if (isInstituteEndpoint) {
          // For institute endpoints, use institute-specific param names
          payload = {
            ...payload,
            user_id: impersonatedUserId,
            uid: impersonatedUserId,
            institute_id: impersonatedUserId,
            instituteId: impersonatedUserId
          };
        } else {
          // For recruiter endpoints, use recruiter-specific param names
          payload = {
            ...payload,
            user_id: impersonatedUserId,
            uid: impersonatedUserId,
            recruiter_id: impersonatedUserId,
            employer_id: impersonatedUserId,
            recruiter_uid: impersonatedUserId,
            employer_uid: impersonatedUserId
          };
        }
      }
    }
    
    // Only log if not impersonating to reduce console noise
    if (!isAdminImpersonating) {
      console.log('🌐 PUT Request:', {
        url: backendHost + data.apiUrl,
        payload: payload,
        skipToken: hasUserId
      });
    }

    const respData = await axios({
      method: 'put',
      url: backendHost + data.apiUrl,
      data: payload,
      headers
    });

    // Only log if not impersonating to reduce console noise
    if (!isAdminImpersonating) {
      console.log('✅ PUT Response:', respData.data);
    }
    return respChanges(respData.data);
  } catch (err) {
    const isAdminImpersonating = localStorage.getItem("isAdminImpersonating") === "true";
    // Suppress all error logs when admin is impersonating to keep console clean
    if (!isAdminImpersonating) {
      console.error('❌ PUT Error:', err.response?.data || err);
    }
    return {
      status: false,
      message: err.response?.data?.message || 'Update failed',
      data: []
    };
  }
};

/**
 * 🟢 PUT MULTIPART method (for file uploads with PUT requests)
 */
export const putMultipart = async (data) => {
  try {
    // Check if FormData contains user_id (for account creation profile update)
    let hasUserId = false;
    if (data.data instanceof FormData) {
      hasUserId = data.data.has('user_id') && 
                  (data.apiUrl.includes('update_recruiter_profile') || 
                   data.apiUrl.includes('institute_profile_updated') || 
                   data.apiUrl.includes('profile_updated'));
    }
    
    // Skip token if user_id is present (for account creation)
    const token = hasUserId ? null : localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "multipart/form-data",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // ✅ Admin impersonation support for FormData
    const isAdminImpersonating = localStorage.getItem("isAdminImpersonating") === "true";
    const impersonatedUserId = localStorage.getItem("impersonatedUserId");
    
    let formData = data.data; // Keep original FormData
    
    if (isAdminImpersonating && impersonatedUserId && data.data instanceof FormData && !hasUserId) {
      const isRecruiterEndpoint = data.apiUrl.includes('/employer/') || data.apiUrl.includes('/recruiter/') || data.apiUrl.includes('/applications/');
      const isInstituteEndpoint = data.apiUrl.includes('/institute/') || data.apiUrl.includes('/courses/') || data.apiUrl.includes('/batches/') || data.apiUrl.includes('/faculty/') || data.apiUrl.includes('/certificates/') || data.apiUrl.includes('/certificate_templates/');
      
      if (isRecruiterEndpoint || isInstituteEndpoint) {
        // Create a new FormData and copy all existing fields
        formData = new FormData();
        
        // Copy all existing FormData entries
        if (data.data instanceof FormData) {
          for (const [key, value] of data.data.entries()) {
            formData.append(key, value);
          }
        }
        
        // Add institute/recruiter ID parameters
        if (isInstituteEndpoint) {
          formData.append('user_id', impersonatedUserId);
          formData.append('uid', impersonatedUserId);
          formData.append('institute_id', impersonatedUserId);
          formData.append('instituteId', impersonatedUserId);
        } else {
          formData.append('user_id', impersonatedUserId);
          formData.append('uid', impersonatedUserId);
          formData.append('recruiter_id', impersonatedUserId);
          formData.append('employer_id', impersonatedUserId);
          formData.append('recruiter_uid', impersonatedUserId);
          formData.append('employer_uid', impersonatedUserId);
        }
      }
    }

    console.log("🌐 PUT Multipart Request:", {
      url: backendHost + data.apiUrl,
      data: formData instanceof FormData ? "[FormData]" : formData,
      token: token ? `${token.substring(0, 15)}...` : "No token",
      skipToken: hasUserId,
      isAdminImpersonating: isAdminImpersonating
    });

    const respData = await axios({
      method: "put",
      url: backendHost + data.apiUrl,
      data: formData, // ✅ Use modified FormData
      headers,
    });

    const response = respChanges(respData.data);
    response.httpStatus = respData.status;
    console.log("✅ PUT Multipart Response:", response);
    return response;
  } catch (err) {
    console.error("❌ PUT Multipart Error:", {
      message: err.message,
      response: err.response?.data,
      url: backendHost + data.apiUrl,
    });

    return {
      status: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Something went wrong during file upload.",
      data: [],
    };
  }
};

/**
 * 🟢 DELETE method
 */
export const deleteMethod = async (data) => {
  try {
    const headers = getHeaders();
    console.log('🌐 DELETE Request:', {
      url: backendHost + data.apiUrl,
      payload: data.payload
    });

    const respData = await axios({
      method: 'delete',
      url: backendHost + data.apiUrl,
      data: data.payload || {},
      headers
    });

    console.log('✅ DELETE Response:', respData.data);
    return respChanges(respData.data);
  } catch (err) {
    console.error('❌ DELETE Error:', err.response?.data || err);
    return {
      status: false,
      message: err.response?.data?.message || 'Delete failed',
      data: []
    };
  }
};

/**
 * 🟢 POST MULTIPART method (for file uploads like logo, resume, etc.)
 */
export const postMultipart = async (data) => {
  try {
    // Validate apiUrl exists and is a string
    if (!data || !data.apiUrl || typeof data.apiUrl !== 'string') {
      console.error('❌ POST Multipart Error: Invalid or missing apiUrl:', data);
      return {
        status: false,
        message: 'Invalid API endpoint configuration',
        data: []
      };
    }

    // Skip token for profile creation endpoints
    const skipToken = data?.apiUrl && (
      data.apiUrl.includes('create_recruiter_profile') ||
      data.apiUrl.includes('create_institute_profile') ||
      data.apiUrl.includes('create_student_profile')
    );
    
    const token = skipToken ? null : localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "multipart/form-data",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // ✅ Admin impersonation support for FormData
    const isAdminImpersonating = localStorage.getItem("isAdminImpersonating") === "true";
    const impersonatedUserId = localStorage.getItem("impersonatedUserId");
    
    let formData = data.data; // Keep original FormData
    
    if (isAdminImpersonating && impersonatedUserId && data.data instanceof FormData) {
      const isRecruiterEndpoint = data.apiUrl.includes('/employer/') || data.apiUrl.includes('/recruiter/') || data.apiUrl.includes('/applications/');
      const isInstituteEndpoint = data.apiUrl.includes('/institute/') || data.apiUrl.includes('/courses/') || data.apiUrl.includes('/batches/') || data.apiUrl.includes('/faculty/') || data.apiUrl.includes('/certificates/') || data.apiUrl.includes('/certificate_templates/');
      
      if (isRecruiterEndpoint || isInstituteEndpoint) {
        // Create a new FormData and copy all existing fields
        formData = new FormData();
        
        // Copy all existing FormData entries
        if (data.data instanceof FormData) {
          for (const [key, value] of data.data.entries()) {
            formData.append(key, value);
          }
        }
        
        // Add institute/recruiter ID parameters
        if (isInstituteEndpoint) {
          formData.append('user_id', impersonatedUserId);
          formData.append('uid', impersonatedUserId);
          formData.append('institute_id', impersonatedUserId);
          formData.append('instituteId', impersonatedUserId);
        } else {
          formData.append('user_id', impersonatedUserId);
          formData.append('uid', impersonatedUserId);
          formData.append('recruiter_id', impersonatedUserId);
          formData.append('employer_id', impersonatedUserId);
          formData.append('recruiter_uid', impersonatedUserId);
          formData.append('employer_uid', impersonatedUserId);
        }
      }
    }

    const fullUrl = backendHost + data.apiUrl;
    console.log("🌐 POST Multipart Request:", {
      url: fullUrl,
      data: formData instanceof FormData ? "[FormData]" : formData,
      token: token ? `${token.substring(0, 15)}...` : "No token",
      isAdminImpersonating: isAdminImpersonating
    });

    const respData = await axios({
      method: "post",
      url: fullUrl,
      data: formData, // ✅ Use modified FormData
      headers,
    });

    const response = respChanges(respData.data);
    response.httpStatus = respData.status;
    console.log("✅ POST Multipart Response:", response);
    return response;
  } catch (err) {
    const errorUrl = data?.apiUrl ? backendHost + data.apiUrl : 'undefined';
    console.error("❌ POST Multipart Error:", {
      message: err.message,
      response: err.response?.data,
      url: errorUrl,
      apiUrl: data?.apiUrl
    });

    return {
      status: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Something went wrong during file upload.",
      data: [],
    };
  }
};


// export const postMultipart = async (data) => {
//   try {
//     const token = localStorage.getItem("authToken");
//     const headers = {
//       Authorization: token ? `Bearer ${token}` : "",
//       "Content-Type": "multipart/form-data",
//     };

//     console.log("🌐 POST (Multipart) Request:", {
//       url: backendHost + data.apiUrl,
//       formDataKeys: data.formData ? Array.from(data.formData.keys()) : [],
//     });

//     const respData = await axios({
//       method: "post",
//       url: backendHost + data.apiUrl,
//       data: data.formData, // must be FormData object
//       headers,
//     });

//     console.log("✅ POST (Multipart) Response:", respData.data);
//     return respChanges(respData.data);
//   } catch (err) {
//     console.error("❌ POST (Multipart) Error:", err.response?.data || err);
//     return {
//       status: false,
//       message:
//         err.response?.data?.message || "Something went wrong while uploading file.",
//       data: [],
//     };
//   }
// };
