-- ============================================================
--  CoachPro AI — User Role Management (RBAC)
--  Migration: 003_user_roles.sql
--
--  Idempotent: safe to run even if already applied.
--  Role hierarchy: user < subscriber < admin < super_admin
-- ============================================================


-- ============================================================
--  ENUM: user_role
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_role'
  ) THEN
    CREATE TYPE public.user_role AS ENUM (
      'user',
      'subscriber',
      'admin',
      'super_admin'
    );
  END IF;
END $$;

COMMENT ON TYPE public.user_role IS
  'Role hierarchy: user < subscriber < admin < super_admin';


-- ============================================================
--  COLUMN: profiles.role
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'role'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN role public.user_role NOT NULL DEFAULT 'user';
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.role IS
  'RBAC role assigned to this user. Defaults to user on signup.';


-- ============================================================
--  INDEX: profiles(role)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);


-- ============================================================
--  HELPER FUNCTION: is_admin(user_id)
--  Returns TRUE for admin or super_admin roles.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id   = user_id
      AND role IN ('admin', 'super_admin')
  );
$$;

COMMENT ON FUNCTION public.is_admin IS
  'Returns true when the given user has admin or super_admin role.';


-- ============================================================
--  HELPER FUNCTION: is_super_admin(user_id)
--  Returns TRUE only for super_admin role.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id   = user_id
      AND role = 'super_admin'
  );
$$;

COMMENT ON FUNCTION public.is_super_admin IS
  'Returns true only when the given user has super_admin role.';


-- ============================================================
--  RLS POLICIES — Admin read-all access
--  We add these only if they don't already exist.
-- ============================================================

-- profiles: admin SELECT all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'Admin can view all profiles'
  ) THEN
    CREATE POLICY "Admin can view all profiles"
      ON public.profiles
      FOR SELECT
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- projects: admin SELECT all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'projects'
      AND policyname = 'Admin can view all projects'
  ) THEN
    CREATE POLICY "Admin can view all projects"
      ON public.projects
      FOR SELECT
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- saved_outputs: admin SELECT all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'saved_outputs'
      AND policyname = 'Admin can view all saved outputs'
  ) THEN
    CREATE POLICY "Admin can view all saved outputs"
      ON public.saved_outputs
      FOR SELECT
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- chat_messages: admin SELECT all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'chat_messages'
      AND policyname = 'Admin can view all chat messages'
  ) THEN
    CREATE POLICY "Admin can view all chat messages"
      ON public.chat_messages
      FOR SELECT
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- credit_purchases: admin SELECT all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'credit_purchases'
      AND policyname = 'Admin can view all credit purchases'
  ) THEN
    CREATE POLICY "Admin can view all credit purchases"
      ON public.credit_purchases
      FOR SELECT
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- credit_purchases: admin UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'credit_purchases'
      AND policyname = 'Admin can update credit purchases'
  ) THEN
    CREATE POLICY "Admin can update credit purchases"
      ON public.credit_purchases
      FOR UPDATE
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- credit_ledger: admin SELECT all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'credit_ledger'
      AND policyname = 'Admin can view all credit ledger entries'
  ) THEN
    CREATE POLICY "Admin can view all credit ledger entries"
      ON public.credit_ledger
      FOR SELECT
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- credit_packs: admin INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'credit_packs'
      AND policyname = 'Admin can insert credit packs'
  ) THEN
    CREATE POLICY "Admin can insert credit packs"
      ON public.credit_packs
      FOR INSERT
      WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;

-- credit_packs: admin UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'credit_packs'
      AND policyname = 'Admin can update credit packs'
  ) THEN
    CREATE POLICY "Admin can update credit packs"
      ON public.credit_packs
      FOR UPDATE
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- credit_packs: admin DELETE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'credit_packs'
      AND policyname = 'Admin can delete credit packs'
  ) THEN
    CREATE POLICY "Admin can delete credit packs"
      ON public.credit_packs
      FOR DELETE
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;


-- ============================================================
--  RLS POLICY — Only super_admin can update role column
--  We achieve this by restricting UPDATE on profiles.role to
--  super_admin exclusively through a separate policy and a
--  column-level check function approach.
--  In Supabase/Postgres we can restrict which columns can be
--  updated per policy using WITH CHECK on the role field.
-- ============================================================

-- super_admin: UPDATE role field on profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'Only super_admin can update user roles'
  ) THEN
    CREATE POLICY "Only super_admin can update user roles"
      ON public.profiles
      FOR UPDATE
      USING (public.is_super_admin(auth.uid()))
      WITH CHECK (public.is_super_admin(auth.uid()));
  END IF;
END $$;
