import React, { useState, useEffect, useRef } from 'react';
import { Clock, Bell, Plus, Trash2, X, AlertTriangle, Check, Volume2, VolumeX, Sparkles } from 'lucide-react';

export interface UserAlarm {
  id: string;
  time: string; // "HH:MM" in 24h format
  label: string;
  enabled: boolean;
  soundEnabled: boolean;
  lastFiredDate?: string;
}

interface ClockAlarmWidgetProps {
  onAlarmTriggered: (alarm: UserAlarm) => void;
  accentColor?: string;
}

// Web Audio API chime synthesizer (Works without external audio files)
function playAlarmChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.15 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.15);
      osc.stop(ctx.currentTime + idx * 0.15 + 0.45);
    });
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

export const ClockAlarmWidget: React.FC<ClockAlarmWidgetProps> = ({
  onAlarmTriggered,
  accentColor = '#FF7243',
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  // Strictly NO prior alarms! Empty array initially or loaded from localStorage if user created any.
  const [alarms, setAlarms] = useState<UserAlarm[]>(() => {
    try {
      const saved = localStorage.getItem('taskly_alarms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAddingAlarm, setIsAddingAlarm] = useState(false);
  const [alarmTimeInput, setAlarmTimeInput] = useState('');
  const [alarmLabelInput, setAlarmLabelInput] = useState('');
  const [ringingAlarm, setRingingAlarm] = useState<UserAlarm | null>(null);

  const alarmsRef = useRef<UserAlarm[]>(alarms);
  alarmsRef.current = alarms;
  const onAlarmTriggeredRef = useRef(onAlarmTriggered);
  onAlarmTriggeredRef.current = onAlarmTriggered;

  // Sync alarms to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('taskly_alarms', JSON.stringify(alarms));
    } catch {}
  }, [alarms]);

  // Real-time ticking clock & alarm monitor (Mounted once)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const hoursStr = String(now.getHours()).padStart(2, '0');
      const minutesStr = String(now.getMinutes()).padStart(2, '0');
      const currentHM = `${hoursStr}:${minutesStr}`;
      const todayDateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

      // Check alarms against current time
      alarmsRef.current.forEach((alarm) => {
        if (alarm.enabled && alarm.time === currentHM && alarm.lastFiredDate !== todayDateStr) {
          // Trigger alarm!
          playAlarmChime();
          setRingingAlarm(alarm);
          onAlarmTriggeredRef.current(alarm);

          // Update lastFiredDate so it only triggers once per minute
          setAlarms((prev) =>
            prev.map((a) => (a.id === alarm.id ? { ...a, lastFiredDate: todayDateStr } : a))
          );
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alarmTimeInput) return;

    const newAlarm: UserAlarm = {
      id: 'alarm-' + Date.now(),
      time: alarmTimeInput,
      label: alarmLabelInput.trim() || 'Task Reminder',
      enabled: true,
      soundEnabled: true,
    };

    setAlarms((prev) => [...prev, newAlarm]);
    setAlarmTimeInput('');
    setAlarmLabelInput('');
    setIsAddingAlarm(false);
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  // Test Alarm in 5 seconds
  const handleTestAlarm = () => {
    const in5Sec = new Date(Date.now() + 5000);
    const testAlarm: UserAlarm = {
      id: 'test-alarm-' + Date.now(),
      time: `${String(in5Sec.getHours()).padStart(2, '0')}:${String(in5Sec.getMinutes()).padStart(2, '0')}`,
      label: 'Test Alarm Alert',
      enabled: true,
      soundEnabled: true,
    };
    playAlarmChime();
    setRingingAlarm(testAlarm);
    onAlarmTriggered(testAlarm);
  };

  // Format real-time clock
  const timeFormatted = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateFormatted = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-4">
      {/* Top Header & Live Digital Clock */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: accentColor }}
          >
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono">
              Live Clock &amp; Reminders
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              {dateFormatted}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingAlarm(!isAddingAlarm)}
          className="text-xs font-bold text-white px-3 py-1.5 rounded-xl shadow-xs transition-transform btn-press cursor-pointer flex items-center gap-1 font-['Outfit',sans-serif]"
          style={{ backgroundColor: accentColor }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Set Alarm</span>
        </button>
      </div>

      {/* Clock Digital Display */}
      <div className="bg-[#FAF7F2] rounded-2xl p-4 text-center border border-slate-200/60">
        <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-wider">
          {timeFormatted}
        </div>
        <div className="text-[11px] text-slate-500 font-medium mt-1">
          {alarms.filter((a) => a.enabled).length} active reminder{alarms.filter((a) => a.enabled).length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Ringing Alarm Modal Banner */}
      {ringingAlarm && (
        <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-lg animate-bounce flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Bell className="w-5 h-5 shrink-0 animate-spin" />
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider">⏰ Alarm Alert!</div>
              <div className="text-sm font-extrabold truncate">{ringingAlarm.label}</div>
            </div>
          </div>
          <button
            onClick={() => setRingingAlarm(null)}
            className="px-3 py-1 text-xs font-black bg-white text-slate-900 rounded-xl shadow-xs hover:bg-slate-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add Alarm Form */}
      {isAddingAlarm && (
        <form onSubmit={handleAddAlarm} className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 font-['Outfit',sans-serif]">
              New Reminder / Alarm
            </span>
            <button
              type="button"
              onClick={() => setIsAddingAlarm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Alarm Time
            </label>
            <input
              type="time"
              required
              value={alarmTimeInput}
              onChange={(e) => setAlarmTimeInput(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Label / Purpose
            </label>
            <input
              type="text"
              placeholder="e.g. Daily Standup, Break, Client Call"
              value={alarmLabelInput}
              onChange={(e) => setAlarmLabelInput(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleTestAlarm}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Test Chime
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs btn-press cursor-pointer font-['Outfit',sans-serif]"
              style={{ backgroundColor: accentColor }}
            >
              Save Alarm
            </button>
          </div>
        </form>
      )}

      {/* Alarms List */}
      <div className="space-y-2">
        {alarms.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-xs text-slate-400">
              No alarms set yet. Click &quot;Set Alarm&quot; to add a reminder.
            </p>
          </div>
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                alarm.enabled
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-slate-50 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleAlarm(alarm.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                    alarm.enabled
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                  title={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}
                >
                  {alarm.enabled && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                <div className="min-w-0">
                  <div className="font-mono font-black text-sm text-slate-900">
                    {alarm.time}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-medium">
                    {alarm.label}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDeleteAlarm(alarm.id)}
                  className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Delete alarm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
