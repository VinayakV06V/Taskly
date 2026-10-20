import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Bell
} from 'lucide-react';
import { Task, SystemStatistics, User, AppNotification } from '../types';
import { NotificationPopover } from './NotificationPopover';
import { ClockAlarmWidget, UserAlarm } from './ClockAlarmWidget';
import { WebsiteCustomizationSettings } from './SettingsModal';

interface RightPanelProps {
  user: User | null;
  tasks: Task[];
  stats: SystemStatistics | null;
  notifications: AppNotification[];
  onMarkAllNotificationsRead: () => void;
  onClearNotifications: () => void;
  onSendTestNotification: () => void;
  onDismissNotification: (id: string) => void;
  onOpenProfile: () => void;
  onSelectDateFilter?: (dateStr: string | null) => void;
  selectedDateFilter?: string | null;
  onAlarmTriggered?: (alarm: UserAlarm) => void;
  settings?: WebsiteCustomizationSettings;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  user,
  tasks,
  stats,
  notifications,
  onMarkAllNotificationsRead,
  onClearNotifications,
  onSendTestNotification,
  onDismissNotification,
  onOpenProfile,
  onSelectDateFilter,
  selectedDateFilter,
  onAlarmTriggered = () => {},
  settings,
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Real-time current date in user's local timezone
  const [calendarViewDate, setCalendarViewDate] = useState(() => new Date());

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Real-time local date calculation (NEVER use toISOString for local date matching!)
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  const pad = (n: number) => String(n).padStart(2, '0');
  const todayDateKey = `${todayYear}-${pad(todayMonth + 1)}-${pad(todayDate)}`;

  // Calendar calculations based on calendarViewDate
  const viewYear = calendarViewDate.getFullYear();
  const viewMonth = calendarViewDate.getMonth();
  const monthName = calendarViewDate.toLocaleString('default', { month: 'long' });

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sun
  // Monday-indexed shift (0=Mon, 6=Sun)
  const mondayShift = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays: Array<{ day: number; isCurrentMonth: boolean; dateKey: string }> = [];

  // Prev month padding
  for (let i = mondayShift - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = viewMonth === 0 ? 12 : viewMonth;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    calendarDays.push({ day: d, isCurrentMonth: false, dateKey: `${y}-${pad(m)}-${pad(d)}` });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      day: d,
      isCurrentMonth: true,
      dateKey: `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`,
    });
  }

  // Next month padding to fill out the grid
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 1 : viewMonth + 2;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    calendarDays.push({ day: d, isCurrentMonth: false, dateKey: `${y}-${pad(m)}-${pad(d)}` });
  }

  // Dynamic metrics calculation strictly from real user tasks (ZERO hardcoded fallback data!)
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  // Tasks due today or overdue
  const dueTodayTasks = tasks.filter((t) => {
    if (t.isCompleted) return false;
    const taskDate = t.deadline ? t.deadline.split('T')[0] : '';
    return taskDate === todayDateKey;
  });

  const overdueTasks = tasks.filter((t) => {
    if (t.isCompleted) return false;
    const taskTime = new Date(t.deadline).getTime();
    return taskTime < Date.now();
  });

  const newTodayTasks = tasks.filter((t) => {
    const createdDate = t.createdAt ? t.createdAt.split('T')[0] : '';
    return createdDate === todayDateKey;
  });

  // Calculate tasks due in current week
  const startOfWeek = new Date(todayYear, todayMonth, todayDate - ((now.getDay() + 6) % 7));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const dueThisWeekTasks = tasks.filter((t) => {
    if (!t.deadline) return false;
    const d = new Date(t.deadline).getTime();
    return d >= startOfWeek.getTime() && d <= endOfWeek.getTime();
  });

  // Dates with tasks
  const taskDatesMap = new Set<string>();
  tasks.forEach((t) => {
    if (t.deadline) {
      taskDatesMap.add(t.deadline.split('T')[0]);
    }
  });

  const accent = settings?.accentColor || '#FF7243';
  const showClock = settings ? settings.showClockWidget : true;
  const showStats = settings ? settings.showStatsCards : true;
  const showCalendar = settings ? settings.showCalendarWidget : true;

  return (
    <div className="w-full xl:w-84 2xl:w-96 flex flex-col gap-5 shrink-0">
      {/* Top Controls Bar: Bell Button & User Avatar (Chat/Message button is removed per Image 3) */}
      <div className="flex items-center justify-end gap-3 relative">
        {/* Bell Button (Only shows badge when notifications exist, NO prior fake notification) */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`w-10 h-10 rounded-2xl bg-white border shadow-xs flex items-center justify-center transition-all btn-press cursor-pointer relative ${
              isNotificationOpen
                ? 'border-orange-500 text-orange-500'
                : 'border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />

            {/* Notification Badge: ONLY rendered when real unread notifications exist! */}
            {unreadNotificationsCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in"
                style={{ backgroundColor: accent }}
              >
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notification Popover */}
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

        {/* User Profile Avatar with Warm Orange Frame */}
        <button
          onClick={onOpenProfile}
          title="Account Profile & Settings"
          className="w-10 h-10 rounded-2xl p-0.5 shadow-sm btn-press cursor-pointer relative overflow-hidden group shrink-0"
          style={{ backgroundColor: accent }}
        >
          <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-100">
            <img
              src={user?.avatarUrl || '/src/assets/images/user_avatar_1792407645930.jpg'}
              alt={user?.name || 'User'}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/user_avatar_1792407645930.jpg';
              }}
            />
          </div>
        </button>
      </div>

      {/* Clock & Reminders Widget (Replaces focus sprint widget from Image 2) */}
      {showClock && (
        <ClockAlarmWidget
          onAlarmTriggered={onAlarmTriggered}
          accentColor={accent}
        />
      )}

      {/* Pastel Metric Stat Cards (Calculated purely from real user data, ZERO fake fallback data!) */}
      {showStats && (
        <div className="grid grid-cols-2 gap-3.5">
          {/* Card 1: Peach / Coral (Planned Today & Breakdown) */}
          <div className="col-span-1 bg-[#FFE8DF] rounded-3xl p-4.5 border border-orange-200/50 flex flex-col justify-between min-h-[140px] shadow-xs">
            <div>
              <div className="text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
                {dueTodayTasks.length + overdueTasks.length}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5 font-['Outfit',sans-serif]">
                Planned Today
              </div>
            </div>

            <div className="text-[10px] text-slate-600 font-medium space-y-0.5 pt-2">
              <div>{overdueTasks.length} Overdue</div>
              <div>{dueTodayTasks.length} Due Today</div>
              <div>{newTodayTasks.length} New Today</div>
            </div>
          </div>

          {/* Right column of cards: Finished & Due This Week */}
          <div className="col-span-1 flex flex-col gap-3.5">
            {/* Card 2: Soft Lilac/Pink (Finished) */}
            <div className="bg-[#FCECF8] rounded-3xl p-4 border border-pink-200/50 flex flex-col justify-between flex-1 shadow-xs">
              <div className="text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
                {completedTasks.length}
              </div>
              <div className="text-xs font-bold text-slate-800 font-['Outfit',sans-serif] leading-tight mt-1">
                Finished
              </div>
            </div>

            {/* Card 3: Mint/Aqua (Due This Week) */}
            <div className="bg-[#DCFAF4] rounded-3xl p-4 border border-teal-200/50 flex flex-col justify-between flex-1 shadow-xs">
              <div className="text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
                {dueThisWeekTasks.length}
              </div>
              <div className="text-xs font-bold text-slate-800 font-['Outfit',sans-serif] leading-tight mt-1">
                Due This Week
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Interactive Calendar Widget */}
      {showCalendar && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs">
          {/* Month Header with < > Controls */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-extrabold text-slate-900 font-['Outfit',sans-serif]">
              {monthName}, {viewYear}
            </h4>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCalendarViewDate(new Date(viewYear, viewMonth - 1, 1))}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors btn-press cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCalendarViewDate(new Date(viewYear, viewMonth + 1, 1))}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors btn-press cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400 mb-2 font-mono">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Calendar Dates Grid */}
          <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
            {calendarDays.map((item, idx) => {
              // Real-time check: day matches current local day, month, and year
              const isToday =
                item.isCurrentMonth &&
                item.day === todayDate &&
                viewMonth === todayMonth &&
                viewYear === todayYear;

              const isSelected = selectedDateFilter === item.dateKey;
              const hasTasks = taskDatesMap.has(item.dateKey);

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (onSelectDateFilter) {
                      onSelectDateFilter(isSelected ? null : item.dateKey);
                    }
                  }}
                  className={`relative py-1.5 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer font-['Outfit',sans-serif] ${
                    isSelected
                      ? 'text-white font-bold shadow-xs'
                      : isToday
                      ? 'bg-slate-900 text-white font-bold'
                      : item.isCurrentMonth
                      ? 'text-slate-800 hover:bg-slate-100 font-medium'
                      : 'text-slate-300'
                  }`}
                  style={isSelected ? { backgroundColor: accent } : undefined}
                >
                  <span>{item.day}</span>

                  {/* Task indicator dots beneath dates */}
                  {hasTasks && !isToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedDateFilter && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">
                Filtered: {selectedDateFilter}
              </span>
              <button
                onClick={() => onSelectDateFilter && onSelectDateFilter(null)}
                className="text-[11px] font-bold hover:underline cursor-pointer"
                style={{ color: accent }}
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
