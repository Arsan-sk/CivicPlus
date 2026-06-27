import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Warning,
  Users,
  CheckCircle,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  Robot,
  ChartLineUp,
} from '@phosphor-icons/react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleStart = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="container flex flex-col gap-16 py-12" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* 1. Hero Section */}
      <section className="grid grid-cols-2 gap-8 align-center py-8">
        <div className="flex flex-col gap-6" style={{ textAlign: 'left' }}>
          <div
            className="badge badge-primary"
            style={{
              padding: '6px 12px',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            Empowering Hyperlocal Governance
          </div>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              lineHeight: 1.15,
              fontWeight: 800,
            }}
          >
            Turn Community Problems Into{' '}
            <span style={{ color: 'var(--primary)' }}>Collective Action</span>
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--text-muted)',
              maxWidth: '34rem',
            }}
          >
            Report local issues, rally community support, and track resolutions transparently.
            Bridge the gap between citizens and authorities using AI and social verification.
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <Button size="lg" onClick={() => navigate('/create')} className="flex align-center gap-2">
              Raise an Issue
              <ArrowRight size={18} />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/search')}>
              Explore Cities
            </Button>
            {!user && (
              <Button size="lg" variant="ghost" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            )}
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div
          className="glass flex flex-col gap-4 p-6"
          style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            maxHeight: '400px',
            overflow: 'hidden',
          }}
        >
          {/* Mock Dashboard Header */}
          <div className="flex justify-between align-center border-b pb-4">
            <div className="flex align-center gap-2">
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--danger)',
                }}
              />
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-heading)' }}>
                Live Issues Feed (Mumbai)
              </strong>
            </div>
            <Badge variant="primary">5 Active Alerts</Badge>
          </div>

          {/* Mock Feed Cards */}
          <div className="flex flex-col gap-3" style={{ opacity: 0.9 }}>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-offset)',
              }}
            >
              <Warning size={32} color="var(--danger)" weight="fill" />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                  Dangerous Pothole on Carter Road
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Confirmed by 42 citizens · Awaiting CM response
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-offset)',
              }}
            >
              <CheckCircle size={32} color="var(--success)" weight="fill" />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                  Garbage Dump Cleaned - Ward 12
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Resolution verified by community (Closed)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Impact Statistics */}
      <section style={{ backgroundColor: 'var(--bg-card)', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-4 gap-8" style={{ textAlign: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', fontWeight: 800 }}>98%</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
              Resolution Rate (Bengaluru)
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--success)', fontWeight: 800 }}>12,450+</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
              Issues Solved Nationwide
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--warning)', fontWeight: 800 }}>5 Cities</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
              Participating MVP Centers
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--text-heading)', fontWeight: 800 }}>45,000+</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
              Active Civic Members
            </p>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="flex flex-col gap-8">
        <div style={{ textAlign: 'center' }}>
          <h2>How CivicPulse Solves Issues</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '32rem', margin: '0.5rem auto 0' }}>
            A four-step collaborative flow designed to verify problems and track real outcomes.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <Card className="flex flex-col gap-3" style={{ textAlign: 'left' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Megaphone size={20} color="var(--primary)" weight="fill" />
            </div>
            <h4>1. Raise Issue</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Take a photo, select the category, and drop a location pin. AI auto-detects severity.
            </p>
          </Card>

          <Card className="flex flex-col gap-3" style={{ textAlign: 'left' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--warning-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} color="var(--warning)" weight="fill" />
            </div>
            <h4>2. Community Verify</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Locals confirm the problem exists. Reaching 10 confirmations verifies it publicly.
            </p>
          </Card>

          <Card className="flex flex-col gap-3" style={{ textAlign: 'left' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--danger-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} color="var(--danger)" weight="fill" />
            </div>
            <h4>3. Route to Authority</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              The assigned department claims the task, posts progress milestones and uploads evidence.
            </p>
          </Card>

          <Card className="flex flex-col gap-3" style={{ textAlign: 'left' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle size={20} color="var(--success)" weight="fill" />
            </div>
            <h4>4. Close and Score</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              The community verifies the completed work. Verified resolutions close the loop.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. Features Showcase */}
      <section className="grid grid-cols-2 gap-8 align-center">
        <div className="flex flex-col gap-4" style={{ textAlign: 'left' }}>
          <h2>Core Intelligent Automation</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            CivicPulse bridges advanced technology and community participation to eliminate duplicate reporting and optimize civic routing.
          </p>

          <div className="flex flex-col gap-4 mt-2">
            <div className="flex gap-3 align-start">
              <Robot size={24} color="var(--primary)" />
              <div>
                <strong>AI-Powered Categorization</strong>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Vision models automatically analyze uploaded photos to identify infrastructure damage, water leaks, or garbage issues.
                </p>
              </div>
            </div>

            <div className="flex gap-3 align-start">
              <ChartLineUp size={24} color="var(--primary)" />
              <div>
                <strong>Duplicate Issue Interception</strong>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Coordinates lookup automatically scans nearby open issues to suggest supporting an existing report instead of creating a new duplicate.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Hackathon MVP Sandbox</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Explore preloaded cities (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad) and simulate workflows using demo citizen and authority accounts.
            </p>
            <Button variant="primary" size="lg" onClick={handleStart} style={{ width: '100%' }}>
              Get Started Now
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
