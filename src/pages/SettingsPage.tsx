import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Avatar } from '../components/ui/Avatar';
import { toast } from 'react-hot-toast';
import { User, Lock, Bell, Trash } from '@phosphor-icons/react';

interface City { id: string; name: string; }
interface State { id: string; name: string; }

export const SettingsPage: React.FC = () => {
  const { profile, signOut, setProfile } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications'>('profile');

  // Profile form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [cityId, setCityId] = useState(profile?.city_id || '');
  const [stateId, setStateId] = useState(profile?.state_id || '');
  const [saving, setSaving] = useState(false);

  // Password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Location data
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    const fetchStates = async () => {
      const { data } = await supabase.from('states').select('id, name').order('name');
      if (data) setStates(data);
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (stateId) {
      const fetchCities = async () => {
        const { data } = await supabase
          .from('cities')
          .select('id, name')
          .eq('state_id', stateId)
          .order('name');
        if (data) setCities(data);
      };
      fetchCities();
    }
  }, [stateId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!fullName.trim() || !username.trim()) {
      toast.error('Full name and username are required.');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
          bio: bio.trim(),
          city_id: cityId || null,
          state_id: stateId || null,
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      // Update the auth store profile
      if (setProfile && data) {
        setProfile(data as any);
      }

      toast.success('Profile updated successfully!');
    } catch (err: any) {
      if (err.code === '23505') {
        toast.error('Username already taken. Choose a different one.');
      } else {
        toast.error(`Update failed: ${err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully.');
  };

  if (!profile) {
    return (
      <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Please sign in to access settings.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6" style={{ textAlign: 'left', maxWidth: '700px', margin: '0 auto' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Account Settings</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your profile, security, and notification preferences.</p>
      </div>

      {/* Settings navigation tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} style={{ marginRight: '0.375rem' }} />
          Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <Lock size={16} style={{ marginRight: '0.375rem' }} />
          Security
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={16} style={{ marginRight: '0.375rem' }} />
          Notifications
        </button>
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <Card className="flex flex-col gap-5">
          {/* Avatar preview */}
          <div className="flex align-center gap-4">
            <Avatar name={profile.full_name} src={profile.avatar_url} size={72} />
            <div>
              <strong style={{ color: 'var(--text-heading)', display: 'block' }}>{profile.full_name}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>@{profile.username}</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Avatar is generated from your initials.
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-1">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="unique_username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-input"
                placeholder="Tell people about yourself and your civic interests..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ minHeight: '80px', resize: 'vertical' }}
                maxLength={200}
              />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {200 - bio.length} characters left
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="State / Region"
                options={[{ value: '', label: 'Select State' }, ...states.map((s) => ({ value: s.id, label: s.name }))]}
                value={stateId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setStateId(e.target.value);
                  setCityId('');
                }}
              />
              <Select
                label="City"
                options={[{ value: '', label: 'Select City' }, ...cities.map((c) => ({ value: c.id, label: c.name }))]}
                value={cityId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCityId(e.target.value)}
                disabled={!stateId}
              />
            </div>

            <Button type="submit" loading={saving} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              Save Profile
            </Button>
          </form>
        </Card>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'password' && (
        <Card className="flex flex-col gap-4">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Change Password</h3>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-1">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
            <Button type="submit" loading={changingPassword} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              Update Password
            </Button>
          </form>

          <div
            className="flex flex-col gap-3 border-t pt-4"
            style={{ borderColor: 'var(--border)', marginTop: '0.5rem' }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--danger)' }}>
              Danger Zone
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Once you sign out, you will need to log back in to access the platform.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={handleSignOut}
              className="flex align-center gap-2"
              style={{ alignSelf: 'flex-start' }}
            >
              <Trash size={16} />
              Sign Out of Account
            </Button>
          </div>
        </Card>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <Card className="flex flex-col gap-4">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Notification Preferences</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Choose which civic events you want to be notified about.
          </p>

          {[
            { key: 'issue_status', label: 'Issue status changes', desc: 'When an issue you reported changes status.' },
            { key: 'new_issue', label: 'New issues in my city', desc: 'When a new issue is filed in your registered city.' },
            { key: 'comments', label: 'Comments on my issues', desc: 'When someone comments on an issue you reported.' },
            { key: 'verifications', label: 'Verification requests', desc: 'When your issue needs community verification.' },
            { key: 'reshares', label: 'Reshares and mentions', desc: 'When someone reshares your post.' },
          ].map((pref) => (
            <div
              key={pref.key}
              className="flex justify-between align-center border-b pb-3"
              style={{ borderColor: 'var(--border)' }}
            >
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-heading)' }}>{pref.label}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                  {pref.desc}
                </div>
              </div>
              {/* Simple toggle switch */}
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}

          <Button style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>
            Save Preferences
          </Button>
        </Card>
      )}
    </div>
  );
};
export default SettingsPage;
