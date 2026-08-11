-- ============================================================
-- FIX: Run this in your Supabase SQL Editor
-- This fixes the profile + admin upload issues
-- ============================================================

-- 1. Allow users to INSERT their own profile (for ensureProfile fallback)
--    This is needed when the trigger didn't fire
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. Make sure the 'documents' storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Set benn4dir@gmail.com as admin
-- First, ensure the profile exists
INSERT INTO public.profiles (id, full_name, role, user_type, cycle)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  'admin',
  COALESCE(au.raw_user_meta_data->>'user_type', 'etudiant_esb'),
  au.raw_user_meta_data->>'cycle'
FROM auth.users au
WHERE au.email = 'benn4dir@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 4. Verify: check the result
SELECT p.id, p.full_name, p.role, au.email 
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
WHERE au.email = 'benn4dir@gmail.com';
