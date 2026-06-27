-- ============================================
-- 004_SCHEMA_UPDATES.SQL
-- Additions for Civic Discussions categorization and Admin moderation features
-- ============================================

-- 1. ADD DISCUSSION TYPE TO CIVIC DISCUSSIONS
ALTER TABLE public.discussions 
ADD COLUMN IF NOT EXISTS discussion_type TEXT NOT NULL DEFAULT 'general';

-- 2. CREATE REPORTED CONTENT TABLE FOR ADMIN MODERATION
CREATE TABLE IF NOT EXISTS public.reported_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES public.issue_reports(id) ON DELETE CASCADE,
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT report_single_target CHECK (
    (issue_id IS NOT NULL AND discussion_id IS NULL) OR
    (issue_id IS NULL AND discussion_id IS NOT NULL)
  )
);

-- 3. ENABLE RLS & DEFINE POLICIES
ALTER TABLE public.reported_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reported_content_select" ON public.reported_content
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "reported_content_insert" ON public.reported_content
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reported_content_admin" ON public.reported_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
