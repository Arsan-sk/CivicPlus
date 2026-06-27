import React from 'react';

export const SearchPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Search</h2>
      <p style={{ color: 'var(--text-muted)' }}>Search reported issues, cities, states, authorities, or citizens.</p>
    </div>
  );
};
export default SearchPage;
