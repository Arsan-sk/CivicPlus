-- ============================================
-- SQL CLEANUP TO FIX CORRUPTED AUTH RECORDS & ENFORCE LATEST SCHEMA
-- ============================================
-- Run this script inside the Supabase SQL Editor.
-- It ensures all required update tables (like authority_applications) exist,
-- clears referencing rows in the correct order to avoid FK blocks,
-- and then deletes the corrupted auth.users records.

-- 1. Enforce latest schema updates if not already present
ALTER TABLE public.discussions ADD COLUMN IF NOT EXISTS discussion_type TEXT NOT NULL DEFAULT 'general';

CREATE TABLE IF NOT EXISTS public.reported_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES public.issue_reports(id) ON DELETE CASCADE,
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT report_single_target CHECK (
    (issue_id IS NOT NULL AND discussion_id IS NULL) OR
    (issue_id IS NULL AND discussion_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.authority_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  jurisdiction_level TEXT NOT NULL,
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  state_id UUID REFERENCES public.states(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- 2. Delete all referencing rows in public tables in reverse dependency order
DELETE FROM public.reports;
DELETE FROM public.notifications;
DELETE FROM public.reported_content;
DELETE FROM public.authority_applications;
DELETE FROM public.issue_timeline;
DELETE FROM public.supports;
DELETE FROM public.confirmations;
DELETE FROM public.reshares;
DELETE FROM public.comments;
DELETE FROM public.issue_updates;
DELETE FROM public.issue_media;
DELETE FROM public.issue_reports;
DELETE FROM public.discussions;
DELETE FROM public.authority_hierarchy;
DELETE FROM public.authorities;
DELETE FROM public.profiles WHERE id::text LIKE 'df000000-%' OR id::text LIKE 'f0000000-%';

-- 3. Delete the corrupted users from auth.users (wrong instance_id)
DELETE FROM auth.users WHERE instance_id = '00000000-0000-0000-0000-000000000000';

-- 4. Refresh PostgREST schema cache to ensure all tables are visible
NOTIFY pgrst, 'reload schema';
