import React from 'react';
import confetti from 'canvas-confetti';
import { Plus, Check, Clock, AlertTriangle, Trash2, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { Task, SystemStatistics } from '../types';

interface DashboardOverviewProps {
  tasks: Task[];
  stats: SystemStatistics | null;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSnoozeTask: (id: string, hours: number) => void;
  onOpenCreateModal: () => void;
  onNavigateToTasks: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tasks,
  stats,
  onToggleTask,
  onDeleteTask,
  onSnoozeTask,
  onOpenCreateModal,
  onNavigateToTasks,
}) => {
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const total = tasks.length;
  const completedCount = completedTasks.length;
  const pendingCount = pendingTasks.length;
  const overdueCount = stats?.overdueTasks || 0;

  const completedPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const inProgressPercent = total > 0 ? Math.round(((pendingCount - overdueCount) / total) * 100) : 0;
  const overduePercent = total > 0 ? Math.round((overdueCount / total) * 100) : 0;

  const handleTaskCheckWithConfetti = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#FF5E5E', '#10B981', '#3B82F6', '#F59E0B']
        });
      } catch (e) {
        // Fallback gracefully
      }
    }
    onToggleTask(id);
  };

  // Helper for Circular SVG progress ring
  const renderCircleRing = (percent: number, color: string, label: string) => {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#F1F5F9"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={color}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute font-bold text-sm text-slate-800 font-['Outfit',sans-serif]">
            {percent}%
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-600">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span>{label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/70">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: To-Do Section (Matches Image 1) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                To-Do
              </span>
              <span className="text-xs font-medium text-slate-400">
                · {pendingTasks.length} active
              </span>
            </div>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1 text-xs font-bold text-[#FF5E5E] hover:text-[#FF4545] btn-press cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Task Card List */}
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2.5 opacity-80" />
                <h3 className="text-sm font-bold text-slate-800">Your To-Do queue is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4">
                  Add tasks whenever you want to track projects, priorities, and deadlines.
                </p>
                <button
                  onClick={onOpenCreateModal}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#FF5E5E] hover:bg-[#FF4545] rounded-full shadow-sm btn-press cursor-pointer"
                >
                  + Add First Task
                </button>
              </div>
            ) : (
              pendingTasks.slice(0, 5).map((task) => {
                const deadlineDate = new Date(task.deadline);
                const isOverdue = deadlineDate.getTime() < Date.now();

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-[#F8FAFD] border border-slate-100 card-press hover:border-slate-200 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Circle Radio-style check toggle (Matches Image 1) */}
                        <button
                          onClick={() => handleTaskCheckWithConfetti(task.id, task.isCompleted)}
                          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center btn-press shrink-0 cursor-pointer ${
                            task.isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : isOverdue
                              ? 'border-rose-400 hover:border-rose-500 bg-white'
                              : 'border-[#FF5E5E] hover:border-[#FF4545] bg-white'
                          }`}
                        >
                          {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight truncate group-hover:text-[#FF5E5E] transition-colors">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {task.description}
                            </p>
                          )}

                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400 mt-2 font-medium">
                            <span className={`font-semibold ${
                              task.priority === 'HIGH' ? 'text-rose-500' : task.priority === 'MEDIUM' ? 'text-amber-500' : 'text-blue-500'
                            }`}>
                              Priority: {task.priority}
                            </span>
                            <span>·</span>
                            <span className="bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                              {task.category}
                            </span>
                            <span>·</span>
                            <span className={isOverdue ? 'text-rose-500 font-bold' : 'text-slate-500'}>
                              {isOverdue ? 'Overdue!' : `Due ${deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick actions */}
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onSnoozeTask(task.id, 24)}
                          className="px-2 py-1 text-[10px] font-mono font-medium text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg btn-press cursor-pointer"
                          title="Snooze deadline +24 hours"
                        >
                          +24h
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white btn-press cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {pendingTasks.length > 5 && (
              <button
                onClick={onNavigateToTasks}
                className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-[#F8FAFD] hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer btn-press"
              >
                <span>View all {pendingTasks.length} tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Task Status & Completed Tasks (Matches Image 1) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Circular Rings Box (Matches Image 1) */}
          <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4 font-['Outfit',sans-serif]">
              Task Status
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {renderCircleRing(completedPercent, '#10B981', 'Completed')}
              {renderCircleRing(inProgressPercent, '#3B82F6', 'In Progress')}
              {renderCircleRing(overduePercent, '#FF5E5E', 'Overdue')}
            </div>
          </div>

          {/* Completed Tasks Box (Matches Image 1) */}
          <div className="p-5 rounded-2xl bg-[#F8FAFD] border border-slate-100">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
                Completed Tasks
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {completedTasks.length} done
              </span>
            </div>

            <div className="space-y-2.5">
              {completedTasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No completed tasks yet. Finish a task above to celebrate!
                </p>
              ) : (
                completedTasks.slice(0, 4).map((ct) => (
                  <div
                    key={ct.id}
                    className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 line-through truncate">
                          {ct.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ct.category}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 font-semibold shrink-0">
                      Completed
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
