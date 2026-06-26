import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiArrowLeft, FiChrome } from 'react-icons/fi';
import { FaWindows } from 'react-icons/fa';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, showToast } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill out all fields', 'error');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      // Role-based routing
      if (result.user.role === 'Super Admin') {
        navigate('/admin');
      } else if (result.user.role === 'HR') {
        navigate('/hr');
      } else {
        navigate('/employee');
      }
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    showToast('Reset password link sent (Simulated)', 'success');
    setIsForgotMode(false);
  };

  const handleOAuthLogin = (provider) => {
    showToast(`OAuth with ${provider} is disabled in dev mode. Please use email credentials.`, 'info');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', width: '100%' }}>
      
      {/* Left Panel: Visual Brand Image/Overlay */}
      <div style={{
        position: 'relative',
        background: 'var(--gradient-primary)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 8%',
      }}>
        {/* Background Gradients/Shapes to simulate immersion */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(58, 34, 128, 0.4) 0%, rgba(0, 0, 0, 0.3) 100%)',
          zIndex: 1
        }}></div>

        <div 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2 }}
        >
          <div style={{
            background: '#ffffff',
            color: 'var(--primary-color)',
            fontWeight: 'bold',
            padding: '6px 12px',
            borderRadius: '10px',
            fontFamily: 'var(--font-family-display)'
          }}>PEKA</div>
          <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#ffffff', fontFamily: 'var(--font-family-display)' }}>HRMS</span>
        </div>

        <div style={{ zIndex: 2 }}>
          <h2 style={{ color: '#ffffff', fontSize: '2.5rem', marginBottom: '20px', fontFamily: 'var(--font-family-display)', fontWeight: 800, lineHeight: 1.2 }}>
            Centralized Platform for Modern HR Operations.
          </h2>
          <p style={{ color: '#d1d5db', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '460px' }}>
            Access employee profiles, clock attendance timesheets, manage custom leave balances, and review organizational telemetry metrics with enterprise security.
          </p>
        </div>

        <div style={{ zIndex: 2, fontSize: '0.85rem', color: '#9ca3af' }}>
          © {new Date().getFullYear()} PEKA HRMS. Trusted by 500+ enterprises.
        </div>
      </div>

      {/* Right Panel: Clean White Auth Panel */}
      <div style={{
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-text" 
            style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}
          >
            <FiArrowLeft /> Back to Home
          </button>

          {!isForgotMode ? (
            <>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--primary-color)', fontFamily: 'var(--font-family-display)' }}>
                Sign In
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                Welcome back! Please enter your details below.
              </p>

              {/* OAuth buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <button onClick={() => handleOAuthLogin('Google')} className="btn" style={{ border: '1px solid var(--border-color)', backgroundColor: '#ffffff', borderRadius: '12px', padding: '10px' }}>
                  <FiChrome style={{ color: '#db4437' }} /> Google
                </button>
                <button onClick={() => handleOAuthLogin('Microsoft')} className="btn" style={{ border: '1px solid var(--border-color)', backgroundColor: '#ffffff', borderRadius: '12px', padding: '10px' }}>
                  <FaWindows style={{ color: '#0078d4' }} /> Microsoft
                </button>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                <span>or continue with email</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
              </div>

              {/* Credentials list helper for demo ease */}
              <div style={{ backgroundColor: 'rgba(50, 27, 114, 0.05)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                <strong>Demo Logins:</strong><br/>
                • Admin: <code>admin@peka.com</code> / <code>adminpassword123</code><br/>
                • HR: <code>hr@peka.com</code> / <code>hrpassword123</code><br/>
                • Employee: <code>employee@peka.com</code> / <code>employeepassword123</code>
              </div>

              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <FiMail style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      className="input-field"
                      style={{ paddingLeft: '40px' }}
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <FiLock style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      className="input-field"
                      style={{ paddingLeft: '40px' }}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '0.85rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: 'var(--primary-color)' }}
                    />
                    Remember Me
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); setIsForgotMode(true); }} style={{ color: 'var(--accent-color)', fontWeight: 500 }}>
                    Forgot Password?
                  </a>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px' }}>
                  {loading ? 'Logging in...' : 'Sign In'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--primary-color)', fontFamily: 'var(--font-family-display)' }}>
                Forgot Password
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                No worries! Enter your email and we will send a password reset link.
              </p>

              <form onSubmit={handleForgotPassword}>
                <div className="input-group">
                  <label>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <FiMail style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      className="input-field"
                      style={{ paddingLeft: '40px' }}
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginBottom: '14px' }}>
                  Send Reset Link
                </button>

                <button type="button" onClick={() => setIsForgotMode(false)} className="btn btn-secondary" style={{ width: '100%', padding: '12px' }}>
                  Cancel
                </button>
              </form>
            </>
          )}

        </div>
      </div>

    </div>
  );
};

export default LoginPage;
