import React from 'react';
import { 
  LayoutGrid, 
  AlertCircle, 
  CheckSquare, 
  Columns3, 
  Repeat, 
  BarChart2, 
  Settings, 
  LogOut
} from 'lucide-react';
import { ViewTab, User } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  user: User | null;
  overdueCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenProfile,
  onLogout,
  user,
  overdueCount,
}) => {
  const navItems: Array<{
    id: ViewTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
    { id: 'kanban', label: 'Kanban Board', icon: Columns3 },
    { id: 'habits', label: 'Recurring Habits', icon: Repeat },
    { id: 'alerts', label: 'Vital Tasks', icon: AlertCircle, badge: overdueCount > 0 ? overdueCount : undefined, badgeColor: 'bg-rose-500' },
    { id: 'analytics', label: 'Analytics & Stats', icon: BarChart2 },
  ];

  return (
    <aside className="w-64 lg:w-72 shrink-0 p-3 sm:p-4 hidden md:flex flex-col h-screen sticky top-0">
      <div className="w-full h-full bg-[#0D0E15] rounded-3xl p-5 flex flex-col justify-between shadow-2xl border border-slate-800/60 overflow-hidden">
        {/* Top: Logo & User Identity */}
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-[#FF5E5E] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#FF5E5E]/30">
              TP
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
              Task<span className="text-[#FF5E5E]">Pulse</span>
            </span>
          </div>

          {/* User Profile Card */}
          <button
            onClick={onOpenProfile}
            title="Click to view profile, change photo & avatars"
            className="w-full mb-6 p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-200 flex items-center gap-3 text-left btn-press group cursor-pointer"
          >
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#FF5E5E] shadow-sm bg-slate-900">
                <img
                  src={user?.avatarUrl || '/src/assets/images/user_avatar_1792407645930.jpg'}
                  alt={user?.name || 'User'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/src/assets/images/user_avatar_1792407645930.jpg';
                  }}
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0D0E15]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate group-hover:text-[#FF5E5E] transition-colors font-['Outfit',sans-serif]">
                {user?.name || 'Workspace User'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {user?.email || 'user@taskpulse.io'}
              </div>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold btn-press transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-md shadow-black/20 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF5E5E]' : 'text-slate-400'}`} />
                    <span className="font-['Outfit',sans-serif] tracking-tight">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full text-white font-bold ${item.badgeColor || 'bg-[#FF5E5E]'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Profile Settings & Logout */}
        <div className="pt-4 border-t border-slate-800/80 space-y-1">
          <button
            onClick={onOpenProfile}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-colors btn-press cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Profile &amp; Avatar</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-2xl transition-colors btn-press cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
