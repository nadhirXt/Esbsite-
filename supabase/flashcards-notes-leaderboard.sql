-- ============================================================
-- ESB Hub — Flashcards & Notes Personnelles
-- ============================================================

-- ── Notes par document ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.document_notes (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  content     text NOT NULL CHECK (char_length(content) <= 2000),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, document_id)  -- une note par document par utilisateur
);

CREATE INDEX IF NOT EXISTS document_notes_user_idx
  ON public.document_notes(user_id, updated_at DESC);

ALTER TABLE public.document_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notes"
  ON public.document_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own notes"
  ON public.document_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notes"
  ON public.document_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notes"
  ON public.document_notes FOR DELETE USING (auth.uid() = user_id);

-- ── Flashcards ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       text NOT NULL CHECK (char_length(title) <= 100),
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  cards       jsonb NOT NULL DEFAULT '[]',
  -- Format cards: [{ id, question, answer, level: 1|2|3, next_review: ISO date }]
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS flashcard_decks_user_idx
  ON public.flashcard_decks(user_id, updated_at DESC);

ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own flashcard decks"
  ON public.flashcard_decks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Système de Points (vue calculée, pas de table) ─────────
-- Les points sont calculés depuis les tables existantes
-- Pas de stockage supplémentaire → économise le free tier

CREATE OR REPLACE FUNCTION public.get_leaderboard(p_cycle text DEFAULT NULL)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  cycle text,
  points bigint,
  rank bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql AS $$
  WITH user_points AS (
    SELECT
      p.id AS user_id,
      p.full_name,
      p.cycle,
      -- +5 pts par document vu
      COALESCE((
        SELECT COUNT(*) * 5
        FROM public.reading_history rh
        WHERE rh.user_id = p.id AND rh.action = 'view'
      ), 0)
      -- +10 pts par téléchargement
      + COALESCE((
        SELECT COUNT(*) * 10
        FROM public.reading_history rh
        WHERE rh.user_id = p.id AND rh.action = 'download'
      ), 0)
      -- +20 pts par question/réponse Q&A
      + COALESCE((
        SELECT COUNT(*) * 20
        FROM public.document_questions dq
        WHERE dq.author_id = p.id
      ), 0)
      -- +30 pts par heure de focus (study session)
      + COALESCE((
        SELECT COALESCE(SUM(ss.duration_minutes), 0) / 60 * 30
        FROM public.study_sessions ss
        WHERE ss.user_id = p.id
      ), 0)
      AS points
    FROM public.profiles p
    WHERE p.role = 'student'
      AND (p_cycle IS NULL OR p.cycle = p_cycle)
  )
  SELECT
    up.user_id,
    COALESCE(up.full_name, 'Anonyme') AS full_name,
    up.cycle,
    up.points,
    RANK() OVER (ORDER BY up.points DESC) AS rank
  FROM user_points up
  WHERE up.points > 0
  ORDER BY up.points DESC
  LIMIT 50;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(text) TO authenticated;
