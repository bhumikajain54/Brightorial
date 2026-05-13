import React, { useState } from "react";
import { LuMessageSquare, LuBell, LuFileText } from "react-icons/lu";
import { MatrixCard } from "@shared/components/metricCard";
import { PillNavigation } from "@shared/components/navigation";

// ✅ Import existing files
import Message from "./Message";
import Notifications from "./Notifications";
import Templates from "./Templates";

// ✅ Import ComingSoonPopup (adjust path if your folder is different)
import ComingSoonPopup from "../../../../shared/components/ComingSoon";

const MessageNotification = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: "messages",
      label: "Messages",
      icon: LuMessageSquare,
      component: <Message />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: LuBell,
      component: <Notifications />,
    },
    {
      id: "templates",
      label: "Templates",
      icon: LuFileText,
      component: <Templates />,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <MatrixCard
        title="Messages & Notifications"
        subtitle="Manage your communication and notification settings"
      />

      {/* Navigation Pills */}
      <div className="flex justify-center">
        <PillNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          storageKey="recruiter_message_notification_tab"
        />
      </div>

      {/* Tab Content */}
      <div className="mt-5">
        {tabs[activeTab]?.component}

        {/* ✅ Coming Soon Popup */}
        <ComingSoonPopup />
      </div>
    </div>
  );
};

export default MessageNotification;
