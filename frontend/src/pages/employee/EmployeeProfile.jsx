import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiCamera, FiUploadCloud, FiLock } from 'react-icons/fi';

const EmployeeProfile = () => {
  const { showToast } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Forms states
  const [personalInfo, setPersonalInfo] = useState({ phone: '', address: '', dob: '', gender: '' });
  const [emergencyContact, setEmergencyContact] = useState({ name: '', relationship: '', phone: '' });
  const [skills, setSkills] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employee/profile');
      const data = res.data.data;
      setProfile(data);
      if (data.personalInfo) {
        setPersonalInfo({
          phone: data.personalInfo.phone || '',
          address: data.personalInfo.address || '',
          dob: data.personalInfo.dob ? data.personalInfo.dob.split('T')[0] : '',
          gender: data.personalInfo.gender || '',
        });
      }
      if (data.emergencyContact) {
        setEmergencyContact({
          name: data.emergencyContact.name || '',
          relationship: data.emergencyContact.relationship || '',
          phone: data.emergencyContact.phone || '',
        });
      }
      setSkills(data.skills ? data.skills.join(', ') : '');
    } catch (err) {
      console.error(err);
      showToast('Failed to load profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      await api.put('/employee/profile', {
        personalInfo,
        emergencyContact,
        skills: skillsArray,
      });
      showToast('Profile updated successfully!', 'success');
      fetchProfile();
    } catch (err) {
      showToast('Failed to update profile settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      showToast('Uploading photo...', 'info');
      await api.put('/employee/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Profile photo updated!', 'success');
      fetchProfile();
    } catch (err) {
      showToast(err.response?.data?.message || 'Photo upload failed', 'error');
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    try {
      showToast('Uploading resume document...', 'info');
      await api.put('/employee/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Resume uploaded successfully!', 'success');
      fetchProfile();
    } catch (err) {
      showToast(err.response?.data?.message || 'Resume upload failed', 'error');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showToast('Please specify current and new passwords.', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      // Direct pass modification via Auth endpoint
      await api.put('/auth/resetpassword', {
        email: profile.user.email,
        password: passwordForm.newPassword,
      });
      showToast('Password updated successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      showToast('Failed to reset password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: '400px' }}></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>My Profile</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Control your personal documents, contacts, and account credentials.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Card: Profile Avatar, ID Card Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Avatar Details */}
          <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: 'var(--background-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '2px solid var(--border-color)'
              }}>
                {profile?.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FiUser size={50} color="var(--text-muted)" />
                )}
              </div>
              <label style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'var(--primary-color)',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)'
              }}>
                <FiCamera size={16} />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              </label>
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{profile?.user?.name}</h3>
            <span className="badge badge-success" style={{ marginBottom: '12px' }}>{profile?.jobTitle}</span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {profile?.employeeId}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Joined: {new Date(profile?.dateOfJoining).toLocaleDateString()}</div>
          </div>

          {/* Files Upload Card */}
          <div className="card">
            <h4 style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUploadCloud /> Documents Hub
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Upload your updated CV/Resume for record keeping.
              </div>
              {profile?.resume && (
                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--accent-color)',
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}
                >
                  View Current Resume File
                </a>
              )}
              <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'block', textAlign: 'center' }}>
                Upload Resume
                <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />
              </label>
            </div>
          </div>

        </div>

        {/* Right Form Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Settings Fields */}
          <div className="card">
            <h4 style={{ marginBottom: '20px' }}>Personal Profile Configuration</h4>
            <form onSubmit={handleProfileSave}>
              
              <h5 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '14px' }}>
                1. Personal Details
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    className="input-field"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Gender Selection</label>
                  <select
                    className="input-field"
                    value={personalInfo.gender}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    className="input-field"
                    value={personalInfo.dob}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Residential Address</label>
                  <input
                    type="text"
                    className="input-field"
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                  />
                </div>
              </div>

              <h5 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '14px', marginTop: '10px' }}>
                2. Emergency Contacts
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Contact Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={emergencyContact.name}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Relationship</label>
                  <input
                    type="text"
                    className="input-field"
                    value={emergencyContact.relationship}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="input-field"
                    value={emergencyContact.phone}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                  />
                </div>
              </div>

              <h5 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '14px', marginTop: '10px' }}>
                3. Technical Skills
              </h5>
              <div className="input-group">
                <label>Skills (comma separated list)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. React, Node.js, Mongoose"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <button type="submit" disabled={saving} className="btn btn-primary" style={{ float: 'right' }}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="card">
            <h4 style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiLock /> Credentials Update
            </h4>
            <form onSubmit={handlePasswordUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'flex-end' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Current Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>New Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>
              <button type="submit" disabled={passwordLoading} className="btn btn-secondary">
                {passwordLoading ? 'Resetting...' : 'Change Password'}
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default EmployeeProfile;
