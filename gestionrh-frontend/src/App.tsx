import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './features/auth/components/LoginForm';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DepartmentsPage } from './features/departments/components/DepartmentsPage';
import { JobsPage } from './features/jobs/components/JobsPage';
import { EmployeesPage } from './features/employees/components/EmployeesPage';
import { AffectationHistoryPage } from './features/history/components/AffectationHistoryPage';
import { LeavesPage } from './features/leaves/components/LeavesPage';
import { LeaveApprovalPage } from './features/leaves/components/LeaveApprovalPage';
import { LeaveTypesConfigPage } from './features/leaves/components/LeaveTypesConfigPage';
import { ProfilePage } from './features/auth/components/ProfilePage';
import { UnauthorizedPage } from './components/common/UnauthorizedPage';
import { DashboardHomePage } from './features/leaves/components/DashboardHomePage';
import { useAppSelector, useAppDispatch } from './store/hooks';

import { checkAuth } from './features/auth/authSlice';

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

          {/* Admin Only Routes */}
          <Route path="leaves/config" element={
            <ProtectedRoute requiredRoles={['ADMIN']}><LeaveTypesConfigPage /></ProtectedRoute>
          } />

          {/* Generic Routes */}
          <Route path="leaves" element={<LeavesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
