import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { LuBell, LuSend, LuFileText, LuLightbulb } from 'react-icons/lu'
import { MatrixCard } from '../../../../shared/components/metricCard'
import { PillNavigation } from '../../../../shared/components/navigation'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import SendNotice from './SendNotice'
import Templates from './Templates'
import AutoAlerts from './AutoAlerts'
import ComingSoonPopup from '../../../../shared/components/ComingSoon'

export default function MessagingAlerts() {
  const location = useLocation()

  const tabs = useMemo(
    () => [
    {
      id: 'send-notice',
      label: 'Send Notice',
      icon: LuSend,
      component: <SendNotice />
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: LuBell,
      component: <Templates />
    },
    {
      id: 'auto-alerts',
      label: 'Auto Alerts',
      icon: LuLightbulb,
      component: <AutoAlerts />
    }
    ],
    []
  )

  const resolveTabIndex = useCallback(
    (state) => {
      if (state?.initialTabId) {
        const idx = tabs.findIndex((tab) => tab.id === state.initialTabId)
        if (idx !== -1) return idx
      }

      if (typeof state?.activeTabIndex === 'number') {
        const boundedIdx = Math.max(0, Math.min(tabs.length - 1, state.activeTabIndex))
        return boundedIdx
      }

      return 0
    },
    [tabs]
  )

  const [activeTab, setActiveTab] = useState(() => resolveTabIndex(location.state))

  useEffect(() => {
    setActiveTab(resolveTabIndex(location.state))
  }, [location.state, resolveTabIndex])

  return (
    <div className="space-y-5">
      {/* Header Section using MatrixCard */}
      <MatrixCard
        title="Messaging & Alerts"
        subtitle="Send notifications and manage automated alerts for students"
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
          storageKey="institute_messaging_alerts_tab"
          className=""
        />
      </div>

      {/* Tab Content */}
      <div className="mt-5">
        {tabs[activeTab]?.component}
        <ComingSoonPopup />
      </div>
    </div>
  )
}
