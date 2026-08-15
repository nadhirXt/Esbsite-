-- ============================================================
-- Table: memoires_access
-- ============================================================
CREATE TABLE IF NOT EXISTS public.memoires_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'unlocked', 'rejected', 'revoked'
    password TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE public.memoires_access ENABLE ROW LEVEL SECURITY;

-- Users can read their own access status
CREATE POLICY "Users can view their own memoire access"
    ON public.memoires_access FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can read all access requests
CREATE POLICY "Admins can view all memoire access"
    ON public.memoires_access FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admins can update access
CREATE POLICY "Admins can update memoire access"
    ON public.memoires_access FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Users can insert their own request
CREATE POLICY "Users can request memoire access"
    ON public.memoires_access FOR INSERT
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- ============================================================
-- Table: memoires_activity
-- ============================================================
CREATE TABLE IF NOT EXISTS public.memoires_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- e.g., 'entered_folder', 'viewed_file: file_name'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.memoires_activity ENABLE ROW LEVEL SECURITY;

-- Admins can view all activity
CREATE POLICY "Admins can view all memoires activity"
    ON public.memoires_activity FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Users can insert their own activity
CREATE POLICY "Users can insert memoires activity"
    ON public.memoires_activity FOR INSERT
    WITH CHECK (auth.uid() = user_id);

