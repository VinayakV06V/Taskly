import React, { useState } from 'react';
import { X, Flame, AlertCircle } from 'lucide-react';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (habitData: {
    title: string;
    description: string;
    category: string;
    frequency: 'DAILY' | 'WEEKLY';
    targetDaysPerWeek: number;
  }) => void;
}

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Habit title is required.');
      return;
    }

    onCreate({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      frequency: 'DAILY',
      targetDaysPerWeek,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 sm:p-8 overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                Create Recurring Habit
              </h3>
              <p className="text-xs text-slate-400">Track streaks and weekly consistency.</p>
            </div>
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
              Habit Name <span className="text-[#FF5E5E]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Cardio, Deep Reading"
              className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] focus:ring-2 focus:ring-[#FF5E5E]/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Daily Target / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 30 minutes minimum or 2.5L water"
              className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
            />
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
              <option value="Productivity">Productivity</option>
              <option value="Health">Health &amp; Fitness</option>
              <option value="Learning">Learning &amp; Study</option>
              <option value="Mindfulness">Mindfulness</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                Weekly Target Goal
              </label>
              <span className="text-xs font-mono text-[#FF5E5E] font-bold">
                {targetDaysPerWeek} days / week
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTargetDaysPerWeek(num)}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-xl border transition-colors btn-press cursor-pointer ${
                    targetDaysPerWeek === num
                      ? 'bg-[#FF5E5E] border-[#FF5E5E] text-white shadow-xs'
                      : 'bg-[#F8FAFD] border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {num}d
                </button>
              ))}
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
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
