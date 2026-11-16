-- ==========================================================
-- LearnTwin Database Schema for Supabase
-- Target Project: https://hoicetkovgcidbjyqpqs.supabase.co
-- ==========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT DEFAULT 'student',
  persona_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  domain TEXT DEFAULT 'Python & Data Structures',
  target_profile TEXT DEFAULT 'Crack Coding Interviews',
  deadline_weeks INTEGER DEFAULT 8,
  hours_per_week NUMERIC DEFAULT 4,
  target_concepts JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Digital Twin States Table
CREATE TABLE IF NOT EXISTS public.twins (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  skills JSONB NOT NULL DEFAULT '{}'::jsonb,
  misconceptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  bandit_stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  overall_readiness NUMERIC DEFAULT 35,
  streak_days INTEGER DEFAULT 1,
  diagnosed_root_causes JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Question Attempts Table
CREATE TABLE IF NOT EXISTS public.attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  concept_key TEXT NOT NULL,
  selected_option_id TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  reasoning_text TEXT,
  detected_misconception_id TEXT,
  mastery_delta NUMERIC DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Curriculum Path Snapshots & Diffs Table
CREATE TABLE IF NOT EXISTS public.path_snapshots (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  diff_from_previous JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Student Interests, Future Scopes & Pivot Suggestions
CREATE TABLE IF NOT EXISTS public.interest_profiles (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_interest TEXT,
  future_scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
  answered_question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_evaluation JSONB,
  suggested_pivots JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_concept ON public.attempts(concept_key);
CREATE INDEX IF NOT EXISTS idx_snapshots_user_id ON public.path_snapshots(user_id);

