import React, { useState } from "react";
import {
  LuUsers,
  LuUpload,
  LuEye,
  LuShield,
  LuPencil,
  LuTrash2,
  LuMail,
  LuArrowLeft,
} from "react-icons/lu";
import { TAILWIND_COLORS } from "@shared/WebConstant";
import { Button, IconButton } from "@shared/components/Button";
import EditTeamMemberModal from "./EditTeamMemberModal";

const TeamManagement = ({ onBack }) => {
  const [inviteData, setInviteData] = useState({
    email: "brightorial@company.com",
    role: "Viewer",
  });

  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "Aaruu",
      email: "aaruu@tech.com",
      role: "Admin",
      avatar: "A",
    },
    {
      id: 2,
      name: "Pooja",
      email: "pooja@tech.com",
      role: "Viewer",
      avatar: "P",
    },
    {
      id: 3,
      name: "Aaruu",
      email: "aaruu@tech.com",
      role: "Admin",
      avatar: "A",
    },
  ]);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const roleOptions = [
    { value: "Admin", label: "Admin", icon: LuShield },
    { value: "Viewer", label: "Viewer", icon: LuEye },
  ];

  const handleInputChange = (field, value) => {
    setInviteData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendInvitation = () => {
    if (!inviteData.email || !inviteData.role) {
      alert("Please fill in all fields");
      return;
    }

    const newMember = {
      id: Date.now(),
      name: inviteData.email.split("@")[0],
      email: inviteData.email,
      role: inviteData.role,
      avatar: inviteData.email.charAt(0).toUpperCase(),
    };

    setTeamMembers((prev) => [...prev, newMember]);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    setInviteData({
      email: "brightorial@company.com",
      role: "Viewer",
    });

    console.log("Team member added:", newMember);
  };

  const handleEditMember = (memberId) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (member) {
      setEditingMember(member);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = (memberId, updatedData) => {
    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? {
              ...member,
              ...updatedData,
              avatar: updatedData.name.charAt(0).toUpperCase(),
            }
          : member
      )
    );

    console.log("Team member updated:", updatedData);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (memberId) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  const getRoleIcon = (role) => {
    const roleOption = roleOptions.find((option) => option.value === role);
    return roleOption ? roleOption.icon : LuEye;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-[var(--color-secondary)] text-white border-[var(--color-secondary)]";
      case "Viewer":
      default:
        return `bg-secondary-10 border-[var(--color-secondary)] ${TAILWIND_COLORS.TEXT_ACCENT}`;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Go Back Button — only if onBack is provided */}
      {onBack && (
        <div className="col-span-full mb-2">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 font-medium hover:underline transition-all ${TAILWIND_COLORS.TEXT_ACCENT}`}
          >
            <LuArrowLeft size={18} />
            Go Back
          </button>
        </div>
      )}

      {/* Left Section - Invite Teammate */}
      <div className={`${TAILWIND_COLORS.CARD} p-6 flex flex-col`}>
        <div className="flex items-center gap-3 mb-2">
          <LuUpload className={TAILWIND_COLORS.TEXT_ACCENT} size={20} />
          <h3 className={`font-semibold text-lg ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Invite Teammate
          </h3>
        </div>
        <p className={`text-sm mb-6 ${TAILWIND_COLORS.TEXT_MUTED}`}>
          Add new team members to your account
        </p>

        <div className="space-y-4">
          <div className="flex flex-col">
            <label
              className={`text-sm font-medium mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}
            >
              Email Address
            </label>
            <input
              type="email"
              value={inviteData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Enter email address"
            />
          </div>

          <div className="flex flex-col">
            <label
              className={`text-sm font-medium mb-2 ${TAILWIND_COLORS.TEXT_PRIMARY}`}
            >
              Role
            </label>
            <div className="relative">
              <select
                value={inviteData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 appearance-none bg-white"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {React.createElement(getRoleIcon(inviteData.role), {
                  size: 16,
                  className: TAILWIND_COLORS.TEXT_ACCENT,
                })}
              </div>
            </div>
          </div>

          {showSuccessMessage && (
            <div
              className={`mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-sm ${TAILWIND_COLORS.TEXT_SUCCESS}`}
            >
              <span>
                ✅ Team member added successfully!
              </span>
            </div>
          )}

          <Button
            onClick={handleSendInvitation}
            variant="primary"
            size="lg"
            fullWidth
            icon={<LuMail size={16} />}
            className="font-medium"
          >
            Send invitation
          </Button>
        </div>
      </div>

      {/* Right Section - Team Members */}
      <div className={`${TAILWIND_COLORS.CARD} p-6 flex flex-col`}>
        <div className="flex items-center gap-3 mb-2 flex-shrink-0">
          <LuUsers className={TAILWIND_COLORS.TEXT_ACCENT} size={20} />
          <h3 className={`font-semibold text-lg ${TAILWIND_COLORS.TEXT_PRIMARY}`}>
            Team Members
          </h3>
        </div>
        <p
          className={`text-sm mb-6 flex-shrink-0 ${TAILWIND_COLORS.TEXT_MUTED}`}
        >
          Manage your current team members and their roles
        </p>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {teamMembers.map((member) => {
            const RoleIcon = getRoleIcon(member.role);
            return (
              <div key={member.id} className={`${TAILWIND_COLORS.CARD} p-4`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span
                        className={`text-sm font-semibold ${TAILWIND_COLORS.TEXT_MUTED}`}
                      >
                        {member.avatar}
                      </span>
                    </div>
                    <div>
                      <h4
                        className={`font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}
                      >
                        {member.name}
                      </h4>
                      <p
                        className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}
                      >
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                        member.role
                      )}`}
                    >
                      <RoleIcon size={12} />
                      <span>{member.role}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditMember(member.id)}
                        className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${TAILWIND_COLORS.TEXT_ACCENT}`}
                        title="Edit member"
                      >
                        <LuPencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className={`p-2 hover:bg-red-50 rounded-lg transition-colors ${TAILWIND_COLORS.ERROR}`}
                        title="Delete member"
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <EditTeamMemberModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        member={editingMember}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default TeamManagement;
