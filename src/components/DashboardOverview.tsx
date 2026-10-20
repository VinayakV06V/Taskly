import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  Plus, 
  Check, 
  Trash2, 
  CheckCircle2, 
  SlidersHorizontal 
} from 'lucide-react';
import { Task, SystemStatistics } from '../types';
import { WebsiteCustomizationSettings } from './SettingsModal';

interface DashboardOverviewProps {
  tasks: Task[];
  stats: SystemStatistics | null;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSnoozeTask: (id: string, hours: number) => void;
  onOpenCreateModal: () => void;
  onNavigateToTasks: () => void;
  selectedDateFilter?: string | null;
  settings?: WebsiteCustomizationSettings;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tasks,
  stats,
  onToggleTask,
  onDeleteTask,
  onSnoozeTask,
  onOpenCreateModal,
  onNavigateToTasks,
  selectedDateFilter,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [filterSearch, setFilterSearch] = useState('');

  const completedTasks = tasks.filter((t) => t.isCompleted);
  const pendingTasks = tasks.filter((t) => !t.isCompleted);

  // Confetti on task complete (if enabled)
  const handleTaskCheckWithConfetti = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted && (settings?.enableConfetti ?? true)) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF7243', '#2DD4BF', '#3754DB', '#65B741'],
        });
      } catch {}
    }
    onToggleTask(id);
  };

  // Filter tasks based on activeTab, search, and selectedDateFilter
  const baseTasks = activeTab === 'active' ? pendingTasks : completedTasks;

  const displayedTasks = baseTasks.filter((t) => {
    if (selectedDateFilter) {
      const taskDate = t.deadline ? t.deadline.split('T')[0] : '';
      if (taskDate !== selectedDateFilter) return false;
    }
    if (!filterSearch.trim()) return true;
    const q = filterSearch.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  // Group tasks into Today vs Upcoming using local date calculation
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayDateKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const todayTasks = displayedTasks.filter((t) => {
    if (!t.deadline) return true;
    return t.deadline.split('T')[0] <= todayDateKey;
  });

  const tomorrowTasks = displayedTasks.filter((t) => {
    if (!t.deadline) return false;
    return t.deadline.split('T')[0] > todayDateKey;
  });

  // Category brand styles & colors
  const getCategoryTheme = (category: string, index: number) => {
    const c = category.toLowerCase();
    if (c.includes('work') || c.includes('uber')) {
      return { bg: 'bg-[#FF4A4A]', letter: 'U' };
    }
    if (c.includes('marketing') || c.includes('facebook') || c.includes('social')) {
      return { bg: 'bg-[#3B5998]', letter: 'f' };
    }
    if (c.includes('finance') || c.includes('payoneer') || c.includes('bank')) {
      return { bg: 'bg-[#6D28D9]', letter: 'P' };
    }
    if (c.includes('personal') || c.includes('upwork') || c.includes('dev')) {
      return { bg: 'bg-[#10B981]', letter: 'up' };
    }
    const colors = [
      { bg: 'bg-[#FF7243]', letter: 'T' },
      { bg: 'bg-[#0D9488]', letter: 'K' },
      { bg: 'bg-[#6366F1]', letter: 'M' },
      { bg: 'bg-[#EC4899]', letter: 'S' },
    ];
    return colors[index % colors.length];
  };

  const accent = settings?.accentColor || '#FF7243';
  const showCompletedTab = settings ? settings.showCompletedTasks : true;

  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xs border border-slate-200/60 space-y-6">
      {/* Filter Tabs & In-List Actions (The two top feature cards from Image 1 were removed per request) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-2 text-sm font-extrabold transition-all cursor-pointer border-b-2 font-['Outfit',sans-serif] ${
              activeTab === 'active'
                ? 'border-orange-500 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
            style={activeTab === 'active' ? { borderColor: accent, color: accent } : undefined}
          >
            Active Tasks ({pendingTasks.length})
          </button>

          {showCompletedTab && (
            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-2 text-sm font-extrabold transition-all cursor-pointer border-b-2 font-['Outfit',sans-serif] ${
                activeTab === 'completed'
                  ? 'border-orange-500 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
              style={activeTab === 'completed' ? { borderColor: accent, color: accent } : undefined}
            >
              Completed ({completedTasks.length})
            </button>
          )}
        </div>

        {/* Right Search Bar & Add Button */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Search tasks..."
              className="bg-[#FAF7F2] border border-slate-200/80 rounded-full pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-orange-500 font-medium"
            />
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1 text-xs font-bold text-white px-3.5 py-1.5 rounded-full shadow-xs btn-press cursor-pointer font-['Outfit',sans-serif]"
            style={{ backgroundColor: accent }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List Grouped by Timeline */}
      <div className="space-y-6">
        {displayedTasks.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-slate-800 font-['Outfit',sans-serif]">
              {activeTab === 'active' ? 'Your task queue is clear' : 'No completed tasks found'}
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4">
              {activeTab === 'active'
                ? 'Tasks you add will be tracked and displayed here with live progress statistics.'
                : 'Completed tasks will appear here once you check off finished items.'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={onOpenCreateModal}
                className="px-4 py-2 text-xs font-bold text-white rounded-full shadow-sm btn-press cursor-pointer font-['Outfit',sans-serif]"
                style={{ backgroundColor: accent }}
              >
                + Add First Task
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Today Group */}
            {todayTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                  <span>Today</span>
                  <span>{todayTasks.length} task{todayTasks.length > 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-2.5">
                  {todayTasks.map((task, idx) => {
                    const theme = getCategoryTheme(task.category, idx);
                    const isOverdue = task.deadline && new Date(task.deadline).getTime() < Date.now();

                    return (
                      <div
                        key={task.id}
                        className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] border border-slate-200/50 flex items-center justify-between gap-3 transition-all card-press group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {/* Colored Brand Square Icon */}
                          <div
                            className={`w-11 h-11 rounded-2xl ${theme.bg} text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0 font-['Outfit',sans-serif]`}
                          >
                            {theme.letter}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-extrabold tracking-tight truncate font-['Outfit',sans-serif] ${
                                task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-orange-500'
                              }`}>
                                {task.title}
                              </h4>
                              {isOverdue && !task.isCompleted && (
                                <span className="text-[10px] font-mono font-bold text-rose-500 bg-rose-50 px-2 py-0.2 rounded-md">
                                  Overdue
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {task.description || `${task.category} task`}
                            </p>
                          </div>
                        </div>

                        {/* Right Actions & Complete Checkbox */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onSnoozeTask(task.id, 24)}
                            className="hidden sm:inline-flex px-2 py-1 text-[10px] font-mono font-semibold text-slate-400 hover:text-slate-700 bg-white border border-slate-200/80 rounded-lg btn-press cursor-pointer"
                            title="Snooze deadline +24h"
                          >
                            +24h
                          </button>

                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-white transition-colors cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Round Radio Check Toggle */}
                          <button
                            onClick={() => handleTaskCheckWithConfetti(task.id, task.isCompleted)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all btn-press cursor-pointer ${
                              task.isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 hover:border-orange-500 bg-white'
                            }`}
                            title={task.isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                          >
                            {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tomorrow / Upcoming Group */}
            {tomorrowTasks.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                  <span>Upcoming</span>
                  <span>{tomorrowTasks.length} task{tomorrowTasks.length > 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-2.5">
                  {tomorrowTasks.map((task, idx) => {
                    const theme = getCategoryTheme(task.category, idx + 2);
                    return (
                      <div
                        key={task.id}
                        className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] border border-slate-200/50 flex items-center justify-between gap-3 transition-all card-press group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div
                            className={`w-11 h-11 rounded-2xl ${theme.bg} text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0 font-['Outfit',sans-serif]`}
                          >
                            {theme.letter}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className={`text-sm font-extrabold tracking-tight truncate font-['Outfit',sans-serif] ${
                              task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-orange-500'
                            }`}>
                              {task.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {task.description || `${task.category} task`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleTaskCheckWithConfetti(task.id, task.isCompleted)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all btn-press cursor-pointer ${
                              task.isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 hover:border-orange-500 bg-white'
                            }`}
                          >
                            {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
