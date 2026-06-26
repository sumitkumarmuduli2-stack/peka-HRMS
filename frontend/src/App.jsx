import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PortalLayout from './components/PortalLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import EmployeeLeaves from './pages/employee/EmployeeLeaves';
import EmployeeTasks from './pages/employee/EmployeeTasks';
import EmployeeProfile from './pages/employee/EmployeeProfile';

// HR Pages
import HRDashboard from './pages/hr/HRDashboard';
import HREmployees from './pages/hr/HREmployees';
import HRLeaves from './pages/hr/HRLeaves';
import HRRecruitment from './pages/hr/HRRecruitment';
import HRDepartments from './pages/hr/HRDepartments';
import HRTasks from './pages/hr/HRTasks';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHRManagement from './pages/admin/AdminHRManagement';
import AdminLogs from './pages/admin/AdminLogs';
import AdminSettings from './pages/admin/AdminSettings';

// ────────────────────────────────────────────────────────────────────────────
// ProtectedRoute — guards a route based on auth state and required role(s)
// ────────────────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        background: 'var(--background-color)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '4px solid var(--border-color)',
          borderTopColor: 'var(--primary-color)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading PEKA HRMS…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the user's own portal home if they try to access a different portal
    const roleHome = {
      'Super Admin': '/admin',
      'HR': '/hr',
      'Employee': '/employee',
    };
    return <Navigate to={roleHome[user.role] || '/login'} replace />;
  }

  return children;
};

// ────────────────────────────────────────────────────────────────────────────
// PublicRoute — redirects authenticated users to their portal
// ────────────────────────────────────────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    const roleHome = {
      'Super Admin': '/admin',
      'HR': '/hr',
      'Employee': '/employee',
    };
    return <Navigate to={roleHome[user.role] || '/employee'} replace />;
  }

  return children;
};

// ────────────────────────────────────────────────────────────────────────────
// RoleRedirect — redirects root "/" to appropriate portal or login
// ────────────────────────────────────────────────────────────────────────────
const RoleRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/" replace />;

  const roleHome = {
    'Super Admin': '/admin',
    'HR': '/hr',
    'Employee': '/employee',
  };
  return <Navigate to={roleHome[user.role] || '/employee'} replace />;
};

// ────────────────────────────────────────────────────────────────────────────
// App Router
// ────────────────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public / Landing */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Portal redirect after login */}
      <Route path="/portal" element={<RoleRedirect />} />

      {/* ── Employee Portal ─────────────────────────────────────────────── */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={['Employee']}>
            <PortalLayout>
              <EmployeeDashboard />
            </PortalLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/clock"
        element={
          <ProtectedRoute allowedRoles={['Employee']}>
            <PortalLayout>
              <EmployeeAttendance />
            </PortalLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/leaves"
        element={
          <ProtectedRoute allowedRoles={['Employee']}>
            <PortalLayout>
              <EmployeeLeaves />
            </PortalLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/tasks"
        element={
          <ProtectedRoute allowedRoles={['Employee']}>
            <PortalLayout>
              <EmployeeTasks />
            </PortalLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute allowedRoles={['Employee']}>
            <PortalLayout>
              <EmployeeProfile />
            </PortalLayout>
          </ProtectedRoute>
        }
      />

      {/* ── HR Portal ───────────────────────────────────────────────────── */}
      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <PortalLayout>
              <HRDashboard />
            </PortalLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/employees"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <PortalLayout>
              <HREmployees />
            </PortalLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/leaves"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <PortalLayout>
              <HRLeaves />
            </PortalLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/recruitment"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <PortalLayout>
              <HRRecruitment />
            </PortalLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/departments"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <PortalLayout>
              <HRDepartments />
            </PortalLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/tasks"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <PortalLayout>
              <HRTasks />
            </PortalLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Super Admin Portal ──────────────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Super Admin']}>
            <PortalLayout>
              <AdminDashboard />
            </PortalLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/hrs"
        element={
          <ProtectedRoute allowedRoles={['Super Admin']}>
            <PortalLayout>
              <AdminHRManagement />
            </PortalLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <ProtectedRoute allowedRoles={['Super Admin']}>
            <PortalLayout>
              <AdminLogs />
            </PortalLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['Super Admin']}>
            <PortalLayout>
              <AdminSettings />
            </PortalLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Catch-all 404 ───────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Root: wrap everything in BrowserRouter + AuthProvider
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
