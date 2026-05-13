/**
 * Utility functions for user-specific localStorage management
 * Prevents conflicts when multiple users log in on the same browser
 */

/**
 * Get current user ID from localStorage
 * @returns {string|null} User ID or null if not logged in
 */
export const getUserId = () => {
  try {
    const authUser = localStorage.getItem("authUser");
    if (authUser) {
      const user = JSON.parse(authUser);
      return user.id || user.uid || null;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
  }
  return null;
};

/**
 * Get current user role from localStorage
 * @returns {string|null} User role or null if not logged in
 */
export const getUserRole = () => {
  try {
    const authUser = localStorage.getItem("authUser");
    if (authUser) {
      const user = JSON.parse(authUser);
      return user.role || null;
    }
  } catch (error) {
    console.error('Error getting user role:', error);
  }
  return null;
};

/**
 * Generate user-specific localStorage key
 * @param {string} baseKey - Base key name (e.g., 'job_drafts', 'admin_management_tab')
 * @returns {string} User-specific key (e.g., 'job_drafts_user_123')
 */
export const getUserSpecificKey = (baseKey) => {
  const userId = getUserId();
  const userRole = getUserRole();
  
  // If no user ID, return base key (for backward compatibility during transition)
  if (!userId) {
    return baseKey;
  }
  
  // Include both role and ID to ensure uniqueness
  return `${baseKey}_${userRole}_${userId}`;
};

/**
 * Clear all user-specific localStorage items for current user
 * Called on logout or login to prevent conflicts
 */
export const clearUserSpecificStorage = () => {
  const userId = getUserId();
  const userRole = getUserRole();
  
  if (!userId || !userRole) {
    return;
  }
  
  const prefix = `_${userRole}_${userId}`;
  const keysToRemove = [];
  
  // Find all keys that match the user-specific pattern
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.endsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all user-specific keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log(`🧹 Cleared ${keysToRemove.length} user-specific localStorage items for ${userRole}_${userId}`);
};

/**
 * Clear all old non-user-specific keys (for migration)
 * Only clears keys that should be user-specific
 */
export const clearOldStorageKeys = () => {
  const oldKeys = [
    'job_drafts',
    'skillTestQuestions',
    'institute_course_detail_id',
    'admin_management_tab',
    'recruiter_job_management_tab',
    'recruiter_interview_scheduler_tab',
    'recruiter_skill_test_tab',
    'recruiter_company_profile_tab',
    'recruiter_candidate_management_tab',
    'institute_student_management_tab',
    'institute_reports_analytics_tab',
    'institute_profile_setting_tab',
    'institute_course_management_tab',
    'institute_certificates_tab',
    'admin_tools_logs_tab',
    'admin_system_settings_tab',
    'admin_reports_analytics_tab',
    'admin_messaging_campaigns_tab',
    'admin_job_course_control_tab',
    'admin_business_revenue_tab',
    'admin_alerts_automation_tab',
    'admin_institute_management_tab',
    'admin_employer_management_tab',
    'recruiter_message_notification_tab',
    'institute_messaging_alerts_tab',
    'admin_email_sms_manager_tab',
    'admin_featured_content_tab',
  ];
  
  oldKeys.forEach(key => {
    localStorage.removeItem(key);
  });
};

