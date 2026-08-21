-- ============================================================
-- ESB Hub — Sécurité RLS & Optimisations Free Tier
-- Corrige la boucle infinie dans les politiques admin
-- Ajoute des index manquants pour les performances
-- ============================================================

-- ── Correction du bug RLS admin (boucle infinie) ─────────
-- La politique originale faisait un SELECT sur profiles depuis profiles → boucle

-- Suppression des anciennes politiques problématiques
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Admin can delete documents" ON public.documents;
DROP POLICY IF EXISTS "Admin can insert useful links" ON public.useful_links;
DROP POLICY IF EXISTS "Admin can delete useful links" ON public.useful_links;

-- Fonction helper sécurisée pour vérifier le rôle admin
-- security definer = s'exécute avec les droits du propriétaire, pas de boucle
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

-- ── Profils ───────────────────────────────────────────────

-- Admin peut voir tous les profils (correction via fonction helper)
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Admin peut modifier tous les profils
CREATE POLICY "Admin can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ── Documents ─────────────────────────────────────────────

CREATE POLICY "Admin can insert documents"
  ON public.documents FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete documents"
  ON public.documents FOR DELETE
  USING (public.is_admin());

CREATE POLICY "Admin can update documents"
  ON public.documents FOR UPDATE
  USING (public.is_admin());

-- ── Liens utiles ──────────────────────────────────────────

CREATE POLICY "Admin can insert useful links"
  ON public.useful_links FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete useful links"
  ON public.useful_links FOR DELETE
  USING (public.is_admin());

CREATE POLICY "Admin can update useful links"
  ON public.useful_links FOR UPDATE
  USING (public.is_admin());

-- ── Index manquants pour les performances ─────────────────

-- Documents — recherche par cycle + année (très fréquente)
CREATE INDEX IF NOT EXISTS documents_cycle_year_idx
  ON public.documents(cycle, year);

-- Documents — full-text search sur le titre
CREATE INDEX IF NOT EXISTS documents_title_fts_idx
  ON public.documents USING gin(to_tsvector('french', title));

-- Documents — tri par date de création
CREATE INDEX IF NOT EXISTS documents_created_at_idx
  ON public.documents(created_at DESC);

-- Documents — catégorie (navigation par dossier)
CREATE INDEX IF NOT EXISTS documents_category_idx
  ON public.documents(category);

-- Profiles — recherche par cycle
CREATE INDEX IF NOT EXISTS profiles_cycle_idx
  ON public.profiles(cycle);

-- Reading history — nettoyage auto des entrées > 90 jours
-- (économise de l'espace en free tier)
CREATE INDEX IF NOT EXISTS reading_history_cleanup_idx
  ON public.reading_history(viewed_at);

-- ── Politique de rétention (Free Tier) ────────────────────
-- Fonction de nettoyage automatique des anciennes entrées
-- À appeler manuellement depuis le SQL Editor chaque mois

CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Supprimer l'historique de lecture > 90 jours
  DELETE FROM public.reading_history
  WHERE viewed_at < now() - interval '90 days';

  -- Supprimer les sessions d'étude > 6 mois
  DELETE FROM public.study_sessions
  WHERE started_at < now() - interval '6 months';
END;
$$;

-- ── Full-text search function ─────────────────────────────
CREATE OR REPLACE FUNCTION public.search_documents(
  p_query text,
  p_cycle text DEFAULT NULL,
  p_year int DEFAULT NULL,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  file_path text,
  cycle text,
  year int,
  category text,
  created_at timestamptz,
  rank real
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql AS $$
  SELECT
    d.id,
    d.title,
    d.file_path,
    d.cycle,
    d.year,
    d.category,
    d.created_at,
    ts_rank(to_tsvector('french', d.title), plainto_tsquery('french', p_query)) AS rank
  FROM public.documents d
  WHERE
    d.title <> '.keep'
    AND to_tsvector('french', d.title) @@ plainto_tsquery('french', p_query)
    AND (p_cycle IS NULL OR d.cycle = p_cycle)
    AND (p_year IS NULL OR d.year = p_year)
  ORDER BY rank DESC, d.created_at DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.search_documents(text, text, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_data() TO authenticated;
