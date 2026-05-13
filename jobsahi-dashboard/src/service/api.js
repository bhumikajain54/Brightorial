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
  if (includeAuth && token) headers["Authorization"] = `Bearer ${token}`;
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

    const headers = getHeaders();
    const token = localStorage.getItem("authToken");

    const fullUrl = backendHost + data.apiUrl;
    console.log('🌐 GET Request:', {
      url: fullUrl,
      token: token ? `${token.substring(0, 15)}...` : 'No token'
    });

    const respData = await axios({
      method: 'get',
      url: fullUrl,
      params: data.params || {}, // ✅ use params for GET
      headers
    });

    console.log('✅ GET Response:', respData.data);
    return respChanges(respData.data);
  } catch (err) {
    const errorUrl = data?.apiUrl ? backendHost + data.apiUrl : 'undefined';
    console.error('❌ GET Error:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      url: errorUrl,
      apiUrl: data?.apiUrl
    });
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
    const headers = getHeaders(!skipToken);


    console.log('🌐 POST Request:', {
      url: backendHost + data.apiUrl,
      payload: data.payload,
      token: headers.Authorization ? `${headers.Authorization.substring(0, 20)}...` : 'No token'
    });

    const respData = await axios({
      method: 'post',
      url: backendHost + data.apiUrl,
      data: data.payload || {},
      headers
    });

    const response = respChanges(respData.data);
    response.httpStatus = respData.status;
    console.log('✅ POST Response:', response);
    return response;
  } catch (err) {
    console.error('❌ POST Error:', err.response?.data || err);
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
    console.log('🌐 PUT Request:', {
      url: backendHost + data.apiUrl,
      payload: data.payload || data.data,
      skipToken: hasUserId
    });

    const respData = await axios({
      method: 'put',
      url: backendHost + data.apiUrl,
      data: data.payload || data.data || {},
      headers
    });

    console.log('✅ PUT Response:', respData.data);
    return respChanges(respData.data);
  } catch (err) {
    console.error('❌ PUT Error:', err.response?.data || err);
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

    console.log("🌐 PUT Multipart Request:", {
      url: backendHost + data.apiUrl,
      data: data.data instanceof FormData ? "[FormData]" : data.data,
      token: token ? `${token.substring(0, 15)}...` : "No token",
      skipToken: hasUserId
    });

    const respData = await axios({
      method: "put",
      url: backendHost + data.apiUrl,
      data: data.data, // ✅ This must be FormData
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

    const fullUrl = backendHost + data.apiUrl;
    console.log("🌐 POST Multipart Request:", {
      url: fullUrl,
      data: data.data instanceof FormData ? "[FormData]" : data.data,
      token: token ? `${token.substring(0, 15)}...` : "No token",
    });

    const respData = await axios({
      method: "post",
      url: fullUrl,
      data: data.data, // ✅ This must be FormData
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
