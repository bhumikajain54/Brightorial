const service = {

    //recruiter url
    getRecruiterJobs: '/employer/get_recruiter_jobs.php',
    getInterviewDetails: '/employer/get_interview_details.php',
    recruiterProfile: '/employer/profile.php',
    recruiterReports: '/employer/recruiter_reports.php',
    fetchEmployerJobs: '/employer/fetch_employer_jobs.php',
    getRecentApplications: '/employer/get_recent_applicants.php',
    getWeeklyApplicants: '/employer/get_recruiter_weekly_stats.php',

    //job management
    createJob: '/jobs/create_job.php',
    getJobs: "/jobs/jobs.php",
    getJobCategory: "/jobs/get_job_category.php",
    getJobDetail: "/jobs/job-detail.php",          // for fetching single job by id
    updateJob: "/jobs/update_job.php", 

    //candidate management
    getRecentApplicants: "/employer/get_recent_applicants.php",
    getApplication: "/student/get_application.php",

    
    //interview schedule
    scheduleInterview: "/applications/schedule_interview.php",
    getScheduledInterviews: "/applications/schedule_interview.php",
    updateInterview: "/applications/update_interview.php",
    updateApplicationStatus: "/applications/update_application_status.php",

    //interview panel management
    addInterviewPanel: "/interviews/add_interview_panel.php",
    getInterviewPanel: "/interviews/get_interview_panel.php",
    updateInterviewPanel: "/interviews/update_interview_panel.php",

    //report 
    recruiterAnalyticsReports: "/employer/recruiter_analytics_reports.php",

    //profile
      getRecruiterProfile: "/employer/profile.php",
  updateRecruiterProfile: "/employer/update_recruiter_profile.php",

    //skill test
    addSkillQuestion: "/skills/skill-questions.php",
    getSkillQuestions: "/skills/skill-questions.php",

};
export default service;