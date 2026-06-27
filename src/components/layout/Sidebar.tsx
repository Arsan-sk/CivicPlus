import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  House,
  Warning,
  PlusCircle,
  MagnifyingGlass,
  User,
  ChartBar,
  Gear,
  ShieldCheck,
} from '@phosphor-icons/react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const { profile } = useAuthStore();

  const links = [
    { to: '/home', label: 'Home', icon: House },
    { to: '/issues', label: 'Issues', icon: Warning },
    { to: '/create', label: 'Create Post', icon: PlusCircle },
    { to: '/search', label: 'Search', icon: MagnifyingGlass },
    ...(profile
      ? [
          { to: `/profile/${profile.username}`, label: 'Profile', icon: User },
          { to: '/dashboard', label: 'Dashboard', icon: ChartBar },
        ]
      : []),
    ...(profile?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin Panel', icon: ShieldCheck }]
      : []),
    { to: '/settings', label: 'Settings', icon: Gear },
  ];

  return (
    <aside
      style={{
        width: '240px',
        position: 'sticky',
        top: '64px',
        height: 'calc(100vh - 64px)',
        borderRight: '1px solid var(--border)',
        padding: '1.5rem 1rem',
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
      className="hide-tablet"
    >
      <nav className="flex flex-col gap-1 w-full" style={{ gap: '4px' }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {profile && (
        <div
          style={{
            marginTop: 'auto',
            padding: '1rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div className="badge badge-success" style={{ textTransform: 'capitalize', fontSize: '0.6875rem' }}>
            {profile.role}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Score: <strong style={{ color: 'var(--text-heading)' }}>{profile.contribution_score}</strong>
          </span>
        </div>
      )}
      
      <style>{`
        @media (max-width: 1024px) {
          .hide-tablet {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
};
