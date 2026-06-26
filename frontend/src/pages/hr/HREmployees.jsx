import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiDownload } from 'react-icons/fi';

const HREmployees = () => {
  const { showToast } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);
  
  // Form values
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    jobTitle: '',
    departmentId: '',
    status: 'Active',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchEmployeesData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        api.get('/hr/employees'),
        api.get('/hr/departments')
      ]);
      setEmployees(empRes.data.data);
      setDepartments(deptRes.data.data);
    } catch (err) {
      console.error(err);
      showToast('Could not fetch employee listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setForm({
      name: '',
      email: '',
      password: '',
      employeeId: '',
      jobTitle: '',
      departmentId: '',
      status: 'Active',
    });
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setModalMode('edit');
    setEditingId(emp._id);
    setForm({
      name: emp.user?.name || '',
      email: emp.user?.email || '',
      password: '', // blank password on edits
      employeeId: emp.employeeId,
      jobTitle: emp.jobTitle,
      departmentId: emp.department?._id || '',
      status: emp.user?.status || 'Active',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalMode === 'create' && (!form.name || !form.email || !form.password || !form.employeeId || !form.jobTitle)) {
      showToast('Please specify all required fields', 'error');
      return;
    }
    
    setSubmitLoading(true);
    try {
      if (modalMode === 'create') {
        await api.post('/hr/employees', form);
        showToast('Employee account created successfully!', 'success');
      } else {
        await api.put(`/hr/employees/${editingId}`, form);
        showToast('Employee settings updated!', 'success');
      }
      setShowModal(false);
      fetchEmployeesData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action execution failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (empId) => {
    if (!window.confirm('Are you sure you want to delete this employee profile? This wipes their credentials.')) return;
    try {
      await api.delete(`/hr/employees/${empId}`);
      showToast('Employee deleted successfully', 'success');
      fetchEmployeesData();
    } catch (err) {
      showToast('Deletion failed', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Job Title', 'Department', 'Status'];
    const rows = employees.map(emp => [
      emp.employeeId,
      emp.user?.name || '',
      emp.user?.email || '',
      emp.jobTitle,
      emp.department?.name || 'N/A',
      emp.user?.status || 'Active'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "peka_employees_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEmployees = employees.filter((emp) => {
    const text = `${emp.user?.name} ${emp.user?.email} ${emp.employeeId} ${emp.jobTitle}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  if (loading) {
    return <div className="skeleton" style={{ height: '350px' }}></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Employee Directory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Create, update, and manage employee profiles and company roles.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <FiDownload /> Export CSV
          </button>
          <button onClick={openCreateModal} className="btn btn-primary">
            <FiPlus /> Add Employee
          </button>
        </div>
      </div>

      {/* Directory Filter HUD */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px' }}>
        <FiSearch color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Filter employees by name, title, or ID..."
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

      {/* Grid List Directory Table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        {filteredEmployees.length > 0 ? (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="peka-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Job Title</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id}>
                    <td style={{ fontWeight: 600 }}>{emp.employeeId}</td>
                    <td>{emp.user?.name}</td>
                    <td>{emp.user?.email}</td>
                    <td>{emp.jobTitle}</td>
                    <td>{emp.department?.name || <span style={{ color: 'var(--text-muted)' }}>N/A</span>}</td>
                    <td>
                      <span className={`badge badge-${emp.user?.status === 'Active' ? 'success' : 'danger'}`}>
                        {emp.user?.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => openEditModal(emp)} className="btn btn-text" style={{ padding: '4px', color: 'var(--primary-color)' }}>
                        <FiEdit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(emp._id)} className="btn btn-text" style={{ padding: '4px', color: 'var(--danger-color)' }}>
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
            No employee records match the keyword.
          </div>
        )}
      </div>

      {/* Create / Edit Overlay Modal */}
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
          <div className="card" style={{ width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-family-display)' }}>
              {modalMode === 'create' ? 'Create Employee Profile' : 'Edit Employee Profile'}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
                <div className="input-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP1005"
                    className="input-field"
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  />
                </div>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="input-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Department</label>
                  <select
                    className="input-field"
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="input-group">
                  <label>User Status</label>
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
                  {submitLoading ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HREmployees;
