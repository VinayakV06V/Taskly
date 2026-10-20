import React from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, Send, CheckCheck, Trash2, X } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSendTestNotification: () => void;
  onDismissNotification: (id: string) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onSendTestNotification,
  onDismissNotification,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="px-5 py-4 bg-[#FAF7F2] border-b border-slate-200/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-700">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
              Notifications
            </h4>
            <p className="text-[11px] text-slate-400">
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'No unread alerts'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              title="Mark all as read"
              className="p-1.5 rounded-xl hover:bg-white text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1 btn-press cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px]">Read all</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
        {notifications.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F4EFEA] flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Bell className="w-5 h-5 opacity-60" />
            </div>
            <h5 className="text-xs font-bold text-slate-800 font-['Outfit',sans-serif]">
              No notifications yet
            </h5>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1 mb-4 leading-relaxed">
              You will receive real-time notifications when tasks or habits are created, completed, snoozed, or when you trigger an update.
            </p>
            <button
              onClick={onSendTestNotification}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-[#FF7243] hover:bg-[#FF5D29] shadow-sm btn-press cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Send Test Notification</span>
            </button>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon =
              n.type === 'success' ? CheckCircle2 : n.type === 'alert' ? AlertCircle : Info;
            const iconColor =
              n.type === 'success'
                ? 'text-emerald-500 bg-emerald-50'
                : n.type === 'alert'
                ? 'text-rose-500 bg-rose-50'
                : 'text-indigo-500 bg-indigo-50';

            return (
              <div
                key={n.id}
                className={`p-3.5 flex items-start gap-3 rounded-2xl transition-colors ${
                  n.read ? 'bg-white hover:bg-slate-50/80' : 'bg-[#FFF9F5] hover:bg-[#FFF4ED]'
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate font-['Outfit',sans-serif]">
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {n.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug break-words">
                    {n.message}
                  </p>
                </div>

                <button
                  onClick={() => onDismissNotification(n.id)}
                  title="Dismiss"
                  className="text-slate-300 hover:text-slate-600 p-1 rounded-lg shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Action Bar */}
      {notifications.length > 0 && (
        <div className="p-3 bg-[#FAF7F2] border-t border-slate-200/70 flex items-center justify-between gap-2">
          <button
            onClick={onSendTestNotification}
            className="text-[11px] font-bold text-[#FF7243] hover:text-[#FF5D29] flex items-center gap-1.5 btn-press cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Send New Alert</span>
          </button>

          <button
            onClick={onClearAll}
            className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 flex items-center gap-1 btn-press cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear all</span>
          </button>
        </div>
      )}
    </div>
  );
};
