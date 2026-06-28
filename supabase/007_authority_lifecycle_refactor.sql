-- ============================================
-- 007_AUTHORITY_LIFECYCLE_REFACTOR.SQL
-- Refactor authority lifecycle status transitions and automatic citizen verifications
-- ============================================

-- 1. REDEFINE update_issue_status WITH AUTOMATIC RESOLUTION TRANSITIONS
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
    -- Allow transitions to seen_by_authority from any of the initial statuses
    WHEN p_new_status = 'seen_by_authority' AND v_current_status IN ('submitted', 'community_verification_pending', 'community_verified') THEN true
    -- Allow transitions to in_progress from any open/seen statuses
    WHEN p_new_status = 'in_progress' AND v_current_status IN ('submitted', 'community_verification_pending', 'community_verified', 'seen_by_authority') THEN true
    -- Allow transitions to resolved_by_authority from any open/seen/in_progress statuses
    WHEN p_new_status = 'resolved_by_authority' AND v_current_status IN ('submitted', 'community_verification_pending', 'community_verified', 'seen_by_authority', 'in_progress') THEN true
    
    -- Keep other transitions as is
    WHEN v_current_status = 'resolved_by_authority' AND p_new_status = 'awaiting_community_verification' THEN true
    WHEN v_current_status = 'awaiting_community_verification' AND p_new_status = 'community_verified_resolution' THEN true
    WHEN v_current_status = 'community_verified_resolution' AND p_new_status = 'closed' THEN true
    WHEN v_current_status = 'awaiting_community_verification' AND p_new_status = 'closed' THEN true
    ELSE false
  END;

  IF NOT v_valid THEN 
    RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status; 
  END IF;

  IF p_new_status = 'resolved_by_authority' THEN
    -- 1. Perform the update to resolved_by_authority
    UPDATE issue_reports 
    SET status = 'resolved_by_authority', 
        resolved_at = now(),
        updated_at = now() 
    WHERE id = p_issue_id;
    
    INSERT INTO issue_timeline (issue_id, actor_id, previous_status, new_status, note)
    VALUES (p_issue_id, p_actor_id, v_current_status, 'resolved_by_authority', p_note);

    -- 2. Immediately transition to awaiting_community_verification
    UPDATE issue_reports 
    SET status = 'awaiting_community_verification',
        updated_at = now()
    WHERE id = p_issue_id;
    
    INSERT INTO issue_timeline (issue_id, actor_id, previous_status, new_status, note)
    VALUES (p_issue_id, NULL, 'resolved_by_authority', 'awaiting_community_verification', 'Resolution marked completed. Awaiting citizen verification.');
  ELSE
    -- Standard single transition
    UPDATE issue_reports 
    SET status = p_new_status,
        closed_at = CASE WHEN p_new_status = 'closed' OR p_new_status = 'community_verified_resolution' THEN now() ELSE closed_at END,
        updated_at = now()
    WHERE id = p_issue_id;

    INSERT INTO issue_timeline (issue_id, actor_id, previous_status, new_status, note)
    VALUES (p_issue_id, p_actor_id, v_current_status, p_new_status, p_note);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. REDEFINE handle_confirmation TO DIRECTLY CLOSE/ARCHIVE THE ISSUE WHEN RESOLUTION CONFIRMED
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
      -- Transition directly to closed (archived) status
      UPDATE issue_reports SET status = 'closed', closed_at = now() WHERE id = NEW.issue_id;
      INSERT INTO issue_timeline (issue_id, actor_id, previous_status, new_status, note)
      VALUES (NEW.issue_id, NULL, current_status, 'closed',
              'Resolution verified by community (' || confirm_count || ' confirmations). Issue archived.');
      UPDATE profiles SET issues_resolved_count = issues_resolved_count + 1
      WHERE id = (SELECT author_id FROM issue_reports WHERE id = NEW.issue_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
