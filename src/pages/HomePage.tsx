import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Civic Action Feed</h2>
      <p style={{ color: 'var(--text-muted)' }}>Latest reports and community discussions in your city.</p>
    </div>
  );
};
export default HomePage;
