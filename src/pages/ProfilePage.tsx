import React from 'react';
import { useParams } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>User Profile</h2>
      <p style={{ color: 'var(--text-muted)' }}>Viewing stats and activity for citizen @{username}</p>
    </div>
  );
};
export default ProfilePage;
