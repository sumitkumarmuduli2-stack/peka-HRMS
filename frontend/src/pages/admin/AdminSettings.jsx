import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiSettings, FiSave, FiGlobe, FiBriefcase, FiShield,
  FiBell, FiDatabase, FiUsers, FiAlertTriangle,
} from 'react-icons/fi';

const TABS = [
  { id: 'company',     label: 'Company',      icon: <FiBriefcase /> },
  { id: 'system',      label: 'System',       icon: <FiSettings /> },
  { id: 'security',    label: 'Security',     icon: <FiShield /> },
  { id: 'localization',label: 'Localization', icon: <FiGlobe /> },
];

const AdminSettings = () => {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    companyName: '',
    systemEmail: '',
    maintenanceMode: false,
    // Security
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enforceStrongPassword: true,
    twoFactorEnabled: false,
    // Localization
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    currencySymbol: '₹',
    language: 'English',
  });

  const [company, setCompany] = useState({
    name: '',
    domain: '',
    industry: '',
    employeeLimit: 500,
    status: 'Active',
    address: '',
    phone: '',
    website: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const [sRes, cRes] = await Promise.all([
          api.get('/admin/settings'),
          api.get('/admin/company'),
        ]);
        setSettings(prev => ({ ...prev, ...sRes.data.data }));
        setCompany(prev => ({ ...prev, ...cRes.data.data }));
      } catch (err) {
        console.error(err);
        showToast('Could not load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showToast]);

  const handleSave = async () => {
    if (!settings.companyName || !settings.systemEmail) {
      showToast('Company name and system email are required', 'error');
      return;
    }
    setSaving(true);
    try {
      await Promise.all([
        api.put('/admin/settings', settings),
        api.put('/admin/company', { name: settings.companyName, ...company }),
      ]);
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ height: '40px', width: '200px' }} className="skeleton" />
      <div style={{ height: '52px' }} className="skeleton" />
      <div style={{ height: '450px' }} className="skeleton" />
    </div>
  );

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>System Settings</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Configure organizational profile, security, and platform preferences.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ gap: '8px' }}>
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--background-color)', padding: '4px', borderRadius: '12px', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '10px 16px',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              transition: 'all 0.2s',
              background: activeTab === tab.id ? 'var(--card-background)' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card" style={{ maxWidth: '680px' }}>

        {/* ── Company Tab ───────────────────────────── */}
        {activeTab === 'company' && (
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <FiBriefcase style={{ color: 'var(--primary-color)' }} /> Company Profile
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Company Legal Name *</label>
                <input type="text" className="input-field" value={settings.companyName}
                  onChange={e => setSettings({ ...settings, companyName: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Industry</label>
                <input type="text" className="input-field" placeholder="e.g. Technology" value={company.industry}
                  onChange={e => setCompany({ ...company, industry: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Company Domain</label>
                <input type="text" className="input-field" placeholder="e.g. peka.com" value={company.domain}
                  onChange={e => setCompany({ ...company, domain: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Website</label>
                <input type="url" className="input-field" placeholder="https://peka.com" value={company.website || ''}
                  onChange={e => setCompany({ ...company, website: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Phone</label>
                <input type="text" className="input-field" placeholder="+91 XXXXXXXXXX" value={company.phone || ''}
                  onChange={e => setCompany({ ...company, phone: e.target.value })} />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <textarea className="input-field" rows={2} placeholder="Office address" value={company.address || ''}
                  onChange={e => setCompany({ ...company, address: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Max Employee Limit</label>
                <input type="number" min="1" className="input-field" value={company.employeeLimit}
                  onChange={e => setCompany({ ...company, employeeLimit: Number(e.target.value) })} />
              </div>
              <div className="input-group">
                <label>Company Status</label>
                <select className="input-field" value={company.status}
                  onChange={e => setCompany({ ...company, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── System Tab ────────────────────────────── */}
        {activeTab === 'system' && (
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <FiSettings style={{ color: 'var(--primary-color)' }} /> System Configuration
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="input-group">
                <label>System Dispatcher Email *</label>
                <input type="email" className="input-field" value={settings.systemEmail}
                  onChange={e => setSettings({ ...settings, systemEmail: e.target.value })} />
              </div>

              {/* Maintenance Mode Toggle */}
              <div style={{ padding: '18px', background: settings.maintenanceMode ? 'rgba(239,68,68,0.06)' : 'var(--background-color)', borderRadius: '12px', border: `1px solid ${settings.maintenanceMode ? 'rgba(239,68,68,0.25)' : 'var(--border-color)'}`, transition: 'all 0.3s' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--danger-color)', marginTop: '2px', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: settings.maintenanceMode ? 'var(--danger-color)' : 'var(--text-primary)' }}>
                      <FiAlertTriangle size={14} />
                      Enable Maintenance Mode
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.6 }}>
                      Warning: When enabled, only Super Admins can log in. HR and Employee access is blocked.
                    </div>
                  </div>
                </label>
              </div>

              <div style={{ padding: '16px', background: 'var(--background-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '10px', fontSize: '0.9rem' }}>
                  <FiDatabase style={{ color: 'var(--primary-color)' }} /> System Health
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                  {[['Status','● Healthy'],['Uptime','99.98%'],['DB Connection','Connected'],['Version','1.0.0']].map(([k,v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--card-background)', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                      <span style={{ fontWeight: 600, color: v.includes('●') ? 'var(--success-color)' : 'var(--text-primary)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Security Tab ──────────────────────────── */}
        {activeTab === 'security' && (
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <FiShield style={{ color: 'var(--primary-color)' }} /> Security & Access Policy
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Session Timeout (minutes)</label>
                  <input type="number" min="5" max="480" className="input-field"
                    value={settings.sessionTimeout}
                    onChange={e => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })} />
                </div>
                <div className="input-group">
                  <label>Max Login Attempts</label>
                  <input type="number" min="3" max="20" className="input-field"
                    value={settings.maxLoginAttempts}
                    onChange={e => setSettings({ ...settings, maxLoginAttempts: Number(e.target.value) })} />
                </div>
              </div>

              {[
                { key: 'enforceStrongPassword', label: 'Enforce Strong Passwords', desc: 'Require min 8 chars with uppercase, number, and symbol.' },
                { key: 'twoFactorEnabled', label: 'Two-Factor Authentication (2FA)', desc: 'Require OTP verification on login. (Coming soon)' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ padding: '16px 18px', background: 'var(--background-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={e => setSettings({ ...settings, [key]: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', marginTop: '2px', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.6 }}>{desc}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Localization Tab ──────────────────────── */}
        {activeTab === 'localization' && (
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <FiGlobe style={{ color: 'var(--primary-color)' }} /> Localization Preferences
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label>Timezone</label>
                <select className="input-field" value={settings.timezone}
                  onChange={e => setSettings({ ...settings, timezone: e.target.value })}>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Date Format</label>
                <select className="input-field" value={settings.dateFormat}
                  onChange={e => setSettings({ ...settings, dateFormat: e.target.value })}>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div className="input-group">
                <label>Currency</label>
                <select className="input-field" value={settings.currency}
                  onChange={e => setSettings({ ...settings, currency: e.target.value })}>
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="AED">AED — UAE Dirham</option>
                  <option value="SGD">SGD — Singapore Dollar</option>
                </select>
              </div>
              <div className="input-group">
                <label>Currency Symbol</label>
                <input type="text" className="input-field" maxLength={4} value={settings.currencySymbol}
                  onChange={e => setSettings({ ...settings, currencySymbol: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Language</label>
                <select className="input-field" value={settings.language}
                  onChange={e => setSettings({ ...settings, language: e.target.value })}>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Arabic</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminSettings;
