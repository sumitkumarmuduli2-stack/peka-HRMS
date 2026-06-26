import React, { useEffect, useState } from 'react';
import { FiFileText, FiUploadCloud, FiTrash2, FiExternalLink } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DocumentsPage = () => {
  const { user, showToast } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General',
    visibleTo: ['Employee', 'HR', 'Super Admin'],
    document: null,
  });

  const canManage = ['HR', 'Super Admin'].includes(user?.role);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents');
      setDocuments(res.data.data || []);
    } catch (error) {
      showToast('Could not load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const toggleRole = (role) => {
    setForm((prev) => ({
      ...prev,
      visibleTo: prev.visibleTo.includes(role)
        ? prev.visibleTo.filter((item) => item !== role)
        : [...prev.visibleTo, role],
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title || !form.document) {
      showToast('Please add a title and select a document', 'error');
      return;
    }

    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('description', form.description);
    payload.append('category', form.category);
    payload.append('visibleTo', form.visibleTo.join(','));
    payload.append('document', form.document);

    setSaving(true);
    try {
      await api.post('/documents', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Document uploaded successfully', 'success');
      setForm({
        title: '',
        description: '',
        category: 'General',
        visibleTo: ['Employee', 'HR', 'Super Admin'],
        document: null,
      });
      e.target.reset();
      fetchDocuments();
    } catch (error) {
      showToast(error.response?.data?.message || 'Document upload failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await api.delete(`/documents/${documentId}`);
      showToast('Document deleted', 'success');
      fetchDocuments();
    } catch (error) {
      showToast('Could not delete document', 'error');
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: '320px' }} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Document Management</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Access policies, compliance records, offer letters, and shared HR files.
        </p>
      </div>

      {canManage && (
        <div className="card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <FiUploadCloud /> Upload Document
          </h4>
          <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div className="input-group">
              <label>Document Title</label>
              <input
                className="input-field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="General">General</option>
                <option value="Policy">Policy</option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Resume">Resume</option>
                <option value="Compliance">Compliance</option>
              </select>
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea
                className="input-field"
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Visible To</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {['Employee', 'HR', 'Super Admin'].map((role) => (
                  <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={form.visibleTo.includes(role)}
                      onChange={() => toggleRole(role)}
                      style={{ accentColor: 'var(--primary-color)' }}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label>File</label>
              <input
                type="file"
                className="input-field"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={(e) => setForm({ ...form, document: e.target.files[0] })}
              />
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ gridColumn: '1 / -1', gap: '8px' }}>
              <FiUploadCloud /> {saving ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFileText style={{ color: 'var(--primary-color)' }} />
          <h4>Shared Documents</h4>
        </div>

        {documents.length > 0 ? (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="peka-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Uploaded By</th>
                  <th>Access</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{doc.title}</div>
                      {doc.description && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{doc.description}</div>
                      )}
                    </td>
                    <td><span className="badge badge-info">{doc.category}</span></td>
                    <td>{doc.uploadedBy?.name || 'System'}</td>
                    <td>{doc.visibleTo?.join(', ')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '8px 10px' }}>
                          <FiExternalLink />
                        </a>
                        {canManage && (
                          <button onClick={() => handleDelete(doc._id)} className="btn btn-danger" style={{ padding: '8px 10px' }}>
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <FiFileText size={40} />
            <p>No shared documents are available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
