const service = {
    //auth url
    signin: '/auth/login.php',
    phoneLogin: '/auth/phone_login.php',
    forgotPassword: '/auth/forgot-password.php',
    verifyOtp: '/auth/verify-otp.php',
    resendOtp: '/auth/resend-otp.php',
    changePassword: '/auth/change_password.php',
    signup: '/user/create_user.php',
    logout: '/auth/logout.php',
    updateUser: '/user/update_user.php',

    // Profile APIs for account creation
    // Recruiter Profile
    createRecruiterProfile: '/employer/create_recruiter_profile.php', // POST - for account creation (no token needed)
    updateRecruiterProfile: '/employer/update_recruiter_profile.php', // PUT - for updates (token needed)
    getRecruiterProfile: '/employer/profile.php',
    
    // Institute Profile
    createInstituteProfile: '/institute/create_institute_profile.php', // POST - for account creation (no token needed)
    updateInstituteProfile: '/institute/institute_profile_updated.php', // PUT - for updates (token needed)
    getInstituteProfile: '/institute/profile.php',
    
    // Student Profile
    createStudentProfile: '/student/create_student_profile.php', // POST - for account creation (no token needed)
    updateStudentProfile: '/student/profile_updated.php', // PUT - for updates (token needed)
    getStudentProfile: '/student/profile.php',
    
    // Admin Profile (uses updateUser, no separate profile table)

}

export default service;