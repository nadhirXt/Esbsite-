-- ============================================================
-- ESB Hub — Fil d'Actualités & Annonces
-- ============================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL CHECK (char_length(title) <= 200),
  content      text NOT NULL CHECK (char_length(content) <= 2000),
  type         text DEFAULT 'info', -- 'info' | 'warning' | 'success' | 'urgent'
  cycle_target text,  -- null = tous les cycles
  pinned       boolean DEFAULT false,
  created_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS announcements_pinned_date_idx
  ON public.announcements(pinned DESC, created_at DESC);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view announcements"
  ON public.announcements FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage announcements"
  ON public.announcements FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- ESB Hub — Notifications
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        text NOT NULL, -- 'new_document' | 'qa_reply' | 'exam_reminder' | 'announcement'
  title       text NOT NULL CHECK (char_length(title) <= 200),
  message     text CHECK (char_length(message) <= 500),
  link        text,  -- URL to navigate to when clicked
  read        boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications(user_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- RPC: marquer toutes les notifications comme lues
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE user_id = auth.uid() AND read = false;
END;
$$;

-- RPC: créer des notifications pour tous les users d'un cycle quand un doc est ajouté
CREATE OR REPLACE FUNCTION public.notify_new_document()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Ne pas notifier pour les dossiers vides (.keep)
  IF NEW.title = '.keep' THEN
    RETURN NEW;
  END IF;

  -- Insérer une notification pour chaque étudiant du même cycle
  INSERT INTO public.notifications (user_id, type, title, message, link)
  SELECT
    p.id,
    'new_document',
    '📄 Nouveau document disponible',
    NEW.title,
    '/dashboard/' || NEW.cycle
  FROM public.profiles p
  WHERE p.cycle = NEW.cycle
    AND p.id != COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_document ON public.documents;
CREATE TRIGGER on_new_document
  AFTER INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_document();

GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read() TO authenticated;
