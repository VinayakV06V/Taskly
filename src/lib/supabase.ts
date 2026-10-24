import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configured Supabase Project: tyfmvbcxllothsaymvoc
export const SUPABASE_PROJECT_ID = 'tyfmvbcxllothsaymvoc';
export const DEFAULT_SUPABASE_URL = 'https://tyfmvbcxllothsaymvoc.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_EHigM8YRqM6QuYVNJ7Tr8w_EwUSZEe_';

const STORAGE_KEY_URL = 'taskpulse_supabase_url';
const STORAGE_KEY_ANON = 'taskpulse_supabase_anon_key';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  return {
    url: localStorage.getItem(STORAGE_KEY_URL) || (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    anonKey: localStorage.getItem(STORAGE_KEY_ANON) || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string): void {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  else localStorage.removeItem(STORAGE_KEY_ANON);
}

let activeClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) return null;

  try {
    if (!activeClient) {
      activeClient = createClient(url, anonKey);
    }
    return activeClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function resetSupabaseClient(): void {
  activeClient = null;
}

export async function testSupabaseConnection(
  url = DEFAULT_SUPABASE_URL,
  anonKey = DEFAULT_SUPABASE_ANON_KEY
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    if (!url.startsWith('https://')) {
      return { success: false, message: 'Supabase URL must start with https://' };
    }
    const testClient = createClient(url, anonKey);
    const { data: sessionData, error: sessionError } = await testClient.auth.getSession();
    if (sessionError) {
      return { success: false, message: sessionError.message };
    }

    return {
      success: true,
      message: `Connected to Supabase project (${SUPABASE_PROJECT_ID}) successfully!`,
      details: { projectId: SUPABASE_PROJECT_ID, session: sessionData }
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed. Verify your Supabase URL & Key.' };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Supabase SQL Schema for Taskly (Project: tyfmvbcxllothsaymvoc)
-- Paste and run this in your Supabase project's SQL Editor (Dashboard -> SQL Editor)

-- 1. Users Table (Stores user accounts when created or logged into)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'USER',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'MEDIUM',
  category TEXT DEFAULT 'General',
  deadline TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  recurrence JSONB DEFAULT '{"frequency": "NONE", "interval": 1}'::jsonb
);

-- 3. Habits Table
CREATE TABLE IF NOT EXISTS public.habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  frequency TEXT DEFAULT 'DAILY',
  target_days_per_week INT DEFAULT 5,
  completion_history JSONB DEFAULT '{}'::jsonb,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  type TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'SUCCESS',
  ip TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for habits" ON public.habits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
`;
