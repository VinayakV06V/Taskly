import React, { useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Check, Plus, Trash2, Calendar, Award } from 'lucide-react';
import { Habit } from '../types';

interface HabitTrackerViewProps {
  habits: Habit[];
  onToggleHabitDate: (habitId: string, dateStr: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onOpenCreateHabitModal: () => void;
}

export const HabitTrackerView: React.FC<HabitTrackerViewProps> = ({
  habits,
  onToggleHabitDate,
  onDeleteHabit,
  onOpenCreateHabitModal,
}) => {
  const last7Days = useMemo(() => {
    const days = [];
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      days.push({
        dateStr,
        dayName: dayNames[d.getDay()],
        dayNumber: d.getDate(),
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  const totalLogs = habits.reduce((acc, h) => acc + Object.keys(h.completionHistory).length, 0);
  const highestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.bestStreak), 0) : 0;

  const handleToggleDateWithConfetti = (habitId: string, dateStr: string, isDone: boolean) => {
    if (!isDone) {
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.65 },
          colors: ['#10B981', '#FF5E5E', '#3B82F6']
        });
      } catch (e) {}
    }
    onToggleHabitDate(habitId, dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
              <span>Recurring Habits &amp; Streaks</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Build daily consistency, log check-ins across the weekly matrix, and maintain streaks.
            </p>
          </div>

          <button
            onClick={onOpenCreateHabitModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#FF5E5E] hover:bg-[#FF4545] rounded-full shadow-md shadow-[#FF5E5E]/20 btn-press cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Habit</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-[#F8FAFD] border border-slate-200/60 rounded-2xl p-4">
            <div className="text-xs text-slate-500 font-medium">Active Habits</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {habits.length}
            </div>
          </div>
          <div className="bg-[#F8FAFD] border border-slate-200/60 rounded-2xl p-4">
            <div className="text-xs text-slate-500 font-medium">Total Check-ins</div>
            <div className="text-2xl font-bold text-indigo-600 font-mono tabular-nums mt-0.5">
              {totalLogs}
            </div>
          </div>
          <div className="bg-[#F8FAFD] border border-slate-200/60 rounded-2xl p-4 col-span-2 sm:col-span-1">
            <div className="text-xs text-slate-500 font-medium">Longest Streak Record</div>
            <div className="text-2xl font-bold text-amber-500 font-mono tabular-nums mt-0.5 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-amber-500" />
              {highestStreak} days
            </div>
          </div>
        </div>
      </div>

      {/* Habits List & 7-Day Grid */}
      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No recurring habits added yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Habits only show up when you add them. Create your first habit with target weekly frequency.
            </p>
            <button
              onClick={onOpenCreateHabitModal}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF5E5E] hover:bg-[#FF4545] rounded-full shadow-md shadow-[#FF5E5E]/20 btn-press cursor-pointer"
            >
              + Create First Habit
            </button>
          </div>
        ) : (
          habits.map((habit) => {
            const weekCompletedCount = last7Days.filter((d) => habit.completionHistory[d.dateStr]).length;
            const weekTarget = habit.targetDaysPerWeek || 7;
            const isWeekGoalMet = weekCompletedCount >= weekTarget;

            return (
              <div
                key={habit.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 card-press shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left: Habit Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-bold text-slate-900 tracking-tight truncate">
                        {habit.title}
                      </h4>
                      <button
                        onClick={() => onDeleteHabit(habit.id)}
                        title="Delete Habit"
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors rounded-lg hover:bg-rose-50 btn-press cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {habit.description && (
                      <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                        {habit.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {habit.category}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-indigo-600 font-semibold">
                        {weekCompletedCount}/{weekTarget} days this week
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono text-amber-500 font-bold">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        Current: {habit.currentStreak}d
                      </span>
                      <span>·</span>
                      <span className="font-mono text-slate-400">
                        Best: {habit.bestStreak}d
                      </span>
                    </div>
                  </div>

                  {/* Right: 7-Day Interactive Matrix */}
                  <div className="shrink-0">
                    <div className="flex items-center gap-2">
                      {last7Days.map((day) => {
                        const isDone = Boolean(habit.completionHistory[day.dateStr]);
                        return (
                          <div key={day.dateStr} className="flex flex-col items-center">
                            <span className="text-[10px] font-mono font-medium text-slate-400 mb-1">
                              {day.dayName}
                            </span>
                            <button
                              onClick={() => handleToggleDateWithConfetti(habit.id, day.dateStr, isDone)}
                              title={`${day.dateStr}: ${isDone ? 'Mark Incomplete' : 'Mark Completed'}`}
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center transition-all btn-press cursor-pointer border ${
                                isDone
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                  : day.isToday
                                  ? 'bg-white border-[#FF5E5E] text-slate-800 shadow-xs'
                                  : 'bg-[#F8FAFD] border-slate-200 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              {isDone ? (
                                <Check className="w-4 h-4 stroke-[3]" />
                              ) : (
                                <span className="text-xs font-mono font-bold">
                                  {day.dayNumber}
                                </span>
                              )}
                            </button>
                            {day.isToday && (
                              <span className="text-[9px] font-mono font-bold text-[#FF5E5E] mt-1">
                                Today
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isWeekGoalMet ? 'bg-emerald-500' : 'bg-[#FF5E5E]'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((weekCompletedCount / weekTarget) * 100))}%`
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 whitespace-nowrap">
                    {Math.round((weekCompletedCount / weekTarget) * 100)}% weekly target
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
