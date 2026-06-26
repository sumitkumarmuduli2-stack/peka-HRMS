import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiCheck, FiX, FiCalendar, FiMessageSquare } from 'react-icons/fi';

const HRLeaves = () => {
  const { showToast } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // Comments modal state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [comments, setComments] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/leaves');
      setLeaves(res.data.data);
    } catch (err) {
      console.error(err);
      showToast('Could not fetch leave applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleActionClick = (leave, type) => {
    setSelectedLeave({ ...leave, actionType: type });
    setComments('');
  };

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setSubmitLoading(true);
    try {
      await api.put(`/hr/leaves/${selectedLeave._id}`, {
        status: selectedLeave.actionType,
        hrComments: comments,
      });
      showToast(`Leave request ${selectedLeave.actionType.toLowerCase()} successfully`, 'success');
      setSelectedLeave(null);
      fetchLeaves();
    } catch (err) {
      showToast('Action failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (filter === 'All') return true;
    return leave.status === filter;
  });

  if (loading) {
    return <div className="skeleton" style={{ height: '350px' }}></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Leave Approvals</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Verify and process leave applications filed by employees.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
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

      {/* Leave List Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredLeaves.length > 0 ? (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="peka-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td style={{ fontWeight: 600 }}>{leave.employee?.name}</td>
                    <td>{leave.leaveType}</td>
                    <td>
                      {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {leave.reason}
                    </td>
                    <td>
                      <span className={`badge badge-${
                        leave.status === 'Approved' ? 'success' : leave.status === 'Rejected' ? 'danger' : 'warning'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleActionClick(leave, 'Approved')}
                            className="btn btn-primary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
                          >
                            <FiCheck /> Approve
                          </button>
                          <button
                            onClick={() => handleActionClick(leave, 'Rejected')}
                            className="btn btn-danger"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
                          >
                            <FiX /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Processed ({leave.hrComments || 'No Remarks'})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No leave logs found.
          </div>
        )}
      </div>

      {/* Action comments overlay Modal */}
      {selectedLeave && (
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
            <h3 style={{ marginBottom: '14px', fontFamily: 'var(--font-family-display)' }}>
              Confirm {selectedLeave.actionType} Leave
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Confirming leave approval/rejection for <strong>{selectedLeave.employee?.name}</strong> ({selectedLeave.leaveType}).
            </p>

            <form onSubmit={handleProcessSubmit}>
              <div className="input-group">
                <label>HR Remarks & Comments</label>
                <textarea
                  className="input-field"
                  style={{ minHeight: '80px', resize: 'none' }}
                  placeholder="e.g. Leave is approved based on shift handovers."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedLeave(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading} className="btn btn-primary">
                  {submitLoading ? 'Saving...' : `Yes, ${selectedLeave.actionType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HRLeaves;
