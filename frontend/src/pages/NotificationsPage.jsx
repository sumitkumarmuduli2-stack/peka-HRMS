import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiCheckCircle, FiCalendar, FiCheckSquare, FiInfo, FiBriefcase, FiAlertCircle, FiCheck } from 'react-icons/fi';

const getIcon = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('leave'))  return <FiCalendar style={{ color: 'var(--info-color)' }} />;
  if (t.includes('task'))   return <FiCheckSquare style={{ color: 'var(--primary-color)' }} />;
  if (t.includes('job') || t.includes('application')) return <FiBriefcase style={{ color: 'var(--success-color)' }} />;
  if (t.includes('warn') || t.includes('alert')) return <FiAlertCircle style={{ color: 'var(--warning-color)' }} />;
  return <FiInfo style={{ color: 'var(--text-muted)' }} />;
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const NotificationsPage = () => {
  const { showToast } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
      showToast('Could not load notifications', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      showToast('Failed to mark as read', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast('Failed', 'error');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ height: '40px', width: '220px' }} className="skeleton" />
      {[1,2,3,4,5].map(i => <div key={i} style={{ height: '72px' }} className="skeleton" />)}
    </div>
  );

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{
                marginLeft: '12px',
                background: 'var(--danger-color)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '999px',
                verticalAlign: 'middle',
              }}>
                {unreadCount} new
              </span>
            )}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Stay updated on your leave requests, tasks, and announcements.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="btn btn-secondary"
            style={{ gap: '8px' }}
          >
            <FiCheck /> {markingAll ? 'Marking...' : 'Mark All Read'}
          </button>
        )}
      </div>

      {/* Notification List */}
      {notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map(n => (
            <div
              key={n._id}
              style={{
                background: n.isRead ? 'var(--card-background)' : 'rgba(37,20,90,0.04)',
                border: `1px solid ${n.isRead ? 'var(--border-color)' : 'rgba(37,20,90,0.15)'}`,
                borderRadius: 'var(--border-radius-md)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                transition: 'all 0.2s',
                cursor: n.isRead ? 'default' : 'pointer',
                boxShadow: n.isRead ? 'none' : 'var(--shadow-sm)',
              }}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
            >
              {/* Icon */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--background-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
              }}>
                {getIcon(n.title)}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{n.title}</span>
                  {!n.isRead && (
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary-color)', display: 'inline-block', flexShrink: 0 }} />
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{n.message}</div>
              </div>

              {/* Time + Read status */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {timeAgo(n.createdAt)}
                </span>
                {n.isRead ? (
                  <FiCheckCircle size={14} style={{ color: 'var(--success-color)' }} />
                ) : (
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 600 }}>Click to read</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <FiBell size={46} />
            <p>You're all caught up!<br />No notifications at the moment.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
