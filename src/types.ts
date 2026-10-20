export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export type RecurrenceFrequency = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  status?: string;
  role?: string;
  createdAt: string;
}

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  nextDueDate?: string;
}

export interface Task {
  id: string;
  userId?: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  deadline: string; // ISO string: YYYY-MM-DDTHH:mm:ss
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  recurrence: RecurrenceRule;
  companyLogo?: string;
  companyName?: string;
  assignedTeam?: Array<{ name: string; avatar: string }>;
  tag?: string;
}

export interface Habit {
  id: string;
  userId?: string;
  title: string;
  description: string;
  category: string;
  frequency: 'DAILY' | 'WEEKLY';
  targetDaysPerWeek: number;
  completionHistory: Record<string, boolean>; // 'YYYY-MM-DD': true
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
}

export interface DayActivity {
  date: string;
  dayName: string;
  completedCount: number;
  createdCount: number;
}

export interface CategoryMetric {
  category: string;
  total: number;
  completed: number;
}

export interface SystemStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  highPriorityPending: number;
  plannedTodayCount: number;
  finishedYesterdayCount: number;
  dueThisWeekCount: number;
  weeklyActivity: DayActivity[];
  longestStreak: number;
  priorityDistribution: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  categoryDistribution: CategoryMetric[];
  totalHabitCheckins: number;
}

export interface OverdueAlert {
  taskId: string;
  title: string;
  deadline: string;
  hoursOverdue: number;
  priority: Priority;
  category: string;
  isCritical: boolean;
}

export type ViewTab = 'dashboard' | 'tasks' | 'kanban' | 'habits' | 'analytics' | 'alerts';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'success' | 'alert' | 'info';
}

// Audit types (for server compatibility)
export type AuditEventType = string;

export interface AuditLogEntry {
  id: string;
  type: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  summary: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'INFO' | 'WARN' | 'ERROR';
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  tasksCount: number;
  completedTasksCount: number;
  habitsCount: number;
}

export interface AdminSystemOverview {
  totalUsers: number;
  totalTasks: number;
  completedTasks: number;
  totalHabits: number;
  activeSessions: number;
  totalAuditEntries: number;
  serverUptimeSeconds: number;
  databaseSizeBytes: number;
}
