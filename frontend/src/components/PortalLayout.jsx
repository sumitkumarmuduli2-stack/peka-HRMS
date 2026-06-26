import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FiLogOut,
  FiUser,
  FiGrid,
  FiClock,
  FiCalendar,
  FiCheckSquare,
  FiMenu,
  FiX,
  FiBell,
  FiSearch,
  FiUsers,
  FiLayers,
  FiBriefcase,
  FiSettings,
  FiActivity,
  FiInfo,
  FiCheck
} from 'react-icons/fi';

const getNotificationIcon = (title = '') => {
  const normalized = title.toLowerCase();
  if (normalized.includes('leave')) return <FiCalendar />;
  if (normalized.includes('task')) return <FiCheckSquare />;
  return <FiInfo />;
};

const formatNotificationTime = (dateValue) => {
  const createdAt = new Date(dateValue);
  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const mapNotification = (notification) => ({
  id: notification._id,
  icon: getNotificationIcon(notification.title),
  text: notification.message,
  time: formatNotificationTime(notification.createdAt),
  read: notification.isRead,
});

const PortalLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications((res.data.data || []).map(mapNotification));
      } catch (error) {
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await api.put('/notifications/read-all');
    } catch (error) {
      // Keep the local optimistic read state; the next refresh will reconcile.
    }
  };

  const markNotificationRead = async (id) => {
    setNotifications(prev => prev.map(x => x.id === id ? { ...x, read: true } : x));
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      // Keep the dropdown responsive even if the request fails.
    }
  };

  if (!user) return null;

  // Select sidebar items by role
  const getSidebarItems = () => {
    switch (user.role) {
      case 'Super Admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: <FiGrid /> },
          { name: 'HR Management', path: '/admin/hrs', icon: <FiUsers /> },
          { name: 'Audit Logs', path: '/admin/logs', icon: <FiActivity /> },
          { name: 'System Settings', path: '/admin/settings', icon: <FiSettings /> },
        ];
      case 'HR':
        return [
          { name: 'Dashboard', path: '/hr', icon: <FiGrid /> },
          { name: 'Employee Directory', path: '/hr/employees', icon: <FiUsers /> },
          { name: 'Leave Approvals', path: '/hr/leaves', icon: <FiCalendar /> },
          { name: 'Recruitment Hub', path: '/hr/recruitment', icon: <FiBriefcase /> },
          { name: 'Departments', path: '/hr/departments', icon: <FiLayers /> },
          { name: 'Assigned Tasks', path: '/hr/tasks', icon: <FiCheckSquare /> },
        ];
      case 'Employee':
      default:
        return [
          { name: 'Dashboard', path: '/employee', icon: <FiGrid /> },
          { name: 'Clock in/out', path: '/employee/clock', icon: <FiClock /> },
          { name: 'Leave Applications', path: '/employee/leaves', icon: <FiCalendar /> },
          { name: 'My Tasks', path: '/employee/tasks', icon: <FiCheckSquare /> },
          { name: 'My Profile', path: '/employee/profile', icon: <FiUser /> },
        ];
    }
  };

  const menuItems = getSidebarItems();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const match = menuItems.find((item) => item.name.toLowerCase().includes(query));
    if (match) {
      navigate(match.path);
      setSearchQuery('');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background-color)' }}>
      
      {/* Dark Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)',
        backgroundColor: '#111827',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        borderRight: '1px solid #1f2937',
        transition: 'transform 0.3s ease',
        transform: 'translateX(0)'
      }} className="sidebar-desktop">
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', padding: '0 8px' }}>
            <div style={{
              background: 'var(--gradient-primary)',
              color: 'white',
              fontWeight: 'bold',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'var(--font-family-display)'
            }}>PEKA</div>
            <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#ffffff', fontFamily: 'var(--font-family-display)' }}>HRMS</span>
          </div>

          {/* Nav list */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {menuItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--border-radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: isActive ? '#ffffff' : '#9ca3af',
                    backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--border-radius-sm)',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: '#ef4444',
            transition: 'background 0.2s'
          }}
          onClick={logout}
          >
            <FiLogOut />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          backgroundColor: '#111827',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#ffffff' }}>PEKA HRMS</span>
            <FiX color="white" size={24} onClick={() => setMobileMenuOpen(false)} />
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {menuItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            ))}
            <div
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: '10px',
                color: '#ef4444',
                fontSize: '1.1rem',
              }}
            >
              <FiLogOut />
              <span>Logout</span>
            </div>
          </nav>
        </div>
      )}

      {/* Main Panel Content Area */}
      <div style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      }} className="main-content-area">
        
        {/* Top Header */}
        <header style={{
          height: '70px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 30px',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          {/* Left: Mobile hamburger & Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <FiMenu
              size={24}
              style={{ cursor: 'pointer', display: 'none' }}
              className="hamburger"
              onClick={() => setMobileMenuOpen(true)}
            />
            
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Global Search..."
                style={{
                  padding: '8px 12px 8px 36px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  width: '240px',
                  backgroundColor: 'var(--background-color)'
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right: Notifications & User profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Notifications Bell + Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setNotifOpen(o => !o)}
                style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
              >
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="notif-dot" style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: 'var(--danger-color)',
                    color: 'white',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="modal-backdrop" style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 800
                }} onClick={() => setNotifOpen(false)} />
              )}
              {notifOpen && (
                <div className="modal-card" style={{
                  position: 'absolute',
                  top: '38px',
                  right: 0,
                  width: '340px',
                  backgroundColor: '#fff',
                  borderRadius: 'var(--border-radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-color)',
                  zIndex: 900,
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0 }}>Notifications</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiCheck size={12} /> Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No notifications yet
                    </div>
                  )}
                  {notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '14px 20px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      backgroundColor: n.read ? 'transparent' : 'rgba(37,20,90,0.03)',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }} onClick={() => markNotificationRead(n.id)}>
                      <div style={{ color: 'var(--primary-color)', marginTop: '2px', flexShrink: 0 }}>{n.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{n.text}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{n.time}</div>
                      </div>
                      {!n.read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', flexShrink: 0, marginTop: '6px' }} />}
                    </div>
                  ))}
                  <div style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>End of notifications</span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile widget */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{user.role}</div>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content view */}
        <main className="page-enter" style={{ padding: '30px', flex: 1, minHeight: 'calc(100vh - 70px)' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop {
            transform: translateX(-100%);
            display: none !important;
          }
          .main-content-area {
            margin-left: 0 !important;
          }
          .hamburger {
            display: block !important;
          }
        }
      `}</style>

    </div>
  );
};

export default PortalLayout;
