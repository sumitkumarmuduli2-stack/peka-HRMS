import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiUsers, FiCalendar, FiBriefcase, FiInbox } from 'react-icons/fi';

const HRDashboard = () => {
  const { showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#25145a', '#321b72', '#3a2280', '#10b981', '#ef4444'];

  const fetchHRStats = async () => {
    try {
      setLoading(true);
      const [statsRes, leavesRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/hr/leaves')
      ]);
      setStats(statsRes.data.data);
      // Filter pending leaves
      const pending = leavesRes.data.data.filter((l) => l.status === 'Pending').slice(0, 5);
      setLeaves(pending);
    } catch (err) {
      console.error(err);
      showToast('Could not load HR metrics dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRStats();
  }, []);

  const handleLeaveDecision = async (leaveId, decision) => {
    try {
      await api.put(`/hr/leaves/${leaveId}`, { status: decision, hrComments: `Processed by HR Dashboard` });
      showToast(`Leave application ${decision.toLowerCase()} successfully`, 'success');
      fetchHRStats();
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: '400px' }}></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>HR Management Console</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Track organizational counts, process leave requests, and monitor candidate pipelines.</p>
      </div>

      {/* Numerical Stats Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        
        {/* Headcount */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'rgba(37, 20, 90, 0.08)', color: 'var(--primary-color)' }}>
            <FiUsers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats?.employeeCount ?? 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Employees</div>
          </div>
        </div>

        {/* Pending leaves count */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'rgba(245, 158, 11, 0.08)', color: 'var(--warning-color)' }}>
            <FiCalendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats?.pendingLeaves ?? 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Leaves</div>
          </div>
        </div>

        {/* Jobs open count */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--success-color)' }}>
            <FiBriefcase size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats?.openJobs ?? 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Vacancies</div>
          </div>
        </div>

        {/* Candidate Applications */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--info-color)' }}>
            <FiInbox size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats?.totalApplications ?? 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Job Applicants</div>
          </div>
        </div>

      </div>

      {/* Graphical Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        
        {/* Headcount by Department */}
        <div className="card">
          <h4 style={{ marginBottom: '20px' }}>Department Headcount Telemetry</h4>
          <div style={{ width: '100%', height: '240px' }}>
            {stats?.deptStats?.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={stats.deptStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary-color)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-muted)' }}>No department logs found.</div>
            )}
          </div>
        </div>

        {/* Applicant Status stages pie */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ marginBottom: '20px' }}>Recruitment Applications Ratio</h4>
          <div style={{ width: '100%', height: '200px', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {stats?.recruitmentStats?.some(s => s.value > 0) ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.recruitmentStats}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.recruitmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textMuted: 'center', color: 'var(--text-muted)' }}>No candidate records submitted.</div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.75rem' }}>
            {stats?.recruitmentStats?.map((entry, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Pending Leave Approvals Action list */}
      <div className="card">
        <h4 style={{ marginBottom: '20px' }}>Urgent Leave Action Board</h4>
        {leaves.length > 0 ? (
          <div className="table-container">
            <table className="peka-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td style={{ fontWeight: 600 }}>{leave.employee?.name}</td>
                    <td>{leave.leaveType}</td>
                    <td>
                      {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{leave.reason}</td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleLeaveDecision(leave._id, 'Approved')}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleLeaveDecision(leave._id, 'Rejected')}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            All leave applications have been processed.
          </div>
        )}
      </div>

    </div>
  );
};

export default HRDashboard;
