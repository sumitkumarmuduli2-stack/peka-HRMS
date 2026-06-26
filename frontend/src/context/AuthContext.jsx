import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Setup toast notification helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.token);
      setUser(res.data.user);
      showToast('Logged in successfully!', 'success');
      return { success: true, user: res.data.user };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logoutUser = async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      showToast('Logged out successfully', 'success');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginUser,
        logout: logoutUser,
        fetchMe,
        showToast,
        setUser
      }}
    >
      {children}

      {/* Toast Notification HUD */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div>
              <span style={{ fontWeight: 'bold', display: 'block', textTransform: 'capitalize' }}>
                {toast.type === 'error' ? 'Error' : toast.type}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {toast.message}
              </span>
            </div>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
