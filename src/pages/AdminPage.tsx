import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  Warning, 
  GitMerge, 
  SquaresFour, 
  Trash, 
  Check, 
  ChartLineUp 
} from '@phosphor-icons/react';

interface ReportDetail {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter_id: string;
  reporter?: {
    full_name: string;
    username: string;
  };
  issue_id: string | null;
  issue?: {
    id: string;
    title: string;
    description: string;
  };
  discussion_id: string | null;
  discussion?: {
    id: string;
    content: string;
  };
}

interface ProfileUser {
  id: string;
  full_name: string;
  username: string;
  role: string;
  contribution_score: number;
}

interface IssueReport {
  id: string;
  title: string;
  status: string;
  city_id: string;
  city?: {
    name: string;
  };
}

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'reports' | 'duplicates' | 'categories' | 'applications'>('stats');

  // Stats Data
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    resolvedIssues: 0,
    reportedSpams: 0,
  });

  // User list & search
  const [users, setUsers] = useState<ProfileUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Promotion detail form state
  const [selectedUserForPromo, setSelectedUserForPromo] = useState<ProfileUser | null>(null);
  const [promoPosition, setPromoPosition] = useState('Department Officer');
  const [promoJurisdictionLevel, setPromoJurisdictionLevel] = useState('city');
  const [promoStateId, setPromoStateId] = useState('');
  const [promoCityId, setPromoCityId] = useState('');
  const [promoDeptId, setPromoDeptId] = useState('');
  const [statesList, setStatesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [deptsList, setDeptsList] = useState<any[]>([]);
  const [submittingPromo, setSubmittingPromo] = useState(false);

  // Authority Applications list
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Spam Reports list
  const [reports, setReports] = useState<ReportDetail[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Issues list for duplicates
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [parentIssueId, setParentIssueId] = useState('');
  const [dupIssueId, setDupIssueId] = useState('');
  const [merging, setMerging] = useState(false);

  // Categories & Cities list
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [newCityName, setNewCityName] = useState('');
  const [newCitySlug, setNewCitySlug] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // Initial Fetch Analytics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: issuesCount } = await supabase.from('issue_reports').select('*', { count: 'exact', head: true });
        const { count: resolvedCount } = await supabase.from('issue_reports').select('*', { count: 'exact', head: true }).eq('status', 'closed');
        const { count: reportsCount } = await supabase.from('reported_content').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        setStats({
          totalUsers: usersCount || 0,
          totalIssues: issuesCount || 0,
          resolvedIssues: resolvedCount || 0,
          reportedSpams: reportsCount || 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [activeTab]);

  // Load Users Tab
  useEffect(() => {
    if (activeTab === 'users') {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        let query = supabase.from('profiles').select('id, full_name, username, role, contribution_score');
        if (userSearchQuery.trim()) {
          query = query.or(`full_name.ilike.%${userSearchQuery}%,username.ilike.%${userSearchQuery}%`);
        }
        const { data } = await query.order('username');
        if (data) setUsers(data as ProfileUser[]);
        setLoadingUsers(false);
      };
      fetchUsers();
    }
  }, [activeTab, userSearchQuery]);

  // Load Content Reports Tab
  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const { data } = await supabase
        .from('reported_content')
        .select(`
          id,
          reason,
          status,
          created_at,
          reporter_id,
          issue_id,
          discussion_id
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (data) {
        // Hydrate manual joins due to possible complex foreign keys in sandbox client schemas
        const hydrated = await Promise.all(data.map(async (rep: any) => {
          let reporterData = null;
          let issueData = null;
          let discData = null;

          if (rep.reporter_id) {
            const { data: p } = await supabase.from('profiles').select('full_name, username').eq('id', rep.reporter_id).single();
            reporterData = p;
          }
          if (rep.issue_id) {
            const { data: i } = await supabase.from('issue_reports').select('id, title, description').eq('id', rep.issue_id).single();
            issueData = i;
          }
          if (rep.discussion_id) {
            const { data: d } = await supabase.from('discussions').select('id, content').eq('id', rep.discussion_id).single();
            discData = d;
          }

          return {
            ...rep,
            reporter: reporterData,
            issue: issueData,
            discussion: discData
          } as ReportDetail;
        }));
        setReports(hydrated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab]);

  // Load Merge Tab Issues
  useEffect(() => {
    if (activeTab === 'duplicates') {
      const fetchIssues = async () => {
        const { data } = await supabase
          .from('issue_reports')
          .select('id, title, status, city_id, cities(name)')
          .eq('is_duplicate', false)
          .order('title');
        if (data) {
          const formatted = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            status: item.status,
            city_id: item.city_id,
            city: { name: item.cities?.name || 'Unknown City' }
          }));
          setIssues(formatted);
        }
      };
      fetchIssues();
    }
  }, [activeTab]);

  // Load Categories & Cities Tab
  useEffect(() => {
    if (activeTab === 'categories') {
      const fetchCitiesAndCats = async () => {
        const { data: cats } = await supabase.from('issue_categories').select('id, name, slug').order('name');
        const { data: cts } = await supabase.from('cities').select('id, name, slug').order('name');
        if (cats) setCategories(cats);
        if (cts) setCities(cts);
      };
      fetchCitiesAndCats();
    }
  }, [activeTab]);

  // Load Applications Tab
  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const { data, error } = await supabase
        .from('authority_applications')
        .select(`
          id, position, jurisdiction_level, city_id, state_id, department_id, status, created_at, user_id,
          profiles (full_name, username)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load applications.');
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!selectedUserForPromo) return;
    const fetchDropdowns = async () => {
      const { data: states } = await supabase.from('states').select('id, name').order('name');
      const { data: depts } = await supabase.from('departments').select('id, name').order('name');
      if (states) setStatesList(states);
      if (depts) setDeptsList(depts);
    };
    fetchDropdowns();
  }, [selectedUserForPromo]);

  useEffect(() => {
    if (promoPosition === 'Prime Minister') {
      setPromoJurisdictionLevel('national');
      setPromoStateId('');
      setPromoCityId('');
    } else if (promoPosition === 'Chief Minister') {
      setPromoJurisdictionLevel('state');
      setPromoCityId('');
    } else {
      setPromoJurisdictionLevel('city');
    }
  }, [promoPosition]);

  useEffect(() => {
    if (!promoStateId) {
      setCitiesList([]);
      return;
    }
    const fetchCities = async () => {
      const { data: cities } = await supabase
        .from('cities')
        .select('id, name')
        .eq('state_id', promoStateId)
        .order('name');
      if (cities) setCitiesList(cities);
    };
    fetchCities();
  }, [promoStateId]);

  const handleApproveApplication = async (app: any) => {
    try {
      // 1. Promote profile role to authority
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'authority' })
        .eq('id', app.user_id);
      if (roleError) throw roleError;

      // 2. Insert into authorities table
      const { error: authError } = await supabase
        .from('authorities')
        .insert({
          profile_id: app.user_id,
          position: app.position,
          jurisdiction_level: app.jurisdiction_level,
          city_id: app.city_id,
          state_id: app.state_id,
          department_id: app.department_id,
          is_verified: true,
          verified_at: new Date().toISOString()
        });
      if (authError) throw authError;

      // 3. Mark application status approved
      const { error: appError } = await supabase
        .from('authority_applications')
        .update({ status: 'approved' })
        .eq('id', app.id);
      if (appError) throw appError;

      toast.success('Authority application approved successfully!');
      loadApplications();
    } catch (err: any) {
      toast.error(`Approval failed: ${err.message}`);
    }
  };

  const handleRejectApplication = async (appId: string) => {
    try {
      const { error } = await supabase
        .from('authority_applications')
        .update({ status: 'rejected' })
        .eq('id', appId);
      if (error) throw error;
      toast.success('Application rejected.');
      loadApplications();
    } catch (err: any) {
      toast.error(`Operation failed: ${err.message}`);
    }
  };

  const handleDirectPromotionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPromo) return;

    setSubmittingPromo(true);
    try {
      const userId = selectedUserForPromo.id;

      // 1. Update user profile role
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'authority' })
        .eq('id', userId);
      if (roleError) throw roleError;

      // 2. Insert authority record
      const { error: authError } = await supabase
        .from('authorities')
        .insert({
          profile_id: userId,
          position: promoPosition,
          jurisdiction_level: promoJurisdictionLevel,
          city_id: promoJurisdictionLevel === 'city' && promoCityId ? promoCityId : null,
          state_id: (promoJurisdictionLevel === 'city' || promoJurisdictionLevel === 'state') && promoStateId ? promoStateId : null,
          department_id: promoPosition === 'Department Officer' && promoDeptId ? promoDeptId : null,
          is_verified: true,
          verified_at: new Date().toISOString()
        });
      if (authError) throw authError;

      toast.success(`${selectedUserForPromo.full_name} promoted to Authority successfully!`);
      setSelectedUserForPromo(null);
      
      // Reload user list
      const { data } = await supabase.from('profiles').select('id, full_name, username, role, contribution_score').order('username');
      if (data) setUsers(data as ProfileUser[]);
    } catch (err: any) {
      toast.error(`Promotion failed: ${err.message}`);
    } finally {
      setSubmittingPromo(false);
    }
  };

  // User Actions
  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (newRole === 'citizen') {
      // Demoting from authority: update profiles, and delete authorities row
      const { error: roleError } = await supabase.from('profiles').update({ role: 'citizen' }).eq('id', userId);
      if (roleError) {
        toast.error(`Demotion failed: ${roleError.message}`);
      } else {
        await supabase.from('authorities').delete().eq('profile_id', userId);
        toast.success('Demoted to Citizen.');
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: 'citizen' } : u)));
      }
    }
  };

  // Moderation Actions
  const handleDismissReport = async (reportId: string) => {
    const { error } = await supabase.from('reported_content').update({ status: 'dismissed' }).eq('id', reportId);
    if (error) {
      toast.error('Dismiss failed.');
    } else {
      toast.success('Report dismissed successfully.');
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    }
  };

  const handleDeleteReportContent = async (reportId: string, issueId: string | null, discId: string | null) => {
    try {
      if (issueId) {
        const { error } = await supabase.from('issue_reports').delete().eq('id', issueId);
        if (error) throw error;
      } else if (discId) {
        const { error } = await supabase.from('discussions').delete().eq('id', discId);
        if (error) throw error;
      }
      
      await supabase.from('reported_content').update({ status: 'resolved' }).eq('id', reportId);
      toast.success('Content removed successfully.');
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err: any) {
      toast.error(`Failed to delete content: ${err.message}`);
    }
  };

  // Merge Action
  const handleMergeIssues = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentIssueId || !dupIssueId) {
      toast.error('Please select both parent and duplicate issues.');
      return;
    }
    if (parentIssueId === dupIssueId) {
      toast.error('Parent and duplicate issues cannot be the same!');
      return;
    }

    setMerging(true);
    try {
      const { error } = await supabase
        .from('issue_reports')
        .update({
          is_duplicate: true,
          duplicate_of: parentIssueId,
          status: 'closed' // close duplicate issue report
        })
        .eq('id', dupIssueId);

      if (error) throw error;

      toast.success('Issues merged successfully! Duplicate report marked closed and linked.');
      setParentIssueId('');
      setDupIssueId('');
    } catch (err: any) {
      toast.error(`Merge failed: ${err.message}`);
    } finally {
      setMerging(false);
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;
    try {
      const { data, error } = await supabase.from('issue_categories').insert({
        name: newCatName.trim(),
        slug: newCatSlug.trim().toLowerCase()
      }).select().single();

      if (error) throw error;
      toast.success('Category created successfully!');
      setCategories((prev) => [...prev, data]);
      setNewCatName('');
      setNewCatSlug('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Add City
  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName || !newCitySlug) return;
    try {
      // Find default state first
      const { data: firstState } = await supabase.from('states').select('id').limit(1).single();
      if (!firstState) {
        toast.error('No state found. Create state in database first.');
        return;
      }

      const { data, error } = await supabase.from('cities').insert({
        name: newCityName.trim(),
        slug: newCitySlug.trim().toLowerCase(),
        state_id: firstState.id
      }).select().single();

      if (error) throw error;
      toast.success('City created successfully!');
      setCities((prev) => [...prev, data]);
      setNewCityName('');
      setNewCitySlug('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'left', padding: '1rem' }} className="flex flex-col gap-6">
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-heading)' }}>
          Admin Dashboard
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage CivicPulse platform states, verify municipal authorities, moderate reported spams, and merge duplicates.
        </p>
      </div>

      {/* DASHBOARD TABS */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border)', paddingBottom: '0.25rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'stats' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('stats')}
        >
          <ChartLineUp size={16} style={{ marginRight: '6px' }} /> Overview
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} style={{ marginRight: '6px' }} /> User Control
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'applications' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('applications')}
        >
          <Users size={16} style={{ marginRight: '6px' }} weight="fill" /> Authority Requests
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'reports' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('reports')}
        >
          <Warning size={16} style={{ marginRight: '6px' }} /> Moderate Spam ({stats.reportedSpams})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'duplicates' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('duplicates')}
        >
          <GitMerge size={16} style={{ marginRight: '6px' }} /> Merge Tickets
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'categories' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('categories')}
        >
          <SquaresFour size={16} style={{ marginRight: '6px' }} /> Categories & Cities
        </button>
      </div>

      {/* TAB CONTENT: STATS */}
      {activeTab === 'stats' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-4">
            <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Citizens</span>
              <strong style={{ fontSize: '1.75rem', color: 'var(--text-heading)' }}>{stats.totalUsers}</strong>
            </Card>
            <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Issues Filed</span>
              <strong style={{ fontSize: '1.75rem', color: 'var(--text-heading)' }}>{stats.totalIssues}</strong>
            </Card>
            <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Resolved Tickets</span>
              <strong style={{ fontSize: '1.75rem', color: 'var(--text-heading)' }}>{stats.resolvedIssues}</strong>
            </Card>
            <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Unresolved Reports</span>
              <strong style={{ fontSize: '1.75rem', color: 'var(--danger)' }}>{stats.reportedSpams}</strong>
            </Card>
          </div>

          <Card style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin System Overview</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Welcome back to the CivicPulse administrator terminal. Here, you have complete control over municipal classifications, profiles verification, and spam ticket containment. Please review pending spam flags or merge duplicate reports raised by citizens in Step 3.
            </p>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: USERS */}
      {activeTab === 'users' && (
        <Card style={{ padding: '1.5rem' }}>
          <div className="flex justify-between align-center flex-wrap gap-4 mb-4">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>User Directory & Verification</h3>
            <Input
              type="text"
              placeholder="Search user by name or username..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
          </div>
          {loadingUsers ? (
            <p>Loading users...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Name / Username</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Current Role</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Score</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <strong style={{ color: 'var(--text-heading)' }}>{u.full_name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'authority' ? 'success' : 'neutral'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{u.contribution_score}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }} className="flex gap-2 justify-end">
                        {u.role === 'citizen' && (
                          <Button size="sm" variant="secondary" onClick={() => setSelectedUserForPromo(u)}>
                            Promote to Authority
                          </Button>
                        )}
                        {u.role === 'authority' && (
                          <Button size="sm" variant="secondary" onClick={() => handleUpdateRole(u.id, 'citizen')}>
                            Demote to Citizen
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB CONTENT: REPORTS */}
      {activeTab === 'reports' && (
        <Card style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Spam Flags & Content Moderation</h3>
          {loadingReports ? (
            <p>Loading reports...</p>
          ) : reports.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No pending spam reports. Excellent work!</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-offset)',
                  }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex justify-between align-center">
                    <div>
                      <Badge variant="danger">Pending Review</Badge>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        Reported by @{rep.reporter?.username || 'unknown'} · {new Date(rep.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleDismissReport(rep.id)}>
                        <Check size={16} /> Dismiss Report
                      </Button>
                      <Button 
                        size="sm" 
                        variant="primary" 
                        style={{ backgroundColor: 'var(--danger)' }}
                        onClick={() => handleDeleteReportContent(rep.id, rep.issue_id, rep.discussion_id)}
                      >
                        <Trash size={16} /> Remove Content
                      </Button>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '0.875rem' }}>
                    <strong>Flag Reason:</strong> <span style={{ color: 'var(--text-muted)' }}>{rep.reason}</span>
                  </div>

                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px dashed var(--border)',
                      fontSize: '0.875rem',
                    }}
                  >
                    {rep.issue && (
                      <div>
                        <strong>[Issue Report] {rep.issue.title}</strong>
                        <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>{rep.issue.description}</p>
                      </div>
                    )}
                    {rep.discussion && (
                      <div>
                        <strong>[Civic Discussion]</strong>
                        <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>{rep.discussion.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB CONTENT: DUPLICATES */}
      {activeTab === 'duplicates' && (
        <Card style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Merge Duplicate Tickets</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
            If citizens file multiple reports for the same incident (e.g. same pothole on Metro Road), link the duplicate report to the parent ticket. The duplicate report will be marked as closed, and will direct users to support the primary parent ticket.
          </p>

          <form onSubmit={handleMergeIssues} className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Primary (Parent) Issue</label>
                <select
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                  value={parentIssueId}
                  onChange={(e) => setParentIssueId(e.target.value)}
                  required
                >
                  <option value="">Select Primary Issue...</option>
                  {issues.map((i) => (
                    <option key={i.id} value={i.id}>
                      [{i.city?.name}] {i.title} ({i.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Duplicate Issue to Merge</label>
                <select
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                  value={dupIssueId}
                  onChange={(e) => setDupIssueId(e.target.value)}
                  required
                >
                  <option value="">Select Duplicate Issue...</option>
                  {issues.map((i) => (
                    <option key={i.id} value={i.id}>
                      [{i.city?.name}] {i.title} ({i.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" loading={merging} style={{ alignSelf: 'flex-start' }}>
              Merge & Close Duplicate
            </Button>
          </form>
        </Card>
      )}

      {/* TAB CONTENT: CATEGORIES & CITIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-2 gap-6">
          <Card style={{ padding: '1.5rem' }} className="flex flex-col gap-4">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Cities & Municipalities</h3>
            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
              {cities.map((city) => (
                <div key={city.id} className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border)', fontSize: '0.875rem' }}>
                  <strong>{city.name}</strong>
                  <span style={{ color: 'var(--text-muted)' }}>/{city.slug}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddCity} className="flex flex-col gap-3">
              <Input
                label="New City Name"
                placeholder="e.g. Pune"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                required
              />
              <Input
                label="New City Slug"
                placeholder="e.g. pune"
                value={newCitySlug}
                onChange={(e) => setNewCitySlug(e.target.value)}
                required
              />
              <Button type="submit">Add New City</Button>
            </form>
          </Card>

          <Card style={{ padding: '1.5rem' }} className="flex flex-col gap-4">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Classification Categories</h3>
            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
              {categories.map((cat) => (
                <div key={cat.id} className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border)', fontSize: '0.875rem' }}>
                  <strong>{cat.name}</strong>
                  <span style={{ color: 'var(--text-muted)' }}>/{cat.slug}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddCategory} className="flex flex-col gap-3">
              <Input
                label="New Category Name"
                placeholder="e.g. Traffic Signage"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
              <Input
                label="New Category Slug"
                placeholder="e.g. traffic-signage"
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value)}
                required
              />
              <Button type="submit">Add Category</Button>
            </form>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: APPLICATIONS */}
      {activeTab === 'applications' && (
        <Card style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Pending Authority Verification Applications</h3>
          {loadingApps ? (
            <p>Loading applications...</p>
          ) : applications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No pending authority requests.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>User</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Requested Position</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Jurisdiction</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <strong style={{ color: 'var(--text-heading)' }}>{app.profiles?.full_name || 'Anonymous'}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{app.profiles?.username}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <Badge variant="primary">{app.position}</Badge>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ textTransform: 'capitalize' }}>
                          <strong>{app.jurisdiction_level}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {app.city_id && 'City level mapping'} 
                          {app.state_id && 'State level mapping'}
                          {app.department_id && ' · Assigned Department'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }} className="flex gap-2 justify-end">
                        <Button size="sm" variant="primary" onClick={() => handleApproveApplication(app)}>
                          Approve & Promote
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleRejectApplication(app.id)}>
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* DIRECT PROMOTION DIALOG MODAL */}
      {selectedUserForPromo && (
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-heading)' }}>
              Promote Citizen to Authority
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
              Promoting <strong>{selectedUserForPromo.full_name}</strong> (@{selectedUserForPromo.username}) to verified authority.
            </p>
            <form onSubmit={handleDirectPromotionSubmit} className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Position Title
                </label>
                <select
                  value={promoPosition}
                  onChange={(e) => setPromoPosition(e.target.value)}
                  className="input"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-heading)' }}
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
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-offset)',
                    color: 'var(--text-heading)',
                    fontSize: '0.875rem',
                    textTransform: 'capitalize',
                    fontWeight: 600
                  }}
                >
                  {promoJurisdictionLevel}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Country
                </label>
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-offset)',
                    color: 'var(--text-heading)',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  India
                </div>
              </div>

              {(promoJurisdictionLevel === 'city' || promoJurisdictionLevel === 'state') && (
                <div>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Select State
                  </label>
                  <select
                    value={promoStateId}
                    onChange={(e) => {
                      setPromoStateId(e.target.value);
                      setPromoCityId('');
                    }}
                    className="input"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-heading)' }}
                    required
                  >
                    <option value="">-- Select State --</option>
                    {statesList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {promoJurisdictionLevel === 'city' && promoStateId && (
                <div>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Select City
                  </label>
                  <select
                    value={promoCityId}
                    onChange={(e) => setPromoCityId(e.target.value)}
                    className="input"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-heading)' }}
                    required
                  >
                    <option value="">-- Select City --</option>
                    {citiesList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {promoPosition === 'Department Officer' && (
                <div>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Assigned Government Department
                  </label>
                  <select
                    value={promoDeptId}
                    onChange={(e) => setPromoDeptId(e.target.value)}
                    className="input"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-heading)' }}
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
                <Button type="button" variant="secondary" onClick={() => setSelectedUserForPromo(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submittingPromo}>
                  Confirm Promotion
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
export default AdminPage;
