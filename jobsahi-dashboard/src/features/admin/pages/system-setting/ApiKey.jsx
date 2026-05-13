import React, { useState } from 'react';
import { LuKey, LuRefreshCw } from 'react-icons/lu';
import { TAILWIND_COLORS, COLORS } from '../../../../shared/WebConstant.js';
import { PrimaryButton, BackToOverviewButton, OutlineButton } from '../../../../shared/components/Button';

/* Small reusable toggle */
const ToggleSwitch = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
      checked ? "" : "bg-slate-300"
    }`}
    style={{
      backgroundColor: checked ? COLORS?.GREEN_PRIMARY || 'var(--color-secondary)' : undefined
    }}
    aria-pressed={checked}
    type="button"
  >
    <span
      className={`inline-block h-[14px] w-[14px] transform rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-4" : "translate-x-1"
      }`}
    />
  </button>
);

/* Status pill that can toggle active state */
const StatusPill = ({ active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-200 ${
      active
        ? "text-white border-[var(--color-secondary)]"
        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
    }`}
    style={{
      backgroundColor: active ? 'var(--color-secondary)' : undefined
    }}
    type="button"
  >
    {active ? "Active" : "Inactive"}
  </button>
);

export default function ApiKeyWebhookControl() {
  const [apiKey, setApiKey] = useState("************************");
  const [apiKeyActive, setApiKeyActive] = useState(true);
  const [lastUsed, setLastUsed] = useState("2 hours ago");

  const [webhookSecret, setWebhookSecret] = useState("********************");
  const [secretActive, setSecretActive] = useState(true);
  const [createdAt] = useState("Jan 15, 25");

  const [webhookUrl, setWebhookUrl] = useState(
    "https://jobsahiapp.com/webhooks"
  );

  const [events, setEvents] = useState({
    jobCreated: true,
    applicationReceived: true,
    userRegistered: false,
    paymentProcessed: true,
  });

  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false);

  const regenerate = (len = 20) =>
    Array.from(crypto.getRandomValues(new Uint8Array(len)))
      .map((b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36])
      .join("");

  const handleRegenerateApi = () => {
    setApiKey("*".repeat(24));
    setLastUsed("just now");
  };

  const handleRegenerateSecret = () => {
    setWebhookSecret("*".repeat(20));
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header Section */}
      <div className="flex items-start bg-white p-4 border border-[var(--color-primary)2c] rounded-lg justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
            <LuKey className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>API Key & Webhook Control</h2>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Integration controls</p>
          </div>
        </div>

        {/* Back to overview button */}
        <BackToOverviewButton
          onClick={() => window.history.back()}
        />
      </div>

      {/* API Key Management & Webhook Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Key Management */}
          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>API Key Management</h3>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Manage API keys for third-party integrations</p>
            </div>

            {/* Application Name */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Application Name</label>
              <div className="flex items-center gap-3">
                <input
                  value={apiKey}
                  disabled
                  className={`flex-1 h-12 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY} text-sm`}
                />
                <div className="flex flex-col items-end gap-2">
                  <StatusPill
                    active={apiKeyActive}
                    onClick={() => setApiKeyActive((v) => !v)}
                  />
                  <OutlineButton
                    onClick={handleRegenerateApi}
                    size="sm"
                    className="h-8 px-3 text-xs"
                    icon={<LuRefreshCw className="h-3 w-3" />}
                  >
                    Regenerate
                  </OutlineButton>
                </div>
              </div>
              <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>Last used: {lastUsed}</p>
            </div>

            {/* Webhook Secret */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Webhook Secret</label>
              <div className="flex items-center gap-3">
                <input
                  value={webhookSecret}
                  disabled
                  className={`flex-1 h-12 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${TAILWIND_COLORS.TEXT_PRIMARY} text-sm`}
                />
                <div className="flex flex-col items-end gap-2">
                  <StatusPill
                    active={secretActive}
                    onClick={() => setSecretActive((v) => !v)}
                  />
                  <OutlineButton
                    onClick={handleRegenerateSecret}
                    size="sm"
                    className="h-8 px-3 text-xs"
                    icon={<LuRefreshCw className="h-3 w-3" />}
                  >
                    Regenerate
                  </OutlineButton>
                </div>
              </div>
              <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>Created: {createdAt}</p>
            </div>
          </div>

          {/* Webhook Configuration */}
          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Webhook Configuration</h3>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Configure webhook endpoints</p>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>webhook url</label>
              <input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className={`w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${TAILWIND_COLORS.TEXT_PRIMARY} text-sm`}
                placeholder="https://jobsahiapp.com/webhooks"
              />
            </div>

            <div className="space-y-4">
              <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Events to Subscribe</p>
              <div className="space-y-3">
                {[
                  ["Job created", "jobCreated"],
                  ["Application Received", "applicationReceived"],
                  ["User Registered", "userRegistered"],
                  ["Payment Processed", "paymentProcessed"],
                ].map(([label, key]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                  >
                    <span className={`text-sm ${TAILWIND_COLORS.TEXT_PRIMARY}`}>{label}</span>
                    <ToggleSwitch
                      checked={events[key]}
                      onChange={(v) =>
                        setEvents((prev) => ({ ...prev, [key]: v }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className={`text-lg font-semibold ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Security Settings</h3>
            <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>Configure API security and access controls</p>
          </div>

        </div>

        <div className="space-y-4">
          {/* Rate Limiting */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Rate Limiting</p>
              <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>1000 requests/hour</p>
            </div>
            <ToggleSwitch
              checked={rateLimitEnabled}
              onChange={setRateLimitEnabled}
            />
          </div>

          {/* IP Whitelisting */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>IP Whitelisting</p>
              <p className={`text-xs ${TAILWIND_COLORS.TEXT_MUTED}`}>Restrict by IP address</p>
            </div>
            <ToggleSwitch
              checked={ipWhitelistEnabled}
              onChange={setIpWhitelistEnabled}
            />
          </div>

          {/* Allowed origins */}
          <div className="space-y-2">
            <p className={`text-sm font-medium ${TAILWIND_COLORS.TEXT_PRIMARY}`}>Allowed origins</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-1">
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>https://yourdomain.com</p>
              <p className={`text-sm ${TAILWIND_COLORS.TEXT_MUTED}`}>https://app.yourdomain.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
