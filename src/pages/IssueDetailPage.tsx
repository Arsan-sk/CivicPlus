import React from 'react';
import { useParams } from 'react-router-dom';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Issue Details</h2>
      <p style={{ color: 'var(--text-muted)' }}>Viewing timeline and updates for issue ID: {id}</p>
    </div>
  );
};
export default IssueDetailPage;
