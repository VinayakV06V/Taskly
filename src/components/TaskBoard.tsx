import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, CheckCircle2, Plus } from 'lucide-react';
import { Task, Priority } from '../types';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSnoozeTask: (id: string, hours: number) => void;
  onOpenCreateModal: () => void;
  onQuickAddTask: (title: string, priority: Priority) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onSnoozeTask,
  onOpenCreateModal,
  onQuickAddTask,
}) => {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | Priority>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'title' | 'created'>('deadline');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('MEDIUM');

  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => set.add(t.category));
    return ['ALL', ...Array.from(set)];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((t) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description.toLowerCase().includes(q);
          const matchCat = t.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) {
          return false;
        }

        if (categoryFilter !== 'ALL' && t.category !== categoryFilter) {
          return false;
        }

        if (statusFilter === 'ACTIVE' && t.isCompleted) return false;
        if (statusFilter === 'COMPLETED' && !t.isCompleted) return false;
        if (statusFilter === 'OVERDUE') {
          const isOverdue = !t.isCompleted && new Date(t.deadline).getTime() < now;
          if (!isOverdue) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const weights: Record<Priority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'created') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
  }, [tasks, search, priorityFilter, categoryFilter, statusFilter, sortBy]);

  const overdueCount = useMemo(() => {
    const now = Date.now();
    return tasks.filter((t) => !t.isCompleted && new Date(t.deadline).getTime() < now).length;
  }, [tasks]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAddTask(quickTitle.trim(), quickPriority);
    setQuickTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner & Quick Add */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-['Outfit',sans-serif]">
              My Tasks &amp; Deliverables
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Prioritize assignments, manage deadlines, and resolve overdue action items.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#FF5E5E] hover:bg-[#FF4545] rounded-full shadow-md shadow-[#FF5E5E]/20 btn-press cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Detailed Task</span>
            </button>
          </div>
        </div>

        {/* Quick Add Bar */}
        <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-slate-100">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Quick capture a new task (press Enter to save)..."
            className="w-full sm:flex-1 bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] focus:ring-2 focus:ring-[#FF5E5E]/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value as Priority)}
              className="bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none font-mono cursor-pointer"
            >
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-xl btn-press whitespace-nowrap cursor-pointer shadow-xs"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Control Strip: Search, Priority Tabs, Status Tabs, Sorting */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, or category..."
              className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none cursor-pointer"
            >
              <option value="deadline">Earliest Deadline</option>
              <option value="priority">Priority (High to Low)</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="created">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#F8FAFD] rounded-xl border border-slate-200/70">
            {(['ALL', 'ACTIVE', 'COMPLETED', 'OVERDUE'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg font-semibold btn-press transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status === 'ALL'
                  ? 'All Tasks'
                  : status === 'ACTIVE'
                  ? 'Pending'
                  : status === 'COMPLETED'
                  ? 'Completed'
                  : `Overdue (${overdueCount})`}
              </button>
            ))}
          </div>

          {/* Priority Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#F8FAFD] rounded-xl border border-slate-200/70">
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded-lg font-semibold btn-press transition-colors whitespace-nowrap cursor-pointer ${
                  priorityFilter === p
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {p === 'ALL' ? 'All' : p}
              </button>
            ))}
          </div>

          {/* Category Dropdown Filter */}
          {categories.length > 2 && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] rounded-xl px-2.5 py-1 text-xs text-slate-700 outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Task List Container */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {tasks.length === 0 ? 'Your task queue is empty' : 'No matching tasks found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              {tasks.length === 0
                ? 'Tasks are only added when you add them. Use the quick capture bar above or click "+ Add Detailed Task" to create your first action item.'
                : 'Try adjusting your search query, priority selector, or status filter.'}
            </p>
            <button
              onClick={onOpenCreateModal}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF5E5E] hover:bg-[#FF4545] rounded-full shadow-md shadow-[#FF5E5E]/20 btn-press cursor-pointer"
            >
              + Create First Task
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onSnooze={onSnoozeTask}
            />
          ))
        )}
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums px-2">
        <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
        <span>Overdue: {overdueCount} · Completed: {tasks.filter(t => t.isCompleted).length}</span>
      </div>
    </div>
  );
};
