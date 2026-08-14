-- ============================================================
-- ESB Hub — Table des tokens de réinitialisation de mot de passe
-- Exécuter dans Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  token      text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Sécurité : seul le service role (API routes server-side) peut accéder
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Aucun accès public direct (tout passe par les API routes)
-- Les API routes utilisent le service role qui bypass RLS

-- Index pour les recherches rapides par token
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token
  ON public.password_reset_tokens (token);

-- Nettoyage automatique des tokens expirés (optionnel, à activer si pg_cron disponible)
-- SELECT cron.schedule('cleanup-expired-tokens', '0 * * * *',
--   'DELETE FROM public.password_reset_tokens WHERE expires_at < now()');
