-- =================================================================================
-- REQUÊTE : [ESB] 2 - Créer la vue publique des étudiants (Mise à jour)
-- DESCRIPTION : Crée une fonction sécurisée qui permet aux étudiants de voir
-- les informations de formation des autres étudiants (sans accès aux données sensibles).
-- =================================================================================

drop function if exists public.get_public_students();

create or replace function public.get_public_students()
returns table (
  id uuid,
  full_name text,
  linkedin_url text,
  cycle text,
  institution_name text,
  user_type text
)
language sql 
security definer 
set search_path = public 
as $$
  -- On sélectionne uniquement les colonnes publiques de profil
  select 
    id, 
    full_name, 
    linkedin_url,
    cycle,
    institution_name,
    user_type
  from public.profiles
  where role != 'admin'
  order by full_name asc;
$$;

-- Rafraîchir le cache de Supabase
NOTIFY pgrst, 'reload schema';
