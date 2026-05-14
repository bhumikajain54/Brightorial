import React, { useState, useEffect } from 'react'
import { TAILWIND_COLORS, COLORS } from '../WebConstant'
import { LuUsers, LuPlus, LuBuilding2, LuMenu, LuX } from 'react-icons/lu'

const NavigationTabs = ({ navigationTabs, activeNavTab, setActiveNavTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
 
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm"
          style={{ borderColor: TAILWIND_COLORS.BORDER }}
        >
          <div className="flex items-center gap-2">
            {navigationTabs.find(tab => tab.id === activeNavTab)?.icon && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-primary-10)]">
                {React.createElement(navigationTabs.find(tab => tab.id === activeNavTab).icon, { 
                  size: 16, 
                  style: { color: COLORS.GREEN_PRIMARY } 
                })}
              </div>
            )}
            <span className="text-sm font-medium" style={{ color: COLORS.GREEN_PRIMARY }}>
              {navigationTabs.find(tab => tab.id === activeNavTab)?.label || 'Select Option'}
            </span>
          </div>
          {isMobileMenuOpen ? <LuX size={20} className="text-secondary" /> : <LuMenu size={20} className="text-secondary" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mb-4">
          <div className="bg-white rounded-lg border shadow-sm" style={{ borderColor: TAILWIND_COLORS.BORDER }}>
            {navigationTabs.map((tab) => {
              const Icon = tab.icon
              const hasIcon = Boolean(Icon)
              const isActive = activeNavTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveNavTab(tab.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-all duration-200 first:rounded-t-lg last:rounded-b-lg
                    ${isActive ? 'bg-[var(--color-primary-10)]' : 'hover:bg-gray-50'}
                  `}
                >
                  {hasIcon && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                        ${isActive ? 'bg-white' : 'bg-[var(--color-primary-10)]'}
                      `}
                    >
                      <Icon size={16} style={{ color: COLORS.GREEN_PRIMARY }} />
                    </div>
                  )}
                  <span
                    className={`text-sm transition-all duration-200
                      ${isActive ? 'font-bold' : 'font-medium'}
                    `}
                    style={{ color: COLORS.GREEN_PRIMARY }}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <div
          className={`flex justify-center P-3 items-center w-full p-1 rounded-[30px] border ${TAILWIND_COLORS.BORDER}`}
        >
          <div className="flex items-center justify-center gap-1 w-full">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon
              const hasIcon = Boolean(Icon)
              const isActive = activeNavTab === tab.id
              const count = navigationTabs.length
              const isFive = count === 5
              const isCompact = count >= 5

              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveNavTab(tab.id)}
                  className={`cursor-pointer flex items-center justify-center rounded-[30px] transition-all duration-200
                    ${isFive ? 'basis-1/5 flex-none' : 'flex-1'}
                    ${isCompact ? 'h-8' : 'h-9'} min-w-0
                    ${isActive ? COLORS.GREEN_PRIMARY : 'text-gray-600 bg-white'}
                  `}
                  style={{
                    backgroundColor: isActive ? COLORS.GREEN_PRIMARY : 'white',
                  }}
                  role="tab"
                  aria-selected={isActive}
                >
                  {hasIcon && (
                    <div
                      className={`flex items-center justify-center mr-2
                        ${isCompact ? 'w-[40px] h-[28px]' : 'w-[30px] h-[30px]'}
                        rounded-full transition-all duration-200
                        ${isActive ? 'bg-white' : 'bg-[var(--color-primary-10)]'}
                      `}
                    >
                     <Icon size={12} style={{ color: isActive ? COLORS.GREEN_PRIMARY : COLORS.GREEN_PRIMARY }} />
                    </div>
                  )}

                  <span
                    className={`transition-all duration-200 text-center overflow-hidden text-ellipsis whitespace-nowrap
                      ${isCompact ? 'text-[13px]' : 'text-[14px]'} leading-[18px]
                      ${isActive ? 'font-bold' : TAILWIND_COLORS.TEXT_MUTED}
                    `}
                    style={{
                      color: isActive ? 'white' : '',
                    }}
                  >
                    {tab.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Pill Navigation Component - Horizontal tab selector with pill-shaped buttons
// Usage: <PillNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
export const PillNavigation = ({ 
  tabs = [], 
  activeTab = 0, 
  onTabChange,
  className = '',
  storageKey
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Import user-specific localStorage utility
  const getUserSpecificKey = (baseKey) => {
    try {
      const authUser = typeof window !== 'undefined' ? window.localStorage.getItem("authUser") : null;
      if (authUser) {
        const user = JSON.parse(authUser);
        const userId = user.id || user.uid;
        const userRole = user.role;
        if (userId && userRole) {
          return `${baseKey}_${userRole}_${userId}`;
        }
      }
    } catch (error) {
      console.error('Error getting user-specific key:', error);
    }
    return baseKey; // Fallback to base key
  };

  // Load persisted tab on mount
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined' || typeof onTabChange !== 'function') return

    const userSpecificKey = getUserSpecificKey(storageKey);
    const storedValue = window.localStorage.getItem(userSpecificKey)
    if (storedValue === null) return

    const parsedValue = Number(storedValue)
    if (
      Number.isInteger(parsedValue) &&
      parsedValue >= 0 &&
      parsedValue < tabs.length &&
      parsedValue !== activeTab
    ) {
      onTabChange(parsedValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, tabs.length])

  // Persist active tab whenever it changes
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return
    const userSpecificKey = getUserSpecificKey(storageKey);
    window.localStorage.setItem(userSpecificKey, String(activeTab))
  }, [storageKey, activeTab])

  return (
    <div className={`flex justify-center ${className}`}>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden w-full">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between p-3 rounded-lg border bg-bg-white shadow-sm"
          style={{ borderColor: 'var(--color-primary-10)' }}
        >
          <div className="flex items-center gap-2">
            {tabs[activeTab]?.icon && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-primary-10)]">
                {React.createElement(tabs[activeTab].icon, { 
                  size: 16, 
                  style: { color: COLORS.GREEN_PRIMARY } 
                })}
              </div>
            )}
            <span className="text-sm font-medium text-secondary">
              {tabs[activeTab]?.label || 'Select Option'}
            </span>
          </div>
          {isMobileMenuOpen ? <LuX size={20} className="text-secondary" /> : <LuMenu size={20} className="text-secondary" />}
        </button>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="mt-2 bg-bg-white rounded-lg border shadow-sm" style={{ borderColor: 'var(--color-primary-10)' }}>
            {tabs.map((tab, index) => {
              const isActive = index === activeTab
              const Icon = tab.icon

              return (
                <button
                  key={tab.id || index}
                  onClick={() => {
                    onTabChange(index)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-all duration-200 first:rounded-t-lg last:rounded-b-lg
                    ${isActive ? 'bg-[var(--color-primary-10)]' : 'hover:bg-gray-50'}
                  `}
                >
                  {Icon && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                        ${isActive ? 'bg-white' : 'bg-[var(--color-primary-10)]'}
                      `}
                    >
                      <Icon size={16} style={{ color: COLORS.GREEN_PRIMARY }} />
                    </div>
                  )}
                  <span
                    className={`text-sm transition-all duration-200
                      ${isActive ? 'font-bold' : 'font-medium'}
                    `}
                    style={{ color: COLORS.GREEN_PRIMARY }}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <div 
          className="inline-flex rounded-full p-1 items-center gap-2 max-w-full shadow-sm nav-tab-container"
          style={{ 
            backgroundColor: 'var(--color-bg-white)', 
            border: '1px solid var(--color-primary-10)' 
          }}
        >
          {tabs.map((tab, index) => {
            const isActive = index === activeTab
            const Icon = tab.icon

            return (
              <button
                key={tab.id || index}
                onClick={() => onTabChange(index)}
                className={`flex items-center justify-between gap-2 rounded-full px-2 lg:pe-5 py-2 whitespace-nowrap transition-all duration-200 nav-tab ${
                  isActive ? 'active' : ''
                }`}
                style={
                  isActive
                    ? { 
                        backgroundColor: 'var(--color-secondary)', 
                        color: 'white' 
                      }
                    : { 
                        backgroundColor: 'var(--color-bg-white)', 
                        color: 'var(--color-secondary)', 
                        border: '1px solid var(--color-primary-10)' 
                      }
                }
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={
                    isActive
                      ? { 
                          backgroundColor: 'rgba(255,255,255,0.9)', 
                          color: 'var(--color-secondary)' 
                        }
                      : { 
                          backgroundColor: 'var(--color-primary-10)', 
                          color: 'var(--color-secondary)' 
                        }
                  }
                >
                  {Icon && <Icon size={18} />}
                </span>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Predefined tab configurations for common use cases
export const MANAGEMENT_TABS = [
  {
    id: 'student',
    label: 'Candidate Management',
    icon: LuUsers
  },
  {
    id: 'employer',
    label: 'Recruiter Management', 
    icon: LuPlus
  },
  {
    id: 'institute',
    label: 'Skill Partner Management',
    icon: LuBuilding2
  }
]

export const DASHBOARD_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LuUsers
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: LuPlus
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: LuBuilding2
  }
]

export default NavigationTabs
