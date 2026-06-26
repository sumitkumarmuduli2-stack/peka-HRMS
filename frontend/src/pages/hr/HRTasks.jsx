import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiCheckSquare, FiAlertCircle } from 'react-icons/fi';

const HRTasks = () => {
  const { showToast } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchTasksData = async () => {
    try {
      setLoading(true);
      const [tasksRes, empRes] = await Promise.all([
        api.get('/hr/tasks'),
        api.get('/hr/employees')
      ]);
      setTasks(tasksRes.data.data);
      setEmployees(empRes.data.data);
    } catch (err) {
      console.error(err);
      showToast('Could not fetch task records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!form.title || !form.assignedTo || !form.dueDate) {
      showToast('Please specify title, assignee, and due date', 'error');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/hr/tasks', form);
      showToast('Task assigned successfully!', 'success');
      setForm({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
      });
      fetchTasksData();
    } catch (err) {
      showToast('Assignment failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: '350px' }}></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Task Assignments</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Delegate duties to employees and monitor progress milestones.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Form: Assign Task */}
        <div className="card">
          <h4 style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCheckSquare /> Delegate Task
          </h4>
          <form onSubmit={handleAssign}>
            <div className="input-group">
              <label>Task Title</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. Update Client Portal"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            
            <div className="input-group">
              <label>Assigned Employee</label>
              <select
                required
                className="input-field"
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              >
                <option value="">Choose Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.user?._id}>
                    {emp.user?.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Due Date</label>
              <input
                type="date"
                required
                className="input-field"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Task Description</label>
              <textarea
                className="input-field"
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="Enter assignment notes..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button type="submit" disabled={submitLoading} className="btn btn-primary" style={{ width: '100%' }}>
              {submitLoading ? 'Delegating...' : 'Assign Duty'}
            </button>
          </form>
        </div>

        {/* Right Table: Assigned Tasks */}
        <div className="card">
          <h4 style={{ marginBottom: '20px' }}>Delegated Tasks Records</h4>
          {tasks.length > 0 ? (
            <div className="table-container">
              <table className="peka-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Assigned To</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Assigned By</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td style={{ fontWeight: 600 }}>{task.title}</td>
                      <td>{task.assignedTo?.name || 'Unassigned'}</td>
                      <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${
                          task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'info' : 'warning'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {task.assignedBy?.name || 'System'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <FiAlertCircle size={30} />
              <div>No delegated task records discovered.</div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default HRTasks;
