import React, { useState, useEffect, useCallback } from 'react';
import { COLORS, TAILWIND_COLORS } from '../../../../shared/WebConstant.js';
import Button from '../../../../shared/components/Button.jsx';
import { getMethod, postMethod, putMethod } from '../../../../service/api';
import service from '../../../../service/serviceUrl';
import apiService from '../../services/serviceUrl';
import Swal from 'sweetalert2';

const JobPosting = () => {
  // ====== STATE MANAGEMENT ======
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [promotionJobId, setPromotionJobId] = useState('');
  const [topRibbonEnabled, setTopRibbonEnabled] = useState(false);
  const [priorityListingEnabled, setPriorityListingEnabled] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [showEditComparisonModal, setShowEditComparisonModal] = useState(false);
  const [selectedEditJob, setSelectedEditJob] = useState(null);
  const [originalJobData, setOriginalJobData] = useState(null);
  const [loadingOriginalData, setLoadingOriginalData] = useState(false);
  const [approvedJobsSnapshot, setApprovedJobsSnapshot] = useState({}); // Store snapshot of approved jobs

  // ====== DATA CONFIGURATION ======
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flaggedJobIds, setFlaggedJobIds] = useState([]);
  const [flaggedJobsMap, setFlaggedJobsMap] = useState({}); // Map of job_id to flag_id
  const [jobFlagsStatus, setJobFlagsStatus] = useState({}); // Map of job_id to {admin_action, reviewed}

  // ====== API CALL ======
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMethod({
        apiUrl: service.getJobs
      });

      console.log('📊 Jobs API Response:', response);

      // Check if response is successful
      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true;

      if (isSuccess && response?.data) {
        // Helper function to capitalize first letter of each word
        const capitalizeWords = (str) => {
          if (!str || str === 'N/A') return str;
          return str.toLowerCase().split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        };

        // Map API response to component format
        const mappedJobs = response.data.map((job) => {
          // Format posted date (only date, no time)
          const postedDate = job.created_at || job.posted_date || null;
          let formattedPosted = 'N/A';
          if (postedDate) {
            try {
              const date = new Date(postedDate);
              if (!isNaN(date.getTime())) {
                formattedPosted = date.toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric'
                });
              }
            } catch (e) {
              formattedPosted = postedDate.split(' ')[0]; // Fallback: take only date part
            }
          }

          return {
            id: job.id || job.job_id,
            title: capitalizeWords(job.title || 'N/A'),
            company: capitalizeWords(job.company_name || job.company || 'N/A'),
            posted: formattedPosted,
            lastUpdated: job.last_updated || job.updated_at || job.updated_date || null,
            status: job.admin_action === 'approved' ? 'Approved' : 
                   job.admin_action === 'pending' ? 'Pending' : 
                   job.is_featured === 1 ? 'Promoted' : 
                   job.status === 'flagged' ? 'Flagged' : 
                   'Pending',
            // Keep all original data
            ...job
          };
        });

        console.log('✅ Mapped Jobs:', mappedJobs);
        setJobPostings(mappedJobs);
        
        // ✅ Store snapshot of ALL jobs for comparison when they get edited
        // This way we can compare current state with previous state
        const jobsSnapshot = {};
        mappedJobs.forEach(job => {
          const jobId = job.id || job.job_id;
          if (jobId) {
            // Store current state as snapshot
            // If job was approved before, keep the old snapshot (don't overwrite)
            // If job is pending edit, we'll use the snapshot from when it was approved
            if (job.admin_action === 'approved') {
              // Update snapshot for approved jobs (latest approved state)
              jobsSnapshot[jobId] = {
                title: job.title,
                location: job.location,
                salary_min: job.salary_min,
                salary_max: job.salary_max,
                experience_required: job.experience_required,
                job_type: job.job_type,
                no_of_vacancies: job.no_of_vacancies,
                skills_required: job.skills_required,
              };
            }
            // For pending jobs, don't update snapshot (keep the old approved snapshot if exists)
          }
        });
        // Merge with existing snapshot (don't overwrite existing snapshots for pending jobs)
        setApprovedJobsSnapshot(prev => {
          // Load from localStorage first
          const storedSnapshots = JSON.parse(localStorage.getItem('jobApprovedSnapshots') || '{}');
          const merged = { ...storedSnapshots, ...prev };
          
          Object.keys(jobsSnapshot).forEach(jobId => {
            // Only update if job is approved (to preserve old snapshot for pending jobs)
            const job = mappedJobs.find(j => (j.id || j.job_id) == jobId);
            if (job && job.admin_action === 'approved') {
              merged[jobId] = jobsSnapshot[jobId];
            } else if (!merged[jobId]) {
              // If no existing snapshot and job is pending, store current as snapshot
              merged[jobId] = jobsSnapshot[jobId] || {
                title: job?.title,
                location: job?.location,
                salary_min: job?.salary_min,
                salary_max: job?.salary_max,
                experience_required: job?.experience_required,
                job_type: job?.job_type,
                no_of_vacancies: job?.no_of_vacancies,
                skills_required: job?.skills_required,
              };
            }
          });
          
          // Save to localStorage
          localStorage.setItem('jobApprovedSnapshots', JSON.stringify(merged));
          
          return merged;
        });
      } else {
        console.error('❌ Failed to fetch jobs:', response?.message);
        setJobPostings([]);
      }
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      setJobPostings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Load snapshots from localStorage on mount
  useEffect(() => {
    const storedSnapshots = JSON.parse(localStorage.getItem('jobApprovedSnapshots') || '{}');
    if (Object.keys(storedSnapshots).length > 0) {
      setApprovedJobsSnapshot(storedSnapshots);
      console.log('📸 Loaded snapshots from localStorage:', storedSnapshots);
    }
  }, []);

  const fetchFlaggedJobs = useCallback(async () => {
    try {
      const response = await getMethod({
        apiUrl: apiService.getJobFlags
      });
         const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true;

      if (isSuccess) {
        // Check multiple possible response structures
        let flagsArray = null;
        
        if (response?.data?.flags && Array.isArray(response.data.flags)) {
          flagsArray = response.data.flags;
          console.log('✅ Found flags in response.data.flags');
        } else if (Array.isArray(response?.data)) {
          flagsArray = response.data;
          console.log('✅ Found flags in response.data (direct array)');
        } else if (Array.isArray(response?.flags)) {
          flagsArray = response.flags;
          console.log('✅ Found flags in response.flags');
        }
        
        if (flagsArray && flagsArray.length > 0) {
          // Create maps: job_id to flag info (store ALL flags - both approved and pending)
          const flaggedIds = [];
          const flaggedMap = {};
          const flagsStatusMap = {};
          
          flagsArray.forEach(flag => {
            const jobId = flag.job_id || flag.id || flag.jobId;
            const flagId = flag.flag_id || flag.id;
            const adminAction = (flag.admin_action || '').toLowerCase();
            const reviewed = flag.reviewed === 1 || flag.reviewed === true;
            
            if (jobId !== undefined && jobId !== null && flagId !== undefined && flagId !== null) {
              // Store flag info for this job (ALL flags - approved and pending)
              flagsStatusMap[jobId] = {
                admin_action: adminAction,
                reviewed: reviewed,
                status: flag.status || '',
                flag_id: flagId
              };
              
              // Always store flag_id mapping (needed for resolve API)
              flaggedMap[jobId] = flagId;
              
              // If flag is not approved (pending/flagged/under review), add to flagged list
              if (adminAction !== 'approved' && !reviewed) {
                flaggedIds.push(jobId);
                console.log('🚩 Flagged job - job_id:', jobId, 'flag_id:', flagId, 'admin_action:', adminAction);
              } else if (adminAction === 'approved') {
                console.log('✅ Approved flag - job_id:', jobId, 'flag_id:', flagId, 'admin_action:', adminAction);
              }
            }
          });
          
          console.log('🚩 Flagged Job IDs (pending):', flaggedIds);
          console.log('🚩 All Job Flags Status Map:', flagsStatusMap);
          console.log('🚩 Flagged Jobs Map (flag_id):', flaggedMap);
          setFlaggedJobIds(flaggedIds);
          setFlaggedJobsMap(flaggedMap);
          setJobFlagsStatus(flagsStatusMap);
          
          // Update jobPostings to include flag_id (hidden column)
          setJobPostings(prev => prev.map(job => {
            const jobId = job.id || job.job_id;
            if (flaggedMap[jobId]) {
              return {
                ...job,
                flag_id: flaggedMap[jobId], // Store flag_id in job object (hidden column)
                _flag_id: flaggedMap[jobId] // Alternative key for easy access
              };
            }
            return job;
          }));
        } else {
          console.log('⚠️ No flags array found in response');
          setFlaggedJobIds([]);
          setFlaggedJobsMap({});
          setJobFlagsStatus({});
        }
      } else {
        console.log('⚠️ API response not successful');
        setFlaggedJobIds([]);
      }
    } catch (error) {
      console.error('❌ Error fetching flagged jobs:', error);
      setFlaggedJobIds([]);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchJobs();
      await fetchFlaggedJobs();
    };
    loadData();
  }, []);


  // ====== COMPUTED VALUES ======
  const filteredJobs = jobPostings.filter(job => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q);
    
    // If "All Status" is selected, show all jobs
    if (statusFilter === 'All Status') {
      return matchesSearch;
    }
    
    // Get job ID for flag status lookup
    const jobId = job.id || job.job_id;
    const flagInfo = jobFlagsStatus[jobId];
    const jobAdminAction = (job.admin_action || '').toLowerCase();
    
    // ✅ Special handling for "Pending Edit Approval" filter
    if (statusFilter === 'Pending Edit Approval') {
      // Show jobs that have admin_action="pending" but no flag (meaning they were edited)
      // Jobs with flags are handled separately as "Flagged"
      const hasNoFlag = !flagInfo;
      const isPendingEdit = jobAdminAction === 'pending' && hasNoFlag;
      return matchesSearch && isPendingEdit;
    }
    
    // ✅ Special handling for "Pending" filter
    if (statusFilter === 'Pending') {
      // Show jobs that are pending (either initial pending or pending edit approval)
      // But exclude flagged jobs (they have their own filter)
      const hasNoFlag = !flagInfo;
      const isPending = (jobAdminAction === 'pending' || !jobAdminAction || jobAdminAction === '') && hasNoFlag;
      // Also include jobs that don't have admin_action set (new jobs)
      const isNewPending = !jobAdminAction && !flagInfo && job.is_featured !== 1;
      return matchesSearch && (isPending || isNewPending);
    }
    
    // Determine actual status based on flag info and job data
    let actualStatus = 'Pending'; // Default to Pending
    
    // Check flag status first (highest priority)
    if (flagInfo) {
      const flagAdminAction = flagInfo.admin_action;
      if (flagAdminAction === 'approved') {
        actualStatus = 'Approved';
      } else if (flagAdminAction === 'pending' || flagAdminAction === 'flagged' || flagAdminAction === '') {
        actualStatus = 'Flagged';
      } else {
        // Flag exists but action is not approved/pending/flagged → Pending
        actualStatus = 'Pending';
      }
    } else {
      // No flag info - check job's own admin_action
      if (jobAdminAction === 'approved') {
        actualStatus = 'Approved';
      } else if (jobAdminAction === 'pending') {
        // Job with pending admin_action but no flag = Pending Edit Approval
        actualStatus = 'Pending Edit Approval';
      } else if (jobAdminAction === 'flagged') {
        actualStatus = 'Flagged';
      } else if (job.is_featured === 1) {
        actualStatus = 'Promoted';
      } else {
        // No flag, no admin_action, not featured → Pending
        actualStatus = 'Pending';
      }
    }
    
    const matchesStatus = actualStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ====== EVENT HANDLERS ======
  // Job selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedJobs(filteredJobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (jobId, checked) => {
    setSelectedJobs(prev => checked ? [...new Set([...prev, jobId])] : prev.filter(id => id !== jobId));
  };

  // Fetch original job data before update
  const fetchOriginalJobData = async (jobId, currentJob) => {
    try {
      setLoadingOriginalData(true);
      
      // ✅ First, check localStorage for snapshot
      const storedSnapshots = JSON.parse(localStorage.getItem('jobApprovedSnapshots') || '{}');
      const snapshot = storedSnapshots[jobId] || approvedJobsSnapshot[jobId];
      
      if (snapshot) {
        console.log('📸 Using stored snapshot for job:', jobId, snapshot);
        setOriginalJobData(snapshot);
        setLoadingOriginalData(false);
        return;
      }
      
      // ✅ If no snapshot, try to fetch from API
      const response = await getMethod({
        apiUrl: `${apiService.getJobDetail}?id=${jobId}`
      });
      
      console.log('📊 Original Job Data Response:', response);
      
      // If API returns original data, use it
      if (response?.status && response?.data) {
        const jobInfo = response.data.job_info || response.data;
        if (jobInfo) {
          // Check if backend provides original values (like original_location, etc.)
          const originalData = {
            title: jobInfo.original_title || jobInfo.title,
            location: jobInfo.original_location || jobInfo.location,
            salary_min: jobInfo.original_salary_min || jobInfo.salary_min,
            salary_max: jobInfo.original_salary_max || jobInfo.salary_max,
            experience_required: jobInfo.original_experience_required || jobInfo.experience_required,
            job_type: jobInfo.original_job_type || jobInfo.job_type,
            no_of_vacancies: jobInfo.original_no_of_vacancies || jobInfo.no_of_vacancies,
            skills_required: jobInfo.original_skills_required || jobInfo.skills_required,
          };
          
          // If backend doesn't provide original values, use current job's values as fallback
          // This means the job hasn't been edited yet or original values aren't stored
          if (!jobInfo.original_location && !jobInfo.original_title) {
            // Use current values as original (means no change detected or first time viewing)
            setOriginalJobData({
              title: currentJob.title,
              location: currentJob.location,
              salary_min: currentJob.salary_min,
              salary_max: currentJob.salary_max,
              experience_required: currentJob.experience_required,
              job_type: currentJob.job_type,
              no_of_vacancies: currentJob.no_of_vacancies,
              skills_required: currentJob.skills_required,
            });
          } else {
            setOriginalJobData(originalData);
          }
        }
      } else {
        // If API doesn't return original values, use current job values
        setOriginalJobData({
          title: currentJob.title,
          location: currentJob.location,
          salary_min: currentJob.salary_min,
          salary_max: currentJob.salary_max,
          experience_required: currentJob.experience_required,
          job_type: currentJob.job_type,
          no_of_vacancies: currentJob.no_of_vacancies,
          skills_required: currentJob.skills_required,
        });
      }
    } catch (error) {
      console.error('Error fetching original job data:', error);
      // On error, use current job values
      setOriginalJobData({
        title: currentJob.title,
        location: currentJob.location,
        salary_min: currentJob.salary_min,
        salary_max: currentJob.salary_max,
        experience_required: currentJob.experience_required,
        job_type: currentJob.job_type,
        no_of_vacancies: currentJob.no_of_vacancies,
        skills_required: currentJob.skills_required,
      });
    } finally {
      setLoadingOriginalData(false);
    }
  };

  // Job action handlers
  const handleViewJob = async (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
    // Fetch original job data if job was updated
    const jobId = job.id || job.job_id;
    if (job.lastUpdated && (job.admin_action === 'pending' || job.admin_action === 'approved')) {
      await fetchOriginalJobData(jobId, job);
    } else {
      // If no update, use current values as original
      setOriginalJobData({
        title: job.title,
        location: job.location,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        experience_required: job.experience_required,
        job_type: job.job_type,
        no_of_vacancies: job.no_of_vacancies,
        skills_required: job.skills_required,
      });
    }
  };

  const handleCloseJobModal = () => {
    setShowJobModal(false);
    setSelectedJob(null);
    setOriginalJobData(null);
  };

  const handleApproveJob = async (jobId) => {
    try {
      // Get flag_id from multiple sources (priority order):
      // 1. From job object itself (hidden column)
      // 2. From flaggedJobsMap
      // 3. From jobFlagsStatus
      const job = jobPostings.find(j => (j.id || j.job_id) === jobId);
      const flagIdFromJob = job?.flag_id || job?._flag_id;
      const flagIdFromMap = flaggedJobsMap[jobId];
      const flagIdFromStatus = jobFlagsStatus[jobId]?.flag_id;
      
      // Use the first available flag_id
      const flagId = flagIdFromJob || flagIdFromMap || flagIdFromStatus;
      
      console.log('🔍 Approve - Flag ID lookup - jobId:', jobId, 'flagIdFromJob:', flagIdFromJob, 'flagIdFromMap:', flagIdFromMap, 'flagId:', flagId);
      
      if (!flagId) {
        Swal.fire('Error!', 'Flag ID not found for this job. Please refresh the page and try again.', 'error');
        return;
      }

      const { value: reason } = await Swal.fire({
        title: 'Approve/Resolve Job Flag',
        input: 'textarea',
        inputLabel: 'Reason for approval',
        inputPlaceholder: 'Enter the reason for approving/resolving this flagged job...',
        inputAttributes: {
          'aria-label': 'Enter reason for approval'
        },
        showCancelButton: true,
        confirmButtonColor: COLORS.GREEN_PRIMARY,
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Approve & Resolve',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value) {
            return 'You need to provide a reason!';
          }
        }
      });

      if (reason) {
        console.log('📤 Resolving flag - flag_id:', flagId, 'job_id:', jobId);
        
        // API expects flag_id in URL parameter (primary key of job_flags table)
        const response = await putMethod({
          apiUrl: `${apiService.resolveJobFlag}?id=${flagId}`,
          payload: {
            reason: reason,
            admin_action: 'approved'
          }
        });

        console.log('📥 Resolve Flag Response:', response);

        if (response?.status === true || response?.success === true) {
          // Update local state immediately
          const updatedFlagStatus = { ...jobFlagsStatus };
          if (updatedFlagStatus[jobId]) {
            updatedFlagStatus[jobId] = {
              ...updatedFlagStatus[jobId],
              admin_action: 'approved',
              reviewed: true
            };
          }
          setJobFlagsStatus(updatedFlagStatus);
          
          // Remove from flagged list
          setFlaggedJobIds(prev => prev.filter(id => id !== jobId));
          
          setLastAction({ type: 'approved', message: 'Job flag resolved successfully' });
          Swal.fire('Success!', 'Job flag resolved successfully', 'success');
          
          // Refresh data
          await fetchFlaggedJobs();
          await fetchJobs();
          
          setTimeout(() => setLastAction(null), 3000);
        } else {
          Swal.fire('Error!', response?.message || 'Failed to resolve job flag', 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error resolving job flag:', error);
      Swal.fire('Error!', error?.message || 'Failed to resolve job flag', 'error');
    }
  };

  const handleFlaggedJob = async (jobId) => {
    try {
      // Get flag_id from multiple sources (priority order):
      // 1. From job object itself (hidden column)
      // 2. From flaggedJobsMap
      // 3. From jobFlagsStatus
      const job = jobPostings.find(j => (j.id || j.job_id) === jobId);
      const flagIdFromJob = job?.flag_id || job?._flag_id;
      const flagIdFromMap = flaggedJobsMap[jobId];
      const flagIdFromStatus = jobFlagsStatus[jobId]?.flag_id;
      
      // Use the first available flag_id
      const existingFlagId = flagIdFromJob || flagIdFromMap || flagIdFromStatus;
      const existingFlagInfo = jobFlagsStatus[jobId];
      
      console.log('🔍 Flag ID lookup - jobId:', jobId, 'flagIdFromJob:', flagIdFromJob, 'flagIdFromMap:', flagIdFromMap, 'existingFlagId:', existingFlagId);
      
      const { value: reason } = await Swal.fire({
        title: existingFlagId ? 'Re-flag Job' : 'Flag Job',
        input: 'textarea',
        inputLabel: 'Reason for flagging',
        inputPlaceholder: 'Enter the reason for flagging this job...',
        inputAttributes: {
          'aria-label': 'Enter reason for flagging'
        },
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Flag Job',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value) {
            return 'You need to provide a reason!';
          }
        }
      });

      if (reason) {
        // If flag already exists (even if approved), update it using resolve API
        if (existingFlagId) {
          console.log('📤 Re-flagging job - flag_id:', existingFlagId, 'job_id:', jobId);
          
          // Use resolve API to update existing flag back to pending
          // Backend now accepts admin_action from payload
          const response = await putMethod({
            apiUrl: `${apiService.resolveJobFlag}?id=${existingFlagId}`,
            payload: {
              reason: reason,
              admin_action: 'pending'
            }
          });

          console.log('📥 Re-flag Response:', response);

          if (response?.status === true || response?.success === true) {
            // Update local state immediately
            setJobFlagsStatus(prev => ({
              ...prev,
              [jobId]: {
                admin_action: 'pending',
                reviewed: false,
                status: 'Under Review',
                flag_id: existingFlagId
              }
            }));
            
            // Update flaggedJobsMap to ensure flag_id is stored
            setFlaggedJobsMap(prev => ({
              ...prev,
              [jobId]: existingFlagId
            }));
            
            // Update jobPostings to include flag_id (hidden column)
            setJobPostings(prev => prev.map(job => {
              const jId = job.id || job.job_id;
              if (jId === jobId) {
                return {
                  ...job,
                  flag_id: existingFlagId,
                  _flag_id: existingFlagId
                };
              }
              return job;
            }));
            
            // Add to flagged list
            setFlaggedJobIds(prev => {
              if (!prev.includes(jobId)) {
                return [...prev, jobId];
              }
              return prev;
            });
            
            setLastAction({ type: 'flagged', message: 'Job re-flagged successfully' });
            Swal.fire('Success!', 'Job re-flagged successfully', 'success');
            
            // Refresh data
            await fetchFlaggedJobs();
            await fetchJobs();
            
            setTimeout(() => setLastAction(null), 3000);
          } else {
            Swal.fire('Error!', response?.message || 'Failed to re-flag job', 'error');
          }
        } else {
          // New flag - create using flag API
          console.log('📤 Flagging new job - job_id:', jobId);
          
          // Get current user info
          let currentUser = null
          try {
            const authUser = localStorage.getItem("authUser")
            if (authUser) {
              currentUser = JSON.parse(authUser)
            }
          } catch (e) {
            console.error('Error getting user from localStorage:', e)
          }
          
          // Prepare payload - don't send flagged_by if user is admin (backend should handle this)
          const payload = {
            job_id: jobId,
            reason: reason,
            admin_action: 'pending'
          }
          
          // Only send flagged_by if it's a student (for backend compatibility)
          // If admin, backend should use NULL or admin user_id
          if (currentUser && currentUser.role === 'student' && currentUser.id) {
            payload.flagged_by = currentUser.id
          }
          
          console.log('📤 Flag Job Payload:', payload)
          
          const response = await postMethod({
            apiUrl: apiService.flagJob,
            payload: payload
          });

          console.log('📥 Flag Job Response:', response);

          if (response?.status === true || response?.success === true) {
            // Update local state immediately
            const flagId = response?.flag_id || response?.data?.flag_id;
            
            if (flagId) {
              // Update flagged jobs map
              setFlaggedJobsMap(prev => ({
                ...prev,
                [jobId]: flagId
              }));
              
              // Update jobPostings to include flag_id (hidden column)
              setJobPostings(prev => prev.map(job => {
                const jId = job.id || job.job_id;
                if (jId === jobId) {
                  return {
                    ...job,
                    flag_id: flagId,
                    _flag_id: flagId
                  };
                }
                return job;
              }));
              
              // Update job flags status
              setJobFlagsStatus(prev => ({
                ...prev,
                [jobId]: {
                  admin_action: 'pending',
                  reviewed: false,
                  status: 'Under Review',
                  flag_id: flagId
                }
              }));
              
              // Add to flagged list
              setFlaggedJobIds(prev => {
                if (!prev.includes(jobId)) {
                  return [...prev, jobId];
                }
                return prev;
              });
            }
            
            setLastAction({ type: 'flagged', message: 'Job flagged successfully' });
            Swal.fire('Success!', 'Job flagged successfully', 'success');
            
            // Refresh data
            await fetchFlaggedJobs();
            await fetchJobs();
            
            setTimeout(() => setLastAction(null), 3000);
          } else {
            Swal.fire('Error!', response?.message || 'Failed to flag job', 'error');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error flagging job:', error);
      Swal.fire('Error!', error?.message || 'Failed to flag job', 'error');
    }
  };

  // ✅ Approve Edited Job (not flagged, just needs edit approval)
  const handleApproveEditedJob = async (jobId) => {
    try {
      const job = jobPostings.find(j => (j.id || j.job_id) === jobId);
      
      if (!job) {
        Swal.fire('Error!', 'Job not found', 'error');
        return;
      }

      const { value: reason } = await Swal.fire({
        title: 'Approve Job Edit',
        html: `
          <div class="text-left">
            <p class="mb-3">This job was edited by the recruiter. Review the changes and approve to make it visible to candidates again.</p>
            <p class="text-sm text-gray-600 mb-3"><strong>Job:</strong> ${job.title || 'N/A'}</p>
            <p class="text-sm text-gray-600 mb-3"><strong>Company:</strong> ${job.company || 'N/A'}</p>
          </div>
        `,
        input: 'textarea',
        inputLabel: 'Approval Reason (Optional)',
        inputPlaceholder: 'Enter reason for approving this edit...',
        inputAttributes: {
          'aria-label': 'Enter approval reason'
        },
        showCancelButton: true,
        confirmButtonColor: COLORS.GREEN_PRIMARY,
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Approve Edit',
        cancelButtonText: 'Cancel'
      });

      if (reason !== undefined) { // User clicked approve (reason can be empty)
        // Update job admin_action to "approved" via PUT API
        const response = await putMethod({
          apiUrl: `${service.updateJob}?id=${jobId}`,
          payload: {
            admin_action: 'approved'
          }
        });

        console.log('📥 Approve Edited Job Response:', response);

        if (response?.status === true || response?.success === true) {
          // Update local state
          setJobPostings(prev => prev.map(j => {
            const jId = j.id || j.job_id;
            if (jId === jobId) {
              return {
                ...j,
                admin_action: 'approved',
                status: 'Approved'
              };
            }
            return j;
          }));

          setLastAction({ type: 'approved', message: 'Job edit approved successfully' });
          Swal.fire('Success!', 'Job edit approved. The job is now visible to candidates.', 'success');

          // Refresh data
          await fetchJobs();

          setTimeout(() => setLastAction(null), 3000);
        } else {
          Swal.fire('Error!', response?.message || 'Failed to approve job edit', 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error approving edited job:', error);
      Swal.fire('Error!', error?.message || 'Failed to approve job edit', 'error');
    }
  };

  // ✅ Reject Edited Job
  const handleRejectEditedJob = async (jobId) => {
    try {
      const job = jobPostings.find(j => (j.id || j.job_id) === jobId);
      
      if (!job) {
        Swal.fire('Error!', 'Job not found', 'error');
        return;
      }

      const { value: reason } = await Swal.fire({
        title: 'Reject Job Edit',
        html: `
          <div class="text-left">
            <p class="mb-3">This will reject the changes made to this job. The job will remain hidden from candidates.</p>
            <p class="text-sm text-gray-600 mb-3"><strong>Job:</strong> ${job.title || 'N/A'}</p>
            <p class="text-sm text-gray-600 mb-3"><strong>Company:</strong> ${job.company || 'N/A'}</p>
          </div>
        `,
        input: 'textarea',
        inputLabel: 'Rejection Reason (Required)',
        inputPlaceholder: 'Enter reason for rejecting this edit...',
        inputAttributes: {
          'aria-label': 'Enter rejection reason'
        },
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Reject Edit',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => {
          if (!value || value.trim().length === 0) {
            return 'You need to provide a rejection reason!';
          }
        }
      });

      if (reason) {
        // Update job admin_action to "rejected" via PUT API
        const response = await putMethod({
          apiUrl: `${service.updateJob}?id=${jobId}`,
          payload: {
            admin_action: 'rejected',
            rejection_reason: reason
          }
        });

        console.log('📥 Reject Edited Job Response:', response);

        if (response?.status === true || response?.success === true) {
          // Update local state
          setJobPostings(prev => prev.map(j => {
            const jId = j.id || j.job_id;
            if (jId === jobId) {
              return {
                ...j,
                admin_action: 'rejected',
                status: 'Rejected'
              };
            }
            return j;
          }));

          setLastAction({ type: 'rejected', message: 'Job edit rejected' });
          Swal.fire('Rejected!', 'Job edit has been rejected. The job remains hidden from candidates.', 'success');

          // Refresh data
          await fetchJobs();

          setTimeout(() => setLastAction(null), 3000);
        } else {
          Swal.fire('Error!', response?.message || 'Failed to reject job edit', 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error rejecting edited job:', error);
      Swal.fire('Error!', error?.message || 'Failed to reject job edit', 'error');
    }
  };

  const handlePromoteJob = (jobId) => console.log('Promoting job:', jobId);
  const handleBulkApprove = () => console.log('Bulk approving jobs:', selectedJobs);
  const handleBulkPromote = () => console.log('Bulk promoting jobs:', selectedJobs);
  const handleManualPromotion = () => {
    console.log('Manual promotion:', { 
      jobId: promotionJobId, 
      topRibbonEnabled,
      priorityListingEnabled
    });
    setPromotionJobId('');
  };

  // ✅ Filter pending job edits (admin_action === "pending" and has last_updated)
  const pendingJobEdits = jobPostings.filter(job => {
    const jobAdminAction = (job.admin_action || '').toLowerCase();
    return jobAdminAction === 'pending' && job.last_updated;
  });

  return (
    <div className="job-posting-section space-y-6">
      {/* ✅ Pending Job Edits Section */}
      {pendingJobEdits.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                  Pending Job Edit Approvals ({pendingJobEdits.length})
                </h2>
                <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                  Recruiters have made changes to these jobs. Review and approve to make them visible to candidates.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {pendingJobEdits.map((job) => {
              const jobId = job.id || job.job_id;
              const lastUpdated = job.last_updated || job.updated_at || 'N/A';
              const formattedDate = lastUpdated !== 'N/A' 
                ? new Date(lastUpdated).toLocaleString('en-IN', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'N/A';

              return (
                <div key={jobId} className="bg-white rounded-lg border border-orange-300 p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                          {job.title || 'N/A'}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                          Pending Approval
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className={`font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Company: </span>
                          <span className={TAILWIND_COLORS.TEXT_PRIMARY}>{job.company || 'N/A'}</span>
                        </div>
                        <div>
                          <span className={`font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Last Updated: </span>
                          <span className={TAILWIND_COLORS.TEXT_PRIMARY}>{formattedDate}</span>
                        </div>
                        <div>
                          <span className={`font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Location: </span>
                          <span className={TAILWIND_COLORS.TEXT_PRIMARY}>{job.location || 'N/A'}</span>
                        </div>
                        <div>
                          <span className={`font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Salary: </span>
                          <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                            {job.salary_min && job.salary_max 
                              ? `₹${job.salary_min} - ₹${job.salary_max}` 
                              : job.salary_min 
                                ? `₹${job.salary_min}` 
                                : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className={`font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Description: </span>
                        <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                          {job.description 
                            ? (job.description.length > 150 
                                ? job.description.substring(0, 150) + '...' 
                                : job.description)
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleApproveEditedJob(jobId)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 whitespace-nowrap"
                      >
                        ✓ Accept Changes
                      </button>
                      <button
                        onClick={() => handleRejectEditedJob(jobId)}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 whitespace-nowrap"
                      >
                        ✗ Reject Changes
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEditJob(job);
                          setShowEditComparisonModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
                      >
                        📋 View Changes
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-section="job-posting-management">
        {/* Toolbar */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.GREEN_PRIMARY }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-bold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Job Posting Management</h2>
              {lastAction && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  lastAction.type === 'approved' 
                    ? 'bg-green-100 text-green-700' 
                    : lastAction.type === 'flagged'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                } animate-pulse`}>
                  {lastAction.message}
                </span>
              )}
            </div>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>View / Manage all jobs, approve flagged posts, and promote jobs manually.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search Jobs & Companies"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            >
              <option value="All Status">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Pending Edit Approval">Pending Edit Approval</option>
              <option value="Approved">Approved</option>
              <option value="Flagged">Flagged</option>
              <option value="Promoted">Promoted</option>
            </select>
          </div>

          <div className="flex gap-3">
            {/* <Button onClick={handleBulkApprove} className={`px-4 py-2 rounded-lg transition-colors duration-200 ${TAILWIND_COLORS.BTN_PRIMARY}`} variant="unstyled">Approve selected</Button> */}
            <Button onClick={handleBulkPromote} className={`px-4 py-2 rounded-lg transition-colors duration-200 border-secondary text-secondary bg-bg-white hover:bg-gray-100`} variant="unstyled">Promote selected</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className={`mt-4 text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>No jobs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={filteredJobs.length > 0 && selectedJobs.length === filteredJobs.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300"
                        style={{ accentColor: COLORS.GREEN_PRIMARY }}
                      />
                    </th>
                    <th className={`w-1/5 px-4 py-3 text-left text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Title</th>
                    <th className={`w-1/6 px-4 py-3 text-left text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Company</th>
                    <th className={`w-1/6 px-4 py-3 text-left text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Posted</th>
                    <th className={`w-1/6 px-4 py-3 text-left text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Recent Activity</th>
                    <th className={`w-1/6 px-4 py-3 text-center text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Status</th>
                    <th className={`w-1/5 px-4 py-3 text-center text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="w-12 px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={(e) => handleSelectJob(job.id, e.target.checked)}
                          className="rounded border-gray-300"
                          style={{ accentColor: COLORS.GREEN_PRIMARY }}
                        />
                      </td>
                      <td className={`w-1/4 px-4 py-4 text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        <div className="flex items-center gap-2">
                          <span className="truncate" title={job.title}>{job.title}</span>
                          {/* Badge logic: Flag API first (pending=Flagged, approved=Approved), then jobs.php API */}
                          {(() => {
                            const jobId = job.id || job.job_id;
                            const flagInfo = jobFlagsStatus[jobId];
                            
                            // ✅ If flag record exists, check flag API admin_action
                            if (flagInfo) {
                              const flagAdminAction = (flagInfo.admin_action || '').toLowerCase();
                              
                              // Flag API se pending → "Flagged"
                              if (flagAdminAction === 'pending' || flagAdminAction === 'flagged' || !flagAdminAction || flagAdminAction === '') {
                                return (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium whitespace-nowrap">
                                    Flagged
                                  </span>
                                );
                              }
                              
                              // Flag API se approved → "Approved"
                              if (flagAdminAction === 'approved') {
                                return (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium whitespace-nowrap">
                                    Approved
                                  </span>
                                );
                              }
                            }
                            
                            // ✅ If no flag, check jobs.php API admin_action
                            const jobAdminAction = (job.admin_action || '').toLowerCase();
                            
                            if (jobAdminAction === 'approved') {
                              return (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium whitespace-nowrap">
                                  Approved
                                </span>
                              );
                            }
                            
                            if (jobAdminAction === 'pending') {
                              return (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium whitespace-nowrap">
                                  Pending
                                </span>
                              );
                            }
                            
                            return null;
                          })()}
                        </div>
                      </td>
                      <td className={`w-1/6 px-4 py-4 text-sm ${TAILWIND_COLORS.TEXT_MUTED} truncate`} title={job.company}>{job.company}</td>
                      <td className={`w-1/6 px-4 py-4 text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{job.posted}</td>
                      <td className={`w-1/6 px-4 py-4 text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
                        {job.lastUpdated ? (() => {
                          try {
                            const date = new Date(job.lastUpdated);
                            if (isNaN(date.getTime())) {
                              return <span className="text-gray-400 italic">No update</span>;
                            }
                            const now = new Date();
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                            const updateDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                            const diffDays = Math.floor((today - updateDate) / (1000 * 60 * 60 * 24));
                            
                            if (diffDays === 0) {
                              return 'Today';
                            } else if (diffDays === 1) {
                              return '1 day ago';
                            } else if (diffDays > 1) {
                              return `${diffDays} days ago`;
                            } else {
                              return 'Today';
                            }
                          } catch (e) {
                            return <span className="text-gray-400 italic">No update</span>;
                          }
                        })() : (
                          <span className="text-gray-400 italic">No update</span>
                        )}
                      </td>
                      <td className="w-1/6 px-4 py-4 text-center">
                        <span
                          data-status={job.status.toLowerCase()}
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            job.status === 'Approved'
                            ? TAILWIND_COLORS.BADGE_SUCCESS
                              : job.status === 'Flagged'
                            ? TAILWIND_COLORS.BADGE_WARN
                              : job.status === 'Promoted'
                              ? TAILWIND_COLORS.BADGE_INFO
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {job.status?.toLowerCase() === 'paused' ? 'Draft' : job.status}
                        </span>
                      </td>
                      <td className="w-1/5 px-2 py-3 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          {(() => {
                            const jobId = job.id || job.job_id;
                            const flagInfo = jobFlagsStatus[jobId];
                            const jobAdminAction = (job.admin_action || '').toLowerCase();
                            
                            // Check if job is approved
                            const isApproved = flagInfo?.admin_action === 'approved' || jobAdminAction === 'approved';
                            
                            // Check if job is flagged
                            const isFlagged = flagInfo?.admin_action === 'pending' || 
                                            flagInfo?.admin_action === 'flagged' || 
                                            jobAdminAction === 'pending' || 
                                            jobAdminAction === 'flagged' ||
                                            flaggedJobIds.includes(jobId);
                            
                            // Check if job is promoted
                            const isPromoted = job.is_featured === 1;
                            
                            return (
                              <>
                                <button 
                                  onClick={() => handleApproveJob(job.id)} 
                                  className={`w-20 px-2 py-1 text-xs font-medium rounded transition-all duration-150 whitespace-nowrap ${
                                    isApproved
                                      ? '!bg-green-600 text-white opacity-50 cursor-not-allowed'
                                      : '!bg-green-500 text-white hover:!bg-green-600'
                                  }`}
                                  disabled={isApproved}
                                >
                                  Approved
                                </button>
                                <button 
                                  onClick={() => handlePromoteJob(job.id)} 
                                  className={`w-20 px-2 py-1 text-xs font-medium rounded transition-all duration-150 whitespace-nowrap ${
                                    isPromoted
                                      ? '!bg-blue-600 text-white opacity-50 cursor-not-allowed'
                                      : '!bg-blue-500 text-white hover:!bg-blue-600'
                                  }`}
                                  disabled={isPromoted}
                                >
                                  Promote
                                </button>
                                <button 
                                  onClick={() => handleFlaggedJob(job.id)} 
                                  className={`w-20 px-2 py-1 text-xs font-medium rounded transition-all duration-150 whitespace-nowrap ${
                                    isFlagged
                                      ? '!bg-red-600 text-white opacity-50 cursor-not-allowed'
                                      : '!bg-red-500 text-white hover:!bg-red-600'
                                  }`}
                                  disabled={isFlagged}
                                >
                                  Flagged
                                </button>
                                <button 
                                  onClick={() => handleViewJob(job)} 
                                  className="w-20 px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-150 whitespace-nowrap"
                                >
                                  View
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Job Edit Comparison Modal */}
      {showEditComparisonModal && selectedEditJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-orange-50">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-orange-500">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Job Edit Changes</h3>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Review changes made by recruiter</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditComparisonModal(false);
                  setSelectedEditJob(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Job Info Header */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Job Title</label>
                    <p className={`text-base font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedEditJob.title || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Company</label>
                    <p className={`text-base font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedEditJob.company || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Last Updated</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>
                      {selectedEditJob.last_updated 
                        ? new Date(selectedEditJob.last_updated).toLocaleString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Changes Comparison */}
              <div className="space-y-4">
                <h4 className={`text-md font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} border-b pb-2`}>Current Job Details (After Edit)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Location</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedEditJob.location || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Job Type</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedEditJob.job_type || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Salary Range</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>
                      {selectedEditJob.salary_min && selectedEditJob.salary_max 
                        ? `₹${selectedEditJob.salary_min} - ₹${selectedEditJob.salary_max}`
                        : selectedEditJob.salary_min 
                          ? `₹${selectedEditJob.salary_min}` 
                          : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Experience Required</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedEditJob.experience_required || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Skills Required</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedEditJob.skills_required || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>No. of Vacancies</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedEditJob.no_of_vacancies || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Application Deadline</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedEditJob.application_deadline || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Job Description</label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-2 whitespace-pre-wrap`}>
                    {selectedEditJob.description || 'N/A'}
                  </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
                        <strong>Note:</strong> This job is currently hidden from candidates. Once you approve the changes, it will become visible to all candidates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEditComparisonModal(false);
                    setSelectedEditJob(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleRejectEditedJob(selectedEditJob.id || selectedEditJob.job_id);
                    setShowEditComparisonModal(false);
                    setSelectedEditJob(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Reject Changes
                </button>
                <button
                  onClick={() => {
                    handleApproveEditedJob(selectedEditJob.id || selectedEditJob.job_id);
                    setShowEditComparisonModal(false);
                    setSelectedEditJob(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  ✓ Accept Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.GREEN_PRIMARY }}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Job Details</h3>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>View complete job information</p>
                </div>
              </div>
              <button
                onClick={handleCloseJobModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Last Update Section */}
              {selectedJob.lastUpdated && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Last Update Information</h4>
                      <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Details about the most recent changes</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <label className={`text-xs font-medium uppercase tracking-wide ${TAILWIND_COLORS.TEXT_MUTED}`}>Last Updated</label>
                      <p className={`text-base font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>
                        {(() => {
                          try {
                            const date = new Date(selectedJob.lastUpdated);
                            if (isNaN(date.getTime())) {
                              return 'N/A';
                            }
                            const now = new Date();
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                            const updateDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                            const diffDays = Math.floor((today - updateDate) / (1000 * 60 * 60 * 24));
                            
                            const formattedDate = date.toLocaleDateString('en-IN', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                            
                            if (diffDays === 0) {
                              return `Today at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
                            } else if (diffDays === 1) {
                              return `Yesterday at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
                            } else {
                              return formattedDate;
                            }
                          } catch (e) {
                            return selectedJob.lastUpdated;
                          }
                        })()}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <label className={`text-xs font-medium uppercase tracking-wide ${TAILWIND_COLORS.TEXT_MUTED}`}>Update Status</label>
                      <p className={`text-base font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>
                        {selectedJob.admin_action === 'pending' ? (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            Pending Approval
                          </span>
                        ) : selectedJob.admin_action === 'approved' ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Approved
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            Not Updated
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Updated Fields Section - Only Highlight Changed Fields */}
                  <div className="mt-4">
                    <h5 className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Updated Fields
                    </h5>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      {loadingOriginalData ? (
                        <div className="text-center py-4">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED} mt-2`}>Loading changes...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {/* Title */}
                          <div className={`rounded p-3 border ${originalJobData?.title && originalJobData.title !== selectedJob.title ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                            <span className={`font-medium ${TAILWIND_COLORS.TEXT_MUTED} text-xs block mb-1`}>Title</span>
                            <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                              {selectedJob.title || 'N/A'}
                            </span>
                            {originalJobData?.title && originalJobData.title !== selectedJob.title && (
                              <span className="ml-2 text-xs text-orange-600 font-medium">(Updated)</span>
                            )}
                          </div>

                          {/* Location */}
                          <div className={`rounded p-3 border ${originalJobData?.location && originalJobData.location !== selectedJob.location ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                            <span className={`font-medium ${TAILWIND_COLORS.TEXT_MUTED} text-xs block mb-1`}>Location</span>
                            <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                              {selectedJob.location || 'N/A'}
                            </span>
                            {originalJobData?.location && originalJobData.location !== selectedJob.location && (
                              <span className="ml-2 text-xs text-orange-600 font-medium">(Updated)</span>
                            )}
                          </div>

                          {/* Salary */}
                          <div className={`rounded p-3 border ${(originalJobData?.salary_min !== selectedJob.salary_min || originalJobData?.salary_max !== selectedJob.salary_max) ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                            <span className={`font-medium ${TAILWIND_COLORS.TEXT_MUTED} text-xs block mb-1`}>Salary</span>
                            <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                              {selectedJob.salary_min && selectedJob.salary_max 
                                ? `₹${selectedJob.salary_min} - ₹${selectedJob.salary_max}`
                                : selectedJob.salary_min 
                                  ? `₹${selectedJob.salary_min}` 
                                  : 'N/A'}
                            </span>
                            {(originalJobData?.salary_min !== selectedJob.salary_min || originalJobData?.salary_max !== selectedJob.salary_max) && (
                              <span className="ml-2 text-xs text-orange-600 font-medium">(Updated)</span>
                            )}
                          </div>

                          {/* Experience */}
                          <div className={`rounded p-3 border ${originalJobData?.experience_required && originalJobData.experience_required !== selectedJob.experience_required ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                            <span className={`font-medium ${TAILWIND_COLORS.TEXT_MUTED} text-xs block mb-1`}>Experience</span>
                            <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                              {selectedJob.experience_required || 'N/A'}
                            </span>
                            {originalJobData?.experience_required && originalJobData.experience_required !== selectedJob.experience_required && (
                              <span className="ml-2 text-xs text-orange-600 font-medium">(Updated)</span>
                            )}
                          </div>

                          {/* Job Type */}
                          <div className={`rounded p-3 border ${originalJobData?.job_type && originalJobData.job_type !== selectedJob.job_type ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                            <span className={`font-medium ${TAILWIND_COLORS.TEXT_MUTED} text-xs block mb-1`}>Job Type</span>
                            <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                              {selectedJob.job_type || 'N/A'}
                            </span>
                            {originalJobData?.job_type && originalJobData.job_type !== selectedJob.job_type && (
                              <span className="ml-2 text-xs text-orange-600 font-medium">(Updated)</span>
                            )}
                          </div>

                          {/* Vacancies */}
                          <div className={`rounded p-3 border ${originalJobData?.no_of_vacancies && originalJobData.no_of_vacancies !== selectedJob.no_of_vacancies ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                            <span className={`font-medium ${TAILWIND_COLORS.TEXT_MUTED} text-xs block mb-1`}>Vacancies</span>
                            <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                              {selectedJob.no_of_vacancies || 'N/A'}
                            </span>
                            {originalJobData?.no_of_vacancies && originalJobData.no_of_vacancies !== selectedJob.no_of_vacancies && (
                              <span className="ml-2 text-xs text-orange-600 font-medium">(Updated)</span>
                            )}
                          </div>

                          {/* Skills */}
                          <div className={`rounded p-3 border ${originalJobData?.skills_required && originalJobData.skills_required !== selectedJob.skills_required ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                            <span className={`font-medium ${TAILWIND_COLORS.TEXT_MUTED} text-xs block mb-1`}>Skills</span>
                            <span className={TAILWIND_COLORS.TEXT_PRIMARY}>
                              {selectedJob.skills_required || 'N/A'}
                            </span>
                            {originalJobData?.skills_required && originalJobData.skills_required !== selectedJob.skills_required && (
                              <span className="ml-2 text-xs text-orange-600 font-medium">(Updated)</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Job Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className={`text-md font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-3`}>Job Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Job Title</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedJob.title || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Company</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedJob.company || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Location</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedJob.location || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Job Type</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedJob.job_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Salary Range</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>
                      {selectedJob.salary_min && selectedJob.salary_max 
                        ? `${selectedJob.salary_min} - ${selectedJob.salary_max}`
                        : selectedJob.salary_min || selectedJob.salary_max || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Experience Required</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedJob.experience_required || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Skills Required</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedJob.skills_required || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>No. of Vacancies</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedJob.no_of_vacancies || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Application Deadline</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedJob.application_deadline || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Posted Date</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedJob.posted || selectedJob.created_at || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Status</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedJob.status || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Admin Action</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedJob.admin_action || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Is Remote</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedJob.is_remote === 1 ? 'Yes' : selectedJob.is_remote === 0 ? 'No' : 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Is Featured</label>
                    <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1`}>{selectedJob.is_featured === 1 ? 'Yes' : selectedJob.is_featured === 0 ? 'No' : 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_MUTED}`}>Job Description</label>
                  <p className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY} mt-1 whitespace-pre-wrap`}>{selectedJob.description || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPosting;



