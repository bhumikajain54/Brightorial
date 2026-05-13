import React, { useState } from "react";
import { LuBuilding2, LuUsers, LuSettings } from "react-icons/lu";
import { MatrixCard } from "@shared/components/metricCard";
import { PillNavigation } from "@shared/components/navigation";
import CompanyInfo from "./CompanyInformation";
import TeamManagement from "./TeamManagement";
import Preferences from "./Preferences";
import { getMethod, postMultipart, putMethod } from "../../../../service/api";
import apiService from "../../services/serviceUrl";

const CompanyProfile = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: "company-info",
      label: "Company Info",
      icon: LuBuilding2,
    },
    {
      id: "team-management",
      label: "Team Management",
      icon: LuUsers,
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: LuSettings,
    }
  ];

  // ✅ Render component conditionally based on activeTab to ensure proper unmounting
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <CompanyInfo key="company-info" />;
      case 1:
        return <TeamManagement key="team-management" onBack={() => setActiveTab(0)} />;
      case 2:
        return <Preferences key="preferences" onBack={() => setActiveTab(0)} />;
      default:
        return <CompanyInfo key="company-info" />;
    }
  };

  // console.log(service)
  return (
    <div className="space-y-5">
      <MatrixCard
        title="Company Profile & Settings"
        subtitle="Manage your company information and team settings"
      />

      <div className="flex justify-center">
        <PillNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          storageKey="recruiter_company_profile_tab"
        />
      </div>

      <div className="mt-5">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CompanyProfile;
