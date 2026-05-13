import React, { useState, useEffect, useCallback } from "react";
import { COLORS, TAILWIND_COLORS } from "../../../../shared/WebConstant";
import Button from "../../../../shared/components/Button.jsx";
import { getMethod, putMethod } from '../../../../service/api';
import apiService from '../../services/serviceUrl';
import Swal from 'sweetalert2';

// ========= Toggle (kept as a separate component) =========
const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center justify-between gap-3 select-none">
    {label ? <span className="text-text-muted">{label}</span> : null}
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-[var(--color-secondary)]" : "bg-slate-300",
        "focus:outline-none focus:ring-4 focus:ring-sky-100",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
          checked ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  </label>
);

// AI Resume Feedback Card Component
const AIResumeFeedbackCard = ({ settings, onSettingsChange, onUpdateSettings, savingSettings }) => {
  const responseOptions = [
    { value: "", label: "select response time" },
    { value: "instant", label: "Instant (beta)" },
    { value: "1h", label: "Within 1 hour" },
    { value: "6h", label: "Within 6 hours" },
    { value: "24h", label: "Within 24 hours" },
  ];

  const handleSubmit = () => onUpdateSettings?.(settings);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
          <svg className="w-3 h-3 text-[var(--color-secondary)]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-text-primary">AI Resume Feedback (Future Integration)</h2>
      </div>
      <p className="text-sm text-text-muted mb-6">Configure LLM-powered resume analysis and feedback system</p>
      
      {/* Coming soon banner */}
      <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
        <p className="font-bold text-[var(--color-secondary)]">Coming soon</p>
        <p className="text-sm text-[var(--color-secondary)] mt-1">
          This feature will integrate with large language models to provide automated resume feedback and suggestions to job seekers.
        </p>
      </div>

      {/* Body */}
      <div className="space-y-6 flex-1">
        {/* Feedback Categories */}
        <div className="md:w-[50%] lg:md:w-[40%]">
          <h3 className="font-bold text-text-primary mb-4">Feedback Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Toggle
                label="Email Notifications"
                checked={settings.emailNotifications}
                onChange={(v) =>
                  onSettingsChange({ ...settings, emailNotifications: v })
                }
              />
              <Toggle
                label="Push Notifications"
                checked={settings.pushNotifications}
                onChange={(v) =>
                  onSettingsChange({ ...settings, pushNotifications: v })
                }
              />
            </div>
            <div className="space-y-3">
              <Toggle
                label="Content Quality"
                checked={settings.contentQuality}
                onChange={(v) =>
                  onSettingsChange({ ...settings, contentQuality: v })
                }
              />
              <Toggle
                label="Grammar & Language"
                checked={settings.grammarLanguage}
                onChange={(v) =>
                  onSettingsChange({ ...settings, grammarLanguage: v })
                }
              />
            </div>
          </div>
        </div>

        {/* Response time */}
        <div className="md:w-[50%] lg:md:w-[40%]">
          <h3 className="font-bold text-text-primary mb-4">Response Time Target</h3>
          <div className="relative">
            <select
              value={settings.responseTime}
              onChange={(e) =>
                onSettingsChange({ ...settings, responseTime: e.target.value })
              }
              className="w-full h-12 px-4 py-3 border border-[var(--color-secondary)] rounded-lg focus:outline-none appearance-none bg-white pr-9 text-sm"
              style={{ color: settings.responseTime ? 'var(--color-secondary)' : 'var(--color-secondary)' }}
            >
              {responseOptions.map((o) => (
                <option key={o.value} value={o.value} disabled={o.value === ""}>
                  {o.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-[var(--color-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Configure Button */}
        <div className="">
          <Button
            onClick={handleSubmit}
            variant="primary"
            size="md"
            className="font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-30"
            disabled={savingSettings}
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            {savingSettings ? 'Saving...' : 'Configure LLM Integration'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ========= Page wrapper (kept exactly like your structure) =========
const ResumeFeedback = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    contentQuality: true,
    grammarLanguage: true,
    responseTime: "",
  });

  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch resume feedback settings
  const fetchResumeFeedbackSettings = useCallback(async () => {
    try {
      const response = await getMethod({
        apiUrl: apiService.getAlertSettings,
        params: { type: 'resume_feedback' }
      })

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      if (isSuccess) {
        let settingsData = response?.settings || response?.data?.settings || response?.data

        if (settingsData) {
          setSettings({
            emailNotifications: settingsData.email_notifications !== false && settingsData.emailNotifications !== false,
            pushNotifications: settingsData.push_notifications !== false && settingsData.pushNotifications !== false,
            contentQuality: settingsData.content_quality !== false && settingsData.contentQuality !== false,
            grammarLanguage: settingsData.grammar_language !== false && settingsData.grammarLanguage !== false,
            responseTime: settingsData.response_time || settingsData.responseTime || ""
          })
        }
      }
    } catch (error) {
      // If no settings found, use defaults (already set in useState)
    }
  }, [])

  useEffect(() => {
    fetchResumeFeedbackSettings()
  }, [fetchResumeFeedbackSettings])

  const handleSettingsChange = (newSettings) => setSettings(newSettings);

  const handleUpdateSettings = async (updatedSettings) => {
    try {
      setSavingSettings(true)

      // Map UI fields to API format
      const settingsObject = {
        email_notifications: updatedSettings.emailNotifications === true,
        push_notifications: updatedSettings.pushNotifications === true,
        content_quality: updatedSettings.contentQuality === true,
        grammar_language: updatedSettings.grammarLanguage === true,
        response_time: updatedSettings.responseTime || "",
        // Also include UI fields for backward compatibility
        emailNotifications: updatedSettings.emailNotifications,
        pushNotifications: updatedSettings.pushNotifications,
        contentQuality: updatedSettings.contentQuality,
        grammarLanguage: updatedSettings.grammarLanguage,
        responseTime: updatedSettings.responseTime
      }

      const response = await putMethod({
        apiUrl: apiService.updateAlertSettings,
        payload: {
          type: 'resume_feedback',
          settings: settingsObject
        }
      })

      const isSuccess = response?.status === true || response?.status === 'success' || response?.success === true

      if (isSuccess) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: response?.message || 'Resume feedback settings updated successfully',
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        throw new Error(response?.message || 'Failed to update settings')
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Failed to update resume feedback settings. Please try again.',
        confirmButtonText: 'OK'
      })
    } finally {
      setSavingSettings(false)
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <AIResumeFeedbackCard
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onUpdateSettings={handleUpdateSettings}
        savingSettings={savingSettings}
      />
    </div>
  );
};

export default ResumeFeedback;
