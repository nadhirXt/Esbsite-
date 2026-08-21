-- ============================================================
-- ESB Hub — Admin : Gestion du Calendrier des Événements
-- (Interface admin via SQL Editor ou future page admin)
-- ============================================================

-- Exemples d'événements à ajouter via le SQL Editor ou l'API admin
-- INSERT INTO public.events (title, description, event_date, event_time, type, cycle, year, location)
-- VALUES 
--   ('Examen Comptabilité S1', 'Examen final semestre 1', '2025-01-20', '09:00', 'exam', 'licence', 1, 'Salle A101'),
--   ('TP Finance d''entreprise', 'TP obligatoire', '2025-01-15', '14:00', 'tp', 'licence', 2, 'Salle Informatique'),
--   ('Rendu Mémoire M2', 'Date limite de rendu', '2025-01-31', null, 'rendu', 'master', 2, null);

-- Vue pour l'interface admin : tous les événements à venir
CREATE OR REPLACE VIEW public.admin_upcoming_events AS
SELECT 
  e.*,
  p.full_name as created_by_name
FROM public.events e
LEFT JOIN public.profiles p ON p.id = e.created_by
WHERE e.event_date >= current_date
ORDER BY e.event_date ASC;
