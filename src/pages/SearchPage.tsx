import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { toast } from 'react-hot-toast';
import { MagnifyingGlass, MapPin } from '@phosphor-icons/react';

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
}

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'issues' | 'cities' | 'users'>('issues');
  
  const [issues, setIssues] = useState<SearchIssue[]>([]);
  const [cities, setCities] = useState<SearchCity[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      if (activeTab === 'issues') {
        const { data } = await supabase
          .from('issue_reports')
          .select('id, title, status, severity')
          .or(`title.ilike.%${query.trim()}%,description.ilike.%${query.trim()}%`)
          .limit(10);
        setIssues(data as any[] || []);
      } else if (activeTab === 'cities') {
        const { data } = await supabase
          .from('cities')
          .select('id, name, slug, states(name)')
          .ilike('name', `%${query.trim()}%`)
          .limit(10);
        setCities(data as any[] || []);
      } else {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, username, role, avatar_url')
          .or(`full_name.ilike.%${query.trim()}%,username.ilike.%${query.trim()}%`)
          .limit(10);
        setUsers(data as any[] || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      handleSearch();
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-6" style={{ textAlign: 'left' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem' }}>Global Search</h2>
        <p style={{ color: 'var(--text-muted)' }}>Search issues, active cities, and local profiles.</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex gap-3 align-center">
          <div className="flex flex-1 align-center border rounded-md px-3 bg-offset" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-offset)', borderRadius: 'var(--radius-md)' }}>
            <MagnifyingGlass size={20} color="var(--text-muted)" />
            <input
              className="form-input flex-1"
              placeholder={`Search ${activeTab}...`}
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
          <button
            className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            Issues
          </button>
          <button
            className={`tab-btn ${activeTab === 'cities' ? 'active' : ''}`}
            onClick={() => setActiveTab('cities')}
          >
            Cities
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Profiles
          </button>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {searching ? (
          [1, 2].map((n) => (
            <Card key={n} className="skeleton" style={{ width: '100%', height: '70px' }} />
          ))
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
            query.trim() && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No issues found matching "{query}"</p>
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
                <Button variant="secondary" size="sm">View Board</Button>
              </Card>
            ))
          ) : (
            query.trim() && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No cities found matching "{query}"</p>
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
            query.trim() && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No profiles found matching "{query}"</p>
          )
        )}
      </div>
    </div>
  );
};
export default SearchPage;
