import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PortalLayout from './components/PortalLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import NotificationsPage from './pages/NotificationsPage';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import EmployeeLeaves from './pages/employee/EmployeeLeaves';
import EmployeeTasks from './pages/employee/EmployeeTasks';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeePayslips from './pages/employee/EmployeePayslips';

// HR Pages
import HRDashboard from './pages/hr/HRDashboard';
import HREmployees from './pages/hr/HREmployees';
import HRLeaves from './pages/hr/HRLeaves';
import HRRecruitment from './pages/hr/HRRecruitment';
import HRDepartments from './pages/hr/HRDepartments';
import HRTasks from './pages/hr/HRTasks';
import HRPayroll from './pages/hr/HRPayroll';

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
// RoleRedirect — redirects root "/portal" to appropriate portal
// ────────────────────────────────────────────────────────────────────────────
const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  const roleHome = { 'Super Admin': '/admin', 'HR': '/hr', 'Employee': '/employee' };
  return <Navigate to={roleHome[user.role] || '/employee'} replace />;
};

// Helper: wrap a page in PortalLayout with role protection
const Portal = ({ allowedRoles, children }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <PortalLayout>{children}</PortalLayout>
  </ProtectedRoute>
);

// ────────────────────────────────────────────────────────────────────────────
// App Router
// ────────────────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Public ────────────────────────────────────────────────────────── */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/portal" element={<RoleRedirect />} />

      {/* ── Employee Portal ───────────────────────────────────────────────── */}
      <Route path="/employee"          element={<Portal allowedRoles={['Employee']}><EmployeeDashboard /></Portal>} />
      <Route path="/employee/clock"    element={<Portal allowedRoles={['Employee']}><EmployeeAttendance /></Portal>} />
      <Route path="/employee/leaves"   element={<Portal allowedRoles={['Employee']}><EmployeeLeaves /></Portal>} />
      <Route path="/employee/tasks"    element={<Portal allowedRoles={['Employee']}><EmployeeTasks /></Portal>} />
      <Route path="/employee/profile"  element={<Portal allowedRoles={['Employee']}><EmployeeProfile /></Portal>} />
      <Route path="/employee/payslips" element={<Portal allowedRoles={['Employee']}><EmployeePayslips /></Portal>} />

      {/* ── HR Portal ─────────────────────────────────────────────────────── */}
      <Route path="/hr"               element={<Portal allowedRoles={['HR']}><HRDashboard /></Portal>} />
      <Route path="/hr/employees"     element={<Portal allowedRoles={['HR']}><HREmployees /></Portal>} />
      <Route path="/hr/leaves"        element={<Portal allowedRoles={['HR']}><HRLeaves /></Portal>} />
      <Route path="/hr/recruitment"   element={<Portal allowedRoles={['HR']}><HRRecruitment /></Portal>} />
      <Route path="/hr/departments"   element={<Portal allowedRoles={['HR']}><HRDepartments /></Portal>} />
      <Route path="/hr/tasks"         element={<Portal allowedRoles={['HR']}><HRTasks /></Portal>} />
      <Route path="/hr/payroll"       element={<Portal allowedRoles={['HR']}><HRPayroll /></Portal>} />

      {/* ── Super Admin Portal ────────────────────────────────────────────── */}
      <Route path="/admin"           element={<Portal allowedRoles={['Super Admin']}><AdminDashboard /></Portal>} />
      <Route path="/admin/hrs"       element={<Portal allowedRoles={['Super Admin']}><AdminHRManagement /></Portal>} />
      <Route path="/admin/logs"      element={<Portal allowedRoles={['Super Admin']}><AdminLogs /></Portal>} />
      <Route path="/admin/settings"  element={<Portal allowedRoles={['Super Admin']}><AdminSettings /></Portal>} />

      {/* ── Shared: Notifications (all logged-in roles) ───────────────────── */}
      <Route path="/notifications"   element={<ProtectedRoute allowedRoles={['Employee','HR','Super Admin']}><PortalLayout><NotificationsPage /></PortalLayout></ProtectedRoute>} />

      {/* ── 404 ───────────────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Root: wrap everything in BrowserRouter + AuthProvider
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
