import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistence Data Directory
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Domain Types
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type RecurrenceFrequency = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl: string;
  bio?: string;
  role: UserRole;
  createdAt: string;
}

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  nextDueDate?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  deadline: string;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  recurrence: RecurrenceRule;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  frequency: 'DAILY' | 'WEEKLY';
  targetDaysPerWeek: number;
  completionHistory: Record<string, boolean>;
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
}

export type AuditEventType =
  | 'LOGIN'
  | 'REGISTER'
  | 'LOGOUT'
  | 'TASK_CREATE'
  | 'TASK_TOGGLE'
  | 'TASK_DELETE'
  | 'TASK_SNOOZE'
  | 'HABIT_CREATE'
  | 'HABIT_CHECKIN'
  | 'PROFILE_UPDATE';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  type: AuditEventType;
  userId: string;
  userName: string;
  userEmail: string;
  ip: string;
  details: string;
  status: 'SUCCESS' | 'INFO' | 'WARN';
}

interface DatabaseStore {
  users: User[];
  tasks: Task[];
  habits: Habit[];
  auditLogs: AuditLogEntry[];
  tokens: Record<string, string>; // token -> userId
}

// In-Memory state backed by persistent file storage
let dbStore: DatabaseStore = {
  users: [],
  tasks: [],
  habits: [],
  auditLogs: [],
  tokens: {}
};

// Utilities
const hashPassword = (pw: string) => {
  return crypto.createHash('sha256').update(pw).digest('hex');
};

const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
const toLocalISOString = (d: Date) => {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
};
const toDateKey = (d: Date) => {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function getClientIp(req?: Request): string {
  if (!req) return '127.0.0.1 (Internal)';
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

function logAuditEvent(
  type: AuditEventType,
  user: { id: string; name: string; email: string },
  details: string,
  status: 'SUCCESS' | 'INFO' | 'WARN' = 'SUCCESS',
  req?: Request
) {
  const entry: AuditLogEntry = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    type,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    ip: getClientIp(req),
    details,
    status
  };

  if (!dbStore.auditLogs) {
    dbStore.auditLogs = [];
  }
  dbStore.auditLogs.unshift(entry);

  // Keep latest 500 logs in memory
  if (dbStore.auditLogs.length > 500) {
    dbStore.auditLogs = dbStore.auditLogs.slice(0, 500);
  }

  saveDatabase();
}

// Load or initialize store.json
function loadDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      dbStore = {
        users: parsed.users || [],
        tasks: parsed.tasks || [],
        habits: parsed.habits || [],
        auditLogs: parsed.auditLogs || [],
        tokens: parsed.tokens || {}
      };
      console.log(`Database loaded: ${dbStore.users.length} users, ${dbStore.tasks.length} tasks, ${dbStore.auditLogs.length} audit entries`);
    }

    // Ensure Admin User for varshneyjay00@gmail.com is configured
    let adminUser = dbStore.users.find(
      (u) => u.email.toLowerCase() === 'varshneyjay00@gmail.com'
    );
    if (!adminUser) {
      adminUser = {
        id: 'usr-admin-varshney',
        name: 'Jay Varshney (Admin)',
        email: 'varshneyjay00@gmail.com',
        passwordHash: hashPassword('admin123'),
        avatarUrl: '/src/assets/images/user_avatar_1792407645930.jpg',
        bio: 'Super Administrator & Lead Engineer',
        role: 'ADMIN',
        createdAt: new Date().toISOString()
      };
      dbStore.users.push(adminUser);
    } else {
      adminUser.role = 'ADMIN';
    }

    // Ensure any user with varshneyjay00@gmail.com or admin email gets ADMIN role
    dbStore.users.forEach((u) => {
      if (u.email.toLowerCase() === 'varshneyjay00@gmail.com' || u.email.toLowerCase().includes('admin')) {
        u.role = 'ADMIN';
      } else if (!u.role) {
        u.role = 'USER';
      }
    });

    // Seed initial startup audit log if none exist
    if (!dbStore.auditLogs || dbStore.auditLogs.length === 0) {
      dbStore.auditLogs = [
        {
          id: 'log-sys-boot',
          timestamp: new Date().toISOString(),
          type: 'LOGIN',
          userId: adminUser.id,
          userName: adminUser.name,
          userEmail: adminUser.email,
          ip: '127.0.0.1 (System)',
          details: 'Backend persistent database online and Admin Console active.',
          status: 'SUCCESS'
        }
      ];
    }

    saveDatabase();
  } catch (err) {
    console.error('Error loading database store:', err);
  }
}

function saveDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database store:', err);
  }
}

loadDatabase();

function recalculateStreak(habit: Habit) {
  let streak = 0;
  const cursor = new Date();
  const todayKey = toDateKey(cursor);

  if (!habit.completionHistory[todayKey]) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = toDateKey(cursor);
    if (habit.completionHistory[key]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  habit.currentStreak = streak;
  if (streak > habit.bestStreak) {
    habit.bestStreak = streak;
  }
}

function calculateNextDueDate(deadlineISO: string, rule: RecurrenceRule): string {
  const d = new Date(deadlineISO);
  const interval = Math.max(1, rule.interval || 1);
  if (rule.frequency === 'DAILY') {
    d.setDate(d.getDate() + interval);
  } else if (rule.frequency === 'WEEKLY') {
    d.setDate(d.getDate() + interval * 7);
  } else if (rule.frequency === 'MONTHLY') {
    d.setMonth(d.getMonth() + interval);
  }
  return toLocalISOString(d);
}

// Authentication Middleware
function getAuthUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return dbStore.tokens[token] || null;
  }
  return null;
}

function getAuthUser(req: Request): User | null {
  const userId = getAuthUserId(req);
  if (!userId) return null;
  return dbStore.users.find((u) => u.id === userId) || null;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // --- AUTH ENDPOINTS ---

  // POST /api/auth/register
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = dbStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    const role: UserRole =
      cleanEmail === 'varshneyjay00@gmail.com' || cleanEmail.includes('admin')
        ? 'ADMIN'
        : 'USER';

    const user: User = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hashPassword(password),
      avatarUrl: '/src/assets/images/user_avatar_1792407645930.jpg',
      bio: 'Focused on disciplined execution and daily habits.',
      role,
      createdAt: new Date().toISOString()
    };

    const token = 'tok_' + crypto.randomBytes(24).toString('hex');
    dbStore.users.push(user);
    dbStore.tokens[token] = user.id;
    saveDatabase();

    logAuditEvent(
      'REGISTER',
      user,
      `New user registered account (${role === 'ADMIN' ? 'Admin Role' : 'Standard Role'})`,
      'SUCCESS',
      req
    );

    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ success: true, token, user: safeUser });
  });

  // POST /api/auth/login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = dbStore.users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.passwordHash === hashPassword(password)
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Ensure role assignment
    if (user.email.toLowerCase() === 'varshneyjay00@gmail.com' || user.email.toLowerCase().includes('admin')) {
      user.role = 'ADMIN';
    }

    const token = 'tok_' + crypto.randomBytes(24).toString('hex');
    dbStore.tokens[token] = user.id;
    saveDatabase();

    logAuditEvent(
      'LOGIN',
      user,
      `Successful login session opened (${user.role} privileges)`,
      'SUCCESS',
      req
    );

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  });

  // POST /api/auth/guest-login (Quick demo access)
  app.post('/api/auth/guest-login', (req: Request, res: Response) => {
    let guest = dbStore.users.find((u) => u.email === 'guest@taskpulse.io');
    if (!guest) {
      guest = {
        id: 'usr-guest-' + Date.now(),
        name: 'Guest Explorer',
        email: 'guest@taskpulse.io',
        passwordHash: hashPassword('guest123'),
        avatarUrl: '/src/assets/images/user_avatar_1792407645930.jpg',
        bio: 'Exploring Taskly workspace.',
        role: 'USER',
        createdAt: new Date().toISOString()
      };
      dbStore.users.push(guest);
    }

    const token = 'tok_' + crypto.randomBytes(24).toString('hex');
    dbStore.tokens[token] = guest.id;
    saveDatabase();

    logAuditEvent('LOGIN', guest, 'Guest explorer demo session initiated', 'INFO', req);

    const { passwordHash: _, ...safeUser } = guest;
    res.json({ success: true, token, user: safeUser });
  });

  // POST /api/auth/admin-quick-login (1-click access for varshneyjay00@gmail.com)
  app.post('/api/auth/admin-quick-login', (req: Request, res: Response) => {
    let admin = dbStore.users.find((u) => u.email.toLowerCase() === 'varshneyjay00@gmail.com');
    if (!admin) {
      admin = {
        id: 'usr-admin-varshney',
        name: 'Jay Varshney (Admin)',
        email: 'varshneyjay00@gmail.com',
        passwordHash: hashPassword('admin123'),
        avatarUrl: '/src/assets/images/user_avatar_1792407645930.jpg',
        bio: 'Super Administrator & Lead Engineer',
        role: 'ADMIN',
        createdAt: new Date().toISOString()
      };
      dbStore.users.push(admin);
    } else {
      admin.role = 'ADMIN';
    }

    const token = 'tok_' + crypto.randomBytes(24).toString('hex');
    dbStore.tokens[token] = admin.id;
    saveDatabase();

    logAuditEvent('LOGIN', admin, 'Admin signed in with Super Administrator privileges', 'SUCCESS', req);

    const { passwordHash: _, ...safeUser } = admin;
    res.json({ success: true, token, user: safeUser });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });

  // PUT /api/auth/profile
  app.put('/api/auth/profile', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { name, bio, avatarUrl } = req.body;
    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatarUrl) user.avatarUrl = avatarUrl;

    saveDatabase();

    logAuditEvent('PROFILE_UPDATE', user, `User updated profile settings`, 'INFO', req);

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      delete dbStore.tokens[token];
      saveDatabase();
    }
    if (user) {
      logAuditEvent('LOGOUT', user, `User ended session and logged out`, 'INFO', req);
    }
    res.json({ success: true });
  });

  // --- API: TASKS CRUD (User Scoped & Stored in dbStore) ---

  // GET /api/tasks
  app.get('/api/tasks', (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.json({ success: true, tasks: [] });
    }

    const { sort, priority, category, status, search } = req.query;
    let result = dbStore.tasks.filter((t) => t.userId === userId);

    if (typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    if (priority && priority !== 'ALL') {
      result = result.filter((t) => t.priority === priority);
    }

    if (category && category !== 'ALL') {
      result = result.filter((t) => t.category.toLowerCase() === (category as string).toLowerCase());
    }

    const currentTime = Date.now();
    if (status === 'COMPLETED') {
      result = result.filter((t) => t.isCompleted);
    } else if (status === 'PENDING') {
      result = result.filter((t) => !t.isCompleted);
    } else if (status === 'OVERDUE') {
      result = result.filter((t) => !t.isCompleted && new Date(t.deadline).getTime() < currentTime);
    }

    // Sort
    if (sort === 'priority') {
      const weights: Record<Priority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      result.sort((a, b) => weights[b.priority] - weights[a.priority]);
    } else if (sort === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'created') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }

    res.json({ success: true, tasks: result });
  });

  // POST /api/tasks
  app.post('/api/tasks', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Please log in to add tasks' });
    }

    const { title, description, priority, category, deadline, recurrence } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }

    const newTask: Task = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      userId: user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority && ['HIGH', 'MEDIUM', 'LOW'].includes(priority) ? priority : 'MEDIUM',
      category: category && category.trim() ? category.trim() : 'General',
      deadline: deadline || toLocalISOString(new Date(Date.now() + 24 * 3600 * 1000)),
      isCompleted: false,
      completedAt: null,
      createdAt: toLocalISOString(new Date()),
      recurrence: recurrence || { frequency: 'NONE', interval: 1 }
    };

    dbStore.tasks.unshift(newTask);
    saveDatabase();

    logAuditEvent(
      'TASK_CREATE',
      user,
      `Created task "${newTask.title}" [Priority: ${newTask.priority}, Category: ${newTask.category}]`,
      'SUCCESS',
      req
    );

    res.status(201).json({ success: true, task: newTask });
  });

  // PUT /api/tasks/:id
  app.put('/api/tasks/:id', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const { id } = req.params;
    const taskIndex = dbStore.tasks.findIndex((t) => t.id === id && t.userId === user.id);
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const { title, description, priority, category, deadline, recurrence } = req.body;
    const existing = dbStore.tasks[taskIndex];
    dbStore.tasks[taskIndex] = {
      ...existing,
      title: title !== undefined ? title.trim() : existing.title,
      description: description !== undefined ? description.trim() : existing.description,
      priority: priority || existing.priority,
      category: category !== undefined ? category.trim() : existing.category,
      deadline: deadline || existing.deadline,
      recurrence: recurrence || existing.recurrence
    };

    saveDatabase();
    res.json({ success: true, task: dbStore.tasks[taskIndex] });
  });

  // PATCH /api/tasks/:id/toggle
  app.patch('/api/tasks/:id/toggle', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const { id } = req.params;
    const task = dbStore.tasks.find((t) => t.id === id && t.userId === user.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    let spawnedTask: Task | null = null;
    if (!task.isCompleted) {
      task.isCompleted = true;
      task.completedAt = toLocalISOString(new Date());

      if (task.recurrence && task.recurrence.frequency !== 'NONE') {
        const nextDue = calculateNextDueDate(task.deadline, task.recurrence);
        spawnedTask = {
          id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          userId: user.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          category: task.category,
          deadline: nextDue,
          isCompleted: false,
          completedAt: null,
          createdAt: toLocalISOString(new Date()),
          recurrence: task.recurrence
        };
        dbStore.tasks.push(spawnedTask);
      }

      logAuditEvent('TASK_TOGGLE', user, `Completed task "${task.title}"`, 'SUCCESS', req);
    } else {
      task.isCompleted = false;
      task.completedAt = null;
      logAuditEvent('TASK_TOGGLE', user, `Re-opened task "${task.title}"`, 'INFO', req);
    }

    saveDatabase();
    res.json({ success: true, task, spawnedTask });
  });

  // POST /api/tasks/:id/snooze
  app.post('/api/tasks/:id/snooze', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const { id } = req.params;
    const { hours } = req.body;
    const task = dbStore.tasks.find((t) => t.id === id && t.userId === user.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const currentDue = new Date(task.deadline).getTime();
    const addMs = (Number(hours) || 24) * 3600 * 1000;
    const newDueDate = new Date(Math.max(Date.now(), currentDue) + addMs);
    task.deadline = toLocalISOString(newDueDate);

    saveDatabase();

    logAuditEvent(
      'TASK_SNOOZE',
      user,
      `Snoozed task "${task.title}" by +${hours || 24} hours`,
      'INFO',
      req
    );

    res.json({ success: true, task });
  });

  // DELETE /api/tasks/:id
  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const { id } = req.params;
    const target = dbStore.tasks.find((t) => t.id === id && t.userId === user.id);
    if (!target) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const title = target.title;
    dbStore.tasks = dbStore.tasks.filter((t) => t.id !== id);
    saveDatabase();

    logAuditEvent('TASK_DELETE', user, `Deleted task "${title}"`, 'WARN', req);

    res.json({ success: true, message: 'Task deleted' });
  });

  // --- API: HABITS CRUD (User Scoped) ---

  // GET /api/habits
  app.get('/api/habits', (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    if (!userId) return res.json({ success: true, habits: [] });

    const userHabits = dbStore.habits.filter((h) => h.userId === userId);
    res.json({ success: true, habits: userHabits });
  });

  // POST /api/habits
  app.post('/api/habits', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const { title, description, category, frequency, targetDaysPerWeek } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Habit title is required' });
    }

    const newHabit: Habit = {
      id: 'habit-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      userId: user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category && category.trim() ? category.trim() : 'General',
      frequency: frequency === 'WEEKLY' ? 'WEEKLY' : 'DAILY',
      targetDaysPerWeek: Math.max(1, Math.min(7, Number(targetDaysPerWeek) || 5)),
      completionHistory: {},
      currentStreak: 0,
      bestStreak: 0,
      createdAt: toDateKey(new Date())
    };

    dbStore.habits.unshift(newHabit);
    saveDatabase();

    logAuditEvent('HABIT_CREATE', user, `Created habit "${newHabit.title}"`, 'SUCCESS', req);

    res.status(201).json({ success: true, habit: newHabit });
  });

  // POST /api/habits/:id/toggle-date
  app.post('/api/habits/:id/toggle-date', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const { id } = req.params;
    const { date } = req.body;
    const habit = dbStore.habits.find((h) => h.id === id && h.userId === user.id);
    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    const targetDateKey = date || toDateKey(new Date());
    const wasChecked = Boolean(habit.completionHistory[targetDateKey]);
    if (wasChecked) {
      delete habit.completionHistory[targetDateKey];
    } else {
      habit.completionHistory[targetDateKey] = true;
    }

    recalculateStreak(habit);
    saveDatabase();

    logAuditEvent(
      'HABIT_CHECKIN',
      user,
      `${wasChecked ? 'Unchecked' : 'Checked in'} habit "${habit.title}" for ${targetDateKey} (Streak: ${habit.currentStreak})`,
      'SUCCESS',
      req
    );

    res.json({ success: true, habit });
  });

  // DELETE /api/habits/:id
  app.delete('/api/habits/:id', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ success: false, error: 'Not authenticated' });

    const { id } = req.params;
    dbStore.habits = dbStore.habits.filter((h) => !(h.id === id && h.userId === user.id));
    saveDatabase();
    res.json({ success: true, message: 'Habit removed' });
  });

  // --- API: STATS & ALERTS (User Scoped) ---

  // GET /api/stats
  app.get('/api/stats', (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    const userTasks = userId ? dbStore.tasks.filter((t) => t.userId === userId) : [];
    const userHabits = userId ? dbStore.habits.filter((h) => h.userId === userId) : [];

    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter((t) => t.isCompleted).length;
    const pendingTasks = userTasks.filter((t) => !t.isCompleted).length;

    const currentEpoch = Date.now();
    const overdueTasks = userTasks.filter(
      (t) => !t.isCompleted && new Date(t.deadline).getTime() < currentEpoch
    ).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const highPriorityPending = userTasks.filter((t) => !t.isCompleted && t.priority === 'HIGH').length;

    const priorityDistribution = {
      HIGH: userTasks.filter((t) => t.priority === 'HIGH').length,
      MEDIUM: userTasks.filter((t) => t.priority === 'MEDIUM').length,
      LOW: userTasks.filter((t) => t.priority === 'LOW').length
    };

    const categoryMap: Record<string, { total: number; completed: number }> = {};
    for (const t of userTasks) {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { total: 0, completed: 0 };
      }
      categoryMap[t.category].total++;
      if (t.isCompleted) {
        categoryMap[t.category].completed++;
      }
    }
    const categoryDistribution = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      total: categoryMap[cat].total,
      completed: categoryMap[cat].completed
    }));

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = toDateKey(d);
      const dayName = dayNames[d.getDay()];

      const completedCount = userTasks.filter(
        (t) => t.isCompleted && t.completedAt && t.completedAt.startsWith(dateStr)
      ).length;

      const createdCount = userTasks.filter((t) => t.createdAt.startsWith(dateStr)).length;

      weeklyActivity.push({
        date: dateStr,
        dayName,
        completedCount,
        createdCount
      });
    }

    const longestStreak = userHabits.length > 0 ? Math.max(...userHabits.map((h) => h.bestStreak), 0) : 0;
    const totalHabitCheckins = userHabits.reduce(
      (sum, h) => sum + Object.keys(h.completionHistory).length,
      0
    );

    res.json({
      success: true,
      stats: {
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
        totalHabitCheckins
      }
    });
  });

  // GET /api/alerts & /api/alerts/overdue
  app.get(['/api/alerts', '/api/alerts/overdue'], (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    const userTasks = userId ? dbStore.tasks.filter((t) => t.userId === userId) : [];

    const currentEpoch = Date.now();
    const alerts = [];

    for (const t of userTasks) {
      if (t.isCompleted) continue;
      const deadlineEpoch = new Date(t.deadline).getTime();
      const diffMs = currentEpoch - deadlineEpoch;

      if (diffMs > 0) {
        const hoursOverdue = Math.round(diffMs / (3600 * 1000));
        alerts.push({
          taskId: t.id,
          title: t.title,
          priority: t.priority,
          category: t.category,
          deadline: t.deadline,
          hoursOverdue,
          isCritical: t.priority === 'HIGH' || hoursOverdue > 24
        });
      }
    }

    alerts.sort((a, b) => b.hoursOverdue - a.hoursOverdue);
    res.json({ success: true, alerts });
  });

  // --- API: ADMIN BACKEND & LIVE ENTRIES ---

  // GET /api/admin/overview
  app.get('/api/admin/overview', (req: Request, res: Response) => {
    let fileSize = '0 KB';
    try {
      if (fs.existsSync(DATA_FILE)) {
        const stats = fs.statSync(DATA_FILE);
        fileSize = (stats.size / 1024).toFixed(1) + ' KB';
      }
    } catch {}

    const totalUsers = dbStore.users.length;
    const totalTasks = dbStore.tasks.length;
    const totalHabits = dbStore.habits.length;
    const totalLogs = dbStore.auditLogs ? dbStore.auditLogs.length : 0;
    const activeSessions = Object.keys(dbStore.tokens).length;

    res.json({
      success: true,
      overview: {
        totalUsers,
        totalTasks,
        totalHabits,
        totalLogs,
        activeSessions,
        dbFileSize: fileSize,
        dbEngine: 'Persistent File-Backed JSON Engine (data/store.json)',
        lastUpdated: new Date().toISOString()
      }
    });
  });

  // GET /api/admin/entries (Live activity & audit entries across all users)
  app.get('/api/admin/entries', (req: Request, res: Response) => {
    const { type, search, limit } = req.query;
    let logs = [...(dbStore.auditLogs || [])];

    if (type && type !== 'ALL') {
      logs = logs.filter((l) => l.type === type);
    }

    if (typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      logs = logs.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.userEmail.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.type.toLowerCase().includes(q)
      );
    }

    const max = Number(limit) || 100;
    res.json({ success: true, entries: logs.slice(0, max), totalCount: logs.length });
  });

  // GET /api/admin/users (All registered users with stats)
  app.get('/api/admin/users', (_req: Request, res: Response) => {
    const usersSummary = dbStore.users.map((u) => {
      const userTasks = dbStore.tasks.filter((t) => t.userId === u.id);
      const completedTasks = userTasks.filter((t) => t.isCompleted).length;
      const userHabits = dbStore.habits.filter((h) => h.userId === u.id);

      // Find user's last audit log
      const lastLog = (dbStore.auditLogs || []).find((l) => l.userId === u.id);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatarUrl: u.avatarUrl,
        createdAt: u.createdAt,
        lastActive: lastLog ? lastLog.timestamp : u.createdAt,
        totalTasks: userTasks.length,
        completedTasks,
        totalHabits: userHabits.length
      };
    });

    res.json({ success: true, users: usersSummary });
  });

  // GET /api/admin/all-tasks (All tasks across all users for admin review)
  app.get('/api/admin/all-tasks', (_req: Request, res: Response) => {
    const allTasksWithUser = dbStore.tasks.map((task) => {
      const owner = dbStore.users.find((u) => u.id === task.userId);
      return {
        ...task,
        userName: owner ? owner.name : 'Unknown User',
        userEmail: owner ? owner.email : 'unknown'
      };
    });

    res.json({ success: true, tasks: allTasksWithUser });
  });

  // DELETE /api/admin/entries/:id
  app.delete('/api/admin/entries/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    if (dbStore.auditLogs) {
      dbStore.auditLogs = dbStore.auditLogs.filter((l) => l.id !== id);
      saveDatabase();
    }
    res.json({ success: true, message: 'Audit entry removed' });
  });

  // POST /api/admin/entries/clear
  app.post('/api/admin/entries/clear', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    dbStore.auditLogs = [
      {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        type: 'LOGOUT',
        userId: user ? user.id : 'admin',
        userName: user ? user.name : 'Administrator',
        userEmail: user ? user.email : 'varshneyjay00@gmail.com',
        ip: getClientIp(req),
        details: 'Audit logs cleared by administrator',
        status: 'WARN'
      }
    ];
    saveDatabase();
    res.json({ success: true, message: 'Logs cleared' });
  });

  // GET /api/admin/raw-store
  app.get('/api/admin/raw-store', (_req: Request, res: Response) => {
    // Redact password hashes before serving
    const safeUsers = dbStore.users.map(({ passwordHash: _, ...u }) => u);
    res.json({
      success: true,
      store: {
        users: safeUsers,
        tasks: dbStore.tasks,
        habits: dbStore.habits,
        auditLogs: dbStore.auditLogs || [],
        activeTokenCount: Object.keys(dbStore.tokens).length
      }
    });
  });

  // Export JSON endpoint
  app.get('/api/export/json', (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    const userTasks = userId ? dbStore.tasks.filter((t) => t.userId === userId) : [];
    const userHabits = userId ? dbStore.habits.filter((h) => h.userId === userId) : [];

    const exportData = {
      exportedAt: new Date().toISOString(),
      tasks: userTasks,
      habits: userHabits
    };
    res.setHeader('Content-Disposition', 'attachment; filename="task_habit_export.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(exportData, null, 2));
  });

  // Catch unhandled /api routes and return JSON 404 (prevents Vite HTML SPA fallback)
  app.all('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'API endpoint not found' });
  });

  // Global API error handler ensuring JSON responses
  app.use((err: any, _req: Request, res: Response, _next: any) => {
    console.error('API Error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  });

  // Serve migrated assets from .images folder with dotfiles enabled
  app.use('/.images', express.static(path.resolve(__dirname, '.images'), { dotfiles: 'allow' }));

  // In development, mount Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Taskly Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server launch failed:', err);
  process.exit(1);
});
