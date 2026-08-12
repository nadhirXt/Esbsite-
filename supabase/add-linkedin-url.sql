-- ============================================================
-- FIX: Ajouter le champ linkedin_url à la table profiles
-- Copiez et collez ce code dans votre SQL Editor sur Supabase,
-- puis cliquez sur "Run".
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN linkedin_url text;
  END IF;
END $$;
