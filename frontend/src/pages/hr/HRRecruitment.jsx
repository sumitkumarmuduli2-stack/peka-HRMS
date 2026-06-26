import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiBriefcase, FiUserCheck, FiCalendar, FiClock, FiFileText } from 'react-icons/fi';

const HRRecruitment = () => {
  const { showToast } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab state: 'jobs' or 'applications'
  const [activeTab, setActiveTab] = useState('jobs');

  // Job Modal form
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    department: '',
    location: '',
    type: 'Full-time',
    salaryRange: '',
  });
  const [jobLoading, setJobLoading] = useState(false);

  // Interview Scheduler form state
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [schedLoading, setSchedLoading] = useState(false);

  const fetchRecruitmentData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes, deptsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/jobs/applications'),
        api.get('/hr/departments')
      ]);
      setJobs(jobsRes.data.data);
      setApplications(appsRes.data.data);
      setDepartments(deptsRes.data.data);
    } catch (err) {
      console.error(err);
      showToast('Could not load recruitment data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruitmentData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.description || !jobForm.department || !jobForm.location) {
      showToast('Please specify title, description, department, and location', 'error');
      return;
    }

    setJobLoading(true);
    try {
      await api.post('/jobs', jobForm);
      showToast('Job opening posted successfully!', 'success');
      setShowJobModal(false);
      setJobForm({
        title: '',
        description: '',
        requirements: '',
        department: '',
        location: '',
        type: 'Full-time',
        salaryRange: '',
      });
      fetchRecruitmentData();
    } catch (err) {
      showToast('Failed to create job posting', 'error');
    } finally {
      setJobLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await api.put(`/jobs/applications/${appId}`, { status: newStatus });
      showToast(`Candidate stage updated: ${newStatus}`, 'success');
      fetchRecruitmentData();
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!interviewDate) {
      showToast('Please choose interview date', 'error');
      return;
    }

    setSchedLoading(true);
    try {
      await api.put(`/jobs/applications/${selectedApp._id}`, {
        status: 'Interviewed',
        interviewDate: new Date(interviewDate),
      });
      showToast('Interview session scheduled successfully!', 'success');
      setSelectedApp(null);
      fetchRecruitmentData();
    } catch (err) {
      showToast('Failed to schedule interview', 'error');
    } finally {
      setSchedLoading(false);
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: '350px' }}></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Recruitment Hub</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Coordinate jobs listings and manage candidates pipeline stages.</p>
        </div>

        {activeTab === 'jobs' && (
          <button onClick={() => setShowJobModal(true)} className="btn btn-primary">
            <FiPlus /> Post Job Opening
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px' }}>
        <button
          onClick={() => setActiveTab('jobs')}
          style={{
            padding: '12px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'jobs' ? '2px solid var(--primary-color)' : 'none',
            color: activeTab === 'jobs' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'jobs' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          Active Job Posts ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          style={{
            padding: '12px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'applications' ? '2px solid var(--primary-color)' : 'none',
            color: activeTab === 'applications' ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'applications' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          Candidate Applications ({applications.length})
        </button>
      </div>

      {/* Active Tab rendering */}
      {activeTab === 'jobs' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {jobs.map((job) => (
            <div className="card" key={job._id} style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '1.1rem' }}>{job.title}</h4>
                  <span className="badge badge-success">Open</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Dept: {job.department?.name} | Loc: {job.location} | Type: {job.type}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {job.description}
                </p>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                Salary Range: <strong>{job.salaryRange || 'Competitive'}</strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Applications view */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {applications.length > 0 ? (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="peka-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Position Applied</th>
                    <th>Resume Doc</th>
                    <th>Stage</th>
                    <th>Interview Date</th>
                    <th>Update Pipeline</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td style={{ fontWeight: 600 }}>
                        {app.candidateName} <br/>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{app.candidateEmail}</span>
                      </td>
                      <td>{app.job?.title}</td>
                      <td>
                        {app.resume ? (
                          <a href={app.resume} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                            <FiFileText /> View File
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No resume uploaded</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${
                          app.status === 'Offered' ? 'success' : app.status === 'Rejected' ? 'danger' : app.status === 'Interviewed' ? 'info' : 'warning'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        {app.interviewDate ? (
                          <span style={{ fontSize: '0.85rem' }}>
                            {new Date(app.interviewDate).toLocaleDateString()} at {new Date(app.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not scheduled</span>
                        )}
                      </td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        {/* Status updating controls */}
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                          style={{
                            padding: '6px',
                            fontSize: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interviewed">Interviewed</option>
                          <option value="Offered">Offered</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        {/* Interview Scheduler button */}
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
                        >
                          <FiCalendar /> Schedule
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No applications submitted yet.
            </div>
          )}
        </div>
      )}

      {/* Post Job Modal */}
      {showJobModal && (
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
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-family-display)' }}>Create Job Listing</h3>
            <form onSubmit={handleCreateJob}>
              <div className="input-group">
                <label>Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Architect"
                  className="input-field"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Department</label>
                <select
                  required
                  className="input-field"
                  value={jobForm.department}
                  onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                >
                  <option value="">Choose Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="input-group">
                  <label>Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Noida, Remote"
                    className="input-field"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $80k - $100k"
                    className="input-field"
                    value={jobForm.salaryRange}
                    onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Job Description</label>
                <textarea
                  className="input-field"
                  required
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowJobModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={jobLoading} className="btn btn-primary">
                  {jobLoading ? 'Posting...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {selectedApp && (
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
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '14px', fontFamily: 'var(--font-family-display)' }}>Schedule Candidate Interview</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Assign interview date and time for candidate <strong>{selectedApp.candidateName}</strong>.
            </p>

            <form onSubmit={handleScheduleSubmit}>
              <div className="input-group">
                <label>Interview Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="input-field"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedApp(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={schedLoading} className="btn btn-primary">
                  {schedLoading ? 'Scheduling...' : 'Set Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HRRecruitment;
