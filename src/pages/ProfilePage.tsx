import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { toast } from 'react-hot-toast';
import { Warning } from '@phosphor-icons/react';
import { useAuthStore } from '../store/authStore';

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
  const { profile } = useAuthStore();

  const [profileData, setProfileData] = useState<ProfileDetails | null>(null);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Authority Promotion states
  const [existingApp, setExistingApp] = useState<any | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [position, setPosition] = useState('Department Officer');
  const [jurisdictionLevel, setJurisdictionLevel] = useState('city');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Dropdown lists
  const [statesList, setStatesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [deptsList, setDeptsList] = useState<any[]>([]);
  const [submittingApp, setSubmittingApp] = useState(false);

  useEffect(() => {
    const fetchProfileAndIssues = async () => {
      setLoading(true);
      try {
        // 1. Fetch profile info
        const { data: profileRow, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (error) throw error;
        setProfileData(profileRow as ProfileDetails);

        // 2. Fetch issues reported by this user
        const { data: userIssues } = await supabase
          .from('issue_reports')
          .select('id, title, status, severity, created_at')
          .eq('author_id', profileRow.id)
          .order('created_at', { ascending: false });

        if (userIssues) setIssues(userIssues);

        // 3. Fetch existing application if viewing own profile
        if (profile && profile.id === profileRow.id) {
          const { data: apps } = await supabase
            .from('authority_applications')
            .select('*')
            .eq('user_id', profileRow.id)
            .order('created_at', { ascending: false })
            .limit(1);
          if (apps && apps.length > 0) {
            setExistingApp(apps[0]);
          } else {
            setExistingApp(null);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfileAndIssues();
  }, [username, profile]);
  useEffect(() => {
    if (!showApplyModal) return;
    const fetchDropdowns = async () => {
      const { data: states } = await supabase.from('states').select('id, name').order('name');
      const { data: depts } = await supabase.from('departments').select('id, name').order('name');
      if (states) setStatesList(states);
      if (depts) setDeptsList(depts);
    };
    fetchDropdowns();
  }, [showApplyModal]);

  useEffect(() => {
    if (!selectedState) {
      setCitiesList([]);
      return;
    }
    const fetchCities = async () => {
      const { data: cities } = await supabase
        .from('cities')
        .select('id, name')
        .eq('state_id', selectedState)
        .order('name');
      if (cities) setCitiesList(cities);
    };
    fetchCities();
  }, [selectedState]);

  const handleApplyAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSubmittingApp(true);
    try {
      const { error } = await supabase
        .from('authority_applications')
        .insert({
          user_id: profile.id,
          position,
          jurisdiction_level: jurisdictionLevel,
          city_id: jurisdictionLevel === 'city' && selectedCity ? selectedCity : null,
          state_id: (jurisdictionLevel === 'city' || jurisdictionLevel === 'state') && selectedState ? selectedState : null,
          department_id: position === 'Department Officer' && selectedDept ? selectedDept : null,
          status: 'pending'
        });

      if (error) throw error;
      toast.success('Authority application submitted successfully!');
      setShowApplyModal(false);
      
      // Reload application status
      const { data: apps } = await supabase
        .from('authority_applications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (apps && apps.length > 0) {
        setExistingApp(apps[0]);
      }
    } catch (err: any) {
      toast.error(`Application failed: ${err.message}`);
    } finally {
      setSubmittingApp(false);
    }
  };
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
        {profile && profile.id === profileData.id && profileData.role === 'citizen' && (
          <div className="border-t pt-4 mt-2 flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
            {existingApp && existingApp.status === 'pending' ? (
              <div
                style={{
                  padding: '0.875rem',
                  backgroundColor: 'var(--bg-offset)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
                <span>Authority Verification Application Pending Review ({existingApp.position} - {existingApp.jurisdiction_level})</span>
              </div>
            ) : existingApp && existingApp.status === 'rejected' ? (
              <div className="flex flex-col gap-2">
                <div
                  style={{
                    padding: '0.875rem',
                    backgroundColor: 'var(--danger-light)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem',
                    color: 'var(--danger)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                >
                  <strong>Application Rejected</strong>
                  <span style={{ fontSize: '0.75rem' }}>Your previous request was rejected. You may apply again with corrected credentials.</span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowApplyModal(true)}>
                  Re-apply for Verified Authority
                </Button>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setShowApplyModal(true)}>
                Apply for Verified Authority
              </Button>
            )}
          </div>
        )}
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

      {/* AUTHORITY APPLICATION MODAL */}
      {showApplyModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem'
          }}
        >
          <Card style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-heading)' }}>
              Apply for Verified Authority
            </h3>
            <form onSubmit={handleApplyAuthority} className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Requested Position
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="input"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}
                  required
                >
                  <option value="Department Officer">Department Officer</option>
                  <option value="Ward Officer">Ward Officer</option>
                  <option value="Municipal Commissioner">Municipal Commissioner</option>
                  <option value="Mayor">Mayor</option>
                  <option value="MLA">MLA</option>
                  <option value="Chief Minister">Chief Minister</option>
                  <option value="Prime Minister">Prime Minister</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Jurisdiction Level
                </label>
                <select
                  value={jurisdictionLevel}
                  onChange={(e) => setJurisdictionLevel(e.target.value)}
                  className="input"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}
                  required
                >
                  <option value="city">City</option>
                  <option value="state">State</option>
                  <option value="national">National</option>
                </select>
              </div>

              {(jurisdictionLevel === 'city' || jurisdictionLevel === 'state') && (
                <div>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Select State
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedCity('');
                    }}
                    className="input"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}
                    required
                  >
                    <option value="">-- Select State --</option>
                    {statesList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {jurisdictionLevel === 'city' && selectedState && (
                <div>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Select City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="input"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}
                    required
                  >
                    <option value="">-- Select City --</option>
                    {citiesList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {position === 'Department Officer' && (
                <div>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Assigned Government Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="input"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}
                    required
                  >
                    <option value="">-- Select Department --</option>
                    {deptsList.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submittingApp}>
                  Submit Application
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
export default ProfilePage;
