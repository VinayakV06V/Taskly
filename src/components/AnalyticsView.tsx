import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Flame, BarChart3, PieChart, Layers } from 'lucide-react';
import { SystemStatistics } from '../types';

interface AnalyticsViewProps {
  stats: SystemStatistics | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
        <p className="text-slate-400 text-sm">Loading workspace metrics and statistics...</p>
      </div>
    );
  }

  const {
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    completionRate,
    highPriorityPending,
    priorityDistribution,
    categoryDistribution,
    weeklyActivity,
    longestStreak,
    totalHabitCheckins,
  } = stats;

  const maxDailyCount = Math.max(
    ...weeklyActivity.map((d) => Math.max(d.completedCount, d.createdCount, 1)),
    4
  );

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-['Outfit',sans-serif]">
          Completion Statistics &amp; Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Real-time completion throughput, weekly velocity, and category distribution.
        </p>

        {/* 4 Primary KPI Cards (Matches Image 2 & 1) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-[#F8FAFD] border border-slate-200/70 rounded-2xl p-4 card-press">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Completion Rate</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tabular-nums mt-2">
              {completionRate}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {completedTasks} of {totalTasks} finished
            </div>
          </div>

          <div className="bg-[#F8FAFD] border border-slate-200/70 rounded-2xl p-4 card-press">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Active Pending</span>
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-blue-600 font-['Outfit',sans-serif] tabular-nums mt-2">
              {pendingTasks}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {highPriorityPending} high priority
            </div>
          </div>

          <div className="bg-[#F8FAFD] border border-slate-200/70 rounded-2xl p-4 card-press">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Overdue Tasks</span>
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-rose-600 font-['Outfit',sans-serif] tabular-nums mt-2">
              {overdueTasks}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {overdueTasks > 0 ? 'Urgent action required' : 'None overdue'}
            </div>
          </div>

          <div className="bg-[#F8FAFD] border border-slate-200/70 rounded-2xl p-4 card-press">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Habit Streak Record</span>
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-amber-500 stroke-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-500 font-['Outfit',sans-serif] tabular-nums mt-2">
              {longestStreak} <span className="text-sm font-normal text-slate-400">days</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              {totalHabitCheckins} total check-ins
            </div>
          </div>
        </div>
      </div>

      {totalTasks === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center text-xs text-slate-400 shadow-xs">
          No task activity recorded yet. Add your first task to see completion velocity and priority breakdowns.
        </div>
      )}

      {/* Mid Section: Weekly Activity Velocity & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Velocity Bar Graph */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-['Outfit',sans-serif]">
                <BarChart3 className="w-4 h-4 text-[#FF5E5E]" />
                7-Day Completion Velocity
              </h3>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
                  Created
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Daily task completion throughput measured across rolling 7-day windows.
            </p>
          </div>

          {/* Bar Chart Visualization */}
          <div className="grid grid-cols-7 gap-2 items-end h-44 pt-4 border-b border-slate-100">
            {weeklyActivity.map((day) => {
              const compPercent = Math.round((day.completedCount / maxDailyCount) * 100);
              const createPercent = Math.round((day.createdCount / maxDailyCount) * 100);

              return (
                <div key={day.date} className="flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    <div
                      style={{ height: `${Math.max(6, createPercent)}%` }}
                      className="w-3.5 sm:w-4 bg-slate-200 rounded-t transition-all group-hover:bg-slate-300"
                      title={`${day.date}: ${day.createdCount} created`}
                    />
                    <div
                      style={{ height: `${Math.max(6, compPercent)}%` }}
                      className="w-3.5 sm:w-4 bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-600 shadow-xs"
                      title={`${day.date}: ${day.completedCount} completed`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-2 font-semibold">
                    {day.dayName}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {day.completedCount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1 font-['Outfit',sans-serif]">
              <PieChart className="w-4 h-4 text-[#FF5E5E]" />
              Priority Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Urgency level of recorded items.
            </p>

            <div className="space-y-4">
              {/* High */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-rose-600 font-bold">High Priority</span>
                  <span className="text-slate-700 font-mono tabular-nums">
                    {priorityDistribution.HIGH} ({totalTasks > 0 ? Math.round((priorityDistribution.HIGH / totalTasks) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all rounded-full"
                    style={{
                      width: `${totalTasks > 0 ? (priorityDistribution.HIGH / totalTasks) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-amber-600 font-bold">Medium Priority</span>
                  <span className="text-slate-700 font-mono tabular-nums">
                    {priorityDistribution.MEDIUM} ({totalTasks > 0 ? Math.round((priorityDistribution.MEDIUM / totalTasks) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all rounded-full"
                    style={{
                      width: `${totalTasks > 0 ? (priorityDistribution.MEDIUM / totalTasks) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Low */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-blue-600 font-bold">Low Priority</span>
                  <span className="text-slate-700 font-mono tabular-nums">
                    {priorityDistribution.LOW} ({totalTasks > 0 ? Math.round((priorityDistribution.LOW / totalTasks) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all rounded-full"
                    style={{
                      width: `${totalTasks > 0 ? (priorityDistribution.LOW / totalTasks) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
            High (Critical) · Med (Standard) · Low (Optional)
          </div>
        </div>
      </div>

      {/* Category Indexing Section */}
      {categoryDistribution.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1 font-['Outfit',sans-serif]">
            <Layers className="w-4 h-4 text-indigo-600" />
            Category Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Aggregated progress across your project domains.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryDistribution.map((cat: { category: string; total: number; completed: number }) => {
              const catRate = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
              return (
                <div
                  key={cat.category}
                  className="bg-[#F8FAFD] border border-slate-200/70 rounded-2xl p-4 card-press"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-800">{cat.category}</span>
                    <span className="text-xs font-mono font-semibold text-slate-500 tabular-nums">
                      {cat.completed}/{cat.total} done
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200/70 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-[#FF5E5E] transition-all rounded-full"
                      style={{ width: `${catRate}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 text-right font-medium">
                    {catRate}% completed
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
