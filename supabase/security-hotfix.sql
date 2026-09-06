-- ============================================================
-- ESB Hub — Security Hotfix Migration
-- Execute this in Supabase SQL Editor IMMEDIATELY
-- ============================================================

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

-- ── C2: Restrict profile UPDATE policy (CRITICAL) ───────────
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

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

-- ── H6: Restrict notifications INSERT (HIGH) ────────────────
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Admins or system can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

-- ── H7: Revoke cleanup_old_data from authenticated (HIGH) ───
REVOKE EXECUTE ON FUNCTION public.cleanup_old_data() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_data() FROM anon;

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
