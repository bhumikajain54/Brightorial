// import config
import axios from './axios';

export const respChanges = (data) => {
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
