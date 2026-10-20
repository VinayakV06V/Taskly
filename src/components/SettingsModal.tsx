import React, { useState, useEffect } from 'react';
import { X, Check, Sliders, Palette, Layout, Bell, Sparkles, RefreshCw } from 'lucide-react';

export interface WebsiteCustomizationSettings {
  backgroundColor: string;
  accentColor: string;
  showClockWidget: boolean;
  showStatsCards: boolean;
  showCalendarWidget: boolean;
  showCompletedTasks: boolean;
  enableConfetti: boolean;
  enableAlarmAudio: boolean;
  workspaceName: string;
}

export const DEFAULT_CUSTOM_SETTINGS: WebsiteCustomizationSettings = {
  backgroundColor: '#F4EFEA',
  accentColor: '#FF7243',
  showClockWidget: true,
  showStatsCards: true,
  showCalendarWidget: true,
  showCompletedTasks: true,
  enableConfetti: true,
  enableAlarmAudio: true,
  workspaceName: 'Taskly',
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WebsiteCustomizationSettings;
  onSaveSettings: (newSettings: WebsiteCustomizationSettings) => void;
}

const BG_THEMES = [
  { id: 'cream', name: 'Warm Parchment (Default)', value: '#F4EFEA' },
  { id: 'white', name: 'Clean Studio White', value: '#FFFFFF' },
  { id: 'soft-cream', name: 'Minimalist Cream', value: '#FAF7F2' },
  { id: 'cool-gray', name: 'Soft Cool Gray', value: '#F1F5F9' },
];

const ACCENT_COLORS = [
  { id: 'coral', name: 'Taskly Coral', value: '#FF7243' },
  { id: 'emerald', name: 'Emerald Growth', value: '#10B981' },
  { id: 'indigo', name: 'Royal Indigo', value: '#4F46E5' },
  { id: 'teal', name: 'Modern Teal', value: '#0D9488' },
  { id: 'purple', name: 'Amethyst Purple', value: '#8B5CF6' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<WebsiteCustomizationSettings>(settings);
  const [activeTab, setActiveTab] = useState<'elements' | 'theme' | 'preferences'>('elements');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state whenever settings prop updates
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof WebsiteCustomizationSettings) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_CUSTOM_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden relative border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF7F2] border-b border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: localSettings.accentColor }}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                Website Customization &amp; Settings
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Tailor layout elements, theme colors, and widget options
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-[#FAF7F2] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('elements')}
            className={`pb-3 px-3 text-xs font-bold font-['Outfit',sans-serif] border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'elements'
                ? 'border-orange-500 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Website Elements</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`pb-3 px-3 text-xs font-bold font-['Outfit',sans-serif] border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'theme'
                ? 'border-orange-500 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Color &amp; Themes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`pb-3 px-3 text-xs font-bold font-['Outfit',sans-serif] border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preferences'
                ? 'border-orange-500 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: Website Elements Visibility */}
          {activeTab === 'elements' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 font-medium">
                Choose which components and widgets appear on your dashboard:
              </div>

              <div className="space-y-3">
                {/* Clock & Reminder Widget */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-slate-200/60 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                      Clock &amp; Alarm Reminders Widget
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Real-time digital clock with custom audio alarms and reminder chimes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('showClockWidget')}
                    className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                      localSettings.showClockWidget ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                        localSettings.showClockWidget ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Metric Stat Cards */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-slate-200/60 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                      Pastel Metric Stat Cards
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Planned Today, Finished, and Due This Week metrics (calculated dynamically)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('showStatsCards')}
                    className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                      localSettings.showStatsCards ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                        localSettings.showStatsCards ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Interactive Calendar */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-slate-200/60 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                      Interactive Month Calendar
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Real-time day navigation with task deadlines and date filtering
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('showCalendarWidget')}
                    className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                      localSettings.showCalendarWidget ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                        localSettings.showCalendarWidget ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Completed Tasks Toggle */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-slate-200/60 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                      Completed Tasks Tab
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Allow switching to the Completed tasks tab to review finished deliverables
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('showCompletedTasks')}
                    className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                      localSettings.showCompletedTasks ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                        localSettings.showCompletedTasks ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Themes & Accent Colors */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              {/* Background Theme */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 font-['Outfit',sans-serif]">
                  Workspace Background Theme
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {BG_THEMES.map((theme) => {
                    const isSelected = localSettings.backgroundColor === theme.value;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setLocalSettings((p) => ({ ...p, backgroundColor: theme.value }))}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/30 ring-2 ring-orange-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-5 h-5 rounded-full border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: theme.value }}
                          />
                          <span className="text-xs font-bold text-slate-800">
                            {theme.name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-orange-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 font-['Outfit',sans-serif]">
                  Brand Accent Color
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {ACCENT_COLORS.map((accent) => {
                    const isSelected = localSettings.accentColor === accent.value;
                    return (
                      <button
                        key={accent.id}
                        type="button"
                        onClick={() => setLocalSettings((p) => ({ ...p, accentColor: accent.value }))}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/30 ring-2 ring-orange-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-5 h-5 rounded-full shadow-2xs"
                            style={{ backgroundColor: accent.value }}
                          />
                          <span className="text-xs font-bold text-slate-800">
                            {accent.name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-orange-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 font-['Outfit',sans-serif]">
                  Workspace Title
                </label>
                <input
                  type="text"
                  value={localSettings.workspaceName}
                  onChange={(e) => setLocalSettings((p) => ({ ...p, workspaceName: e.target.value }))}
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-slate-200/60 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                      Celebration Confetti
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Burst cheerful confetti when checking off completed tasks
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('enableConfetti')}
                    className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                      localSettings.enableConfetti ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                        localSettings.enableConfetti ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-slate-200/60 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                      Alarm Audio Chimes
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Play audible rising tone synthesizers when reminders and alarms go off
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('enableAlarmAudio')}
                    className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                      localSettings.enableAlarmAudio ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                        localSettings.enableAlarmAudio ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#FAF7F2] border-t border-slate-200/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              className="px-5 py-2 text-xs font-bold text-white rounded-full shadow-md transition-all btn-press cursor-pointer flex items-center gap-1.5"
              style={{ backgroundColor: localSettings.accentColor }}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
