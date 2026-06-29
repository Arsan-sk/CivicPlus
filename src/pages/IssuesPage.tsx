import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { toast } from 'react-hot-toast';
import {
  Warning,
  MagnifyingGlass,
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

export const IssuesPage: React.FC = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<'city' | 'all'>('city');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [authorityInfo, setAuthorityInfo] = useState<any | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('issue_categories').select('id, name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAuthorityInfo = async () => {
      if (profile?.role === 'authority') {
        const { data } = await supabase
          .from('authorities')
          .select(`
            *,
            cities (name),
            states (name),
            departments (name)
          `)
          .eq('profile_id', profile.id)
          .single();
        if (data) setAuthorityInfo(data);
      }
    };
    fetchAuthorityInfo();
  }, [profile]);

  const fetchIssuesList = async () => {
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

      if (profile?.role === 'authority') {
        if (authorityInfo) {
          if (authorityInfo.jurisdiction_level === 'state') {
            const { data: stateCities } = await supabase
              .from('cities')
              .select('id')
              .eq('state_id', authorityInfo.state_id);
            const cityIds = (stateCities || []).map((c: any) => c.id);
            query = query.in('city_id', cityIds);
          } else if (authorityInfo.jurisdiction_level === 'city') {
            query = query.eq('city_id', authorityInfo.city_id);
            if (authorityInfo.department_id) {
              query = query.eq('assigned_department_id', authorityInfo.department_id);
            }
          }
        } else {
          setIssues([]);
          setLoading(false);
          return;
        }
      } else {
        if (scope === 'city' && profile?.city_id) {
          query = query.eq('city_id', profile.city_id);
        }
      }

      if (category) {
        query = query.eq('category_id', category);
      }
      if (severity) {
        query = query.eq('severity', severity);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setIssues(data as any[] || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load issues listing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuesList();
  }, [scope, category, severity, status, profile, authorityInfo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIssuesList();
  };

  const formatStatus = (s: string) => {
    const mapping: Record<string, string> = {
      'submitted': 'Submitted',
      'community_verification_pending': 'Pending Verification',
      'community_verified': 'Community Verified',
      'seen_by_authority': 'Seen by Authority',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'resolved_by_authority': 'Resolved',
      'awaiting_community_verification': 'Awaiting Verification',
      'community_verified_resolution': 'Resolution Verified',
      'closed': 'Closed',
    };
    return mapping[s] || s;
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

  const getPageHeader = () => {
    if (!profile || profile.role !== 'authority' || !authorityInfo) {
      return {
        title: "Civic Issues Directory",
        subtitle: "Browse, verify, and track citizen reported issues."
      };
    }
    const position = authorityInfo.position || 'Authority';
    if (authorityInfo.jurisdiction_level === 'national') {
      return {
        title: "Issues Under Your National Jurisdiction",
        subtitle: `Overseeing national civic reports as ${position}.`
      };
    }
    if (authorityInfo.jurisdiction_level === 'state') {
      const stateName = authorityInfo.states?.name || 'State';
      return {
        title: `Issues Under Your State Jurisdiction (${stateName})`,
        subtitle: `Overseeing state-wide reports as ${position}.`
      };
    }
    const cityName = authorityInfo.cities?.name || 'City';
    const deptName = authorityInfo.departments?.name;
    return {
      title: `Issues Under Your Local Jurisdiction (${cityName}${deptName ? ` - ${deptName}` : ''})`,
      subtitle: `Overseeing assigned local reports as ${position}.`
    };
  };

  const header = getPageHeader();

  return (
    <div className="flex flex-col gap-6" style={{ textAlign: 'left' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem' }}>{header.title}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{header.subtitle}</p>
      </div>

      {/* Scope and Search bar */}
      <Card className="flex flex-col gap-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3 align-center">
          <div className="flex flex-1 align-center border rounded-md px-3 bg-offset" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-offset)', borderRadius: 'var(--radius-md)' }}>
            <MagnifyingGlass size={20} color="var(--text-muted)" />
            <input
              className="form-input flex-1"
              placeholder="Search issues by title..."
              style={{ border: 'none', background: 'none', boxShadow: 'none', padding: '0.625rem 0' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex flex-wrap gap-4 align-center justify-between border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          {profile?.role !== 'authority' ? (
            <div className="tabs" style={{ border: 'none' }}>
              <button
                className={`tab-btn ${scope === 'city' ? 'active' : ''}`}
                onClick={() => setScope('city')}
                style={{ padding: '0.25rem 0.5rem' }}
              >
                My City
              </button>
              <button
                className={`tab-btn ${scope === 'all' ? 'active' : ''}`}
                onClick={() => setScope('all')}
                style={{ padding: '0.25rem 0.5rem' }}
              >
                All Cities
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              🔒 Scoped to your jurisdiction
            </div>
          )}

          <div className="flex flex-wrap gap-3 align-center">
            <Select
              options={[{ value: '', label: 'All Categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ marginBottom: 0, padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            />
            <Select
              options={[
                { value: '', label: 'All Severities' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              style={{ marginBottom: 0, padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            />
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'submitted', label: 'Reported' },
                { value: 'community_verification_pending', label: 'Verification Pending' },
                { value: 'community_verified', label: 'Verified' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'resolved_by_authority', label: 'Resolved By Authority' },
                { value: 'closed', label: 'Closed' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ marginBottom: 0, padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            />
          </div>
        </div>
      </Card>

      {/* Grid listing */}
      <div className="grid grid-cols-2 gap-4">
        {loading ? (
          [1, 2, 3, 4].map((n) => (
            <Card key={n} className="skeleton" style={{ width: '100%', height: '180px' }} />
          ))
        ) : issues.length > 0 ? (
          issues.map((issue) => (
            <Card
              key={issue.id}
              className="card-interactive flex flex-col justify-between gap-3"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/issues/${issue.id}`)}
            >
              <div>
                <div className="flex justify-between align-center mb-2">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {issue.issue_categories?.name || 'General'}
                  </span>
                  <Badge variant={getSeverityVariant(issue.severity)}>
                    {issue.severity}
                  </Badge>
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.3 }}>{issue.title}</h3>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {issue.description}
                </p>
              </div>

              <div className="flex justify-between align-center border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                <div className="flex align-center gap-2">
                  <Badge variant={getStatusBadgeVariant(issue.status)}>
                    {formatStatus(issue.status)}
                  </Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); navigate(`/issues/${issue.id}`); }}
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                  >
                    View Details
                  </Button>
                </div>
                <div className="flex gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{issue.support_count} Upvotes</span>
                  <span>·</span>
                  <span>{issue.confirmation_count} Verify It!</span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card style={{ gridColumn: 'span 2', textAlign: 'center', padding: '3rem 2rem' }}>
            <Warning size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
            <h3>No Issues Matching Filters</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Adjust search filters or check options.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
export default IssuesPage;
