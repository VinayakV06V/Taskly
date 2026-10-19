import React from 'react';
import confetti from 'canvas-confetti';
import { Plus, Check, Clock, AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';
import { Task } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenCreateModal: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenCreateModal,
}) => {
  const todoTasks = tasks.filter((t) => !t.isCompleted && t.priority !== 'HIGH');
  const inProgressTasks = tasks.filter((t) => !t.isCompleted && t.priority === 'HIGH');
  const doneTasks = tasks.filter((t) => t.isCompleted);

  const handleCompleteWithConfetti = (id: string, isDone: boolean) => {
    if (!isDone) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF5E5E', '#10B981', '#3B82F6']
        });
      } catch (e) {}
    }
    onToggleTask(id);
  };

  const renderCard = (task: Task, isDone: boolean = false) => {
    const deadline = new Date(task.deadline);
    const diffDays = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 3600 * 24));
    const isOverdue = !isDone && deadline.getTime() < Date.now();

    return (
      <div
        key={task.id}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 card-press group relative shadow-xs"
      >
        {/* Top Tag & Remaining Time (Matches Image 3) */}
        <div className="flex items-center justify-between mb-2.5 text-[11px] font-medium">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-semibold">
            {task.category}
          </span>
          <span className={`font-mono text-[11px] ${isOverdue ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
            {isDone ? 'Completed' : isOverdue ? 'Overdue!' : `${diffDays}d left`}
          </span>
        </div>

        {/* Title */}
        <h4 className={`text-sm font-bold tracking-tight mb-1 text-slate-900 group-hover:text-[#FF5E5E] transition-colors ${
          isDone ? 'line-through text-slate-400' : ''
        }`}>
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Footer: Priority & Action */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
            task.priority === 'HIGH'
              ? 'bg-rose-50 text-rose-600'
              : task.priority === 'MEDIUM'
              ? 'bg-amber-50 text-amber-600'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {task.priority}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleCompleteWithConfetti(task.id, isDone)}
              className={`p-1.5 rounded-lg text-xs font-semibold btn-press cursor-pointer flex items-center gap-1 ${
                isDone
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
              }`}
              title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[10px]">{isDone ? 'Undo' : 'Done'}</span>
            </button>

            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 btn-press cursor-pointer"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Kanban Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 font-['Outfit',sans-serif]">
            Interactive Kanban Board
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visually manage workflows, prioritize high-impact deliverables, and track velocity.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#FF5E5E] hover:bg-[#FF4545] shadow-md shadow-[#FF5E5E]/20 btn-press cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>

      {/* 3 Columns (Matches Image 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: To-Do */}
        <div className="bg-[#F8FAFD] rounded-3xl p-4 border border-slate-200/70 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h3 className="text-sm font-bold text-slate-800">To-Do Queue</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {todoTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">No standard tasks pending.</p>
            ) : (
              todoTasks.map((t) => renderCard(t, false))
            )}
          </div>
        </div>

        {/* Column 2: In Progress / High Priority */}
        <div className="bg-[#F8FAFD] rounded-3xl p-4 border border-slate-200/70 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E5E]" />
              <h3 className="text-sm font-bold text-slate-800">High Priority / Urgent</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-white text-rose-600 px-2 py-0.5 rounded-full border border-rose-200">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {inProgressTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">No high-priority tasks in progress.</p>
            ) : (
              inProgressTasks.map((t) => renderCard(t, false))
            )}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="bg-[#F8FAFD] rounded-3xl p-4 border border-slate-200/70 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-slate-800">Completed</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-white text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
              {doneTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {doneTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">No completed tasks yet.</p>
            ) : (
              doneTasks.map((t) => renderCard(t, true))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
