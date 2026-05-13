import React, { useMemo, useState } from "react";
import { LuBell, LuChevronDown, LuSearch, LuSave, LuEye, LuPlus } from "react-icons/lu";
import { TAILWIND_COLORS } from '../../../../shared/WebConstant.js';
import { 
  Button, 
  LaunchCampaignButton, 
  SaveDraftButton, 
  PreviewButton, 
  FilterButton, 
  ViewCampaignButton 
} from "../../../../shared/components/Button.jsx";
import { PillNavigation } from "../../../../shared/components/navigation.jsx";

// Constants
const TABS = {
  CREATE: "create",
  MANAGE: "manage"
};

const CHANNELS = [
  { value: "", label: "Select Channel" },
  { value: "Email", label: "Email" },
  { value: "SMS", label: "SMS" },
  { value: "WhatsApp", label: "WhatsApp" }
];

const CAMPAIGN_STATUS = {
  ACTIVE: "Active",
  DRAFT: "Draft", 
  PAUSED: "Paused"
};

export default function EmailSmsCampaignsManager() {
  const [activeTab, setActiveTab] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);
  const [form, setForm] = useState({
    name: "",
    channel: "",
    subject: "",
    content: "",
  });
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      title: "Welcome Email Series",
      channel: "Email",
      recipients: "1,234",
      status: CAMPAIGN_STATUS.ACTIVE,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      id: 2,
      title: "SMS Reminder Campaign",
      channel: "SMS",
      recipients: "856",
      status: CAMPAIGN_STATUS.DRAFT,
      iconColor: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      id: 3,
      title: "WhatsApp Promotion",
      channel: "WhatsApp",
      recipients: "2,100",
      status: CAMPAIGN_STATUS.PAUSED,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ]);

  const canLaunch = useMemo(() => {
    return form.name.trim() && form.channel && form.subject.trim() && form.content.trim();
  }, [form]);

  // Navigation tabs for the component
  const navigationTabs = [
    { id: 'create', label: 'Create Campaign', icon: LuPlus },
    { id: 'manage', label: 'Manage Campaign', icon: LuBell }
  ];

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleLaunch = async () => {
    if (!canLaunch) {
      alert("Please fill all fields to launch the campaign.");
      return;
    }

    setIsLaunching(true);

    try {
      // Simulate API call (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/campaigns', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(form)
      // });
      // const result = await response.json();

      // Create new campaign object
      const newCampaign = {
        id: Date.now(), // Simple ID generation
        title: form.name,
        channel: form.channel,
        recipients: Math.floor(Math.random() * 5000) + 100, // Random recipient count
        status: CAMPAIGN_STATUS.ACTIVE,
        iconColor: form.channel === 'Email' ? 'text-blue-600' : 
                   form.channel === 'SMS' ? 'text-green-600' : 'text-purple-600',
        bgColor: form.channel === 'Email' ? 'bg-blue-100' : 
                 form.channel === 'SMS' ? 'bg-green-100' : 'bg-purple-100'
      };

      // Add new campaign to the list
      setCampaigns(prev => [newCampaign, ...prev]);

      // Reset form after successful launch
      setForm({
        name: "",
        channel: "",
        subject: "",
        content: "",
      });

      // Show success message
      alert(`Campaign "${form.name}" launched successfully! 🚀`);
      
      // Switch to manage tab to see the new campaign
      setActiveTab(1);

    } catch (error) {
      console.error('Error launching campaign:', error);
      alert('Failed to launch campaign. Please try again.');
    } finally {
      setIsLaunching(false);
    }
  };

  const handleSaveDraft = () => {
    // TODO: save draft API
    alert("Draft saved 💾");
  };

  const handlePreview = () => {
    const preview = `
---- Preview -------------------------------------------------
Name: ${form.name}
Channel: ${form.channel}
Subject: ${form.subject}

${form.content}
-------------------------------------------------------------
`;
    alert(preview);
  };

  // Component: Header Section
  const HeaderSection = () => (
    <div className="flex items-center space-x-3 mb-6">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 flex-shrink-0">
        <LuBell className="h-5 w-5 text-green-600" />
      </div>
      <div>
        <h1 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
          Email & SMS Campaign Manager
        </h1>
        <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>
          Create and manage multi-channel marketing campaigns
        </p>
      </div>
    </div>
  );

  // Component: Tab Navigation
  const TabNavigation = () => (
    <div className="mb-6">
      <PillNavigation 
        tabs={navigationTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        storageKey="admin_email_sms_manager_tab"
      />
    </div>
  );

  // Component: Search and Filter Bar
  const SearchFilterBar = () => (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>
        <FilterButton />
      </div>
    </div>
  );

  // Component: Campaign Card
  const CampaignCard = ({ title, channel, recipients, status, iconColor, bgColor }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center`}>
            <LuBell className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <h3 className={`font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{title}</h3>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{channel} • {recipients} recipients</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
            status === CAMPAIGN_STATUS.ACTIVE ? 'bg-green-100 text-green-800' :
            status === CAMPAIGN_STATUS.DRAFT ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status}
          </span>
          <ViewCampaignButton />
        </div>
      </div>
    </div>
  );

  // Component: Campaign Management Section
  const CampaignManagementSection = () => (
    <div className="space-y-6">
      <SearchFilterBar />
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <CampaignCard 
            key={campaign.id}
            title={campaign.title}
            channel={campaign.channel}
            recipients={campaign.recipients.toLocaleString()}
            status={campaign.status}
            iconColor={campaign.iconColor}
            bgColor={campaign.bgColor}
          />
        ))}
      </div>
    </div>
  );

  // Component: Campaign Create Form
  const CampaignCreateForm = ({ form, onChange, canLaunch, onLaunch, onSaveDraft, onPreview }) => (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onLaunch();
      }}
    >
      {/* Row: Campaign Name + Channel */}
      <div className="grid gap-4 md:grid-cols-[1fr,280px]">
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Campaign Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Enter campaign name"
            className={`h-12 w-full rounded-lg border border-gray-300 bg-white px-4 ${TAILWIND_COLORS.TEXT_PRIMARY} placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200`}
          />
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Channel
          </label>
          <div className="relative">
            <select
              name="channel"
              value={form.channel}
              onChange={onChange}
              className={`h-12 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 pr-9 ${TAILWIND_COLORS.TEXT_PRIMARY} focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200`}
            >
              {CHANNELS.map((channel) => (
                <option key={channel.value} value={channel.value}>
                  {channel.label}
                </option>
              ))}
            </select>
            <LuChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Subject Line */}
      <div className="space-y-2">
        <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
          Subject Line
        </label>
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={onChange}
          placeholder="Enter email subject or SMS preview"
          className={`h-12 w-full rounded-lg border border-gray-300 bg-white px-4 ${TAILWIND_COLORS.TEXT_PRIMARY} placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200`}
        />
      </div>

      {/* Campaign Content */}
      <div className="space-y-2">
        <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
          Campaign Content
        </label>
        <textarea
          name="content"
          value={form.content}
          onChange={onChange}
          rows={4}
          placeholder="Enter your campaign message"
          className={`w-full h-24 rounded-lg border border-gray-300 bg-white px-4 py-3 ${TAILWIND_COLORS.TEXT_PRIMARY} placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 resize-none`}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <LaunchCampaignButton
          onClick={onLaunch}
          disabled={!canLaunch}
          loading={isLaunching}
        />

        <SaveDraftButton
          onClick={onSaveDraft}
        />

        <PreviewButton
          onClick={onPreview}
        />
      </div>
    </form>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
        <HeaderSection />
        <TabNavigation />

        {activeTab === 1 ? (
          <CampaignManagementSection />
        ) : (
          <CampaignCreateForm 
            form={form}
            onChange={onChange}
            canLaunch={canLaunch}
            onLaunch={handleLaunch}
            onSaveDraft={handleSaveDraft}
            onPreview={handlePreview}
          />
        )}
      </div>
    </div>
  );
}
