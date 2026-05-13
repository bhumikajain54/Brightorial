import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import MetricCard, { MatrixCard, Horizontal4Cards } from '../../../../shared/components/metricCard.jsx';
import { PillNavigation } from '../../../../shared/components/navigation.jsx';
import { COLORS, TAILWIND_COLORS } from '../../../../shared/WebConstant.js';
import Button from '../../../../shared/components/Button.jsx';
import CourseOversight from './CourseOversight.jsx';
import JobPosting from './JobPosting.jsx';
import { getMethod } from '../../../../service/api';
import apiService from '../../services/serviceUrl';

const JobCourseControlView = () => {
  // ====== STATE MANAGEMENT ======
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return tab === 'course-oversight' ? 1 : 0;
  });
  
  // Job metrics state
  const [jobMetricsData, setJobMetricsData] = useState({
    total_jobs: 0,
    active_campaigns: 0,
    flagged_jobs: 0,
    promoted_jobs: 0
  });

  // Course metrics state
  const [courseMetricsData, setCourseMetricsData] = useState({
    total_courses: 0,
    active_batches: 0,
    total_enrollments: 0,
    total_institutes: 0
  });


  // ====== NAVIGATION CONFIGURATION ======
  const navigationTabs = [
    {
      id: 'job-posting',
      label: 'Job Posting Control',
      icon: () => (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      )
    },
    {
      id: 'course-oversight',
      label: 'Course Oversight',
      icon: () => (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      )
    }
  ];


  const jobMetrics = [
    { title: "Total Job Posts", value: jobMetricsData.total_jobs.toString(), icon: "💼" },
    { title: "Active Campaigns", value: jobMetricsData.active_campaigns.toString(), icon: "📊" },
    { title: "Flagged Content", value: jobMetricsData.flagged_jobs.toString(), icon: "⚠️" },
    { title: "Promoted Posts", value: jobMetricsData.promoted_jobs.toString(), icon: "🚀" }
  ];

  const courseMetrics = [
    { title: "Total Courses", value: courseMetricsData.total_courses.toString(), icon: "📚" },
    { title: "Active Batches", value: courseMetricsData.active_batches.toString(), icon: "🎓" },
    { title: "Total Enrollments", value: courseMetricsData.total_enrollments.toString(), icon: "👥" },
    { title: "Total Institutes", value: courseMetricsData.total_institutes.toString(), icon: "🏫" }
  ];

  // Get current metrics based on active tab
  const currentMetrics = activeTab === 0 ? jobMetrics : courseMetrics;





  // ====== API CALL ======
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await getMethod({
        apiUrl: apiService.getJobCourseDashboardStats
      });

      console.log('📊 Dashboard Stats API Response:', response);

      // Check if response is successful
      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true;

      if (isSuccess && response?.data) {
        // Update job metrics
        if (response.data.jobs) {
          setJobMetricsData({
            total_jobs: response.data.jobs.total_jobs || 0,
            active_campaigns: response.data.jobs.active_campaigns || 0,
            flagged_jobs: response.data.jobs.flagged_jobs || 0,
            promoted_jobs: response.data.jobs.promoted_jobs || 0
          });
        }

        // Update course metrics
        if (response.data.courses) {
          setCourseMetricsData({
            total_courses: response.data.courses.total_courses || 0,
            active_batches: response.data.courses.active_batches || 0,
            total_enrollments: response.data.courses.total_enrollments || 0,
            total_institutes: response.data.courses.total_institutes || 0
          });
        }
      } else {
        console.error('❌ Failed to fetch dashboard stats:', response?.message);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // ====== EFFECTS ======
  useEffect(() => {
    const current = searchParams.get('tab');
    const expectedTab = activeTab === 0 ? 'job-posting' : 'course-oversight';
    if (current !== expectedTab) {
      const next = new URLSearchParams(searchParams);
      next.set('tab', expectedTab);
      setSearchParams(next, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  return (
    <div className="admin-jobcourse-root space-y-6">
      {/* Header */}
      <MatrixCard 
        title="Job & Course Control"
        subtitle="Manage job postings, course approvals, and content quality control"
      />
      
      {/* Metrics */}
      <Horizontal4Cards data={currentMetrics} />

      {/* Tabs */}
      <PillNavigation 
        tabs={navigationTabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        storageKey="admin_job_course_control_tab"
      />

      {/* Job Posting */}
      {activeTab === 0 && <JobPosting />}

      {/* Course Oversight */}
      {activeTab === 1 && <CourseOversight />}
    </div>
  );
};

export default JobCourseControlView;
