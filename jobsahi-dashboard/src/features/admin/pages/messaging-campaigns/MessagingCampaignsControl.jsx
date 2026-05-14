import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MetricCard, { MatrixCard, Horizontal4Cards } from '../../../../shared/components/metricCard.jsx';
import { PillNavigation } from '../../../../shared/components/navigation.jsx';
import { TAILWIND_COLORS } from '../../../../shared/WebConstant.js';
import Button from '../../../../shared/components/Button.jsx';
import { FilterButton, NewCampaignButton, LaunchCampaignButton, SaveDraftButton, PreviewButton } from '../../../../shared/components/Button.jsx';
import { LuX } from 'react-icons/lu';
import Swal from 'sweetalert2';
import SystemWidePush from './SystemWidePush.jsx';
import SegmentBasedMessaging from './SegmentBasedMessaging.jsx';
import EmailSmsCampaignsManager from './EmailSmsCampaignsManager.jsx'; 
import NotificationTemplatesManager from './NotificationTemplatesManager.jsx';

const MessagingCampaignsView = () => {
  // Tabs synced to URL (?tab=messaging|segments|analytics|templates)
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    switch(tab) {
      case 'segments': return 1;
      case 'analytics': return 2;
      case 'templates': return 3;
      default: return 0; // 'messaging'
    }
  });

  // State for campaign creation modal
  const [campaignModal, setCampaignModal] = useState({ isOpen: false });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, content: null });

  useEffect(() => {
    const current = searchParams.get('tab');
    const expectedTab = ['messaging', 'segments', 'analytics', 'templates'][activeTab];
    if (current !== expectedTab) {
      const next = new URLSearchParams(searchParams);
      next.set('tab', expectedTab);
      setSearchParams(next, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  // Click handlers for Filter and New Campaign buttons
  const handleFilterClick = () => {
    console.log('Filter button clicked');
    // Add filter functionality here
    // For example: show filter modal, toggle filter options, etc.
  };

  const handleNewCampaignClick = () => {
    setCampaignModal({ isOpen: true });
  };

  const handleCloseCampaignModal = () => {
    setCampaignModal({ isOpen: false });
  };

  const handleLaunchCampaign = (campaignData) => {
    console.log('Launching campaign:', campaignData);
    setCampaignModal({ isOpen: false });
    
    Swal.fire({
      title: "Campaign Launched!",
      text: `"${campaignData.campaignName}" has been launched successfully.`,
      icon: "success",
      timer: 3000,
      showConfirmButton: false
    });
  };

  const handleSaveDraft = (campaignData) => {
    console.log('Saving draft:', campaignData);
    setCampaignModal({ isOpen: false });
    
    Swal.fire({
      title: "Draft Saved!",
      text: `"${campaignData.campaignName}" has been saved as draft.`,
      icon: "success",
      timer: 3000,
      showConfirmButton: false
    });
  };

  const handlePreview = (campaignData) => {
    setPreviewModal({ isOpen: true, content: campaignData });
  };

  const handleClosePreview = () => {
    setPreviewModal({ isOpen: false, content: null });
  };

  // Navigation tabs data for messaging campaigns
  const navigationTabs = [
    {
      id: 'messaging',
      label: 'System-wide Push Notifications',
      icon: () => (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      )
    },
    {
      id: 'segments',
      label: 'Segment-Based Messaging',
      icon: () => (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      id: 'analytics',
      label: 'Email & SMS Campaigns Management',
      icon: () => (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      id: 'templates',
      label: 'Notification Templates Manager',
      icon: () => (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      )
    }
  ];

  // New Campaign Modal Component
  const NewCampaignModal = ({ isOpen, onClose, onLaunch, onSaveDraft, onPreview }) => {
    const [campaignForm, setCampaignForm] = useState({
      campaignName: '',
      channel: '',
      subjectLine: '',
      campaignContent: ''
    });

    const handleInputChange = (field, value) => {
      setCampaignForm(prev => ({ ...prev, [field]: value }));
    };

    const handleLaunch = () => {
      // Validate form
      if (!campaignForm.campaignName.trim() || !campaignForm.channel.trim() || !campaignForm.subjectLine.trim() || !campaignForm.campaignContent.trim()) {
        Swal.fire({
          title: "Validation Error",
          text: "Please fill in all required fields!",
          icon: "error"
        });
        return;
      }

      onLaunch(campaignForm);
      
      // Reset form
      setCampaignForm({
        campaignName: '',
        channel: '',
        subjectLine: '',
        campaignContent: ''
      });
    };

    const handleSaveDraft = () => {
      // Validate at least campaign name
      if (!campaignForm.campaignName.trim()) {
        Swal.fire({
          title: "Validation Error",
          text: "Please enter a campaign name!",
          icon: "error"
        });
        return;
      }

      onSaveDraft(campaignForm);
      
      // Reset form
      setCampaignForm({
        campaignName: '',
        channel: '',
        subjectLine: '',
        campaignContent: ''
      });
    };

    const handlePreview = () => {
      if (!campaignForm.campaignName.trim()) {
        Swal.fire({
          title: "Validation Error",
          text: "Please enter a campaign name!",
          icon: "error"
        });
        return;
      }

      onPreview(campaignForm);
    };

    const handleClose = () => {
      // Reset form when closing
      setCampaignForm({
        campaignName: '',
        channel: '',
        subjectLine: '',
        campaignContent: ''
      });
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">Create New Campaign</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <LuX size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Campaign Name and Channel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Campaign Name*</label>
                <input
                  type="text"
                  value={campaignForm.campaignName}
                  onChange={(e) => handleInputChange('campaignName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter campaign name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Channel*</label>
                <select
                  value={campaignForm.channel}
                  onChange={(e) => handleInputChange('channel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Channel</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push Notification</option>
                  <option value="in-app">In-App Message</option>
                </select>
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Subject Line*</label>
              <input
                type="text"
                value={campaignForm.subjectLine}
                onChange={(e) => handleInputChange('subjectLine', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter email subject or SMS preview"
              />
            </div>

            {/* Campaign Content */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Campaign Content*</label>
              <textarea
                value={campaignForm.campaignContent}
                onChange={(e) => handleInputChange('campaignContent', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="Enter your campaign message"
              />
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between gap-3">
            <PreviewButton
              onClick={handlePreview}
            />
            
            <div className="flex gap-3">
              <SaveDraftButton
                onClick={handleSaveDraft}
              />
              <LaunchCampaignButton
                onClick={handleLaunch}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Preview Modal Component
  const PreviewModal = ({ isOpen, content, onClose }) => {
    if (!isOpen || !content) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">Campaign Preview</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <LuX size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-2">{content.campaignName}</h3>
              <p className="text-sm text-text-muted mb-4">
                <strong>Channel:</strong> {content.channel} | <strong>Subject:</strong> {content.subjectLine}
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-text-primary mb-2">Content Preview:</h4>
              <div className="text-text-primary whitespace-pre-wrap">
                {content.campaignContent}
              </div>
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
            <Button
              onClick={onClose}
              variant="neutral"
              size="md"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  };

  
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <MatrixCard 
        title="Messaging & Campaigns"
        subtitle="Manage notifications, campaigns, and templates"
      />

      {/* Campaign Statistics Cards */}
      <Horizontal4Cards data={[
        { title: "Active Campaigns", value: "15", icon: "📊" },
        { title: "Total Notifications", value: "1,250", icon: "🔔" },
        { title: "User Segments", value: "5", icon: "👥" },
        { title: "Templates", value: "22", icon: "📄" }
      ]} />

      {/* Navigation Tabs */}
      {/* <PillNavigation 
        tabs={navigationTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        storageKey="admin_messaging_campaigns_tab"
      /> */}

      {/* Filter and New Campaign Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mb-4 sm:mb-6">
        <FilterButton onClick={handleFilterClick} />
        <NewCampaignButton onClick={handleNewCampaignClick} />
      </div>

      {/* Content based on active navigation tab */}
      {/* {activeTab === 0 && <SystemWidePush />} */}
      <SystemWidePush />

      {/* Segment-Based Messaging Content */}
      {/* {activeTab === 1 && <SegmentBasedMessaging />} */}

      {/* Email & SMS Campaigns Management Content */}
      {/* {activeTab === 2 && <EmailSmsCampaignsManager />} */}

      {/* Notification Templates Manager Content */}
      {/* {activeTab === 3 && <NotificationTemplatesManager />} */}


      {/* New Campaign Modal */}
      <NewCampaignModal
        isOpen={campaignModal.isOpen}
        onClose={handleCloseCampaignModal}
        onLaunch={handleLaunchCampaign}
        onSaveDraft={handleSaveDraft}
        onPreview={handlePreview}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        content={previewModal.content}
        onClose={handleClosePreview}
      />

    </div>
  );
};

export default MessagingCampaignsView;
