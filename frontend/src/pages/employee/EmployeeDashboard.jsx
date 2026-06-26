import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiClock, FiCalendar, FiCheckSquare, FiAlertCircle } from 'react-icons/fi';

const EmployeeDashboard = () => {
  const { user, showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tasks, setTasks] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, todayRes, tasksRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/attendance/today'),
        api.get('/employee/tasks')
      ]);
      setStats(statsRes.data.data);
      setTodayAttendance(todayRes.data.data);
      setTasks(tasksRes.data.data.slice(0, 5)); // show top 5 tasks
    } catch (error) {
      console.error('Error fetching dashboard data', error);
      showToast('Could not fetch dashboard analytics. Ensure backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/attendance/clockin');
      setTodayAttendance(res.data.data);
      showToast('Clocked in successfully!', 'success');
      fetchDashboardData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Clock-in failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      const res = await api.put('/attendance/clockout');
      setTodayAttendance(res.data.data);
      showToast('Clocked out successfully!', 'success');
      fetchDashboardData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Clock-out failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ height: '40px', width: '200px' }} className="skeleton"></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ height: '120px' }} className="skeleton"></div>
          <div style={{ height: '120px' }} className="skeleton"></div>
          <div style={{ height: '120px' }} className="skeleton"></div>
        </div>
      </div>
    );
  }

  const workingHoursData = stats?.history?.workingHours?.length
    ? stats.history.workingHours
    : [{ name: 'No data', hours: 0 }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Welcome back, {user?.name}!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Here is your overview for today.</p>
      </div>

      {/* Clock widget & Quick Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* Attendance widget */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', minHeight: '160px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiClock /> Attendance Punch
            </h4>
            {todayAttendance && (
              <span className={`badge badge-${todayAttendance.status === 'Present' ? 'success' : 'warning'}`}>
                {todayAttendance.status}
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            {todayAttendance ? (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Clock In: <strong>{new Date(todayAttendance.clockIn).toLocaleTimeString()}</strong><br/>
                Clock Out: <strong>{todayAttendance.clockOut ? new Date(todayAttendance.clockOut).toLocaleTimeString() : 'Active Session'}</strong><br/>
                Hours Logged: <strong>{todayAttendance.workingHours} hrs</strong>
              </div>
            ) : (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                You have not clocked in today. Punch in below to start tracking.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleClockIn}
              disabled={actionLoading || !!todayAttendance}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Punch In
            </button>
            <button
              onClick={handleClockOut}
              disabled={actionLoading || !todayAttendance || !!todayAttendance.clockOut}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Punch Out
            </button>
          </div>
        </div>

        {/* Leave Balance summary card */}
        <div className="card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <FiCalendar /> Leave Balances
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
            <div style={{ background: '#f8fafc', padding: '12px 6px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {stats?.leaves?.balance?.sick ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Sick</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 6px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {stats?.leaves?.balance?.casual ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Casual</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 6px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {stats?.leaves?.balance?.annual ?? 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Annual</div>
            </div>
          </div>
        </div>

        {/* Task completion summary */}
        <div className="card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <FiCheckSquare /> Duties & Tasks
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {stats?.tasks?.pending ?? 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Tasks Assigned</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                {stats?.tasks?.completed ?? 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completed Tasks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics chart & tasks directory */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Weekly Productivity hours */}
        <div className="card">
          <h4 style={{ marginBottom: '20px' }}>Weekly Working Hours (Productivity)</h4>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer>
              <AreaChart data={workingHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="hours" stroke="var(--primary-color)" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ marginBottom: '20px' }}>Pending Deliverables</h4>
          {tasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              {tasks.map((task) => (
                <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{task.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge badge-${task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'info' : 'warning'}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '10px', color: 'var(--text-muted)', padding: '20px' }}>
              <FiAlertCircle size={30} />
              <div style={{ fontSize: '0.85rem' }}>No pending tasks assigned.</div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default EmployeeDashboard;
