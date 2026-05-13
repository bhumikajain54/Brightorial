import React, { useState } from 'react';
import {
  LuArrowUpRight,
  LuUpload,
  LuMonitor,
  LuArrowLeft,
} from 'react-icons/lu';
import { TAILWIND_COLORS, COLORS } from '../../../../shared/WebConstant.js';
import { PrimaryButton, BackToOverviewButton } from '../../../../shared/components/Button';
import { Horizontal4Cards } from '../../../../shared/components/metricCard';

export default function AppVersionMonitor() {
  const [autoUpdates, setAutoUpdates] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [fileUsage] = useState(78); // percent

  const metrics = [
    {
      title: "Main Logo",
      value: "200 x 60px",
      icon: <LuUpload className="h-5 w-5" />,
    },
    {
      title: "Current Version",
      value: "V2.1.4",
      icon: <LuArrowUpRight className="h-5 w-5" />,
    },
    {
      title: "Active Users",
      value: "1,234",
      icon: <LuArrowUpRight className="h-5 w-5" />,
    },
    {
      title: "Uptime",
      value: "99.9%",
      icon: <LuArrowUpRight className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header Section */}
      <div className="flex items-start bg-white p-4 border border-[var(--color-primary)2c] rounded-lg justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
            <LuMonitor className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>App Version Monitor</h2>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>System health & updates</p>
          </div>
        </div>

        {/* Back to overview button */}
        <BackToOverviewButton
          onClick={() => window.history.back()}
        />
      </div>

      {/* Metrics Cards */}
      <Horizontal4Cards data={metrics} />

      {/* System Health & Update Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>System Health</h3>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Real-time system monitoring</p>
          </div>

          <div className="space-y-4">
            <HealthRow label="Database" status="Healthy" />
            <HealthRow label="API Services" status="Operational" />
            <HealthRow label="Cache layer" status="Optimal" />

            {/* File storage with progress */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>File Storage</span>
                <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1">
                  {fileUsage}% Used
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${fileUsage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Update Management */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Update Management</h3>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>System updates and maintenance</p>
          </div>

          <div className="space-y-4">
            <SettingTile
              title="Automatic Updates"
              subtitle="Enable automatic system updates"
              active={autoUpdates}
              onClick={() => setAutoUpdates((v) => !v)}
            />
            <SettingTile
              title="Maintenance Mode"
              subtitle="Enable maintenance mode for updates"
              active={maintenance}
              onClick={() => setMaintenance((v) => !v)}
            />
          </div>

          <PrimaryButton
            className="w-full mt-6"
            fullWidth
          >
            Check for Updates
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small components ---------- */

function HealthRow({ label, status, tone = "emerald" }) {
  const tones = {
    emerald: {
      pillBg: "bg-emerald-100",
      pillText: "text-emerald-800",
      border: "border-slate-200",
    },
  };

  const t = tones[tone];

  return (
    <div
      className={`rounded-xl border ${t.border} bg-white px-4 py-2.5 flex items-center justify-between`}
    >
      <span className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{label}</span>
      <span
        className={`inline-flex items-center rounded-full ${t.pillBg} ${t.pillText} text-xs font-semibold px-2.5 py-1`}
      >
        {status}
      </span>
    </div>
  );
}

function SettingTile({ title, subtitle, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border px-4 py-3 transition
        ${active ? "bg-emerald-50 border-emerald-300" : "bg-white border-slate-200 hover:bg-slate-50"}`}
    >
      <p className={`font-medium ${active ? "text-emerald-700" : TAILWIND_COLORS.TEXT_PRIMARY}`}>
        {title}
      </p>
      <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>{subtitle}</p>
    </button>
  );
}
