-- ============================================================
-- ESB Hub — Script d'Activation Realtime & Triggers Unifiés
-- Exécutez ce script dans l'éditeur SQL de votre Dashboard Supabase
-- ============================================================

-- 1. Activer la publication Realtime pour les notifications et annonces
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
  END IF;
END $$;

-- 2. Configuration Replica Identity pour transmettre l'ensemble des champs en WebSocket
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.announcements REPLICA IDENTITY FULL;

-- 3. Trigger automatique : Dès qu'une annonce est publiée, générer les notifications pour les étudiants ciblés
CREATE OR REPLACE FUNCTION public.notify_new_announcement()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Notifier les étudiants du cycle concerné (ou toute l'école si cycle_target est NULL)
  INSERT INTO public.notifications (user_id, type, title, message, link)
  SELECT
    p.id,
    'announcement',
    '📢 Annonce ESB : ' || NEW.title,
    LEFT(NEW.content, 250),
    '/dashboard/actualites'
  FROM public.profiles p
  WHERE (NEW.cycle_target IS NULL OR p.cycle = NEW.cycle_target);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_announcement ON public.announcements;
CREATE TRIGGER on_new_announcement
  AFTER INSERT ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_announcement();

-- 4. Table des abonnements Web Push (pour notifications sur écran verrouillé / navigateur fermé)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint    text NOT NULL UNIQUE,
  p256dh      text,
  auth        text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users manage own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
