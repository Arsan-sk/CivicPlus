import React from 'react';

export const IssuesPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Civic Issues</h2>
      <p style={{ color: 'var(--text-muted)' }}>Browse all reported problems and verify their status.</p>
    </div>
  );
};
export default IssuesPage;
