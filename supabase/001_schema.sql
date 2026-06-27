-- ============================================
-- CivicPulse Database Schema
-- Version: 1.0.0
-- Description: Complete schema for AI-powered
--   civic social network MVP
-- ============================================

-- ============================================
-- 1. CUSTOM TYPES (ENUMS)
-- ============================================

CREATE TYPE user_role AS ENUM ('citizen', 'authority', 'admin');

CREATE TYPE issue_status AS ENUM (
  'submitted',
  'community_verification_pending',
  'community_verified',
  'seen_by_authority',
  'in_progress',
  'resolved_by_authority',
  'awaiting_community_verification',
  'community_verified_resolution',
  'closed'
);

CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE notification_type AS ENUM (
  'new_issue_in_city',
  'issue_status_updated',
  'authority_update_posted',
  'issue_confirmed',
  'issue_resolved',
  'comment_received',
  'reshare_received',
  'verification_request'
);

CREATE TYPE report_reason AS ENUM (
  'spam',
  'inappropriate',
  'duplicate',
  'misleading',
  'other'
);

-- ============================================
-- 2. GEOGRAPHIC TABLES
-- ============================================

CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(country_id, name)
);

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  population BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(state_id, name)
);

-- ============================================
-- 3. USER PROFILES
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role user_role NOT NULL DEFAULT 'citizen',
  country_id UUID REFERENCES countries(id),
  state_id UUID REFERENCES states(id),
  city_id UUID REFERENCES cities(id),
  issues_raised_count INT NOT NULL DEFAULT 0,
  issues_resolved_count INT NOT NULL DEFAULT 0,
  supports_given_count INT NOT NULL DEFAULT 0,
  confirmations_given_count INT NOT NULL DEFAULT 0,
  contribution_score INT NOT NULL DEFAULT 0,
  city_rank INT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 4. DEPARTMENTS & AUTHORITIES
-- ============================================

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE authorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  jurisdiction_level TEXT NOT NULL,
  country_id UUID REFERENCES countries(id),
  state_id UUID REFERENCES states(id),
  city_id UUID REFERENCES cities(id),
  department_id UUID REFERENCES departments(id),
  badge_type TEXT NOT NULL DEFAULT 'official',
  assigned_issues_count INT NOT NULL DEFAULT 0,
  resolved_issues_count INT NOT NULL DEFAULT 0,
  avg_response_time_hours DOUBLE PRECISION,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE authority_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_authority_id UUID REFERENCES authorities(id) ON DELETE SET NULL,
  child_authority_id UUID NOT NULL REFERENCES authorities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_authority_id, child_authority_id)
);

-- ============================================
-- 5. ISSUE CATEGORIES
-- ============================================

CREATE TABLE issue_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 6. ISSUE REPORTS (Core Table)
-- ============================================

CREATE TABLE issue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES issue_categories(id),
  severity severity_level NOT NULL DEFAULT 'medium',
  status issue_status NOT NULL DEFAULT 'submitted',
  city_id UUID NOT NULL REFERENCES cities(id),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  ward TEXT,
  ai_category_confidence DOUBLE PRECISION,
  ai_severity_confidence DOUBLE PRECISION,
  ai_detected_objects JSONB,
  assigned_authority_id UUID REFERENCES authorities(id),
  assigned_department_id UUID REFERENCES departments(id),
  support_count INT NOT NULL DEFAULT 0,
  confirmation_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  reshare_count INT NOT NULL DEFAULT 0,
  resolution_confirmation_count INT NOT NULL DEFAULT 0,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  is_duplicate BOOLEAN NOT NULL DEFAULT false,
  duplicate_of UUID REFERENCES issue_reports(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 7. ISSUE MEDIA
-- ============================================

CREATE TABLE issue_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issue_reports(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  thumbnail_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 8. ISSUE TIMELINE
-- ============================================

CREATE TABLE issue_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issue_reports(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id),
  previous_status issue_status,
  new_status issue_status NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 9. ISSUE UPDATES (Authority Posts)
-- ============================================

CREATE TABLE issue_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issue_reports(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 10. CIVIC DISCUSSIONS
-- ============================================

CREATE TABLE discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images JSONB,
  city_id UUID REFERENCES cities(id),
  support_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  reshare_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 11. COMMENTS (Polymorphic)
-- ============================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issue_reports(id) ON DELETE CASCADE,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  support_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT comment_single_parent CHECK (
    (issue_id IS NOT NULL AND discussion_id IS NULL) OR
    (issue_id IS NULL AND discussion_id IS NOT NULL)
  )
);

-- ============================================
-- 12. SUPPORTS (Upvotes)
-- ============================================

CREATE TABLE supports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issue_reports(id) ON DELETE CASCADE,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, issue_id),
  UNIQUE(user_id, discussion_id),
  UNIQUE(user_id, comment_id)
);

-- ============================================
-- 13. CONFIRMATIONS
-- ============================================

CREATE TABLE confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES issue_reports(id) ON DELETE CASCADE,
  confirmation_type TEXT NOT NULL DEFAULT 'existence',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, issue_id, confirmation_type)
);

-- ============================================
-- 14. RESHARES
-- ============================================

CREATE TABLE reshares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issue_reports(id) ON DELETE CASCADE,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, issue_id),
  UNIQUE(user_id, discussion_id)
);

-- ============================================
-- 15. NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  issue_id UUID REFERENCES issue_reports(id) ON DELETE CASCADE,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 16. CONTENT REPORTS (Moderation)
-- ============================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  description TEXT,
  issue_id UUID REFERENCES issue_reports(id) ON DELETE CASCADE,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 17. INDEXES
-- ============================================

CREATE INDEX idx_states_country ON states(country_id);
CREATE INDEX idx_cities_state ON cities(state_id);
CREATE INDEX idx_cities_slug ON cities(slug);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_city ON profiles(city_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_issues_city ON issue_reports(city_id);
CREATE INDEX idx_issues_author ON issue_reports(author_id);
CREATE INDEX idx_issues_status ON issue_reports(status);
CREATE INDEX idx_issues_category ON issue_reports(category_id);
CREATE INDEX idx_issues_severity ON issue_reports(severity);
CREATE INDEX idx_issues_created ON issue_reports(created_at DESC);
CREATE INDEX idx_issues_assigned_authority ON issue_reports(assigned_authority_id);
CREATE INDEX idx_issues_support_count ON issue_reports(support_count DESC);
CREATE INDEX idx_timeline_issue ON issue_timeline(issue_id);
CREATE INDEX idx_updates_issue ON issue_updates(issue_id);
CREATE INDEX idx_comments_issue ON comments(issue_id);
CREATE INDEX idx_comments_discussion ON comments(discussion_id);
CREATE INDEX idx_supports_issue ON supports(issue_id);
CREATE INDEX idx_supports_user ON supports(user_id);
CREATE INDEX idx_confirmations_issue ON confirmations(issue_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_discussions_city ON discussions(city_id);
CREATE INDEX idx_discussions_author ON discussions(author_id);
CREATE INDEX idx_discussions_created ON discussions(created_at DESC);

-- ============================================
-- 18. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE authority_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE supports ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reshares ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "countries_read" ON countries FOR SELECT USING (true);
CREATE POLICY "states_read" ON states FOR SELECT USING (true);
CREATE POLICY "cities_read" ON cities FOR SELECT USING (true);
CREATE POLICY "departments_read" ON departments FOR SELECT USING (true);
CREATE POLICY "categories_read" ON issue_categories FOR SELECT USING (true);
CREATE POLICY "profiles_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "authorities_read" ON authorities FOR SELECT USING (true);
CREATE POLICY "authority_hierarchy_read" ON authority_hierarchy FOR SELECT USING (true);
CREATE POLICY "issues_read" ON issue_reports FOR SELECT USING (true);
CREATE POLICY "issue_media_read" ON issue_media FOR SELECT USING (true);
CREATE POLICY "issue_timeline_read" ON issue_timeline FOR SELECT USING (true);
CREATE POLICY "issue_updates_read" ON issue_updates FOR SELECT USING (true);
CREATE POLICY "discussions_read" ON discussions FOR SELECT USING (true);
CREATE POLICY "comments_read" ON comments FOR SELECT USING (true);
CREATE POLICY "supports_read" ON supports FOR SELECT USING (true);
CREATE POLICY "confirmations_read" ON confirmations FOR SELECT USING (true);
CREATE POLICY "reshares_read" ON reshares FOR SELECT USING (true);

-- Authenticated write policies
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "issues_insert" ON issue_reports FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "issues_update_author" ON issue_reports FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "issue_media_insert" ON issue_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM issue_reports WHERE id = issue_id AND author_id = auth.uid())
);

CREATE POLICY "timeline_insert" ON issue_timeline FOR INSERT WITH CHECK (auth.uid() = actor_id);
CREATE POLICY "updates_insert" ON issue_updates FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "discussions_insert" ON discussions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "discussions_update" ON discussions FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "discussions_delete" ON discussions FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_update" ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "supports_insert" ON supports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "supports_delete" ON supports FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "confirmations_insert" ON confirmations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reshares_insert" ON reshares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reshares_delete" ON reshares FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "notifications_read" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_read_own" ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- ============================================
-- 19. UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER issues_updated_at BEFORE UPDATE ON issue_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER discussions_updated_at BEFORE UPDATE ON discussions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER authorities_updated_at BEFORE UPDATE ON authorities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
