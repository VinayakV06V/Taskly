import React from 'react';
import { Plus, User as UserIcon } from 'lucide-react';
import { ViewTab, User } from '../types';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenNewTaskModal: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  user: User | null;
  overdueCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTaskModal,
  onOpenProfile,
  onOpenAuth,
  user,
  overdueCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-mono font-bold text-white shadow-sm">
            TP
          </div>
          <button
            onClick={() => onSelectTab('tasks')}
            className="text-lg font-bold tracking-tight text-white hover:text-indigo-300 transition-colors whitespace-nowrap shrink-0 focus:outline-none cursor-pointer"
          >
            TaskPulse
          </button>
        </div>

        {/* Zone 2: Navigation Links (Pure production task/habit links - NO Java OOP tab) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('tasks')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
              currentTab === 'tasks'
                ? 'text-white border-indigo-500'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Task Board
          </button>

          <button
            onClick={() => onSelectTab('habits')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
              currentTab === 'habits'
                ? 'text-white border-indigo-500'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Recurring Habits
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
              currentTab === 'analytics'
                ? 'text-white border-indigo-500'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Completion Statistics
          </button>

          <button
            onClick={() => onSelectTab('alerts')}
            className={`relative flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
              currentTab === 'alerts'
                ? 'text-white border-rose-500'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <span>Overdue Alerts</span>
            {overdueCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-mono font-semibold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                {overdueCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>

          {user ? (
            <button
              onClick={onOpenProfile}
              title="Open User Profile"
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700/80 focus:outline-none"
            >
              <div className="h-7 w-7 rounded-full overflow-hidden bg-slate-900 shrink-0">
                <img
                  src={user.avatarUrl || '/src/assets/images/user_avatar_1792407645930.jpg'}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="hidden lg:inline text-xs font-medium text-slate-200 pr-2">
                {user.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-800/60 gap-4 text-xs font-medium text-slate-400 no-scrollbar">
        <button
          onClick={() => onSelectTab('tasks')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'tasks' ? 'text-white font-semibold' : ''}`}
        >
          Tasks
        </button>
        <button
          onClick={() => onSelectTab('habits')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'habits' ? 'text-white font-semibold' : ''}`}
        >
          Habits
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`whitespace-nowrap shrink-0 ${currentTab === 'analytics' ? 'text-white font-semibold' : ''}`}
        >
          Statistics
        </button>
        <button
          onClick={() => onSelectTab('alerts')}
          className={`whitespace-nowrap shrink-0 flex items-center gap-1 ${currentTab === 'alerts' ? 'text-rose-400 font-semibold' : ''}`}
        >
          Alerts {overdueCount > 0 && `(${overdueCount})`}
        </button>
      </div>
    </header>
  );
};
