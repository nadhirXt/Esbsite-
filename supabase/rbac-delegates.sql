-- ============================================================
-- Mise à jour : RBAC pour Admins et Délégués
-- ============================================================

-- 1. Mettre à jour la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_delegate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS delegate_cycle TEXT, -- 'licence', 'dseb', 'master'
ADD COLUMN IF NOT EXISTS delegate_year INTEGER; -- 1, 2, 3, 4

-- 2. Mettre à jour la table documents
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================================
-- Nouvelles politiques RLS pour les documents
-- ============================================================

-- Permettre aux délégués d'insérer des documents UNIQUEMENT pour leur cycle et année
CREATE POLICY "Delegates can insert documents for their scope"
  ON public.documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND is_delegate = true 
      AND delegate_cycle = documents.cycle
      AND delegate_year = documents.year
    )
  );

-- Permettre aux délégués de supprimer LEURS propres documents
CREATE POLICY "Delegates can delete their own documents"
  ON public.documents FOR DELETE
  USING (
    auth.uid() = uploader_id 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND is_delegate = true
    )
  );

-- ============================================================
-- Nouvelles politiques pour le Storage (Bucket)
-- ============================================================
-- Note: Supabase RLS sur storage.objects est plus délicat.
-- On ajoute une policy pour les délégués.
CREATE POLICY "Delegates can upload files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_delegate = true)
  );

CREATE POLICY "Delegates can delete their files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents' AND 
    auth.uid() = owner -- `owner` est natif à storage.objects
  );
