import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default / Local Supabase Config stored in localStorage for runtime flexibility
const STORAGE_KEY_URL = 'taskpulse_supabase_url';
const STORAGE_KEY_ANON = 'taskpulse_supabase_anon_key';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  return {
    url: localStorage.getItem(STORAGE_KEY_URL) || (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: localStorage.getItem(STORAGE_KEY_ANON) || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
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

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url.startsWith('https://')) {
      return { success: false, message: 'Supabase URL must start with https://' };
    }
    const testClient = createClient(url, anonKey);
    // Ping with a lightweight select
    const { error } = await testClient.from('tasks').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's still a valid connected instance
      if (error.message.includes('relation "public.tasks" does not exist') || error.code === '42P01') {
        return { success: true, message: 'Connected to Supabase! (Note: run schema SQL in Supabase dashboard to create tables)' };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed. Verify your Supabase URL & Key.' };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Supabase SQL Schema for TaskPulse
-- Run this in your Supabase project's SQL Editor

-- 1. Tasks Table
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

-- 2. Habits Table
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

-- Enable Row Level Security (Optional)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read/write" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Allow authenticated read/write" ON public.habits FOR ALL USING (true);
`;
