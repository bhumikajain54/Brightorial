import React, { useState, useCallback } from "react";
import { LuBuilding2, LuUsers /* LuSettings */ } from "react-icons/lu";
import { MatrixCard } from "../../../../shared/components/metricCard";
import { PillNavigation } from "../../../../shared/components/navigation";
import { TAILWIND_COLORS } from "../../../../shared/WebConstant";
import InstituteProfile from "./InstituteProfile";
import StaffManagement from "./StaffManagement";
// import NotificationPreferences from "./NotificationPreferences";

const ProfileSetting = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [previousTab, setPreviousTab] = useState(null);

  const handleTabChange = useCallback((index) => {
    if (index === activeTab) return;
    setPreviousTab(activeTab);
    setActiveTab(index);
  }, [activeTab]);

  const handleReturnToPreviousTab = useCallback(() => {
    setActiveTab(previousTab ?? 0);
  }, [previousTab]);

  const tabs = [
    {
      id: "institute-profile",
      label: "Institute Profile",
      icon: LuBuilding2,
      component: <InstituteProfile />
    },
    {
      id: "staff-management",
      label: "Staff Management",
      icon: LuUsers,
      component: <StaffManagement />
    },
    // {
    //   id: "notification-preferences",
    //   label: "Notification Preferences",
    //   icon: LuSettings,
    //   component: (
    //     <NotificationPreferences onBack={handleReturnToPreviousTab} />
    //   )
    // }
  ];

  return (
    <div className={`space-y-5 ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
      {/* Header Section using MatrixCard */}
      <MatrixCard
        title="Institute Settings"
        subtitle="Manage your institute profile and system settings"
        className={TAILWIND_COLORS.TEXT_PRIMARY}
      />

      {/* Navigation Pills using PillNavigation */}
      {/* <div className="flex justify-center">
        <PillNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          storageKey="institute_profile_setting_tab"
          className={TAILWIND_COLORS.TEXT_PRIMARY}
        />
      </div> */}

      {/* Tab Content */}
      <div className="mt-5">
        {/* {tabs[activeTab]?.component} */}
        {tabs[0]?.component}
      </div>
    </div>
  );
};

export default ProfileSetting;

