import React, { useState } from 'react'
import { LuFileText, LuSettings, LuHistory } from 'react-icons/lu'
import { MatrixCard } from '../../../../shared/components/metricCard'
import { PillNavigation } from '../../../../shared/components/navigation'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import CertificateGeneration from './CertificateGeneration'
import ManageTemplate from './ManageTemplate'
import IssuanceLogs from './IssuanceLogs'

export default function CertificatesCompletion() {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    {
      id: 'generate',
      label: 'Certificate Generation',
      icon: LuFileText,
      component: <CertificateGeneration />
    },
    {
      id: 'manage-template',
      label: 'Manage Template',
      icon: LuSettings,
      component: <ManageTemplate />
    },
    {
      id: 'issuance-logs',
      label: 'Issuance Logs',
      icon: LuHistory,
      component: <IssuanceLogs />
    }
  ]

  return (
    <div className="space-y-5">
      {/* Header Section using MatrixCard */}
      <MatrixCard
        title="Certificates & Completion"
        subtitle="Manage certificates, templates, and track completion status"
        titleColor={TAILWIND_COLORS.TEXT_PRIMARY}
        subtitleColor={TAILWIND_COLORS.TEXT_MUTED}
        className=""
      />

      {/* Navigation Pills using PillNavigation */}
      <div className="flex justify-center">
        <PillNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          storageKey="institute_certificates_tab"
          className=""
        />
      </div>

      {/* Tab Content */}
      <div className="mt-5">
        {tabs[activeTab]?.component}
      </div>
    </div>
  )
}
