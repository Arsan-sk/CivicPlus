import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { toast } from 'react-hot-toast';
import { MagnifyingGlass, MapPin, Sparkle, TrendUp, ChatTeardropText } from '@phosphor-icons/react';
import { useAuthStore } from '../store/authStore';

interface SearchIssue {
  id: string;
  title: string;
  status: string;
  severity: string;
}

interface SearchCity {
  id: string;
  name: string;
  slug: string;
  states?: {
    name: string;
  } | null;
}

interface SearchUser {
  id: string;
  full_name: string;
  username: string;
  role: string;
  avatar_url?: string;
  is_verified?: boolean;
}

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'issues' | 'discussions' | 'cities' | 'profiles'>('all');
  
  const [issues, setIssues] = useState<SearchIssue[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [cities, setCities] = useState<SearchCity[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [mixedResults, setMixedResults] = useState<any[]>([]);
  
  const [searching, setSearching] = useState(false);

  // Debounced live search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 1) {
        handleSearch();
      } else {
        // Reset search results when query is empty
        setIssues([]);
        setDiscussions([]);
        setCities([]);
        setUsers([]);
        setMixedResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeTab]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      if (activeTab === 'all') {
        const [issuesRes, discussionsRes, citiesRes, usersRes] = await Promise.all([
          supabase.from('issue_reports').select('id, title, status, severity, created_at').or(`title.ilike.%${query.trim()}%,description.ilike.%${query.trim()}%`).limit(10),
          supabase.from('discussions').select('id, content, created_at, profiles(full_name, username, avatar_url)').ilike('content', `%${query.trim()}%`).limit(10),
          supabase.from('cities').select('id, name, slug, states(name)').ilike('name', `%${query.trim()}%`).limit(10),
          supabase.from('profiles').select('id, full_name, username, role, avatar_url, is_verified').or(`full_name.ilike.%${query.trim()}%,username.ilike.%${query.trim()}%`).limit(10)
        ]);

        const rawIssues = (issuesRes.data || []).map((x: any) => ({ ...x, type: 'issue' }));
        const rawDiscussions = (discussionsRes.data || []).map((x: any) => ({ ...x, type: 'discussion' }));
        const rawCities = (citiesRes.data || []).map((x: any) => ({ ...x, type: 'city' }));
        const rawProfiles = (usersRes.data || []).map((x: any) => ({ ...x, type: 'profile' }));

        const qLower = query.trim().toLowerCase();
        
        const exactMatches: any[] = [];
        const trendingIssuesBucket: any[] = [];
        const citiesBucket: any[] = [];
        const authoritiesBucket: any[] = [];
        const citizensBucket: any[] = [];
        const discussionsBucket: any[] = [];

        rawIssues.forEach(x => {
          if (x.title.toLowerCase() === qLower) {
            exactMatches.push(x);
          } else {
            trendingIssuesBucket.push(x);
          }
        });

        rawCities.forEach(x => {
          if (x.name.toLowerCase() === qLower) {
            exactMatches.push(x);
          } else {
            citiesBucket.push(x);
          }
        });

        rawProfiles.forEach(x => {
          if (x.full_name.toLowerCase() === qLower || x.username.toLowerCase() === qLower) {
            exactMatches.push(x);
          } else if (x.role === 'authority') {
            authoritiesBucket.push(x);
          } else {
            citizensBucket.push(x);
          }
        });

        rawDiscussions.forEach(x => {
          discussionsBucket.push(x);
        });

        // Combined Ranking: Exact matches -> Trending issues -> Cities -> Authorities -> Citizens -> Discussions
        const finalMixed = [
          ...exactMatches,
          ...trendingIssuesBucket,
          ...citiesBucket,
          ...authoritiesBucket,
          ...citizensBucket,
          ...discussionsBucket
        ];
        
        setMixedResults(finalMixed);
      } else if (activeTab === 'issues') {
        const { data } = await supabase
          .from('issue_reports')
          .select('id, title, status, severity')
          .or(`title.ilike.%${query.trim()}%,description.ilike.%${query.trim()}%`)
          .limit(10);
        setIssues(data as any[] || []);
      } else if (activeTab === 'discussions') {
        const { data } = await supabase
          .from('discussions')
          .select('id, content, created_at, profiles(full_name, username, avatar_url)')
          .ilike('content', `%${query.trim()}%`)
          .limit(10);
        setDiscussions(data as any[] || []);
      } else if (activeTab === 'cities') {
        const { data } = await supabase
          .from('cities')
          .select('id, name, slug, states(name)')
          .ilike('name', `%${query.trim()}%`)
          .limit(10);
        setCities(data as any[] || []);
      } else {
        let userSearchQuery = supabase
          .from('profiles')
          .select('id, full_name, username, role, avatar_url, is_verified')
          .or(`full_name.ilike.%${query.trim()}%,username.ilike.%${query.trim()}%`);

        if (profile?.id) {
          userSearchQuery = userSearchQuery.neq('id', profile.id);
        }

        const { data } = await userSearchQuery.limit(10);
        setUsers(data as any[] || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const selectTrendingTopic = (topic: string) => {
    setQuery(topic);
  };

  return (
    <div className="flex flex-col gap-6" style={{ textAlign: 'left' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Global Search</h2>
        <p style={{ color: 'var(--text-muted)' }}>Search issues, active cities, and local profiles.</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex gap-3 align-center">
          <div className="flex flex-1 align-center border rounded-md px-3 bg-offset" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-offset)', borderRadius: 'var(--radius-md)' }}>
            <MagnifyingGlass size={20} color="var(--text-muted)" />
            <input
              className="form-input flex-1"
              placeholder={`Search in ${activeTab === 'all' ? 'all sections' : activeTab}...`}
              style={{ border: 'none', background: 'none', boxShadow: 'none', padding: '0.625rem 0' }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" loading={searching}>
            Search
          </Button>
        </form>

        <div className="tabs mt-4" style={{ border: 'none' }}>
          {['all', 'issues', 'discussions', 'cities', 'profiles'].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab as any)}
              style={{ textTransform: 'capitalize' }}
            >
              {tab === 'profiles' ? 'Profiles' : tab}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        {searching ? (
          [1, 2, 3].map((n) => (
            <Card key={n} className="skeleton" style={{ width: '100%', height: '70px' }} />
          ))
        ) : !query.trim() ? (
          /* Render Default Recommendations Screen */
          <div className="flex flex-col gap-6">
            {/* 1. Trending Issues */}
            <div>
              <h4 className="flex align-center gap-2" style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                <Sparkle size={16} color="var(--warning)" weight="fill" />
                Trending Issues
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Mumbai monsoon potholes', query: 'Western Express Highway' },
                  { label: 'Bengaluru traffic congestion', query: 'Silk Board' },
                  { label: 'Chennai waterlogging', query: 'Velachery' }
                ].map((item, idx) => (
                  <Card
                    key={idx}
                    className="card-interactive"
                    style={{ padding: '1rem', cursor: 'pointer', border: '1px solid var(--border)' }}
                    onClick={() => selectTrendingTopic(item.query)}
                  >
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}>{item.label}</span>
                  </Card>
                ))}
              </div>
            </div>

            {/* 2. Trending Cities */}
            <div>
              <h4 className="flex align-center gap-2" style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                <MapPin size={16} color="var(--primary)" weight="fill" />
                Trending Cities
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Mumbai', slug: 'mumbai' },
                  { label: 'Bengaluru', slug: 'bengaluru' },
                  { label: 'Delhi', slug: 'delhi' }
                ].map((city, idx) => (
                  <Card
                    key={idx}
                    className="card-interactive flex align-center justify-between"
                    style={{ padding: '1rem', cursor: 'pointer', border: '1px solid var(--border)' }}
                    onClick={() => navigate(`/city/${city.slug}`)}
                  >
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-heading)' }}>{city.label}</span>
                    <Button variant="ghost" size="sm" style={{ padding: '2px 6px', fontSize: '0.6875rem' }}>Visit</Button>
                  </Card>
                ))}
              </div>
            </div>

            {/* 3. Trending Profiles */}
            <div>
              <h4 className="flex align-center gap-2" style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                <TrendUp size={16} color="var(--success)" />
                Trending Profiles
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Mumbai CM (Devendra)', username: 'fadnavis_devendra', role: 'Chief Minister' },
                  { label: 'Bengaluru CM (Shivakumar)', username: 'shivakumar_dk', role: 'Chief Minister' },
                  { label: 'Active Citizens (Abhijeet)', username: 'abhijeet_dipke', role: 'Citizen' }
                ].map((userItem, idx) => (
                  <Card
                    key={idx}
                    className="card-interactive"
                    style={{ padding: '1rem', cursor: 'pointer', border: '1px solid var(--border)' }}
                    onClick={() => navigate(`/profile/${userItem.username}`)}
                  >
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-heading)' }}>{userItem.label}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>@{userItem.username} · {userItem.role}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Render Active Search Results */
          activeTab === 'all' ? (
            mixedResults.length > 0 ? (
              mixedResults.map((item) => {
                if (item.type === 'issue') {
                  return (
                    <Card
                      key={item.id}
                      className="card-interactive flex justify-between align-center"
                      style={{ cursor: 'pointer', padding: '1rem', borderLeft: '4px solid var(--danger)' }}
                      onClick={() => navigate(`/issues/${item.id}`)}
                    >
                      <div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Issue Report</div>
                        <strong style={{ color: 'var(--text-heading)', fontSize: '0.9375rem' }}>{item.title}</strong>
                      </div>
                      <Badge variant="primary">{item.status.replace(/_/g, ' ')}</Badge>
                    </Card>
                  );
                } else if (item.type === 'discussion') {
                  return (
                    <Card
                      key={item.id}
                      className="card-interactive flex justify-between align-center"
                      style={{ cursor: 'pointer', padding: '1rem', borderLeft: '4px solid var(--primary)' }}
                      onClick={() => navigate(`/profile/${item.profiles?.username}`)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Discussion Post by @{item.profiles?.username}</div>
                        <p style={{ color: 'var(--text-heading)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '450px', margin: 0 }}>
                          {item.content}
                        </p>
                      </div>
                      <ChatTeardropText size={18} color="var(--primary)" />
                    </Card>
                  );
                } else if (item.type === 'city') {
                  return (
                    <Card
                      key={item.id}
                      className="card-interactive flex justify-between align-center"
                      style={{ cursor: 'pointer', padding: '1rem', borderLeft: '4px solid var(--success)' }}
                      onClick={() => navigate(`/city/${item.slug}`)}
                    >
                      <div className="flex align-center gap-2">
                        <MapPin size={20} color="var(--success)" />
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>City Board</div>
                          <strong style={{ color: 'var(--text-heading)', fontSize: '0.9375rem' }}>{item.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                            {item.states?.name}
                          </span>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm">Explore</Button>
                    </Card>
                  );
                } else {
                  return (
                    <Card
                      key={item.id}
                      className="card-interactive flex justify-between align-center"
                      style={{ cursor: 'pointer', padding: '1rem', borderLeft: '4px solid var(--border)' }}
                      onClick={() => navigate(`/profile/${item.username}`)}
                    >
                      <div className="flex align-center gap-3">
                        <Avatar name={item.full_name} src={item.avatar_url} size={36} />
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>User Profile</div>
                          <strong style={{ color: 'var(--text-heading)', fontSize: '0.9375rem' }}>{item.full_name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                            @{item.username}
                          </span>
                        </div>
                      </div>
                      <Badge variant={item.role === 'authority' ? 'success' : 'neutral'}>
                        {item.role}
                      </Badge>
                    </Card>
                  );
                }
              })
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No results found matching "{query}"</p>
            )
          ) : activeTab === 'issues' ? (
            issues.length > 0 ? (
              issues.map((issue) => (
                <Card
                  key={issue.id}
                  className="card-interactive flex justify-between align-center"
                  style={{ cursor: 'pointer', padding: '1rem' }}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                >
                  <div>
                    <strong style={{ color: 'var(--text-heading)', fontSize: '0.9375rem' }}>{issue.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Severity: {issue.severity}
                    </div>
                  </div>
                  <Badge variant="primary">{issue.status.replace(/_/g, ' ')}</Badge>
                </Card>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No issues found matching "{query}"</p>
            )
          ) : activeTab === 'discussions' ? (
            discussions.length > 0 ? (
              discussions.map((disc) => (
                <Card
                  key={disc.id}
                  className="card-interactive flex justify-between align-center"
                  style={{ cursor: 'pointer', padding: '1rem' }}
                  onClick={() => navigate(`/profile/${disc.profiles?.username}`)}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posted by @{disc.profiles?.username}</div>
                    <p style={{ color: 'var(--text-heading)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{disc.content}</p>
                  </div>
                  <ChatTeardropText size={18} color="var(--primary)" />
                </Card>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No discussions found matching "{query}"</p>
            )
          ) : activeTab === 'cities' ? (
            cities.length > 0 ? (
              cities.map((city) => (
                <Card
                  key={city.id}
                  className="card-interactive flex justify-between align-center"
                  style={{ cursor: 'pointer', padding: '1rem' }}
                  onClick={() => navigate(`/city/${city.slug}`)}
                >
                  <div className="flex align-center gap-2">
                    <MapPin size={20} color="var(--primary)" />
                    <div>
                      <strong style={{ color: 'var(--text-heading)', fontSize: '0.9375rem' }}>{city.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        {city.states?.name}
                      </span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">Explore Page</Button>
                </Card>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No cities found matching "{query}"</p>
            )
          ) : (
            users.length > 0 ? (
              users.map((userItem) => (
                <Card
                  key={userItem.id}
                  className="card-interactive flex justify-between align-center"
                  style={{ cursor: 'pointer', padding: '1rem' }}
                  onClick={() => navigate(`/profile/${userItem.username}`)}
                >
                  <div className="flex align-center gap-3">
                    <Avatar name={userItem.full_name} src={userItem.avatar_url} size={36} />
                    <div>
                      <strong style={{ color: 'var(--text-heading)', fontSize: '0.9375rem' }}>{userItem.full_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{userItem.username}</div>
                    </div>
                  </div>
                  <Badge variant={userItem.role === 'authority' ? 'success' : 'neutral'}>
                    {userItem.role}
                  </Badge>
                </Card>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No profiles found matching "{query}"</p>
            )
          )
        )}
      </div>
    </div>
  );
};
export default SearchPage;
