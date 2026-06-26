import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiCalendar, FiPlusCircle } from 'react-icons/fi';

const EmployeeLeaves = () => {
  const { showToast } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({ sick: 0, casual: 0, annual: 0 });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ leaveType: 'Sick', startDate: '', endDate: '', reason: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchLeavesData = async () => {
    try {
      setLoading(true);
      const [leavesRes, balanceRes] = await Promise.all([
        api.get('/leaves/my-leaves'),
        api.get('/leaves/balance')
      ]);
      setLeaves(leavesRes.data.data);
      setBalance(balanceRes.data.balance);
    } catch (err) {
      console.error(err);
      showToast('Failed to load leaves records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeavesData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason) {
      showToast('Please fill out all fields', 'error');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/leaves/apply', form);
      showToast('Leave request submitted successfully!', 'success');
      setForm({ leaveType: 'Sick', startDate: '', endDate: '', reason: '' });
      fetchLeavesData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit leave', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: '400px' }}></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Leave Management</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Track your leave balances and file applications.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left: Apply Form & Balances */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Leave Balances Widget */}
          <div className="card">
            <h4 style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCalendar /> Leave Balances
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
              <div style={{ background: '#f8fafc', padding: '12px 6px', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{balance.sick}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Sick</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 6px', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{balance.casual}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Casual</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 6px', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{balance.annual}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Annual</div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="card">
            <h4 style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiPlusCircle /> Apply for Leave
            </h4>
            <form onSubmit={handleApply}>
              <div className="input-group">
                <label>Leave Type</label>
                <select
                  className="input-field"
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                >
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Annual">Annual Leave</option>
                </select>
              </div>

              <div className="input-group">
                <label>Start Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>End Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Reason for Leave</label>
                <textarea
                  className="input-field"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Explain brief reason..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>

              <button type="submit" disabled={submitLoading} className="btn btn-primary" style={{ width: '100%' }}>
                {submitLoading ? 'Submitting...' : 'Apply Leave'}
              </button>
            </form>
          </div>

        </div>

        {/* Right: Leaves Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <h4 style={{ marginBottom: '20px' }}>Leave Request History</h4>
          {leaves.length > 0 ? (
            <div className="table-container">
              <table className="peka-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td style={{ fontWeight: 600 }}>{leave.leaveType}</td>
                      <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${
                          leave.status === 'Approved' ? 'success' : leave.status === 'Rejected' ? 'danger' : 'warning'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {leave.hrComments || leave.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No leave history records found.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default EmployeeLeaves;
