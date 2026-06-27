import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, MapPin, SignOut, List, X, ChartBar, Gear } from '@phosphor-icons/react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface City {
  id: string;
  name: string;
  slug: string;
}

export const TopBar: React.FC = () => {
  const { profile, signOut } = useAuthStore();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityName, setSelectedCityName] = useState('Select City');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Apply theme class
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Fetch all cities for city selector info
    const fetchCities = async () => {
      const { data } = await supabase.from('cities').select('id, name, slug');
      if (data) {
        setCities(data);
        if (profile?.city_id) {
          const userCity = data.find((c) => c.id === profile.city_id);
          if (userCity) setSelectedCityName(userCity.name);
        }
      }
    };
    fetchCities();
  }, [profile]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleCityChange = (citySlug: string) => {
    navigate(`/city/${citySlug}`);
  };

  return (
    <header
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="flex align-center gap-4">
        <h2
          style={{
            fontFamily: 'var(--display)',
            fontSize: '1.25rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--primary), #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          onClick={() => navigate('/home')}
        >
          CivicPulse
        </h2>

        {profile && (
          <div
            className="flex align-center gap-2"
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--bg-offset)',
              border: '1px solid var(--border)',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            <MapPin size={16} color="var(--primary)" weight="fill" />
            <select
              value={cities.find((c) => c.name === selectedCityName)?.slug || ''}
              onChange={(e) => handleCityChange(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-heading)',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="" disabled>
                {selectedCityName}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex align-center gap-4">
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm"
          style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {profile ? (
          <>
            <button
              className="btn btn-ghost btn-sm hide-mobile"
              style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, position: 'relative' }}
              onClick={() => navigate('/notifications')}
            >
              <Bell size={20} />
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--danger)',
                  borderRadius: '50%',
                }}
              />
            </button>

            <div
              className="flex align-center gap-2 hide-mobile"
              onClick={() => navigate(`/profile/${profile.username}`)}
              style={{ cursor: 'pointer' }}
            >
              <Avatar name={profile.full_name} src={profile.avatar_url} size={32} />
              <span
                className="hide-mobile"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-heading)',
                }}
              >
                {profile.full_name.split(' ')[0]}
              </span>
            </div>

            <button
              onClick={signOut}
              className="btn btn-ghost btn-sm hide-mobile"
              style={{ padding: '8px', borderRadius: '50%' }}
              title="Sign Out"
            >
              <SignOut size={18} />
            </button>

            <button
              className="btn btn-ghost btn-sm show-tablet"
              onClick={() => setMenuOpen(true)}
              style={{ padding: '8px', borderRadius: '50%' }}
              aria-label="Open Mobile Menu"
            >
              <List size={20} />
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
              Sign Up
            </button>
          </div>
        )}
      </div>

      {menuOpen && profile && (
        <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between align-center border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex align-center gap-2">
                <Avatar name={profile.full_name} src={profile.avatar_url} size={36} />
                <div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-heading)', display: 'block' }}>
                    {profile.full_name}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{profile.username}</span>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setMenuOpen(false)}
                style={{ borderRadius: '50%', padding: '6px' }}
                aria-label="Close Mobile Menu"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-2 flex-1 mt-4">
              <button
                className="sidebar-link"
                onClick={() => {
                  navigate('/dashboard');
                  setMenuOpen(false);
                }}
              >
                <ChartBar size={20} />
                <span>Dashboard</span>
              </button>
              <button
                className="sidebar-link"
                onClick={() => {
                  navigate('/settings');
                  setMenuOpen(false);
                }}
              >
                <Gear size={20} />
                <span>Settings</span>
              </button>
            </nav>

            <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  setMenuOpen(false);
                  await signOut();
                }}
                className="flex align-center gap-2 w-full"
              >
                <SignOut size={16} />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .show-tablet {
          display: none !important;
        }
        .mobile-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
        }
        .mobile-drawer-content {
          position: absolute;
          top: 0;
          right: 0;
          width: 280px;
          height: 100%;
          background: var(--bg-card);
          border-left: 1px solid var(--border);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 1024px) {
          .hide-mobile {
            display: none !important;
          }
          .show-tablet {
            display: inline-flex !important;
          }
        }
        @media (max-width: 640px) {
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
