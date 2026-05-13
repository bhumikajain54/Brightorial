const service = {
    //admin url
    studentsList: '/admin/list_students.php',
    employersList: '/admin/list_employers.php',
    institutesList: '/admin/list_institutes.php',

    updateEmployer: '/employer/update_recruiter_profile.php',
    updateInstitute: '/institute/profile_updated.php',

    //management

    adminInstituteManagement: '/admin/admin_institute_management.php',
    getJobCourseDashboardStats: '/admin/get_job_course_dashboard_stats.php',

    //job flags
    flagJob: '/admin/flag_job.php',
    resolveJobFlag: '/admin/resolve_job_flag.php',
    getJobFlags: '/admin/get_job_flags.php',

    //course categories
    getCourseCategory: '/courses/get_course_category.php',
    createCourseCategory: '/courses/create_course_category.php',

    //employer ratings
    getEmployerRatings: '/admin/get_employer_feedback.php',

    //admin dashboard
    adminDashboard: '/admin/admin_dashboard.php',
    adminJobPostingAnalytics: '/admin/admin_job_posting_analytics.php',

    //certificates
    getCertificateIssuance: '/certificates/certificates_issuance.php',

    //alert settings
    getAlertSettings: '/admin/get_alert_settings.php',
    updateAlertSettings: '/admin/update_alert_settings.php',
    getUpcomingCourseDeadlines: '/admin/get_upcoming_course_deadlines.php',

    //jobs and courses for filters
    getJobs: '/jobs/jobs.php',
    getCourses: '/courses/courses.php',
    getJobDetail: '/jobs/job-detail.php',

}

export default service;