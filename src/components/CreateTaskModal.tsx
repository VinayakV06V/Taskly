import React, { useState } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { Priority, RecurrenceFrequency } from '../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (taskData: {
    title: string;
    description: string;
    priority: Priority;
    category: string;
    deadline: string;
    recurrence: {
      frequency: RecurrenceFrequency;
      interval: number;
    };
  }) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [category, setCategory] = useState('Design');
  const [customCategory, setCustomCategory] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
  });
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('NONE');
  const [interval, setInterval] = useState(1);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const setPresetDeadline = (hoursFromNow: number) => {
    const d = new Date(Date.now() + hoursFromNow * 3600 * 1000);
    setDeadline(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    const finalCategory = category === 'Other' && customCategory.trim() ? customCategory.trim() : category;

    onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      category: finalCategory,
      deadline: deadline ? (deadline.length === 16 ? `${deadline}:00` : deadline) : new Date().toISOString(),
      recurrence: {
        frequency,
        interval: Math.max(1, interval),
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
              Create New Task
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Add task details, priority level, and deadline.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 btn-press transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Task Title <span className="text-[#FF5E5E]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Landing Page Design or Client Review"
              className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] focus:ring-2 focus:ring-[#FF5E5E]/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Key notes, links, or deliverables..."
              className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] focus:ring-2 focus:ring-[#FF5E5E]/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none font-mono cursor-pointer"
              >
                <option value="HIGH">HIGH (Urgent)</option>
                <option value="MEDIUM">MEDIUM (Standard)</option>
                <option value="LOW">LOW (Optional)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value="Design">Design</option>
                <option value="Engineering">Engineering</option>
                <option value="Academics">Academics</option>
                <option value="Marketing">Marketing</option>
                <option value="Personal">Personal</option>
                <option value="Other">Custom Category</option>
              </select>
            </div>
          </div>

          {category === 'Other' && (
            <div>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category..."
                className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Target Deadline
              </label>
              <div className="flex items-center gap-1.5 text-[11px] text-[#FF5E5E] font-medium">
                <button
                  type="button"
                  onClick={() => setPresetDeadline(4)}
                  className="hover:underline cursor-pointer"
                >
                  +4h
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setPresetDeadline(24)}
                  className="hover:underline cursor-pointer"
                >
                  Tomorrow
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setPresetDeadline(72)}
                  className="hover:underline cursor-pointer"
                >
                  +3 Days
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none font-mono"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Recurrence (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                className="bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value="NONE">No Recurrence</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>

              {frequency !== 'NONE' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Every:</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value) || 1)}
                    className="w-16 bg-[#F8FAFD] border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-mono outline-none"
                  />
                  <span className="text-xs text-slate-500">
                    {frequency === 'DAILY' ? 'day(s)' : frequency === 'WEEKLY' ? 'week(s)' : 'month(s)'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors btn-press cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF5E5E] hover:bg-[#FF4545] rounded-full shadow-md shadow-[#FF5E5E]/20 btn-press cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
