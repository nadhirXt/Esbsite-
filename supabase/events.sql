-- ============================================================
-- ESB Hub — Calendrier des Examens & Événements
-- Table légère, optimisée free tier
-- ============================================================

CREATE TABLE IF NOT EXISTS public.events (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text NOT NULL CHECK (char_length(title) <= 200),
  description text CHECK (char_length(description) <= 1000),
  event_date  date NOT NULL,
  event_time  time,
  type        text NOT NULL DEFAULT 'exam', -- 'exam' | 'tp' | 'rendu' | 'holiday' | 'autre'
  cycle       text,   -- null = tous les cycles
  year        int,    -- null = toutes les années
  location    text CHECK (char_length(location) <= 200),
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_date_idx ON public.events(event_date);
CREATE INDEX IF NOT EXISTS events_cycle_year_idx ON public.events(cycle, year);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Tous les étudiants authentifiés peuvent voir les événements
CREATE POLICY "Authenticated can view events"
  ON public.events FOR SELECT
  USING (auth.role() = 'authenticated');

-- Seuls les admins peuvent créer/modifier/supprimer
CREATE POLICY "Admin can insert events"
  ON public.events FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update events"
  ON public.events FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin can delete events"
  ON public.events FOR DELETE
  USING (public.is_admin());

-- RPC : récupérer les événements du mois en cours et des 3 prochains mois
CREATE OR REPLACE FUNCTION public.get_upcoming_events(
  p_cycle text DEFAULT NULL,
  p_year int DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  event_date date,
  event_time time,
  type text,
  cycle text,
  year int,
  location text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql AS $$
  SELECT e.id, e.title, e.description, e.event_date, e.event_time,
         e.type, e.cycle, e.year, e.location
  FROM public.events e
  WHERE
    e.event_date >= current_date
    AND e.event_date <= current_date + interval '3 months'
    AND (p_cycle IS NULL OR e.cycle IS NULL OR e.cycle = p_cycle)
    AND (p_year IS NULL OR e.year IS NULL OR e.year = p_year)
  ORDER BY e.event_date ASC, e.event_time ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_upcoming_events(text, int) TO authenticated;
