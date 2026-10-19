import React from 'react';
import confetti from 'canvas-confetti';
import { AlertOctagon, CheckCircle2, Clock, Check, ArrowRight } from 'lucide-react';
import { OverdueAlert } from '../types';

interface OverdueAlertsViewProps {
  alerts: OverdueAlert[];
  onToggleTask: (id: string) => void;
  onSnoozeTask: (id: string, hours: number) => void;
  onNavigateToTasks: () => void;
}

export const OverdueAlertsView: React.FC<OverdueAlertsViewProps> = ({
  alerts,
  onToggleTask,
  onSnoozeTask,
  onNavigateToTasks,
}) => {
  const criticalCount = alerts.filter((a) => a.isCritical).length;

  const handleResolveWithConfetti = (taskId: string) => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10B981', '#3B82F6', '#FF5E5E']
      });
    } catch (e) {}
    onToggleTask(taskId);
  };

  return (
    <div className="space-y-6">
      {/* Alert Header Banner */}
      <div className={`rounded-3xl border p-6 sm:p-8 bg-white shadow-xs ${
        alerts.length > 0 ? 'border-rose-200' : 'border-slate-200/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-2xl shrink-0 ${
              alerts.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {alerts.length > 0 ? (
                <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                <span>Vital / Overdue Tasks</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Immediate attention queue for deliverables past their target completion deadline.
              </p>
            </div>
          </div>

          {alerts.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap self-start sm:self-auto">
              {alerts.length} Overdue ({criticalCount} Critical)
            </div>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">All Clear! No Overdue Deadlines</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Every scheduled task is within its target deadline window. Keep up the high velocity!
            </p>
            <button
              onClick={onNavigateToTasks}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#FF5E5E] hover:bg-[#FF4545] rounded-full shadow-md shadow-[#FF5E5E]/20 btn-press cursor-pointer"
            >
              <span>View Active Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          alerts.map((alert) => {
            const deadlineDate = new Date(alert.deadline);
            return (
              <div
                key={alert.taskId}
                className="bg-white rounded-3xl border border-rose-200 p-5 sm:p-6 card-press shadow-xs hover:border-rose-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 uppercase">
                        VITAL ALERT
                      </span>
                      <h4 className="text-base font-bold text-slate-900 truncate">
                        {alert.title}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2 font-medium">
                      <span className={`font-semibold ${
                        alert.priority === 'HIGH' ? 'text-rose-600' : 'text-amber-600'
                      }`}>
                        Priority: {alert.priority}
                      </span>
                      <span>·</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 text-[11px]">
                        {alert.category}
                      </span>
                      <span>·</span>
                      <span className="font-mono font-bold text-rose-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Elapsed: {alert.hoursOverdue} hours overdue
                      </span>
                      <span>·</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Due was: {deadlineDate.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolveWithConfetti(alert.taskId)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-sm btn-press cursor-pointer whitespace-nowrap"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Mark Complete</span>
                    </button>

                    <button
                      onClick={() => onSnoozeTask(alert.taskId, 24)}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full btn-press cursor-pointer whitespace-nowrap"
                    >
                      +24h Snooze
                    </button>

                    <button
                      onClick={() => onSnoozeTask(alert.taskId, 72)}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full btn-press cursor-pointer whitespace-nowrap"
                    >
                      +3d Snooze
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
