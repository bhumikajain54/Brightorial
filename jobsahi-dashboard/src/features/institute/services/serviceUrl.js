// ✅ Add this constant at the very top
// const instituteBase = "/institute";

const apiService = {
  // Dashboard
  dashboardStats: '/institute/dashboard_stats.php',

  // Courses
  createCourse: '/courses/create_course.php',
  getCourses: '/courses/courses.php',
  updateCourse: '/courses/update_course.php',
  deleteCourse: '/courses/delete_course.php',
  getCourseModules: '/courses/get_course_modules.php',
  getCourseModule: '/courses/get_course_module.php',
  updateCourseModule: '/courses/update_course_module.php',
  deleteCourseModule: '/courses/delete_course_module.php',
  getSingleCourse: '/courses/get-course_by_id.php',


  // Batches
  createBatch: '/batches/create_batch.php',
  getBatches: '/batches/get_batch.php',
  updateBatch: '/batches/update_batch.php',
  // deleteBatch: '/batches/delete_batch.php',

  // Faculty/Instructors
  createFaculty: '/faculty/create_faculty_user.php',
  getFaculty: '/faculty/get_faculty_users.php',
  updateFaculty: '/faculty/update_faculty_user.php',
  getCourseCategories: '/courses/get_course_category.php',
  createCourseCategory: "/courses/create_course_category.php",

  // Course & Batch Relations
  courseByBatch: '/institute/course_by_batch.php',

  // Certificates
  CourseBatchStudents: "/courses/course_batch_students.php",
  generateCertificate: "/certificates/certificates.php", // For generating certificates (POST)
  certificatesIssuance: "/certificates/certificates_issuance.php", // For getting all issuance logs (no id) and single certificate (with ?id=xxx) - used in IssuanceLogs.jsx
  getCertificates: "/certificates/certificates.php", // Keep for backward compatibility
  getCertificate: "/certificates/get-certificate.php", // For preview single certificate (GET with ?id=xxx)
  getCertificateById: "/certificates/get_certificate.php", // For viewing single certificate (GET with ?id=xxx) - used in IssuanceLogs.jsx

  // Certificate Templates
  createCertificateTemplate: "/certificate_templates/create_certificate_template.php",
  certificateTemplates: "/certificate_templates/get_certificate_templates.php", // Used in CertificateGeneration.jsx - get all templates
  getCertificateTemplate: "/certificate_templates/get_certificate_templates.php", // For Manage Template - get single template by ID (use ?id=5)
  certificateTemplatesList: "/certificate_templates/get_certificate_templates.php", // Used in ManageTemplate.jsx and CertificateGeneration.jsx - get all templates
  updateCertificateTemplate: "/certificate_templates/update_certificate_template.php", // For updating templates

  // ✅ FIXED ENDPOINT — now works correctly
  institute_view_students: `/institute/get_institute_students.php`,
  list_students: "/admin/list_students.php",
  assign_course_batch: "/institute/assign_course_batch.php",
  update_student: "/institute/update_student.php",
  get_student_profile: "/institute/get_student_profile.php", // For fetching single student profile
  INSTITUTE_REPORT: "/institute/institute_report.php",

  getInstituteProfile: '/institute/profile.php',
  updateInstituteProfile: '/institute/institute_profile_updated.php',

};

export default apiService;
