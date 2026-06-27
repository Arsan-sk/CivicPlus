import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { toast } from 'react-hot-toast';
import { Warning } from '@phosphor-icons/react';

interface ProfileDetails {
  id: string;
  full_name: string;
  username: string;
  bio?: string;
  role: string;
  contribution_score: number;
  is_verified: boolean;
  issues_raised_count: number;
  issues_resolved_count: number;
  supports_given_count: number;
  confirmations_given_count: number;
  avatar_url?: string;
}

interface IssueItem {
  id: string;
  title: string;
  status: string;
  severity: string;
  created_at: string;
}

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<ProfileDetails | null>(null);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndIssues = async () => {
      setLoading(true);
      try {
        // 1. Fetch profile info
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (error) throw error;
        setProfileData(profile as ProfileDetails);

        // 2. Fetch issues reported by this user
        const { data: userIssues } = await supabase
          .from('issue_reports')
          .select('id, title, status, severity, created_at')
          .eq('author_id', profile.id)
          .order('created_at', { ascending: false });

        if (userIssues) setIssues(userIssues);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfileAndIssues();
  }, [username]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton" style={{ width: '120px', height: '24px' }} />
        <Card className="skeleton" style={{ width: '100%', height: '200px' }} />
      </div>
    );
  }

  if (!profileData) {
    return (
      <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <h3>Profile Not Found</h3>
        <p style={{ color: 'var(--text-muted)' }}>The profile @{username} does not exist.</p>
        <Button onClick={() => navigate('/home')} style={{ marginTop: '1rem' }}>
          Go Home
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6" style={{ textAlign: 'left', maxWidth: '700px', margin: '0 auto' }}>
      {/* Profile Card Header Info */}
      <Card className="flex flex-col gap-4">
        <div className="flex align-center gap-4 flex-wrap">
          <Avatar name={profileData.full_name} src={profileData.avatar_url} size={80} />
          <div style={{ flex: 1 }}>
            <div className="flex align-center gap-2">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{profileData.full_name}</h2>
              {profileData.is_verified && <Badge variant="success">Official</Badge>}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>@{profileData.username}</p>
            {profileData.bio && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>{profileData.bio}</p>}
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <Badge variant="primary" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>
              Score: {profileData.contribution_score}
            </Badge>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Level 4 Civic Leader
            </div>
          </div>
        </div>

        {/* Dynamic statistics counts grid */}
        <div className="grid grid-cols-4 gap-4 border-t pt-4" style={{ borderColor: 'var(--border)', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              {profileData.issues_raised_count}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Raised</div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
              {profileData.issues_resolved_count}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Resolved</div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              {profileData.confirmations_given_count}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Verifies</div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              {profileData.supports_given_count}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Supports</div>
          </div>
        </div>
      </Card>

      {/* User Reported Issues Feed */}
      <div>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: 700 }}>
          Issues Reported By {profileData.full_name.split(' ')[0]} ({issues.length})
        </h3>
        
        <div className="flex flex-col gap-3">
          {issues.length > 0 ? (
            issues.map((issue) => (
              <Card
                key={issue.id}
                className="card-interactive flex justify-between align-center"
                style={{ cursor: 'pointer', padding: '1rem' }}
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                <div>
                  <strong style={{ color: 'var(--text-heading)', fontSize: '0.875rem' }}>{issue.title}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Reported on {new Date(issue.created_at).toLocaleDateString()}
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
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No issues filed yet.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
