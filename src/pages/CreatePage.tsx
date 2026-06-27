import React, { useState } from 'react';
import { CreateIssuePage } from './CreateIssuePage';
import { CreateDiscussionPage } from './CreateDiscussionPage';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ChatTeardropText, ShieldWarning } from '@phosphor-icons/react';

export const CreatePage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'issue' | 'discussion' | null>(null);

  if (selectedType === 'issue') {
    return <CreateIssuePage onBack={() => setSelectedType(null)} />;
  }

  if (selectedType === 'discussion') {
    return <CreateDiscussionPage onBack={() => setSelectedType(null)} />;
  }

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'left', padding: '1rem' }} className="flex flex-col gap-6">
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-heading)' }}>
          Create New Civic Post
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Select the type of report or message you want to publish in your local city board.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ marginTop: '1rem' }}>
        {/* CARD 1: REPORT CIVIC ISSUE */}
        <Card
          onClick={() => setSelectedType('issue')}
          className="card-interactive flex flex-col justify-between"
          style={{
            cursor: 'pointer',
            padding: '2rem',
            border: '2px solid var(--border)',
            transition: 'all 0.2s ease-in-out',
            height: '280px',
          }}
        >
          <div className="flex flex-col gap-3">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'hsla(var(--danger-hue), 85%, 50%, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldWarning size={28} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              Report a Civic Issue
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              File physical hazards like potholes, waste dumps, broken streetlights, or drainage leaks. AI resolves categorization and maps to local departments.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Badge variant="danger">AI Scan</Badge>
            <Badge variant="neutral">Auto Routing</Badge>
          </div>
        </Card>

        {/* CARD 2: CIVIC DISCUSSION */}
        <Card
          onClick={() => setSelectedType('discussion')}
          className="card-interactive flex flex-col justify-between"
          style={{
            cursor: 'pointer',
            padding: '2rem',
            border: '2px solid var(--border)',
            transition: 'all 0.2s ease-in-out',
            height: '280px',
          }}
        >
          <div className="flex flex-col gap-3">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'hsla(var(--primary-hue), 85%, 50%, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChatTeardropText size={28} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              Start a Discussion
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Share civic suggestions, public opinions, general complaints, community awareness updates, or local feedback posts.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Badge variant="primary">Community Feed</Badge>
            <Badge variant="neutral">General Post</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default CreatePage;
