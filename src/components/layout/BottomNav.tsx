import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  House,
  Warning,
  PlusCircle,
  MagnifyingGlass,
  User,
} from '@phosphor-icons/react';
import { useAuthStore } from '../../store/authStore';

export const BottomNav: React.FC = () => {
  const { profile } = useAuthStore();

  const links = [
    { to: '/home', label: 'Home', icon: House },
    { to: '/issues', label: 'Issues', icon: Warning },
    { to: '/create', label: 'Create', icon: PlusCircle },
    { to: '/search', label: 'Search', icon: MagnifyingGlass },
    { to: profile ? `/profile/${profile.username}` : '/login', label: 'Profile', icon: User },
  ];

  return (
    <nav
      className="glass show-mobile-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        borderTop: '1px solid var(--border)',
        zIndex: 100,
        padding: '0 0.5rem',
      }}
    >
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className="flex flex-col align-center justify-center gap-1"
            style={({ isActive }) => ({
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.6875rem',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              width: '20%',
              height: '100%',
            })}
          >
            <Icon size={22} />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
      <style>{`
        .show-mobile-nav {
          display: none;
        }
        @media (max-width: 1024px) {
          .show-mobile-nav {
            display: flex;
            justify-content: space-around;
            align-items: center;
          }
        }
      `}</style>
    </nav>
  );
};
