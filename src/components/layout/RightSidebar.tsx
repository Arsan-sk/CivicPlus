import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendUp, Trophy, Users } from '@phosphor-icons/react';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface TrendingIssue {
  id: string;
  title: string;
  support_count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const RightSidebar: React.FC = () => {
  const [issues, setIssues] = useState<TrendingIssue[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    activeUsers: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrendingAndStats = async () => {
      try {
        // 1. Fetch trending issues from trending_issues view
        const { data: trendingData } = await supabase
          .from('trending_issues')
          .select('id, title, support_count, severity')
          .limit(3);
          
        if (trendingData) setIssues(trendingData);

        // 2. Fetch total and resolved counts
        const { count: totalCount } = await supabase
          .from('issue_reports')
          .select('*', { count: 'exact', head: true });

        const { count: resolvedCount } = await supabase
          .from('issue_reports')
          .select('*', { count: 'exact', head: true })
          .in('status', ['closed', 'community_verified_resolution']);

        // 3. Fetch active users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setStats({
          total: totalCount || 0,
          resolved: resolvedCount || 0,
          activeUsers: usersCount || 0,
        });
      } catch (err) {
        console.error('Failed to fetch sidebar widgets:', err);
      }
    };

    fetchTrendingAndStats();
  }, []);

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'low': return 'neutral';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <aside
      className="hide-desktop"
      style={{
        width: '320px',
        position: 'sticky',
        top: '64px',
        height: 'calc(100vh - 64px)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        overflowY: 'auto',
      }}
    >
      {/* 1. Civic Impact Widget */}
      <Card className="glass flex flex-col gap-4">
        <h4 className="flex align-center gap-2" style={{ fontSize: '1rem', fontWeight: 600 }}>
          <Trophy size={20} color="var(--primary)" weight="fill" />
          Civic Pulse Impact
        </h4>
        <div className="grid grid-cols-2 gap-3" style={{ textAlign: 'center' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-offset)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>{stats.total}</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Issues Reported</div>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-offset)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{stats.resolved}</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Resolved</div>
          </div>
        </div>
        <div className="flex align-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Users size={16} />
          <span>
            Supported by <strong>{stats.activeUsers}</strong> local citizens
          </span>
        </div>
      </Card>

      {/* 2. Trending Issues Widget */}
      <Card className="flex flex-col gap-4">
        <h4 className="flex align-center gap-2" style={{ fontSize: '1rem', fontWeight: 600 }}>
          <TrendUp size={20} color="var(--primary)" />
          Trending Issues
        </h4>
        <div className="flex flex-col gap-3">
          {issues.length > 0 ? (
            issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => navigate(`/issues/${issue.id}`)}
                className="card-interactive"
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-heading)',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {issue.title}
                </span>
                <div className="flex justify-between align-center">
                  <Badge variant={getSeverityVariant(issue.severity)}>
                    {issue.severity}
                  </Badge>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {issue.support_count} supports
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
              No trending issues today.
            </p>
          )}
        </div>
      </Card>
      
      <style>{`
        @media (max-width: 1200px) {
          .hide-desktop {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
};
