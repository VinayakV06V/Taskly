import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ViewTab, Task, Habit, SystemStatistics, OverdueAlert, Priority, RecurrenceFrequency, User, AppNotification } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { RightPanel } from './components/RightPanel';
import { DashboardOverview } from './components/DashboardOverview';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskBoard } from './components/TaskBoard';
import { HabitTrackerView } from './components/HabitTrackerView';
import { AnalyticsView } from './components/AnalyticsView';
import { OverdueAlertsView } from './components/OverdueAlertsView';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateHabitModal } from './components/CreateHabitModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal, WebsiteCustomizationSettings, DEFAULT_CUSTOM_SETTINGS } from './components/SettingsModal';
import { UserAlarm } from './components/ClockAlarmWidget';
import { X } from 'lucide-react';

// Safe JSON parser that checks Content-Type and handles non-JSON / HTML responses gracefully
async function safeJson<T = any>(res: Response): Promise<T | null> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn('Network response is not valid JSON:', err);
    return null;
  }
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('taskly_token') || localStorage.getItem('taskpulse_token')
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<SystemStatistics | null>(null);
  const [alerts, setAlerts] = useState<OverdueAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Customization Settings State
  const [customSettings, setCustomSettings] = useState<WebsiteCustomizationSettings>(() => {
    try {
      const saved = localStorage.getItem('taskly_custom_settings');
      return saved ? { ...DEFAULT_CUSTOM_SETTINGS, ...JSON.parse(saved) } : DEFAULT_CUSTOM_SETTINGS;
    } catch {
      return DEFAULT_CUSTOM_SETTINGS;
    }
  });

  // Notifications State: STRICTLY NO PRIOR NOTIFICATIONS! Empty array initially.
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);

  // Subtle toast notification
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'alert' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'alert' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Add Notification function (called only when send or receive)
  const addNotification = useCallback((title: string, message: string, type: 'success' | 'alert' | 'info' = 'info') => {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSendTestNotification = () => {
    addNotification(
      'Task Reminder',
      'Reminder alert: Time to review project milestones and daily tasks.',
      'info'
    );
    showToast('New reminder notification received', 'info');
  };

  const handleAlarmTriggered = useCallback((alarm: UserAlarm) => {
    addNotification('⏰ Alarm Triggered', `Reminder: ${alarm.label} at ${alarm.time}`, 'alert');
    showToast(`⏰ Alarm: ${alarm.label} (${alarm.time})`, 'alert');
  }, [addNotification]);

  const handleSaveCustomSettings = (newSettings: WebsiteCustomizationSettings) => {
    setCustomSettings(newSettings);
    try {
      localStorage.setItem('taskly_custom_settings', JSON.stringify(newSettings));
    } catch {}
    showToast('Custom settings applied', 'success');
  };

  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Fetch Current User
  const checkAuth = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await safeJson<{ success: boolean; user: User }>(res);
      if (data && data.success && data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem('taskly_token');
        localStorage.removeItem('taskpulse_token');
        setToken(null);
        setUser(null);
        setIsAuthModalOpen(true);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch all user-scoped data
  const fetchData = useCallback(async () => {
    if (!token) {
      setTasks([]);
      setHabits([]);
      setStats(null);
      setAlerts([]);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [tasksRes, habitsRes, statsRes, alertsRes] = await Promise.all([
        fetch('/api/tasks', { headers }),
        fetch('/api/habits', { headers }),
        fetch('/api/stats', { headers }),
        fetch('/api/alerts', { headers }),
      ]);

      const [tasksData, habitsData, statsData, alertsData] = await Promise.all([
        safeJson<{ success: boolean; tasks: Task[] }>(tasksRes),
        safeJson<{ success: boolean; habits: Habit[] }>(habitsRes),
        safeJson<{ success: boolean; stats: SystemStatistics }>(statsRes),
        safeJson<{ success: boolean; alerts: OverdueAlert[] }>(alertsRes),
      ]);

      if (tasksData?.tasks) {
        setTasks(tasksData.tasks);
      }
      if (habitsData?.habits) {
        setHabits(habitsData.habits);
      }
      if (statsData?.stats) {
        setStats(statsData.stats);
      }
      if (alertsData?.alerts) {
        setAlerts(alertsData.alerts);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      fetchData();
    }
  }, [user, token, fetchData]);

  // Filter tasks based on searchQuery
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.priority.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  // Auth Handlers
  const handleAuthSuccess = (authenticatedUser: User, authToken: string) => {
    setUser(authenticatedUser);
    setToken(authToken);
    localStorage.setItem('taskly_token', authToken);
    localStorage.setItem('taskpulse_token', authToken);
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${authenticatedUser.name.split(' ')[0]}!`, 'success');
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem('taskly_token');
    localStorage.removeItem('taskpulse_token');
    setToken(null);
    setUser(null);
    setTasks([]);
    setHabits([]);
    setStats(null);
    setAlerts([]);
    setIsProfileModalOpen(false);
    setIsSettingsModalOpen(false);
    setIsAuthModalOpen(true);
    showToast('You have been logged out', 'info');
  };

  const handleUpdateProfile = async (name: string, bio: string, avatarUrl?: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, bio, avatarUrl })
      });
      const data = await safeJson<{ success: boolean; user: User }>(res);
      if (data && data.success && data.user) {
        setUser(data.user);
        showToast('Profile & avatar updated successfully', 'success');
        addNotification('Profile Updated', 'Your profile details and avatar were saved.', 'success');
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  // Task Handlers
  const handleToggleTask = async (id: string) => {
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            isCompleted: !t.isCompleted,
            completedAt: !t.isCompleted ? new Date().toISOString() : null
          };
        }
        return t;
      })
    );

    try {
      const res = await fetch(`/api/tasks/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await safeJson<{ success: boolean; task: Task; spawnedTask?: Task }>(res);
      if (data && data.success) {
        if (data.spawnedTask) {
          showToast(`Completed! Spawned next recurring task: "${data.spawnedTask.title}"`, 'success');
          addNotification('Recurring Task Spawned', `Next cycle generated for "${data.spawnedTask.title}".`, 'info');
        } else {
          showToast(data.task.isCompleted ? 'Task completed 🎉' : 'Task marked active', 'info');
          if (data.task.isCompleted) {
            addNotification('Task Completed', `"${data.task.title}" was marked as completed!`, 'success');
          } else {
            addNotification('Task Re-opened', `"${data.task.title}" moved back to active sprint.`, 'info');
          }
        }
        fetchData();
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
      fetchData();
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!token) return;
    const taskToDelete = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        showToast('Task removed from queue', 'info');
        if (taskToDelete) {
          addNotification('Task Removed', `"${taskToDelete.title}" was removed from your queue.`, 'info');
        }
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
      fetchData();
    }
  };

  const handleSnoozeTask = async (id: string, hours: number) => {
    if (!token) return;
    const task = tasks.find((t) => t.id === id);
    try {
      const res = await fetch(`/api/tasks/${id}/snooze`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hours })
      });
      if (res.ok) {
        showToast(`Deadline extended by +${hours} hours`, 'success');
        if (task) {
          addNotification('Task Postponed', `"${task.title}" deadline extended +${hours}h.`, 'info');
        }
        fetchData();
      }
    } catch (err) {
      console.error('Failed to snooze task:', err);
    }
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    priority: Priority;
    category: string;
    deadline: string;
    recurrence: {
      frequency: RecurrenceFrequency;
      interval: number;
    };
  }) => {
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData)
      });
      const data = await safeJson<{ success: boolean; task: Task; error?: string }>(res);
      if (data && data.success && data.task) {
        showToast(`Added task: "${data.task.title}"`, 'success');
        addNotification('New Task Created', `"${data.task.title}" added to your sprint queue.`, 'success');
        fetchData();
      } else {
        showToast(data?.error || 'Failed to add task', 'alert');
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleQuickAddTask = async (title: string, priority: Priority) => {
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const deadline = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T18:00:00`;

    await handleCreateTask({
      title,
      description: '',
      priority,
      category: 'General',
      deadline,
      recurrence: { frequency: 'NONE', interval: 1 }
    });
  };

  // Habit Handlers
  const handleToggleHabitDate = async (habitId: string, dateStr: string) => {
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    const targetHabit = habits.find((h) => h.id === habitId);

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const newHistory = { ...h.completionHistory };
          if (newHistory[dateStr]) {
            delete newHistory[dateStr];
          } else {
            newHistory[dateStr] = true;
          }
          return { ...h, completionHistory: newHistory };
        }
        return h;
      })
    );

    try {
      const res = await fetch(`/api/habits/${habitId}/toggle-date`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ date: dateStr })
      });
      const data = await safeJson<{ success: boolean; habit: Habit }>(res);
      if (data && data.success) {
        showToast('Habit check-in recorded 🔥', 'success');
        if (targetHabit) {
          addNotification('Habit Check-in', `Streak updated for habit "${targetHabit.title}".`, 'success');
        }
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update habit:', err);
      fetchData();
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!token) return;
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        showToast('Habit removed', 'info');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete habit:', err);
      fetchData();
    }
  };

  const handleCreateHabit = async (habitData: {
    title: string;
    description: string;
    category: string;
    frequency: 'DAILY' | 'WEEKLY';
    targetDaysPerWeek: number;
  }) => {
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(habitData)
      });
      const data = await safeJson<{ success: boolean; habit: Habit }>(res);
      if (data && data.success && data.habit) {
        showToast(`Added habit: "${data.habit.title}"`, 'success');
        addNotification('New Habit Formed', `"${data.habit.title}" added to daily routine.`, 'success');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create habit:', err);
    }
  };

  return (
    <div
      className="min-h-screen text-slate-800 flex flex-row font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300"
      style={{ backgroundColor: customSettings.backgroundColor }}
    >
      {/* Desktop Persistent White Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setMobileMenuOpen(false);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={handleLogout}
        user={user}
        overdueCount={alerts.length}
        settings={customSettings}
      />

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 p-3">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 z-20 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setMobileMenuOpen(false);
              }}
              onOpenProfile={() => {
                setIsProfileModalOpen(true);
                setMobileMenuOpen(false);
              }}
              onOpenSettings={() => {
                setIsSettingsModalOpen(true);
                setMobileMenuOpen(false);
              }}
              onLogout={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              user={user}
              overdueCount={alerts.length}
              settings={customSettings}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Top Header */}
        <Header
          user={user}
          search={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewTaskModal={() => {
            if (!user) {
              setIsAuthModalOpen(true);
            } else {
              setIsTaskModalOpen(true);
            }
          }}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          notifications={notifications}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onClearNotifications={handleClearNotifications}
          onSendTestNotification={handleSendTestNotification}
          onDismissNotification={handleDismissNotification}
          settings={customSettings}
        />

        {/* Viewport Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-3 sm:py-5 max-w-[1700px] w-full mx-auto">
          {loading ? (
            <div className="py-24 text-center">
              <div
                className="inline-block w-8 h-8 border-3 border-t-transparent rounded-full animate-spin mb-3"
                style={{ borderColor: customSettings.accentColor, borderTopColor: 'transparent' }}
              />
              <p className="text-xs text-slate-500 font-medium">Loading workspace...</p>
            </div>
          ) : (
            <div className="flex flex-col xl:flex-row items-start gap-6 w-full">
              <div className="flex-1 min-w-0 w-full">
                {currentTab === 'dashboard' && (
                  <DashboardOverview
                    tasks={filteredTasks}
                    stats={stats}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onSnoozeTask={handleSnoozeTask}
                    onOpenCreateModal={() => {
                      if (!user) setIsAuthModalOpen(true);
                      else setIsTaskModalOpen(true);
                    }}
                    onNavigateToTasks={() => setCurrentTab('tasks')}
                    selectedDateFilter={selectedDateFilter}
                    settings={customSettings}
                  />
                )}

                {currentTab === 'kanban' && (
                  <KanbanBoard
                    tasks={filteredTasks}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onOpenCreateModal={() => {
                      if (!user) setIsAuthModalOpen(true);
                      else setIsTaskModalOpen(true);
                    }}
                  />
                )}

                {currentTab === 'tasks' && (
                  <TaskBoard
                    tasks={filteredTasks}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onSnoozeTask={handleSnoozeTask}
                    onOpenCreateModal={() => {
                      if (!user) setIsAuthModalOpen(true);
                      else setIsTaskModalOpen(true);
                    }}
                    onQuickAddTask={handleQuickAddTask}
                  />
                )}

                {currentTab === 'habits' && (
                  <HabitTrackerView
                    habits={habits}
                    onToggleHabitDate={handleToggleHabitDate}
                    onDeleteHabit={handleDeleteHabit}
                    onOpenCreateHabitModal={() => {
                      if (!user) setIsAuthModalOpen(true);
                      else setIsHabitModalOpen(true);
                    }}
                  />
                )}

                {currentTab === 'analytics' && (
                  <AnalyticsView stats={stats} />
                )}

                {currentTab === 'alerts' && (
                  <OverdueAlertsView
                    alerts={alerts}
                    onToggleTask={handleToggleTask}
                    onSnoozeTask={handleSnoozeTask}
                    onNavigateToTasks={() => setCurrentTab('tasks')}
                  />
                )}
              </div>

              {/* Persistent Right Rail Panel */}
              <RightPanel
                user={user}
                tasks={tasks}
                stats={stats}
                notifications={notifications}
                onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
                onClearNotifications={handleClearNotifications}
                onSendTestNotification={handleSendTestNotification}
                onDismissNotification={handleDismissNotification}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onSelectDateFilter={setSelectedDateFilter}
                selectedDateFilter={selectedDateFilter}
                onAlarmTriggered={handleAlarmTriggered}
                settings={customSettings}
              />
            </div>
          )}
        </main>

        {/* Clean Minimalist Footer */}
        <footer className="py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-200/50 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-bold text-slate-600 font-['Outfit',sans-serif]">
              {customSettings.workspaceName} · Smart Task &amp; Habit Workspace
            </span>
            <span className="text-[11px] text-slate-400">
              Personal Productivity &amp; Priority Management
            </span>
          </div>
        </footer>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className={`px-4 py-2.5 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
            toast.type === 'alert'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : toast.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-emerald-600 text-white border-emerald-500'
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modals rendered when opened */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          canDismiss={Boolean(user)}
        />
      )}

      {isProfileModalOpen && user && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          stats={stats}
          onUpdateProfile={handleUpdateProfile}
          onLogout={handleLogout}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={customSettings}
          onSaveSettings={handleSaveCustomSettings}
        />
      )}

      {isTaskModalOpen && (
        <CreateTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onCreate={handleCreateTask}
        />
      )}

      {isHabitModalOpen && (
        <CreateHabitModal
          isOpen={isHabitModalOpen}
          onClose={() => setIsHabitModalOpen(false)}
          onCreate={handleCreateHabit}
        />
      )}
    </div>
  );
}
