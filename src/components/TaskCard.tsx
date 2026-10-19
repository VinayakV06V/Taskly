import React from 'react';
import confetti from 'canvas-confetti';
import { Check, Clock, RotateCw, Trash2, AlertTriangle } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSnooze: (id: string, hours: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onDelete,
  onSnooze,
}) => {
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  const isOverdue = !task.isCompleted && deadlineDate.getTime() < now.getTime();
  const diffHours = Math.round((deadlineDate.getTime() - now.getTime()) / (3600 * 1000));

  const formatDeadline = (d: Date) => {
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleToggleWithConfetti = () => {
    if (!task.isCompleted) {
      try {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.7 },
          colors: ['#FF5E5E', '#10B981', '#3B82F6', '#F59E0B']
        });
      } catch (e) {}
    }
    onToggle(task.id);
  };

  const priorityBadge = {
    HIGH: 'bg-rose-50 text-rose-600 border-rose-200',
    MEDIUM: 'bg-amber-50 text-amber-600 border-amber-200',
    LOW: 'bg-blue-50 text-blue-600 border-blue-200'
  }[task.priority];

  return (
    <div
      className={`group relative rounded-2xl border p-4 card-press ${
        task.isCompleted
          ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
          : isOverdue
          ? 'bg-rose-50/30 border-rose-200/80'
          : 'bg-white border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Toggle Checkbox Button with Circle / Coral Theme */}
        <button
          onClick={handleToggleWithConfetti}
          aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 btn-press shrink-0 cursor-pointer ${
            task.isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : isOverdue
              ? 'border-rose-400 hover:border-rose-500 bg-white'
              : 'border-[#FF5E5E] hover:border-[#FF4545] bg-white'
          }`}
        >
          {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3
              className={`text-sm font-bold tracking-tight truncate ${
                task.isCompleted
                  ? 'line-through text-slate-400'
                  : isOverdue
                  ? 'text-rose-900'
                  : 'text-slate-900'
              }`}
            >
              {task.title}
            </h3>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
              {!task.isCompleted && (
                <button
                  onClick={() => onSnooze(task.id, 24)}
                  title="Snooze deadline (+24 hours)"
                  className="px-2 py-0.5 text-[10px] font-mono text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors btn-press cursor-pointer"
                >
                  +24h
                </button>
              )}

              <button
                onClick={() => onDelete(task.id)}
                title="Delete Task"
                className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 transition-colors btn-press cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-2.5 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Metadata Row with Pastel Badges */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {/* Priority */}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${priorityBadge}`}>
              {task.priority}
            </span>

            {/* Category */}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
              {task.category}
            </span>

            <span aria-hidden="true" className="text-slate-300">·</span>

            {/* Deadline / Overdue Calculation */}
            <div className="flex items-center gap-1 font-mono text-[11px] tabular-nums">
              {isOverdue ? (
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-500" />
                  Overdue by {Math.abs(diffHours)}h ({formatDeadline(deadlineDate)})
                </span>
              ) : task.isCompleted ? (
                <span className="text-emerald-600 font-medium">Completed</span>
              ) : (
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Due {formatDeadline(deadlineDate)}
                  {diffHours <= 24 && diffHours > 0 && (
                    <span className="text-amber-600 font-bold">({diffHours}h left)</span>
                  )}
                </span>
              )}
            </div>

            {/* Recurrence Indicator */}
            {task.recurrence && task.recurrence.frequency !== 'NONE' && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="flex items-center gap-1 text-indigo-600 font-mono text-[10px]">
                  <RotateCw className="w-3 h-3" />
                  {task.recurrence.frequency.toLowerCase()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
