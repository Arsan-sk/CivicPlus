import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Select } from '../components/ui/Select';
import { toast } from 'react-hot-toast';
import {
  Warning,
  Chat,
  ThumbsUp,
  CheckSquare,
  Funnel,
} from '@phosphor-icons/react';

interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  support_count: number;
  confirmation_count: number;
  comment_count: number;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url?: string;
  };
  issue_categories: {
    name: string;
    color: string;
  };
  issue_media?: {
    media_url: string;
  }[];
}

interface Discussion {
  id: string;
  content: string;
  support_count: number;
  comment_count: number;
  created_at: string;
  discussion_type?: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url?: string;
  };
}

export const HomePage: React.FC = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'issues' | 'discussions'>('issues');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  // Discussion Post input state
  const [newPostContent, setNewPostContent] = useState('');
  const [postingDiscussion, setPostingDiscussion] = useState(false);

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const [supportedIssueIds, setSupportedIssueIds] = useState<string[]>([]);
  const [supportedDiscussionIds, setSupportedDiscussionIds] = useState<string[]>([]);
  const [confirmedIssueIds, setConfirmedIssueIds] = useState<string[]>([]);

  useEffect(() => {
    if (!profile) {
      setSupportedIssueIds([]);
      setSupportedDiscussionIds([]);
      setConfirmedIssueIds([]);
      return;
    }
    const fetchUserInteractions = async () => {
      const { data: supportsData } = await supabase
        .from('supports')
        .select('issue_id, discussion_id')
        .eq('user_id', profile.id);
      
      const { data: confsData } = await supabase
        .from('confirmations')
        .select('issue_id')
        .eq('user_id', profile.id)
        .eq('confirmation_type', 'existence');

      if (supportsData) {
        setSupportedIssueIds(supportsData.filter((s: any) => s.issue_id).map((s: any) => s.issue_id as string));
        setSupportedDiscussionIds(supportsData.filter((s: any) => s.discussion_id).map((s: any) => s.discussion_id as string));
      }
      if (confsData) {
        setConfirmedIssueIds(confsData.map((c: any) => c.issue_id as string));
      }
    };
    fetchUserInteractions();
  }, [profile, issues, discussions]);

  const [expandedDiscussionId, setExpandedDiscussionId] = useState<string | null>(null);
  const [discussionReplies, setDiscussionReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [postingReply, setPostingReply] = useState(false);

  useEffect(() => {
    if (!expandedDiscussionId) {
      setDiscussionReplies([]);
      return;
    }
    const fetchReplies = async () => {
      setLoadingReplies(true);
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id, content, created_at,
            profiles (full_name, username, avatar_url)
          `)
          .eq('discussion_id', expandedDiscussionId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        setDiscussionReplies(data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load replies.');
      } finally {
        setLoadingReplies(false);
      }
    };
    fetchReplies();
  }, [expandedDiscussionId]);

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !expandedDiscussionId || !newReplyContent.trim()) return;

    setPostingReply(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          discussion_id: expandedDiscussionId,
          author_id: profile.id,
          content: newReplyContent.trim()
        })
        .select(`
          id, content, created_at,
          profiles (full_name, username, avatar_url)
        `)
        .single();

      if (error) throw error;
      
      setDiscussionReplies(prev => [...prev, data]);
      setNewReplyContent('');
      
      setDiscussions(prev => prev.map(p => {
        if (p.id === expandedDiscussionId) {
          return { ...p, comment_count: (p.comment_count || 0) + 1 };
        }
        return p;
      }));
      
      toast.success('Reply posted!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to post reply.');
    } finally {
      setPostingReply(false);
    }
  };

  useEffect(() => {
    // Fetch categories for filters
    const fetchCategories = async () => {
      const { data } = await supabase.from('issue_categories').select('id, name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('issue_reports')
        .select(`
          id, title, description, severity, status, support_count, confirmation_count, comment_count, created_at,
          profiles (full_name, username, avatar_url),
          issue_categories (name, color),
          issue_media (media_url)
        `)
        .order('created_at', { ascending: false });

      if (profile?.city_id) {
        query = query.eq('city_id', profile.city_id);
      }
      if (filterCategory) {
        query = query.eq('category_id', filterCategory);
      }
      if (filterSeverity) {
        query = query.eq('severity', filterSeverity);
      }

      const { data, error } = await query;
      if (error) throw error;
      setIssues(data as any[] || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load issues feed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('discussions')
        .select(`
          id, content, support_count, comment_count, created_at, discussion_type,
          profiles (full_name, username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (profile?.city_id) {
        query = query.eq('city_id', profile.city_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDiscussions(data as any[] || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load discussions feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'issues') {
      fetchIssues();
    } else {
      fetchDiscussions();
    }
  }, [activeTab, profile, filterCategory, filterSeverity]);

  const handleSupport = async (id: string, type: 'issue' | 'discussion', index: number) => {
    if (!profile) {
      toast.error('Please sign in to support this.');
      navigate('/login');
      return;
    }

    try {
      // Check if already supported
      const matchFilter = type === 'issue'
        ? { user_id: profile.id, issue_id: id }
        : { user_id: profile.id, discussion_id: id };

      const { data: existing } = await supabase
        .from('supports')
        .select('id')
        .match(matchFilter);

      if (existing && existing.length > 0) {
        // Remove support
        await supabase.from('supports').delete().match(matchFilter);
        toast.success('Support removed.');
      } else {
        // Add support
        const payload: any = { user_id: profile.id };
        if (type === 'issue') payload.issue_id = id;
        else payload.discussion_id = id;
        await supabase.from('supports').insert(payload);
        toast.success('You supported this!');
      }

      // Fetch authoritative count from DB (set by trigger)
      if (type === 'issue') {
        const { data } = await supabase.from('issue_reports').select('support_count').eq('id', id).single();
        if (data) setIssues((prev) => { const c = [...prev]; c[index].support_count = data.support_count; return c; });
      } else {
        const { data } = await supabase.from('discussions').select('support_count').eq('id', id).single();
        if (data) setDiscussions((prev) => { const c = [...prev]; c[index].support_count = data.support_count; return c; });
      }
    } catch (err) {
      console.error(err);
      toast.error('Action failed.');
    }
  };

  const handleConfirmExistence = async (issueId: string, index: number) => {
    if (!profile) {
      toast.error('Please sign in to verify issues.');
      navigate('/login');
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('confirmations')
        .select('id')
        .match({ user_id: profile.id, issue_id: issueId, confirmation_type: 'existence' });

      if (existing && existing.length > 0) {
        // Withdraw verification
        await supabase.from('confirmations').delete().match({
          user_id: profile.id, issue_id: issueId, confirmation_type: 'existence'
        });
        toast.success('Verification withdrawn.');
      } else {
        // Add verification
        await supabase.from('confirmations').insert({
          user_id: profile.id,
          issue_id: issueId,
          confirmation_type: 'existence',
        });
        toast.success('Issue existence confirmed!');
      }

      // Fetch authoritative count from DB (set by trigger)
      const { data } = await supabase.from('issue_reports').select('confirmation_count').eq('id', issueId).single();
      if (data) setIssues((prev) => { const c = [...prev]; c[index].confirmation_count = data.confirmation_count; return c; });
    } catch (err) {
      console.error(err);
      toast.error('Action failed.');
    }
  };

  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast.error('Sign in to post.');
      return;
    }
    if (!newPostContent.trim()) return;

    setPostingDiscussion(true);
    try {
      const { error } = await supabase.from('discussions').insert({
        author_id: profile.id,
        content: newPostContent.trim(),
        city_id: profile.city_id,
      });

      if (error) throw error;

      toast.success('Discussion posted!');
      setNewPostContent('');
      fetchDiscussions();
    } catch (err: any) {
      toast.error(`Post failed: ${err.message}`);
    } finally {
      setPostingDiscussion(false);
    }
  };

  const getSeverityVariant = (sev: string) => {
    switch (sev) {
      case 'low': return 'neutral';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'danger';
      default: return 'neutral';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'submitted': return 'neutral';
      case 'community_verification_pending': return 'warning';
      case 'community_verified': return 'primary';
      case 'in_progress': return 'primary';
      case 'resolved_by_authority': return 'success';
      case 'community_verified_resolution': return 'success';
      case 'closed': return 'success';
      default: return 'neutral';
    }
  };

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-6" style={{ textAlign: 'left' }}>
      {/* 1. Header with Tab selection */}
      <div className="flex justify-between align-center flex-wrap gap-4">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            Active Issues
          </button>
          <button
            className={`tab-btn ${activeTab === 'discussions' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussions')}
          >
            Civic Discussions
          </button>
        </div>

        {activeTab === 'issues' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex align-center gap-2"
          >
            <Funnel size={16} />
            <span>Filters</span>
          </Button>
        )}
      </div>

      {/* 2. Filter Bar Drawer */}
      {activeTab === 'issues' && showFilters && (
        <Card className="flex gap-4 flex-wrap p-4" style={{ backgroundColor: 'var(--bg-offset)' }}>
          <div className="flex-1" style={{ minWidth: '150px' }}>
            <Select
              label="Filter Category"
              options={[{ value: '', label: 'All Categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
              value={filterCategory}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className="flex-1" style={{ minWidth: '150px' }}>
            <Select
              label="Filter Severity"
              options={[
                { value: '', label: 'All Severities' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
              value={filterSeverity}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterSeverity(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>
        </Card>
      )}

      {/* 3. Social Posting Box for Discussions */}
      {activeTab === 'discussions' && profile && (
        <Card style={{ padding: '1.25rem' }}>
          <form onSubmit={handlePostDiscussion} className="flex flex-col gap-3">
            <div className="flex gap-3 align-start">
              <Avatar name={profile.full_name} src={profile.avatar_url} size={36} />
              <textarea
                className="form-input flex-1"
                placeholder="Start a local discussion or share updates about civic activity..."
                style={{
                  minHeight: '80px',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  padding: '4px 0',
                  boxShadow: 'none',
                  background: 'none',
                  color: 'var(--text-heading)',
                }}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                maxLength={280}
              />
            </div>
            <div className="flex justify-between align-center border-t pt-3">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {280 - newPostContent.length} characters left
              </span>
              <Button type="submit" size="sm" loading={postingDiscussion} disabled={!newPostContent.trim()}>
                Post Discussion
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 4. Feeds Content */}
      <div className="flex flex-col gap-4">
        {loading ? (
          // Skeletons list
          [1, 2, 3].map((n) => (
            <Card key={n} className="flex flex-col gap-4">
              <div className="flex gap-3 align-center">
                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                <div className="flex flex-col gap-2" style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '120px', height: '16px' }} />
                  <div className="skeleton" style={{ width: '60px', height: '12px' }} />
                </div>
              </div>
              <div className="skeleton" style={{ width: '100%', height: '80px' }} />
            </Card>
          ))
        ) : activeTab === 'issues' ? (
          issues.length > 0 ? (
            issues.map((issue, index) => (
              <Card key={issue.id} className="card-interactive flex flex-col gap-4">
                {/* Card Header info */}
                <div className="flex justify-between align-center flex-wrap gap-2">
                  <div className="flex align-center gap-3">
                    <Avatar name={issue.profiles?.full_name || 'User'} src={issue.profiles?.avatar_url} size={40} />
                    <div>
                      <strong
                        onClick={() => navigate(`/profile/${issue.profiles?.username}`)}
                        style={{ cursor: 'pointer', color: 'var(--text-heading)', fontSize: '0.9375rem' }}
                      >
                        {issue.profiles?.full_name || 'Citizen'}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        @{issue.profiles?.username} · {formatTime(issue.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getSeverityVariant(issue.severity)}>
                      {issue.severity}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(issue.status)}>
                      {issue.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Main details */}
                <div
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  style={{ cursor: 'pointer' }}
                  className="flex flex-col gap-2"
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{issue.title}</h3>
                  <p
                    style={{
                      color: 'var(--text)',
                      fontSize: '0.875rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {issue.description}
                  </p>

                  {/* Render preview image if uploaded */}
                  {issue.issue_media && issue.issue_media.length > 0 && (
                    <img
                      src={issue.issue_media[0].media_url}
                      alt="Issue media"
                      style={{
                        width: '100%',
                        maxHeight: '280px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        marginTop: '0.5rem',
                      }}
                    />
                  )}
                </div>

                {/* Card footer engagement bar */}
                <div className="flex align-center justify-between border-t pt-3 flex-wrap gap-2" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex align-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSupport(issue.id, 'issue', index)}
                      className="flex align-center gap-1"
                      style={supportedIssueIds.includes(issue.id) ? {
                        color: 'var(--primary)',
                        backgroundColor: 'hsla(var(--primary-hue), 85%, 50%, 0.1)',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)'
                      } : {}}
                    >
                      <ThumbsUp size={18} weight={supportedIssueIds.includes(issue.id) ? "fill" : "regular"} />
                      <span>{issue.support_count} Supports</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleConfirmExistence(issue.id, index)}
                      className="flex align-center gap-1"
                      style={confirmedIssueIds.includes(issue.id) ? {
                        color: 'var(--success)',
                        backgroundColor: 'hsla(var(--success-hue), 69%, 40%, 0.1)',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)'
                      } : {}}
                    >
                      <CheckSquare size={18} weight={confirmedIssueIds.includes(issue.id) ? "fill" : "regular"} />
                      <span>{issue.confirmation_count} Verify It!</span>
                    </Button>
                  </div>

                  <div className="flex align-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/issues/${issue.id}?focus=comments`)}
                      className="flex align-center gap-1"
                    >
                      <Chat size={18} />
                      <span>{issue.comment_count} Comments</span>
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/issues/${issue.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <Warning size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
              <h3>No Active Issues</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                There are no open issues registered in your city.
              </p>
            </Card>
          )
        ) : (
          discussions.length > 0 ? (
            discussions.map((post, index) => (
              <Card key={post.id} className="flex flex-col gap-3">
                <div className="flex justify-between align-center">
                  <div className="flex align-center gap-3">
                    <Avatar name={post.profiles?.full_name || 'User'} src={post.profiles?.avatar_url} size={36} />
                    <div>
                      <div className="flex align-center gap-2">
                        <strong
                          onClick={() => navigate(`/profile/${post.profiles?.username}`)}
                          style={{ cursor: 'pointer', color: 'var(--text-heading)', fontSize: '0.875rem' }}
                        >
                          {post.profiles?.full_name || 'Citizen'}
                        </strong>
                        {post.discussion_type && post.discussion_type !== 'general' && (
                          <Badge variant={post.discussion_type === 'announcement' ? 'danger' : 'primary'} style={{ fontSize: '0.625rem', padding: '2px 6px' }}>
                            {post.discussion_type === 'announcement' ? 'Official Announcement' : post.discussion_type}
                          </Badge>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        @{post.profiles?.username} · {formatTime(post.created_at)}
                      </div>
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--text)', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </p>

                <div className="flex align-center gap-4 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSupport(post.id, 'discussion', index)}
                    className="flex align-center gap-1"
                    style={supportedDiscussionIds.includes(post.id) ? {
                      color: 'var(--primary)',
                      backgroundColor: 'hsla(var(--primary-hue), 85%, 50%, 0.1)',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)'
                    } : {}}
                  >
                    <ThumbsUp size={16} weight={supportedDiscussionIds.includes(post.id) ? "fill" : "regular"} />
                    <span>{post.support_count} Upvotes</span>
                  </Button>
                   <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedDiscussionId(expandedDiscussionId === post.id ? null : post.id)}
                    className="flex align-center gap-1"
                    style={expandedDiscussionId === post.id ? { color: 'var(--primary)', fontWeight: 600 } : {}}
                  >
                    <Chat size={16} />
                    <span>{post.comment_count} Replies</span>
                  </Button>
                </div>

                {expandedDiscussionId === post.id && (
                  <div className="border-t pt-3 mt-1 flex flex-col gap-3" style={{ borderColor: 'var(--border)' }}>
                    {/* Add reply form */}
                    {profile ? (
                      <form onSubmit={handlePostReply} className="flex gap-2">
                        <input
                          className="form-input flex-1"
                          placeholder="Write a reply..."
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-md)' }}
                          value={newReplyContent}
                          onChange={(e) => setNewReplyContent(e.target.value)}
                          required
                        />
                        <Button type="submit" size="sm" loading={postingReply}>
                          Reply
                        </Button>
                      </form>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sign in to reply.</p>
                    )}

                    {/* Replies list */}
                    <div className="flex flex-col gap-2 mt-1">
                      {loadingReplies ? (
                        <div className="skeleton" style={{ height: '40px', width: '100%' }} />
                      ) : discussionReplies.length > 0 ? (
                        discussionReplies.map((reply) => (
                          <div key={reply.id} className="flex gap-2 align-start p-2 rounded" style={{ backgroundColor: 'var(--bg-offset)', fontSize: '0.8125rem' }}>
                            <Avatar name={reply.profiles?.full_name} src={reply.profiles?.avatar_url} size={24} />
                            <div style={{ flex: 1 }}>
                              <div className="flex justify-between align-center flex-wrap">
                                <strong style={{ color: 'var(--text-heading)', fontSize: '0.75rem' }}>
                                  {reply.profiles?.full_name}
                                </strong>
                                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                                  @{reply.profiles?.username}
                                </span>
                              </div>
                              <p style={{ margin: '0.125rem 0 0', color: 'var(--text)' }}>{reply.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>No replies yet. Be the first to reply!</p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <Chat size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
              <h3>No Discussions Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Start a local discussion thread to connect with citizens in your neighborhood.
              </p>
            </Card>
          )
        )}
      </div>
    </div>
  );
};
export default HomePage;
