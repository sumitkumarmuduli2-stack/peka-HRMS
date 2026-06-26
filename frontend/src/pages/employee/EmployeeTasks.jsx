import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiCheckSquare, FiAlertCircle } from 'react-icons/fi';

const EmployeeTasks = () => {
  const { showToast } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employee/tasks');
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
      showToast('Could not fetch task logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/employee/tasks/${taskId}`, { status: newStatus });
      showToast(`Task marked as ${newStatus}`, 'success');
      fetchTasks();
    } catch (err) {
      showToast('Failed to update task status', 'error');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  if (loading) {
    return <div className="skeleton" style={{ height: '300px' }}></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>My Tasks</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Review duties assigned to you by the HR department.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Grid */}
      <div className="card">
        <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCheckSquare /> Action Items
        </h4>

        {filteredTasks.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  backgroundColor: task.status === 'Completed' ? 'rgba(16, 185, 129, 0.02)' : 'white'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h5 style={{ fontSize: '1.05rem' }}>{task.title}</h5>
                    <span className={`badge badge-${
                      task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'info' : 'warning'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {task.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  
                  {/* Status Selection */}
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      outline: 'none'
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <FiAlertCircle size={36} />
            <div>No duties found matching the filter.</div>
          </div>
        )}
      </div>

    </div>
  );
};

export default EmployeeTasks;
