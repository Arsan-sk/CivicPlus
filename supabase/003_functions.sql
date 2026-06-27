-- ============================================
-- CivicPulse Database Functions & Triggers
-- Version: 1.0.0
-- Run AFTER 001_schema.sql
-- ============================================

-- 1. HANDLE NEW USER REGISTRATION
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. SUPPORT COUNT MANAGEMENT
CREATE OR REPLACE FUNCTION increment_issue_support()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.issue_id IS NOT NULL THEN
    UPDATE issue_reports SET support_count = support_count + 1 WHERE id = NEW.issue_id;
    UPDATE profiles SET supports_given_count = supports_given_count + 1 WHERE id = NEW.user_id;
  END IF;
  IF NEW.discussion_id IS NOT NULL THEN
    UPDATE discussions SET support_count = support_count + 1 WHERE id = NEW.discussion_id;
  END IF;
  IF NEW.comment_id IS NOT NULL THEN
    UPDATE comments SET support_count = support_count + 1 WHERE id = NEW.comment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_issue_support()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.issue_id IS NOT NULL THEN
    UPDATE issue_reports SET support_count = GREATEST(0, support_count - 1) WHERE id = OLD.issue_id;
    UPDATE profiles SET supports_given_count = GREATEST(0, supports_given_count - 1) WHERE id = OLD.user_id;
  END IF;
  IF OLD.discussion_id IS NOT NULL THEN
    UPDATE discussions SET support_count = GREATEST(0, support_count - 1) WHERE id = OLD.discussion_id;
  END IF;
  IF OLD.comment_id IS NOT NULL THEN
    UPDATE comments SET support_count = GREATEST(0, support_count - 1) WHERE id = OLD.comment_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_support_insert AFTER INSERT ON supports FOR EACH ROW EXECUTE FUNCTION increment_issue_support();
CREATE TRIGGER on_support_delete AFTER DELETE ON supports FOR EACH ROW EXECUTE FUNCTION decrement_issue_support();

-- 3. CONFIRMATION WITH AUTO STATUS ADVANCEMENT
CREATE OR REPLACE FUNCTION handle_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  current_status issue_status;
  confirm_count INT;
  threshold INT := 10;
BEGIN
  SELECT status INTO current_status FROM issue_reports WHERE id = NEW.issue_id;

  IF NEW.confirmation_type = 'existence' THEN
    UPDATE issue_reports SET confirmation_count = confirmation_count + 1 WHERE id = NEW.issue_id;
    UPDATE profiles SET confirmations_given_count = confirmations_given_count + 1 WHERE id = NEW.user_id;
    SELECT confirmation_count + 1 INTO confirm_count FROM issue_reports WHERE id = NEW.issue_id;

    IF confirm_count >= threshold AND current_status IN ('submitted', 'community_verification_pending') THEN
      UPDATE issue_reports SET status = 'community_verified' WHERE id = NEW.issue_id;
      INSERT INTO issue_timeline (issue_id, actor_id, previous_status, new_status, note)
      VALUES (NEW.issue_id, NULL, current_status, 'community_verified',
              'Issue verified by community (' || confirm_count || ' confirmations)');
    END IF;

  ELSIF NEW.confirmation_type = 'resolution' THEN
    UPDATE issue_reports SET resolution_confirmation_count = resolution_confirmation_count + 1 WHERE id = NEW.issue_id;
    SELECT resolution_confirmation_count + 1 INTO confirm_count FROM issue_reports WHERE id = NEW.issue_id;

    IF confirm_count >= threshold AND current_status = 'awaiting_community_verification' THEN
      UPDATE issue_reports SET status = 'community_verified_resolution', closed_at = now() WHERE id = NEW.issue_id;
      INSERT INTO issue_timeline (issue_id, actor_id, previous_status, new_status, note)
      VALUES (NEW.issue_id, NULL, current_status, 'community_verified_resolution',
              'Resolution verified by community (' || confirm_count || ' confirmations)');
      UPDATE profiles SET issues_resolved_count = issues_resolved_count + 1
      WHERE id = (SELECT author_id FROM issue_reports WHERE id = NEW.issue_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_confirmation_insert AFTER INSERT ON confirmations FOR EACH ROW EXECUTE FUNCTION handle_confirmation();

-- 4. COMMENT COUNT
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.issue_id IS NOT NULL THEN UPDATE issue_reports SET comment_count = comment_count + 1 WHERE id = NEW.issue_id; END IF;
    IF NEW.discussion_id IS NOT NULL THEN UPDATE discussions SET comment_count = comment_count + 1 WHERE id = NEW.discussion_id; END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.issue_id IS NOT NULL THEN UPDATE issue_reports SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.issue_id; END IF;
    IF OLD.discussion_id IS NOT NULL THEN UPDATE discussions SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.discussion_id; END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_change AFTER INSERT OR DELETE ON comments FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- 5. RESHARE COUNT
CREATE OR REPLACE FUNCTION update_reshare_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.issue_id IS NOT NULL THEN UPDATE issue_reports SET reshare_count = reshare_count + 1 WHERE id = NEW.issue_id; END IF;
    IF NEW.discussion_id IS NOT NULL THEN UPDATE discussions SET reshare_count = reshare_count + 1 WHERE id = NEW.discussion_id; END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.issue_id IS NOT NULL THEN UPDATE issue_reports SET reshare_count = GREATEST(0, reshare_count - 1) WHERE id = OLD.issue_id; END IF;
    IF OLD.discussion_id IS NOT NULL THEN UPDATE discussions SET reshare_count = GREATEST(0, reshare_count - 1) WHERE id = OLD.discussion_id; END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reshare_change AFTER INSERT OR DELETE ON reshares FOR EACH ROW EXECUTE FUNCTION update_reshare_count();

-- 6. ISSUE STATUS LIFECYCLE STATE MACHINE
CREATE OR REPLACE FUNCTION update_issue_status(
  p_issue_id UUID, p_new_status issue_status, p_actor_id UUID, p_note TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_current_status issue_status;
  v_valid BOOLEAN := false;
BEGIN
  SELECT status INTO v_current_status FROM issue_reports WHERE id = p_issue_id;
  v_valid := CASE
    WHEN v_current_status = 'submitted' AND p_new_status IN ('community_verification_pending', 'community_verified', 'seen_by_authority') THEN true
    WHEN v_current_status = 'community_verification_pending' AND p_new_status = 'community_verified' THEN true
    WHEN v_current_status = 'community_verified' AND p_new_status IN ('seen_by_authority', 'in_progress') THEN true
    WHEN v_current_status = 'seen_by_authority' AND p_new_status = 'in_progress' THEN true
    WHEN v_current_status = 'in_progress' AND p_new_status = 'resolved_by_authority' THEN true
    WHEN v_current_status = 'resolved_by_authority' AND p_new_status = 'awaiting_community_verification' THEN true
    WHEN v_current_status = 'awaiting_community_verification' AND p_new_status = 'community_verified_resolution' THEN true
    WHEN v_current_status = 'community_verified_resolution' AND p_new_status = 'closed' THEN true
    ELSE false
  END;
  IF NOT v_valid THEN RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status; END IF;

  UPDATE issue_reports SET status = p_new_status,
    resolved_at = CASE WHEN p_new_status = 'resolved_by_authority' THEN now() ELSE resolved_at END,
    closed_at = CASE WHEN p_new_status = 'closed' THEN now() ELSE closed_at END
  WHERE id = p_issue_id;

  INSERT INTO issue_timeline (issue_id, actor_id, previous_status, new_status, note)
  VALUES (p_issue_id, p_actor_id, v_current_status, p_new_status, p_note);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. AUTO ISSUE LIFECYCLE ON CREATION
CREATE OR REPLACE FUNCTION on_issue_created()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET issues_raised_count = issues_raised_count + 1 WHERE id = NEW.author_id;
  INSERT INTO issue_timeline (issue_id, actor_id, new_status, note)
  VALUES (NEW.id, NEW.author_id, 'submitted', 'Issue report submitted');
  UPDATE issue_reports SET status = 'community_verification_pending' WHERE id = NEW.id;
  INSERT INTO issue_timeline (issue_id, actor_id, previous_status, new_status, note)
  VALUES (NEW.id, NEW.author_id, 'submitted', 'community_verification_pending', 'Awaiting community verification');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_issue_report_created AFTER INSERT ON issue_reports FOR EACH ROW EXECUTE FUNCTION on_issue_created();

-- 8. CITY STATISTICS VIEW
CREATE OR REPLACE VIEW city_statistics AS
SELECT
  c.id AS city_id, c.name AS city_name, c.slug AS city_slug, s.name AS state_name,
  COUNT(ir.id) AS total_issues,
  COUNT(ir.id) FILTER (WHERE ir.status NOT IN ('closed', 'community_verified_resolution')) AS open_issues,
  COUNT(ir.id) FILTER (WHERE ir.status IN ('closed', 'community_verified_resolution')) AS resolved_issues,
  COUNT(ir.id) FILTER (WHERE ir.severity = 'critical') AS critical_issues,
  ROUND(AVG(CASE WHEN ir.resolved_at IS NOT NULL
    THEN EXTRACT(EPOCH FROM (ir.resolved_at - ir.created_at)) / 3600 END)::numeric, 1) AS avg_resolution_hours,
  COUNT(DISTINCT ir.author_id) AS active_citizens
FROM cities c
LEFT JOIN issue_reports ir ON ir.city_id = c.id
JOIN states s ON c.state_id = s.id
GROUP BY c.id, c.name, c.slug, s.name;

-- 9. TRENDING ISSUES VIEW
CREATE OR REPLACE VIEW trending_issues AS
SELECT ir.*,
  (ir.support_count * 3 + ir.confirmation_count * 5 + ir.comment_count * 2 + ir.reshare_count * 4)
    * (1.0 / (EXTRACT(EPOCH FROM (now() - ir.created_at)) / 3600 + 1)) AS trending_score
FROM issue_reports ir
WHERE ir.created_at > now() - INTERVAL '7 days'
  AND ir.status NOT IN ('closed', 'community_verified_resolution')
ORDER BY trending_score DESC;
