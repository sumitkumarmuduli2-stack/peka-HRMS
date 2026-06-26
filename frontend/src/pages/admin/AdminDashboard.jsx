import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiUsers, FiCpu, FiAlertTriangle, FiLayers, FiShield } from 'react-icons/fi';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
  const { showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
      showToast('Could not load Admin stats dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const chartData = stats ? [
    { name: 'Employees', count: stats.employeeCount },
    { name: 'HR Manager', count: stats.hrCount },
    { name: 'Suspended', count: stats.suspendedCount },
  ] : [];

  if (loading) {
    return <div className="skeleton" style={{ height: '350px' }}></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Super Admin Control Panel</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Monitor entire corporate tenant records, database entities, and system diagnostics.</p>
      </div>

      {/* Numeric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        
        {/* Total Users */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'rgba(58, 34, 128, 0.08)', color: 'var(--primary-color)' }}>
            <FiShield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats?.totalUsers ?? 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Accounts</div>
          </div>
        </div>

        {/* HR Managers count */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--info-color)' }}>
            <FiUsers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats?.hrCount ?? 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>HR Managers</div>
          </div>
        </div>

        {/* Suspended Accounts count */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger-color)' }}>
            <FiAlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats?.suspendedCount ?? 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Suspended Users</div>
          </div>
        </div>

        {/* Department counts */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--success-color)' }}>
            <FiLayers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats?.departmentCount ?? 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Departments</div>
          </div>
        </div>

      </div>

      {/* Grid: Health telemetry, charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* System telemetry chart */}
        <div className="card">
          <h4 style={{ marginBottom: '20px' }}>User Roles Allocation Ratio</h4>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary-color)" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
          <h4 style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCpu /> Diagnostics telemetry
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MERN Server Status</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                {stats?.health ? 'Active / Healthy' : 'Loading...'}
              </div>
            </div>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recorded System Uptime</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {stats?.uptime || '99.98%'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Node Environment</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                Development Mode
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
