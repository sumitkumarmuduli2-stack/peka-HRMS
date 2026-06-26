import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiSettings, FiSave } from 'react-icons/fi';

const AdminSettings = () => {
  const { showToast } = useAuth();
  const [settings, setSettings] = useState({ companyName: '', systemEmail: '', maintenanceMode: false });
  const [company, setCompany] = useState({ domain: '', industry: '', employeeLimit: 500, status: 'Active' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [settingsRes, companyRes] = await Promise.all([
        api.get('/admin/settings'),
        api.get('/admin/company'),
      ]);
      setSettings(settingsRes.data.data);
      setCompany(companyRes.data.data);
    } catch (err) {
      console.error(err);
      showToast('Could not fetch settings configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!settings.companyName || !settings.systemEmail) {
      showToast('Please specify company name and system email', 'error');
      return;
    }

    setSaving(true);
    try {
      await Promise.all([
        api.put('/admin/settings', settings),
        api.put('/admin/company', {
          name: settings.companyName,
          domain: company.domain,
          industry: company.industry,
          employeeLimit: company.employeeLimit,
          status: company.status,
        }),
      ]);
      showToast('Global settings updated successfully!', 'success');
      fetchSettings();
    } catch (err) {
      showToast('Failed to save settings configurations', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: '300px' }}></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>System Configurations</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Configure organizational branding details, mailing settings, and maintenance toggles.</p>
      </div>

      {/* Settings Grid */}
      <div style={{ maxWidth: '600px' }}>
        <div className="card">
          <h4 style={{ marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiSettings /> Tenant Branding Options
          </h4>

          <form onSubmit={handleSave}>
            <div className="input-group">
              <label>Company Legal Name</label>
              <input
                type="text"
                required
                className="input-field"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>System Dispatcher Email</label>
              <input
                type="email"
                required
                className="input-field"
                value={settings.systemEmail}
                onChange={(e) => setSettings({ ...settings, systemEmail: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Company Domain</label>
              <input
                type="text"
                className="input-field"
                value={company.domain || ''}
                onChange={(e) => setCompany({ ...company, domain: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Industry</label>
              <input
                type="text"
                className="input-field"
                value={company.industry || ''}
                onChange={(e) => setCompany({ ...company, industry: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Employee Limit</label>
              <input
                type="number"
                min="1"
                className="input-field"
                value={company.employeeLimit || 1}
                onChange={(e) => setCompany({ ...company, employeeLimit: Number(e.target.value) })}
              />
            </div>

            <div className="input-group" style={{ margin: '24px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                />
                <div>
                  <strong>Enable System Maintenance Mode</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Warning: Activating this prevents HR and Employees from logging in.
                  </div>
                </div>
              </label>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', gap: '8px' }}>
              <FiSave /> {saving ? 'Saving Configurations...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default AdminSettings;
