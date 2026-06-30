import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-hot-toast';
import { MapPin, Warning, ShieldCheck, ArrowLeft, Buildings } from '@phosphor-icons/react';
import { Avatar } from '../components/ui/Avatar';

interface CityStats {
  city_id: string;
  city_name: string;
  state_id: string;
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

interface AuthorityOfficial {
  id: string;
  position: string;
  jurisdiction_level: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url?: string;
    is_verified: boolean;
  };
}

const STATE_EMBLEM_WIKI_TITLES: Record<string, string> = {
  'Maharashtra': 'Emblem_of_Maharashtra',
  'Karnataka': 'Emblem_of_Karnataka',
  'Tamil Nadu': 'Emblem_of_Tamil_Nadu',
  'Telangana': 'Emblem_of_Telangana',
  'Delhi': 'National_Emblem_of_India'
};

const STATE_EMBLEM_FALLBACK_URLS: Record<string, string> = {
  'Maharashtra': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Seal_of_Maharashtra.svg',
  'Karnataka': 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Seal_of_Karnataka.svg',
  'Tamil Nadu': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Emblem_of_Tamil_Nadu.svg',
  'Telangana': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Emblem_of_Telangana.svg',
  'Delhi': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Seal_of_the_National_Capital_Territory_of_Delhi.svg'
};

async function fetchStateEmblem(stateName: string): Promise<string | null> {
  const normalizedState = stateName.trim();

  // 1. Primary: Wikipedia REST Summary API
  const wikiTitle = STATE_EMBLEM_WIKI_TITLES[normalizedState];
  if (wikiTitle) {
    try {
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`);
      if (response.ok) {
        const data = await response.json();
        if (data.thumbnail?.source) {
          return data.thumbnail.source;
        }
      }
    } catch (e) {
      console.warn(`Wikipedia REST API failed for ${normalizedState}:`, e);
    }
  }

  // 2. Fallback 1: Wikimedia Commons search
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&generator=search&gsrsearch=State%20emblem%20of%20${encodeURIComponent(normalizedState)}&gsrlimit=1&iiprop=url&origin=*`;
    const response = await fetch(searchUrl);
    if (response.ok) {
      const data = await response.json();
      const pages = data.query?.pages;
      if (pages) {
        const firstPage = Object.values(pages)[0] as any;
        const imgUrl = firstPage.imageinfo?.[0]?.url;
        if (imgUrl) return imgUrl;
      }
    }
  } catch (e) {
    console.warn(`Wikimedia Commons search failed for ${normalizedState}:`, e);
  }

  // 3. Fallback 2: Static hardcoded URL
  return STATE_EMBLEM_FALLBACK_URLS[normalizedState] || null;
}

export const CityPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [stats, setStats] = useState<CityStats | null>(null);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [officials, setOfficials] = useState<AuthorityOfficial[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblemUrl, setEmblemUrl] = useState<string | null>(null);
  const [emblemLoading, setEmblemLoading] = useState(true);

  useEffect(() => {
    if (!stats?.state_name) return;

    let isMounted = true;
    const loadEmblem = async () => {
      setEmblemLoading(true);
      try {
        const url = await fetchStateEmblem(stats.state_name);
        if (isMounted) {
          setEmblemUrl(url);
        }
      } catch (err) {
        console.error('Failed to load state emblem:', err);
      } finally {
        if (isMounted) {
          setEmblemLoading(false);
        }
      }
    };

    loadEmblem();

    return () => {
      isMounted = false;
    };
  }, [stats?.state_name]);

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
        
        // Ensure state_id is fetched correctly or query city table for missing fields
        const { data: rawCity } = await supabase
          .from('cities')
          .select('state_id')
          .eq('id', statsData.city_id)
          .single();

        const statsWithStateId: CityStats = {
          ...statsData,
          state_id: rawCity?.state_id || ''
        };
        setStats(statsWithStateId);

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

        // 4. Fetch authorities matching city_id OR state_id
        const { data: authData } = await supabase
          .from('authorities')
          .select(`
            id, position, jurisdiction_level,
            profiles:profiles!authorities_profile_id_fkey (full_name, username, avatar_url, is_verified)
          `)
          .or(`city_id.eq.${statsData.city_id},state_id.eq.${rawCity?.state_id || ''}`);

        if (authData) {
          setOfficials(authData as any[]);
        }
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

  const getStateCode = (stateName: string) => {
    const map: Record<string, string> = {
      'Maharashtra': 'MH',
      'Delhi': 'DL',
      'Karnataka': 'KA',
      'Tamil Nadu': 'TN',
      'Telangana': 'TS'
    };
    return map[stateName] || 'IN';
  };

  // Map officials
  const chiefMinister = officials.find(x => x.position.toLowerCase() === 'chief minister');
  const mayor = officials.find(x => x.position.toLowerCase() === 'mayor');
  const commissioner = officials.find(x => x.position.toLowerCase().includes('commissioner'));
  const wardOfficer = officials.find(x => x.position.toLowerCase().includes('ward'));
  const waterOfficer = officials.find(x => 
    x.position === 'Department Officer' || 
    x.position.toLowerCase().includes('water') || 
    x.position.toLowerCase().includes('bwssb') || 
    x.position.toLowerCase().includes('cmwssb') || 
    x.position.toLowerCase().includes('hmwssb') || 
    x.position.toLowerCase().includes('jal board')
  );

  const renderOfficialCard = (roleLabel: string, official: AuthorityOfficial | undefined, placeholderName: string) => {
    const hasOfficial = !!official;
    const name = hasOfficial ? official.profiles.full_name : placeholderName;
    const username = hasOfficial ? official.profiles.username : '';
    const avatar = hasOfficial ? official.profiles.avatar_url : '';
    const isVerified = hasOfficial ? official.profiles.is_verified : false;

    return (
      <Card
        className="card-interactive flex align-center gap-3"
        style={{ padding: '1rem', cursor: hasOfficial ? 'pointer' : 'default', border: '1px solid var(--border)' }}
        onClick={() => {
          if (hasOfficial) navigate(`/profile/${username}`);
        }}
      >
        <Avatar name={name} src={avatar} size={44} />
        <div style={{ flex: 1 }}>
          <div className="flex align-center gap-1">
            <strong style={{ fontSize: '0.875rem', color: 'var(--text-heading)' }}>{name}</strong>
            {isVerified && <ShieldCheck size={16} color="var(--success)" weight="fill" />}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{roleLabel}</div>
          {!hasOfficial && (
            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-offset)', padding: '2px 6px', borderRadius: '4px', marginTop: '0.25rem', display: 'inline-block' }}>
              Vacancy Pending
            </span>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-6" style={{ textAlign: 'left' }}>
      <div className="flex align-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ borderRadius: '50%', padding: '6px' }}>
          <ArrowLeft size={18} />
        </Button>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Back</span>
      </div>

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

      {/* 5. Responsible Individuals Grid */}
      <div className="flex flex-col gap-3">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Responsible Municipal Officials</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            {renderOfficialCard('👤 Mayor', mayor, 'Mayor (Unassigned)')}
            {renderOfficialCard('👤 Municipal Commissioner', commissioner, 'Municipal Commissioner (Unassigned)')}
            {renderOfficialCard('👤 Ward Officer', wardOfficer, 'Ward Officer (Unassigned)')}
            {renderOfficialCard('👤 Water Department Officer', waterOfficer, 'Water Department Officer (Unassigned)')}
          </div>

          {/* State Jurisdiction CM Card */}
          <div className="flex flex-col">
            <Card style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
              {/* Semi-transparent Watermark Background Emblem Badge */}
              <div style={{
                position: 'absolute',
                right: '-15px',
                bottom: '10px',
                fontSize: '8.5rem',
                fontWeight: 900,
                color: 'var(--text-heading)',
                opacity: 0.05,
                lineHeight: 1,
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 0
              }}>
                {getStateCode(stats.state_name)}
              </div>

              <div style={{ zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Buildings size={20} color="var(--primary)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>State Jurisdiction Info</span>
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>State of {stats.state_name}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  This city belongs to the state jurisdiction of {stats.state_name}. Direct appeals and policies are overseen by the state chief executive.
                </p>
              </div>

              {/* State Emblem Space */}
              <div style={{ zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1rem 0', minHeight: '80px' }}>
                {emblemUrl ? (
                  <img 
                    src={emblemUrl} 
                    alt={`${stats.state_name} Emblem`} 
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
                  />
                ) : emblemLoading ? (
                  <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
                ) : (
                  <Buildings size={48} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                )}
              </div>

              <div style={{ zIndex: 1, marginTop: '1.5rem' }}>
                {chiefMinister ? (
                  <div 
                    className="flex align-center gap-3 p-3 rounded-md card-interactive" 
                    style={{ backgroundColor: 'var(--bg-offset)', cursor: 'pointer', border: '1px solid var(--border)' }}
                    onClick={() => navigate(`/profile/${chiefMinister.profiles.username}`)}
                  >
                    <Avatar name={chiefMinister.profiles.full_name} src={chiefMinister.profiles.avatar_url} size={40} />
                    <div>
                      <div className="flex align-center gap-1">
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text-heading)' }}>{chiefMinister.profiles.full_name}</strong>
                        <ShieldCheck size={14} color="var(--success)" weight="fill" />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chief Minister</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--bg-offset)', border: '1px dashed var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    State Chief Minister unlinked in statistics.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
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
