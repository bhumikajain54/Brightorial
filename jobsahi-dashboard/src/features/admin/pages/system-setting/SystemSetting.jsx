import React, { useState } from 'react'
import { TAILWIND_COLORS, COLORS } from '../../../../shared/WebConstant.js'
import { PillNavigation } from '../../../../shared/components/navigation.jsx'
import { MatrixCard } from '../../../../shared/components/metricCard.jsx'
import CMSEditor from './CmsEditor'
import SEOSetting from './SeoSetting'
import BrandingConfig from './BrandingConfig'
import AppVersionMonitor from './AppVersion'
import ApiKeyWebhookControl from './ApiKey'

import {  
  LuUsers,
  LuPlus,
  LuLayers,
  LuMonitor,
  LuKey,
} from 'react-icons/lu'

export default function SystemSetting() {
  const [activeTab, setActiveTab] = useState(0)

  const navigationTabs = [
    {
      id: 'cms-editor',
      label: 'CMS Editor',
      icon: LuUsers,
    },
    {
      id: 'seo-settings',
      label: 'SEO Settings',
      icon: LuPlus,
    },
    {
      id: 'branding-config',
      label: 'Branding Config',
      icon: LuLayers,
    },
    {
      id: 'app-version',
      label: 'App Version Monitor',
      icon: LuMonitor,
    },
    {
      id: 'api-key',
      label: 'API Key & Webhook Control',
      icon: LuKey,
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <CMSEditor />
      case 1:
        return <SEOSetting />
      case 2:
        return <BrandingConfig />
      case 3:
        return <AppVersionMonitor />
      case 4:
        return <ApiKeyWebhookControl />
      default:
        return <CMSEditor />
    }
  }

  return (
    <div className=" space-y-6">
      <MatrixCard 
        title="System Settings & Configuration"
        subtitle="Manage your job portal system settings and integration"
        titleColor={TAILWIND_COLORS.TEXT_PRIMARY}
        subtitleColor={TAILWIND_COLORS.TEXT_MUTED}
      />

      {/* Navigation Tabs */}
      {/* <PillNavigation
        tabs={navigationTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        storageKey="admin_system_settings_tab"
      /> */}

      {/* Tab Content */}
      <div className="mt-8">
        {/* {renderTabContent()} */}
        {navigationTabs[0] && renderTabContent()}
      </div>

    </div>
  )
}