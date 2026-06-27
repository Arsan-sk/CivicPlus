import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-hot-toast';
import { MapPin, Warning } from '@phosphor-icons/react';

interface CityStats {
  city_id: string;
  city_name: string;
  state_name: string;
  total_issues: number;
  open_issues: number;
  resolved_issues: number;
  critical_issues: number;
  avg_resolution_hours: number;
  active_citizens: number;
}

interface IssueItem {
  id: string;
  title: string;
  status: string;
  severity: string;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
  description?: string;
}

export const CityPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [stats, setStats] = useState<CityStats | null>(null);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCityData = async () => {
      setLoading(true);
      try {
        // 1. Fetch city slug stats from view
        const { data: statsData, error: statsError } = await supabase
          .from('city_statistics')
          .select('*')
          .eq('city_slug', slug)
          .single();

        if (statsError) throw statsError;
        setStats(statsData as CityStats);

        // 2. Fetch issues in this city
        const { data: issuesData } = await supabase
          .from('issue_reports')
          .select('id, title, status, severity, created_at')
          .eq('city_id', statsData.city_id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (issuesData) setIssues(issuesData);

        // 3. Fetch departments in this city
        const { data: deptData } = await supabase
          .from('departments')
          .select('id, name, description')
          .eq('city_id', statsData.city_id);

        if (deptData) setDepartments(deptData);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load city details.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchCityData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton" style={{ width: '150px', height: '24px' }} />
        <Card className="skeleton" style={{ width: '100%', height: '250px' }} />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <h3>City Not Found</h3>
        <p style={{ color: 'var(--text-muted)' }}>We couldn't retrieve information for city: "{slug}"</p>
        <Button onClick={() => navigate('/home')} style={{ marginTop: '1rem' }}>
          Back Home
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6" style={{ textAlign: 'left' }}>
      {/* City header details */}
      <div className="flex align-center gap-2">
        <MapPin size={28} color="var(--primary)" weight="fill" />
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.city_name} Municipality</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Region Board: {stats.state_name}</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-heading)' }}>{stats.total_issues}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Reported</div>
        </Card>
        <Card style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{stats.resolved_issues}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolved</div>
        </Card>
        <Card style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>{stats.critical_issues}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Critical Priority</div>
        </Card>
        <Card style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
            {stats.avg_resolution_hours ? `${stats.avg_resolution_hours}h` : 'N/A'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Fix Time</div>
        </Card>
      </div>

      {/* City sections */}
      <div className="grid grid-cols-2 gap-6">
        {/* Latest reports */}
        <div className="flex flex-col gap-3">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Active Reports Feed</h3>
          {issues.length > 0 ? (
            issues.map((issue) => (
              <Card
                key={issue.id}
                className="card-interactive flex justify-between align-center"
                style={{ cursor: 'pointer', padding: '0.875rem' }}
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                <div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-heading)' }}>{issue.title}</strong>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                    Severity: {issue.severity}
                  </div>
                </div>
                <Badge variant={issue.status === 'closed' ? 'success' : 'warning'}>
                  {issue.status.replace(/_/g, ' ')}
                </Badge>
              </Card>
            ))
          ) : (
            <Card style={{ textAlign: 'center', padding: '2rem' }}>
              <Warning size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No issues filed in this city yet.</p>
            </Card>
          )}
        </div>

        {/* Assigned departments info */}
        <div className="flex flex-col gap-3">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Routing Departments</h3>
          <div className="flex flex-col gap-3">
            {departments.map((dept) => (
              <Card key={dept.id} style={{ padding: '1rem' }} className="flex align-center gap-3">
                <Warning size={24} color="var(--primary)" />
                <div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-heading)' }}>{dept.name}</strong>
                  {dept.description && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                      {dept.description}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CityPage;
