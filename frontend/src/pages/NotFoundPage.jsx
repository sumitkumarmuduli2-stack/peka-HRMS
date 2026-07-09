import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const homeRoute = user
    ? { 'Super Admin': '/admin', HR: '/hr', Employee: '/employee' }[user.role] || '/'
    : '/';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '0',
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'var(--font-family-body)',
    }}>

      {/* Animated 404 */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <div style={{
          fontSize: 'clamp(80px, 18vw, 180px)',
          fontFamily: 'var(--font-family-display)',
          fontWeight: 900,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
          userSelect: 'none',
          animation: 'pageEnter 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        }}>
          404
        </div>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: 'var(--gradient-primary)',
          opacity: 0.06,
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: -1,
        }} />
      </div>

      {/* PEKA Logo mark */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px',
        padding: '8px 18px',
        borderRadius: '999px',
        background: 'rgba(37,20,90,0.07)',
        border: '1px solid rgba(37,20,90,0.12)',
      }}>
        <div style={{
          width: '24px', height: '24px', borderRadius: '6px',
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 900 }}>P</span>
        </div>
        <span style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-color)' }}>
          PEKA HRMS
        </span>
      </div>

      <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontFamily: 'var(--font-family-display)', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 800 }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.7, marginBottom: '36px' }}>
        The page you're looking for doesn't exist or you don't have permission to access it.
      </p>

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ gap: '8px', padding: '12px 24px' }}
        >
          <FiArrowLeft /> Go Back
        </button>
        <button
          onClick={() => navigate(homeRoute)}
          className="btn btn-primary"
          style={{ gap: '8px', padding: '12px 24px' }}
        >
          <FiHome /> Go to Dashboard
        </button>
      </div>

      {/* Grid decoration */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(37,20,90,0.06) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
        zIndex: -1,
      }} />
    </div>
  );
};

export default NotFoundPage;
