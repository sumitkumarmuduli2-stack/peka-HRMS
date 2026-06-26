import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiTrash2, FiLayers } from 'react-icons/fi';

const HRDepartments = () => {
  const { showToast } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/departments');
      setDepartments(res.data.data);
    } catch (err) {
      console.error(err);
      showToast('Could not fetch departments data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) {
      showToast('Please specify a department name', 'error');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/hr/departments', { name, description });
      showToast('Department created successfully!', 'success');
      setName('');
      setDescription('');
      fetchDepartments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create department', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department? Employees inside this unit will be set to unassigned.')) return;
    try {
      await api.delete(`/hr/departments/${deptId}`);
      showToast('Department deleted successfully', 'success');
      fetchDepartments();
    } catch (err) {
      showToast('Deletion failed', 'error');
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: '350px' }}></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Departments</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Organize business units and set management mappings.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left: Create Department Form */}
        <div className="card">
          <h4 style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiLayers /> Create Department
          </h4>
          <form onSubmit={handleCreate}>
            <div className="input-group">
              <label>Department Name</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. Finance, Tech Ops"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea
                className="input-field"
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="Enter details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button type="submit" disabled={submitLoading} className="btn btn-primary" style={{ width: '100%' }}>
              {submitLoading ? 'Creating...' : 'Create Department'}
            </button>
          </form>
        </div>

        {/* Right: Departments Table */}
        <div className="card">
          <h4 style={{ marginBottom: '20px' }}>Active Departments</h4>
          {departments.length > 0 ? (
            <div className="table-container">
              <table className="peka-table">
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Description</th>
                    <th>Manager Assigned</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept._id}>
                      <td style={{ fontWeight: 600 }}>{dept.name}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{dept.description || 'No description'}</td>
                      <td>{dept.manager?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                      <td>
                        <button onClick={() => handleDelete(dept._id)} className="btn btn-text" style={{ padding: '4px', color: 'var(--danger-color)' }}>
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No departments defined yet.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default HRDepartments;
