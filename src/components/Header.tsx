import React from 'react';
import { Search, Plus, Bell, Menu } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  search: string;
  onSearchChange: (val: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenProfile: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  search,
  onSearchChange,
  onOpenNewTaskModal,
  onOpenProfile,
  onOpenMobileMenu,
}) => {
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <header className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Greeting & Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-700 btn-press cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                Welcome back, {firstName}
              </h1>
              <p className="text-xs font-medium text-slate-400 mt-0.5 font-['Plus_Jakarta_Sans',sans-serif]">
                {todayFormatted}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-auto w-full">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search your tasks, projects, or categories..."
              className="w-full bg-white border border-slate-200/80 focus:border-[#FF5E5E] focus:ring-2 focus:ring-[#FF5E5E]/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Right: Team Stack, Profile Avatar, Notifications & Add Button */}
        <div className="flex items-center gap-2.5 shrink-0 justify-end">
          {/* Team Avatar Stack */}
          <div className="hidden lg:flex items-center -space-x-2 mr-1">
            <div className="w-7 h-7 rounded-full border-2 border-white overflow-hidden shadow-xs bg-amber-200">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" alt="team" className="w-full h-full object-cover" />
            </div>
            <div className="w-7 h-7 rounded-full border-2 border-white overflow-hidden shadow-xs bg-indigo-200">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces" alt="team" className="w-full h-full object-cover" />
            </div>
            <div className="w-7 h-7 rounded-full border-2 border-white overflow-hidden shadow-xs bg-rose-200">
              <img src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=faces" alt="team" className="w-full h-full object-cover" />
            </div>
            <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-900 text-[10px] font-bold text-white flex items-center justify-center shadow-xs">
              +4
            </div>
          </div>

          {/* User Profile Avatar shortcut */}
          <button
            onClick={onOpenProfile}
            title="Profile & Avatar Settings"
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#FF5E5E] shadow-sm btn-press cursor-pointer relative shrink-0"
          >
            <img
              src={user?.avatarUrl || '/src/assets/images/user_avatar_1792407645930.jpg'}
              alt={user?.name || 'User'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/user_avatar_1792407645930.jpg';
              }}
            />
          </button>

          {/* Notifications Button */}
          <button
            className="w-9 h-9 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 flex items-center justify-center btn-press shadow-sm cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF5E5E]" />
          </button>

          {/* Primary Add Task Button in Coral */}
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#FF5E5E] hover:bg-[#FF4545] shadow-md shadow-[#FF5E5E]/25 btn-press cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
