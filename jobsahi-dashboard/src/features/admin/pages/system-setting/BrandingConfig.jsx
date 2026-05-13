import React, { useState } from 'react'
import { BackToOverviewButton, PrimaryButton } from '../../../../shared/components/Button'
import { COLORS, TAILWIND_COLORS } from '../../../../shared/WebConstant.js'
import { Horizontal4Cards } from '../../../../shared/components/metricCard.jsx'
import { 
  LuArrowLeft, 
  LuUpload, 
  LuImage
} from 'react-icons/lu'

const BrandingConfig = () => {
  // Brand Identity State
  const [brandIdentity, setBrandIdentity] = useState({
    applicationName: 'Job Portal Pro',
    tagline: 'Your career starts here',
    companyName: 'Your Company LTD.',
    websiteUrl: 'https://jobsahi.com'
  })

  // Contact Info State
  const [contactInfo, setContactInfo] = useState({
    email: 'contact@jobsahi.com',
    phone: '+91 00000 00000',
    address: 'Address goes here..'
  })

  // Loading states
  const [isSaving, setIsSaving] = useState(false)

  // Logo assets data for Horizontal4Cards
  const logoAssetsData = [
    {
      title: "Main Logo",
      value: "200 x 60px",
      icon: <LuUpload className="h-5 w-5" />,
    },
    {
      title: "Favicon",
      value: "32 x 32px",
      icon: <LuUpload className="h-5 w-5" />,
    },
    {
      title: "Mobile Logo",
      value: "150 x 45px",
      icon: <LuUpload className="h-5 w-5" />,
    },
    {
      title: "Email Logo",
      value: "180 x 55px",
      icon: <LuUpload className="h-5 w-5" />,
    },
  ];

  // Handle brand identity changes
  const handleBrandIdentityChange = (field, value) => {
    setBrandIdentity(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle contact info changes
  const handleContactInfoChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }


  // Save configuration
  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Here you would typically send the data to your backend
      console.log('Saving branding config:', {
        brandIdentity,
        contactInfo
      })
      
      alert('Branding configuration saved successfully!')
    } catch (error) {
      console.error('Error saving branding config:', error)
      alert('Error saving configuration. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }


  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header Section */}
      <div className="flex items-start bg-white p-4 border border-gray-200 rounded-lg justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
            <LuImage className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Branding Config</h2>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>App name, Logos, Contact info</p>
          </div>
        </div>

        {/* Back to overview button */}
        <BackToOverviewButton
          onClick={() => window.history.back()}
        />
      </div>

      {/* Brand Identity & Contact Info Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand Identity */}
          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Brand Identity</h3>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Configure your job portal's identity</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Application Name</label>
                <input
                  type="text"
                  value={brandIdentity.applicationName}
                  onChange={(e) => handleBrandIdentityChange('applicationName', e.target.value)}
                  className="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent text-sm"
                  placeholder="Job Portal Pro"
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Tagline</label>
                <input
                  type="text"
                  value={brandIdentity.tagline}
                  onChange={(e) => handleBrandIdentityChange('tagline', e.target.value)}
                  className="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent text-sm"
                  placeholder="Your career starts here"
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Company Name</label>
                <input
                  type="text"
                  value={brandIdentity.companyName}
                  onChange={(e) => handleBrandIdentityChange('companyName', e.target.value)}
                  className="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent text-sm"
                  placeholder="Your Company LTD."
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Website URL</label>
                <input
                  type="url"
                  value={brandIdentity.websiteUrl}
                  onChange={(e) => handleBrandIdentityChange('websiteUrl', e.target.value)}
                  className="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent text-sm"
                  placeholder="https://jobsahi.com"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Contact Info</h3>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Business contact details</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Email</label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => handleContactInfoChange('email', e.target.value)}
                  className="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent text-sm"
                  placeholder="contact@jobsahi.com"
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Phone</label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                  className="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent text-sm"
                  placeholder="+91 00000 00000"
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Address</label>
                <textarea
                  value={contactInfo.address}
                  onChange={(e) => handleContactInfoChange('address', e.target.value)}
                  rows={3}
                  className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent text-sm resize-none"
                  placeholder="Address goes here.."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo & Assets Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Logo & Assets</h3>
          <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Upload and manage your brand assets</p>
        </div>

        <Horizontal4Cards data={logoAssetsData} />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <PrimaryButton
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3"
        >
          {isSaving ? 'Saving...' : 'Save Branding Config'}
        </PrimaryButton>
      </div>
    </div>
  )
}

export default BrandingConfig
