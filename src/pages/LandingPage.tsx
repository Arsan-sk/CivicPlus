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
  Buildings,
  ClockCountdown,
  GithubLogo,
  LinkedinLogo,
  Globe,
  InstagramLogo,
} from '@phosphor-icons/react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  React.useEffect(() => {
    if (user) {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  const handleStart = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/register');
    }
  };

  return (
    <>
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
        <div style={{ textAlign: 'center', paddingTop: 30 }}>
          <h2 >How CivicPlus Solves Issues</h2>
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
        <div className="flex flex-col gap-4" style={{ textAlign: 'left', paddingTop: 50 }}>
          <h2>Core Intelligent Automation</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            CivicPlus bridges advanced technology and community participation to eliminate duplicate reporting and optimize civic routing.
          </p>

          <div className="flex flex-col gap-4 mt-2">
            <div className="flex gap-3 align-start">
              <Robot size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>AI-Powered Issue Categorization</strong>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Gemini Vision AI analyzes your photo and description together — detecting damage type, estimating severity from low to critical, and auto-classifying into the right civic category in under 3 seconds.
                </p>
              </div>
            </div>

            <div className="flex gap-3 align-start">
              <ChartLineUp size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Duplicate Issue Interception</strong>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Before you submit, Google Maps proximity lookup scans open issues in your city's same category nearby. If a match exists, you're shown the existing ticket and offered to support it instead — keeping the board clean and priority scores accurate.
                </p>
              </div>
            </div>

            <div className="flex gap-3 align-start">
              <Users size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Community Verification Loop</strong>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Only citizens from the same city can verify an issue exists. Once 10 local verifications are reached, the issue is officially escalated — crowdsourced accountability that filters noise and amplifies real problems.
                </p>
              </div>
            </div>

            <div className="flex gap-3 align-start">
              <Buildings size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Jurisdiction-Scoped Authority Routing</strong>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Issues are automatically routed to the correct municipal department based on category. Authorities see only their city and department's queue — no cross-jurisdiction noise, no missed tickets.
                </p>
              </div>
            </div>

            <div className="flex gap-3 align-start">
              <ClockCountdown size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Public Resolution Timeline</strong>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Every status change — from submission to community verification to resolution — is logged publicly with timestamps and notes. No more black holes where reports disappear.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="glass" style={{ padding: '2rem', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '0.25rem', fontWeight: 800 }}>What's Coming Next</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              CivicPlus is just getting started. Here's what's on the roadmap.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { title: 'Native Mobile Apps', desc: 'Report issues on-the-go from iOS and Android' },
                { title: 'WhatsApp Integration', desc: 'Send a photo to a number, no app install needed' },
                { title: 'Issue Heatmaps', desc: 'Visual geo-clustering of problem hotspots across cities' },
                { title: 'Predictive Maintenance AI', desc: 'Forecast infrastructure failures before they happen' },
                { title: 'Authority Accountability Scores', desc: 'Public ratings based on resolution speed and volume' },
                { title: 'Geo-Fencing Alerts', desc: 'Get notified when a new issue appears within 1km of your location' }
              ].map((item, idx) => (
                <li key={idx} className="flex align-start gap-2" style={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1rem', lineHeight: 1 }}>•</span>
                  <span style={{ color: 'var(--text)' }}>
                    <strong>{item.title}</strong> — {item.desc}
                  </span>
                </li>
              ))}
            </ul>
            <Button variant="primary" size="lg" onClick={handleStart} style={{ width: '100%' }}>
              Get Started Now
            </Button>
          </Card>
        </div>
      </section>

      {/* 5. Hackathon MVP Sandbox Full-Width Section */}
      <Card
        style={{
          background: 'linear-gradient(135deg, var(--primary-light), var(--bg-card))',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          width: '100%',
          margin: 50
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 align-center">
          <div className="md:col-span-3 flex flex-col gap-3" style={{ textAlign: 'left' }}>
            <div
              className="badge badge-success"
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                alignSelf: 'start',
                backgroundColor: 'var(--success-light)',
                color: 'var(--success)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid hsla(var(--success-hue), 80%, 40%, 0.15)',
              }}
            >
              Vibe2Ship Hackathon — Community Hero Track
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Hackathon MVP Sandbox</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Explore 5 preloaded Indian cities — Mumbai, Delhi, Bengaluru, Chennai, Hyderabad — with demo issues, citizen accounts, and authority workflows. The full civic pipeline is live and testable right now.
            </p>
          </div>
          
          <div className="md:col-span-2 flex justify-around gap-4 align-center">
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '1.75rem', color: 'var(--primary)', fontWeight: 800 }}>5</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Cities Preloaded</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '1.75rem', color: 'var(--warning)', fontWeight: 800 }}>20+</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Demo Issues</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '1.75rem', color: 'var(--success)', fontWeight: 800 }}>Full</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Role Pipeline Live</p>
            </div>
          </div>
        </div>
      </Card>
    </div>

    {/* 6. Landing Page Footer */}
    <footer
      style={{
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        padding: '2.5rem 4rem',
        width: '100%',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          alignItems: 'start',
          gap: '2rem',
        }}
      >
        {/* Col 1 — Brand (left aligned) */}
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <strong style={{ fontSize: '1.1rem', color: 'var(--text-heading)', fontWeight: 800 }}>CivicPlus</strong>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            AI-Powered Hyperlocal Civic Action Platform
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
            Vibe2Ship Hackathon 2026 — Community Hero Track
          </p>
        </div>

        {/* Col 2 — Built With (center, left-aligned text) */}
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <strong
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
              fontWeight: 700,
            }}
          >
            Built With
          </strong>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
            }}
          >
            <span>React + TypeScript</span>
            <span>Supabase</span>
            <span>Gemini 1.5 Flash Vision</span>
            <span>Google Maps API</span>
            <span>Firebase Hosting</span>
          </div>
        </div>

        {/* Col 3 — Builder (right aligned) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
          <strong
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
              fontWeight: 700,
            }}
          >
            Builder
          </strong>
          
          {/* Social Icons Row */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <a
              href="https://github.com/Arsan-sk/CivicPlus"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <GithubLogo size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/arsan-sk/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <LinkedinLogo size={20} />
            </a>
            <a
              href="https://www.instagram.com/tachyon_36/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <InstagramLogo size={20} />
            </a>
            <a
              href="https://arsansk.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Globe size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1.25rem',
          marginTop: '1.5rem',
          width: '100%',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        © 2026 CivicPlus. Built by{' '}
        <a
          href="https://arsansk.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--primary)',
            textDecoration: 'underline',
            fontWeight: 600,
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-heading)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--primary)')}
        >
          Shaikh Mohd Arsan
        </a>
        . All rights reserved.
      </div>
    </footer>
  </>
  );
};
export default LandingPage;
