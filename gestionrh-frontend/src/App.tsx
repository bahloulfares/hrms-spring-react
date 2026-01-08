import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { UnauthorizedPage } from './components/common/UnauthorizedPage';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { checkAuth } from './features/auth/authSlice';

const LoginForm = lazy(() => import('./features/auth/components/LoginForm').then(m => ({ default: m.LoginForm })));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const DepartmentsPage = lazy(() => import('./features/departments/components/DepartmentsPage').then(m => ({ default: m.DepartmentsPage })));
const JobsPage = lazy(() => import('./features/jobs/components/JobsPage').then(m => ({ default: m.JobsPage })));
const EmployeesPage = lazy(() => import('./features/employees/components/EmployeesPage').then(m => ({ default: m.EmployeesPage })));
const AffectationHistoryPage = lazy(() => import('./features/history/components/AffectationHistoryPage').then(m => ({ default: m.AffectationHistoryPage })));
const LeavesPage = lazy(() => import('./features/leaves/components/LeavesPage').then(m => ({ default: m.LeavesPage })));
const LeaveApprovalPage = lazy(() => import('./features/leaves/components/LeaveApprovalPage').then(m => ({ default: m.LeaveApprovalPage })));
const LeaveTypesConfigPage = lazy(() => import('./features/leaves/components/LeaveTypesConfigPage').then(m => ({ default: m.LeaveTypesConfigPage })));
const ProfilePage = lazy(() => import('./features/auth/components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const DashboardHomePage = lazy(() => import('./features/leaves/components/DashboardHomePage').then(m => ({ default: m.DashboardHomePage })));
const LeaveStatsPage = lazy(() => import('./features/leaves/components/LeaveStatsPage').then(m => ({ default: m.LeaveStatsPage })));
const SettingsPage = lazy(() => import('./features/settings/components/SettingsPage'));

// Enhanced Protected Route Component with Role Support
const ProtectedRoute = ({ children, requiredRoles }: { children: React.ReactNode, requiredRoles?: string[] }) => {
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check roles if required
  if (requiredRoles && user) {
    const hasRequiredRole = user.roles.some(role => requiredRoles.includes(role));
    if (!hasRequiredRole) {
      return <UnauthorizedPage />;
    }
  }

  return <>{children}</>;
};

function App() {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1e293b',
            padding: '12px 16px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<LoginForm />} />

          {/* Base Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHomePage />} />

            {/* Admin & RH Routes */}
            <Route path="departments" element={
              <ProtectedRoute requiredRoles={['ADMIN', 'RH']}><DepartmentsPage /></ProtectedRoute>
            } />
            <Route path="jobs" element={
              <ProtectedRoute requiredRoles={['ADMIN', 'RH']}><JobsPage /></ProtectedRoute>
            } />
            <Route path="employees" element={
              <ProtectedRoute requiredRoles={['ADMIN', 'RH']}><EmployeesPage /></ProtectedRoute>
            } />
            <Route path="history" element={
              <ProtectedRoute requiredRoles={['ADMIN', 'RH']}><AffectationHistoryPage /></ProtectedRoute>
            } />

            {/* Manager / RH / Admin Routes */}
            <Route path="leaves/approvals" element={
              <ProtectedRoute requiredRoles={['ADMIN', 'RH', 'MANAGER']}><LeaveApprovalPage /></ProtectedRoute>
            } />

            <Route path="leaves/stats" element={
              <ProtectedRoute requiredRoles={['ADMIN', 'RH', 'MANAGER']}><LeaveStatsPage /></ProtectedRoute>
            } />

            {/* Admin Only Routes */}
            <Route path="leaves/config" element={
              <ProtectedRoute requiredRoles={['ADMIN']}><LeaveTypesConfigPage /></ProtectedRoute>
            } />

            {/* Generic Routes */}
            <Route path="leaves" element={<LeavesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
