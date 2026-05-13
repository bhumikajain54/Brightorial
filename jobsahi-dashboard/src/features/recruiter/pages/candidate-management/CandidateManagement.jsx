import React, { useState } from 'react'
import { LuZap, LuUsers } from 'react-icons/lu'
import { PillNavigation } from '../../../../shared/components/navigation'
import InstaMatch from './InstaMatch'
import ViewApplicants from './ViewApplicants'


const CandidateManagement = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [previousTab, setPreviousTab] = useState(null)

  const tabs = [
    {
      id: 'view-applicants',
      label: 'View Applicants',
      icon: LuUsers
    },
    {
      id: 'instamatch',
      label: 'InstaMatch',
      icon: LuZap
    }
  ]

  const handleTabChange = (tabIndex) => {
    if (tabIndex === activeTab) return
    setPreviousTab(activeTab)
    setActiveTab(tabIndex)
  }

  const handleReturnToPreviousTab = () => {
    setActiveTab(previousTab ?? 0)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Green Navigation Pills */}
      <div className="mb-4">
        <PillNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          storageKey="recruiter_candidate_management_tab"
          className="justify-start"
        />
      </div>

      {/* Conditional Rendering based on active tab */}
       {activeTab === 0 && <ViewApplicants />}
      {activeTab === 1 && <InstaMatch onComingSoonClose={handleReturnToPreviousTab} />}
     
    </div>
  )
}

export default CandidateManagement
