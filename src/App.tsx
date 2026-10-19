import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ViewTab, Task, Habit, SystemStatistics, OverdueAlert, Priority, RecurrenceFrequency, User } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
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
import { X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('taskpulse_token'));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<SystemStatistics | null>(null);
  const [alerts, setAlerts] = useState<OverdueAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
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
        fetch('/api/alerts/overdue', { headers }),
      ]);

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.tasks || []);
      }
      if (habitsRes.ok) {
        const data = await habitsRes.json();
        setHabits(data.habits || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
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
    localStorage.removeItem('taskpulse_token');
    setToken(null);
    setUser(null);
    setTasks([]);
    setHabits([]);
    setStats(null);
    setAlerts([]);
    setIsProfileModalOpen(false);
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
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        showToast('Profile & avatar updated successfully', 'success');
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
      const data = await res.json();
      if (data.success) {
        if (data.spawnedTask) {
          showToast(`Completed! Spawned next recurring task: "${data.spawnedTask.title}"`, 'success');
        } else {
          showToast(data.task.isCompleted ? 'Task completed 🎉' : 'Task marked active', 'info');
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
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        showToast('Task removed from queue', 'info');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
      fetchData();
    }
  };

  const handleSnoozeTask = async (id: string, hours: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/tasks/${id}/snooze`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hours })
      });
      if (res.ok) {
        showToast(`Deadline extended by +${hours} hours`, 'success');
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
      const data = await res.json();
      if (data.success) {
        showToast(`Added task: "${data.task.title}"`, 'success');
        fetchData();
      } else {
        showToast(data.error || 'Failed to add task', 'alert');
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
      const data = await res.json();
      if (data.success) {
        showToast('Habit check-in recorded 🔥', 'success');
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
      const data = await res.json();
      if (data.success) {
        showToast(`Added habit: "${data.habit.title}"`, 'success');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create habit:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 flex flex-row font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setMobileMenuOpen(false);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        user={user}
        overdueCount={alerts.length}
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
              onLogout={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              user={user}
              overdueCount={alerts.length}
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
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-3 border-[#FF5E5E] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading workspace...</p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </main>

        {/* Clean Footer */}
        <footer className="py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-200/60 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-slate-600 font-['Outfit',sans-serif]">
              TaskPulse · Smart Task &amp; Habit Workspace
            </span>
            <span className="text-[11px] text-slate-400">
              Personal Productivity &amp; Priority Management
            </span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        canDismiss={Boolean(user)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        stats={stats}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreate={handleCreateTask}
      />

      <CreateHabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onCreate={handleCreateHabit}
      />

      {/* Subtle Tactile Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-semibold shadow-xl backdrop-blur-md bg-white/95 border-slate-200 text-slate-800 card-press animate-check-pop">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              toast.type === 'alert'
                ? 'bg-rose-500'
                : toast.type === 'info'
                ? 'bg-blue-500'
                : 'bg-emerald-500'
            }`}
          />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
