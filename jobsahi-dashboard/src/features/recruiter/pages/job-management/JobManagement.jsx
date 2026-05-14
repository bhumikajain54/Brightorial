import React, { useState, useEffect } from 'react'
import { LuPlus, LuSettings } from 'react-icons/lu'
import { PillNavigation } from '../../../../shared/components/navigation'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import PostJob from './PostJob'
import ManageJob from './ManageJob'

const JobManagement = () => {
  const [activeTab, setActiveTab] = useState(0)
  
  // Shared jobs state
  const [jobs, setJobs] = useState([
    {
      id: 1,
      company: 'Maximoz Team',
      status: 'Open',
      title: 'Assistant Technicians',
      jobSector: 'Manufacturing',
      jobType: 'Full-time',
      requiredSkills: 'Electrical, Fitter, Mechanical, ITI',
      experience: '1-3',
      views: 150,
      salary: '₹14,000 - ₹25,000',
      salaryType: 'Monthly',
      openingDate: 'APR 23, 2025',
      closingDate: 'AUG 23, 2025',
      description: 'Join our technical team as an Assistant Technician. This opportunity is ideal for ITI pass-outs in fields such as Electrical, Fitter, or Mechanical. Responsibilities include maintenance, repair work, and technical support.',
      location: 'SATPUDA ITI, BALAGHAT, MADHYA PRADESH - 481001',
      fullAddress: 'SATPUDA ITI, BALAGHAT',
      city: 'BALAGHAT',
      state: 'MADHYA PRADESH',
      country: 'India',
      contactPerson: 'Rakesh Verma',
      phone: '9876543210',
      additionalContact: 'rakesh.hr@maximoz.com',
      instaMatch: 12,
      applicants: 26
    },
    {
      id: 2,
      company: 'Tech Solutions Inc',
      status: 'Open',
      title: 'Software Developer',
      jobSector: 'Technology',
      jobType: 'Full-time',
      requiredSkills: 'React, Node.js, JavaScript, MongoDB',
      experience: '2-5',
      views: 89,
      salary: '₹25,000 - ₹45,000',
      salaryType: 'Monthly',
      openingDate: 'JAN 15, 2025',
      closingDate: 'MAR 15, 2025',
      description: 'We are looking for a skilled Software Developer to join our development team. You will be responsible for developing and maintaining web applications using modern technologies.',
      location: 'Tech Park, Bangalore, Karnataka - 560001',
      fullAddress: 'Tech Park, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      contactPerson: 'Priya Sharma',
      phone: '9876543211',
      additionalContact: 'priya.hr@techsolutions.com',
      instaMatch: 8,
      applicants: 15
    }
  ])

  // Job management functions
  const addJob = (newJob) => {
    const jobWithId = {
      ...newJob,
      id: jobs.length > 0 ? Math.max(...jobs.map(job => job.id)) + 1 : 1,
      views: 0,
      instaMatch: 0,
      applicants: 0
    }
    setJobs(prevJobs => [jobWithId, ...prevJobs])
  }

  const editJob = (jobId, updatedJob) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId ? { ...job, ...updatedJob } : job
      )
    )
  }

  const deleteJob = (jobId) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
  }

  const tabs = [
    {
      id: 'manage',
      label: 'Manage Job',
      icon: LuSettings
    },
    {
      id: 'post',
      label: 'Post Job',
      icon: LuPlus
    }
  ]

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex)
    // ✅ If switching to Manage Job tab, trigger refresh to show latest drafts
    if (tabIndex === 0) {
      // Small delay to ensure ManageJob component is mounted
      setTimeout(() => {
        window.dispatchEvent(new Event('draftSaved'));
      }, 100);
    }
  }

  return (
    <div className={`min-h-screen ${TAILWIND_COLORS.BG_PRIMARY}`}>
      {/* Green Navigation Pills */}
      <div className="mb-4 flex justify-center">
        <PillNavigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          storageKey="recruiter_job_management_tab"
          className="justify-start"
        />
      </div>

      {/* Conditional Rendering based on active tab */}
      {activeTab === 0 && (
        <ManageJob 
          jobs={jobs} 
          onEditJob={editJob} 
          onDeleteJob={deleteJob}
          onNavigateToPostJob={() => setActiveTab(1)}
        />
      )}
      {activeTab === 1 && (
        <PostJob onJobSubmit={addJob} />
      )}
    </div>
  )
}

export default JobManagement