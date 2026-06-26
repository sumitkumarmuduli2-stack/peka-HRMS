import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiActivity, FiCheckCircle, FiClock, FiLogIn, FiLogOut } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EmployeeAttendance = () => {
  const { showToast } = useAuth();
  const [history, setHistory] = useState([]);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const [historyRes, todayRes] = await Promise.all([
        api.get('/attendance/history'),
        api.get('/attendance/today'),
      ]);
      setHistory(historyRes.data.data);
      setTodayStatus(todayRes.data.data);
    } catch (err) {
      console.error(err);
      showToast('Could not load timesheet data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleClockIn = async () => {
    setPunchLoading(true);
    try {
      const res = await api.post('/attendance/clockin');
      setTodayStatus(res.data.data);
      showToast('Punch in registered! Have a productive day 🎯', 'success');
      fetchAttendance();
    } catch (error) {
      showToast(error.response?.data?.message || 'Punch in failed', 'error');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleClockOut = async () => {
    setPunchLoading(true);
    try {
      const res = await api.put('/attendance/clockout');
      setTodayStatus(res.data.data);
      showToast('Punch out recorded! Great work today 👍', 'success');
      fetchAttendance();
    } catch (error) {
      showToast(error.response?.data?.message || 'Punch out failed', 'error');
    } finally {
      setPunchLoading(false);
    }
  };

  // Build chart data from last 7 attendance records
  const chartData = [...history]
    .slice(0, 7)
    .reverse()
    .map((r) => ({
      day: new Date(r.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric' }),
      hours: r.workingHours || 0,
    }));

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const isClockInDisabled  = punchLoading || !!todayStatus;
  const isClockOutDisabled = punchLoading || !todayStatus || !!todayStatus?.clockOut;

  if (loading) {
    return (
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ height: '40px', width: '260px' }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          <div style={{ height: '420px' }} className="skeleton" />
          <div style={{ height: '420px' }} className="skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

      {/* ── Page Title ─────────────────────────────────────────── */}
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Attendance &amp; Timesheet</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Punch your hours and review your daily work records.
        </p>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'flex-start' }} className="grid-1-5-1">

        {/* Left: Live Clock + Punch Card */}
        <div className="card" style={{ textAlign: 'center', padding: '36px 24px' }}>

          {/* Live Digital Clock */}
          <div style={{ marginBottom: '28px' }}>
            <div
              className="live-clock pulse-ring"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(37,20,90,0.05), rgba(58,34,128,0.08))',
                border: '3px solid rgba(37,20,90,0.12)',
                flexDirection: 'column',
                margin: '0 auto 16px',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '1.7rem',
                fontWeight: 800,
                color: 'var(--primary-color)',
                letterSpacing: '-0.5px',
                lineHeight: 1.1
              }}>
                {formatTime(currentTime).split(':').slice(0, 2).join(':')}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>
                {formatTime(currentTime).split(' ')[1]}
              </span>
            </div>
            <div className="live-clock-date">{formatDate(currentTime)}</div>
          </div>

          {/* Today's Session Info */}
          <div style={{
            background: 'var(--background-color)',
            borderRadius: 'var(--border-radius-md)',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left',
          }}>
            {todayStatus ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status</span>
                  <span className={`badge badge-${todayStatus.status === 'Present' ? 'success' : todayStatus.status === 'Late' ? 'warning' : 'info'}`}>
                    {todayStatus.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiLogIn size={13} /> Punch In
                  </span>
                  <strong>{new Date(todayStatus.clockIn).toLocaleTimeString()}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiLogOut size={13} /> Punch Out
                  </span>
                  <strong>{todayStatus.clockOut ? new Date(todayStatus.clockOut).toLocaleTimeString() : 'Active'}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiClock size={13} /> Duration
                  </span>
                  <strong>{todayStatus.workingHours > 0 ? `${todayStatus.workingHours} hrs` : 'Ongoing…'}</strong>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '10px 0', fontSize: '0.88rem', lineHeight: 1.7 }}>
                No active shift today.<br />
                Punch in to start tracking.
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleClockIn}
              disabled={isClockInDisabled}
              className="btn btn-primary"
              style={{
                padding: '14px',
                opacity: isClockInDisabled ? 0.5 : 1,
                cursor: isClockInDisabled ? 'not-allowed' : 'pointer',
                gap: '8px'
              }}
            >
              <FiLogIn size={16} />
              {punchLoading ? 'Processing…' : 'Clock In'}
            </button>
            <button
              onClick={handleClockOut}
              disabled={isClockOutDisabled}
              className="btn btn-secondary"
              style={{
                padding: '14px',
                opacity: isClockOutDisabled ? 0.45 : 1,
                cursor: isClockOutDisabled ? 'not-allowed' : 'pointer',
                gap: '8px'
              }}
            >
              <FiLogOut size={16} />
              {punchLoading ? 'Processing…' : 'Clock Out'}
            </button>
          </div>

          {/* Completion status */}
          {todayStatus?.clockOut && (
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--success-color)', fontSize: '0.85rem', fontWeight: 600 }}>
              <FiCheckCircle size={16} />
              Shift completed for today
            </div>
          )}
        </div>

        {/* Right: Chart + History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Weekly Hours chart */}
          {chartData.length > 0 && (
            <div className="card">
              <h4 style={{ marginBottom: '20px' }}>Weekly Working Hours</h4>
              <div style={{ width: '100%', height: '180px' }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} unit="h" />
                    <Tooltip formatter={(v) => [`${v} hrs`, 'Hours']} />
                    <Area type="monotone" dataKey="hours" stroke="var(--primary-color)" strokeWidth={2.5} fillOpacity={1} fill="url(#attendGrad)" dot={{ r: 4, fill: 'var(--primary-color)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Timesheet History Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiActivity style={{ color: 'var(--primary-color)' }} />
              <h4>Timesheet History</h4>
            </div>

            {history.length > 0 ? (
              <div className="table-container" style={{ border: 'none', borderRadius: 0, marginTop: '16px' }}>
                <table className="peka-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Punch In</th>
                      <th>Punch Out</th>
                      <th>Status</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record) => (
                      <tr key={record._id}>
                        <td style={{ fontWeight: 500 }}>{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                        <td>{new Date(record.clockIn).toLocaleTimeString()}</td>
                        <td>{record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : <span style={{ color: 'var(--text-muted)' }}>N/A</span>}</td>
                        <td>
                          <span className={`badge badge-${
                            record.status === 'Present' ? 'success' :
                            record.status === 'Late' ? 'warning' :
                            record.status === 'Half-Day' ? 'info' : 'danger'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{record.workingHours > 0 ? `${record.workingHours} hrs` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <FiClock size={40} />
                <p>No punch cards registered yet.<br />Clock in to start building your timesheet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
