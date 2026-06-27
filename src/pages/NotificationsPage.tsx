import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast } from 'react-hot-toast';
import {
  Bell,
  CheckCircle,
  Warning,
  Chat,
  ThumbsUp,
  Circle,
  Checks,
} from '@phosphor-icons/react';

interface NotificationItem {
  id: string;
  type: 'new_issue_in_city' | 'issue_status_updated' | 'authority_update_posted' | 'issue_confirmed' | 'issue_resolved' | 'comment_received' | 'reshare_received' | 'verification_request';
  title: string;
  message: string;
  issue_id?: string;
  discussion_id?: string;
  is_read: boolean;
  created_at: string;
  actor?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const NotificationsPage: React.FC = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id, type, title, message, issue_id, discussion_id, is_read, created_at,
          actor:profiles!actor_id(full_name, avatar_url)
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data as any[] || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [profile]);

  const markAsRead = async (id: string, index: number) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications((prev) => {
        const copy = [...prev];
        copy[index].is_read = true;
        return copy;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update notifications.');
    }
  };

  const handleNotificationClick = async (notif: NotificationItem, index: number) => {
    if (!notif.is_read) {
      await markAsRead(notif.id, index);
    }

    if (notif.issue_id) {
      navigate(`/issues/${notif.issue_id}`);
    } else if (notif.discussion_id) {
      navigate(`/home`); // Discussions are listed on home page
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_issue_in_city':
      case 'verification_request':
        return <Warning size={20} color="var(--warning)" />;
      case 'issue_status_updated':
      case 'issue_resolved':
        return <CheckCircle size={20} color="var(--success)" />;
      case 'comment_received':
        return <Chat size={20} color="var(--primary)" />;
      case 'issue_confirmed':
      case 'reshare_received':
        return <ThumbsUp size={20} color="var(--primary)" />;
      default:
        return <Bell size={20} color="var(--text-muted)" />;
    }
  };

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex flex-col gap-6" style={{ textAlign: 'left', maxWidth: '650px', margin: '0 auto' }}>
      <div className="flex justify-between align-center">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Notifications</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Stay updated with local activity and municipal announcements.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead} className="flex align-center gap-1">
            <Checks size={16} />
            <span>Mark all read</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          [1, 2, 3].map((n) => (
            <Card key={n} className="skeleton" style={{ width: '100%', height: '80px' }} />
          ))
        ) : notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <Card
              key={notif.id}
              className="card-interactive flex align-start gap-4"
              style={{
                cursor: 'pointer',
                borderLeft: notif.is_read ? '1px solid var(--border)' : '4px solid var(--primary)',
                backgroundColor: notif.is_read ? 'var(--bg-card)' : 'var(--bg-offset)',
                padding: '1rem',
              }}
              onClick={() => handleNotificationClick(notif, index)}
            >
              <div style={{ marginTop: '2px' }}>{getIcon(notif.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between align-center">
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--text-heading)' }}>
                    {notif.title}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatTime(notif.created_at)}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text)', marginTop: '0.25rem' }}>
                  {notif.message}
                </p>
                {notif.actor && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                    By {notif.actor.full_name}
                  </div>
                )}
              </div>
              {!notif.is_read && (
                <Circle size={10} color="var(--primary)" weight="fill" style={{ alignSelf: 'center' }} />
              )}
            </Card>
          ))
        ) : (
          <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <Bell size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
            <h3>All Caught Up</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              You don't have any notifications at the moment.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;
