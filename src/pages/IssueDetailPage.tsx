import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Select } from '../components/ui/Select';
import { toast } from 'react-hot-toast';
import {
  ThumbsUp,
  CheckSquare,
  MapPin,
  Buildings,
  ArrowLeft,
  PaperPlaneRight,
  Warning,
} from '@phosphor-icons/react';

interface TimelineEvent {
  id: string;
  previous_status: string;
  new_status: string;
  note: string;
  created_at: string;
  actor?: {
    full_name: string;
    role: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url?: string;
  };
}

interface IssueDetail {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  address: string;
  support_count: number;
  confirmation_count: number;
  resolution_confirmation_count: number;
  comment_count: number;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
  };
  issue_categories: {
    name: string;
    color: string;
  };
  departments?: {
    name: string;
  };
  issue_media?: {
    media_url: string;
  }[];
}

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [loading, setLoading] = useState(true);

  // Authority actions panel state
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchIssueDetails = async () => {
    try {
      // 1. Fetch main issue details
      const { data: issueData, error: issueError } = await supabase
        .from('issue_reports')
        .select(`
          id, title, description, severity, status, address, support_count, confirmation_count, resolution_confirmation_count, comment_count, created_at,
          profiles (id, full_name, username, avatar_url),
          issue_categories (name, color),
          departments (name),
          issue_media (media_url)
        `)
        .eq('id', id)
        .single();

      if (issueError) throw issueError;
      setIssue(issueData as any);
      setNewStatus(issueData.status);

      // 2. Fetch timeline events
      const { data: timelineData } = await supabase
        .from('issue_timeline')
        .select(`
          id, previous_status, new_status, note, created_at,
          actor:profiles (full_name, role)
        `)
        .eq('issue_id', id)
        .order('created_at', { ascending: true });

      if (timelineData) setTimeline(timelineData as any[]);

      // 3. Fetch comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          id, content, created_at,
          profiles (full_name, username, avatar_url)
        `)
        .eq('issue_id', id)
        .order('created_at', { ascending: true });

      if (commentsData) setComments(commentsData as any[]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchIssueDetails();
  }, [id]);

  const handleSupport = async () => {
    if (!profile || !issue) return;
    try {
      const { error } = await supabase.from('supports').insert({
        user_id: profile.id,
        issue_id: issue.id,
      });

      if (error) {
        if (error.code === '23505') {
          // Unlike
          await supabase.from('supports').delete().match({ user_id: profile.id, issue_id: issue.id });
          setIssue((prev) => prev ? { ...prev, support_count: Math.max(0, prev.support_count - 1) } : null);
          toast.success('Support withdrawn.');
        } else {
          throw error;
        }
      } else {
        setIssue((prev) => prev ? { ...prev, support_count: prev.support_count + 1 } : null);
        toast.success('Supported!');
      }
    } catch (err) {
      toast.error('Support action failed.');
    }
  };

  const handleConfirmation = async (type: 'existence' | 'resolution') => {
    if (!profile || !issue) return;
    try {
      const { error } = await supabase.from('confirmations').insert({
        user_id: profile.id,
        issue_id: issue.id,
        confirmation_type: type,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error(`You already confirmed this issue's ${type}.`);
        } else {
          throw error;
        }
      } else {
        toast.success(`Verification submitted!`);
        fetchIssueDetails();
      }
    } catch (err) {
      toast.error('Verification action failed.');
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !issue || !newComment.trim()) return;
    setPostingComment(true);

    try {
      const { error } = await supabase.from('comments').insert({
        author_id: profile.id,
        issue_id: issue.id,
        content: newComment.trim(),
      });

      if (error) throw error;
      setNewComment('');
      toast.success('Comment posted!');
      fetchIssueDetails();
    } catch (err) {
      toast.error('Failed to post comment.');
    } finally {
      setPostingComment(false);
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !issue || !newStatus) return;
    setUpdatingStatus(true);

    try {
      const { error } = await supabase.rpc('update_issue_status', {
        p_issue_id: issue.id,
        p_new_status: newStatus,
        p_actor_id: profile.id,
        p_note: statusNote.trim() || null,
      });

      if (error) throw error;
      toast.success('Status updated successfully!');
      setStatusNote('');
      fetchIssueDetails();
    } catch (err: any) {
      toast.error(`Transition failed: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton" style={{ width: '200px', height: '24px' }} />
        <Card className="skeleton" style={{ width: '100%', height: '300px' }} />
      </div>
    );
  }

  if (!issue) {
    return (
      <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <h3>Issue Not Found</h3>
        <p style={{ color: 'var(--text-muted)' }}>The ticket you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/home')} style={{ marginTop: '1rem' }}>
          Back to Feed
        </Button>
      </Card>
    );
  }

  const getSeverityVariant = (sev: string) => {
    switch (sev) {
      case 'low': return 'neutral';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'danger';
      default: return 'neutral';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  // Timeline visual bar map
  const stages = [
    { key: 'submitted', label: 'Reported' },
    { key: 'community_verified', label: 'Verified' },
    { key: 'in_progress', label: 'Resolving' },
    { key: 'resolved_by_authority', label: 'Closed' },
  ];

  const getActiveStageIndex = () => {
    if (issue.status === 'submitted' || issue.status === 'community_verification_pending') return 0;
    if (issue.status === 'community_verified' || issue.status === 'seen_by_authority') return 1;
    if (issue.status === 'in_progress') return 2;
    return 3; // resolved / closed
  };

  const activeStageIndex = getActiveStageIndex();

  return (
    <div className="flex flex-col gap-6" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
      {/* Detail Back header */}
      <div className="flex align-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ borderRadius: '50%', padding: '8px' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Ticket Detail</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Track progress and community confirmations.</p>
        </div>
      </div>

      {/* Main Issue Card Info */}
      <Card className="flex flex-col gap-5">
        <div className="flex justify-between align-center flex-wrap gap-2">
          <div className="flex align-center gap-3">
            <Avatar name={issue.profiles.full_name} src={issue.profiles.avatar_url} size={40} />
            <div>
              <strong style={{ color: 'var(--text-heading)' }}>{issue.profiles.full_name}</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                @{issue.profiles.username} · Reported {new Date(issue.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={getSeverityVariant(issue.severity)}>
              {issue.severity} Severity
            </Badge>
            <Badge variant="primary">
              {getStatusLabel(issue.status)}
            </Badge>
          </div>
        </div>

        {/* Media elements */}
        {issue.issue_media && issue.issue_media.length > 0 && (
          <img
            src={issue.issue_media[0].media_url}
            alt={issue.title}
            style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
          />
        )}

        <div className="flex flex-col gap-2">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{issue.title}</h1>
          <p style={{ color: 'var(--text)', whiteSpace: 'pre-wrap', fontSize: '0.9375rem' }}>{issue.description}</p>
        </div>

        {/* Location & category meta */}
        <div className="grid grid-cols-2 gap-4 border-t pt-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex align-center gap-2">
            <MapPin size={20} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location Address</div>
              <strong style={{ fontSize: '0.8125rem', color: 'var(--text-heading)' }}>{issue.address}</strong>
            </div>
          </div>
          <div className="flex align-center gap-2">
            <Buildings size={20} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Routing Department</div>
              <strong style={{ fontSize: '0.8125rem', color: 'var(--text-heading)' }}>
                {issue.departments?.name || 'General Municipal Board'}
              </strong>
            </div>
          </div>
        </div>

        {/* Actions bar for citizens */}
        {profile && (
          <div className="flex justify-between align-center flex-wrap gap-3">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleSupport} className="flex align-center gap-1">
                <ThumbsUp size={16} />
                <span>Support ({issue.support_count})</span>
              </Button>

              {issue.status === 'community_verification_pending' && (
                <Button variant="primary" size="sm" onClick={() => handleConfirmation('existence')} className="flex align-center gap-1">
                  <CheckSquare size={16} />
                  <span>Verify Existence ({issue.confirmation_count}/10)</span>
                </Button>
              )}

              {issue.status === 'awaiting_community_verification' && (
                <Button variant="primary" size="sm" onClick={() => handleConfirmation('resolution')} className="flex align-center gap-1">
                  <CheckSquare size={16} />
                  <span>Verify Resolution ({issue.resolution_confirmation_count}/10)</span>
                </Button>
              )}
            </div>

            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Contribution score: +{issue.profiles.id === profile.id ? '50' : '5'}
            </span>
          </div>
        )}
      </Card>

      {/* Visual Progress Milestones Bar */}
      <Card className="flex flex-col gap-4">
        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Lifecycle Status Milestones</h4>
        
        {/* Simple visual steps bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0.5rem 0' }}>
          {/* Progress connector line */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '5%',
              right: '5%',
              height: '3px',
              backgroundColor: 'var(--border)',
              zIndex: 1,
              transform: 'translateY(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '5%',
              width: `${(activeStageIndex / 3) * 90}%`,
              height: '3px',
              backgroundColor: 'var(--primary)',
              zIndex: 1,
              transform: 'translateY(-50%)',
              transition: 'width var(--transition-normal)',
            }}
          />

          {stages.map((stage, idx) => {
            const isCompleted = idx <= activeStageIndex;
            return (
              <div
                key={stage.key}
                className="flex flex-col align-center gap-2"
                style={{ zIndex: 2, width: '20%', textAlign: 'center' }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? 'var(--primary)' : 'var(--bg-card)',
                    border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompleted ? 'white' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: isCompleted ? 600 : 500,
                    color: isCompleted ? 'var(--text-heading)' : 'var(--text-muted)',
                  }}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* AUTHORITY ACTION PORTAL: Only displays for authorities */}
      {profile?.role === 'authority' && (
        <Card className="flex flex-col gap-4" style={{ border: '2px solid var(--primary)' }}>
          <h3 className="flex align-center gap-2" style={{ fontSize: '1.125rem' }}>
            <Warning size={22} color="var(--primary)" weight="fill" />
            Authority Action Center
          </h3>
          <form onSubmit={handleStatusChange} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Assign New Lifecyle State"
                options={[
                  { value: 'community_verification_pending', label: 'Awaiting Verification' },
                  { value: 'community_verified', label: 'Publicly Verified' },
                  { value: 'seen_by_authority', label: 'Claimed / Seen' },
                  { value: 'in_progress', label: 'Resolution In Progress' },
                  { value: 'resolved_by_authority', label: 'Completed By Authority' },
                  { value: 'awaiting_community_verification', label: 'Awaiting Citizen Closing' },
                  { value: 'closed', label: 'Archive / Close' },
                ]}
                value={newStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewStatus(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">Authority Progress Note</label>
              <textarea
                className="form-input"
                placeholder="Details about active crew dispatch, repair timelines, or completed evidence details..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>
            <Button type="submit" loading={updatingStatus} style={{ alignSelf: 'flex-start' }}>
              Post Work Update & Log Status
            </Button>
          </form>
        </Card>
      )}

      {/* TIMELINE HISTORY LOGS */}
      <Card className="flex flex-col gap-4">
        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Resolution Timeline Log</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
          {/* Vertical layout line */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              bottom: '10px',
              left: '15px',
              width: '2px',
              backgroundColor: 'var(--border)',
            }}
          />

          {timeline.map((event) => (
            <div key={event.id} className="flex gap-4" style={{ position: 'relative' }}>
              {/* Event bullet point */}
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  border: '3px solid var(--bg-card)',
                  marginLeft: '10px',
                  marginTop: '6px',
                  zIndex: 2,
                }}
              />
              <div style={{ flex: 1 }}>
                <div className="flex justify-between align-center flex-wrap">
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-heading)' }}>
                    Status updated to {getStatusLabel(event.new_status)}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(event.created_at).toLocaleDateString()}
                  </span>
                </div>
                {event.actor && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    By {event.actor.full_name} ({event.actor.role})
                  </div>
                )}
                {event.note && (
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text)',
                      marginTop: '0.25rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--bg-offset)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {event.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* COMMENTS FEED & BOX */}
      <Card className="flex flex-col gap-4">
        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Discussion Threads ({comments.length})</h4>
        
        {/* Comment input form */}
        {profile ? (
          <form onSubmit={handlePostComment} className="flex gap-3 align-start">
            <Avatar name={profile.full_name} src={profile.avatar_url} size={32} />
            <div className="flex flex-1 align-center border rounded-md px-3 bg-offset" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-offset)', borderRadius: 'var(--radius-md)' }}>
              <input
                className="form-input flex-1"
                placeholder="Ask for details or write a feedback response..."
                style={{ border: 'none', background: 'none', boxShadow: 'none', padding: '0.5rem 0' }}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={postingComment || !newComment.trim()}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
              >
                <PaperPlaneRight size={18} />
              </button>
            </div>
          </form>
        ) : (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Please sign in to join the discussion.
          </p>
        )}

        {/* Comments listing */}
        <div className="flex flex-col gap-3 mt-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 align-start">
              <Avatar name={comment.profiles.full_name} src={comment.profiles.avatar_url} size={32} />
              <div
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-offset)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div className="flex justify-between align-center flex-wrap">
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--text-heading)' }}>
                    {comment.profiles.full_name}
                  </strong>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    @{comment.profiles.username} · {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text)', marginTop: '0.25rem' }}>
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
export default IssueDetailPage;
