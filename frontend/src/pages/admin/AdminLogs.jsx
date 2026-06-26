import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiActivity, FiSearch } from 'react-icons/fi';

const AdminLogs = () => {
  const { showToast } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data.data);
    } catch (err) {
      console.error(err);
      showToast('Could not fetch security activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const text = `${log.action} ${log.details} ${log.user?.name} ${log.user?.email}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  if (loading) {
    return <div className="skeleton" style={{ height: '350px' }}></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Security Audit Trail</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Track administrator logins, database updates, and privilege actions.</p>
      </div>

      {/* Filter HUD */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px' }}>
        <FiSearch color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Filter audit logs by action, employee, email..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '0.95rem'
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Audit table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredLogs.length > 0 ? (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="peka-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Description & Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={log._id || idx}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>
                      {log.user?.name || 'System User'} <br/>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                        {log.user?.role || 'Daemon'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {log.details || 'Processed operational triggers.'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <FiActivity size={36} />
            <div>No audit log events found matching criteria.</div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminLogs;
