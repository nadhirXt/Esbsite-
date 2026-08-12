-- =================================================================================
-- REQUÊTE : [ESB] Mise à jour Profils et LinkedIn
-- DESCRIPTION : Ce script sécurisé met à jour la base de données sans rien casser.
-- Il ajoute le champ LinkedIn s'il manque, et corrige le bug de sécurité RLS.
-- =================================================================================

-- 1. Ajout de la colonne linkedin_url (ne fait rien si elle existe déjà)
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

-- 2. Fonction sécurisée pour vérifier si un utilisateur est Admin
create or replace function public.is_admin()
returns boolean 
language sql 
security definer 
set search_path = public 
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- 3. Mise à jour des règles de sécurité (RLS) pour la table Profiles
drop policy if exists "Admin can view all profiles" on public.profiles;

create policy "Admin can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- 4. Rafraîchissement du cache pour que le site voie immédiatement les changements
NOTIFY pgrst, 'reload schema';
