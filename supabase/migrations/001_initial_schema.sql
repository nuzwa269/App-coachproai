-- ============================================================
--  CoachPro AI — Initial Database Schema
--  Migration: 001_initial_schema.sql
--
--  Run this in the Supabase SQL Editor (or via the Supabase CLI).
--  Tables are created inside the `public` schema.
-- ============================================================

-- ============================================================
--  EXTENSION
-- ============================================================
-- pgcrypto is included by default in Supabase; ensures gen_random_uuid() works.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
--  TABLE: profiles
--  One row per Supabase auth user. Created automatically via
--  the trigger defined below.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                     UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email                  TEXT        NOT NULL,
  full_name              TEXT,
  avatar_url             TEXT,
  plan                   TEXT        NOT NULL DEFAULT 'free'
                                     CHECK (plan IN ('free', 'pro')),
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  ai_messages_used       INTEGER     NOT NULL DEFAULT 0,
  ai_messages_limit      INTEGER     NOT NULL DEFAULT 50,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS
  'Public user profile that extends auth.users. Auto-created on signup.';


-- ============================================================
--  TABLE: projects
--  Each user can own multiple coding projects.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  tech_stack  TEXT[],
  status      TEXT        NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'archived', 'completed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.projects IS
  'Coding projects created by users. Used as the context anchor for AI chats.';


-- ============================================================
--  TABLE: saved_outputs
--  AI-generated outputs that users save to a project workspace.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_outputs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID        NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title          TEXT        NOT NULL,
  content        TEXT        NOT NULL,
  category       TEXT        NOT NULL DEFAULT 'general'
                             CHECK (category IN ('overview', 'database', 'api', 'docs', 'general')),
  assistant_type TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.saved_outputs IS
  'AI-generated content saved by users to a project tab (overview, db, api, docs).';


-- ============================================================
--  TABLE: chat_messages
--  Persisted AI chat history per project (Week 3 feature).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID        NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role           TEXT        NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content        TEXT        NOT NULL,
  assistant_type TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.chat_messages IS
  'Persistent chat history for AI conversations within a project context.';


-- ============================================================
--  INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id       ON public.projects      (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_outputs_project  ON public.saved_outputs (project_id);
CREATE INDEX IF NOT EXISTS idx_saved_outputs_user     ON public.saved_outputs (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project  ON public.chat_messages (project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user     ON public.chat_messages (user_id);


-- ============================================================
--  FUNCTION + TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply the trigger to every table that has an updated_at column
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_saved_outputs_updated_at
  BEFORE UPDATE ON public.saved_outputs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
--  FUNCTION + TRIGGER: auto-create profile on signup
--  Fires after a new row is inserted into auth.users.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
--  ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;


-- ── profiles ─────────────────────────────────────────────────
-- Users can only access their own profile row.

CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: delete own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);


-- ── projects ─────────────────────────────────────────────────
-- Users can only access projects they own.

CREATE POLICY "projects: select own"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "projects: insert own"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects: update own"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects: delete own"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);


-- ── saved_outputs ────────────────────────────────────────────
-- Users can only access saved outputs they own.

CREATE POLICY "saved_outputs: select own"
  ON public.saved_outputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saved_outputs: insert own"
  ON public.saved_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_outputs: update own"
  ON public.saved_outputs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_outputs: delete own"
  ON public.saved_outputs FOR DELETE
  USING (auth.uid() = user_id);


-- ── chat_messages ─────────────────────────────────────────────
-- Users can only access their own chat messages.

CREATE POLICY "chat_messages: select own"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat_messages: insert own"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_messages: update own"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_messages: delete own"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = user_id);
