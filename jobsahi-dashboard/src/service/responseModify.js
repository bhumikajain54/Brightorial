// import config
import axios from './axios';

export const respChanges = (data) => {
    // Handle string responses (HTML error pages from backend)
    if (typeof data === 'string') {
        // If backend returns HTML/string instead of JSON, return error object
        console.warn('⚠️ Backend returned string instead of JSON:', data.substring(0, 100));
        return {
            status: false,
            success: false,
            message: 'Invalid response format from server',
            data: [],
            error: { message: 'Backend returned non-JSON response' }
        };
    }
    
    // Ensure data is an object
    if (typeof data !== 'object' || data === null) {
        return {
            status: false,
            success: false,
            message: 'Invalid response format',
            data: [],
            error: {}
        };
    }
    
    // Handle different response formats
    if(data.success === true || data.status === 'success' || data.message === 'User registered successfully') {
        data.status = 'success';
        data.success = true;
    } else if(data.success === false || data.status === 'error') {
        data.status = 'error';
        data.success = false;
    }

    if(typeof data.error == 'undefined') {
        data.error = {}
    }
    
    // Log the response for debugging
    console.log('ResponseModify - Original:', data);
    console.log('ResponseModify - Final Status:', data.status);
    
    return data;
}
