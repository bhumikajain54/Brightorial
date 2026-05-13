import React, { useState } from 'react';
import {
  LuArrowLeft,
  LuCheck,
  LuCircleDot,
} from 'react-icons/lu';
import { TAILWIND_COLORS, COLORS } from '../../../../shared/WebConstant.js';
import { PrimaryButton, SaveButton, BackToOverviewButton } from '../../../../shared/components/Button';
import DynamicButton from '../../../../shared/components/DynamicButton';

const CMSEditor = () => {
  // State for each page
  const [aboutUs, setAboutUs] = useState({
    title: '',
    content: '',
    isSaving: false,
    savedTick: false
  });

  const [termsOfService, setTermsOfService] = useState({
    title: '',
    content: '',
    isSaving: false,
    savedTick: false
  });

  const [privacyPolicy, setPrivacyPolicy] = useState({
    title: '',
    content: '',
    isSaving: false,
    savedTick: false
  });

  const handleSave = async (pageType, data) => {
    const setter = pageType === 'about' ? setAboutUs : 
                   pageType === 'terms' ? setTermsOfService : setPrivacyPolicy;
    
    setter(prev => ({ ...prev, isSaving: true, savedTick: false }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setter(prev => ({ ...prev, savedTick: true }));
      setTimeout(() => {
        setter(prev => ({ ...prev, savedTick: false }));
      }, 1500);
    } finally {
      setter(prev => ({ ...prev, isSaving: false }));
    }
  };

  const StatusBadge = ({ status }) => {
    const isPublished = status === "Published";
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
        isPublished ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
      }`}>
        {isPublished ? <LuCheck className="h-3 w-3" /> : <LuCircleDot className="h-3 w-3" />}
        {status}
      </span>
    );
  };

  const PageCard = ({ 
    title, 
    status, 
    lastUpdated, 
    titlePlaceholder, 
    contentPlaceholder, 
    pageData, 
    pageType 
  }) => (
    <div className="bg-white border border-[var(--color-primary)2c] rounded-lg shadow-sm p-6 h-fit">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY} mb-1`}>{title}</h3>
          <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Last updated {lastUpdated}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Page Title Field */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Page title</label>
          <input
            type="text"
            value={pageData.title}
            onChange={(e) => {
              const setter = pageType === 'about' ? setAboutUs : 
                           pageType === 'terms' ? setTermsOfService : setPrivacyPolicy;
              setter(prev => ({ ...prev, title: e.target.value }));
            }}
            placeholder={titlePlaceholder}
            className={`w-full h-12 px-4 py-3 border border-[var(--color-primary)2c] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}
          />
        </div>

        {/* Content Field */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Content Preview</label>
          <textarea
            rows={6}
            value={pageData.content}
            onChange={(e) => {
              const setter = pageType === 'about' ? setAboutUs : 
                           pageType === 'terms' ? setTermsOfService : setPrivacyPolicy;
              setter(prev => ({ ...prev, content: e.target.value }));
            }}
            placeholder={contentPlaceholder}
            className={`w-full h-32 px-4 py-3 border border-[var(--color-primary)2c] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none ${TAILWIND_COLORS.TEXT_PRIMARY}`}
          />
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <SaveButton
            onClick={() => handleSave(pageType, { title: pageData.title, content: pageData.content })}
            loading={pageData.isSaving}
            savedTick={pageData.savedTick}
            disabled={pageData.isSaving}
          >
            Save
          </SaveButton>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header Section */}
      <div className="flex items-start bg-white p-4 border border-[var(--color-primary)2c] rounded-lg justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>CMS Editor</h2>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>About, Terms, Policy</p>
          </div>
        </div>

        {/* Back to overview button */}
        <BackToOverviewButton
          onClick={() => window.history.back()}
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PageCard
          title="About Us"
          status="Published"
          lastUpdated="2 days ago"
          titlePlaceholder="About Us title"
          contentPlaceholder="Write your about us content here.."
          pageData={aboutUs}
          pageType="about"
        />
        
        <PageCard
          title="Terms of Service"
          status="Draft"
          lastUpdated="2 days ago"
          titlePlaceholder="Terms of service title.."
          contentPlaceholder="Write your terms of service content here.."
          pageData={termsOfService}
          pageType="terms"
        />
        
        <PageCard
          title="Privacy Policy"
          status="Draft"
          lastUpdated="2 days ago"
          titlePlaceholder="privacy policy title"
          contentPlaceholder="Write your privacy policy content here.."
          pageData={privacyPolicy}
          pageType="privacy"
        />
      </div>
    </div>
  );
};

export default CMSEditor;
