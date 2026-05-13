import React, { useState } from 'react'
import { 
  LuTrendingUp, 
  LuHistory, 
  LuCreditCard, 
  LuStar 
} from 'react-icons/lu'
import { MatrixCard } from '../../../../shared/components/metricCard'
import { PillNavigation } from '../../../../shared/components/navigation'
import { TAILWIND_COLORS } from '../../../../shared/WebConstant'
import RevenueDashboard from './RevenueDashboard'
import OrderHistory from './OrderHistory'
import SubscriptionPlan from './SubscriptionPlan'
import FeaturedContent from './FeaturedContent'
import ComingSoonPopup from '../../../../shared/components/ComingSoon.jsx'

export default function BusinessRevenue() {
    const [activeTab, setActiveTab] = useState(0)
  
    const navigationTabs = [
        {
            id: 'revenue-dashboard',
            label: 'Revenue Dashboard',
            icon: LuTrendingUp
        },
        {
            id: 'order-history',
            label: 'Order History & Logs',
            icon: LuHistory
        },
        {
            id: 'subscription-plans',
            label: 'Subscription Plans',
            icon: LuCreditCard
        },
        {
            id: 'featured-content',
            label: 'Featured Content',
            icon: LuStar
        }
    ]

    return (
        <div className="min-h-screen ">
            {/* Header Section */}
            <div className="mb-5">
                <MatrixCard 
                    title="Business & Revenue Panel"
                    subtitle="Manage your revenue streams, subscriptions, and featured content"
                    titleColor={TAILWIND_COLORS.TEXT_PRIMARY}
                    subtitleColor={TAILWIND_COLORS.TEXT_MUTED}
                />
            </div>

            {/* Navigation Bar */}
            <div className="mb-5">
                <PillNavigation 
                    tabs={navigationTabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    storageKey="admin_business_revenue_tab"
                    className="justify-center"
                />
            </div>

            {/* Content Area */}
            <div>
                {activeTab === 0 && <RevenueDashboard />}
                {activeTab === 1 && <OrderHistory />}
                {activeTab === 2 && <SubscriptionPlan />}
                {activeTab === 3 && <FeaturedContent />}
            </div>

            {/* Coming Soon Popup */}
            <ComingSoonPopup />
        </div>
    )
}