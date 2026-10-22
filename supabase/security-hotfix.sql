-- ============================================================
-- ESB Hub — Security Hotfix Migration (Robuste / Sans Erreur)
-- Execute this in Supabase SQL Editor
-- ============================================================

-- ── 0. Pré-requis : Helper is_admin() ────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Assurer la présence des colonnes délégué
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_delegate BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS delegate_cycle TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS delegate_year INTEGER;

-- ── C1: Fix handle_new_user trigger (CRITICAL) ──────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, cycle, user_type, institution_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'student',  -- SECURITY: Never trust user-supplied role from metadata
    new.raw_user_meta_data->>'cycle',
    new.raw_user_meta_data->>'user_type',
    new.raw_user_meta_data->>'institution_name'
  );
  RETURN new;
END;
$$;

-- ── C2: Restrict profile INSERT & UPDATE policies (CRITICAL) ──
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id AND
    role = 'student' AND
    COALESCE(is_delegate, false) = false
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile non-sensitive fields" ON public.profiles;

CREATE POLICY "Users can update own profile non-sensitive fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) AND
    is_delegate IS NOT DISTINCT FROM (SELECT p.is_delegate FROM public.profiles p WHERE p.id = auth.uid()) AND
    delegate_cycle IS NOT DISTINCT FROM (SELECT p.delegate_cycle FROM public.profiles p WHERE p.id = auth.uid()) AND
    delegate_year IS NOT DISTINCT FROM (SELECT p.delegate_year FROM public.profiles p WHERE p.id = auth.uid())
  );

-- ── C3: Protect memoires documents & delegate UPDATE scope ───
DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.documents;
CREATE POLICY "Authenticated users can view documents"
  ON public.documents FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      cycle <> 'memoires' OR
      public.is_admin() OR
      EXISTS (
        SELECT 1 FROM public.memoires_access ma
        WHERE ma.user_id = auth.uid() AND ma.status = 'unlocked'
      )
    )
  );

DROP POLICY IF EXISTS "Delegates can update documents for their scope" ON public.documents;
CREATE POLICY "Delegates can update documents for their scope"
  ON public.documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND is_delegate = true
      AND delegate_cycle = documents.cycle
      AND delegate_year = documents.year
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND is_delegate = true
      AND delegate_cycle = documents.cycle
      AND delegate_year = documents.year
    )
  );

-- ── C4: Prevent direct client read on memoires_access.password ─
DROP POLICY IF EXISTS "Users can view their own memoire access" ON public.memoires_access;

-- ── H6: Restrict notifications INSERT (HIGH) ────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications';
    EXECUTE 'DROP POLICY IF EXISTS "Admins or system can insert notifications" ON public.notifications';
    EXECUTE 'CREATE POLICY "Admins or system can insert notifications" ON public.notifications FOR INSERT WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- ── H7: Revoke cleanup_old_data (si la fonction existe) ──────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'cleanup_old_data'
  ) THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.cleanup_old_data() FROM authenticated';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.cleanup_old_data() FROM anon';
  END IF;
END $$;

-- ── M8: Fix admin_upcoming_events view (MEDIUM) ─────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'admin_upcoming_events' AND table_schema = 'public') THEN
    EXECUTE 'DROP VIEW IF EXISTS public.admin_upcoming_events';
    EXECUTE '
      CREATE VIEW public.admin_upcoming_events 
      WITH (security_invoker = true) AS 
      SELECT e.*, p.full_name as created_by_name
      FROM public.events e
      LEFT JOIN public.profiles p ON p.id = e.created_by
      WHERE e.event_date >= current_date
      ORDER BY e.event_date ASC
    ';
  END IF;
END $$;
