import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';

const AdminHRManagement = () => {
  const { showToast } = useAuth();
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal triggers
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);

  // Form parameters
  const [form, setForm] = useState({ name: '', email: '', password: '', status: 'Active' });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchHRs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/hrs');
      setHrs(res.data.data);
    } catch (err) {
      console.error(err);
      showToast('Could not load HR listing logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRs();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setForm({ name: '', email: '', password: '', status: 'Active' });
    setShowModal(true);
  };

  const openEditModal = (hr) => {
    setModalMode('edit');
    setEditingId(hr._id);
    setForm({ name: hr.name, email: hr.email, password: '', status: hr.status || 'Active' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalMode === 'create' && (!form.name || !form.email || !form.password)) {
      showToast('Please specify name, email, and password', 'error');
      return;
    }

    setSubmitLoading(true);
    try {
      if (modalMode === 'create') {
        await api.post('/admin/hrs', form);
        showToast('HR account registered successfully!', 'success');
      } else {
        await api.put(`/admin/hrs/${editingId}`, form);
        showToast('HR account details updated successfully', 'success');
      }
      setShowModal(false);
      fetchHRs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (hrId) => {
    if (!window.confirm('Are you sure you want to delete this HR user account?')) return;
    try {
      await api.delete(`/admin/hrs/${hrId}`);
      showToast('HR account deleted successfully', 'success');
      fetchHRs();
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
      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>HR Account Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Create, update, and regulate HR Administrator accounts.</p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <FiPlus /> Add HR Manager
        </button>
      </div>

      {/* Grid listing Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {hrs.length > 0 ? (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="peka-table">
              <thead>
                <tr>
                  <th>HR Executive</th>
                  <th>Email Address</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hrs.map((hr) => (
                  <tr key={hr._id}>
                    <td style={{ fontWeight: 600 }}>{hr.name}</td>
                    <td>{hr.email}</td>
                    <td>{new Date(hr.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${hr.status === 'Active' ? 'success' : 'danger'}`}>
                        {hr.status}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => openEditModal(hr)} className="btn btn-text" style={{ padding: '4px', color: 'var(--primary-color)' }}>
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(hr._id)} className="btn btn-text" style={{ padding: '4px', color: 'var(--danger-color)' }}>
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No HR accounts configured in the tenant.
          </div>
        )}
      </div>

      {/* Dialog box Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(17, 24, 39, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
            <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-family-display)' }}>
              {modalMode === 'create' ? 'Add HR Manager' : 'Modify HR Credentials'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {modalMode === 'create' && (
                <div className="input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    className="input-field"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              )}

              {modalMode === 'edit' && (
                <div className="input-group">
                  <label>Status</label>
                  <select
                    className="input-field"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading} className="btn btn-primary">
                  {submitLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminHRManagement;
