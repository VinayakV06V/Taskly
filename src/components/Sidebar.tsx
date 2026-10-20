import React from 'react';
import { 
  LayoutGrid, 
  CheckSquare, 
  Columns3, 
  Repeat, 
  BarChart2, 
  AlertCircle, 
  User as UserIcon, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { ViewTab, User } from '../types';
import { TasklyLogo } from './TasklyLogo';
import { WebsiteCustomizationSettings } from './SettingsModal';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  user: User | null;
  overdueCount: number;
  settings?: WebsiteCustomizationSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenProfile,
  onOpenSettings,
  onLogout,
  user,
  overdueCount,
  settings,
}) => {
  const projectNavItems: Array<{
    id: ViewTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'kanban', label: 'Explore', icon: Columns3 },
    { id: 'habits', label: 'Projects & Habits', icon: Repeat },
  ];

  const settingsNavItems: Array<{
    id: ViewTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: 'analytics', label: 'Charts & Stats', icon: BarChart2 },
    { id: 'alerts', label: 'Alerts', icon: AlertCircle, badge: overdueCount > 0 ? overdueCount : undefined, badgeColor: 'bg-rose-500' },
  ];

  return (
    <aside className="w-64 lg:w-72 shrink-0 bg-white border-r border-slate-200/70 p-5 flex flex-col justify-between h-screen sticky top-0 overflow-y-auto z-30">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="pt-1 pb-2">
          <TasklyLogo size="md" theme="light" />
        </div>

        {/* Profile Card (Matches Reference Image AR Shakir Block) */}
        <button
          onClick={onOpenProfile}
          title="Click to view profile and customize avatars"
          className="w-full flex flex-col items-center text-center p-3 rounded-2xl hover:bg-[#FAF7F2] transition-colors btn-press cursor-pointer group"
        >
          {/* Avatar with Warm Orange Ring Border */}
          <div className="relative mb-2.5">
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#FF7A00] to-[#FFA751] shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 border-2 border-white">
                <img
                  src={user?.avatarUrl || '/src/assets/images/user_avatar_1792407645930.jpg'}
                  alt={user?.name || 'User'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/src/assets/images/user_avatar_1792407645930.jpg';
                  }}
                />
              </div>
            </div>

            {/* Online Status Pill */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-slate-200/80 shadow-2xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                Online
              </span>
            </div>
          </div>

          <div className="mt-1">
            <h3 className="text-sm font-extrabold text-slate-900 font-['Outfit',sans-serif] group-hover:text-[#FF7243] transition-colors">
              {user?.name || 'Jay Varshney'}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">
              {user?.email || 'hi@taskly.io'}
            </p>
          </div>
        </button>

        {/* Section 1: PROJECTS & TASKS */}
        <div>
          <span className="block px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 font-mono">
            PROJECTS &amp; TASKS
          </span>
          <nav className="space-y-1">
            {projectNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all btn-press cursor-pointer font-['Outfit',sans-serif] ${
                    isActive
                      ? 'bg-[#FAF3EB] text-[#FF7243] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF7243]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full text-white bg-[#FF7243] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 2: PROFILE & SETTINGS */}
        <div>
          <span className="block px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 font-mono">
            PROFILE &amp; SETTINGS
          </span>
          <nav className="space-y-1">
            {settingsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all btn-press cursor-pointer font-['Outfit',sans-serif] ${
                    isActive
                      ? 'bg-[#FAF3EB] text-[#FF7243] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF7243]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full text-white font-bold ${item.badgeColor || 'bg-rose-500'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={onOpenProfile}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all btn-press cursor-pointer font-['Outfit',sans-serif]"
            >
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span>Profile</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all btn-press cursor-pointer font-['Outfit',sans-serif]"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Logout */}
      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50/70 rounded-2xl transition-colors btn-press cursor-pointer font-['Outfit',sans-serif]"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
