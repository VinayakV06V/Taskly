import React, { useState } from 'react';
import { Search, Plus, Bell, Menu, SlidersHorizontal, Sliders } from 'lucide-react';
import { User, AppNotification } from '../types';
import { NotificationPopover } from './NotificationPopover';
import { WebsiteCustomizationSettings } from './SettingsModal';

interface HeaderProps {
  user: User | null;
  search: string;
  onSearchChange: (val: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenProfile: () => void;
  onOpenSettings?: () => void;
  onOpenMobileMenu: () => void;
  notifications: AppNotification[];
  onMarkAllNotificationsRead: () => void;
  onClearNotifications: () => void;
  onSendTestNotification: () => void;
  onDismissNotification: (id: string) => void;
  settings?: WebsiteCustomizationSettings;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  search,
  onSearchChange,
  onOpenNewTaskModal,
  onOpenProfile,
  onOpenSettings,
  onOpenMobileMenu,
  notifications,
  onMarkAllNotificationsRead,
  onClearNotifications,
  onSendTestNotification,
  onDismissNotification,
  settings,
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger & Welcome Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 shadow-xs btn-press cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-['Outfit',sans-serif]">
              Welcome to <span className="text-slate-900">Task<span className="text-[#65B741]">ly</span></span>.
            </h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5 font-['Outfit',sans-serif]">
              Hello {user?.name ? user.name.split(' ')[0] : 'there'}, welcome back!
            </p>
          </div>
        </div>

        {/* Center: Search Bar with Pill shape and Filter Sliders */}
        <div className="hidden sm:flex flex-1 max-w-sm mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Dashboard & Tasks..."
              className="w-full bg-white border border-slate-200/80 focus:border-[#FF7243] focus:ring-2 focus:ring-[#FF7243]/15 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-xs font-medium"
            />
            <button
              onClick={onOpenSettings}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Customize Website Elements & Settings"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Action Icons: Add Task, Messages, Bell Button, User Avatar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Primary Add Task Button in Warm Coral */}
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#FF7243] hover:bg-[#FF5D29] shadow-md shadow-orange-500/20 btn-press cursor-pointer whitespace-nowrap font-['Outfit',sans-serif]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>

          {/* Quick Notification Bell (Shown on small screens / Header with NO prior notification) */}
          <div className="relative xl:hidden">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`w-10 h-10 rounded-2xl bg-white border shadow-xs flex items-center justify-center transition-all btn-press cursor-pointer relative ${
                isNotificationOpen
                  ? 'border-[#FF7243] text-[#FF7243]'
                  : 'border-slate-200/80 text-slate-600 hover:text-slate-900'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />

              {/* ONLY rendered when real unread notifications exist! NO prior notification dot! */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-[#FF7243] text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in">
                  {unreadCount}
                </span>
              )}
            </button>

            <NotificationPopover
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              notifications={notifications}
              onMarkAllAsRead={onMarkAllNotificationsRead}
              onClearAll={onClearNotifications}
              onSendTestNotification={onSendTestNotification}
              onDismissNotification={onDismissNotification}
            />
          </div>

          {/* User Profile Avatar with Orange Ring Border (Shown on small screens / Header) */}
          <button
            onClick={onOpenProfile}
            title="Profile & Settings"
            className="xl:hidden w-10 h-10 rounded-2xl p-0.5 bg-[#FF7A00] shadow-sm btn-press cursor-pointer relative overflow-hidden group shrink-0"
          >
            <div className="w-full h-full rounded-[14px] overflow-hidden bg-white">
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
          </button>
        </div>
      </div>
    </header>
  );
};
