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

-- 4. CONFIRMATION DELETION DECREMENT TRIGGER
CREATE OR REPLACE FUNCTION decrement_issue_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.confirmation_type = 'existence' THEN
    UPDATE issue_reports 
    SET confirmation_count = GREATEST(0, confirmation_count - 1) 
    WHERE id = OLD.issue_id;
    
    UPDATE profiles 
    SET confirmations_given_count = GREATEST(0, confirmations_given_count - 1) 
    WHERE id = OLD.user_id;
  ELSIF OLD.confirmation_type = 'resolution' THEN
    UPDATE issue_reports 
    SET resolution_confirmation_count = GREATEST(0, resolution_confirmation_count - 1) 
    WHERE id = OLD.issue_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_confirmation_delete
  AFTER DELETE ON confirmations
  FOR EACH ROW
  EXECUTE FUNCTION decrement_issue_confirmation();

-- 5. CREATE AUTHORITY APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.authority_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  jurisdiction_level TEXT NOT NULL, -- 'city', 'state', 'national'
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  state_id UUID REFERENCES public.states(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS and define policies for authority_applications
ALTER TABLE public.authority_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_app_select" ON public.authority_applications
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "auth_app_insert" ON public.authority_applications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "auth_app_admin" ON public.authority_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
