import React from 'react';
import { useParams } from 'react-router-dom';

export const CityPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', textTransform: 'capitalize' }}>
        {slug} Municipality
      </h2>
      <p style={{ color: 'var(--text-muted)' }}>City stats, active departments, and local issues feed.</p>
    </div>
  );
};
export default CityPage;
