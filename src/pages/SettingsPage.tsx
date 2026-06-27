import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { Gear, User, MapPin } from '@phosphor-icons/react';

export const SettingsPage: React.FC = () => {
  const { profile, signOut } = useAuthStore();

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem' }} className="flex align-center gap-2">
          <Gear size={28} />
          Settings
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Configure your preference and account profile.</p>
      </div>

      {profile && (
        <Card className="flex flex-col gap-4">
          <h3 className="flex align-center gap-2" style={{ fontSize: '1.125rem' }}>
            <User size={20} color="var(--primary)" />
            Profile Account
          </h3>
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Full Name</div>
            <strong style={{ color: 'var(--text-heading)' }}>{profile.full_name}</strong>
          </div>
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Username</div>
            <strong style={{ color: 'var(--text-heading)' }}>@{profile.username}</strong>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email</div>
            <strong style={{ color: 'var(--text-heading)' }}>{profile.email}</strong>
          </div>
        </Card>
      )}

      <Card className="flex flex-col gap-4">
        <h3 className="flex align-center gap-2" style={{ fontSize: '1.125rem' }}>
          <MapPin size={20} color="var(--primary)" />
          Onboarding Location
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Your default city is locked to your home municipality. You can search or view other city boards directly from the Top navigation bar.
        </p>
      </Card>

      <Button variant="danger" onClick={signOut} style={{ alignSelf: 'flex-start' }}>
        Log Out
      </Button>
    </div>
  );
};
export default SettingsPage;
