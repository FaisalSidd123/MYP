-- =========================================================================
-- ContactHub Database Schema (Supabase PostgreSQL)
-- Run this script in the Supabase SQL Editor if your tables are not yet created.
-- =========================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table (Synchronized with Firebase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY, -- Firebase Auth UID
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  last_login TIMESTAMPTZ DEFAULT NOW(),
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret TEXT,
  mfa_verified_at TIMESTAMPTZ,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Niches Table (Target Verticals / Market Segments)
CREATE TABLE IF NOT EXISTS public.niches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'indigo', -- indigo, blue, emerald, amber, rose, violet, cyan, orange
  icon TEXT DEFAULT 'category',
  target_deal_size NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Clients Table (Contacts & Leads)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  niche_id UUID REFERENCES public.niches(id) ON DELETE SET NULL,
  niche_name TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  deal_value NUMERIC DEFAULT 0,
  lead_score INTEGER DEFAULT 50,
  pitch JSONB DEFAULT '[]'::JSONB,
  pitch_notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration helpers if tables were already created previously:
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS niche_id UUID REFERENCES public.niches(id) ON DELETE SET NULL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS niche_name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS deal_value NUMERIC DEFAULT 0;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 50;

-- 4. Tasks Table (Kanban & To-Dos)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Schedules Table (Calendar & Events)
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  description TEXT,
  type TEXT DEFAULT 'follow_up',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helpful Performance Indexes
CREATE INDEX IF NOT EXISTS idx_niches_user_id ON public.niches(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_niche_id ON public.clients(niche_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON public.schedules(start_time);

-- 6. Admin Role & User Management Migration Helpers
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Automatically elevate owner goodfaisal to admin role
UPDATE public.users 
SET role = 'admin' 
WHERE email ILIKE '%goodfaisal%';

