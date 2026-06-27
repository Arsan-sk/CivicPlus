import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trophy, ChartLineUp, ClipboardText } from '@phosphor-icons/react';

interface CityRanking {
  city_id: string;
  city_name: string;
  state_name: string;
  total_issues: number;
  resolved_issues: number;
  avg_resolution_hours: number;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<CityRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const { data, error } = await supabase
          .from('city_statistics')
          .select('city_id, city_name, state_name, total_issues, resolved_issues, avg_resolution_hours')
          .order('resolved_issues', { ascending: false });

        if (!error && data) {
          setRankings(data as CityRanking[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  return (
    <div className="flex flex-col gap-6" style={{ textAlign: 'left' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem' }}>Civic Rankings & Analytics</h2>
        <p style={{ color: 'var(--text-muted)' }}>Comparative city scores, resolution stats, and authority performance leaderboards.</p>
      </div>

      {/* Overview Analytics widgets */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="flex align-center gap-3">
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary-light)', borderRadius: '50%' }}>
            <ChartLineUp size={24} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>92.4%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Civic Safety Rating</div>
          </div>
        </Card>
        <Card className="flex align-center gap-3">
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--success-light)', borderRadius: '50%' }}>
            <Trophy size={24} color="var(--success)" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>28 Hours</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fastest Avg Resolution</div>
          </div>
        </Card>
        <Card className="flex align-center gap-3">
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-offset)', borderRadius: '50%' }}>
            <ClipboardText size={24} color="var(--text-muted)" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>5 active</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Municipal Sandbox Hubs</div>
          </div>
        </Card>
      </div>

      {/* comparative board list */}
      <div>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', fontWeight: 700 }}>National City Performance Rankings</h3>
        
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-offset)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Rank</th>
                <th style={{ padding: '1rem' }}>City</th>
                <th style={{ padding: '1rem' }}>State</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Total Issues</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Resolved</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Avg Fix Time</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading rankings dataset...
                  </td>
                </tr>
              ) : rankings.length > 0 ? (
                rankings.map((row, idx) => (
                  <tr key={row.city_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>#{idx + 1}</td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-heading)' }}>{row.city_name}</td>
                    <td style={{ padding: '1rem' }}>{row.state_name}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{row.total_issues}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>
                      {row.resolved_issues}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {row.avg_resolution_hours ? `${row.avg_resolution_hours}h` : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/city/${row.city_name.toLowerCase()}`)}
                      >
                        Explore Page
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No statistics logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};
export default DashboardPage;
